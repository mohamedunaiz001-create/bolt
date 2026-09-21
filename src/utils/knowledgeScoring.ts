import { SyllabusTopic, TopicKnowledgeDiagnostic } from "../types";

export interface CalculateTopicSignalsInput {
  topic: SyllabusTopic;
  mcqAccuracy?: number;
  mainsAverageScore?: number; // out of 15 or 100%
  daysSinceLastRevision?: number;
  questionDifficultyFactor?: number; // 0 - 100
  recentPerformance?: number; // 0 - 100
  repeatedMistakesCount?: number;
}

/**
 * Calculates multi-signal knowledge analysis for a topic according to the formula:
 * Knowledge Score =
 *   25% MCQ Accuracy +
 *   25% Mains Performance +
 *   20% Revision Retention +
 *   15% Question Difficulty +
 *   15% Recent Performance
 */
export function calculateTopicKnowledgeDiagnostic(
  input: CalculateTopicSignalsInput
): TopicKnowledgeDiagnostic {
  const { topic } = input;

  // 1. MCQ Accuracy (25% weight)
  // Uses strictly real performance data (0 if not attempted)
  const rawMcq = input.mcqAccuracy ?? (topic.mcqAccuracy || 0);

  // 2. Mains Performance (25% weight)
  // Normalized to 0-100% from real evaluated submissions
  let rawMains = 0;
  if (input.mainsAverageScore !== undefined) {
    rawMains = input.mainsAverageScore <= 15
      ? Math.round((input.mainsAverageScore / 15) * 100)
      : input.mainsAverageScore;
  } else if (topic.mainsAverageScore) {
    rawMains = Math.round((topic.mainsAverageScore / 15) * 100);
  }

  // 3. Revision Retention (20% weight)
  // Real Ebbinghaus decay curve based on actual days since last revision
  let days = input.daysSinceLastRevision ?? 0;
  if (input.daysSinceLastRevision === undefined && topic.lastRevisedDate) {
    const elapsedMs = Date.now() - new Date(topic.lastRevisedDate).getTime();
    days = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  } else if (input.daysSinceLastRevision === undefined && topic.lastStudiedDate) {
    const elapsedMs = Date.now() - new Date(topic.lastStudiedDate).getTime();
    days = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  }

  const hasBeenStudied = (topic.completionPercentage || 0) > 0 || (topic.attemptsCount || 0) > 0 || !!topic.lastStudiedDate;
  // Retention decay: 100% at day 0, decays ~6% per day; 0 if topic not yet studied
  const retentionScore = hasBeenStudied
    ? Math.max(10, Math.round(100 * Math.exp(-0.06 * days)))
    : 0;

  // 4. Question Difficulty Factor (15% weight)
  const diffScore = input.questionDifficultyFactor ?? (hasBeenStudied ? 50 : 0);

  // 5. Recent Performance (15% weight)
  const recentScore = input.recentPerformance ?? (
    rawMcq > 0 ? rawMcq : (rawMains > 0 ? rawMains : (topic.knowledgeScore || 0))
  );

  // Compute weighted composite score (0 if never studied or attempted)
  const computedKnowledgeScore = hasBeenStudied
    ? Math.round(
        rawMcq * 0.25 +
        rawMains * 0.25 +
        retentionScore * 0.20 +
        diffScore * 0.15 +
        recentScore * 0.15
      )
    : (topic.knowledgeScore || 0);

  // Generate "Why weak?" diagnostic breakdown reasons based strictly on real activity
  const mistakes = input.repeatedMistakesCount ?? (topic.commonMistakes ? topic.commonMistakes.length : 0);
  const whyWeakReasons: string[] = [];
  if (!hasBeenStudied) {
    whyWeakReasons.push("Topic not yet studied. Start foundational reading.");
  } else {
    if (rawMcq > 0 && rawMcq < 65) {
      whyWeakReasons.push(`MCQ accuracy: ${rawMcq}% (Below 65% benchmark)`);
    }
    if (rawMains > 0 && rawMains < 60) {
      const mains15 = ((rawMains / 100) * 15).toFixed(1);
      whyWeakReasons.push(`Mains average: ${mains15}/15 marks (Needs structural depth)`);
    }
    if (mistakes >= 2) {
      whyWeakReasons.push(`${mistakes} repeated concept mistakes identified in recent tests`);
    }
    if (days >= 7 && (topic.lastRevisedDate || topic.lastStudiedDate)) {
      whyWeakReasons.push(`No active recall revision for ${days} days (High forgetting decay)`);
    }
    if (whyWeakReasons.length === 0 && computedKnowledgeScore < 70) {
      whyWeakReasons.push("Pending full syllabus coverage and comparative answer writing");
    }
  }

  // Determine priority
  let priority: "High" | "Medium" | "Low" = "Medium";
  if (computedKnowledgeScore < 60 || days >= 8 || mistakes >= 3) {
    priority = "High";
  } else if (computedKnowledgeScore >= 75) {
    priority = "Low";
  }

  // Recommended Action
  let recommendedAction = "Review thinker key concepts and write 1 Mains question.";
  if (priority === "High") {
    recommendedAction = `Prioritize high-yield revision: Solve 10 PYQs & revise 2nd ARC recommendations today.`;
  } else if (priority === "Low") {
    recommendedAction = "Maintain retention with a 15-minute weekly flashcard session.";
  }

  return {
    topicId: topic.id,
    topicName: topic.name,
    knowledgeScore: computedKnowledgeScore,
    signals: {
      mcqAccuracy: rawMcq,
      mainsPerformance: rawMains,
      revisionRetention: retentionScore,
      questionDifficulty: diffScore,
      recentPerformance: recentScore,
    },
    whyWeakReasons,
    priority,
    daysSinceLastRevision: days,
    recommendedAction,
  };
}
