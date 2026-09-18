export interface TopicDiagnostic {
  topicId: string;
  topicName: string;
  knowledgeScore: number;
  signals: {
    mcqAccuracy: number;
    mainsPerformance: number;
    revisionRetention: number;
    questionDifficulty: number;
    recentPerformance: number;
  };
  whyWeakReasons: string[];
  priority: "High" | "Medium" | "Low";
  daysSinceLastRevision: number;
  recommendedAction: string;
}

export function computeTopicDiagnostic(
  topicName: string,
  isWeakTopic = false,
  customKnowledgeScore = 60
): TopicDiagnostic {
  const isWeak = isWeakTopic || customKnowledgeScore < 65;
  const rawMcq = isWeak ? 58 : 82;
  const rawMains = isWeak ? 52 : 78;
  const days = isWeak ? 9 : 3;
  const retentionScore = Math.max(25, Math.round(100 * Math.exp(-0.06 * days)));
  const diffScore = 70;
  const recentScore = isWeak ? 54 : 85;

  const score = Math.round(
    rawMcq * 0.25 +
    rawMains * 0.25 +
    retentionScore * 0.20 +
    diffScore * 0.15 +
    recentScore * 0.15
  );

  const whyWeakReasons: string[] = [];
  if (isWeak) {
    whyWeakReasons.push(`MCQ accuracy: ${rawMcq}% (Below 65% benchmark)`);
    whyWeakReasons.push(`Mains average: 7.8/15 marks (Limited theoretical citations)`);
    whyWeakReasons.push(`3 repeated concept mistakes in recent tests`);
    whyWeakReasons.push(`No active recall revision for ${days} days`);
  }

  return {
    topicId: `topic-${topicName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    topicName,
    knowledgeScore: score,
    signals: {
      mcqAccuracy: rawMcq,
      mainsPerformance: rawMains,
      revisionRetention: retentionScore,
      questionDifficulty: diffScore,
      recentPerformance: recentScore,
    },
    whyWeakReasons,
    priority: isWeak ? "High" : "Low",
    daysSinceLastRevision: days,
    recommendedAction: isWeak
      ? `Prioritize high-yield revision: Solve 10 PYQs & revise 2nd ARC recommendations today.`
      : `Retention stable: 15-minute weekly flashcard check.`,
  };
}
