import { TranscriptMessage } from '../types';

export const mockInitialTranscript: TranscriptMessage[] = [
  {
    id: 'tr-001',
    timestamp: '00:05',
    sender: 'system',
    text: 'Session initialized. Adaptive Adversary mode engaged. Fact Checking active. Multimodal signal ingestion online.',
  },
  {
    id: 'tr-002',
    timestamp: '00:15',
    sender: 'ai',
    text: 'Welcome Chaitanya. We are examining enterprise resilience and incident response. Here is your scenario: Explain how you would investigate a suspected lateral movement attack inside a zero-trust enterprise network.',
    aiStateAtTime: 'SPEAKING',
    highlights: [
      { text: 'zero-trust enterprise network', type: 'keyword' },
      { text: 'lateral movement attack', type: 'keyword' },
    ],
  },
  {
    id: 'tr-003',
    timestamp: '00:45',
    sender: 'user',
    text: 'To investigate lateral movement, I would first check our centralized SIEM logs, specifically looking for Windows Event ID 4624 with Logon Type 3, which indicates network logons. I would also inspect EDR telemetry to observe suspicious parent-child process relationships like cmd.exe spawning from wmiprvse.exe or psexecsvc.exe.',
    highlights: [
      { text: 'Windows Event ID 4624 with Logon Type 3', type: 'technical_claim', note: 'Accurate telemetry indicator for network logon' },
      { text: 'parent-child process relationships', type: 'keyword' },
      { text: 'wmiprvse.exe', type: 'verified_claim', note: 'WMI execution vector' },
      { text: 'psexecsvc.exe', type: 'verified_claim', note: 'PsExec service indicator' },
    ],
  },
  {
    id: 'tr-004',
    timestamp: '01:15',
    sender: 'ai',
    text: 'Good identification of logon types and process lineage. However, suppose the attacker has obtained a Kerberos Ticket Granting Ticket (TGT) via Pass-the-Ticket and is pivoting without generating new Type 3 logon events on the domain controller. How do you detect and isolate them in that specific phase?',
    aiStateAtTime: 'CHALLENGING',
    highlights: [
      { text: 'Pass-the-Ticket', type: 'debated_claim' },
      { text: 'Kerberos Ticket Granting Ticket (TGT)', type: 'keyword' },
    ],
  },
  {
    id: 'tr-005',
    timestamp: '01:50',
    sender: 'user',
    text: 'Well, um, in a Pass-the-Ticket scenario, basically the attacker injects the Kerberos ticket into memory via LSASS. To catch this, I would look for anomalous Service Principal Name (SPN) requests, mismatched client IP addresses against the Kerberos session cache, and monitor LSASS memory access events via Sysmon Event ID 10.',
    highlights: [
      { text: 'um', type: 'filler_word' },
      { text: 'basically', type: 'filler_word' },
      { text: 'Sysmon Event ID 10', type: 'technical_claim', note: 'Process access monitoring for LSASS' },
      { text: 'anomalous Service Principal Name (SPN) requests', type: 'verified_claim' },
    ],
  },
];
