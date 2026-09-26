import re
import logging
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.profile.resume_parser import resume_parser

logger = logging.getLogger("master_ai.profile.job_match")


class JobMatchAnalysis(BaseModel):
    target_company: str
    target_role: str
    job_title: str
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    partially_matched_skills: List[str] = Field(default_factory=list)
    recommended_interview_topics: List[str] = Field(default_factory=list)
    skills_match_percentage: float = 0.0
    extracted_requirements: List[str] = Field(default_factory=list)


class JobMatchService:
    def parse_job_description(
        self,
        job_description_text: str,
        candidate_skills: List[str],
        candidate_projects: List[Dict[str, Any]] = None,
        target_company: str = "Target Company",
        target_role: str = "SOC Analyst",
    ) -> JobMatchAnalysis:
        if not job_description_text.strip():
            return JobMatchAnalysis(
                target_company=target_company,
                target_role=target_role,
                job_title=target_role,
                skills_match_percentage=0.0,
            )

        lower_jd = job_description_text.lower()
        cand_skills_lower = {s.lower() for s in candidate_skills}

        # Extract required skills from JD using known corpus
        required_skills: List[str] = []
        for sk in resume_parser.KNOWN_SKILLS_CORPUS:
            if re.search(rf"\b{re.escape(sk)}\b", lower_jd):
                required_skills.append(sk.title())

        # Extract requirements snippets
        req_lines = [
            line.strip().lstrip("-*• ")
            for line in job_description_text.splitlines()
            if any(kw in line.lower() for kw in ["experience", "proficien", "knowledge of", "must have", "responsible for", "skills"])
            and len(line.strip()) > 15
        ]

        matched: List[str] = []
        missing: List[str] = []
        partial: List[str] = []

        for req in required_skills:
            req_l = req.lower()
            if req_l in cand_skills_lower:
                matched.append(req)
            elif any(req_l in cs or cs in req_l for cs in cand_skills_lower):
                partial.append(req)
            else:
                missing.append(req)

        total_reqs = len(required_skills)
        if total_reqs > 0:
            match_pct = round(((len(matched) + (len(partial) * 0.5)) / total_reqs) * 100.0, 1)
        else:
            match_pct = 75.0

        # Formulate tailored interview topics
        topics = []
        for miss in missing[:3]:
            topics.append(f"{miss} Implementation & Trade-offs")
        for m in matched[:2]:
            topics.append(f"{m} Architecture Deep Dive")

        return JobMatchAnalysis(
            target_company=target_company,
            target_role=target_role,
            job_title=target_role,
            matched_skills=matched,
            missing_skills=missing,
            partially_matched_skills=partial,
            recommended_interview_topics=topics if topics else ["Incident Response", "Network Telemetry", "Threat Hunting"],
            skills_match_percentage=match_pct,
            extracted_requirements=req_lines[:6],
        )


job_match_service = JobMatchService()
