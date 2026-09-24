import { MilestoneBadge, UserProfile, SyllabusTopic, MainsAnswerEvaluation } from "../types";

export function generateMilestones(
  user: UserProfile,
  topics: SyllabusTopic[],
  evaluations: MainsAnswerEvaluation[]
): MilestoneBadge[] {
  // Topic calculations
  const strongTopicsCount = topics.filter((t) => t.status === "strong").length;
  const completedTopicsCount = topics.filter((t) => t.completionPercentage >= 80).length;
  const totalTopics = topics.length || 1;
  const overallAvgCompletion = Math.round(
    topics.reduce((acc, t) => acc + t.completionPercentage, 0) / totalTopics
  );

  // Highest score in mains
  const highestMainsScore = evaluations.length > 0
    ? Math.max(...evaluations.map((e) => e.score))
    : 0;

  // Best prelims accuracy
  const prelimsAttempted = user.questionsAttempted || 0;
  const prelimsAccuracy = user.overallAccuracy || 74;

  const milestones: MilestoneBadge[] = [
    {
      id: "badge-unit-first",
      title: "Unit Conqueror",
      description: "Successfully master your first Public Administration core syllabus unit with >= 80% completion.",
      category: "unit_completion",
      badgeLevel: "Bronze",
      iconName: "book-open",
      isUnlocked: completedTopicsCount >= 1,
      unlockedAt: completedTopicsCount >= 1 ? "Sep 12, 2026" : undefined,
      progress: Math.min(100, (completedTopicsCount / 1) * 100),
      criteria: "Complete 1 full syllabus unit (>= 80% coverage)",
      currentValue: `${completedTopicsCount} units`,
      targetValue: "1 unit",
      rewardXp: 150,
    },
    {
      id: "badge-unit-triad",
      title: "Thinker & Theory Sovereign",
      description: "Attain high-scoring mastery status across 3 or more administrative units.",
      category: "unit_completion",
      badgeLevel: "Silver",
      iconName: "trophy",
      isUnlocked: strongTopicsCount >= 3,
      unlockedAt: strongTopicsCount >= 3 ? "Sep 15, 2026" : undefined,
      progress: Math.min(100, Math.round((strongTopicsCount / 3) * 100)),
      criteria: "Achieve 'Strong' status in 3 syllabus units",
      currentValue: `${strongTopicsCount} of 3`,
      targetValue: "3 units",
      rewardXp: 350,
    },
    {
      id: "badge-high-score-prelims",
      title: "Prelims Marksman",
      description: "Attain a high accuracy rate of 70% or greater in daily UPSC Prelims tests.",
      category: "high_score",
      badgeLevel: "Gold",
      iconName: "target",
      isUnlocked: prelimsAccuracy >= 70 && prelimsAttempted >= 20,
      unlockedAt: "Sep 14, 2026",
      progress: Math.min(100, Math.round((prelimsAccuracy / 70) * 100)),
      criteria: "Maintain >= 70% accuracy across practice sets",
      currentValue: `${prelimsAccuracy}% accuracy`,
      targetValue: "70%",
      rewardXp: 400,
    },
    {
      id: "badge-mains-ten-club",
      title: "The 10+ Club",
      description: "Score 10.0 or higher out of 15 Marks on a Mains answer evaluated by Bolt.",
      category: "mains_mastery",
      badgeLevel: "Gold",
      iconName: "award",
      isUnlocked: highestMainsScore >= 10.0,
      unlockedAt: highestMainsScore >= 10.0 ? "Sep 15, 2026" : undefined,
      progress: Math.min(100, Math.round((highestMainsScore / 10.0) * 100)),
      criteria: "Obtain 10.0+ marks in Bolt UPSC answer evaluation",
      currentValue: `${highestMainsScore.toFixed(1)} / 15`,
      targetValue: "10.0 / 15",
      rewardXp: 500,
    },
    {
      id: "badge-streak-seven",
      title: "7-Day Iron Discipline",
      description: "Maintain an unbroken daily study and test revision streak for a full week.",
      category: "streak",
      badgeLevel: "Silver",
      iconName: "flame",
      isUnlocked: user.studyStreakDays >= 7,
      unlockedAt: "Sep 11, 2026",
      progress: Math.min(100, Math.round((user.studyStreakDays / 7) * 100)),
      criteria: "Log active study on 7 consecutive days",
      currentValue: `${user.studyStreakDays} days`,
      targetValue: "7 days",
      rewardXp: 300,
    },
    {
      id: "badge-syllabus-half",
      title: "Half-Curriculum Milestone",
      description: "Cover 50% or more of the entire Public Administration curriculum.",
      category: "syllabus_milestone",
      badgeLevel: "Silver",
      iconName: "star",
      isUnlocked: overallAvgCompletion >= 50,
      unlockedAt: overallAvgCompletion >= 50 ? "Sep 14, 2026" : undefined,
      progress: Math.min(100, Math.round((overallAvgCompletion / 50) * 100)),
      criteria: "Reach 50% overall syllabus completion",
      currentValue: `${overallAvgCompletion}%`,
      targetValue: "50%",
      rewardXp: 350,
    },
    {
      id: "badge-prelims-1000",
      title: "MCQ Centurion (1,000+)",
      description: "Attempt over 1,000 UPSC standard questions in the Prelims practice portal.",
      category: "high_score",
      badgeLevel: "Platinum",
      iconName: "zap",
      isUnlocked: prelimsAttempted >= 1000,
      unlockedAt: prelimsAttempted >= 1000 ? "Sep 16, 2026" : undefined,
      progress: Math.min(100, Math.round((prelimsAttempted / 1000) * 100)),
      criteria: "Solve 1,000+ questions in practice view",
      currentValue: `${prelimsAttempted} solved`,
      targetValue: "1,000",
      rewardXp: 750,
    },
    {
      id: "badge-topper-decile",
      title: "AIR 1 Decile Master",
      description: "Attain 12.0+ marks out of 15 in Mains Evaluation with zero critical structural flaws.",
      category: "mains_mastery",
      badgeLevel: "Platinum",
      iconName: "trophy",
      isUnlocked: highestMainsScore >= 12.0,
      unlockedAt: highestMainsScore >= 12.0 ? "Unlocked" : undefined,
      progress: Math.min(100, Math.round((highestMainsScore / 12.0) * 100)),
      criteria: "Obtain 12.0+ marks in Bolt UPSC answer evaluation",
      currentValue: `${highestMainsScore.toFixed(1)} / 15`,
      targetValue: "12.0 / 15",
      rewardXp: 1000,
    },
  ];

  return milestones;
}
