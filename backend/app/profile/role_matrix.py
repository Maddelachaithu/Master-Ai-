from typing import Dict, List, Any
from pydantic import BaseModel, Field


class RoleCompetencyProfile(BaseModel):
    role_name: str
    description: str
    core_skills: List[str]
    secondary_skills: List[str]
    recommended_certifications: List[str]
    typical_tools: List[str]
    key_responsibilities: List[str]


ROLE_MATRIX: Dict[str, RoleCompetencyProfile] = {
    "SOC Analyst": RoleCompetencyProfile(
        role_name="SOC Analyst",
        description="Monitors and investigates security alerts, triages incidents, and analyzes telemetry.",
        core_skills=["SIEM Correlation", "Log Analysis", "Threat Detection", "Incident Response", "TCP/IP & Networking", "MITRE ATT&CK"],
        secondary_skills=["Python Scripting", "EDR Telemetry", "Memory Forensics", "Phishing Analysis"],
        recommended_certifications=["Security+", "CySA+", "BTL1"],
        typical_tools=["Splunk", "Microsoft Sentinel", "Wireshark", "CrowdStrike Falcon", "VirusTotal"],
        key_responsibilities=["Tier 1/2 alert triage", "Log correlation", "Containment orchestration"],
    ),
    "Cybersecurity Analyst": RoleCompetencyProfile(
        role_name="Cybersecurity Analyst",
        description="Assesses security posture, analyzes vulnerabilities, and designs defensive mitigations.",
        core_skills=["Vulnerability Management", "Network Security", "Active Directory Security", "Threat Hunting", "Zero Trust Architecture"],
        secondary_skills=["Cryptography", "Compliance Frameworks (NIST)", "Cloud Security"],
        recommended_certifications=["Security+", "CISSP", "CEH"],
        typical_tools=["Nmap", "Nessus", "Qualys", "Snort", "Splunk"],
        key_responsibilities=["Vulnerability scanning", "Defense-in-depth posture audit", "Security policy formulation"],
    ),
    "Penetration Tester": RoleCompetencyProfile(
        role_name="Penetration Tester",
        description="Performs authorized simulated cyberattacks to identify exploitable security flaws.",
        core_skills=["Web Application Security (OWASP)", "Network Reconnaissance", "Privilege Escalation", "Exploitation Techniques", "Reporting & Remediation"],
        secondary_skills=["Active Directory Exploitation", "Reverse Engineering", "Scripting (Python/Bash)"],
        recommended_certifications=["OSCP", "eJPT", "CEH Practical", "CRTO"],
        typical_tools=["Burp Suite", "Nmap", "Metasploit", "Mimikatz", "Hashcat", "SQLmap"],
        key_responsibilities=["Black/grey-box assessment", "Exploitation chaining", "Executive remediation reporting"],
    ),
    "Cloud Security Analyst": RoleCompetencyProfile(
        role_name="Cloud Security Analyst",
        description="Secures cloud workloads, IAM permissions, and container architectures across AWS/Azure/GCP.",
        core_skills=["Cloud IAM & Least Privilege", "AWS/Azure Security Architecture", "IMDSv2 & Metadata Protection", "Container Security (Docker/K8s)", "Cloud Logging & Auditing"],
        secondary_skills=["Infrastructure as Code (Terraform)", "CI/CD Security", "Serverless Security"],
        recommended_certifications=["AWS Certified Security Specialty", "Azure Security Engineer (AZ-500)", "CCSK"],
        typical_tools=["AWS CloudTrail", "GuardDuty", "Terraform", "Trivy", "Prisma Cloud"],
        key_responsibilities=["IAM trust boundary review", "Cloud misconfiguration remediation", "Container vulnerability scanning"],
    ),
    "Incident Responder": RoleCompetencyProfile(
        role_name="Incident Responder",
        description="Leads emergency response, root-cause forensic investigations, and threat eradication.",
        core_skills=["Incident Scoping & Triage", "Host Memory Forensics", "Network Packet Analysis", "Malware Containment", "Timeline Reconstruction"],
        secondary_skills=["Reverse Engineering", "Threat Actor Attribution", "Post-Mortem Reporting"],
        recommended_certifications=["GCIH", "GCFA", "GNFA"],
        typical_tools=["Volatility", "FTK Imager", "Wireshark", "Velociraptor", "YARA"],
        key_responsibilities=["Live incident response", "Forensic image acquisition", "Malware containment"],
    ),
    "DevSecOps Engineer": RoleCompetencyProfile(
        role_name="DevSecOps Engineer",
        description="Integrates automated security controls, SAST/DAST, and secrets management into CI/CD pipelines.",
        core_skills=["CI/CD Pipeline Security", "SAST/DAST Tooling", "Secrets Management", "Infrastructure as Code", "Container Hardening"],
        secondary_skills=["Kubernetes RBAC", "Software Supply Chain (SBOM)", "Python/Go"],
        recommended_certifications=["CKS", "AWS DevOps", "DevSecOps Foundation"],
        typical_tools=["GitHub Actions", "SonarQube", "HashiCorp Vault", "Snyk", "Docker"],
        key_responsibilities=["Pipeline security gate automation", "Static analysis integration", "Container image signing"],
    ),
}


def get_role_profile(role_name: str) -> RoleCompetencyProfile:
    # Match role name case-insensitively
    for k, v in ROLE_MATRIX.items():
        if k.lower() in role_name.lower() or role_name.lower() in k.lower():
            return v
    # Default to SOC Analyst
    return ROLE_MATRIX["SOC Analyst"]
