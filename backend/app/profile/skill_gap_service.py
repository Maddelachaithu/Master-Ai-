import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.profile.role_matrix import get_role_profile, RoleCompetencyProfile
from app.profile.skill_graph import skill_graph

logger = logging.getLogger("master_ai.profile.skill_gap")


class SkillStatus(BaseModel):
    name: str
    category: str
    score: float  # 0 - 100
    status: str  # "STRONG" | "MODERATE" | "WEAK" | "UNASSESSED"
    attempts: int = 0
    weak_areas: List[str] = Field(default_factory=list)
    trend: str = "steady"  # "improving" | "steady" | "declining"
    last_practiced: Optional[str] = None


class DailyPracticeItem(BaseModel):
    duration_minutes: int
    topic: str
    focus_area: str
    rationale: str
    recommended_difficulty: str


class SkillGapAnalysis(BaseModel):
    target_role: str
    overall_readiness_score: float  # 0 - 100
    strong_skills: List[SkillStatus] = Field(default_factory=list)
    moderate_skills: List[SkillStatus] = Field(default_factory=list)
    weak_skills: List[SkillStatus] = Field(default_factory=list)
    unassessed_skills: List[SkillStatus] = Field(default_factory=list)
    prioritized_practice_areas: List[str] = Field(default_factory=list)
    daily_practice_plan: List[DailyPracticeItem] = Field(default_factory=list)


class SkillGapService:
    def analyze_gaps(
        self,
        target_role: str,
        candidate_skills: List[str],
        skill_mastery_records: List[Dict[str, Any]] = None,
    ) -> SkillGapAnalysis:
        role_profile = get_role_profile(target_role)
        mastery_map = {m.get("skill_name", "").lower(): m for m in (skill_mastery_records or [])}
        cand_skills_lower = {s.lower() for s in candidate_skills}

        all_required = list(dict.fromkeys(role_profile.core_skills + role_profile.secondary_skills))

        strong: List[SkillStatus] = []
        moderate: List[SkillStatus] = []
        weak: List[SkillStatus] = []
        unassessed: List[SkillStatus] = []

        total_score_sum = 0.0
        assessed_count = 0

        for req_skill in all_required:
            k = req_skill.lower()
            dom = skill_graph.get_domain_for_skill(req_skill)
            category = dom.get("subdomain", "Security Engineering")

            if k in mastery_map:
                record = mastery_map[k]
                score = float(record.get("score", 50.0))
                attempts = int(record.get("attempts", 1))
                trend = record.get("trend", "steady")
                weak_areas = record.get("weak_areas", [])

                total_score_sum += score
                assessed_count += 1

                status_obj = SkillStatus(
                    name=req_skill,
                    category=category,
                    score=round(score, 1),
                    status="STRONG" if score >= 75 else "MODERATE" if score >= 50 else "WEAK",
                    attempts=attempts,
                    weak_areas=weak_areas,
                    trend=trend,
                )

                if score >= 75:
                    strong.append(status_obj)
                elif score >= 50:
                    moderate.append(status_obj)
                else:
                    weak.append(status_obj)
            elif any(cs in k or k in cs for cs in cand_skills_lower):
                # Present on resume but not formally interviewed yet
                status_obj = SkillStatus(
                    name=req_skill,
                    category=category,
                    score=65.0,
                    status="MODERATE",
                    attempts=0,
                    trend="steady",
                    weak_areas=["Resume verified; pending live technical verification"],
                )
                moderate.append(status_obj)
                total_score_sum += 65.0
                assessed_count += 1
            else:
                unassessed.append(
                    SkillStatus(
                        name=req_skill,
                        category=category,
                        score=0.0,
                        status="UNASSESSED",
                        attempts=0,
                        trend="steady",
                        weak_areas=["Not yet assessed in live session"],
                    )
                )

        readiness = round(total_score_sum / max(1, len(all_required)), 1) if all_required else 60.0

        # Build prioritized practice areas
        priorities = []
        for w in weak:
            priorities.append(f"Remediate {w.name} (Current: {w.score}%)")
        for u in unassessed[:3]:
            priorities.append(f"Baseline Assessment: {u.name}")
        for m in moderate[:2]:
            priorities.append(f"Deepen mastery: {m.name}")

        # Build 15-minute daily practice plan
        plan = [
            DailyPracticeItem(
                duration_minutes=5,
                topic=weak[0].name if weak else unassessed[0].name if unassessed else "Lateral Movement",
                focus_area="Core concept identification and telemetry correlation",
                rationale="Targeting highest impact skill gap identified for " + target_role,
                recommended_difficulty="intermediate",
            ),
            DailyPracticeItem(
                duration_minutes=5,
                topic=unassessed[0].name if unassessed else "Active Directory Kerberos",
                focus_area="Adversarial challenge & boundary condition probing",
                rationale="Unassessed core requirement for target role profile",
                recommended_difficulty="advanced",
            ),
            DailyPracticeItem(
                duration_minutes=5,
                topic=moderate[0].name if moderate else "Incident Containment",
                focus_area="Rapid response scenario simulation",
                rationale="Consolidating moderate proficiency into mastery",
                recommended_difficulty="advanced",
            ),
        ]

        return SkillGapAnalysis(
            target_role=target_role,
            overall_readiness_score=readiness,
            strong_skills=strong,
            moderate_skills=moderate,
            weak_skills=weak,
            unassessed_skills=unassessed,
            prioritized_practice_areas=priorities[:5],
            daily_practice_plan=plan,
        )


skill_gap_service = SkillGapService()
