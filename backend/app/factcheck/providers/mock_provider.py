import re
import logging
from typing import List, Dict, Any
from app.factcheck.provider import FactCheckProvider, FactCheckResult, FactSource

logger = logging.getLogger("master_ai.factcheck.mock")

# Curated, authoritative technical facts with exact official documentation references
TECHNICAL_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "patterns": [r"4624", r"successful logon", r"logon type 3", r"logon type 10"],
        "claim_summary": "Windows Event ID 4624 represents a successful account logon event.",
        "verdict": "SUPPORTED",
        "confidence": 0.98,
        "sources": [
            FactSource(
                title="Microsoft Learn: Audit Logon Event ID 4624",
                url="https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4624",
                snippet="Event ID 4624 (Success Audit) indicates that an account was successfully logged on.",
                publisher="Microsoft Security Documentation",
            )
        ],
        "explanation": "Event ID 4624 documents successful logons with critical attributes such as LogonType (Type 3 = Network, Type 10 = RemoteInteractive/RDP) and TargetUserName.",
    },
    {
        "patterns": [r"4625", r"failed logon", r"bad password"],
        "claim_summary": "Windows Event ID 4625 represents an account logon failure.",
        "verdict": "SUPPORTED",
        "confidence": 0.98,
        "sources": [
            FactSource(
                title="Microsoft Learn: Audit Logon Event ID 4625",
                url="https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625",
                snippet="Event ID 4625 documents an account that failed to log on.",
                publisher="Microsoft Security Documentation",
            )
        ],
        "explanation": "Event ID 4625 records failed logon attempts including FailureReason and SubStatus codes (e.g. 0xC000006A = bad password).",
    },
    {
        "patterns": [r"lsass", r"mimikatz", r"pass-the-ticket", r"tgt", r"kerberos"],
        "claim_summary": "Kerberos Pass-the-Ticket reuses memory-resident TGT/TGS tickets from LSASS without requiring plaintext passwords.",
        "verdict": "SUPPORTED",
        "confidence": 0.96,
        "sources": [
            FactSource(
                title="MITRE ATT&CK: Pass the Ticket (T1550.003)",
                url="https://attack.mitre.org/techniques/T1550/003/",
                snippet="Adversaries may use Pass the Ticket to authenticate using stolen Kerberos tickets.",
                publisher="MITRE Corporation",
            ),
            FactSource(
                title="Microsoft Learn: How Kerberos Authentication Works",
                url="https://learn.microsoft.com/en-us/windows-server/security/kerberos/how-the-kerberos-version-5-protocol-works",
                snippet="Kerberos V5 uses ticket-granting tickets to request service tickets without re-authenticating.",
                publisher="Microsoft Documentation",
            ),
        ],
        "explanation": "Pass-the-Ticket exploits cached Kerberos tickets inside LSASS process memory to authenticate laterally across Active Directory domains.",
    },
    {
        "patterns": [r"169\.254\.169\.254", r"imds", r"imds.*v2", r"metadata service"],
        "claim_summary": "IMDSv2 protects cloud instance metadata against SSRF by requiring session tokens.",
        "verdict": "SUPPORTED",
        "confidence": 0.97,
        "sources": [
            FactSource(
                title="AWS Documentation: Use IMDSv2",
                url="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html",
                snippet="IMDSv2 uses session-oriented requests with a PUT token header to mitigate open SSRF vulnerabilities.",
                publisher="Amazon Web Services",
            )
        ],
        "explanation": "IMDSv2 requires a PUT request with X-aws-ec2-metadata-token-ttl-seconds to obtain a session token, mitigating simple HTTP GET SSRF vectors.",
    },
    {
        "patterns": [r"rfc\s*1918", r"private ip", r"10\.0\.0\.0", r"192\.168\."],
        "claim_summary": "RFC 1918 defines private address spaces: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.",
        "verdict": "SUPPORTED",
        "confidence": 0.99,
        "sources": [
            FactSource(
                title="IETF RFC 1918: Address Allocation for Private Internets",
                url="https://datatracker.ietf.org/doc/html/rfc1918",
                snippet="The Internet Assigned Numbers Authority (IANA) has reserved three blocks of IPv4 address space for private networks.",
                publisher="Internet Engineering Task Force",
            )
        ],
        "explanation": "RFC 1918 defines non-routable private IP addresses intended for internal enterprise networks.",
    },
    {
        "patterns": [r"firewall.*alone.*prevents", r"firewalls.*completely.*stop.*lateral"],
        "claim_summary": "Perimeter firewalls alone are sufficient to prevent internal lateral movement.",
        "verdict": "UNSUPPORTED",
        "confidence": 0.92,
        "sources": [
            FactSource(
                title="NIST SP 800-207: Zero Trust Architecture",
                url="https://csrc.nist.gov/publications/detail/sp/800-207/final",
                snippet="Zero Trust assumes an attacker is already present on the network, rejecting perimeter-only security models.",
                publisher="National Institute of Standards and Technology",
            )
        ],
        "explanation": "Perimeter firewalls do not inspect east-west network traffic between internal hosts on the same network segment once initial access is gained.",
    },
    {
        "patterns": [r"zgc", r"colored pointer", r"load barrier", r"pause"],
        "claim_summary": "ZGC achieves sub-millisecond GC pauses using colored pointers and load barriers.",
        "verdict": "SUPPORTED",
        "confidence": 0.95,
        "sources": [
            FactSource(
                title="OpenJDK JEP 377: ZGC A Scalable Low-Latency Garbage Collector",
                url="https://openjdk.org/jeps/377",
                snippet="ZGC is a concurrent garbage collector designed for sub-millisecond maximum pause times regardless of heap size.",
                publisher="OpenJDK Community",
            )
        ],
        "explanation": "ZGC uses colored pointers in virtual memory and concurrent load barriers to relocate objects while application threads continue executing.",
    },
]


class MockFactCheckProvider(FactCheckProvider):
    """
    High-speed, offline-capable technical fact-checking provider
    referencing verified technical standards and vendor documentation.
    """

    async def verify_claim(self, claim: str) -> FactCheckResult:
        claim_lower = claim.lower()

        # Match against technical knowledge base patterns
        for item in TECHNICAL_KNOWLEDGE_BASE:
            match_count = sum(1 for p in item["patterns"] if re.search(p, claim_lower))
            if match_count >= 1:
                return FactCheckResult(
                    claim=claim,
                    verdict=item["verdict"],
                    confidence=item["confidence"],
                    sources=item["sources"],
                    explanation=item["explanation"],
                    cached=False,
                )

        # Honest fallback: unverified if not in verified knowledge base
        return FactCheckResult(
            claim=claim,
            verdict="UNVERIFIED",
            confidence=0.5,
            sources=[],
            explanation="Claim could not be verified against the local technical reference corpus.",
            cached=False,
        )
