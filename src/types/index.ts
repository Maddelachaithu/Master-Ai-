export type AIState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'ANALYZING'
  | 'FACT_CHECKING'
  | 'CHALLENGING'
  | 'SPEAKING'
  | 'FOLLOW_UP'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'EVALUATING';

export type InterviewMode =
  | 'interview'
  | 'debate'
  | 'technical'
  | 'behavioral'
  | 'cybersecurity'
  | 'stress'
  | 'rapid_fire'
  | 'custom';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type AIPersonality = 'professional' | 'strict' | 'friendly' | 'aggressive' | 'socratic';

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  subTopic: string;
  difficulty: DifficultyLevel;
  expectedConcepts: string[];
  sampleFollowUps?: string[];
  adversarialTraps?: string[];
  hints?: string[];
}

export interface TranscriptHighlight {
  text: string;
  type: 'keyword' | 'technical_claim' | 'filler_word' | 'uncertainty' | 'verified_claim' | 'debated_claim';
  note?: string;
}

export interface TranscriptMessage {
  id: string;
  timestamp: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  highlights?: TranscriptHighlight[];
  aiStateAtTime?: AIState;
  durationSeconds?: number;
  isRealTranscription?: boolean;
}

export type VisionStatus =
  | 'VISION_READY'
  | 'ANALYZING'
  | 'FACE_DETECTED'
  | 'FACE_NOT_DETECTED'
  | 'CAMERA_PERMISSION_REQUIRED'
  | 'VISION_UNAVAILABLE';

export type PostureState =
  | 'GOOD_ALIGNMENT'
  | 'SLIGHT_SLOUCH'
  | 'LEANING_LEFT'
  | 'LEANING_RIGHT'
  | 'HEAD_FORWARD'
  | 'UNKNOWN';

export type LightingState = 'GOOD_LIGHTING' | 'LOW_LIGHT' | 'HIGH_GLARE';

export type FrameQualityState = 'Excellent' | 'Good' | 'Poor';

export type HeadOrientation =
  | 'Centered'
  | 'Turned Left'
  | 'Turned Right'
  | 'Looking Up'
  | 'Looking Down'
  | 'Tilted';

export interface VisionMetrics {
  faceDetected: boolean;
  faceConfidence: number; // 0 - 100
  cameraEngagement: number; // 0 - 100 (Estimated camera engagement based on face presence & orientation)
  headYaw: number; // Approximate yaw degrees (-180 to +180)
  headPitch: number; // Approximate pitch degrees (-180 to +180)
  headRoll: number; // Approximate roll degrees (-180 to +180)
  headOrientation: HeadOrientation;
  postureConsistency: number; // 0 - 100
  postureState: PostureState;
  postureFeedback: string;
  frameQuality: number; // 0 - 100
  frameQualityState: FrameQualityState;
  frameFeedback: string;
  lightingQualityScore: number; // 0 - 100
  lightingState: LightingState;
  lightingFeedback: string;
  timestamp: number;
  
  // Backward-compatibility aliases for existing UI components
  eyeContactConsistency: number; // maps to cameraEngagement
  facePresent: boolean; // maps to faceDetected
  postureObservation: string;
  headStability: number;
  lightingQuality: 'Optimal' | 'Low Light' | 'Backlit';
  engagementScore: number;
}

export interface VisionTelemetryRecord {
  timestamp: number;
  timeOffsetSeconds: number;
  cameraEngagement: number;
  postureConsistency: number;
  faceDetected: boolean;
  frameQuality: number;
  lightingQuality: number;
  headYaw: number;
  headPitch: number;
}

export interface AnswerVisionSummary {
  answerId?: string;
  questionId: string;
  averageCameraEngagement: number;
  averagePostureConsistency: number;
  facePresenceRate: number; // 0 - 100 %
  averageFrameQuality: number;
  averageLightingQuality: number;
  dominantPostureState: PostureState;
  observations: string[];
}

export interface VoiceMetrics {
  speakingRate: number; // WPM (Words per minute, e.g. 135)
  pauseDuration: number; // Average pause length in seconds
  fillerWordCount: number;
  fillerWordsList: { word: string; count: number }[];
  answerDuration: number; // Seconds
  pitchStabilityScore: number; // 0 - 100
  articulationScore: number; // 0 - 100
}

export interface QuestionTimelineEvent {
  time: string;
  event: string;
  type: 'question' | 'answer' | 'followup' | 'challenge' | 'fact_check';
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  questionText: string;
  score: number;
  strength: string;
  improvement: string;
  followUpReason: string;
  timeline: QuestionTimelineEvent[];
  conceptsCovered: string[];
  conceptsMissed: string[];
  userAnswerSummary: string;
  adversaryObservation: string;
}

