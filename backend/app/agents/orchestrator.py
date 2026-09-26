import logging
from typing import Dict, Any, List, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.models.session import SessionState, QuestionModel, ConversationTurn
from app.schemas.interview import AnswerEvaluation
from app.agents.interviewer_agent import interviewer_agent, InterviewerAgentResponse
from app.agents.challenger_agent import challenger_agent, ChallengerAgentResponse
from app.agents.fact_checker_agent import fact_checker_agent, FactCheckerAgentResponse
from app.agents.rubric_agent import rubric_agent, RubricAgentResponse
from app.factcheck.provider import FactCheckResult
from app.rag.rag_pipeline import rag_pipeline
from app.db.database import SessionLocal
from app.db.models import InterviewSessionModel, TurnRecordModel, SkillMasteryModel, CandidateProfileModel

logger = logging.getLogger("master_ai.agents.orchestrator")

AgentName = Literal["INTERVIEWER", "CHALLENGER", "FACT_CHECKER", "RUBRIC", "ORCHESTRATOR", "DEBATE"]


class AgentEvent(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent: AgentName
    event: str
    severity: Literal["info", "warning", "critical"] = "info"
    details: Optional[Dict[str, Any]] = None


class OrchestratedTurnResult(BaseModel):
    session_id: str
    question_id: str
    evaluation: AnswerEvaluation
    next_action: str
    reason_summary: str
    next_question_id: str
    next_question_number: int
    next_question: str
    difficulty: str
    topic: str
    fact_check_results: List[FactCheckResult] = Field(default_factory=list)
    challenge_details: Optional[Dict[str, Any]] = None
    events_log: List[AgentEvent] = Field(default_factory=list)
    safe_ui_status: str
    is_completed: bool = False


class Orchestrator:
    """
    Master Multi-Agent Orchestrator:
    Coordinates Interviewer, Challenger, Fact Checker, and Rubric Synthesizer.
    Only the Orchestrator determines the single response sent back to the candidate.
    """

    async def process_turn(
        self,
        session: SessionState,
        question_id: str,
        user_answer: str,
        duration_seconds: float = 0.0,
        pressure_level: int = 3,
        vision_summary: Optional[Dict[str, Any]] = None,
        voice_summary: Optional[Dict[str, Any]] = None,
    ) -> OrchestratedTurnResult:
        events: List[AgentEvent] = []
        current_q = session.current_question

        events.append(
            AgentEvent(
                agent="ORCHESTRATOR",
                event="USER_ANSWER_RECEIVED",
                severity="info",
                details={"question_id": question_id, "duration": duration_seconds},
            )
        )

        # Step 1: Interviewer Agent Analysis
        interviewer_res: InterviewerAgentResponse = await interviewer_agent.analyze_response(
            session=session,
            question=current_q,
            user_answer=user_answer,
            vision_summary=vision_summary,
            voice_summary=voice_summary,
        )
        events.append(
            AgentEvent(
                agent="INTERVIEWER",
                event="RESPONSE_ANALYZED",
                severity="info",
                details={"intent": interviewer_res.intent, "coverage": len(interviewer_res.detected_concepts)},
            )
        )

        # Step 2: Fact Checker Agent Verification
        factcheck_res: FactCheckerAgentResponse = await fact_checker_agent.check_answer(
            user_answer=user_answer,
            max_claims=3,
        )
        if factcheck_res.extracted_claims:
            events.append(
                AgentEvent(
                    agent="FACT_CHECKER",
                    event="CLAIMS_VERIFIED",
                    severity="warning" if factcheck_res.has_unsupported_claims else "info",
                    details={"claims_count": len(factcheck_res.extracted_claims), "has_unsupported": factcheck_res.has_unsupported_claims},
                )
            )

        # Step 3: Challenger Agent Evaluation & Contradiction Detection
        challenger_res: ChallengerAgentResponse = await challenger_agent.evaluate_challenge(
            session=session,
            question=current_q,
            user_answer=user_answer,
            detected_concepts=interviewer_res.detected_concepts,
            missed_concepts=interviewer_res.missed_concepts,
            pressure_level=pressure_level,
        )
        if challenger_res.contradiction.contradiction_detected:
            events.append(
                AgentEvent(
                    agent="CHALLENGER",
                    event="CONTRADICTION_FOUND",
                    severity="critical",
                    details={"description": challenger_res.contradiction.description},
                )
            )
        elif challenger_res.is_challenge_needed:
            events.append(
                AgentEvent(
                    agent="CHALLENGER",
                    event="CHALLENGE_FORMULATED",
                    severity="info",
                    details={"mode": challenger_res.challenge_mode},
                )
            )

        # Step 4: Rubric Synthesizer Evaluation
        rubric_res: RubricAgentResponse = rubric_agent.synthesize_evaluation(
            user_answer=user_answer,
            interviewer_res=interviewer_res,
            challenger_res=challenger_res,
            factcheck_res=factcheck_res,
            vision_summary=vision_summary,
            voice_summary=voice_summary,
            duration_seconds=duration_seconds,
        )
        events.append(
            AgentEvent(
                agent="RUBRIC",
                event="EVALUATION_SYNTHESIZED",
                severity="info",
                details={"overall": rubric_res.scores.overall},
            )
        )

        # Step 5: Orchestration Action Priority Decision
        final_action = "FOLLOW_UP"
        next_question_text = interviewer_res.question
        reason_summary = interviewer_res.summary
        safe_ui_status = "MASTER AI analyzing response depth"
        challenge_details = None

        # Priority 1: Contradiction Detected -> Execute Immediate Challenge
        if challenger_res.contradiction.contradiction_detected:
            final_action = "CHALLENGE"
            next_question_text = challenger_res.challenge_question
            reason_summary = f"Contradiction identified: {challenger_res.contradiction.description}"
            safe_ui_status = "MASTER AI reconciling architectural inconsistency"
            challenge_details = {
                "mode": challenger_res.challenge_mode,
                "reason": challenger_res.challenge_reason,
                "contradiction": challenger_res.contradiction.model_dump(),
            }

        # Priority 2: Unsupported Technical Claim -> Challenge the Claim
        elif factcheck_res.has_unsupported_claims:
            final_action = "CHALLENGE"
            next_question_text = challenger_res.challenge_question
            reason_summary = "Adversary probing unsupported technical assertion."
            safe_ui_status = "MASTER AI pressure-testing technical assertion"
            challenge_details = {
                "mode": "Evidence Challenge",
                "reason": "Technical assertion contradicted documentation.",
                "contradiction": None,
            }

        # Priority 3: High Pressure Mode / Specific Adversarial Trap Triggered
        elif pressure_level >= 4 and challenger_res.is_challenge_needed:
            final_action = "CHALLENGE"
            next_question_text = challenger_res.challenge_question
            reason_summary = f"Adversary counter-probe: {challenger_res.challenge_reason}"
            safe_ui_status = f"MASTER AI formulating {challenger_res.challenge_mode} challenge"
            challenge_details = {
                "mode": challenger_res.challenge_mode,
                "reason": challenger_res.challenge_reason,
                "contradiction": None,
            }

        # Priority 4: High Technical Score (>= 85%) -> Escalate Difficulty
        elif rubric_res.scores.overall >= 85.0:
            final_action = "INCREASE_DIFFICULTY"
            next_question_text = interviewer_res.question
            reason_summary = "Candidate demonstrated exceptional domain mastery. Advancing scenario depth."
            safe_ui_status = "MASTER AI advancing to complex threat scenario"

        # Priority 5: Low Technical Score (<= 45%) -> Provide Structured Scaffolding / Clarification
        elif rubric_res.scores.overall <= 45.0:
            final_action = "CLARIFICATION"
            next_question_text = interviewer_res.question
            reason_summary = "Candidate omitted critical telemetry. Prompting for technical elaboration."
            safe_ui_status = "MASTER AI prompting for specific telemetry steps"

        # Priority 6: Standard Follow-Up / Move Forward
        else:
            final_action = interviewer_res.intent
            next_question_text = interviewer_res.question
            reason_summary = interviewer_res.summary
            safe_ui_status = f"MASTER AI presenting Question: {current_q.subtopic}"

        # Record Conversation Turn in Session Memory
        turn = ConversationTurn(
            turn_index=len(session.conversation_history) + 1,
            question_id=question_id,
            question_text=current_q.text,
            user_answer=user_answer,
            duration_seconds=duration_seconds,
            evaluation=rubric_res.evaluation,
            next_action=final_action,
            vision_summary=vision_summary,
        )
        session.conversation_history.append(turn)

        # Check if session questions exhausted
        is_completed = False
        next_q_num = session.current_question_index + 1
        if len(session.conversation_history) >= len(session.questions_list) * 2:
            is_completed = True

        # Persist Turn & Update Skill Mastery in Database
        try:
            with SessionLocal() as db:
                db_sess = db.query(InterviewSessionModel).filter(InterviewSessionModel.id == session.session_id).first()
                if not db_sess:
                    db_sess = InterviewSessionModel(
                        id=session.session_id,
                        mode=session.mode,
                        difficulty=session.difficulty,
                        duration_minutes=session.duration_minutes,
                        ai_personality=session.ai_personality,
                        topic=session.topic,
                        pressure_level=pressure_level,
                        is_completed=is_completed,
                        overall_score=rubric_res.scores.overall,
                    )
                    db.add(db_sess)
                else:
                    db_sess.overall_score = rubric_res.scores.overall
                    db_sess.is_completed = is_completed

                db_turn = TurnRecordModel(
                    session_id=session.session_id,
                    turn_index=turn.turn_index,
                    question_id=question_id,
                    question_text=current_q.text,
                    user_answer=user_answer,
                    duration_seconds=duration_seconds,
                    evaluation=rubric_res.evaluation.model_dump(),
                    fact_check_results=[r.model_dump() for r in factcheck_res.results],
                    challenge_details=challenge_details,
                    events_log=[e.model_dump() for e in events],
                    vision_summary=vision_summary,
                    voice_summary=voice_summary,
                )
                db.add(db_turn)

                # Update Skill Mastery for candidate profile
                cand_profile = db.query(CandidateProfileModel).first()
                cand_id = cand_profile.id if cand_profile else "default_candidate"
                skill_name = current_q.subtopic or "Threat Hunting"

                skm = (
                    db.query(SkillMasteryModel)
                    .filter(SkillMasteryModel.candidate_id == cand_id, SkillMasteryModel.skill_name == skill_name)
                    .first()
                )
                if not skm:
                    skm = SkillMasteryModel(
                        candidate_id=cand_id,
                        skill_name=skill_name,
                        category="Security Engineering",
                        score=rubric_res.scores.overall,
                        attempts=1,
                        correct_count=1 if rubric_res.scores.overall >= 70 else 0,
                        trend="steady",
                    )
                    db.add(skm)
                else:
                    skm.attempts += 1
                    if rubric_res.scores.overall >= 70:
                        skm.correct_count += 1
                    old_score = skm.score
                    # Exponential moving average score update
                    skm.score = round((old_score * 0.6) + (rubric_res.scores.overall * 0.4), 1)
                    skm.trend = "improving" if skm.score > old_score else "declining" if skm.score < old_score else "steady"

                db.commit()
        except Exception as db_err:
            logger.warning(f"Database persistence warning (non-fatal): {db_err}")

        events.append(
            AgentEvent(
                agent="ORCHESTRATOR",
                event="FINAL_ACTION_DISPATCHED",
                severity="info",
                details={"action": final_action, "question_id": f"{question_id}-turn{len(session.conversation_history)}"},
            )
        )

        return OrchestratedTurnResult(
            session_id=session.session_id,
            question_id=question_id,
            evaluation=rubric_res.evaluation,
            next_action=final_action,
            reason_summary=reason_summary,
            next_question_id=f"{question_id}-q{next_q_num}",
            next_question_number=next_q_num,
            next_question=next_question_text,
            difficulty=session.difficulty,
            topic=current_q.subtopic,
            fact_check_results=factcheck_res.results,
            challenge_details=challenge_details,
            events_log=events,
            safe_ui_status=safe_ui_status,
            is_completed=is_completed,
        )


orchestrator = Orchestrator()
