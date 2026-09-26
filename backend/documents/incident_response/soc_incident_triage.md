# Security Operations Center (SOC) Incident Triage and Containment

## SOC Triage Workflow
1. **Detection & Ingestion**: Correlate SIEM alerts (e.g. Splunk, Microsoft Sentinel) with EDR signals (CrowdStrike Falcon, Microsoft Defender for Endpoint).
2. **Scoping & Verification**: Verify True Positive vs False Positive by inspecting process ancestry, network parentage, and file hashes on VirusTotal / internal sandboxes.
3. **Containment**:
   - Host isolation via EDR network containment.
   - Account revocation and session termination in Active Directory / Azure Entra ID.
   - Blocking malicious IPs/domains on edge firewalls.
4. **Eradication**: Remove persistence mechanisms (scheduled tasks, run keys, backdoor services).
5. **Post-Incident Lessons**: Document timeline, root cause analysis, and update detection rules.
