import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.models.session import SessionState, QuestionModel
from app.services.llm_service import llm_service

logger = logging.getLogger("master_ai.agents.interviewer")


class InterviewerAgentResponse(BaseModel):
    intent: str  # FOLLOW_UP, CLARIFICATION, MOVE_FORWARD, INCREASE_DIFFICULTY, DECREASE_DIFFICULTY
    topic: str
    difficulty: str
    question: str
    summary: str
    detected_concepts: List[str] = Field(default_factory=list)
    missed_concepts: List[str] = Field(default_factory=list)


class InterviewerAgent:
    """
    Interviewer Agent: Directs structured questioning and assesses candidate knowledge depth.
    Generates tailored candidate-facing questions without exposing private chain-of-thought.
    """

    async def analyze_response(
        self,
        session: SessionState,
        question: QuestionModel,
        user_answer: str,
        vision_summary: Optional[Dict[str, Any]] = None,
        voice_summary: Optional[Dict[str, Any]] = None,
    ) -> InterviewerAgentResponse:
        answer_lower = user_answer.lower()

        # Concept coverage analysis
        detected_concepts: List[str] = []
        missed_concepts: List[str] = []

        for concept in question.expected_concepts:
            concept_words = [w.lower() for w in concept.split() if len(w) > 3]
            match = any(w in answer_lower for w in concept_words)
            if match:
                detected_concepts.append(concept)
            else:
                missed_concepts.append(concept)

        coverage_ratio = len(detected_concepts) / max(1, len(question.expected_concepts))

        # Check if LLM is available for dynamic question wording
        if llm_service.is_available():
            prompt = f"""
            You are the MASTER AI Interviewer Agent conducting a {session.mode} interview at {session.difficulty} difficulty.
            Target Domain: {question.subtopic}
            Personality Tone: {session.ai_personality}
            
            Current Question: {question.text}
            Expected Concepts: {question.expected_concepts}
            Candidate Answer: {user_answer}
            Concepts Covered: {detected_concepts}
            Concepts Missed: {missed_concepts}

            Determine:
            1. intent: "FOLLOW_UP" if key concepts missed, "INCREASE_DIFFICULTY" if coverage > 80%, "MOVE_FORWARD" if answer complete.
            2. question: A precise, professional interview follow-up or next question reflecting the {session.ai_personality} personality.
            3. summary: Concise 1-sentence assessment of the response.

            Respond with JSON matching schema:
            {{
                "intent": "FOLLOW_UP",
                "topic": "{question.subtopic}",
                "difficulty": "{session.difficulty}",
                "question": "...",
                "summary": "..."
            }}
            """
            system_instruction = f"You are MASTER AI Interviewer ({session.ai_personality} tone). Return only valid JSON."
            llm_result = await llm_service.generate_json(prompt, system_instruction=system_instruction)
            if llm_result and "question" in llm_result:
                return InterviewerAgentResponse(
                    intent=llm_result.get("intent", "FOLLOW_UP"),
                    topic=llm_result.get("topic", question.subtopic),
                    difficulty=llm_result.get("difficulty", session.difficulty),
                    question=llm_result.get("question", question.sample_followups[0] if question.sample_followups else "Can you elaborate further?"),
                    summary=llm_result.get("summary", "Candidate addressed initial scenario."),
                    detected_concepts=detected_concepts,
                    missed_concepts=missed_concepts,
                )

        # Deterministic Rule Fallback
        if coverage_ratio >= 0.7:
            intent = "INCREASE_DIFFICULTY"
            summary = "Candidate demonstrated strong understanding of primary domain concepts."
            follow_up = (
                question.sample_followups[0]
                if question.sample_followups
                else f"Excellent. How does this architecture scale when high-availability constraints are introduced in {question.subtopic}?"
            )
        elif coverage_ratio >= 0.3:
            intent = "FOLLOW_UP"
            summary = f"Candidate identified foundational concepts but omitted {missed_concepts[0] if missed_concepts else 'deeper forensic telemetry'}."
            follow_up = (
                question.sample_followups[0]
                if question.sample_followups
                else f"You highlighted initial triage steps. What specific telemetry would you examine to confirm {missed_concepts[0] if missed_concepts else 'lateral movement'}?"
            )
        else:
            intent = "CLARIFICATION"
            summary = "Candidate provided a high-level answer without specific technical mechanisms."
            follow_up = f"Could you walk me through the concrete technical steps and logs you would examine for {question.subtopic}?"

        return InterviewerAgentResponse(
            intent=intent,
            topic=question.subtopic,
            difficulty=session.difficulty,
            question=follow_up,
            summary=summary,
            detected_concepts=detected_concepts,
            missed_concepts=missed_concepts,
        )


interviewer_agent = InterviewerAgent()
