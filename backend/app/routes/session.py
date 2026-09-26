import logging
from fastapi import APIRouter, HTTPException, status
from app.services.session_service import session_service

logger = logging.getLogger("master_ai.routes.sessions")
router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("")
async def list_active_sessions():
    """List all active in-memory sessions."""
    return list(session_service._sessions.values())


@router.get("/{session_id}")
async def get_session_details(session_id: str):
    """Retrieve detailed session conversation turns and evaluations."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return session
