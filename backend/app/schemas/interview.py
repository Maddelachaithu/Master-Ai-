from pydantic import BaseModel, Field
from typing import List, Optional, Literal

InterviewActionType = Literal[
    "FOLLOW_UP",
    "CHALLENGE",
    "INCREASE_DIFFICULTY",
    "DECREASE_DIFFICULTY",
    "CHANGE_TOPIC",
    "CLARIFICATION",
    "MOVE_FORWARD",
]


class AnswerEvaluation(BaseModel):
    correctness: float = Field(..., ge=0, le=100)
    completeness: float = Field(..., ge=0, le=100)
    reasoning: float = Field(..., ge=0, le=100)
    relevance: float = Field(..., ge=0, le=100)
    clarity: float = Field(..., ge=0, le=100)
    overall: float = Field(..., ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    detected_concepts: List[str] = Field(default_factory=list)
    missed_concepts: List[str] = Field(default_factory=list)
    detected_filler_words: List[str] = Field(default_factory=list)


class SessionStartRequest(BaseModel):
    mode: str = "cybersecurity"
    difficulty: str = "advanced"
    duration_minutes: int = 15
    ai_personality: str = "socratic"
    target_topic: Optional[str] = "Lateral Movement & Threat Hunting"
    pressure_level: int = Field(default=3, ge=1, le=5)
    enable_fact_checking: bool = True
    enable_visual_analysis: bool = True
    enable_adaptive_difficulty: bool = True
    enable_follow_ups: bool = True


class SessionStartResponse(BaseModel):
    session_id: str
    mode: str
    difficulty: str
    ai_personality: str
    topic: str
    question_id: str
    question_number: int
    question_text: str
    expected_concepts: List[str] = Field(default_factory=list)
    hints: List[str] = Field(default_factory=list)


class AnswerSubmissionRequest(BaseModel):
    question_id: str
    answer: str
    duration_seconds: Optional[float] = 0.0
    pressure_level: Optional[int] = 3


class AnswerSubmissionResponse(BaseModel):
    session_id: str
    question_id: str
    evaluation: AnswerEvaluation
    next_action: InterviewActionType
    reason_summary: str
    next_question_id: str
    next_question_number: int
    next_question: str
    difficulty: str
    topic: str
    is_completed: bool = False
    ai_status_message: Optional[str] = None
    safe_ui_status: Optional[str] = None
    fact_check_results: List[dict] = Field(default_factory=list)
    challenge_details: Optional[dict] = None
    events_log: List[dict] = Field(default_factory=list)


class NextQuestionRequest(BaseModel):
    action: Optional[str] = "skip"


class VisionSummaryRequest(BaseModel):
    answer_id: Optional[str] = None
    question_id: str
    camera_engagement: float = Field(..., ge=0, le=100)
    posture_consistency: float = Field(..., ge=0, le=100)
    face_presence_rate: float = Field(..., ge=0, le=100)
    frame_quality: float = Field(..., ge=0, le=100)
    lighting_quality: Optional[float] = 90.0
    dominant_posture_state: Optional[str] = "GOOD_ALIGNMENT"
    background_person_events: Optional[int] = 0
    background_movement_events: Optional[int] = 0
    total_detected_duration_seconds: Optional[int] = 0
    posture_warnings: Optional[int] = 0
    observations: List[str] = Field(default_factory=list)


class VisionSummaryResponse(BaseModel):
    status: str
    session_id: str
    question_id: str
    summary_recorded: bool


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    whisper_ready: bool
    llm_provider: str
    llm_ready: bool
    components: Optional[dict] = Field(default_factory=dict)
