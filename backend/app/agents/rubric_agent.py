import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.schemas.interview import AnswerEvaluation
from app.agents.interviewer_agent import InterviewerAgentResponse
from app.agents.challenger_agent import ChallengerAgentResponse
from app.agents.fact_checker_agent import FactCheckerAgentResponse
from app.services.evaluation_service import evaluation_service

logger = logging.getLogger("master_ai.agents.rubric")


class RubricScores(BaseModel):
    correctness: float = Field(..., ge=0, le=100)
    completeness: float = Field(..., ge=0, le=100)
    reasoning: float = Field(..., ge=0, le=100)
    relevance: float = Field(..., ge=0, le=100)
    clarity: float = Field(..., ge=0, le=100)
    overall: float = Field(..., ge=0, le=100)


class RubricAgentResponse(BaseModel):
    scores: RubricScores
    evaluation: AnswerEvaluation
    strengths: List[str]
    improvements: List[str]
    fact_check_summary: List[str] = Field(default_factory=list)
    challenge_summary: List[str] = Field(default_factory=list)


class RubricAgent:
    """
    Rubric Synthesizer Agent: Combines inputs from Interviewer, Challenger, Fact Checker,
    and Multimodal telemetry to calculate objective, multi-dimensional rubric scores.
    
    IMPORTANT SCORING PRINCIPLE:
    Technical correctness is evaluated independently from physical presentation signals.
    Poor posture or low eye engagement NEVER reduces factual/technical knowledge scores.
    """

    def synthesize_evaluation(
        self,
        user_answer: str,
        interviewer_res: InterviewerAgentResponse,
        challenger_res: ChallengerAgentResponse,
        factcheck_res: FactCheckerAgentResponse,
        vision_summary: Optional[Dict[str, Any]] = None,
        voice_summary: Optional[Dict[str, Any]] = None,
        duration_seconds: float = 0.0,
    ) -> RubricAgentResponse:
        # Base evaluation using evaluation_service
        base_eval = evaluation_service.evaluate_answer(
            user_answer=user_answer,
            expected_concepts=interviewer_res.detected_concepts + interviewer_res.missed_concepts,
            duration_seconds=duration_seconds,
        )

        correctness = base_eval.correctness
        completeness = base_eval.completeness
        reasoning = base_eval.reasoning
        relevance = base_eval.relevance
        clarity = base_eval.clarity

        strengths = list(base_eval.strengths)
        improvements = list(base_eval.improvements)
        fact_summary: List[str] = []
        challenge_summary: List[str] = []

        # 1. Fact-check evidence modulation on Technical Correctness
        if factcheck_res.has_supported_claims:
            correctness = min(100.0, correctness + 5.0)
            strengths.append("Demonstrated verifiable technical accuracy with supported documentation references.")
            fact_summary.append("Validated against vendor documentation.")

        if factcheck_res.has_unsupported_claims:
            correctness = max(20.0, correctness - 15.0)
            improvements.append("Technical claim conflicted with established documentation/standards.")
            fact_summary.append("Contains unsupported technical claim.")

        # 2. Challenger Contradiction modulation on Reasoning
        if challenger_res.contradiction.contradiction_detected:
            reasoning = max(30.0, reasoning - 12.0)
            improvements.append("Inconsistency detected with prior architectural statement.")
            challenge_summary.append("Contradiction identified between turns.")

        # 3. Overall Weighted Score Calculation (Knowledge & Communication dimensions)
        overall = round(
            correctness * 0.30
            + completeness * 0.25
            + reasoning * 0.25
            + relevance * 0.10
            + clarity * 0.10,
            1,
        )

        scores = RubricScores(
            correctness=correctness,
            completeness=completeness,
            reasoning=reasoning,
            relevance=relevance,
            clarity=clarity,
            overall=overall,
        )

        final_evaluation = AnswerEvaluation(
            correctness=correctness,
            completeness=completeness,
            reasoning=reasoning,
            relevance=relevance,
            clarity=clarity,
            overall=overall,
            strengths=strengths,
            improvements=improvements,
            detected_concepts=interviewer_res.detected_concepts,
            missed_concepts=interviewer_res.missed_concepts,
            detected_filler_words=base_eval.detected_filler_words,
        )

        return RubricAgentResponse(
            scores=scores,
            evaluation=final_evaluation,
            strengths=strengths,
            improvements=improvements,
            fact_check_summary=fact_summary,
            challenge_summary=challenge_summary,
        )


rubric_agent = RubricAgent()
