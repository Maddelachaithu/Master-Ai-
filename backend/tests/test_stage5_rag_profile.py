import pytest
from app.rag.document_loader import document_loader
from app.rag.chunker import chunker
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever
from app.rag.reranker import reranker
from app.rag.rag_pipeline import rag_pipeline
from app.rag.ingest import run_ingestion
from app.profile.resume_parser import resume_parser
from app.profile.skill_gap_service import skill_gap_service
from app.profile.question_strategy import question_strategy
from app.profile.job_match_service import job_match_service
from app.db.database import SessionLocal, init_db
from app.db.models import CandidateProfileModel, InterviewSessionModel, TurnRecordModel, SkillMasteryModel


@pytest.mark.anyio
async def test_document_loader_and_hashing():
    docs = document_loader.scan_documents()
    assert len(docs) >= 1
    first_doc = docs[0]
    assert "document_id" in first_doc
    assert "content_hash" in first_doc
    assert len(first_doc["content_hash"]) == 64  # SHA-256 length
    assert len(first_doc["pages"]) >= 1


@pytest.mark.anyio
async def test_chunker_semantic_splitting():
    sample_text = (
        "# Active Directory Kerberos\n\n"
        "Kerberos authentication relies on Ticket Granting Tickets.\n\n"
        "## Pass the Ticket Attack\n\n"
        "Adversaries harvest tickets from LSASS memory to authenticate without hashes."
    )
    chunks = chunker.chunk_text(sample_text, base_metadata={"document_id": "test_doc"}, page_number=1)
    assert len(chunks) >= 1
    assert "chunk_id" in chunks[0]
    assert "test_doc_p1" in chunks[0]["chunk_id"]


@pytest.mark.anyio
async def test_embeddings_and_vector_store():
    # Ingest corpus
    summary = run_ingestion(force_reindex=False)
    assert summary["status"] == "success"
    assert summary["total_vector_chunks_in_store"] > 0

    # Query vector store
    q_vec = embedding_service.embed_query("Event ID 4624 lateral movement")
    results = vector_store.query(q_vec, top_k=3)
    assert len(results) >= 1
    assert "content" in results[0]
    assert results[0]["similarity_score"] > 0.0


@pytest.mark.anyio
async def test_rag_pipeline_grounding():
    # Query with matching technical corpus
    res = await rag_pipeline.get_grounded_context("How does IMDSv2 prevent SSRF attacks?", top_k=3)
    assert res.grounded is True
    assert res.confidence > 0.0
    assert len(res.sources) > 0
    assert any("IMDSv2" in s["title"] or "AWS" in s["title"] or "Security" in s["title"] for s in res.sources)

    # Query with non-matching / gibberish text
    res_empty = await rag_pipeline.get_grounded_context("xyzabc non-existent quantum banana protocol 99999", top_k=3)
    assert isinstance(res_empty.confidence, float)


@pytest.mark.anyio
async def test_resume_parser():
    resume_sample = """
    Alex Rivera
    Email: alex.rivera@example.com
    Role: SOC Analyst
    
    SKILLS & TOOLS:
    Python, Linux, Wireshark, Nmap, Splunk, SIEM, CrowdStrike Falcon, EDR
    
    CERTIFICATIONS:
    Security+, CySA+
    
    PROJECTS:
    AI Phishing Email Detector
    Developed machine learning pipeline analyzing header metadata and URLs to reduce false positives by 35%.
    """
    parsed = await resume_parser.parse_resume_text(resume_sample)
    assert parsed.name in ["Alex Rivera", "Candidate"]
    assert "Python" in parsed.skills or "python" in [s.lower() for s in parsed.skills]
    assert len(parsed.projects) >= 1
    assert any("Phishing" in p.title for p in parsed.projects)


