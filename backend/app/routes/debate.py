import uuid
import logging
from typing import Dict, Any, Optional, Literal
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.agents.debate_agent import debate_agent, DebateState, DebateRound, DebateScoreBreakdown
from app.factcheck.service import fact_check_service

logger = logging.getLogger("master_ai.routes.debate")
router = APIRouter(prefix="/debate", tags=["Debate"])

# In-memory debate session store
_debate_sessions: Dict[str, DebateState] = {}


class DebateStartRequest(BaseModel):
    topic: str = "Should organizations move entirely to passwordless authentication?"
    candidate_stance: Literal["FOR", "AGAINST"] = "FOR"
    max_rounds: int = 6


class DebateStartResponse(BaseModel):
    session_id: str
    topic: str
    candidate_stance: str
    ai_stance: str
    current_round: int
    max_rounds: int
    ai_opening_statement: str


class DebateTurnRequest(BaseModel):
    candidate_speech: str


class DebateTurnResponse(BaseModel):
    session_id: str
    round_number: int
    ai_rebuttal: str
    counterargument_focus: str
    evidence_demanded: Optional[str] = None
    next_action: str
    is_completed: bool
    fact_check_results: list = Field(default_factory=list)
    debate_score: Optional[DebateScoreBreakdown] = None


@router.post("/start", response_model=DebateStartResponse)
async def start_debate_session(request: DebateStartRequest):
    """
    Initialize an adversarial debate session.
    MASTER AI automatically assigns itself the opposing stance.
    """
    session_id = f"deb-{uuid.uuid4().hex[:10]}"
    ai_stance: Literal["FOR", "AGAINST"] = "AGAINST" if request.candidate_stance == "FOR" else "FOR"

    # Opening statement framing
    if "passwordless" in request.topic.lower():
        if ai_stance == "AGAINST":
            ai_opening = (
                "Welcome to the debate on Passwordless Authentication. As your opponent, I will argue that "
                "moving entirely to passwordless architectures introduces severe Single-Point-of-Failure risks, "
                "complex hardware dependency costs, and acute vulnerabilities in recovery workflows. "
                "Please deliver your opening statement."
            )
        else:
            ai_opening = (
                "Welcome to the debate on Passwordless Authentication. I will argue that traditional password systems "
                "are fundamentally compromised and constitute the single greatest threat vector in modern enterprise security. "
                "Please present your opening position."
            )
    else:
        ai_opening = (
            f"Welcome. We are debating '{request.topic}'. You have chosen {request.candidate_stance}; "
            f"I will take the {ai_stance} position to rigorously test your argument and evidence. "
            f"Please present your opening thesis."
        )

    state = DebateState(
        session_id=session_id,
        topic=request.topic,
        candidate_stance=request.candidate_stance,
        ai_stance=ai_stance,
        current_round=1,
        max_rounds=request.max_rounds,
        rounds=[],
        candidate_arguments=[],
        ai_arguments=[ai_opening],
        is_completed=False,
    )
    _debate_sessions[session_id] = state

    return DebateStartResponse(
        session_id=session_id,
        topic=state.topic,
        candidate_stance=state.candidate_stance,
        ai_stance=state.ai_stance,
        current_round=1,
        max_rounds=state.max_rounds,
        ai_opening_statement=ai_opening,
    )


@router.post("/{session_id}/turn", response_model=DebateTurnResponse)
async def process_debate_turn(session_id: str, request: DebateTurnRequest):
    """
    Submit candidate speech turn for adversarial rebuttal and fact-checking.
    """
    state = _debate_sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debate session not found.")

    if not request.candidate_speech.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate speech cannot be empty.")

    # 1. Fact-check candidate claims
    claims = fact_check_service.extract_technical_claims(request.candidate_speech, max_claims=2)
    fact_results = await fact_check_service.verify_claims_batch(claims)
    fact_summary = [f"{r.claim}: {r.verdict}" for r in fact_results]

    # 2. Generate adversarial rebuttal
    debate_res = await debate_agent.generate_rebuttal(
        debate_state=state,
        candidate_speech=request.candidate_speech,
        fact_check_summary=fact_summary,
    )

    return DebateTurnResponse(
        session_id=session_id,
        round_number=debate_res.round_number,
        ai_rebuttal=debate_res.ai_rebuttal,
        counterargument_focus=debate_res.counterargument_focus,
        evidence_demanded=debate_res.evidence_demanded,
        next_action=debate_res.next_action,
        is_completed=debate_res.is_completed,
        fact_check_results=[r.model_dump() for r in fact_results],
        debate_score=debate_res.debate_score,
    )


@router.get("/{session_id}")
async def get_debate_state(session_id: str):
    """Retrieve full debate rounds and scores."""
    state = _debate_sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debate session not found.")
    return state
