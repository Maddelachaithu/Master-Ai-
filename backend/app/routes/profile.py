import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import CandidateProfileModel, SkillMasteryModel
from app.profile.resume_parser import resume_parser, ParsedResumeData
from app.profile.skill_gap_service import skill_gap_service, SkillGapAnalysis
from app.profile.job_match_service import job_match_service, JobMatchAnalysis
from app.profile.role_matrix import get_role_profile

from app.utils.security import validate_file_upload, sanitize_filename

logger = logging.getLogger("master_ai.routes.profile")
router = APIRouter(prefix="/profile", tags=["Profile & Personalization"])


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    target_role: Optional[str] = "SOC Analyst"
    target_company: Optional[str] = None
    experience_level: Optional[str] = "Mid-Level"
    skills: Optional[List[str]] = None
    target_companies: Optional[List[str]] = None
    preferred_topics: Optional[List[str]] = None


class JobDescriptionRequest(BaseModel):
    job_description: str
    target_company: Optional[str] = "Target Company"
    target_role: Optional[str] = "SOC Analyst"


def get_or_create_default_profile(db: Session) -> CandidateProfileModel:
    profile = db.query(CandidateProfileModel).first()
    if not profile:
        profile = CandidateProfileModel(
            id="default_candidate",
            name="Alex Rivera",
            email="alex.rivera@example.com",
            target_role="SOC Analyst",
            target_company="Enterprise Security Corp",
            experience_level="Mid-Level",
            skills=["Python", "Linux", "SIEM", "Wireshark", "Network Security", "Threat Hunting", "Kerberos"],
            weak_skills=["Active Directory Kerberos", "Host Memory Forensics"],
            strong_skills=["SIEM Correlation", "Log Analysis", "Network Security"],
            target_companies=["CrowdStrike", "Mandiant", "Microsoft Security"],
            preferred_topics=["Threat Hunting", "Lateral Movement", "Zero Trust"],
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("")
async def get_profile(db: Session = Depends(get_db)):
    profile = get_or_create_default_profile(db)
    
    # Calculate profile completeness score (0 - 100)
    score = 0
    if profile.name and profile.name != "UNKNOWN": score += 15
    if profile.target_role: score += 20
    if profile.skills and len(profile.skills) > 0: score += 25
    if profile.resume_text: score += 20
    if profile.target_company: score += 10
    if profile.preferred_topics and len(profile.preferred_topics) > 0: score += 10
    completeness = min(100, score)

    return {
        "id": profile.id,
        "name": profile.name,
        "email": profile.email,
        "target_role": profile.target_role,
        "target_company": profile.target_company,
        "experience_level": profile.experience_level,
        "skills": profile.skills or [],
        "weak_skills": profile.weak_skills or [],
        "strong_skills": profile.strong_skills or [],
        "target_companies": profile.target_companies or [],
        "preferred_topics": profile.preferred_topics or [],
        "resume_parsed_data": profile.resume_parsed_data or {},
        "has_resume": bool(profile.resume_text),
        "profile_completeness": completeness,
        "created_at": profile.created_at.isoformat() if profile.created_at else None,
    }


@router.post("")
async def update_profile(req: ProfileUpdateRequest, db: Session = Depends(get_db)):
    profile = get_or_create_default_profile(db)
    if req.name is not None: profile.name = req.name
    if req.email is not None: profile.email = req.email
    if req.target_role is not None: profile.target_role = req.target_role
    if req.target_company is not None: profile.target_company = req.target_company
    if req.experience_level is not None: profile.experience_level = req.experience_level
    if req.skills is not None: profile.skills = req.skills
    if req.target_companies is not None: profile.target_companies = req.target_companies
    if req.preferred_topics is not None: profile.preferred_topics = req.preferred_topics

    db.commit()
    db.refresh(profile)
    return {"status": "success", "profile": profile.id}


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    profile = get_or_create_default_profile(db)
    safe_filename = sanitize_filename(file.filename or "resume.pdf")
    content = await file.read()

    # Security validation on size and extension
    is_valid, reason = validate_file_upload(content, safe_filename, max_mb=10)
    if not is_valid:
        raise HTTPException(status_code=400, detail=reason)

    try:
        parsed_data = await resume_parser.parse_resume_bytes(content, filename=safe_filename)
    except Exception as e:
        logger.error(f"Error parsing resume: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {e}")

    # Update candidate profile with extracted skills & projects
    if parsed_data.name and parsed_data.name != "UNKNOWN" and parsed_data.name != "Candidate":
        profile.name = parsed_data.name
    if parsed_data.email:
        profile.email = parsed_data.email
    if parsed_data.target_role and parsed_data.target_role != "UNKNOWN":
        profile.target_role = parsed_data.target_role

    combined_skills = list(dict.fromkeys((profile.skills or []) + parsed_data.skills))
    profile.skills = combined_skills
    profile.resume_text = parsed_data.raw_text
    profile.resume_parsed_data = parsed_data.model_dump()

    db.commit()
    db.refresh(profile)

    return {
        "status": "success",
        "parsed_resume": parsed_data.model_dump(),
        "updated_profile_id": profile.id,
    }


@router.post("/job-description")
async def analyze_job_description(
    req: JobDescriptionRequest,
    db: Session = Depends(get_db),
):
    profile = get_or_create_default_profile(db)
    analysis = job_match_service.parse_job_description(
        job_description_text=req.job_description,
        candidate_skills=profile.skills or [],
        candidate_projects=profile.resume_parsed_data.get("projects", []) if profile.resume_parsed_data else [],
        target_company=req.target_company or profile.target_company or "Target Company",
        target_role=req.target_role or profile.target_role or "SOC Analyst",
    )
    return analysis.model_dump()


@router.get("/skills")
async def get_skills_breakdown(db: Session = Depends(get_db)):
    profile = get_or_create_default_profile(db)
    masteries = db.query(SkillMasteryModel).filter(SkillMasteryModel.candidate_id == profile.id).all()
    mastery_dicts = [
        {
            "skill_name": m.skill_name,
            "score": m.score,
            "attempts": m.attempts,
            "trend": m.trend,
            "weak_areas": m.weak_areas or [],
        }
        for m in masteries
    ]

    analysis = skill_gap_service.analyze_gaps(
        target_role=profile.target_role or "SOC Analyst",
        candidate_skills=profile.skills or [],
        skill_mastery_records=mastery_dicts,
    )
    return analysis.model_dump()


@router.delete("")
async def delete_profile_data(db: Session = Depends(get_db)):
    profile = db.query(CandidateProfileModel).first()
    if profile:
        db.delete(profile)
        db.commit()
    return {"status": "success", "message": "Candidate profile data removed."}