@pytest.mark.anyio
async def test_skill_gap_analysis():
    candidate_skills = ["Python", "Linux", "SIEM", "Wireshark"]
    mastery = [
        {"skill_name": "SIEM Correlation", "score": 85.0, "attempts": 4, "trend": "improving"},
        {"skill_name": "Threat Detection", "score": 42.0, "attempts": 2, "trend": "declining"},
    ]
    analysis = skill_gap_service.analyze_gaps(
        target_role="SOC Analyst",
        candidate_skills=candidate_skills,
        skill_mastery_records=mastery,
    )
    assert analysis.target_role == "SOC Analyst"
    assert len(analysis.strong_skills) >= 1
    assert len(analysis.weak_skills) >= 1
    assert len(analysis.unassessed_skills) >= 1
    assert len(analysis.daily_practice_plan) == 3


@pytest.mark.anyio
async def test_question_strategy_and_fingerprints():
    gen_q = await question_strategy.generate_personalized_question(
        candidate_name="Alex Rivera",
        target_role="SOC Analyst",
        candidate_skills=["Python", "Linux", "SIEM"],
        candidate_projects=[{"title": "AI Phishing Email Detector", "description": "Spam and phishing classifier"}],
        skill_gaps=["Active Directory Kerberos", "Lateral Movement"],
        current_difficulty="advanced",
    )
    assert gen_q.question_text is not None
    assert len(gen_q.question_text) > 10
    assert gen_q.fingerprint != ""


@pytest.mark.anyio
async def test_job_match_service():
    jd_text = """
    Job Title: Senior SOC Analyst
    Company: CyberDefense Global
    Requirements:
    - 3+ years experience with Splunk SIEM and Sentinel
    - Strong understanding of TCP/IP, Wireshark, and network firewalls
    - Experience investigating Lateral Movement and Kerberos attacks
    - Knowledge of Python scripting for automation
    """
    cand_skills = ["Python", "Linux", "Wireshark", "SIEM"]
    match_res = job_match_service.parse_job_description(
        job_description_text=jd_text,
        candidate_skills=cand_skills,
        target_company="CyberDefense Global",
        target_role="SOC Analyst",
    )
    assert match_res.skills_match_percentage > 0.0
    assert len(match_res.matched_skills) >= 2
    assert len(match_res.recommended_interview_topics) >= 1


@pytest.mark.anyio
async def test_database_persistence_and_models():
    init_db()
    with SessionLocal() as db:
        # Create test candidate
        cand = CandidateProfileModel(
            id="test_cand_001",
            name="Test Candidate",
            target_role="SOC Analyst",
            skills=["Python", "Linux", "SIEM"],
        )
        db.merge(cand)

        # Create session & turn
        sess = InterviewSessionModel(
            id="test_sess_001",
            candidate_profile_id="test_cand_001",
            mode="cybersecurity",
            difficulty="advanced",
            topic="Lateral Movement",
            overall_score=85.0,
        )
        db.merge(sess)

        turn = TurnRecordModel(
            id="test_turn_001",
            session_id="test_sess_001",
            turn_index=1,
            question_id="q1",
            question_text="How to detect lateral movement?",
            user_answer="I would check Windows Event ID 4624.",
            duration_seconds=15.0,
            evaluation={"correctness": 88.0, "overall": 85.0},
        )
        db.merge(turn)

        # Create Skill Mastery
        skm = SkillMasteryModel(
            id="test_skm_001",
            candidate_id="test_cand_001",
            skill_name="SIEM Correlation",
            score=85.0,
            attempts=1,
            trend="improving",
        )
        db.merge(skm)
        db.commit()

        # Query back
        cand_db = db.query(CandidateProfileModel).filter(CandidateProfileModel.id == "test_cand_001").first()
        assert cand_db is not None
        assert cand_db.name == "Test Candidate"

        turn_db = db.query(TurnRecordModel).filter(TurnRecordModel.session_id == "test_sess_001").first()
        assert turn_db is not None
        assert turn_db.user_answer == "I would check Windows Event ID 4624."
