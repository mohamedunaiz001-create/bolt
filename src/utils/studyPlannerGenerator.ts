import { SyllabusTopic, PlannedSyllabusUnit, WeeklyStudyPlan, WeekDayId } from "../types";

export const WEEK_DAYS: { id: WeekDayId; label: string; shortLabel: string }[] = [
  { id: "mon", label: "Monday", shortLabel: "Mon" },
  { id: "tue", label: "Tuesday", shortLabel: "Tue" },
  { id: "wed", label: "Wednesday", shortLabel: "Wed" },
  { id: "thu", label: "Thursday", shortLabel: "Thu" },
  { id: "fri", label: "Friday", shortLabel: "Fri" },
  { id: "sat", label: "Saturday", shortLabel: "Sat" },
  { id: "sun", label: "Sunday", shortLabel: "Sun" },
];

/**
 * Intelligent generator that uses actual syllabus data to construct a balanced 7-day study timetable.
 */
export function generateWeeklyPlanFromSyllabus(
  topics: SyllabusTopic[],
  strategy: "weakness_first" | "balanced" | "sprint" = "weakness_first",
  targetDailyHours: number = 7.5
): WeeklyStudyPlan {
  // Sort topics based on the strategy
  const sortedTopics = [...topics].sort((a, b) => {
    if (strategy === "weakness_first") {
      // Prioritize needs_revision and lowest knowledge score
      const aWeight = (a.status === "needs_revision" ? 100 : 0) + (100 - a.knowledgeScore);
      const bWeight = (b.status === "needs_revision" ? 100 : 0) + (100 - b.knowledgeScore);
      return bWeight - aWeight;
    } else if (strategy === "sprint") {
      // Prioritize lower completion percentage first
      return a.completionPercentage - b.completionPercentage;
    } else {
      // Balanced: Alternate Paper 1 and Paper 2
      if (a.paper !== b.paper) {
        return a.paper.localeCompare(b.paper);
      }
      return a.knowledgeScore - b.knowledgeScore;
    }
  });

  const plannedUnits: PlannedSyllabusUnit[] = [];
  let topicCursor = 0;

  // For each day of the week, allocate syllabus units
  WEEK_DAYS.forEach((day, dayIndex) => {
    let dayAllocatedMinutes = 0;
    const targetDayMinutes = targetDailyHours * 60;
    let orderIndex = 0;

    // Allocate 3 to 4 study blocks per day
    while (dayAllocatedMinutes < targetDayMinutes && sortedTopics.length > 0) {
      const topic = sortedTopics[topicCursor % sortedTopics.length];
      topicCursor++;

      // Choose an appropriate subtopic or focus area
      const subtopic =
        topic.subtopics && topic.subtopics.length > 0
          ? topic.subtopics[orderIndex % topic.subtopics.length].name
          : "Core Concepts & Previous Year Questions";

      // Duration: 90 or 120 mins for core optional, 60 or 75 mins for revision/practice
      let estimatedMin = 90;
      if (orderIndex === 0) {
        estimatedMin = 120; // Deep morning block
      } else if (orderIndex === 1) {
        estimatedMin = 90; // Secondary block
      } else if (orderIndex === 2) {
        estimatedMin = 90; // Mid-day block
      } else {
        estimatedMin = 60; // Evening revision block
      }

      // If Sunday, make it a revision & mock review day
      let unitPriority: "high" | "medium" | "low" = topic.status === "needs_revision" ? "high" : "medium";
      let notes = `Focus on 2nd ARC recommendations, key thinker arguments, and model answer framing.`;

      if (day.id === "sun") {
        notes = `Weekly active recall: Spaced flashcards revision & 1 timed 15-marker answer writing.`;
        estimatedMin = 75;
      }

      const unitId = `plan-${day.id}-${topic.id}-${orderIndex}-${Date.now() % 10000}`;

      // Simulate some completed progress on earlier days of current week (Mon, Tue)
      let isCompleted = false;
      let completedMinutes = 0;
      if (dayIndex === 0) {
        // Monday completed
        isCompleted = true;
        completedMinutes = estimatedMin;
      } else if (dayIndex === 1) {
        // Tuesday partially or fully completed
        isCompleted = orderIndex <= 1;
        completedMinutes = orderIndex <= 1 ? estimatedMin : Math.round(estimatedMin * 0.4);
      } else if (dayIndex === 2 && orderIndex === 0) {
        // Wednesday first block completed
        isCompleted = true;
        completedMinutes = estimatedMin;
      }

      plannedUnits.push({
        id: unitId,
        topicId: topic.id,
        topicName: topic.name,
        paper: topic.paper,
        subject: topic.subject,
        subtopicTitle: subtopic,
        estimatedMinutes: estimatedMin,
        completedMinutes,
        isCompleted,
        notes,
        priority: unitPriority,
        day: day.id,
        orderIndex,
      });

      dayAllocatedMinutes += estimatedMin;
      orderIndex++;
    }
  });

  // Calculate Monday date of the current week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const mondayDate = new Date(today.setDate(diffToMonday));
  const weekStartDate = mondayDate.toISOString().split("T")[0];

  return {
    id: "weekly-plan-" + Date.now(),
    weekStartDate,
    title:
      strategy === "weakness_first"
        ? "UPSC Targeted Weakness Remediation Plan"
        : strategy === "sprint"
        ? "High-Intensity Syllabus Sprint"
        : "Standard Balanced UPSC Weekly Timetable",
    targetDailyHours,
    strategy,
    plannedUnits,
  };
}

/**
 * Quick calculations for completion rate, hours, and pace.
 */
export function calculateWeeklyPlanStats(plan: WeeklyStudyPlan) {
  const totalPlannedMinutes = plan.plannedUnits.reduce((acc, u) => acc + u.estimatedMinutes, 0);
  const totalCompletedMinutes = plan.plannedUnits.reduce((acc, u) => acc + u.completedMinutes, 0);
  const totalCompletedUnits = plan.plannedUnits.filter((u) => u.isCompleted).length;
  const totalUnits = plan.plannedUnits.length;

  const plannedHours = (totalPlannedMinutes / 60).toFixed(1);
  const completedHours = (totalCompletedMinutes / 60).toFixed(1);
  const completionPercentage = totalPlannedMinutes > 0 ? Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100) : 0;

  // Day by day breakdown
  const dayStats: Record<WeekDayId, { plannedMin: number; completedMin: number; unitCount: number; completedUnits: number }> = {
    mon: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    tue: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    wed: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    thu: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    fri: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    sat: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
    sun: { plannedMin: 0, completedMin: 0, unitCount: 0, completedUnits: 0 },
  };

  plan.plannedUnits.forEach((u) => {
    if (dayStats[u.day]) {
      dayStats[u.day].plannedMin += u.estimatedMinutes;
      dayStats[u.day].completedMin += u.completedMinutes;
      dayStats[u.day].unitCount += 1;
      if (u.isCompleted) {
        dayStats[u.day].completedUnits += 1;
      }
    }
  });

  return {
    totalPlannedMinutes,
    totalCompletedMinutes,
    plannedHours,
    completedHours,
    completionPercentage,
    totalCompletedUnits,
    totalUnits,
    dayStats,
  };
}
