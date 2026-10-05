import { PerformanceReport } from '../types';

export const mockPerformanceReport: PerformanceReport = {
  sessionId: 'session-001',
  sessionDate: '2026-09-24T10:30:00Z',
  mode: 'cybersecurity',
  topic: 'Lateral Movement & Threat Hunting',
  difficulty: 'advanced',
  durationSeconds: 1122,
  overallScore: 84,
  grade: 'A',
  summary:
    'Demonstrated robust foundational knowledge in Active Directory authentication attacks and telemetry triage. Successfully identified Kerberos ticket abuse and Windows Event ID 4624 log indicators. Handled high-pressure adversarial probing well, though initial response missed LSASS memory artifact preservation.',
  adversaryVerdict:
    'Strong defensive posture with clear analytical structure. Easily countered perimeter assumptions. Needs deeper familiarity with memory forensics under Pass-the-Hash scenarios.',
  scoreBreakdown: {
    knowledge: 82,
    reasoning: 88,
    communication: 84,
    adaptability: 79,
    presentation: 81,
    knowledgeExplanation:
      'Strong coverage of network telemetry, Windows security event IDs, and EDR process trees. Missed explicit reference to Pass-the-Ticket Kerberos SPN ticket anomalies in the initial answer.',
    reasoningExplanation:
      'Excellent deductive reasoning when challenged on legitimate vs malicious PsExec execution. Logically separated parent-child process relationships.',
    communicationExplanation:
      'Clear, articulate pacing with minimal hesitations (3.2 filler words/min average). Used concise technical terminology with structured step-by-step phrasing.',
    adaptabilityExplanation:
      'Quickly pivoted when the AI introduced an unexpected constraint (attacker operating with compromised local admin privileges).',
    presentationExplanation:
      'Maintained consistent forward engagement (86% observed eye-contact consistency). Steady posture with minimal disengagement markers.'
  },
  visionMetrics: {
    faceDetected: true,
    faceConfidence: 94,
    cameraEngagement: 86,
    headYaw: 2,
    headPitch: -1,
    headRoll: 0,
    headOrientation: 'Centered',
    postureConsistency: 91,
    postureState: 'GOOD_ALIGNMENT',
    postureFeedback: 'Your posture is consistent and upright.',
    frameQuality: 92,
    frameQualityState: 'Good',
    frameFeedback: 'Camera framing looks good.',
    lightingQualityScore: 90,
    lightingState: 'GOOD_LIGHTING',
    lightingFeedback: 'Lighting looks good.',
    timestamp: Date.now(),
    additionalPersonDetected: false,
    backgroundPersonConfirmed: false,
    backgroundMovementDetected: false,
    detectedPersonsCount: 1,
    environmentStatus: 'CLEAR',
    environmentStatusText: '🟢 Environment Clear',
    activeWarningMessage: null,
    backgroundPersonEventsCount: 0,
    backgroundMovementEventsCount: 0,
    backgroundPersonDurationSeconds: 0,
    postureWarningsCount: 0,
    eyeContactConsistency: 86,
    facePresent: true,
    postureObservation: 'Centered & Upright',
    headStability: 89,
    lightingQuality: 'Optimal',
    engagementScore: 88,
  },
  environmentMonitoring: {
    backgroundPersonEvents: 0,
    backgroundMovementEvents: 0,
    totalDetectedDurationSeconds: 0,
    postureWarnings: 0,
    environmentEvents: [],
  },
  voiceMetrics: {
    speakingRate: 136, // WPM
    pauseDuration: 1.2, // seconds
    fillerWordCount: 4,
    fillerWordsList: [
      { word: 'um', count: 2 },
      { word: 'like', count: 1 },
      { word: 'basically', count: 1 }
    ],
    answerDuration: 245,
    pitchStabilityScore: 88,
    articulationScore: 91,
  },
  questionEvaluations: [
    {
      questionId: 'q-cyber-01',
      questionNumber: 1,
      questionText: 'Explain how you would investigate a suspected lateral movement attack inside a zero-trust enterprise network.',
      score: 82,
      strength: 'Clearly articulated initial endpoint triage, Windows Event ID 4624 (Logon Type 3), and RPC/SMB inspection.',
      improvement: 'Did not immediately highlight volatile LSASS memory dumps before the adversary follow-up challenge.',
      followUpReason: 'The interviewer generated a deeper question because the original answer missed memory artifact triage under credential harvesting.',
      userAnswerSummary: 'Outlined EDR query methodology, network micro-segmentation flow monitoring, and authentication log correlation across domain controllers.',
      adversaryObservation: 'Candidate did not fold under pressure when challenged on PsExec vs WMI execution heuristics.',
      conceptsCovered: [
        'Kerberos Ticket Granting (Pass-the-Ticket)',
        'Windows Event ID 4624 (Type 3 / Type 10 logon)',
        'EDR network telemetry & process tree analysis',
        'SMB / RPC inspection'
      ],
      conceptsMissed: [
        'LSASS memory triage & credential caching analysis'
      ],
      timeline: [
        { time: '00:42', event: 'Master AI presented core lateral movement scenario', type: 'question' },
        { time: '01:10', event: 'Candidate delivered structured 3-phase investigation plan', type: 'answer' },
        { time: '01:38', event: 'Fact Checker verified claim on Event ID 4624 Logon Type 3 telemetry', type: 'fact_check' },
        { time: '02:04', event: 'Interviewer challenged candidate on distinguishing legitimate PsExec', type: 'challenge' },
        { time: '02:40', event: 'Candidate counter-argued with parent-child process lineage verification', type: 'answer' }
      ]
    },
    {
      questionId: 'q-cyber-02',
      questionNumber: 2,
      questionText: 'An attacker has compromised an AWS IAM role with AdministratorAccess in your production cluster. Walk me through your first 15 minutes of containment.',
      score: 86,
      strength: 'Immediately prioritized STS token revocation via inline deny policies rather than dangerously deleting the role.',
      improvement: 'Could have detailed GuardDuty finding triage workflows with higher specificity.',
      followUpReason: 'Adversary tested candidate on persistence mitigation across AWS Lambda triggers.',
      userAnswerSummary: 'Explained STS revocation, explicit DenyAll boundary attachment, network enclave quarantine, and snapshot preservation.',
      adversaryObservation: 'Decisive emergency protocol structure. Good composure under simulated urgent timeline.',
      conceptsCovered: [
        'Revoke active STS session tokens with IAM inline policy denial',
        'Attach explicit DenyAll boundary policy to the compromised role',
        'Audit AWS CloudTrail & GuardDuty',
        'Isolate compromised EC2/EKS instances'
      ],
      conceptsMissed: [
        'KMS key policy inspection for backdoor access'
      ],
      timeline: [
        { time: '04:15', event: 'Master AI triggered emergency cloud containment challenge', type: 'question' },
        { time: '04:48', event: 'Candidate detailed immediate 5-minute containment actions', type: 'answer' },
        { time: '05:30', event: 'Interviewer probed on hidden persistence mechanisms', type: 'followup' },
        { time: '06:15', event: 'Candidate explained CloudTrail event correlation', type: 'answer' }
      ]
    },
    {
      questionId: 'q-cyber-03',
      questionNumber: 3,
      questionText: 'In a microservices architecture, how do you mitigate Server-Side Request Forgery (SSRF) when services must fetch user-supplied webhook URLs?',
      score: 84,
      strength: 'Highlighted DNS rebinding defenses (Time-of-Check Time-of-Use) and egress enclave proxies.',
      improvement: 'Mentioned IMDSv2 only after direct prompt on cloud metadata extraction.',
      followUpReason: 'Pushed candidate to explain why simple string regex filtering for private IPs fails against hex/octal encoded URLs.',
      userAnswerSummary: 'Prescribed strict egress proxying, DNS pre-resolution verification, and disabling HTTP client automatic redirects.',
      adversaryObservation: 'High technical precision regarding network socket mechanics.',
      conceptsCovered: [
        'Strict IP address allowlisting / denylisting (RFC 1918)',
        'DNS resolution verification before connection',
        'Dedicated egress proxy in an isolated network enclave',
        'Disabling HTTP redirection follow behavior'
      ],
      conceptsMissed: [
        'IMDSv2 hop-limit configuration'
      ],
      timeline: [
        { time: '08:00', event: 'Master AI presented webhook architecture SSRF challenge', type: 'question' },
        { time: '08:35', event: 'Candidate proposed DNS pre-resolution checking architecture', type: 'answer' },
        { time: '09:12', event: 'Interviewer simulated attacker using octal/hex IP encoding', type: 'challenge' },
        { time: '09:50', event: 'Candidate explained socket-level IP binding resolution', type: 'answer' }
      ]
    }
  ],
  keyStrengths: [
    'Systematic threat modeling & incident response prioritization',
    'Deep understanding of Windows telemetry (Event ID 4624) and Active Directory authentication',
    'Composed delivery under adversarial follow-ups and rapid challenge prompts',
    'Structured answer delivery following action-oriented frameworks'
  ],
  areasToImprove: [
    'Proactively address memory forensics (LSASS triage) in initial answers',
    'Reduce filler words during rapid challenge transitions (currently ~4 instances)',
    'Ensure cloud metadata service versioning (IMDSv2) is explicitly mentioned in SSRF defenses',
    'Maintain consistent eye alignment when formulating complex technical thoughts'
  ],
  recommendedPractice: [
    'Rapid-Fire Incident Response Drills: Advanced Active Directory attacks',
    'Cloud Security Containment Simulator: AWS/GCP credential compromise',
    'STAR Method Architectural Justification under AI Adversarial Challenge',
    'Eye-Contact Consistency & Micro-Pacing Module'
  ]
};
