from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class DocumentChunkMetadata(BaseModel):
    document_id: str
    document_name: str
    source: str
    category: str
    topic: str
    page: Optional[int] = 1
    chunk_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    version: str = "1.0"
    content_hash: Optional[str] = None
    role_relevance: List[str] = Field(default_factory=list)


class DocumentChunk(BaseModel):
    id: str
    text: str
    metadata: DocumentChunkMetadata
    embedding: Optional[List[float]] = None


class RagRetrievalResult(BaseModel):
    chunk_id: str
    document_name: str
    category: str
    topic: str
    content: str
    similarity_score: float
    source: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RagContextResponse(BaseModel):
    query: str
    retrieved_chunks: List[RagRetrievalResult] = Field(default_factory=list)
    evidence_summary: str
    sources: List[Dict[str, str]] = Field(default_factory=list)
    confidence: float = 0.0  # 0 - 100 Evidence confidence
    grounded: bool = False
