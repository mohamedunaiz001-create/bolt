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
  // Fall back to topic's base knowledge / mock data if not directly provided
  const rawMcq = input.mcqAccuracy ?? (
    topic.status === "needs_revision"
      ? 56
      : topic.status === "strong"
      ? 84
      : Math.min(85, Math.max(45, topic.knowledgeScore - 5))
  );

  // 2. Mains Performance (25% weight)
  // Normalized to 0-100%
  let rawMains = 60;
  if (input.mainsAverageScore !== undefined) {
    rawMains = input.mainsAverageScore <= 15
      ? Math.round((input.mainsAverageScore / 15) * 100)
      : input.mainsAverageScore;
  } else {
    rawMains = topic.status === "needs_revision"
      ? 52
      : topic.status === "strong"
      ? 81
      : Math.min(82, Math.max(40, topic.knowledgeScore - 8));
  }

  // 3. Revision Retention (20% weight)
  // Ebbinghaus decay curve based on days since last revision
  const days = input.daysSinceLastRevision ?? (
    topic.status === "needs_revision" ? 9 : topic.status === "strong" ? 2 : 5
  );
  // Retention decay: 100% at day 0, decays ~5% per day past 3 days
  const retentionScore = Math.max(25, Math.round(100 * Math.exp(-0.06 * days)));

  // 4. Question Difficulty Factor (15% weight)
  const diffScore = input.questionDifficultyFactor ?? 70;

  // 5. Recent Performance (15% weight)
  const recentScore = input.recentPerformance ?? (
    topic.status === "needs_revision" ? 54 : topic.status === "strong" ? 86 : 68
  );

  // Compute weighted composite score
  const computedKnowledgeScore = Math.round(
    rawMcq * 0.25 +
    rawMains * 0.25 +
    retentionScore * 0.20 +
    diffScore * 0.15 +
    recentScore * 0.15
  );

  // Generate "Why weak?" diagnostic breakdown reasons
  const whyWeakReasons: string[] = [];
  if (rawMcq < 65) {
    whyWeakReasons.push(`MCQ accuracy: ${rawMcq}% (Below 65% benchmark)`);
  }
  if (rawMains < 60) {
    const mains15 = ((rawMains / 100) * 15).toFixed(1);
    whyWeakReasons.push(`Mains average: ${mains15}/15 marks (Needs structural depth)`);
  }
  const mistakes = input.repeatedMistakesCount ?? (topic.status === "needs_revision" ? 3 : 1);
  if (mistakes >= 2) {
    whyWeakReasons.push(`${mistakes} repeated concept mistakes identified in recent tests`);
  }
  if (days >= 7) {
    whyWeakReasons.push(`No active recall revision for ${days} days (High forgetting decay)`);
  }

  // If no specific weaknesses but topic is not strong
  if (whyWeakReasons.length === 0 && computedKnowledgeScore < 70) {
    whyWeakReasons.push("Pending full syllabus coverage and comparative answer writing");
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
