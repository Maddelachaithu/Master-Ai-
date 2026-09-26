from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.schemas.interview import AnswerEvaluation


class QuestionModel(BaseModel):
    id: str
    number: int
    text: str
    category: str
    subtopic: str
    difficulty: str
    expected_concepts: List[str]
    sample_followups: List[str] = Field(default_factory=list)
    adversarial_traps: List[str] = Field(default_factory=list)
    hints: List[str] = Field(default_factory=list)


class ConversationTurn(BaseModel):
    turn_index: int
    question_id: str
    question_text: str
    user_answer: str
    duration_seconds: float
    evaluation: AnswerEvaluation
    next_action: str
    vision_summary: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SessionState(BaseModel):
    session_id: str
    mode: str
    difficulty: str
    duration_minutes: int
    ai_personality: str
    topic: str
    current_question: QuestionModel
    current_question_index: int = 0
    questions_list: List[QuestionModel] = Field(default_factory=list)
    conversation_history: List[ConversationTurn] = Field(default_factory=list)
    vision_summaries: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_completed: bool = False