export interface ScoreBreakdown {
  knowledge: number;
  reasoning: number;
  communication: number;
  adaptability: number;
  presentation: number;
  knowledgeExplanation: string;
  reasoningExplanation: string;
  communicationExplanation: string;
  adaptabilityExplanation: string;
  presentationExplanation: string;
}

export interface PerformanceReport {
  sessionId: string;
  sessionDate: string;
  mode: InterviewMode;
  topic: string;
  difficulty: DifficultyLevel;
  durationSeconds: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Needs Practice';
  summary: string;
  adversaryVerdict: string;
  scoreBreakdown: ScoreBreakdown;
  visionMetrics: VisionMetrics;
  voiceMetrics: VoiceMetrics;
  visionTelemetry?: VisionTelemetryRecord[];
  answerVisionSummaries?: AnswerVisionSummary[];
  questionEvaluations: QuestionEvaluation[];
  keyStrengths: string[];
  areasToImprove: string[];
  recommendedPractice: string[];
}

export interface PracticeConfig {
  mode: InterviewMode;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  aiPersonality: AIPersonality;
  targetTopic: string;
  enableFactChecking: boolean;
  enableVisualAnalysis: boolean;
  enableAdaptiveDifficulty: boolean;
  enableFollowUps: boolean;
  enablePerformanceTracking: boolean;
}

export interface InterviewSession {
  id: string;
  title: string;
  date: string;
  mode: InterviewMode;
  topic: string;
  difficulty: DifficultyLevel;
  durationSeconds: number;
  score: number;
  status: 'completed' | 'in_progress' | 'cancelled';
  reportId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  streakDays: number;
  totalSessions: number;
  avgScore: number;
  technicalScore: number;
  communicationScore: number;
  targetRoles: string[];
}

export interface QuestionBankItem {
  id: string;
  title: string;
  question: string;
  category: string;
  difficulty: DifficultyLevel;
  type: 'Technical' | 'Behavioral' | 'Scenario' | 'Debate' | 'Stress' | 'Rapid Fire';
  expectedConcepts: string[];
  possibleFollowUps: string[];
  adversarialTraps: string[];
  timesPracticed: number;
  avgScore: number;
}

export interface ImprovementGoal {
  id: string;
  title: string;
  category: 'Technical' | 'Communication' | 'Delivery' | 'Reasoning';
  currentMetric: string;
  targetMetric: string;
  progressPercent: number;
  actionItems: string[];
}

// Stage 4: Multi-Agent AI, Fact-Checking & Adversarial Reasoning Types

export type AgentType = 'INTERVIEWER' | 'CHALLENGER' | 'FACT_CHECKER' | 'RUBRIC' | 'ORCHESTRATOR' | 'DEBATE';

export type AgentStatus = 'idle' | 'analyzing' | 'verifying' | 'challenging' | 'synthesizing' | 'completed';

export interface AgentEvent {
  timestamp: string;
  agent: AgentType;
  event: string;
  severity: 'info' | 'warning' | 'critical';
  details?: Record<string, any>;
}

export type FactVerdict = 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'UNVERIFIED' | 'CONTESTED';

export interface FactSource {
  title: string;
  url: string;
  snippet?: string;
  publisher?: string;
}

export interface FactCheckResult {
  claim: string;
  verdict: FactVerdict;
  confidence: number;
  sources: FactSource[];
  explanation: string;
  cached?: boolean;
}

export interface ContradictionDetails {
  contradiction_detected: boolean;
  severity?: 'low' | 'medium' | 'high';
  description?: string;
  earlier_statement?: string;
  current_statement?: string;
}

export interface ChallengeDetails {
  is_challenge_needed: boolean;
  challenge_mode: string;
  challenge_question: string;
  challenge_reason: string;
  contradiction?: ContradictionDetails;
}

export interface DebateRound {
  round_number: number;
  candidate_speech: string;
  ai_rebuttal: string;
  counterargument_focus: string;
  evidence_demanded?: string;
  claims_checked: string[];
}

export interface DebateScoreBreakdown {
  argument_strength: number;
  evidence_quality: number;
  reasoning_depth: number;
  rebuttal_effectiveness: number;
  consistency: number;
  clarity: number;
  overall_score: number;
  key_strengths: string[];
  evidence_gaps: string[];
  effective_counterarguments: string[];
}

export interface DebateState {
  session_id: string;
  topic: string;
  candidate_stance: 'FOR' | 'AGAINST';
  ai_stance: 'FOR' | 'AGAINST';
  current_round: number;
  max_rounds: number;
  rounds: DebateRound[];
  candidate_arguments: string[];
  ai_arguments: string[];
  is_completed: boolean;
  score?: DebateScoreBreakdown;
}

