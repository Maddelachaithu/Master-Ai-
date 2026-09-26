import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.interview import (
    SessionStartRequest,
    SessionStartResponse,
    AnswerSubmissionRequest,
    AnswerSubmissionResponse,
    NextQuestionRequest,
    VisionSummaryRequest,
    VisionSummaryResponse,
)
from app.services.session_service import session_service
from app.services.interviewer_service import interviewer_service

logger = logging.getLogger("master_ai.routes.interview")
router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/session", response_model=SessionStartResponse)
async def start_interview_session(request: SessionStartRequest):
    """
    Initialize a new autonomous interview or debate session.
    Configures the domain, starting difficulty tier, and AI personality.
    """
    try:
        session = session_service.create_session(request)
        initial_q = session.current_question

        return SessionStartResponse(
            session_id=session.session_id,
            mode=session.mode,
            difficulty=session.difficulty,
            ai_personality=session.ai_personality,
            topic=session.topic,
            question_id=initial_q.id,
            question_number=session.current_question_index + 1,
            question_text=initial_q.text,
            expected_concepts=initial_q.expected_concepts,
            hints=initial_q.hints,
        )
    except Exception as e:
        logger.error(f"Error starting interview session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not initialize interview session: {str(e)}",
        )


@router.get("/{session_id}")
async def get_session_state(session_id: str):
    """Retrieve full conversation history and current evaluation state."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return session


@router.post("/{session_id}/answer", response_model=AnswerSubmissionResponse)
async def submit_candidate_answer(session_id: str, request: AnswerSubmissionRequest):
    """
    Submit transcribed answer for real-time evaluation and adaptive follow-up generation.
    """
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    if not request.answer.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Answer text cannot be empty.")

    try:
        response = await interviewer_service.process_answer(
            session=session,
            question_id=request.question_id,
            user_answer=request.answer,
            duration_seconds=request.duration_seconds or 0.0,
        )
        return response
    except Exception as e:
        logger.error(f"Error evaluating candidate answer: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation pipeline failed: {str(e)}",
        )


@router.post("/{session_id}/next-question")
async def advance_or_skip_question(session_id: str, request: NextQuestionRequest):
    """Skip to next scheduled question in domain sequence."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    next_idx = session.current_question_index + 1
    if next_idx < len(session.questions_list):
        session.current_question_index = next_idx
        session.current_question = session.questions_list[next_idx]
        return {
            "session_id": session.session_id,
            "question_id": session.current_question.id,
            "question_number": next_idx + 1,
            "question_text": session.current_question.text,
            "topic": session.current_question.subtopic,
            "difficulty": session.difficulty,
            "is_completed": False,
        }
    else:
        session.is_completed = True
        return {
            "session_id": session.session_id,
            "question_id": "session-end",
            "question_number": next_idx,
            "question_text": "All scheduled interview domains completed.",
            "topic": session.topic,
            "difficulty": session.difficulty,
            "is_completed": True,
        }


@router.post("/{session_id}/vision-summary", response_model=VisionSummaryResponse)
async def record_answer_vision_summary(session_id: str, request: VisionSummaryRequest):
    """
    Record client-side observable presentation metrics (camera engagement, posture consistency, frame quality).
    Privacy Note: Only derived numerical scores are stored. Zero raw video frames transmitted.
    """
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    summary_dict = request.model_dump()
    session_service.record_vision_summary(session_id, summary_dict)

    return VisionSummaryResponse(
        status="success",
        session_id=session_id,
        question_id=request.question_id,
        summary_recorded=True,
    )

