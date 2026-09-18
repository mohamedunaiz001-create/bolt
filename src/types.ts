export type NavigationTab = "home" | "learn" | "knowledge" | "prelims" | "mains" | "news" | "schedule" | "planner" | "bolt";

export interface KnowledgeDocument {
  id: string;
  userId?: string;
  title: string;
  category: "2nd ARC Reports" | "Administrative Thinkers" | "Public Administration Notes" | "UPSC PYQs" | "General Studies" | "Current Affairs" | "Custom Upload";
  tags: string[];
  sourceUrl?: string;
  uploadedAt: string;
  fileSize?: string;
  chunkCount: number;
  snippet?: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  category: string;
  chunkIndex: number;
  text: string;
  keywords: string[];
  approxPage?: number;
  heading?: string;
  score?: number;
}

export interface TopicKnowledgeDiagnostic {
  topicId: string;
  topicName: string;
  knowledgeScore: number;
  signals: {
    mcqAccuracy: number; // 25% weight
    mainsPerformance: number; // 25% weight
    revisionRetention: number; // 20% weight
    questionDifficulty: number; // 15% weight
    recentPerformance: number; // 15% weight
  };
  whyWeakReasons: string[];
  priority: "High" | "Medium" | "Low";
  daysSinceLastRevision: number;
  recommendedAction: string;
}

export type AppThemeMode = "dark" | "light";

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  target: string;
  optionalSubject: string;
  avatarUrl?: string;
  studyStreakDays: number;
  totalStudyHours: number;
  questionsAttempted: number;
  mainsEvaluatedCount: number;
  overallAccuracy: number;
  themeMode?: AppThemeMode;
}

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  target: string;
  optionalSubject: string;
  createdAt: string;
}

export interface LaptopSpecs {
  deviceType: "mac_apple_silicon" | "windows_nvidia_gpu" | "pc_intel_amd_cpu" | "chromebook_tablet";
  totalRamGb: number;
  vramGb: number;
  cpuCores: number;
  storageFreeGb: number;
}

export interface ModelOption {
  id: string;
  name: string;
  type: "cloud" | "local";
  provider: string;
  parameterSize: string;
  minRamGb: number;
  minVramGb: number;
  recommendedQuant: string;
  description: string;
  strengths: string[];
  ollamaCommand: string;
  contextWindow: string;
  huggingFaceModelId?: string;
  ollamaModelTag?: string;
}

export interface ModelRecommendation {
  recommendedModelId: string;
  fitLevel: "perfect" | "good" | "tight" | "insufficient";
  headline: string;
  reason: string;
  expectedTokensPerSec: number;
  memoryBudget: {
    modelWeightsGb: number;
    kvCacheGb: number;
    osOverheadGb: number;
    totalRequiredGb: number;
  };
  alternativeModelId?: string;
}

export interface ActiveModelConfig {
  selectedModelId: string;
  modelType: "cloud" | "local";
  localEndpoint: string;
  temperature: number;
  contextWindowTokens: number;
  activeAdapter?: string;
  systemPromptOverride?: string;
  huggingFaceModelId?: string;
  ollamaModelTag?: string;
}

export interface TrainingConfig {
  baseModelId: string;
  huggingFaceModelId: string;
  ollamaModelTag?: string;
  datasetName: string;
  epochs: number;
  learningRate: string;
  loraRank: number;
  loraAlpha: number;
  batchSize: number;
  quantization: "4bit" | "8bit" | "16bit";
  targetModules: string;
}

export interface BoltAppContext {
  user: UserProfile;
  optionalSubject: string;
  syllabus: {
    overallCompletion: number;
    paper1Completion: number;
    paper2Completion: number;
    totalTopics: number;
    completedTopics: number;
    weakTopics: { id: string; name: string; paper: string; score: number; status: string }[];
    strongTopics: { id: string; name: string; paper: string; score: number; status: string }[];
  };
  mainsPerformance: {
    evaluatedCount: number;
    averageScore: number;
    recentEvaluations: { question: string; score: number; maxMarks: number; date: string }[];
  };
  prelimsPerformance: {
    questionsAttempted: number;
    accuracyPercentage: number;
  };
  revisionStatus: {
    dueCount: number;
    urgentTopics: string[];
  };
  studySchedule: {
    streakDays: number;
    totalStudyHours: number;
    weeklyPlannedHours: number;
    weeklyTrackedHours: number;
    todayPlannedUnits: string[];
  };
  currentAffairs: {
    bookmarkedCount: number;
    recentHeadlines: string[];
  };
  systemContextText: string;
}

