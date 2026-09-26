import { InterviewQuestion } from '../types';

export const mockCybersecurityQuestions: InterviewQuestion[] = [
  {
    id: 'q-cyber-01',
    questionNumber: 1,
    questionText: 'Explain how you would investigate a suspected lateral movement attack inside a zero-trust enterprise network.',
    category: 'Cybersecurity',
    subTopic: 'Incident Response & Threat Hunting',
    difficulty: 'advanced',
    expectedConcepts: [
      'Kerberos Ticket Granting (Pass-the-Ticket)',
      'Windows Event ID 4624 (Type 3 / Type 10 logon)',
      'EDR network telemetry & process tree analysis',
      'SMB / RPC / PowerShell remoting inspection',
      'Micro-segmentation firewall logs & log correlation'
    ],
    sampleFollowUps: [
      'How would you distinguish legitimate admin PsExec execution from malicious lateral movement?',
      'If the attacker used Pass-the-Hash instead of Pass-the-Ticket, which memory artifacts would you triage?'
    ],
    adversarialTraps: [
      'Assuming network perimeter firewalls stop internal east-west traversal',
      'Overlooking credential caching in LSASS'
    ],
    hints: [
      'Focus on authentication telemetry, RPC/SMB activity, and EDR process lineage.'
    ]
  },
  {
    id: 'q-cyber-02',
    questionNumber: 2,
    questionText: 'An attacker has compromised an AWS IAM role with AdministratorAccess in your production cluster. Walk me through your first 15 minutes of containment.',
    category: 'Cybersecurity',
    subTopic: 'Cloud Security & Incident Containment',
    difficulty: 'expert',
    expectedConcepts: [
      'Revoke active STS session tokens with IAM inline policy denial',
      'Attach explicit DenyAll boundary policy to the compromised role',
      'Audit AWS CloudTrail & GuardDuty for anomalous API calls',
      'Isolate compromised EC2/EKS instances (security group quarantine)',
      'Preserve volatile memory & disk snapshots for forensics'
    ],
    sampleFollowUps: [
      'If the attacker generated new IAM access keys before you revoked STS, how do you discover and revoke them?',
      'How do you prevent persistence mechanisms established via AWS Lambda or KMS?'
    ],
    adversarialTraps: [
      'Deleting the IAM role immediately (destroys historical attribution and locks out legit pipelines without forensics)',
      'Assuming STS sessions terminate automatically when an IAM role is edited'
    ]
  },
  {
    id: 'q-cyber-03',
    questionNumber: 3,
    questionText: 'In a microservices architecture, how do you mitigate Server-Side Request Forgery (SSRF) when services must fetch user-supplied webhook URLs?',
    category: 'Cybersecurity',
    subTopic: 'Application Security & Architecture',
    difficulty: 'advanced',
    expectedConcepts: [
      'Strict IP address allowlisting / denylisting (RFC 1918, link-local 169.254.169.254, loopback)',
      'DNS resolution verification before connection (prevent DNS Rebinding / Time-of-Check Time-of-Use)',
      'Dedicated egress proxy in an isolated network enclave',
      'Disabling HTTP redirection follow behavior on outbound clients',
      'IMDSv2 requirement on cloud infrastructure'
    ],
    sampleFollowUps: [
      'How do you protect against DNS rebinding where the hostname resolves to a public IP first, then private IP on fetch?',
      'Why is simply filtering "169.254.169.254" in URL strings insufficient?'
    ]
  }
];

export const mockTechnicalQuestions: InterviewQuestion[] = [
  {
    id: 'q-tech-01',
    questionNumber: 1,
    questionText: 'Design a globally distributed rate limiter that handles 500,000 requests per second with sub-5ms latency and prevents sliding-window stampedes.',
    category: 'System Design',
    subTopic: 'Distributed Systems & Scalability',
    difficulty: 'expert',
    expectedConcepts: [
      'Token Bucket / Sliding Window Log vs Sliding Window Counter',
      'Redis Cluster with Lua Scripts for atomic multi-key operations',
      'Local in-memory token buffering at API Gateway edge (batching sync)',
      'Eventual consistency vs strict consistency tradeoffs',
      'Graceful degradation / shedding under partition'
    ],
    sampleFollowUps: [
      'What happens when the Redis shard hosting a hot tenant goes down during peak traffic?',
      'How do you handle clock drift across edge PoPs when computing sliding window timestamps?'
    ]
  },
  {
    id: 'q-tech-02',
    questionNumber: 2,
    questionText: 'Explain the internal mechanism of Go garbage collection or JVM ZGC and how it achieves sub-millisecond STW pause times.',
    category: 'Programming',
    subTopic: 'Runtime Internals & Memory Management',
    difficulty: 'advanced',
    expectedConcepts: [
      'Tricolor marking algorithm (White, Grey, Black)',
      'Write barriers / Read barriers (load barriers in ZGC)',
      'Concurrent mark & sweep phases',
      'Colored pointers and memory multi-mapping',
      'Compaction & fragmentation mitigation'
    ]
  }
];

export const mockDebateQuestions: InterviewQuestion[] = [
  {
    id: 'q-debate-01',
    questionNumber: 1,
    questionText: 'Defend your stance: Should autonomous AI systems have legal personhood and liability for autonomous actions in commercial markets?',
    category: 'Debate',
    subTopic: 'AI Ethics & Legal Liability',
    difficulty: 'advanced',
    expectedConcepts: [
      'Vicarious liability vs Strict liability models',
      'Corporate personhood analogies vs machine autonomy',
      'Incentive structures for AI developers and operators',
      'Insurance backstops and algorithmic indemnity funds',
      'Moral agency vs economic agency'
    ],
    sampleFollowUps: [
      'If an autonomous AI executes a flash crash using novel emergent trading strategies, who pays the victims if the company claimed no foreknowledge?',
      'Does granting legal personhood create an easy shield for rogue founders to avoid personal accountability?'
    ]
  }
];

export const mockBehavioralQuestions: InterviewQuestion[] = [
  {
    id: 'q-beh-01',
    questionNumber: 1,
    questionText: 'Tell me about a critical production outage caused by your own team. How did you manage stakeholder friction while leading the technical recovery?',
    category: 'Behavioral',
    subTopic: 'Crisis Leadership & STAR Method',
    difficulty: 'intermediate',
    expectedConcepts: [
      'Situation context with measurable blast radius',
      'Blameless post-mortem culture with psychological safety',
      'Real-time status communication cadences for non-technical leadership',
      'Root cause analysis (5 Whys) and permanent architectural guardrails',
      'Accountability ownership without throwing peers under the bus'
    ]
  }
];
