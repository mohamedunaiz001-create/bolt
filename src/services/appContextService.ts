import {
  UserProfile,
  SyllabusTopic,
  MainsAnswerEvaluation,
  NewsArticle,
  PrelimsQuestion,
  BoltAppContext,
  WeeklyStudyPlan,
  PlannedSyllabusUnit,
} from "../types";

/**
 * BOLT App Context Service
 * Connects BOLT directly to live, reactive user data across all modules:
 * - Syllabus tree (Paper 1 & Paper 2 completion, topic knowledge scores, weak/strong units)
 * - Mains evaluations (scores, criteria averages, feedback)
 * - Prelims MCQ history & accuracy
 * - Daily Study Planner & Weekly Timetable (tracked hours, today's schedule)
 * - Active revision queue (Ebbinghaus decay alerts)
 * - Current affairs bookmarks and daily notes
 */

const STORAGE_WEEKLY_PLAN_KEY = "bolt_weekly_study_plan_v2";

export function getWeeklyStudyPlanFromStorage(): WeeklyStudyPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_WEEKLY_PLAN_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load weekly study plan from localStorage", e);
  }
  return null;
}

export function computeBoltAppContext(
  user: UserProfile,
  topics: SyllabusTopic[],
  evaluations: MainsAnswerEvaluation[] = [],
  articles: NewsArticle[] = [],
  questions: PrelimsQuestion[] = []
): BoltAppContext {
  // 1. Syllabus breakdown
  const paper1Topics = topics.filter((t) => t.paper === "Paper 1");
  const paper2Topics = topics.filter((t) => t.paper === "Paper 2");

  const overallCompletion = Math.round(
    topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) / (topics.length || 1)
  );
  const paper1Completion = Math.round(
    paper1Topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) /
      (paper1Topics.length || 1)
  );
  const paper2Completion = Math.round(
    paper2Topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) /
      (paper2Topics.length || 1)
  );

  const completedTopics = topics.filter(
    (t) => (t.completionPercentage || 0) >= 80 || t.status === "strong"
  ).length;

  // Weak topics (knowledge score < 65 or status needs_revision) sorted ascending
  const weakTopics = [...topics]
    .filter((t) => (t.knowledgeScore ?? 50) < 65 || t.status === "needs_revision")
    .sort((a, b) => (a.knowledgeScore ?? 50) - (b.knowledgeScore ?? 50))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      name: t.name,
      paper: t.paper,
      score: t.knowledgeScore ?? 50,
      status: t.status,
    }));

  // Strong topics (knowledge score >= 75 or status strong) sorted descending
  const strongTopics = [...topics]
    .filter((t) => (t.knowledgeScore ?? 50) >= 70 || t.status === "strong")
    .sort((a, b) => (b.knowledgeScore ?? 50) - (a.knowledgeScore ?? 50))
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      name: t.name,
      paper: t.paper,
      score: t.knowledgeScore ?? 75,
      status: t.status,
    }));

  // 2. Mains performance
  const evaluatedCount = evaluations.length || user.mainsEvaluatedCount || 0;
  const averageScore = evaluations.length > 0
    ? Number(
        (
          evaluations.reduce((acc, ev) => acc + (ev.score || 0), 0) / evaluations.length
        ).toFixed(1)
      )
    : 9.8;

  const recentEvaluations = evaluations.slice(0, 3).map((ev) => ({
    question: ev.questionText.length > 70 ? ev.questionText.slice(0, 70) + "..." : ev.questionText,
    score: ev.score,
    maxMarks: ev.maxMarks,
    date: ev.submittedDate,
  }));

  // 3. Prelims performance
  const questionsAttempted = user.questionsAttempted || questions.length || 0;
  const accuracyPercentage = user.overallAccuracy || 74;

  // 4. Revision queue
  const urgentTopics = topics
    .filter((t) => t.status === "needs_revision")
    .map((t) => t.name)
    .slice(0, 5);
  const dueCount = urgentTopics.length;

  // 5. Weekly Study Plan & Daily Timetable
  const weeklyPlan = getWeeklyStudyPlanFromStorage();
  let weeklyPlannedHours = 0;
  let weeklyTrackedHours = 0;
  let todayPlannedUnits: string[] = [];

  if (weeklyPlan && weeklyPlan.plannedUnits) {
    const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const dayMap: Record<number, string> = {
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
      0: "sun",
    };
    const currentDayKey = dayMap[todayIndex] || "mon";

    weeklyPlannedHours = Math.round(
      weeklyPlan.plannedUnits.reduce((acc, u) => acc + (u.estimatedMinutes || 0), 0) / 60
    );
    weeklyTrackedHours = Number(
      (
        weeklyPlan.plannedUnits.reduce((acc, u) => acc + (u.completedMinutes || 0), 0) / 60
      ).toFixed(1)
    );

    todayPlannedUnits = weeklyPlan.plannedUnits
      .filter((u) => u.day === currentDayKey)
      .map((u) => `${u.topicName} (${u.completedMinutes}/${u.estimatedMinutes}m)`);
  }

  // 6. Current affairs
  const bookmarkedArticles = articles.filter((a) => a.isBookmarked);
  const recentHeadlines = articles.slice(0, 4).map((a) => a.headline);

  // 7. System context string formatted for BOLT LLM prompt
  const systemContextText = `
### LIVE CANDIDATE DASHBOARD CONTEXT:
- Candidate Name: ${user.name}
- Target Examination: ${user.target || "UPSC CSE 2026"}
- Optional Subject: ${user.optionalSubject || "Public Administration"}
- Overall Syllabus Completion: ${overallCompletion}% (Paper 1: ${paper1Completion}%, Paper 2: ${paper2Completion}%)
- Topics Completed: ${completedTopics} / ${topics.length}
- Critical Weak Units: ${
    weakTopics.length > 0
      ? weakTopics.map((w) => `${w.name} (${w.score}% score)`).join(", ")
      : "Administrative Thought (Herbert Simon), Financial Administration"
  }
- Strong Units: ${
    strongTopics.length > 0
      ? strongTopics.map((s) => `${s.name} (${s.score}% score)`).join(", ")
      : "Administrative Behaviour, Constitutional Framework"
  }
- Revision Due: ${dueCount} topics flagged
- Mains Performance: ${evaluatedCount} answers evaluated, Average Score: ${averageScore}/15
- Prelims Performance: ${questionsAttempted} MCQs attempted with ${accuracyPercentage}% accuracy
- Study Habit & Consistency: ${user.studyStreakDays} day streak, ${user.totalStudyHours} total hours logged
- Weekly Plan Progress: ${weeklyTrackedHours}h tracked of ${weeklyPlannedHours}h planned
- Today's Scheduled Units: ${todayPlannedUnits.length > 0 ? todayPlannedUnits.join("; ") : "None scheduled for today"}
- Recent Current Affairs: ${recentHeadlines.slice(0, 2).join(" | ")}
`.trim();

  return {
    user,
    optionalSubject: user.optionalSubject || "Public Administration",
    syllabus: {
      overallCompletion,
      paper1Completion,
      paper2Completion,
      totalTopics: topics.length,
      completedTopics,
      weakTopics,
      strongTopics,
    },
    mainsPerformance: {
      evaluatedCount,
      averageScore,
      recentEvaluations,
    },
    prelimsPerformance: {
      questionsAttempted,
      accuracyPercentage,
    },
    revisionStatus: {
      dueCount,
      urgentTopics,
    },
    studySchedule: {
      streakDays: user.studyStreakDays,
      totalStudyHours: user.totalStudyHours,
      weeklyPlannedHours,
      weeklyTrackedHours,
      todayPlannedUnits,
    },
    currentAffairs: {
      bookmarkedCount: bookmarkedArticles.length,
      recentHeadlines,
    },
    systemContextText,
  };
}