export interface OrchestratedTurnResponse {
  session_id: string;
  question_id: string;
  evaluation: {
    correctness: number;
    completeness: number;
    reasoning: number;
    relevance: number;
    clarity: number;
    overall: number;
    strengths: string[];
    improvements: string[];
    detected_concepts: string[];
    missed_concepts: string[];
    detected_filler_words: string[];
  };
  next_action: string;
  reason_summary: string;
  next_question_id: string;
  next_question_number: number;
  next_question: string;
  difficulty: string;
  topic: string;
  fact_check_results: FactCheckResult[];
  challenge_details?: ChallengeDetails;
  events_log: AgentEvent[];
  safe_ui_status: string;
  is_completed: boolean;
}

// Stage 5: Knowledge-Grounded RAG, Candidate Profile & Longitudinal Analytics Types

export interface ResumeProject {
  title: string;
  description: string;
  technologies: string[];
  key_highlights: string[];
}

export interface ParsedResumeData {
  name: string;
  email?: string;
  target_role: string;
  experience_level: string;
  skills: string[];
  tools: string[];
  projects: ResumeProject[];
  certifications: string[];
  education: string[];
  parsing_confidence: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  target_role: string;
  target_company?: string;
  experience_level: string;
  skills: string[];
  weak_skills: string[];
  strong_skills: string[];
  target_companies: string[];
  preferred_topics: string[];
  has_resume: boolean;
  resume_parsed_data?: ParsedResumeData;
  profile_completeness: number;
  created_at?: string;
}

export interface JobMatchAnalysis {
  target_company: string;
  target_role: string;
  job_title: string;
  matched_skills: string[];
  missing_skills: string[];
  partially_matched_skills: string[];
  recommended_interview_topics: string[];
  skills_match_percentage: number;
  extracted_requirements: string[];
}

export interface SkillStatus {
  name: string;
  category: string;
  score: number;
  status: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNASSESSED';
  attempts: number;
  weak_areas: string[];
  trend: 'improving' | 'steady' | 'declining';
  last_practiced?: string;
}

export interface DailyPracticeItem {
  duration_minutes?: number;
  recommended_minutes?: number;
  topic?: string;
  skill?: string;
  focus_area?: string;
  rationale?: string;
  reason?: string;
  recommended_difficulty?: string;
  category?: string;
}

export interface SkillGapAnalysis {
  target_role: string;
  overall_readiness_score: number;
  strong_skills: SkillStatus[];
  moderate_skills: SkillStatus[];
  weak_skills: SkillStatus[];
  unassessed_skills: SkillStatus[];
  prioritized_practice_areas: string[];
  daily_practice_plan: DailyPracticeItem[];
}

export interface RagRetrievalResult {
  chunk_id: string;
  document_name: string;
  category: string;
  topic: string;
  content: string;
  similarity_score?: number;
  score?: number;
  source: string;
  page?: number;
  metadata?: Record<string, any>;
}

export interface RagContextResponse {
  query: string;
  retrieved_chunks: RagRetrievalResult[];
  evidence_summary: string;
  sources: Array<{ title: string; source: string; category?: string }>;
  confidence: number;
  grounded: boolean;
}

export interface DocumentInfo {
  id: string;
  name: string;
  category: string;
  extension: string;
  chunks: number;
}

export interface KnowledgeStatus {
  vector_store?: {
    collection_name?: string;
    total_chunks: number;
    unique_documents: number;
    status: string;
  };
  embedding_model: string;
  supported_categories?: string[];
  categories?: Record<string, number>;
  documents?: DocumentInfo[];
  total_chunks?: number;
  total_documents?: number;
  collection_name?: string;
  index_status?: string;
  is_ready: boolean;
}

export interface InterviewHistoryRecord {
  id?: string;
  session_id: string;
  candidate_id?: string;
  date?: string;
  created_at?: string;
  title?: string;
  mode: string;
  role?: string;
  target_role?: string;
  topic?: string;
  difficulty: string;
  overall_score: number;
  questions_count?: number;
  turn_count?: number;
  challenges_count?: number;
  fact_checks_count?: number;
  duration_minutes?: number;
  duration_seconds?: number;
  is_completed?: boolean;
}

export interface SkillTrendItem {
  skill_name: string;
  category: string;
  score: number;
  trend: string;
  attempts: number;
  history?: Array<{ session: string; score: number }>;
}

export interface AnalyticsSummary {
  timeframe: string;
  total_sessions: number;
  average_overall_score?: number;
  technical_score?: number;
  average_technical_correctness?: number;
  reasoning_score?: number;
  average_reasoning_depth?: number;
  average_clarity?: number;
  camera_engagement_score?: number;
  average_camera_engagement?: number;
  average_posture_consistency?: number;
  speaking_pace_wpm?: number;
  average_speaking_rate_wpm?: number;
  total_challenges_faced?: number;
  total_claims_verified?: number;
  has_history?: boolean;
}

