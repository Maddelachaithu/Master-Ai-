import re
import hashlib
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.llm_service import llm_service
from app.rag.rag_pipeline import rag_pipeline

logger = logging.getLogger("master_ai.profile.question_strategy")


class GeneratedPersonalizedQuestion(BaseModel):
    id: str
    question_text: str
    topic: str
    subtopic: str
    difficulty: str
    expected_concepts: List[str]
    adversarial_traps: List[str]
    rationale: str
    rag_sources: List[Dict[str, str]] = Field(default_factory=list)
    is_resume_tailored: bool = False
    fingerprint: str = ""


class QuestionStrategyEngine:
    def __init__(self):
        self._asked_fingerprints: set = set()

    @staticmethod
    def compute_fingerprint(text: str) -> str:
        clean = re.sub(r"[^\w\s]", "", text.lower())
        norm = " ".join(clean.split())
        return hashlib.sha256(norm.encode("utf-8")).hexdigest()[:16]

    async def generate_personalized_question(
        self,
        candidate_name: str,
        target_role: str,
        candidate_skills: List[str],
        candidate_projects: List[Dict[str, Any]],
        skill_gaps: List[str],
        current_difficulty: str = "advanced",
        turn_number: int = 1,
    ) -> GeneratedPersonalizedQuestion:
        # 1. Determine priority focus area
        focus_topic = skill_gaps[0] if skill_gaps else "Lateral Movement & Threat Detection"
        
        # Check if candidate has a relevant resume project
        matching_project = None
        if candidate_projects:
            for proj in candidate_projects:
                p_title = proj.get("title", "")
                if any(kw in p_title.lower() for kw in ["phishing", "detector", "siem", "scanner", "vuln", "zero trust"]):
                    matching_project = proj
                    break

        # 2. Retrieve authoritative RAG context
        rag_context = await rag_pipeline.get_grounded_context(
            query=f"{target_role} {focus_topic} incident response architecture",
            top_k=3,
        )

        # 3. Generate tailored question via LLM or deterministic template
        if llm_service.is_available():
            prompt = f"""
            You are the MASTER AI Personalized Question Engine.
            Candidate: {candidate_name}
            Target Role: {target_role}
            Current Difficulty: {current_difficulty} (Turn #{turn_number})
            Target Skill Gap: {focus_topic}
            Candidate Resume Project: {matching_project.get('title') if matching_project else 'None'}
            
            Retrieved Authoritative RAG Context:
            {rag_context.evidence_summary}

            Formulate a technical, scenario-based interview question.
            Requirements:
            1. If candidate has a resume project ({matching_project.get('title') if matching_project else 'None'}), anchor question in their technical implementation architecture.
            2. Ground question in real-world enterprise telemetry artifacts.
            3. Provide expected core concepts and subtle adversarial traps.

            Return JSON:
            {{
                "question_text": "...",
                "topic": "{focus_topic}",
                "subtopic": "...",
                "expected_concepts": ["...", "..."],
                "adversarial_traps": ["...", "..."],
                "rationale": "Why this question tests candidate's specific profile and role gap."
            }}
            """
            try:
                res = await llm_service.generate_json(prompt, system_instruction="You are the MASTER AI Question Strategy Engine.")
                if res and "question_text" in res:
                    q_text = res["question_text"]
                    fp = self.compute_fingerprint(q_text)
                    self._asked_fingerprints.add(fp)
                    return GeneratedPersonalizedQuestion(
                        id=f"gen_q_{fp}",
                        question_text=q_text,
                        topic=res.get("topic", focus_topic),
                        subtopic=res.get("subtopic", "Technical Architecture"),
                        difficulty=current_difficulty,
                        expected_concepts=res.get("expected_concepts", ["Event Logs", "Kerberos", "SIEM"]),
                        adversarial_traps=res.get("adversarial_traps", ["perimeter only", "firewall alone"]),
                        rationale=res.get("rationale", f"Tailored to {target_role} role gap: {focus_topic}"),
                        rag_sources=rag_context.sources,
                        is_resume_tailored=bool(matching_project),
                        fingerprint=fp,
                    )
            except Exception as e:
                logger.warning(f"LLM question generation failed ({e}), falling back to deterministic template.")

        # Deterministic Template Fallback
        if matching_project and "phishing" in matching_project.get("title", "").lower():
            q_text = (
                f"You mentioned building an '{matching_project['title']}'. "
                "How did you engineer features to distinguish targeted spear-phishing from benign transactional emails, "
                "and how did you minimize false positives in a live enterprise mailbox pipeline?"
            )
            is_proj = True
        elif "kerberos" in focus_topic.lower() or "active directory" in focus_topic.lower():
            q_text = (
                "When investigating potential Pass-the-Ticket lateral movement in Active Directory, "
                "what telemetry indicators in LSASS process memory and Windows Event ID 4624/4672 confirm unauthorized ticket reuse?"
            )
            is_proj = False
        else:
            q_text = (
                f"In your target role as a {target_role}, suppose an attacker bypasses perimeter controls and moves laterally. "
                "What combination of endpoint telemetry and authentication logs would you correlate to isolate the session timeline?"
            )
            is_proj = False

        fp = self.compute_fingerprint(q_text)
        self._asked_fingerprints.add(fp)

        return GeneratedPersonalizedQuestion(
            id=f"gen_q_{fp}",
            question_text=q_text,
            topic=focus_topic,
            subtopic="Forensic Telemetry & Correlation",
            difficulty=current_difficulty,
            expected_concepts=["Windows Event Logs", "Kerberos TGT/TGS", "LSASS Memory", "SIEM Correlation"],
            adversarial_traps=["firewall logs alone", "perimeter only"],
            rationale=f"Targeting candidate skill gap '{focus_topic}' aligned with {target_role} competencies.",
            rag_sources=rag_context.sources,
            is_resume_tailored=is_proj,
            fingerprint=fp,
        )


question_strategy = QuestionStrategyEngine()
