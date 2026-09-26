import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.interviewer_service import interviewer_service
from app.services.evaluation_service import evaluation_service

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "whisper_ready" in data


def test_create_interview_session():
    payload = {
        "mode": "cybersecurity",
        "difficulty": "advanced",
        "duration_minutes": 15,
        "ai_personality": "socratic",
        "target_topic": "Lateral Movement Investigation",
    }
    response = client.post("/api/interview/session", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["mode"] == "cybersecurity"
    assert data["difficulty"] == "advanced"
    assert "question_text" in data
    assert len(data["expected_concepts"]) > 0


def test_submit_answer_and_followup():
    # 1. Create session
    start_payload = {
        "mode": "cybersecurity",
        "difficulty": "advanced",
        "duration_minutes": 15,
        "ai_personality": "socratic",
    }
    start_res = client.post("/api/interview/session", json=start_payload)
    assert start_res.status_code == 200
    session_id = start_res.json()["session_id"]
    question_id = start_res.json()["question_id"]

    # 2. Submit answer
    answer_payload = {
        "question_id": question_id,
        "answer": "I would analyze centralized SIEM logs for Windows Event ID 4624 Logon Type 3 and inspect parent-child process relationships in EDR telemetry.",
        "duration_seconds": 35.0,
    }
    answer_res = client.post(f"/api/interview/{session_id}/answer", json=answer_payload)
    assert answer_res.status_code == 200
    data = answer_res.json()

    assert "evaluation" in data
    assert data["evaluation"]["overall"] > 50
    assert "next_action" in data
    assert "next_question" in data
    assert data["session_id"] == session_id


def test_empty_answer_validation():
    start_res = client.post("/api/interview/session", json={"mode": "technical"})
    session_id = start_res.json()["session_id"]

    res = client.post(
        f"/api/interview/{session_id}/answer",
        json={"question_id": "q-01", "answer": "   "},
    )
    assert res.status_code == 400


def test_difficulty_controller():
    # Score 90 -> escalate
    new_diff, reason = interviewer_service.adjust_difficulty("intermediate", 90.0)
    assert new_diff == "advanced"

    # Score 40 -> de-escalate
    new_diff2, reason2 = interviewer_service.adjust_difficulty("advanced", 40.0)
    assert new_diff2 == "intermediate"

    # Score 80 -> maintain
    new_diff3, reason3 = interviewer_service.adjust_difficulty("advanced", 80.0)
    assert new_diff3 == "advanced"


def test_filler_word_detection():
    text = "Um, I would basically check the server, like, right now, you know?"
    fillers = evaluation_service.detect_filler_words(text)
    assert "um" in fillers
    assert "basically" in fillers
    assert "like" in fillers
    assert "you know" in fillers


def test_record_vision_summary():
    start_res = client.post("/api/interview/session", json={"mode": "cybersecurity"})
    session_id = start_res.json()["session_id"]
    question_id = start_res.json()["question_id"]

    vision_payload = {
        "question_id": question_id,
        "camera_engagement": 88.5,
        "posture_consistency": 91.0,
        "face_presence_rate": 98.0,
        "frame_quality": 92.0,
        "lighting_quality": 89.0,
        "dominant_posture_state": "GOOD_ALIGNMENT",
        "observations": ["Consistent forward camera engagement maintained."],
    }
    res = client.post(f"/api/interview/{session_id}/vision-summary", json=vision_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["summary_recorded"] is True
    assert data["session_id"] == session_id


@pytest.mark.anyio
async def test_fact_check_service():
    from app.factcheck.service import fact_check_service

    text = "We monitor Windows Event ID 4624 for logon verification and IMDSv2 to prevent SSRF tokens theft."
    claims = fact_check_service.extract_technical_claims(text, max_claims=3)
    assert len(claims) >= 1
    assert any("4624" in c or "imds" in c.lower() for c in claims)

    res = await fact_check_service.verify_claim("Windows Event ID 4624")
    assert res.verdict == "SUPPORTED"
    assert len(res.sources) > 0
    assert "learn.microsoft.com" in res.sources[0].url

    # Test cache
    cached_res = await fact_check_service.verify_claim("Windows Event ID 4624")
    assert cached_res.cached is True


def test_debate_flow():
    # 1. Start debate
    start_payload = {
        "topic": "Should organizations move entirely to passwordless authentication?",
        "candidate_stance": "FOR",
        "max_rounds": 4,
    }
    start_res = client.post("/api/debate/start", json=start_payload)
    assert start_res.status_code == 200
    data = start_res.json()
    assert "session_id" in data
    assert data["candidate_stance"] == "FOR"
    assert data["ai_stance"] == "AGAINST"
    assert "ai_opening_statement" in data
    session_id = data["session_id"]

    # 2. Turn 1
    turn_res = client.post(
        f"/api/debate/{session_id}/turn",
        json={"candidate_speech": "Passwordless eliminates credential stuffing and phishing attacks against passwords."},
    )
    assert turn_res.status_code == 200
    turn_data = turn_res.json()
    assert "ai_rebuttal" in turn_data
    assert "counterargument_focus" in turn_data
    assert turn_data["round_number"] == 1
    assert turn_data["is_completed"] is False


