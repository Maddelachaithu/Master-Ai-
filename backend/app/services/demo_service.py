import logging
from typing import Dict, Any, List

logger = logging.getLogger("master_ai.demo_service")


class DemoService:
    """
    Provides a deterministic, zero-dependency demonstration mode for MASTER AI.
    Allows complete demonstration of the system without requiring microphones, webcams,
    LLM API keys, or live vector database connections.
    All demo data is strictly tagged with `is_demo = True`.
    """

    DEMO_QUESTIONS = [
        {
            "turn_index": 1,
            "question_id": "demo_q1",
            "question": "Suppose your SIEM alerts on multiple failed logons followed by a successful logon on a critical domain controller. How would you investigate this authentication activity?",
            "topic": "SOC Incident Triage & Event Log Analysis",
            "difficulty": "advanced",
            "why_asked": "Assesses foundational telemetry triage skills, specifically Windows Event ID 4624/4625 log correlation.",
            "candidate_answer": "I would begin by triaging the authentication logs on the domain controller. Specifically, I would correlate Event ID 4625 failed logons with the subsequent Event ID 4624 successful logon, checking the Logon Type — such as Type 10 for RDP or Type 3 for network logon. I would inspect the Source IP address, workstation name, and target account. Next, I would cross-reference threat intelligence for the source IP and verify whether the user account normally accesses that asset at that hour.",
            "whisper_transcript": "I would begin by triaging the authentication logs on the domain controller. Specifically, I would correlate Event ID 4625 failed logons with the subsequent Event ID 4624 successful logon, checking the Logon Type — such as Type 10 for RDP or Type 3 for network logon. I would inspect the Source IP address, workstation name, and target account. Next, I would cross-reference threat intelligence for the source IP and verify whether the user account normally accesses that asset at that hour.",
            "rag_evidence": {
                "document_name": "SOC Triage & Event Log Analysis Guide",
                "category": "incident_response",
                "source": "Microsoft Security & MITRE ATT&CK",
                "content_excerpt": "Correlate Event ID 4625 (Failed Logon) with Event ID 4624 (Successful Logon). Check Logon Type 3 (Network) vs Type 10 (RemoteInteractive/RDP). Extract Workstation Name and Source Network Address.",
                "confidence": 94,
                "grounded": True,
            },
            "fact_check": {
                "claim": "Event ID 4624 represents successful logon and Type 10 represents RDP",
                "status": "VERIFIED",
                "confidence": 96,
                "source": "Microsoft Learn Documentation",
                "evidence_summary": "Accurately maps Windows Security Event ID 4624 to successful logon and Logon Type 10 to RemoteInteractive/RDP session.",
            },
            "challenger_probe": "What specific evidence in the authentication telemetry would distinguish a legitimate administrator executing off-hours maintenance from an adversary using compromised credentials?",
            "rubric_evaluation": {
                "technical_correctness": 88,
                "reasoning_depth": 85,
                "clarity": 90,
                "overall_score": 88,
                "strengths": ["Correctly identified Event IDs 4624 and 4625", "Specified Logon Types 3 and 10 accurately"],
                "weaknesses": ["Could further discuss Kerberos ticket-granting anomalies vs NTLM fallback"],
            },
            "vision_metrics": {
                "camera_engagement": 88,
                "posture_consistency": 92,
                "frame_quality": 95,
                "lighting_quality": 92,
                "dominant_posture": "Upright",
            },
            "voice_metrics": {
                "speaking_rate_wpm": 136,
                "filler_count": 2,
                "pause_duration_avg": 1.1,
                "duration_seconds": 24,
            },
            "timeline": [
                {"timestamp": "00:00", "agent": "Interviewer", "action": "Formulated role-grounded authentication question"},
                {"timestamp": "00:08", "agent": "Audio Engine", "action": "Candidate voice captured and buffered"},
                {"timestamp": "00:09", "agent": "Whisper STT", "action": "Transcribed 78 words (faster-whisper int8)"},
                {"timestamp": "00:10", "agent": "RAG Engine", "action": "Retrieved 2 authoritative chunks from ChromaDB (score: 91%)"},
                {"timestamp": "00:11", "agent": "Fact Checker", "action": "Verified Event ID 4624 / Logon Type 10 claim"},
                {"timestamp": "00:12", "agent": "Challenger", "action": "Generated adversarial administrative disambiguation probe"},
                {"timestamp": "00:13", "agent": "Rubric Synthesizer", "action": "Evaluated response: Score 88/100"},
            ],
        },
        {
            "turn_index": 2,
            "question_id": "demo_q2",
            "question": "How would you detect credential-based lateral movement using Kerberos telemetry across Active Directory?",
            "topic": "Active Directory & Lateral Movement",
            "difficulty": "advanced",
            "why_asked": "Tests ability to spot Kerberoasting (Event ID 4769) and Pass-the-Ticket or Golden Ticket creation.",
            "candidate_answer": "For Kerberos lateral movement, I monitor Event ID 4769 for Kerberos Service Ticket requests with RC4 encryption type 0x17, which strongly signals Kerberoasting attacks against service principal names. For Golden Tickets, I check for TGT requests with unusually long lifetimes, non-existent domain accounts, or mismatched PAC validation signatures against the KRBTGT account.",
            "whisper_transcript": "For Kerberos lateral movement, I monitor Event ID 4769 for Kerberos Service Ticket requests with RC4 encryption type 0x17, which strongly signals Kerberoasting attacks against service principal names. For Golden Tickets, I check for TGT requests with unusually long lifetimes, non-existent domain accounts, or mismatched PAC validation signatures against the KRBTGT account.",
            "rag_evidence": {
                "document_name": "Kerberos Authentication Security Guide",
                "category": "networking",
                "source": "MITRE ATT&CK T1558 & NIST",
                "content_excerpt": "Event ID 4769 monitors Kerberos TGS requests. RC4 encryption (0x17) indicates legacy cipher exploitation (Kerberoasting). Golden Tickets forge TGTs encrypted with KRBTGT hash.",
                "confidence": 96,
                "grounded": True,
            },
            "fact_check": {
                "claim": "Event ID 4769 with encryption 0x17 indicates RC4 cipher in Kerberoasting",
                "status": "VERIFIED",
                "confidence": 98,
                "source": "MITRE ATT&CK T1558.003",
                "evidence_summary": "Accurately describes Kerberoasting detection using RC4 encryption 0x17 and Event ID 4769.",
            },
            "challenger_probe": "If the adversary uses AES-256 instead of RC4 for Kerberoasting, how would you adjust your detection logic?",
            "rubric_evaluation": {
                "technical_correctness": 92,
                "reasoning_depth": 88,
                "clarity": 89,
                "overall_score": 90,
                "strengths": ["Clear encryption hex code reference (0x17)", "Deep Active Directory security knowledge"],
                "weaknesses": ["Mention network-level AS-REQ request anomalies alongside event logs"],
            },
            "vision_metrics": {
                "camera_engagement": 90,
                "posture_consistency": 94,
                "frame_quality": 96,
                "lighting_quality": 93,
                "dominant_posture": "Upright",
            },
            "voice_metrics": {
                "speaking_rate_wpm": 140,
                "filler_count": 1,
                "pause_duration_avg": 0.9,
                "duration_seconds": 22,
            },
            "timeline": [
                {"timestamp": "00:00", "agent": "Interviewer", "action": "Prompted candidate on Kerberos lateral movement"},
                {"timestamp": "00:07", "agent": "Audio Engine", "action": "Candidate voice streaming captured"},
                {"timestamp": "00:08", "agent": "Whisper STT", "action": "Transcribed 64 words (faster-whisper int8)"},
                {"timestamp": "00:09", "agent": "RAG Engine", "action": "Retrieved Kerberos Auth Guide from ChromaDB (score: 95%)"},
                {"timestamp": "00:10", "agent": "Fact Checker", "action": "Verified Event ID 4769 and 0x17 RC4 cipher match"},
                {"timestamp": "00:11", "agent": "Challenger", "action": "Pivoted to AES-256 cipher challenge"},
                {"timestamp": "00:12", "agent": "Rubric Synthesizer", "action": "Evaluated response: Score 90/100"},
            ],
        },
        {
            "turn_index": 3,
            "question_id": "demo_q3",
            "question": "How does transitioning to AWS IMDSv2 mitigate Server-Side Request Forgery (SSRF) vulnerabilities targeting EC2 instance metadata?",
            "topic": "Cloud Security & IAM",
            "difficulty": "advanced",
            "why_asked": "Assesses cloud defense architecture understanding regarding IMDS session tokens vs legacy HTTP GET requests.",
            "candidate_answer": "IMDSv2 is session-oriented. Unlike IMDSv1 which accepted simple HTTP GET requests that could be triggered by SSRF, IMDSv2 requires initiating a session with an HTTP PUT request containing an X-aws-ec2-metadata-token-ttl-seconds header to acquire a session token. Subsequent requests must supply this token in the X-aws-ec2-metadata-token header. Because most SSRF vulnerabilities only execute simple GET requests and cannot construct custom HTTP PUT headers, IMDSv2 neutralizes the SSRF vector.",
            "whisper_transcript": "IMDSv2 is session-oriented. Unlike IMDSv1 which accepted simple HTTP GET requests that could be triggered by SSRF, IMDSv2 requires initiating a session with an HTTP PUT request containing an X-aws-ec2-metadata-token-ttl-seconds header to acquire a session token. Subsequent requests must supply this token in the X-aws-ec2-metadata-token header. Because most SSRF vulnerabilities only execute simple GET requests and cannot construct custom HTTP PUT headers, IMDSv2 neutralizes the SSRF vector.",
            "rag_evidence": {
                "document_name": "AWS IAM & Instance Metadata Security",
                "category": "cloud",
                "source": "AWS Security Best Practices & RFC",
                "content_excerpt": "IMDSv2 requires an HTTP PUT request with 'X-aws-ec2-metadata-token-ttl-seconds' to generate a session token. Subsequent requests require 'X-aws-ec2-metadata-token'.",
                "confidence": 98,
                "grounded": True,
            },
            "fact_check": {
                "claim": "IMDSv2 requires HTTP PUT with X-aws-ec2-metadata-token-ttl-seconds header",
                "status": "VERIFIED",
                "confidence": 99,
                "source": "AWS Documentation (Instance Metadata)",
                "evidence_summary": "Accurately cited exact AWS IMDSv2 HTTP PUT header requirements.",
            },
            "challenger_probe": "Suppose the vulnerable web application allows arbitrary HTTP methods including PUT. What additional hop-limit defense is configured in IMDSv2?",
            "rubric_evaluation": {
                "technical_correctness": 94,
                "reasoning_depth": 90,
                "clarity": 92,
                "overall_score": 92,
                "strengths": ["Exact header naming", "Clear distinction between GET and PUT vectors"],
                "weaknesses": ["Did not mention metadata hop limit setting (HttpPutResponseHopLimit)"],
            },
            "vision_metrics": {
                "camera_engagement": 89,
                "posture_consistency": 91,
                "frame_quality": 95,
                "lighting_quality": 94,
                "dominant_posture": "Upright",
            },
            "voice_metrics": {
                "speaking_rate_wpm": 134,
                "filler_count": 2,
                "pause_duration_avg": 1.0,
                "duration_seconds": 26,
            },
            "timeline": [
                {"timestamp": "00:00", "agent": "Interviewer", "action": "Posed AWS IMDSv2 architecture question"},
                {"timestamp": "00:09", "agent": "Audio Engine", "action": "Candidate response captured"},
                {"timestamp": "00:10", "agent": "Whisper STT", "action": "Transcribed 82 words (faster-whisper int8)"},
                {"timestamp": "00:11", "agent": "RAG Engine", "action": "Retrieved AWS IAM Security Doc (score: 98%)"},
                {"timestamp": "00:12", "agent": "Fact Checker", "action": "Verified X-aws-ec2-metadata-token-ttl-seconds header"},
                {"timestamp": "00:13", "agent": "Challenger", "action": "Probed on HttpPutResponseHopLimit container escape defense"},
                {"timestamp": "00:14", "agent": "Rubric Synthesizer", "action": "Evaluated response: Score 92/100"},
            ],
        },
        {
            "turn_index": 4,
            "question_id": "demo_q4",
            "question": "When triaging a confirmed endpoint compromise, how do you contain the host while preserving volatile evidence in memory?",
            "topic": "Incident Containment & Memory Forensics",
            "difficulty": "advanced",
            "why_asked": "Assesses incident response containment procedures, preventing destructive reboots before volatile memory capture.",
            "candidate_answer": "I do not reboot or power off the endpoint, as that destroys volatile artifacts in RAM like injected DLLs, unencrypted network sockets, and process memory. Instead, I execute network isolation via the EDR agent — isolating network traffic while preserving the EDR management tunnel. Then, I capture a volatile memory dump using tools like LiME or WinPmem before initiating deeper forensic inspection or system containment.",
            "whisper_transcript": "I do not reboot or power off the endpoint, as that destroys volatile artifacts in RAM like injected DLLs, unencrypted network sockets, and process memory. Instead, I execute network isolation via the EDR agent — isolating network traffic while preserving the EDR management tunnel. Then, I capture a volatile memory dump using tools like LiME or WinPmem before initiating deeper forensic inspection or system containment.",
            "rag_evidence": {
                "document_name": "SOC Triage & Incident Containment Guide",
                "category": "incident_response",
                "source": "NIST SP 800-61 Rev 2",
                "content_excerpt": "Order of volatility: RAM and network state must be acquired prior to host shutdown. Network isolation via EDR allows containment while preserving memory capture channel.",
                "confidence": 95,
                "grounded": True,
            },
            "fact_check": {
                "claim": "EDR network isolation preserves volatile memory while blocking attacker lateral communications",
                "status": "VERIFIED",
                "confidence": 97,
                "source": "NIST SP 800-61 Rev 2",
                "evidence_summary": "Follows standard NIST order of volatility and EDR containment protocols.",
            },
            "challenger_probe": "If the attacker detected EDR containment and launched an active wiper script, how would your containment priority change?",
            "rubric_evaluation": {
                "technical_correctness": 91,
                "reasoning_depth": 89,
                "clarity": 93,
                "overall_score": 91,
                "strengths": ["Emphasized order of volatility", "Specific tooling references (WinPmem, EDR isolation)"],
                "weaknesses": ["Mention live network socket capture prior to dump generation"],
            },
            "vision_metrics": {
                "camera_engagement": 92,
                "posture_consistency": 95,
                "frame_quality": 96,
                "lighting_quality": 94,
                "dominant_posture": "Upright",
            },
            "voice_metrics": {
                "speaking_rate_wpm": 138,
                "filler_count": 1,
                "pause_duration_avg": 0.8,
                "duration_seconds": 23,
            },
            "timeline": [
                {"timestamp": "00:00", "agent": "Interviewer", "action": "Initiated containment & volatility triage prompt"},
                {"timestamp": "00:08", "agent": "Audio Engine", "action": "Candidate response captured"},
                {"timestamp": "00:09", "agent": "Whisper STT", "action": "Transcribed 75 words (faster-whisper int8)"},
                {"timestamp": "00:10", "agent": "RAG Engine", "action": "Retrieved NIST SP 800-61 evidence (score: 95%)"},
                {"timestamp": "00:11", "agent": "Fact Checker", "action": "Verified order of volatility claims"},
                {"timestamp": "00:12", "agent": "Challenger", "action": "Pivoted to wiper threat mitigation scenario"},
                {"timestamp": "00:13", "agent": "Rubric Synthesizer", "action": "Evaluated response: Score 91/100"},
            ],
        },
    ]

    def get_demo_scenario(self) -> Dict[str, Any]:
        """Returns the full demo interview session blueprint."""
        return {
            "session_id": "demo_session_soc_analyst",
            "title": "SOC Analyst Technical Interview (Demo)",
            "role": "SOC Analyst",
            "difficulty": "advanced",
            "mode": "cybersecurity",
            "is_demo": True,
            "total_turns": len(self.DEMO_QUESTIONS),
            "questions": [q["question"] for q in self.DEMO_QUESTIONS],
            "average_score": 90,
            "technical_score": 91,
            "reasoning_score": 88,
            "communication_score": 91,
            "presentation_score": 91,
        }

    def get_demo_turn(self, turn_index: int) -> Dict[str, Any]:
        """Returns deterministic mock turn execution payload."""
        idx = max(1, min(turn_index, len(self.DEMO_QUESTIONS)))
        return self.DEMO_QUESTIONS[idx - 1]


demo_service = DemoService()
