import { ImprovementGoal } from '../types';

export const mockImprovementGoals: ImprovementGoal[] = [
  {
    id: 'goal-01',
    title: 'Filler Word Elimination',
    category: 'Communication',
    currentMetric: '3.4 filler words / min',
    targetMetric: '< 1.0 filler word / min',
    progressPercent: 72,
    actionItems: [
      'Practice intentional 1-second pauses instead of "um" or "like" when formulating complex points',
      'Complete 3 Rapid-Fire constraint drills where answers are capped at 45 seconds',
      'Review annotated transcripts in the History tab to identify personal filler triggers'
    ]
  },
  {
    id: 'goal-02',
    title: 'Volatile Memory & Forensics Coverage',
    category: 'Technical',
    currentMetric: 'Missed in 35% of IR questions',
    targetMetric: '100% proactive memory artifact inclusion',
    progressPercent: 60,
    actionItems: [
      'Explicitly reference LSASS memory dumps, Volatility plugin triage, and Sysmon Event 10 in initial responses',
      'Drill on Pass-the-Ticket & Pass-the-Hash detection scenarios in Cybersecurity mode'
    ]
  },
  {
    id: 'goal-03',
    title: 'Camera & Visual Engagement Stability',
    category: 'Delivery',
    currentMetric: '86% observed eye-contact consistency',
    targetMetric: '92% observed consistency',
    progressPercent: 85,
    actionItems: [
      'Align camera at eye-level to maintain neutral focal posture',
      'Reduce screen glances when reading challenging follow-up prompts'
    ]
  },
  {
    id: 'goal-04',
    title: 'STAR Structured Delivery under Adversarial Challenge',
    category: 'Reasoning',
    currentMetric: '88/100 Reasoning Score',
    targetMetric: '95/100 Reasoning Score',
    progressPercent: 80,
    actionItems: [
      'Structure behavioral answers strictly: Situation → Task → Action → Measurable Result',
      'Proactively defend against counter-arguments before the AI introduces them'
    ]
  }
];

export const mockActionableRoadmap = [
  {
    phase: 'Week 1: Foundations & Cadence',
    status: 'completed',
    items: ['Complete 5 Incident Response drills', 'Lower speaking pace from 158 to 138 WPM', 'Calibrate camera alignment & lighting']
  },
  {
    phase: 'Week 2: Adversarial Stress & Debate',
    status: 'in_progress',
    items: ['Practice 3 AI Policy Debates against Aggressive AI personality', 'Target zero unverified technical claims', 'Maintain >85% eye contact under counter-challenges']
  },
  {
    phase: 'Week 3: Executive Behavioral & STAR Drills',
    status: 'upcoming',
    items: ['Complete 4 Leadership Crisis STAR interviews', 'Address failure post-mortems with blameless accountability frameworks']
  },
  {
    phase: 'Week 4: Expert Distributed Systems Mastery',
    status: 'upcoming',
    items: ['Handle 500k RPS rate limiter & consensus failure mode scenarios', 'Achieve 90+ overall benchmark score']
  }
];
