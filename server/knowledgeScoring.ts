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
  actualMetricsOrIsWeak?:
    | boolean
    | {
        knowledgeScore?: number;
        mcqAccuracy?: number;
        mainsPerformance?: number;
        daysSinceLastRevision?: number;
        questionDifficulty?: number;
        recentPerformance?: number;
        mistakesCount?: number;
      },
  customScore?: number
): TopicDiagnostic {
  let metrics: {
    knowledgeScore?: number;
    mcqAccuracy?: number;
    mainsPerformance?: number;
    daysSinceLastRevision?: number;
    questionDifficulty?: number;
    recentPerformance?: number;
    mistakesCount?: number;
  };

  if (typeof actualMetricsOrIsWeak === "boolean") {
    const isWeak = actualMetricsOrIsWeak;
    const score = customScore !== undefined ? customScore : (isWeak ? 45 : 80);
    metrics = {
      knowledgeScore: score,
      mcqAccuracy: isWeak ? 55 : 85,
      mainsPerformance: isWeak ? 50 : 80,
      daysSinceLastRevision: isWeak ? 8 : 2,
      questionDifficulty: 60,
      recentPerformance: score,
      mistakesCount: isWeak ? 2 : 0,
    };
  } else {
    metrics = actualMetricsOrIsWeak || {};
  }

  const score = metrics.knowledgeScore ?? 0;
  const rawMcq = metrics.mcqAccuracy ?? 0;
  const rawMains = metrics.mainsPerformance ?? 0;
  const days = metrics.daysSinceLastRevision ?? 0;
  const retentionScore = days > 0
    ? Math.max(10, Math.round(100 * Math.exp(-0.06 * days)))
    : (score > 0 ? 100 : 0);
  const diffScore = metrics.questionDifficulty ?? (score > 0 ? 50 : 0);
  const recentScore = metrics.recentPerformance ?? (rawMcq > 0 ? rawMcq : score);

  const isWeak = score < 65 || (rawMcq > 0 && rawMcq < 65);

  const whyWeakReasons: string[] = [];
  if (score === 0 && rawMcq === 0 && rawMains === 0) {
    whyWeakReasons.push("Topic not yet started. Begin foundational reading.");
  } else {
    if (rawMcq > 0 && rawMcq < 65) {
      whyWeakReasons.push(`MCQ accuracy: ${rawMcq}% (Below 65% benchmark)`);
    }
    if (rawMains > 0 && rawMains < 60) {
      const marks = ((rawMains / 100) * 15).toFixed(1);
      whyWeakReasons.push(`Mains average: ${marks}/15 marks (Limited theoretical citations)`);
    }
    if (metrics.mistakesCount && metrics.mistakesCount >= 2) {
      whyWeakReasons.push(`${metrics.mistakesCount} repeated concept mistakes in recent tests`);
    }
    if (days >= 7) {
      whyWeakReasons.push(`No active recall revision for ${days} days`);
    }
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
