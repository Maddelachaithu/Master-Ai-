import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "MASTER AI Backend")
    VERSION: str = os.getenv("VERSION", "2.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    API_PREFIX: str = "/api"

    # Server Binding
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "")
    ALLOWED_ORIGINS: list[str] = list(
        {
            FRONTEND_URL,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            *[orig.strip() for orig in CORS_ORIGINS_RAW.split(",") if orig.strip()],
        }
    )

    # Whisper STT Settings
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "small")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE_TYPE: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "").lower()
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "")

    # Multi-Agent & Fact-Checking Settings
    FACT_CHECK_PROVIDER: str = os.getenv("FACT_CHECK_PROVIDER", "mock").lower()
    MAX_CLAIMS_PER_ANSWER: int = int(os.getenv("MAX_CLAIMS_PER_ANSWER", "3"))
    DEBATE_MAX_ROUNDS: int = int(os.getenv("DEBATE_MAX_ROUNDS", "6"))

    # Stage 5: Database & Persistence
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/master_ai.db")

    # Stage 5: RAG & Vector Store Settings
    CHROMA_PERSIST_DIR: Path = Path(
        os.getenv("CHROMA_PERSIST_DIR", str(Path(__file__).resolve().parent.parent / "data" / "chroma"))
    )
    CHROMA_COLLECTION: str = os.getenv("CHROMA_COLLECTION", "master_ai_knowledge")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    RAG_CHUNK_SIZE: int = int(os.getenv("RAG_CHUNK_SIZE", "700"))
    RAG_CHUNK_OVERLAP: int = int(os.getenv("RAG_CHUNK_OVERLAP", "100"))
    DOCUMENTS_DIR: Path = Path(__file__).resolve().parent.parent / "documents"

    # Storage & Limits
    TEMP_AUDIO_DIR: Path = Path(__file__).resolve().parent.parent / "temp_audio"
    DATA_DIR: Path = Path(__file__).resolve().parent.parent / "data"
    MAX_AUDIO_SIZE_BYTES: int = 25 * 1024 * 1024  # 25MB


settings = Settings()
settings.TEMP_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
settings.DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
