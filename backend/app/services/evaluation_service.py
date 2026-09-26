import re
import logging
from typing import List, Dict, Any, Tuple
from app.schemas.interview import AnswerEvaluation

logger = logging.getLogger("master_ai.evaluator")

FILLER_WORDS_LIST = [
    "um",
    "uh",
    "like",
    "basically",
    "you know",
    "sort of",
    "kind of",
    "i mean",
    "honestly",
    "actually",
]


class EvaluationService:
    def detect_filler_words(self, text: str) -> List[str]:
        """Detect and count filler words in transcribed speech text."""
        detected = []
        lower_text = f" {text.lower()} "
        for word in FILLER_WORDS_LIST:
            pattern = rf"\b{re.escape(word)}\b"
            matches = re.findall(pattern, lower_text)
            if matches:
                detected.extend([word] * len(matches))
        return detected

    def evaluate_answer(
        self,
        question_text: str = "",
        expected_concepts: List[str] = None,
        user_answer: str = "",
        duration_seconds: float = 0.0,
        llm_data: Dict[str, Any] = None,
    ) -> AnswerEvaluation:
        """
        Evaluate candidate answer using LLM insights combined with deterministic rubric scoring.
        """
        if expected_concepts is None:
            expected_concepts = []
        fillers = self.detect_filler_words(user_answer)
        lower_answer = user_answer.lower()

        # If LLM generated structured evaluation, incorporate it
        if llm_data and "evaluation" in llm_data:
            eval_dict = llm_data["evaluation"]
            return AnswerEvaluation(
                correctness=float(eval_dict.get("correctness", 80)),
                completeness=float(eval_dict.get("completeness", 75)),
                reasoning=float(eval_dict.get("reasoning", 80)),
                relevance=float(eval_dict.get("relevance", 85)),
                clarity=float(eval_dict.get("clarity", 80)),
                overall=float(eval_dict.get("overall", 80)),
                strengths=eval_dict.get("strengths", ["Addressed the primary scenario"]),
                improvements=eval_dict.get("improvements", ["Could provide deeper architectural evidence"]),
                detected_concepts=eval_dict.get("detected_concepts", []),
                missed_concepts=eval_dict.get("missed_concepts", []),
                detected_filler_words=fillers,
            )

        # Deterministic Rule-Based Evaluator fallback
        detected_concepts = []
        missed_concepts = []

        for concept in expected_concepts:
            # Check keywords
            keywords = [w.lower() for w in concept.split() if len(w) > 3]
            match_count = sum(1 for kw in keywords if kw in lower_answer)
            if match_count >= max(1, len(keywords) // 2) or concept.lower() in lower_answer:
                detected_concepts.append(concept)
            else:
                missed_concepts.append(concept)

        word_count = len(user_answer.split())
        is_brief = word_count < 25
        is_thorough = word_count >= 50

        # Calculate scores
        concept_ratio = len(detected_concepts) / max(1, len(expected_concepts))
        
        correctness = min(98.0, max(45.0, 60.0 + (concept_ratio * 35.0)))
        completeness = min(95.0, max(35.0, 40.0 + (concept_ratio * 50.0))) if not is_brief else 45.0
        reasoning = min(96.0, max(50.0, 65.0 + (15.0 if is_thorough else 0.0) + (concept_ratio * 15.0)))
        relevance = 90.0 if not is_brief else 70.0
        
        # Clarity penalty for high filler density
        filler_penalty = min(20.0, len(fillers) * 3.0)
        clarity = max(50.0, 92.0 - filler_penalty)

        overall = round(
            (correctness * 0.3) +
            (completeness * 0.25) +
            (reasoning * 0.25) +
            (relevance * 0.1) +
            (clarity * 0.1),
            1
        )

        strengths = []
        improvements = []

        if detected_concepts:
            strengths.append(f"Clearly identified key concepts: {', '.join(detected_concepts[:2])}.")
        if is_thorough:
            strengths.append("Structured technical explanation with good step-by-step phrasing.")
        else:
            strengths.append("Direct response addressing initial premise.")

        if missed_concepts:
            improvements.append(f"Omitted critical domain elements: {', '.join(missed_concepts[:2])}.")
        if fillers:
            improvements.append(f"Detected {len(fillers)} filler hesitations ({', '.join(set(fillers))}). Target intentional pauses.")
        if is_brief:
            improvements.append("Answer was concise; elaborate on specific telemetry artifacts and root cause verification.")

        return AnswerEvaluation(
            correctness=round(correctness, 1),
            completeness=round(completeness, 1),
            reasoning=round(reasoning, 1),
            relevance=round(relevance, 1),
            clarity=round(clarity, 1),
            overall=round(overall, 1),
            strengths=strengths,
            improvements=improvements,
            detected_concepts=detected_concepts,
            missed_concepts=missed_concepts,
            detected_filler_words=fillers,
        )


evaluation_service = EvaluationService()
