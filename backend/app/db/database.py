import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("master_ai.db")

db_url = settings.DATABASE_URL

# Normalize sqlite path for Windows if using relative sqlite URL
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the persistent database."""
    try:
        # Import models so they are registered with Base.metadata
        from app.db import models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info(f"Database initialized successfully with URL schema: {db_url.split('://')[0]}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)
