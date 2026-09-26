import logging
from typing import Dict, Any, Tuple, Optional, List
from app.schemas.interview import (
    AnswerEvaluation,
    AnswerSubmissionResponse,
    InterviewActionType,
)
from app.models.session import SessionState, QuestionModel, ConversationTurn
from app.services.evaluation_service import evaluation_service
from app.services.llm_service import llm_service

logger = logging.getLogger("master_ai.interviewer")

DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]


from app.agents.orchestrator import orchestrator


class InterviewerService:
    def adjust_difficulty(self, current_difficulty: str, overall_score: float) -> Tuple[str, str]:
        """
        Deterministic difficulty controller:
        Strong score (>85) -> +1 difficulty tier (max expert)
        Weak score (<50) -> -1 difficulty tier (min beginner)
        """
        current_idx = (
            DIFFICULTY_LEVELS.index(current_difficulty.lower())
            if current_difficulty.lower() in DIFFICULTY_LEVELS
            else 2
        )

        if overall_score >= 85.0 and current_idx < len(DIFFICULTY_LEVELS) - 1:
            new_diff = DIFFICULTY_LEVELS[current_idx + 1]
            return new_diff, f"Candidate demonstrated high mastery ({overall_score}/100); escalating difficulty to {new_diff.upper()}."
        elif overall_score < 50.0 and current_idx > 0:
            new_diff = DIFFICULTY_LEVELS[current_idx - 1]
            return new_diff, f"Candidate struggled with foundational premises ({overall_score}/100); de-escalating difficulty to {new_diff.upper()}."
        else:
            return current_difficulty, f"Maintaining {current_difficulty.upper()} tier based on consistent performance ({overall_score}/100)."

    def apply_personality_tone(self, question: str, personality: str) -> str:
        """
        Apply conversational framing based on AI personality.
        Does NOT alter grading or technical substance.
        """
        p = personality.lower()
        if p == "aggressive":
            prefixes = [
                "Hold on. In a live active breach: ",
                "Let's test the reality of that assumption: ",
                "If the attacker bypasses that standard control: ",
            ]
            import random
            return f"{random.choice(prefixes)}{question}"
        elif p == "strict":
            return f"Understood. Moving directly to the critical technical constraint: {question}"
        elif p == "friendly":
            return f"Great start on the initial approach! Let's explore the next layer: {question}"
        elif p == "socratic":
            return f"Consider the underlying mechanism here: {question}"
        else:  # professional
            return f"Thank you for that response. Let us examine the follow-up: {question}"

    async def process_answer(
        self,
        session: SessionState,
        question_id: str,
        user_answer: str,
        duration_seconds: float = 0.0,
        pressure_level: int = 3,
        vision_summary: Optional[Dict[str, Any]] = None,
        voice_summary: Optional[Dict[str, Any]] = None,
    ) -> AnswerSubmissionResponse:
        """
        Multi-Agent coordinated turn execution via Orchestrator:
        Interviewer -> Challenger -> Fact Checker -> Rubric Synthesizer.
        """
        turn_result = await orchestrator.process_turn(
            session=session,
            question_id=question_id,
            user_answer=user_answer,
            duration_seconds=duration_seconds,
            pressure_level=pressure_level,
            vision_summary=vision_summary,
            voice_summary=voice_summary,
        )

        # Update difficulty based on rubric score
        new_difficulty, diff_reason = self.adjust_difficulty(session.difficulty, turn_result.evaluation.overall)
        session.difficulty = new_difficulty

        return AnswerSubmissionResponse(
            session_id=session.session_id,
            question_id=turn_result.question_id,
            evaluation=turn_result.evaluation,
            next_action=turn_result.next_action,
            reason_summary=turn_result.reason_summary,
            next_question_id=turn_result.next_question_id,
            next_question_number=turn_result.next_question_number,
            next_question=self.apply_personality_tone(turn_result.next_question, session.ai_personality),
            difficulty=session.difficulty,
            topic=turn_result.topic,
            is_completed=turn_result.is_completed,
            ai_status_message=f"MASTER AI: {turn_result.reason_summary}",
            safe_ui_status=turn_result.safe_ui_status,
            fact_check_results=[r.model_dump() for r in turn_result.fact_check_results],
            challenge_details=turn_result.challenge_details,
            events_log=[e.model_dump() for e in turn_result.events_log],
        )


interviewer_service = InterviewerService()

