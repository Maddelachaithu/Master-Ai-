export interface ScoreTrendDataPoint {
  date: string;
  overall: number;
  technical: number;
  communication: number;
  reasoning: number;
}

export interface MetricOverTimePoint {
  date: string;
  speakingRate: number; // WPM
  fillerWords: number; // Count
  eyeContact: number; // %
  answerDuration: number; // Seconds
}

export interface DomainProficiency {
  subject: string;
  score: number;
  fullMark: number;
  benchmark: number;
}

export interface PracticeFrequencyPoint {
  day: string;
  sessions: number;
  minutes: number;
}

export const mockPerformanceTrends: ScoreTrendDataPoint[] = [
  { date: 'Sep 01', overall: 68, technical: 65, communication: 70, reasoning: 69 },
  { date: 'Sep 05', overall: 72, technical: 70, communication: 74, reasoning: 71 },
  { date: 'Sep 09', overall: 75, technical: 74, communication: 77, reasoning: 74 },
  { date: 'Sep 13', overall: 78, technical: 76, communication: 80, reasoning: 79 },
  { date: 'Sep 17', overall: 81, technical: 77, communication: 83, reasoning: 82 },
  { date: 'Sep 21', overall: 80, technical: 79, communication: 84, reasoning: 81 },
  { date: 'Sep 24', overall: 84, technical: 82, communication: 86, reasoning: 88 },
];

export const mockMetricTrends: MetricOverTimePoint[] = [
  { date: 'Sep 01', speakingRate: 158, fillerWords: 14, eyeContact: 64, answerDuration: 190 },
  { date: 'Sep 05', speakingRate: 152, fillerWords: 11, eyeContact: 70, answerDuration: 175 },
  { date: 'Sep 09', speakingRate: 146, fillerWords: 9, eyeContact: 76, answerDuration: 160 },
  { date: 'Sep 13', speakingRate: 142, fillerWords: 7, eyeContact: 81, answerDuration: 150 },
  { date: 'Sep 17', speakingRate: 139, fillerWords: 6, eyeContact: 83, answerDuration: 145 },
  { date: 'Sep 21', speakingRate: 138, fillerWords: 5, eyeContact: 85, answerDuration: 140 },
  { date: 'Sep 24', speakingRate: 136, fillerWords: 4, eyeContact: 86, answerDuration: 135 },
];

export const mockDomainProficiencies: DomainProficiency[] = [
  { subject: 'Incident Response', score: 86, fullMark: 100, benchmark: 75 },
  { subject: 'Cloud Security', score: 82, fullMark: 100, benchmark: 72 },
  { subject: 'System Architecture', score: 79, fullMark: 100, benchmark: 70 },
  { subject: 'STAR Leadership', score: 88, fullMark: 100, benchmark: 76 },
  { subject: 'Adversarial Debate', score: 85, fullMark: 100, benchmark: 68 },
  { subject: 'Application Sec', score: 84, fullMark: 100, benchmark: 74 },
];

export const mockWeeklyPractice: PracticeFrequencyPoint[] = [
  { day: 'Mon', sessions: 2, minutes: 35 },
  { day: 'Tue', sessions: 3, minutes: 50 },
  { day: 'Wed', sessions: 1, minutes: 20 },
  { day: 'Thu', sessions: 4, minutes: 65 },
  { day: 'Fri', sessions: 2, minutes: 30 },
  { day: 'Sat', sessions: 5, minutes: 80 },
  { day: 'Sun', sessions: 3, minutes: 45 },
];
