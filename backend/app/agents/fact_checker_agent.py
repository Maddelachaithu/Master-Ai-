import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.factcheck.service import fact_check_service
from app.factcheck.provider import FactCheckResult

logger = logging.getLogger("master_ai.agents.fact_checker")


class FactCheckerAgentResponse(BaseModel):
    extracted_claims: List[str] = Field(default_factory=list)
    results: List[FactCheckResult] = Field(default_factory=list)
    has_unsupported_claims: bool = False
    has_supported_claims: bool = False
    summary: str


class FactCheckerAgent:
    """
    Fact Checker Agent: Extracts technical claims from candidate responses and
    verifies them against authoritative technical sources (RFCs, NIST, MITRE, Microsoft/AWS Docs).
    """

    async def check_answer(
        self,
        user_answer: str,
        max_claims: int = 3,
    ) -> FactCheckerAgentResponse:
        claims = fact_check_service.extract_technical_claims(user_answer, max_claims=max_claims)

        if not claims:
            return FactCheckerAgentResponse(
                extracted_claims=[],
                results=[],
                has_unsupported_claims=False,
                has_supported_claims=False,
                summary="No concrete technical assertions required verification in this response.",
            )

        results: List[FactCheckResult] = await fact_check_service.verify_claims_batch(claims)

        has_unsupported = any(r.verdict == "UNSUPPORTED" for r in results)
        has_supported = any(r.verdict == "SUPPORTED" for r in results)

        supported_count = sum(1 for r in results if r.verdict == "SUPPORTED")
        unsupported_count = sum(1 for r in results if r.verdict == "UNSUPPORTED")

        if unsupported_count > 0:
            summary = f"Fact Check: {unsupported_count} technical claim(s) unsupported by documentation standards."
        elif supported_count > 0:
            summary = f"Fact Check: {supported_count} technical claim(s) successfully verified against vendor documentation."
        else:
            summary = "Fact Check: Technical assertions logged for longitudinal knowledge indexing."

        return FactCheckerAgentResponse(
            extracted_claims=claims,
            results=results,
            has_unsupported_claims=has_unsupported,
            has_supported_claims=has_supported,
            summary=summary,
        )


fact_checker_agent = FactCheckerAgent()
