import logging
from typing import Optional, Dict, Any, List
from app.rag.retriever import retriever
from app.rag.reranker import reranker
from app.rag.metadata import RagContextResponse, RagRetrievalResult
from app.services.llm_service import llm_service

logger = logging.getLogger("master_ai.rag.pipeline")


class RagPipeline:
    """
    RAG Pipeline: Executes Hybrid Retrieval, Lightweight Reranking, Evidence Synthesis,
    Source Attribution, and Evidence Confidence Calculation.
    """

    def __init__(self):
        self.retriever = retriever
        self.reranker = reranker

    async def get_grounded_context(
        self,
        query: str,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        role: Optional[str] = None,
        top_k: int = 4,
    ) -> RagContextResponse:
        """
        Retrieve and ground context for interview question generation or answer evaluation.
        """
        if not query.strip():
            return RagContextResponse(
                query=query,
                retrieved_chunks=[],
                evidence_summary="Query was empty; no retrieval performed.",
                sources=[],
                confidence=0.0,
                grounded=False,
            )

        # 1. Retrieve candidates
        candidates = await self.retriever.retrieve(
            query=query,
            category=category,
            topic=topic,
            role=role,
            top_k=top_k * 2,
        )

        # 2. Rerank
        top_chunks = self.reranker.rerank(query, candidates, top_k=top_k)

        # 3. Handle Empty / Low Confidence Case
        if not top_chunks:
            return RagContextResponse(
                query=query,
                retrieved_chunks=[],
                evidence_summary="No specific authoritative documentation matched this query in the local knowledge base.",
                sources=[],
                confidence=0.0,
                grounded=False,
            )

        # 4. Extract unique verifiable sources
        sources: List[Dict[str, str]] = []
        seen_sources = set()
        for chunk in top_chunks:
            doc_name = chunk.document_name
            src = chunk.source
            if doc_name not in seen_sources:
                seen_sources.add(doc_name)
                sources.append({
                    "title": doc_name,
                    "source": src,
                    "category": chunk.category,
                })

        # 5. Build Evidence Summary
        evidence_snippets = [
            f"[{c.document_name} - {c.topic}]: {c.content}" for c in top_chunks[:3]
        ]
        evidence_summary = "\n---\n".join(evidence_snippets)

        # 6. Calculate Evidence Confidence (0 - 100)
        # Based on average top chunk similarity scores and source authority
        avg_score = sum(c.similarity_score for c in top_chunks) / len(top_chunks)
        confidence = round(min(98.0, max(20.0, avg_score * 100.0)), 1)

        return RagContextResponse(
            query=query,
            retrieved_chunks=top_chunks,
            evidence_summary=evidence_summary,
            sources=sources,
            confidence=confidence,
            grounded=True,
        )


rag_pipeline = RagPipeline()
