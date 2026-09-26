from abc import ABC, abstractmethod
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

FactVerdict = Literal[
    "SUPPORTED",
    "PARTIALLY_SUPPORTED",
    "UNSUPPORTED",
    "UNVERIFIED",
    "CONTESTED",
]


class FactSource(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    publisher: Optional[str] = None


class FactCheckResult(BaseModel):
    claim: str
    verdict: FactVerdict
    confidence: float = Field(..., ge=0.0, le=1.0)
    sources: List[FactSource] = Field(default_factory=list)
    explanation: str
    cached: bool = False


class FactCheckProvider(ABC):
    @abstractmethod
    async def verify_claim(self, claim: str) -> FactCheckResult:
        """
        Verify a single factual/technical claim against authoritative technical knowledge.
        Must return UNVERIFIED if external verification fails or evidence is unavailable.
        Never fabricate sources or URLs.
        """
        pass
