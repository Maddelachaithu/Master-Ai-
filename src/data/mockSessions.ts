import { InterviewSession } from '../types';

export const mockSessions: InterviewSession[] = [
  {
    id: 'session-001',
    title: 'Enterprise Incident Response & Lateral Movement',
    date: '2026-09-24T10:30:00Z',
    mode: 'cybersecurity',
    topic: 'Lateral Movement & Threat Hunting',
    difficulty: 'advanced',
    durationSeconds: 1122, // 18m 42s
    score: 84,
    status: 'completed',
    reportId: 'rep-001',
  },
  {
    id: 'session-002',
    title: 'High-Throughput Rate Limiting & Distributed Consensus',
    date: '2026-09-21T15:15:00Z',
    mode: 'technical',
    topic: 'Distributed Systems & Microservices',
    difficulty: 'expert',
    durationSeconds: 1240, // 20m 40s
    score: 79,
    status: 'completed',
    reportId: 'rep-002',
  },
  {
    id: 'session-003',
    title: 'Autonomous AI Liability & Legal Personhood',
    date: '2026-09-18T19:00:00Z',
    mode: 'debate',
    topic: 'AI Ethics & Corporate Governance',
    difficulty: 'advanced',
    durationSeconds: 890, // 14m 50s
    score: 88,
    status: 'completed',
    reportId: 'rep-003',
  },
  {
    id: 'session-004',
    title: 'Production Outage Recovery & Executive Communication',
    date: '2026-09-15T11:45:00Z',
    mode: 'behavioral',
    topic: 'Engineering Leadership & STAR Response',
    difficulty: 'intermediate',
    durationSeconds: 680, // 11m 20s
    score: 91,
    status: 'completed',
    reportId: 'rep-004',
  },
  {
    id: 'session-005',
    title: 'Cloud IAM Breach Containment & Forensics',
    date: '2026-09-11T14:20:00Z',
    mode: 'stress',
    topic: 'AWS Cloud Security & Forensics',
    difficulty: 'expert',
    durationSeconds: 780, // 13m 00s
    score: 74,
    status: 'completed',
    reportId: 'rep-005',
  },
  {
    id: 'session-006',
    title: 'Core Memory Models & Garbage Collection Internals',
    date: '2026-09-08T09:10:00Z',
    mode: 'rapid_fire',
    topic: 'JVM & Go Runtime Internals',
    difficulty: 'advanced',
    durationSeconds: 420, // 7m 00s
    score: 81,
    status: 'completed',
    reportId: 'rep-006',
  }
];
