import re
import logging
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field
from app.models.session import SessionState, QuestionModel
from app.services.llm_service import llm_service

logger = logging.getLogger("master_ai.agents.challenger")

ChallengeMode = Literal[
    "Socratic",
    "Counterexample",
    "Devil's Advocate",
    "Edge Case",
    "Assumption Challenge",
    "Evidence Challenge",
    "Technical Deep Dive",
]


class ContradictionResult(BaseModel):
    contradiction_detected: bool
    severity: Optional[Literal["low", "medium", "high"]] = None
    description: Optional[str] = None
    earlier_statement: Optional[str] = None
    current_statement: Optional[str] = None


class ChallengerAgentResponse(BaseModel):
    is_challenge_needed: bool
    challenge_mode: ChallengeMode
    challenge_question: str
    challenge_reason: str
    contradiction: ContradictionResult


class ChallengerAgent:
    """
    Challenger Agent: Adversarial pressure-tester looking for unsupported assumptions,
    contradictions against earlier turns, edge-case omissions, and technical oversimplifications.
    """

    def detect_contradictions(self, current_answer: str, session: SessionState) -> ContradictionResult:
        """
        Detects conflicting claims between the candidate's current answer and previous turns.
        """
        if not session.conversation_history:
            return ContradictionResult(contradiction_detected=False)

        current_lower = current_answer.lower()

        # Inconsistency patterns
        contradiction_pairs = [
            (r"only.*firewall|firewall.*alone", r"never.*trust.*firewall|endpoint.*essential", "Perimeter vs. endpoint telemetry reliance"),
            (r"always.*rotate.*passwords", r"passwordless.*only|passwords.*obsolete", "Password rotation vs passwordless policy"),
            (r"never.*inspect.*lsass", r"lsass.*memory.*dump|volatile.*memory", "LSASS inspection posture"),
            (r"zero.*trust.*not.*needed", r"zero.*trust.*architecture", "Zero trust requirement stance"),
        ]

        for past_turn in session.conversation_history:
            past_lower = past_turn.user_answer.lower()

            for p1, p2, desc in contradiction_pairs:
                if (re.search(p1, past_lower) and re.search(p2, current_lower)) or (
                    re.search(p2, past_lower) and re.search(p1, current_lower)
                ):
                    return ContradictionResult(
                        contradiction_detected=True,
                        severity="medium",
                        description=f"Potential inconsistency detected regarding {desc}.",
                        earlier_statement=past_turn.user_answer[:120] + "...",
                        current_statement=current_answer[:120] + "...",
                    )

        return ContradictionResult(contradiction_detected=False)

    async def evaluate_challenge(
        self,
        session: SessionState,
        question: QuestionModel,
        user_answer: str,
        detected_concepts: List[str],
        missed_concepts: List[str],
        pressure_level: int = 3,
    ) -> ChallengerAgentResponse:
        contradiction = self.detect_contradictions(user_answer, session)

        # If contradiction found, immediately challenge
        if contradiction.contradiction_detected:
            challenge_q = (
                f"Earlier you indicated '{contradiction.earlier_statement}', whereas you now note that "
                f"'{contradiction.current_statement}'. How do you reconcile these two architectural approaches?"
            )
            return ChallengerAgentResponse(
                is_challenge_needed=True,
                challenge_mode="Assumption Challenge",
                challenge_question=challenge_q,
                challenge_reason="Candidate made statements conflicting with earlier conversation turn.",
                contradiction=contradiction,
            )

        # Check adversarial traps in question definition
        answer_lower = user_answer.lower()
        trap_triggered = None
        for trap in question.adversarial_traps:
            trap_words = [w.lower() for w in trap.split() if len(w) > 4]
            if any(w in answer_lower for w in trap_words):
                trap_triggered = trap
                break

        # Check LLM for sophisticated challenge formulation
        if llm_service.is_available():
            prompt = f"""
            You are the MASTER AI Challenger Agent. Your role is adversarial pressure testing.
            Interview Mode: {session.mode} (Difficulty: {session.difficulty}, Pressure Level: {pressure_level}/5)
            Current Question: {question.text}
            Candidate Answer: {user_answer}
            Adversarial Traps: {question.adversarial_traps}
            Triggered Trap: {trap_triggered}

            Challenge Modes available: Socratic, Counterexample, Devil's Advocate, Edge Case, Assumption Challenge, Evidence Challenge, Technical Deep Dive.

            Generate a targeted, technically rigorous challenge question that stress-tests the candidate's assumptions.
            Keep tone respectful, objective, and intellectually demanding.

            Respond with JSON matching schema:
            {{
                "is_challenge_needed": true,
                "challenge_mode": "Devil's Advocate",
                "challenge_question": "...",
                "challenge_reason": "Candidate assumed X without accounting for Y."
            }}
            """
            llm_result = await llm_service.generate_json(prompt, system_instruction="You are MASTER AI Adversarial Challenger. Return only valid JSON.")
            if llm_result and "challenge_question" in llm_result:
                return ChallengerAgentResponse(
                    is_challenge_needed=llm_result.get("is_challenge_needed", True),
                    challenge_mode=llm_result.get("challenge_mode", "Edge Case"),
                    challenge_question=llm_result["challenge_question"],
                    challenge_reason=llm_result.get("challenge_reason", "Pressure-testing operational edge case."),
                    contradiction=contradiction,
                )

        # Deterministic Challenge Mode Selection
        challenge_mode: ChallengeMode = "Edge Case"
        challenge_q = ""
        challenge_reason = "Stress-testing candidate technical assumptions."

        if trap_triggered:
            challenge_mode = "Devil's Advocate"
            challenge_reason = f"Candidate encountered adversarial boundary trap: {trap_triggered}"
            challenge_q = (
                f"Adversary Counter: That assumes perimeter firewalls isolate east-west traffic. "
                f"If the attacker operates with legitimate service credentials inside the subnet, how does your detection change?"
            )
        elif "firewall" in answer_lower and "event" not in answer_lower:
            challenge_mode = "Counterexample"
            challenge_reason = "Candidate relied solely on network boundaries without endpoint event correlation."
            challenge_q = (
                "Suppose the attacker uses an authenticated SMB session over port 445 with an active administrative ticket. "
                "What host-level volatile telemetry proves lateral movement rather than scheduled maintenance?"
            )
        elif "iam" in answer_lower and "sts" not in answer_lower:
            challenge_mode = "Technical Deep Dive"
            challenge_reason = "Candidate omitted active STS session revocation."
            challenge_q = (
                "If the compromised IAM role already generated temporary STS credentials with a 12-hour expiration, "
                "deleting the role will not revoke existing session tokens. How do you immediately invalidate active STS tokens?"
            )
        else:
            challenge_mode = "Socratic"
            challenge_reason = "Probing evidentiary validation of candidate claims."
            challenge_q = (
                "What empirical forensic evidence or log artifact would conclusively disprove your initial hypothesis?"
            )

        return ChallengerAgentResponse(
            is_challenge_needed=True,
            challenge_mode=challenge_mode,
            challenge_question=challenge_q,
            challenge_reason=challenge_reason,
            contradiction=contradiction,
        )


challenger_agent = ChallengerAgent()
