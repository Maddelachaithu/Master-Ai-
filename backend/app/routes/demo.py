import logging
from fastapi import APIRouter, HTTPException
from app.services.demo_service import demo_service

logger = logging.getLogger("master_ai.routes.demo")

router = APIRouter(prefix="/demo", tags=["Demo Mode"])


@router.get("/scenario")
async def get_demo_scenario():
    """Returns the deterministic SOC Analyst demonstration scenario."""
    return demo_service.get_demo_scenario()


@router.get("/turn/{turn_index}")
async def get_demo_turn(turn_index: int):
    """Returns deterministic turn data with transcript, vision metrics, RAG evidence, fact-checks, and agent timeline."""
    if turn_index < 1 or turn_index > len(demo_service.DEMO_QUESTIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Turn index must be between 1 and {len(demo_service.DEMO_QUESTIONS)}",
        )
    return demo_service.get_demo_turn(turn_index)


@router.post("/reset")
async def reset_demo():
    """Resets demo session state without touching real candidate data."""
    return {"status": "success", "message": "Demo session reset successfully. Real candidate data remains unaffected."}
