from typing import Dict, List, Any


SKILL_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "Cybersecurity": {
        "Network Security": ["TCP/IP", "Firewalls", "IDS/IPS", "Micro-segmentation", "Zero Trust", "VPN"],
        "Threat Detection & Hunting": ["Lateral Movement", "Kerberos", "Event ID 4624", "Pass-the-Ticket", "EDR Telemetry", "Pass-the-Hash"],
        "Incident Response": ["Incident Triage", "Host Memory Forensics", "Containment Strategies", "Malware Analysis", "Root Cause Analysis"],
        "Cloud Security": ["AWS IAM", "IMDSv2", "Azure Security", "Container Hardening", "CloudTrail Logging"],
        "Web Application Security": ["OWASP Top 10", "SQL Injection", "XSS", "SSRF", "Authentication Bypasses", "Burp Suite"],
        "Active Directory Security": ["Kerberoasting", "Golden Ticket", "LSASS Memory Inspection", "Privilege Escalation"],
    },
    "Software Engineering": {
        "Architecture & Systems": ["Distributed Systems", "Caching & Concurrency", "REST & WebSockets", "Microservices"],
        "DevSecOps & CI/CD": ["Docker", "Kubernetes RBAC", "GitHub Actions", "SAST/DAST", "Terraform"],
        "Data & Algorithms": ["Data Structures", "Time Complexity", "Database Indexing", "SQL & Query Optimization"],
    },
}


class SkillGraph:
    def get_all_skills(self) -> List[str]:
        skills = set()
        for domain, subdomains in SKILL_TAXONOMY.items():
            for subdomain, skill_list in subdomains.items():
                skills.add(subdomain)
                for s in skill_list:
                    skills.add(s)
        return sorted(list(skills))

    def get_domain_for_skill(self, skill_name: str) -> Dict[str, str]:
        for domain, subdomains in SKILL_TAXONOMY.items():
            for subdomain, skill_list in subdomains.items():
                if skill_name.lower() == subdomain.lower() or any(skill_name.lower() == s.lower() for s in skill_list):
                    return {"domain": domain, "subdomain": subdomain}
        return {"domain": "General Technical", "subdomain": "Security Engineering"}


skill_graph = SkillGraph()
