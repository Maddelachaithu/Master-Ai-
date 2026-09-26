import pytest
from app.models.session import SessionState, QuestionModel, ConversationTurn
from app.agents.interviewer_agent import interviewer_agent, InterviewerAgentResponse
from app.agents.challenger_agent import challenger_agent, ChallengeMode, ContradictionResult, ChallengerAgentResponse
from app.agents.fact_checker_agent import fact_checker_agent, FactCheckerAgentResponse
from app.agents.rubric_agent import rubric_agent, RubricAgentResponse
from app.agents.orchestrator import orchestrator, OrchestratedTurnResult, AgentEvent
from app.agents.debate_agent import debate_agent, DebateState, DebateRound
from app.factcheck.service import fact_check_service
from app.factcheck.provider import FactVerdict
from app.schemas.interview import AnswerEvaluation


def create_sample_session() -> SessionState:
    q = QuestionModel(
        id="q1",
        number=1,
        text="How would you detect lateral movement in an enterprise network?",
        category="detection",
        subtopic="lateral-movement",
        difficulty="medium",
        expected_concepts=["Windows Event Logs", "Kerberos", "Pass-the-Hash", "EDR"],
        adversarial_traps=["firewall logs alone", "perimeter only"],
    )
    session = SessionState(
        session_id="test-session-123",
        mode="Cybersecurity Interview",
        difficulty="medium",
        duration_minutes=15,
        ai_personality="challenging",
        topic="Cybersecurity Threat Hunting",
        current_question=q,
        questions_list=[q],
    )
    return session


@pytest.mark.anyio
async def test_interviewer_agent_response_schema():
    session = create_sample_session()
    res = await interviewer_agent.analyze_response(
        session=session,
        question=session.current_question,
        user_answer="I would check firewall logs and endpoint process execution.",
    )
    assert isinstance(res, InterviewerAgentResponse)
    assert res.intent in ["FOLLOW_UP", "CLARIFICATION", "MOVE_FORWARD", "INCREASE_DIFFICULTY", "DECREASE_DIFFICULTY"]
    assert res.question is not None
    assert len(res.summary) > 0


@pytest.mark.anyio
async def test_challenger_contradiction_detection():
    session = create_sample_session()
    session.conversation_history.append(
        ConversationTurn(
            turn_index=0,
            question_id="q0",
            question_text="What telemetry do you prioritize?",
            user_answer="I never trust firewall logs alone because lateral movement happens behind the perimeter.",
            duration_seconds=10.0,
            evaluation=AnswerEvaluation(
                correctness=80, completeness=80, reasoning=80, relevance=80, clarity=80, overall=80
            ),
            next_action="FOLLOW_UP",
        )
    )

    # Candidate now says "firewall logs alone"
    res = await challenger_agent.evaluate_challenge(
        session=session,
        question=session.current_question,
        user_answer="Checking firewall logs alone is enough to detect lateral movement.",
        detected_concepts=["firewall"],
        missed_concepts=["EDR"],
        pressure_level=3,
    )

    assert isinstance(res, ChallengerAgentResponse)
    assert res.contradiction.contradiction_detected is True
    assert "inconsistency" in res.contradiction.description.lower()
    assert res.is_challenge_needed is True


@pytest.mark.anyio
async def test_fact_check_extraction_and_caching():
    text = "I would use Windows Event ID 4624 to identify successful logons and check IMDSv2 on AWS."
    claims = fact_check_service.extract_technical_claims(text)
    assert len(claims) >= 1
    assert any("4624" in c for c in claims)

    results = await fact_check_service.verify_claims_batch(claims)
    assert len(results) >= 1
    match_4624 = next((r for r in results if "4624" in r.claim), None)
    assert match_4624 is not None
    assert match_4624.verdict == "SUPPORTED"
    assert len(match_4624.sources) > 0

    # Test cache hit
    cached_results = await fact_check_service.verify_claims_batch(claims)
    assert len(cached_results) == len(results)


@pytest.mark.anyio
async def test_rubric_independent_presentation_scoring():
    session = create_sample_session()
    user_ans = "We deploy EDR agents, aggregate syslog to SIEM, and monitor Windows Event ID 4624."
    interviewer_res = await interviewer_agent.analyze_response(
        session=session,
        question=session.current_question,
        user_answer=user_ans,
    )
    challenger_res = await challenger_agent.evaluate_challenge(
        session=session,
        question=session.current_question,
        user_answer=user_ans,
        detected_concepts=interviewer_res.detected_concepts,
        missed_concepts=interviewer_res.missed_concepts,
    )
    factcheck_res = await fact_checker_agent.check_answer(user_ans)

    poor_vision = {
        "camera_engagement_score": 30.0,
        "posture_consistency_score": 25.0,
        "lighting_quality": "dim",
    }

    eval_res = rubric_agent.synthesize_evaluation(
        user_answer=user_ans,
        interviewer_res=interviewer_res,
        challenger_res=challenger_res,
        factcheck_res=factcheck_res,
        vision_summary=poor_vision,
        duration_seconds=15.0,
    )

    assert isinstance(eval_res, RubricAgentResponse)
    # Technical correctness must remain unaffected by poor posture
    assert eval_res.scores.correctness >= 70.0
    assert eval_res.evaluation.correctness >= 70.0


@pytest.mark.anyio
async def test_orchestrator_process_turn():
    session = create_sample_session()
    result = await orchestrator.process_turn(
        session=session,
        question_id=session.current_question.id,
        user_answer="Checking firewall logs is enough to detect lateral movement.",
        duration_seconds=12.0,
        pressure_level=4,
    )

    assert isinstance(result, OrchestratedTurnResult)
    assert result.next_action in ["CHALLENGE", "FOLLOW_UP", "INCREASE_DIFFICULTY", "CLARIFICATION", "MOVE_FORWARD"]
    assert result.next_question is not None
    assert len(result.events_log) >= 3
    assert result.safe_ui_status is not None


@pytest.mark.anyio
async def test_debate_agent_and_scoring():
    debate_state = DebateState(
        session_id="debate-test-1",
        topic="Should organizations mandate passwordless authentication?",
        candidate_stance="FOR",
        ai_stance="AGAINST",
        max_rounds=3,
    )

    opening_statement = "Passwords are inherently vulnerable to credential stuffing, brute force, and social engineering."
    response = await debate_agent.generate_rebuttal(
        debate_state=debate_state,
        candidate_speech=opening_statement,
        fact_check_summary=["Validated against FIDO Alliance standard."],
    )

    assert response.ai_rebuttal is not None
    assert len(response.ai_rebuttal) > 10

    eval_score = debate_agent.calculate_debate_score(debate_state)
    assert eval_score.overall_score >= 0
    assert len(eval_score.key_strengths) > 0
