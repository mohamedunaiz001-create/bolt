import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Search,
  Filter,
  GripVertical,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Brain,
  Award,
  ArrowRight,
  Sliders,
  Check,
  Flame,
  Volume2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  UserProfile,
  SyllabusTopic,
  NavigationTab,
  PlannedSyllabusUnit,
  WeeklyStudyPlan,
  WeekDayId,
} from "../types";
import {
  WEEK_DAYS,
  generateWeeklyPlanFromSyllabus,
  calculateWeeklyPlanStats,
} from "../utils/studyPlannerGenerator";
import { soundEngine } from "../utils/soundEngine";

interface StudyPlannerProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onUpdateTopic?: (updated: SyllabusTopic) => void;
  onNavigate?: (tab: NavigationTab) => void;
  onAskBolt?: (prompt: string) => void;
}

const STORAGE_PLAN_KEY = "bolt_weekly_study_plan";

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  user,
  topics,
  onUpdateUser,
  onUpdateTopic = (_updated: SyllabusTopic) => {},
  onNavigate = () => {},
  onAskBolt = () => {},
}) => {
  // Weekly Plan State
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyStudyPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAN_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    // Generate intelligent default plan from current syllabus topics
    return generateWeeklyPlanFromSyllabus(topics, "weakness_first", 7.5);
  });

  // Save changes to localStorage
  const savePlan = (plan: WeeklyStudyPlan) => {
    setWeeklyPlan(plan);
    try {
      localStorage.setItem(STORAGE_PLAN_KEY, JSON.stringify(plan));
    } catch (e) {}
  };

  // Drag and drop state
  const [draggedTopic, setDraggedTopic] = useState<SyllabusTopic | null>(null);
  const [draggedExistingUnit, setDraggedExistingUnit] = useState<PlannedSyllabusUnit | null>(null);
  const [dragOverDay, setDragOverDay] = useState<WeekDayId | null>(null);

  // Active Timer Tracker on a specific planned unit
  const [activeTrackingUnitId, setActiveTrackingUnitId] = useState<string | null>(null);
  const [isTrackerRunning, setIsTrackerRunning] = useState<boolean>(false);
  const [elapsedTimerSeconds, setElapsedTimerSeconds] = useState<number>(0);

  // Syllabus Bank Search & Filtering
  const [syllabusSearch, setSyllabusSearch] = useState<string>("");
  const [syllabusFilter, setSyllabusFilter] = useState<"all" | "weak" | "paper1" | "paper2">("all");
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState<boolean>(true);

  // Auto-Generate Timetable Modal State
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);
  const [genStrategy, setGenStrategy] = useState<"weakness_first" | "balanced" | "sprint">("weakness_first");
  const [genDailyHours, setGenDailyHours] = useState<number>(7.5);

  // Quick Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Find today's weekday id ("mon", "tue", etc.)
  const todayWeekDayId = useMemo<WeekDayId>(() => {
    const dayNum = new Date().getDay(); // 0 is Sun, 1 is Mon, 2 is Tue...
    const map: Record<number, WeekDayId> = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    return map[dayNum] || "mon";
  }, []);

  // Filtered topics in syllabus bank
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        t.paper.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        t.keyThinkers?.some((th) => th.toLowerCase().includes(syllabusSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (syllabusFilter === "weak") {
        return t.status === "needs_revision" || t.knowledgeScore < 70;
      }
      if (syllabusFilter === "paper1") {
        return t.paper === "Paper 1";
      }
      if (syllabusFilter === "paper2") {
        return t.paper === "Paper 2";
      }
      return true;
    });
  }, [topics, syllabusSearch, syllabusFilter]);

  // Weekly stats
  const stats = useMemo(() => {
    return calculateWeeklyPlanStats(weeklyPlan);
  }, [weeklyPlan]);

  // Currently tracking unit object
  const activeTrackingUnit = useMemo(() => {
    if (!activeTrackingUnitId) return null;
    return weeklyPlan.plannedUnits.find((u) => u.id === activeTrackingUnitId) || null;
  }, [activeTrackingUnitId, weeklyPlan.plannedUnits]);

  // ----------------------------------------------------
  // REAL-TIME COMPLETION TRACKER ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    let interval: any = null;

    if (isTrackerRunning && activeTrackingUnitId) {
      interval = setInterval(() => {
        setElapsedTimerSeconds((prev) => {
          const nextSec = prev + 1;

          // Every 60 seconds of real-time study, automatically increment completion time
          if (nextSec % 60 === 0) {
            recordStudyMinute(activeTrackingUnitId, 1);
          }

          return nextSec;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTrackerRunning, activeTrackingUnitId]);

  // Record completed study minute(s) for a specific planned unit
  const recordStudyMinute = (unitId: string, minutesToAdd: number) => {
    const updatedUnits = weeklyPlan.plannedUnits.map((u) => {
      if (u.id === unitId) {
        const nextCompleted = u.completedMinutes + minutesToAdd;
        const reachedTarget = nextCompleted >= u.estimatedMinutes;

        if (reachedTarget && !u.isCompleted) {
          soundEngine.playCompletionChime();
          showToast(`🎯 Unit Target Reached! "${u.topicName}" marked as completed.`);
        }

        return {
          ...u,
          completedMinutes: nextCompleted,
          isCompleted: reachedTarget ? true : u.isCompleted,
        };
      }
      return u;
    });

    const updatedPlan: WeeklyStudyPlan = {
      ...weeklyPlan,
      plannedUnits: updatedUnits,
    };
    savePlan(updatedPlan);

    // Automatically credit user's total study hours and streak
    const addedHours = parseFloat((minutesToAdd / 60).toFixed(3));
    onUpdateUser({
      totalStudyHours: parseFloat(((user.totalStudyHours || 0) + addedHours).toFixed(2)),
    });

    // Also update syllabus topic's completion percentage and lastStudiedDate
    const targetUnit = weeklyPlan.plannedUnits.find((u) => u.id === unitId);
    if (targetUnit) {
      const topicObj = topics.find((t) => t.id === targetUnit.topicId);
      if (topicObj) {
        const newPct = Math.min(100, (topicObj.completionPercentage || 50) + 1);
        onUpdateTopic({
          ...topicObj,
          completionPercentage: newPct,
          lastStudiedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
      }
    }
  };

  // Start tracking a unit
  const handleStartTracking = (unit: PlannedSyllabusUnit) => {
    soundEngine.playClick();
    if (activeTrackingUnitId === unit.id && isTrackerRunning) {
      // Pause
      setIsTrackerRunning(false);
      return;
    }

    setActiveTrackingUnitId(unit.id);
    setIsTrackerRunning(true);
    setElapsedTimerSeconds(0);
    showToast(`⏱️ Active study tracking started for "${unit.topicName}". Time will be automatically logged.`);
  };

  // Pause tracking
  const handlePauseTracking = () => {
    soundEngine.playClick();
    setIsTrackerRunning(false);
  };

  // Stop & Log any remaining elapsed seconds
  const handleStopTracking = () => {
    soundEngine.playClick();
    if (activeTrackingUnitId && elapsedTimerSeconds >= 30) {
      const minutesToCredit = Math.ceil(elapsedTimerSeconds / 60);
      recordStudyMinute(activeTrackingUnitId, minutesToCredit);
    }
    setIsTrackerRunning(false);
    setActiveTrackingUnitId(null);
    setElapsedTimerSeconds(0);
  };

  // Quick Manual Add Minutes (e.g. +15m, +30m)
  const handleQuickAddMinutes = (unitId: string, minutes: number) => {
    soundEngine.playClick();
    recordStudyMinute(unitId, minutes);
    showToast(`+${minutes} mins added to completion time.`);
  };

  // Toggle unit completed directly
  const handleToggleUnitCompleted = (unitId: string) => {
    soundEngine.playClick();
    const target = weeklyPlan.plannedUnits.find((u) => u.id === unitId);
    if (!target) return;

    const nextCompleted = !target.isCompleted;
    const updatedUnits = weeklyPlan.plannedUnits.map((u) => {
      if (u.id === unitId) {
        return {
          ...u,
          isCompleted: nextCompleted,
          completedMinutes: nextCompleted ? Math.max(u.completedMinutes, u.estimatedMinutes) : 0,
        };
      }
      return u;
    });

    savePlan({ ...weeklyPlan, plannedUnits: updatedUnits });

    if (nextCompleted) {
      const minutesAdded = target.estimatedMinutes - target.completedMinutes;
      if (minutesAdded > 0) {
        const addedHours = parseFloat((minutesAdded / 60).toFixed(2));
        onUpdateUser({
          totalStudyHours: parseFloat(((user.totalStudyHours || 0) + addedHours).toFixed(1)),
        });
      }
      soundEngine.playCompletionChime();
      showToast(`Marked completed: "${target.topicName}"!`);
    }
  };

  // Delete unit from day
  const handleRemoveUnit = (unitId: string) => {
    soundEngine.playClick();
    const updatedUnits = weeklyPlan.plannedUnits.filter((u) => u.id !== unitId);
    savePlan({ ...weeklyPlan, plannedUnits: updatedUnits });
    if (activeTrackingUnitId === unitId) {
      handleStopTracking();
    }
  };

  // ----------------------------------------------------
  // DRAG AND DROP HANDLERS
  // ----------------------------------------------------

  // When dragging a syllabus topic from the syllabus bank
  const handleDragStartFromBank = (e: React.DragEvent, topic: SyllabusTopic) => {
    setDraggedTopic(topic);
    setDraggedExistingUnit(null);
    e.dataTransfer.setData("application/json", JSON.stringify({ source: "bank", topicId: topic.id }));
    e.dataTransfer.effectAllowed = "copy";
  };

  // When dragging an existing planned unit from a day column
  const handleDragStartExistingUnit = (e: React.DragEvent, unit: PlannedSyllabusUnit) => {
    setDraggedExistingUnit(unit);
    setDraggedTopic(null);
    e.dataTransfer.setData("application/json", JSON.stringify({ source: "day", unitId: unit.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, dayId: WeekDayId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedExistingUnit ? "move" : "copy";
    if (dragOverDay !== dayId) {
      setDragOverDay(dayId);
    }
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  // Drop on day
  const handleDropOnDay = (e: React.DragEvent, targetDayId: WeekDayId) => {
    e.preventDefault();
    setDragOverDay(null);
    soundEngine.playClick();

    if (draggedTopic) {
      // Create new planned unit from syllabus topic
      const subtopicName =
        draggedTopic.subtopics && draggedTopic.subtopics.length > 0
          ? draggedTopic.subtopics[0].name
          : "Core Theoretical Principles & Model Answers";

      const newUnit: PlannedSyllabusUnit = {
        id: `plan-${targetDayId}-${draggedTopic.id}-${Date.now()}`,
        topicId: draggedTopic.id,
        topicName: draggedTopic.name,
        paper: draggedTopic.paper,
        subject: draggedTopic.subject,
        subtopicTitle: subtopicName,
        estimatedMinutes: 90, // Standard 1.5 hr block
        completedMinutes: 0,
        isCompleted: false,
        priority: draggedTopic.status === "needs_revision" ? "high" : "medium",
        day: targetDayId,
        orderIndex: weeklyPlan.plannedUnits.filter((u) => u.day === targetDayId).length,
        notes: `Focus on ${draggedTopic.keyThinkers?.slice(0, 3).join(", ") || "core thinkers"} and 2nd ARC recommendations.`,
      };

      const updated = [...weeklyPlan.plannedUnits, newUnit];
      savePlan({ ...weeklyPlan, plannedUnits: updated });
      showToast(`Added "${draggedTopic.name}" to ${WEEK_DAYS.find((d) => d.id === targetDayId)?.label}!`);
      setDraggedTopic(null);
    } else if (draggedExistingUnit) {
      // Move existing unit to target day
      if (draggedExistingUnit.day === targetDayId) return;

      const updated = weeklyPlan.plannedUnits.map((u) => {
        if (u.id === draggedExistingUnit.id) {
          return {
            ...u,
            day: targetDayId,
            orderIndex: weeklyPlan.plannedUnits.filter((item) => item.day === targetDayId).length,
          };
        }
        return u;
      });

      savePlan({ ...weeklyPlan, plannedUnits: updated });
      showToast(`Moved to ${WEEK_DAYS.find((d) => d.id === targetDayId)?.label}.`);
      setDraggedExistingUnit(null);
    }
  };

  // Quick 1-click assign from bank without dragging (touch / accessibility)
  const handleQuickAssignFromBank = (topic: SyllabusTopic, targetDayId: WeekDayId) => {
    soundEngine.playClick();
    const subtopicName =
      topic.subtopics && topic.subtopics.length > 0
        ? topic.subtopics[0].name
        : "Core Theoretical Principles & PYQs";

    const newUnit: PlannedSyllabusUnit = {
      id: `plan-${targetDayId}-${topic.id}-${Date.now()}`,
      topicId: topic.id,
      topicName: topic.name,
      paper: topic.paper,
      subject: topic.subject,
      subtopicTitle: subtopicName,
      estimatedMinutes: 90,
      completedMinutes: 0,
      isCompleted: false,
      priority: topic.status === "needs_revision" ? "high" : "medium",
      day: targetDayId,
      orderIndex: weeklyPlan.plannedUnits.filter((u) => u.day === targetDayId).length,
      notes: `Focus on ${topic.keyThinkers?.slice(0, 3).join(", ") || "core thinkers"} and 2nd ARC recommendations.`,
    };

    savePlan({ ...weeklyPlan, plannedUnits: [...weeklyPlan.plannedUnits, newUnit] });
    showToast(`Added "${topic.name}" to ${WEEK_DAYS.find((d) => d.id === targetDayId)?.label}!`);
  };

  // Run Auto-Generation
  const handleExecuteAutoGenerate = () => {
    soundEngine.playClick();
    const newPlan = generateWeeklyPlanFromSyllabus(topics, genStrategy, genDailyHours);
    savePlan(newPlan);
    setIsGeneratorModalOpen(false);
    showToast(`✨ Generated new 7-Day Timetable based on ${topics.length} syllabus units!`);
  };

  // Reset current week plan
  const handleResetWeek = () => {
    if (confirm("Reset current weekly timetable to empty?")) {
      soundEngine.playClick();
      savePlan({
        ...weeklyPlan,
        plannedUnits: [],
      });
      showToast("Weekly planner cleared.");
    }
  };

  // Helper formatting seconds
  const formatTimerClock = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Top Header Banner */}
      <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Weekly Study Planner & Syllabus Scheduler</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Week of {weeklyPlan.weekStartDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Syllabus-to-Timetable Study Planner
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Drag and drop Public Administration and General Studies units onto specific days. Study time is automatically tracked into your UPSC streak.
          </p>
        </div>

        {/* Top Actions: Auto-Generate, Reset, Syllabus Bank Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsSyllabusDrawerOpen(!isSyllabusDrawerOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              isSyllabusDrawerOpen
                ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                : "bg-[#162033] text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isSyllabusDrawerOpen ? "Hide Syllabus Bank" : "Show Syllabus Bank"}</span>
          </button>

          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Auto-Generate Timetable</span>
          </button>

          <button
            onClick={handleResetWeek}
            className="p-2 rounded-xl bg-[#162033] hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
            title="Clear Planner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Toast Message */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-200 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACTIVE REAL-TIME COMPLETION TRACKER DOCK (When user starts tracking a syllabus unit) */}
      {activeTrackingUnit && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/90 via-[#131d31] to-[#101726] border border-blue-500/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center flex-shrink-0 text-blue-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE STUDY TIME TRACKER</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{activeTrackingUnit.paper}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {activeTrackingUnit.topicName}
              </h3>
              <p className="text-xs text-slate-300">
                Target: {activeTrackingUnit.estimatedMinutes} mins • Logged so far: {activeTrackingUnit.completedMinutes} mins
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {/* Live Clock Display */}
            <div className="bg-[#0b101a] px-4 py-2 rounded-xl border border-slate-800 font-mono text-xl sm:text-2xl font-extrabold text-blue-400">
              {formatTimerClock(elapsedTimerSeconds)}
            </div>

            {isTrackerRunning ? (
              <button
                onClick={handlePauseTracking}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-600/30"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartTracking(activeTrackingUnit)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/30"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={handleStopTracking}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="Stop and log study time"
            >
              Done & Log
            </button>
          </div>
        </div>
      )}

      {/* WEEKLY STATS DASHBOARD BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#111723] p-4 rounded-xl border border-[#1e293b] space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Weekly Target Hours
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {stats.plannedHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {stats.totalUnits} syllabus units scheduled
          </div>
        </div>

        <div className="bg-[#111723] p-4 rounded-xl border border-[#1e293b] space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Tracked Study Time
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
            {stats.completedHours} <span className="text-xs font-normal text-emerald-400/80">hrs</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 font-medium">
            {stats.totalCompletedUnits} of {stats.totalUnits} units achieved
          </div>
        </div>

        <div className="bg-[#111723] p-4 rounded-xl border border-[#1e293b] space-y-1">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Weekly Completion Rate
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-between">
            <span>{stats.completionPercentage}%</span>
            <div className="w-12 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-blue-400 font-medium">
            {stats.completionPercentage >= 50 ? "🔥 Strong Momentum" : "Target pace in progress"}
          </div>
        </div>

        <div className="bg-[#111723] p-4 rounded-xl border border-[#1e293b] space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Active UPSC Streak
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-orange-400 flex items-center space-x-1.5">
            <Flame className="w-5 h-5 fill-current" />
            <span>{user.studyStreakDays} Days</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {user.totalStudyHours} total platform hours
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SYLLABUS UNITS DRAWER / BANK (DRAGGABLE POOL)       */}
      {/* ==================================================== */}
      {isSyllabusDrawerOpen && (
        <div className="bg-[#111723] rounded-2xl border border-blue-500/30 p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                Syllabus Units Bank ({filteredTopics.length} Units Available)
              </h3>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Drag any unit card onto a day column below, or click "+ Assign"
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-[#162033] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSyllabusFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  syllabusFilter === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSyllabusFilter("weak")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  syllabusFilter === "weak" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Weak Areas
              </button>
              <button
                onClick={() => setSyllabusFilter("paper1")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  syllabusFilter === "paper1" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Paper 1
              </button>
              <button
                onClick={() => setSyllabusFilter("paper2")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  syllabusFilter === "paper2" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Paper 2
              </button>
            </div>
          </div>

          {/* Search bar inside drawer */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syllabus units by topic name, thinker (e.g. Weber, Simon, Riggs), or subtopic..."
              value={syllabusSearch}
              onChange={(e) => setSyllabusSearch(e.target.value)}
              className="w-full bg-[#162033] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Horizontal scrollable or flex wrap list of draggable units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isWeak = topic.status === "needs_revision" || topic.knowledgeScore < 70;
              return (
                <div
                  key={topic.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStartFromBank(e, topic)}
                  className={`p-3 rounded-xl border bg-[#141b29] hover:bg-[#182338] transition-all cursor-grab active:cursor-grabbing select-none flex flex-col justify-between space-y-2 group ${
                    isWeak ? "border-amber-500/40 hover:border-amber-400/60" : "border-slate-800 hover:border-blue-500/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        {topic.paper}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {isWeak && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            Weak Area
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Score: {topic.knowledgeScore}%
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                      {topic.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {topic.keyThinkers?.slice(0, 2).join(", ") || "Core Concepts"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>90 mins</span>
                    </span>

                    {/* Quick Assign Dropdown */}
                    <div className="relative group/assign">
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-0.5"
                      >
                        <span>+ Assign</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      <div className="hidden group-hover/assign:flex absolute right-0 bottom-full mb-1 z-30 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-1.5 flex-col space-y-1 min-w-[110px]">
                        <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                          Assign to:
                        </span>
                        {WEEK_DAYS.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleQuickAssignFromBank(topic, d.id)}
                            className="text-left px-2 py-1 rounded text-xs text-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-colors"
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7-DAY WEEKLY TIMETABLE GRID (MONDAY TO SUNDAY)      */}
      {/* ==================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-base sm:text-lg">
              Weekly Timetable Grid
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              (Drag units between days or drop from syllabus bank)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span>Completed</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/30 border border-blue-500/50" />
              <span>In Progress</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" />
              <span>Scheduled</span>
            </span>
          </div>
        </div>

        {/* 7 Day Responsive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 items-start">
          {WEEK_DAYS.map((day) => {
            const isToday = day.id === todayWeekDayId;
            const isDragTarget = dragOverDay === day.id;
            const dayUnits = weeklyPlan.plannedUnits
              .filter((u) => u.day === day.id)
              .sort((a, b) => a.orderIndex - b.orderIndex);

            const dayStats = stats.dayStats[day.id];
            const dayPlannedHrs = (dayStats.plannedMin / 60).toFixed(1);
            const dayCompletedHrs = (dayStats.completedMin / 60).toFixed(1);
            const dayPct = dayStats.plannedMin > 0 ? Math.round((dayStats.completedMin / dayStats.plannedMin) * 100) : 0;
            const isAllCompleted = dayUnits.length > 0 && dayUnits.every((u) => u.isCompleted);

            return (
              <div
                key={day.id}
                onDragOver={(e) => handleDragOver(e, day.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnDay(e, day.id)}
                className={`rounded-2xl border transition-all flex flex-col min-h-[360px] ${
                  isDragTarget
                    ? "bg-blue-950/40 border-blue-400 ring-2 ring-blue-500/50 scale-[1.01]"
                    : isToday
                    ? "bg-[#131b2c] border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                    : "bg-[#111723] border-[#1e293b]"
                }`}
              >
                {/* Day Column Header */}
                <div className={`p-3.5 rounded-t-2xl border-b border-slate-800 space-y-2 ${isToday ? "bg-blue-950/30" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {day.label}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500 text-white">
                          Today
                        </span>
                      )}
                    </div>

                    {isAllCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Day completed" />
                    )}
                  </div>

                  {/* Day Progress and Hours */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>
                        {dayCompletedHrs} / {dayPlannedHrs} hrs
                      </span>
                      <span className={dayPct >= 100 ? "text-emerald-400 font-bold" : "text-blue-400"}>
                        {dayPct}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          dayPct >= 100 ? "bg-emerald-400" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(100, dayPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Units List on this Day */}
                <div className="p-2.5 space-y-2 flex-grow">
                  {dayUnits.length === 0 ? (
                    <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-1">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <span className="text-xs font-medium">Free Day / Rest</span>
                      <span className="text-[10px] text-slate-600">Drop syllabus unit here</span>
                    </div>
                  ) : (
                    dayUnits.map((unit) => {
                      const isTrackingThis = activeTrackingUnitId === unit.id && isTrackerRunning;
                      const unitPct = Math.min(100, Math.round((unit.completedMinutes / unit.estimatedMinutes) * 100));

                      return (
                        <div
                          key={unit.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStartExistingUnit(e, unit)}
                          className={`p-2.5 rounded-xl border transition-all group relative cursor-grab active:cursor-grabbing ${
                            isTrackingThis
                              ? "bg-blue-950/60 border-blue-500 ring-1 ring-blue-500 shadow-md"
                              : unit.isCompleted
                              ? "bg-[#101724]/60 border-slate-800/80 opacity-75"
                              : "bg-[#151c2a] border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {/* Top: Paper & Remove */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-mono">
                              {unit.paper}
                            </span>

                            <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleToggleUnitCompleted(unit.id)}
                                className="text-slate-400 hover:text-emerald-400 transition-colors"
                                title={unit.isCompleted ? "Mark pending" : "Mark completed"}
                              >
                                {unit.isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                                )}
                              </button>

                              <button
                                onClick={() => handleRemoveUnit(unit.id)}
                                className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                                title="Remove from day"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Unit Title */}
                          <h4
                            className={`text-xs font-bold leading-snug line-clamp-2 ${
                              unit.isCompleted ? "line-through text-slate-400" : "text-white"
                            }`}
                          >
                            {unit.topicName}
                          </h4>

                          {/* Subtopic */}
                          {unit.subtopicTitle && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {unit.subtopicTitle}
                            </p>
                          )}

                          {/* Completion Progress Bar */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>
                                {unit.completedMinutes}/{unit.estimatedMinutes}m
                              </span>
                              <span className={unit.isCompleted ? "text-emerald-400 font-bold" : "text-blue-400"}>
                                {unitPct}%
                              </span>
                            </div>

                            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  unit.isCompleted ? "bg-emerald-400" : "bg-blue-500"
                                }`}
                                style={{ width: `${unitPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Bottom Action Controls: Start Timer / Quick Add */}
                          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-800/60">
                            <button
                              onClick={() => handleStartTracking(unit)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                isTrackingThis
                                  ? "bg-amber-600 text-white"
                                  : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
                              }`}
                              title="Start tracking study time"
                            >
                              {isTrackingThis ? (
                                <>
                                  <Pause className="w-2.5 h-2.5 fill-white" />
                                  <span>Tracking</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>Track</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleQuickAddMinutes(unit.id, 15)}
                                className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Add 15 minutes completed"
                              >
                                +15m
                              </button>
                              <button
                                onClick={() => handleQuickAddMinutes(unit.id, 30)}
                                className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Add 30 minutes completed"
                              >
                                +30m
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Drop Zone Footer Hint */}
                <div className="p-2 border-t border-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>Drop unit here</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* AUTO-GENERATE TIMETABLE MODAL                       */}
      {/* ==================================================== */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111723] rounded-2xl border border-blue-500/40 p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Generate Weekly Study Timetable
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratorModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              The generator will analyze all {topics.length} syllabus units, identifying weak areas, pending subtopics, and thinker models to build an optimal 7-day schedule.
            </p>

            <div className="space-y-4">
              {/* Strategy Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Optimization Strategy
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      genStrategy === "weakness_first"
                        ? "bg-blue-950/40 border-blue-500 ring-1 ring-blue-500"
                        : "bg-[#162033] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={genStrategy === "weakness_first"}
                      onChange={() => setGenStrategy("weakness_first")}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        🎯 Targeted Weakness Remediation (Recommended)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Prioritizes units marked "Needs Revision" or with low knowledge scores (Administrative Thought, Accountability & Control).
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      genStrategy === "balanced"
                        ? "bg-blue-950/40 border-blue-500 ring-1 ring-blue-500"
                        : "bg-[#162033] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={genStrategy === "balanced"}
                      onChange={() => setGenStrategy("balanced")}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        ⚖️ Balanced Paper 1 & Paper 2 Coverage
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Evenly alternates Administrative Theory (Paper 1) and Indian Administration (Paper 2) across Monday to Sunday.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      genStrategy === "sprint"
                        ? "bg-blue-950/40 border-blue-500 ring-1 ring-blue-500"
                        : "bg-[#162033] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={genStrategy === "sprint"}
                      onChange={() => setGenStrategy("sprint")}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        ⚡ High-Intensity Revision Sprint
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Shorter high-yield bursts focusing on rapid subtopic completion, thinker flashcards, and answer writing.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Daily Hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Target Daily Study Hours:
                  </label>
                  <span className="text-sm font-bold text-blue-400 font-mono">
                    {genDailyHours} hrs / day ({Math.round(genDailyHours * 7)} hrs/week)
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={genDailyHours}
                  onChange={(e) => setGenDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>4 hrs (Working Pro)</span>
                  <span>7.5 hrs (Standard)</span>
                  <span>12 hrs (Full Sprint)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAutoGenerate}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate Timetable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