export interface TrainingRunState {
  isTraining: boolean;
  status: "idle" | "running" | "completed" | "paused";
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  currentLoss: number;
  lossHistory: { step: number; loss: number }[];
  logs: string[];
  savedAdapters: {
    id: string;
    name: string;
    baseModel: string;
    date: string;
    finalLoss: number;
  }[];
}

export type TopicStatus = "not_started" | "learning" | "practicing" | "strong" | "needs_revision";

export interface SubtopicItem {
  id: string;
  name: string;
  status: TopicStatus;
  confidence: number; // 0 - 100
}

export interface SyllabusTopic {
  id: string;
  name: string;
  paper: "Paper 1" | "Paper 2" | "GS 1" | "GS 2" | "GS 3" | "GS 4";
  subject: "Public Administration" | "General Studies";
  completionPercentage: number;
  knowledgeScore: number; // Multi-signal metric
  mcqAccuracy: number; // e.g. 68%
  mainsAverageScore: number; // e.g. 7.5 / 15
  attemptsCount: number;
  status: TopicStatus;
  lastStudiedDate: string;
  lastRevisedDate: string;
  commonMistakes: string[];
  keyThinkers?: string[];
  subtopics: SubtopicItem[];
}

export interface PrelimsQuestion {
  id: string;
  questionNumber: number;
  subject: string;
  topic: string;
  tags: string[];
  isCurrentAffairs: boolean;
  questionText: string;
  statements?: string[];
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
  optionAnalysis: {
    optionKey: string;
    analysis: string;
    isCorrect: boolean;
  }[];
  relatedConcept: string;
  source: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface MainsModelAnswer {
  id: string;
  year: number;
  paper: string;
  subject: string;
  topic: string;
  marks: number;
  questionText: string;
  directive: string;
  tags: string[];
  introduction: string;
  diagramTitle?: string;
  diagramNodes?: {
    id: string;
    title: string;
    points: string[];
  }[];
  bodySections: {
    title: string;
    points: string[];
    examples?: string;
    thinkers?: string[];
  }[];
  criticalAnalysis: string[];
  wayForward: string[];
  conclusion: string;
  relevantCommitteesAndArticles: string[];
}

export interface EvaluationCriteria {
  questionDemand: number; // out of 10
  content: number;
  structure: number;
  analysis: number;
  examples: number;
  conclusion: number;
  // 7-Dimension UPSC Mains Rubric Breakdown
  introductionScore?: number; // out of 1.5
  conceptualClarityScore?: number; // out of 2.0
  contentDemandScore?: number; // out of 4.0
  analysisScore?: number; // out of 2.0
  examplesAndThinkersScore?: number; // out of 1.5
  structureScore?: number; // out of 1.0
  conclusionScore?: number; // out of 1.0
}

export interface MainsAnswerEvaluation {
  id: string;
  questionId?: string;
  questionText: string;
  subject: string;
  submittedDate: string;
  score: number;
  maxMarks: number;
  criteria: EvaluationCriteria;
  whatWentWell: string[];
  needsImprovement: string[];
  missingDimensions: string[];
  repeatedWeaknesses?: string[];
  boltFeedback: string;
  studentAnswerText?: string;
}

export interface NewsArticle {
  id: string;
  date: string;
  source: "The Hindu" | "PIB" | "The Indian Express" | "Government Sources" | "Editorials";
  headline: string;
  page?: string;
  gsTags: string[];
  prelimsTag?: boolean;
  summary: string;
  keyHighlights: string[];
  infographic?: {
    title: string;
    mainAnchor: string;
    effectiveDate: string;
    cards: {
      title: string;
      subtitle: string;
      value?: string;
      iconType?: string;
    }[];
    themes: string[];
  };
  detailedInsights: string[];
  keyConceptsInvolved: string[];
  upscRelevance: {
    prelimsFact: string;
    mainsRelevance: string;
    possibleMainsQuestion: string;
  };
  isBookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  mode?: "general" | "public_admin" | "mains_eval" | "progress_analyst";
  citations?: {
    documentTitle: string;
    category: string;
    approxPage?: number;
    excerpt?: string;
  }[];
  actionCards?: {
    type: "test" | "topic" | "model_answer";
    title: string;
    description: string;
    actionLabel: string;
    targetTab?: NavigationTab;
  }[];
}

export interface ModelSettingsState {
  providerName: string;
  modelVersion: string;
  temperature: number;
  contextSize: string;
  mode: "Cloud Live Engine" | "Optimized Reasoning";
  trainingDatasetsCount: number;
  activeVersion: string;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  category: "unit_completion" | "high_score" | "streak" | "mains_mastery" | "syllabus_milestone";
  badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  iconName: "trophy" | "target" | "flame" | "award" | "book-open" | "check-circle" | "zap" | "star";
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  criteria: string;
  currentValue?: number | string;
  targetValue?: number | string;
  rewardXp: number;
}

export interface FlashcardQuizChallenge {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ThinkerFlashcard {
  id: string;
  thinkerOrConcept: string;
  category: "thinker" | "concept" | "administrative_model" | "committee_reform";
  paper: "Paper 1" | "Paper 2" | "Both";
  unit: string;
  eraOrPeriod?: string;
  frontPrompt: string;
  keyQuoteOrTagline?: string;
  clues?: string[];
  coreThesis: string;
  keyWorksAndYear?: string[];
  keyConcepts: string[];
  criticalCritique: string;
  mainsExamApplication: string;
  mnemonicOrMemoryHook?: string;
  quizChallenge: FlashcardQuizChallenge;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface FlashcardProgress {
  cardId: string;
  status: "unseen" | "mastered" | "learning" | "needs_review";
  lastReviewed?: string;
  reviewCount: number;
  isStarred?: boolean;
}

export interface StudyGoalCategory {
  id: "pub_ad" | "prelims";
  name: string;
  targetHours: number; // e.g. 3.5
  completedHours: number; // e.g. 2.0
  activeTopic: string;
  subtopicNotes?: string;
  lastUpdated?: string;
}

export interface DailyStudyGoalsData {
  date: string; // YYYY-MM-DD
  pubAdGoal: StudyGoalCategory;
  prelimsGoal: StudyGoalCategory;
  notes?: string;
}

export type StudySubjectCategory =
  | "pub_ad"
  | "prelims"
  | "mains"
  | "current_affairs"
  | "gs_core"
  | "revision"
  | "csat";

export interface TimetableSlot {
  id: string;
  startTime: string; // e.g. "06:00"
  endTime: string; // e.g. "08:30"
  title: string;
  subject: StudySubjectCategory;
  topicNotes: string;
  isCompleted?: boolean;
  priority: "high" | "medium" | "low";
  dayOfWeek?: "all" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  syllabusUnitId?: string;
  syllabusUnitTitle?: string;
  estimatedMinutes?: number; // Estimated time required for this syllabus unit in minutes
  timeSpentMinutes?: number; // Actual time spent so far on this syllabus unit in minutes
}

export interface TimetablePreset {
  id: string;
  name: string;
  targetHours: number;
  description: string;
  iconName?: string;
  slots: TimetableSlot[];
}

export type TimerMode = "pomodoro" | "deep_work" | "mains_sim" | "stopwatch";
export type TimerPhase = "focus" | "short_break" | "long_break";
export type AmbientSoundType = "none" | "rain" | "clock" | "whitenoise";

export interface StudySessionLog {
  id: string;
  timestamp: string;
  date: string;
  subject: StudySubjectCategory;
  topic: string;
  durationMinutes: number;
  mode: TimerMode;
  notes?: string;
}

export interface StudyTimerGlobalState {
  mode: TimerMode;
  phase: TimerPhase;
  durationSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  subject: StudySubjectCategory;
  topic: string;
  pomodorosCompleted: number;
  ambientSound: AmbientSoundType;
}

export type WeekDayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface PlannedSyllabusUnit {
  id: string; // unique scheduled unit id
  topicId: string; // SyllabusTopic id
  topicName: string;
  paper: "Paper 1" | "Paper 2" | "GS 1" | "GS 2" | "GS 3" | "GS 4";
  subject: "Public Administration" | "General Studies";
  subtopicTitle?: string;
  estimatedMinutes: number; // e.g. 90
  completedMinutes: number; // e.g. 0 to 90
  isCompleted: boolean;
  notes?: string;
  priority: "high" | "medium" | "low";
  day: WeekDayId;
  orderIndex: number;
}

export interface WeeklyStudyPlan {
  id: string;
  weekStartDate: string; // e.g. "2026-09-14"
  title: string;
  targetDailyHours: number;
  strategy: "weakness_first" | "balanced" | "sprint";
  plannedUnits: PlannedSyllabusUnit[];
}

export interface UserFullProgressData {
  user: UserProfile;
  topics: SyllabusTopic[];
  evaluations: MainsAnswerEvaluation[];
  timetableSlots: TimetableSlot[];
  studySessions: StudySessionLog[];
  prelimsAttempts?: Record<string, { selectedOption: string; isCorrect: boolean; timestamp: string }>;
  bookmarks?: string[];
  lastSavedAt?: string;
}


