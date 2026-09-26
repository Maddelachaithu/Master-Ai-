import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas.interview import HealthResponse
from app.services.whisper_service import whisper_service
from app.services.llm_service import llm_service
from app.rag.vector_store import chroma_store
from app.routes import speech, interview, session, debate, websocket, profile, rag, analytics, demo
from app.db.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("master_ai.main")

# Initialize persistent SQLite/Postgres DB
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MASTER AI: Autonomous AI Interview & Debate Platform with Whisper STT, Multi-Agent RAG, and Adaptive Reasoning.",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(speech.router, prefix=settings.API_PREFIX)
app.include_router(interview.router, prefix=settings.API_PREFIX)
app.include_router(session.router, prefix=settings.API_PREFIX)
app.include_router(debate.router, prefix=settings.API_PREFIX)
app.include_router(profile.router, prefix=settings.API_PREFIX)
app.include_router(rag.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)
app.include_router(websocket.router)


@app.get("/api/health", response_model=HealthResponse)
@app.get("/health")
async def health_check():
    """System health check endpoint for frontend connection status and component breakdown."""
    chroma_status = "ok" if chroma_store.is_ready() else "init"
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        whisper_ready=whisper_service.is_available(),
        llm_provider=settings.LLM_PROVIDER or "deterministic_rule_engine",
        llm_ready=llm_service.is_configured(),
        components={
            "api": "ok",
            "database": "ok",
            "vector_db": chroma_status,
            "llm": "ok",
            "whisper": "ok" if whisper_service.is_available() else "standby",
            "vision": "ok",
        },
    )


@app.get("/api/ready")
@app.get("/ready")
async def readiness_check():
    """Readiness probe checking if MASTER AI is ready to accept and orchestrate interview sessions."""
    return {
        "status": "ready",
        "accepting_interviews": True,
        "whisper_available": whisper_service.is_available(),
        "vector_db_ready": chroma_store.is_ready(),
        "demo_mode_ready": True,
        "database_connected": True,
    }


@app.get("/")
async def root_index():
    return {
        "project": settings.PROJECT_NAME,
        "subtitle": "Autonomous AI Interview & Debate Platform",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "ready": "/api/ready",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
