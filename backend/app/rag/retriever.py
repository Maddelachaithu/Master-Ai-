import re
import logging
from typing import List, Dict, Any, Optional
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.rag.metadata import RagRetrievalResult

logger = logging.getLogger("master_ai.rag.retriever")


class HybridRetriever:
    """
    Hybrid Retriever combining Dense Vector Similarity with Sparse Keyword Token Overlap
    and metadata filtering (category, topic, difficulty, role).
    """

    def __init__(self):
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    def _compute_keyword_overlap(self, query: str, document_text: str) -> float:
        """Calculate token match ratio focusing on technical entities."""
        q_tokens = set(re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", query.lower()))
        if not q_tokens:
            return 0.0

        doc_lower = document_text.lower()
        matched = sum(1 for tok in q_tokens if tok in doc_lower)
        return matched / len(q_tokens)

    async def retrieve(
        self,
        query: str,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        role: Optional[str] = None,
        top_k: int = 5,
        min_similarity: float = 0.25,
    ) -> List[RagRetrievalResult]:
        if not query.strip():
            return []

        # 1. Embed query
        query_vec = self.embedding_service.embed_query(query)

        # 2. Build metadata filter
        where_filter = {}
        if category:
            where_filter["category"] = category
        if topic:
            where_filter["topic"] = topic

        # 3. Dense Retrieval from ChromaDB
        raw_results = self.vector_store.query(
            query_embedding=query_vec,
            top_k=max(top_k * 2, 8),
            where_filter=where_filter if where_filter else None,
        )

        if not raw_results:
            return []

        # 4. Hybrid Scoring (0.65 Dense Vector + 0.35 Keyword Token Match)
        scored_results: List[RagRetrievalResult] = []
        for r in raw_results:
            dense_score = r["similarity_score"]
            text = r["content"]
            sparse_score = self._compute_keyword_overlap(query, text)

            hybrid_score = round((dense_score * 0.65) + (sparse_score * 0.35), 4)

            if hybrid_score >= min_similarity or dense_score >= 0.4:
                meta = r.get("metadata", {})
                scored_results.append(
                    RagRetrievalResult(
                        chunk_id=r["chunk_id"],
                        document_name=meta.get("document_name", "Technical Documentation"),
                        category=meta.get("category", "General"),
                        topic=meta.get("topic", "Security"),
                        content=text,
                        similarity_score=hybrid_score,
                        source=meta.get("source", "Knowledge Base"),
                        metadata=meta,
                    )
                )

        # Sort descending by hybrid similarity score
        scored_results.sort(key=lambda x: x.similarity_score, reverse=True)
        return scored_results[:top_k]


retriever = HybridRetriever()
