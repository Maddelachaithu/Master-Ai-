import uuid
import logging
from typing import Dict, Optional, List
from app.models.session import SessionState, QuestionModel, ConversationTurn
from app.schemas.interview import SessionStartRequest

logger = logging.getLogger("master_ai.session")

CYBERSECURITY_QUESTIONS = [
    QuestionModel(
        id="q-cyber-01",
        number=1,
        text="Explain how you would investigate a suspected lateral movement attack inside a zero-trust enterprise network.",
        category="Cybersecurity",
        subtopic="Incident Response & Threat Hunting",
        difficulty="advanced",
        expected_concepts=[
            "Windows Event ID 4624 (Logon Type 3 / Type 10)",
            "Kerberos Ticket Granting (Pass-the-Ticket)",
            "EDR process tree parent-child lineage",
            "LSASS memory dump & Sysmon Event ID 10",
            "SMB / RPC network telemetry inspection",
        ],
        sample_followups=[
            "How would you distinguish legitimate admin PsExec execution from malicious lateral movement?",
            "If the attacker used Pass-the-Ticket, which volatile memory artifacts would you inspect in LSASS?",
        ],
        adversarial_traps=[
            "Assuming perimeter firewalls stop internal east-west traversal",
            "Ignoring credential caching in LSASS memory",
        ],
        hints=["Focus on authentication telemetry, RPC/SMB activity, and EDR process lineage."],
    ),
    QuestionModel(
        id="q-cyber-02",
        number=2,
        text="An attacker has compromised an AWS IAM role with AdministratorAccess in your production cluster. Walk me through your first 15 minutes of containment.",
        category="Cybersecurity",
        subtopic="Cloud Security & Incident Containment",
        difficulty="expert",
        expected_concepts=[
            "Revoke active STS session tokens via IAM inline policy denial",
            "Attach explicit DenyAll boundary policy to the compromised role",
            "Audit AWS CloudTrail & GuardDuty for anomalous API calls",
            "Isolate compromised EC2/EKS instances with quarantine security groups",
            "Preserve volatile memory & EBS disk snapshots for forensics",
        ],
        sample_followups=[
            "If the attacker generated new IAM access keys before you revoked STS, how do you discover and revoke them?",
            "How do you prevent persistence mechanisms established via AWS Lambda or KMS key policies?",
        ],
        adversarial_traps=[
            "Deleting the IAM role immediately (destroys historical attribution and locks out legit pipelines without forensics)",
        ],
        hints=["Prioritize immediate STS token invalidation and credential containment before modifying instance state."],
    ),
    QuestionModel(
        id="q-cyber-03",
        number=3,
        text="In a microservices architecture, how do you mitigate Server-Side Request Forgery (SSRF) when services must fetch user-supplied webhook URLs?",
        category="Cybersecurity",
        subtopic="Application Security & Architecture",
        difficulty="advanced",
        expected_concepts=[
            "Strict RFC 1918 private IP and link-local (169.254.169.254) denylist",
            "DNS pre-resolution verification (Mitigate DNS Rebinding / Time-of-Check Time-of-Use)",
            "Dedicated egress proxy in an isolated network enclave",
            "Disabling HTTP redirection follow behavior on outbound clients",
            "IMDSv2 enforcement on cloud infrastructure",
        ],
        sample_followups=[
            "How do you prevent DNS rebinding where the host resolves to a public IP first, then private IP on socket connect?",
            "Why is regex filtering of '169.254.169.254' in URL strings insufficient against octal/hex encodings?",
        ],
        adversarial_traps=["Relying solely on frontend regex validation of URL strings."],
        hints=["Consider socket-level IP binding, egress enclaves, and IMDSv2 metadata protection."],
    ),
]

TECHNICAL_QUESTIONS = [
    QuestionModel(
        id="q-tech-01",
        number=1,
        text="Design a globally distributed rate limiter that handles 500,000 requests per second with sub-5ms latency and prevents sliding-window stampedes.",
        category="System Design",
        subtopic="Distributed Systems & Scalability",
        difficulty="expert",
        expected_concepts=[
            "Sliding Window Counter / Token Bucket algorithm",
            "Redis Cluster with Lua scripts for atomic operations",
            "Edge in-memory token buffering at API Gateway",
            "Clock drift mitigation across PoPs",
            "Graceful degradation / load shedding under network partitions",
        ],
        sample_followups=[
            "What happens when the Redis shard hosting a hot tenant fails during peak traffic?",
            "How do you synchronize edge token allocations without introducing synchronous cross-region latency?",
        ],
        adversarial_traps=["Using global locks across distributed nodes."],
        hints=["Consider hierarchical rate limiting: local edge token reservoirs synced asynchronously with centralized Redis."],
    ),
    QuestionModel(
        id="q-tech-02",
        number=2,
        text="Explain how modern low-pause Garbage Collectors (like Go runtime or Java ZGC) achieve sub-millisecond stop-the-world pauses.",
        category="Programming",
        subtopic="Runtime Internals & Memory Management",
        difficulty="advanced",
        expected_concepts=[
            "Tricolor marking algorithm (White, Grey, Black)",
            "Read barriers / Load barriers",
            "Colored pointers and virtual memory multi-mapping",
            "Concurrent mark and sweep phases",
            "Concurrent compaction to eliminate memory fragmentation",
        ],
        sample_followups=[
            "How does a write/read barrier prevent the mutator thread from hiding an object behind a black pointer?",
        ],
        adversarial_traps=["Assuming garbage collection pause scales linearly with heap size in ZGC."],
        hints=["Focus on colored pointers, load barriers, and concurrent phase execution."],
    ),
]

