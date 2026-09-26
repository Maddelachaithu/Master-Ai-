import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class CandidateProfileModel(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String(64), primary_key=True, default=lambda: f"cand_{uuid.uuid4().hex[:12]}")
    name = Column(String(128), default="Candidate")
    email = Column(String(128), nullable=True)
    target_role = Column(String(128), default="SOC Analyst")
    target_company = Column(String(128), nullable=True)
    experience_level = Column(String(64), default="Mid-Level")
    skills = Column(JSON, default=list)
    weak_skills = Column(JSON, default=list)
    strong_skills = Column(JSON, default=list)
    target_companies = Column(JSON, default=list)
    preferred_topics = Column(JSON, default=list)
    resume_text = Column(Text, nullable=True)
    resume_parsed_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    sessions = relationship("InterviewSessionModel", back_populates="candidate", cascade="all, delete-orphan")
    skill_masteries = relationship("SkillMasteryModel", back_populates="candidate", cascade="all, delete-orphan")


class InterviewSessionModel(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(64), primary_key=True)
    candidate_profile_id = Column(String(64), ForeignKey("candidate_profiles.id"), nullable=True)
    mode = Column(String(64), default="cybersecurity")
    difficulty = Column(String(64), default="advanced")
    duration_minutes = Column(Integer, default=15)
    ai_personality = Column(String(64), default="socratic")
    topic = Column(String(256), default="Threat Hunting & Investigation")
    pressure_level = Column(Integer, default=3)
    is_completed = Column(Boolean, default=False)
    overall_score = Column(Float, default=0.0)
    summary_report = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    completed_at = Column(DateTime, nullable=True)

    candidate = relationship("CandidateProfileModel", back_populates="sessions")
    turns = relationship("TurnRecordModel", back_populates="session", cascade="all, delete-orphan")


class TurnRecordModel(Base):
    __tablename__ = "interview_turns"

    id = Column(String(64), primary_key=True, default=lambda: f"turn_{uuid.uuid4().hex[:12]}")
    session_id = Column(String(64), ForeignKey("interview_sessions.id"))
    turn_index = Column(Integer, default=0)
    question_id = Column(String(128))
    question_text = Column(Text)
    user_answer = Column(Text)
    duration_seconds = Column(Float, default=0.0)
    evaluation = Column(JSON, default=dict)
    fact_check_results = Column(JSON, default=list)
    challenge_details = Column(JSON, nullable=True)
    events_log = Column(JSON, default=list)
    vision_summary = Column(JSON, nullable=True)
    voice_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    session = relationship("InterviewSessionModel", back_populates="turns")


class SkillMasteryModel(Base):
    __tablename__ = "skill_mastery"

    id = Column(String(64), primary_key=True, default=lambda: f"skm_{uuid.uuid4().hex[:12]}")
    candidate_id = Column(String(64), ForeignKey("candidate_profiles.id"))
    skill_name = Column(String(128))
    category = Column(String(128), default="Technical")
    score = Column(Float, default=50.0)
    attempts = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    weak_areas = Column(JSON, default=list)
    trend = Column(String(32), default="steady")  # improving, steady, declining
    confidence = Column(Float, default=0.5)
    last_practiced_at = Column(DateTime, default=get_utc_now)

    candidate = relationship("CandidateProfileModel", back_populates="skill_masteries")


class DebateSessionModel(Base):
    __tablename__ = "debate_sessions"

    session_id = Column(String(64), primary_key=True)
    candidate_id = Column(String(64), ForeignKey("candidate_profiles.id"), nullable=True)
    topic = Column(String(256))
    candidate_stance = Column(String(16))  # FOR / AGAINST
    ai_stance = Column(String(16))
    rounds_data = Column(JSON, default=list)
    scores_data = Column(JSON, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)


class RagQueryLogModel(Base):
    __tablename__ = "rag_query_logs"

    id = Column(String(64), primary_key=True, default=lambda: f"rag_{uuid.uuid4().hex[:12]}")
    session_id = Column(String(64), nullable=True)
    query = Column(Text)
    retrieved_chunks = Column(JSON, default=list)
    evidence_summary = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    grounded = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
