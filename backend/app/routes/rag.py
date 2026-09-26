import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.rag.rag_pipeline import rag_pipeline
from app.rag.vector_store import vector_store
from app.rag.ingest import run_ingestion
from app.rag.document_loader import document_loader

logger = logging.getLogger("master_ai.routes.rag")
router = APIRouter(prefix="/rag", tags=["RAG Knowledge Engine"])


class RagSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    topic: Optional[str] = None
    role: Optional[str] = None
    top_k: int = Field(default=4, ge=1, le=10)


class IngestionRequest(BaseModel):
    force_reindex: bool = False


@router.post("/search")
async def search_knowledge_base(req: RagSearchRequest):
    try:
        context_res = await rag_pipeline.get_grounded_context(
            query=req.query,
            category=req.category,
            topic=req.topic,
            role=req.role,
            top_k=req.top_k,
        )
        return context_res.model_dump()
    except Exception as e:
        logger.error(f"RAG search error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest")
async def trigger_ingestion(req: IngestionRequest = IngestionRequest()):
    try:
        summary = run_ingestion(force_reindex=req.force_reindex)
        return summary
    except Exception as e:
        logger.error(f"Ingestion error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_rag_status():
    stats = vector_store.get_stats()
    return {
        "vector_store": stats,
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "supported_categories": ["cybersecurity", "cloud", "networking", "linux", "incident_response", "web_security"],
        "is_ready": stats.get("total_chunks", 0) > 0,
    }


@router.get("/documents")
async def list_documents():
    docs = document_loader.scan_documents()
    return {
        "total_documents": len(docs),
        "documents": [
            {
                "document_id": d["document_id"],
                "document_name": d["document_name"],
                "category": d["category"],
                "topic": d["topic"],
                "source": d["source"],
                "pages_count": len(d["pages"]),
            }
            for d in docs
        ],
    }