BEHAVIORAL_QUESTIONS = [
    QuestionModel(
        id="q-beh-01",
        number=1,
        text="Tell me about a critical production outage caused by your own team. How did you manage stakeholder friction while leading the technical recovery?",
        category="Behavioral",
        subtopic="Crisis Leadership & STAR Method",
        difficulty="intermediate",
        expected_concepts=[
            "Situation context with measurable business blast radius",
            "Blameless post-mortem culture with psychological safety",
            "Real-time status communication cadences for executive leadership",
            "Root cause analysis (5 Whys) and permanent architectural guardrails",
            "Accountability ownership without throwing peers under the bus",
        ],
        sample_followups=[
            "How did you resolve disagreements with leadership regarding whether to roll back or patch forward?",
        ],
        adversarial_traps=["Blaming junior engineers or third-party vendors."],
        hints=["Structure your answer strictly: Situation → Task → Action → Result."],
    ),
]

DEBATE_QUESTIONS = [
    QuestionModel(
        id="q-deb-01",
        number=1,
        text="Defend your stance: Should autonomous AI systems have legal personhood and liability for autonomous actions in commercial markets?",
        category="Debate",
        subtopic="AI Ethics & Legal Liability",
        difficulty="advanced",
        expected_concepts=[
            "Vicarious liability vs Strict liability models",
            "Corporate personhood analogies vs machine autonomy",
            "Incentive structures for AI developers and operators",
            "Insurance backstops and algorithmic indemnity funds",
            "Moral agency vs economic agency",
        ],
        sample_followups=[
            "If an autonomous AI executes a flash crash with novel emergent strategies, who compensates victims?",
        ],
        adversarial_traps=["Equating legal personhood with human consciousness."],
        hints=["Distinguish economic liability pools from moral accountability."],
    ),
]


class SessionService:
    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}

    def get_questions_for_mode(self, mode: str) -> List[QuestionModel]:
        mode_lower = mode.lower()
        if "tech" in mode_lower or "system" in mode_lower:
            return TECHNICAL_QUESTIONS
        elif "beh" in mode_lower or "hr" in mode_lower or "star" in mode_lower:
            return BEHAVIORAL_QUESTIONS
        elif "deb" in mode_lower:
            return DEBATE_QUESTIONS
        else:
            return CYBERSECURITY_QUESTIONS

    def create_session(self, request: SessionStartRequest) -> SessionState:
        session_id = f"sess-{uuid.uuid4().hex[:10]}"
        questions = self.get_questions_for_mode(request.mode)
        initial_question = questions[0]

        session = SessionState(
            session_id=session_id,
            mode=request.mode,
            difficulty=request.difficulty,
            duration_minutes=request.duration_minutes,
            ai_personality=request.ai_personality,
            topic=request.target_topic or initial_question.subtopic,
            current_question=initial_question,
            current_question_index=0,
            questions_list=questions,
            conversation_history=[],
        )

        self._sessions[session_id] = session
        logger.info(f"Created session {session_id} for mode={request.mode}, difficulty={request.difficulty}")
        return session

    def get_session(self, session_id: str) -> Optional[SessionState]:
        session = self._sessions.get(session_id)
        if not session and (session_id == "session-001" or session_id.startswith("sess-") or session_id.startswith("session-")):
            # Auto-create session so candidate answers are never dropped
            logger.info(f"Auto-creating default session state for {session_id}")
            questions = self.get_questions_for_mode("cybersecurity")
            session = SessionState(
                session_id=session_id,
                mode="cybersecurity",
                difficulty="advanced",
                duration_minutes=15,
                ai_personality="socratic",
                topic=questions[0].subtopic,
                current_question=questions[0],
                current_question_index=0,
                questions_list=questions,
                conversation_history=[],
            )
            self._sessions[session_id] = session
        return session

    def update_session(self, session: SessionState):
        self._sessions[session.session_id] = session

    def record_turn(self, session_id: str, turn: ConversationTurn):
        session = self.get_session(session_id)
        if session:
            session.conversation_history.append(turn)
            self.update_session(session)

    def record_vision_summary(self, session_id: str, summary_data: dict):
        session = self.get_session(session_id)
        if session:
            session.vision_summaries.append(summary_data)
            # Attach to the latest conversation turn if matching
            if session.conversation_history:
                session.conversation_history[-1].vision_summary = summary_data
            self.update_session(session)
            logger.info(f"Recorded vision summary for session {session_id}, question {summary_data.get('question_id')}")


session_service = SessionService()
