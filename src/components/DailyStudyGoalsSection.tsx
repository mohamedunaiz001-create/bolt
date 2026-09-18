import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  Clock,
  BookOpen,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Zap,
  Sliders,
  Plus,
  Minus,
  X,
  Award,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  UserProfile,
  SyllabusTopic,
  NavigationTab,
  DailyStudyGoalsData,
  StudyGoalCategory,
} from "../types";

interface DailyStudyGoalsSectionProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  onNavigate: (tab: NavigationTab) => void;
  onAskBolt?: (prompt: string) => void;
  onStartTodayMCQs?: () => void;
}

const STORAGE_KEY = "bolt_daily_study_goals";

// Predefined topic suggestions for Prelims
const PRELIMS_TOPIC_PRESETS = [
  "Polity – Parliament & Constitutional Bodies",
  "Economy – Monetary Policy & External Sector",
  "Environment & Ecology – Biodiversity Hotspots",
  "Modern History – Freedom Struggle 1919-1947",
  "Current Affairs – 2026 Monthly Roundups",
  "CSAT – Reading Comprehension & Syllogisms",
];

export const DailyStudyGoalsSection: React.FC<DailyStudyGoalsSectionProps> = ({
  user,
  topics,
  onNavigate,
  onAskBolt = (_prompt: string) => {},
  onStartTodayMCQs,
}) => {
  // Today's formatted date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Initialize state from localStorage or defaults
  const [goalsData, setGoalsData] = useState<DailyStudyGoalsData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DailyStudyGoalsData;
        // If it's today's data, use it; otherwise start today with carried forward targets
        if (parsed.date === todayStr) {
          return parsed;
        } else {
          return {
            date: todayStr,
            pubAdGoal: {
              ...parsed.pubAdGoal,
              completedHours: 0,
            },
            prelimsGoal: {
              ...parsed.prelimsGoal,
              completedHours: 0,
            },
          };
        }
      }
    } catch {
      // ignore
    }

    // Default goals
    return {
      date: todayStr,
      pubAdGoal: {
        id: "pub_ad",
        name: "Public Administration Optional",
        targetHours: 3.5,
        completedHours: 0,
        activeTopic: "Herbert Simon – Decision-Making & Bounded Rationality",
        subtopicNotes: "Paper 1 (Unit 2): Administrative Behavior & PYQ answers",
        lastUpdated: new Date().toISOString(),
      },
      prelimsGoal: {
        id: "prelims",
        name: "Prelims Practice & Drills",
        targetHours: 2.5,
        completedHours: 0,
        activeTopic: "Polity – Parliament & Constitutional Bodies",
        subtopicNotes: "20 MCQs on Committee System, Money Bills & Budgetary Grants",
        lastUpdated: new Date().toISOString(),
      },
    };
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goalsData));
    } catch {
      // ignore
    }
  }, [goalsData]);

  // Modal for editing daily targets
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPubAdHours, setEditPubAdHours] = useState(goalsData.pubAdGoal.targetHours);
  const [editPrelimsHours, setEditPrelimsHours] = useState(goalsData.prelimsGoal.targetHours);
  const [editPubAdTopic, setEditPubAdTopic] = useState(goalsData.pubAdGoal.activeTopic);
  const [editPrelimsTopic, setEditPrelimsTopic] = useState(goalsData.prelimsGoal.activeTopic);

  // Focus Timer state
  const [activeTimerCategory, setActiveTimerCategory] = useState<"pub_ad" | "prelims" | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerPresetDuration, setTimerPresetDuration] = useState<number | null>(null); // null = stopwatch, or seconds

  // Timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && activeTimerCategory) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerCategory]);

  // Handle saving time from timer
  const handleLogTimerTime = () => {
    if (!activeTimerCategory || timerSeconds < 10) {
      setIsTimerRunning(false);
      setActiveTimerCategory(null);
      setTimerSeconds(0);
      return;
    }

    const additionalHours = parseFloat((timerSeconds / 3600).toFixed(2));
    if (additionalHours > 0) {
      handleQuickAdd(activeTimerCategory, additionalHours);
    }

    setIsTimerRunning(false);
    setActiveTimerCategory(null);
    setTimerSeconds(0);
  };

  // Quick increment/decrement completed hours
  const handleQuickAdd = (category: "pub_ad" | "prelims", amount: number) => {
    setGoalsData((prev) => {
      if (category === "pub_ad") {
        const nextVal = Math.max(0, parseFloat((prev.pubAdGoal.completedHours + amount).toFixed(2)));
        return {
          ...prev,
          pubAdGoal: {
            ...prev.pubAdGoal,
            completedHours: nextVal,
            lastUpdated: new Date().toISOString(),
          },
        };
      } else {
        const nextVal = Math.max(0, parseFloat((prev.prelimsGoal.completedHours + amount).toFixed(2)));
        return {
          ...prev,
          prelimsGoal: {
            ...prev.prelimsGoal,
            completedHours: nextVal,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
    });
  };

  // Save targets from modal
  const handleSaveTargets = () => {
    setGoalsData((prev) => ({
      ...prev,
      pubAdGoal: {
        ...prev.pubAdGoal,
        targetHours: editPubAdHours,
        activeTopic: editPubAdTopic,
      },
      prelimsGoal: {
        ...prev.prelimsGoal,
        targetHours: editPrelimsHours,
        activeTopic: editPrelimsTopic,
      },
    }));
    setIsEditModalOpen(false);
  };

  // Quick routine presets
  const applyRoutinePreset = (pubHours: number, prelimsHours: number) => {
    setEditPubAdHours(pubHours);
    setEditPrelimsHours(prelimsHours);
  };

  // Reset today's hours
  const handleResetToday = () => {
    if (window.confirm("Are you sure you want to reset today's logged hours to 0?")) {
      setGoalsData((prev) => ({
        ...prev,
        pubAdGoal: {
          ...prev.pubAdGoal,
          completedHours: 0,
        },
        prelimsGoal: {
          ...prev.prelimsGoal,
          completedHours: 0,
        },
      }));
    }
  };

  // Calculations
  const pubAd = goalsData.pubAdGoal;
  const prelims = goalsData.prelimsGoal;

  const pubAdPercentage = Math.round((pubAd.completedHours / (pubAd.targetHours || 1)) * 100);
  const prelimsPercentage = Math.round((prelims.completedHours / (prelims.targetHours || 1)) * 100);

  const totalTargetHours = parseFloat((pubAd.targetHours + prelims.targetHours).toFixed(1));
  const totalCompletedHours = parseFloat((pubAd.completedHours + prelims.completedHours).toFixed(2));
  const overallPercentage = Math.min(
    Math.round((totalCompletedHours / (totalTargetHours || 1)) * 100),
    100
  );

  const pubAdRemainingHours = Math.max(0, parseFloat((pubAd.targetHours - pubAd.completedHours).toFixed(1)));
  const prelimsRemainingHours = Math.max(0, parseFloat((prelims.targetHours - prelims.completedHours).toFixed(1)));

  // Format timer HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section
      id="daily-study-goals-section"
      className="rounded-2xl bg-gradient-to-b from-[#111723] to-[#0c1018] border border-[#1e293b] p-5 sm:p-6 shadow-xl relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Title, Date, Total Progress, and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                  Daily Study Goals
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Target Tracker
                </span>
                {overallPercentage >= 100 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 animate-pulse">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Goal Met!</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formattedDate}</span>
                <span>•</span>
                <span>
                  Target: <strong className="text-slate-200">{totalTargetHours} hrs</strong> total
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Edit Targets, Reset, and Quick status */}
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={() => onNavigate("planner")}
            className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            title="Open weekly study planner and timetable"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Study Planner & Timetable</span>
          </button>

          <button
            id="edit-daily-targets-btn"
            onClick={() => {
              setEditPubAdHours(pubAd.targetHours);
              setEditPrelimsHours(prelims.targetHours);
              setEditPubAdTopic(pubAd.activeTopic);
              setEditPrelimsTopic(prelims.activeTopic);
              setIsEditModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-[#162033] hover:bg-[#1d2b45] text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all hover:border-slate-600"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Customize Targets</span>
          </button>

          <button
            id="reset-daily-hours-btn"
            onClick={handleResetToday}
            title="Reset logged hours for today"
            className="p-2 rounded-xl bg-[#162033]/60 hover:bg-[#1f2d47] text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overall Daily Progress Banner */}
      <div className="my-5 p-4 rounded-xl bg-[#141b29]/80 border border-slate-800/90 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-300">Daily Study Target Completion</span>
            <span className="text-[11px] text-slate-400">
              <strong className="text-white text-sm">{totalCompletedHours}</strong> /{" "}
              {totalTargetHours} Hours Logged
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-400">{overallPercentage}%</span>
            {overallPercentage >= 100 ? (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Goal Met (+100 XP)</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                {Math.max(0, parseFloat((totalTargetHours - totalCompletedHours).toFixed(1)))}h remaining
              </span>
            )}
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="h-3 w-full bg-[#1e293b] rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage >= 100
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300"
                : "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Live Focus Session Timer Bar (When active) */}
      {activeTimerCategory && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4 animate-spin text-blue-400" style={{ animationDuration: "6s" }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">
                  Active Study Session:{" "}
                  {activeTimerCategory === "pub_ad" ? "Public Administration" : "Prelims Practice"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300">
                Focusing on:{" "}
                <span className="text-blue-300 font-medium">
                  {activeTimerCategory === "pub_ad" ? pubAd.activeTopic : prelims.activeTopic}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="font-mono text-2xl font-bold text-white tracking-wider px-3 py-1 rounded-lg bg-black/40 border border-slate-700">
              {formatTimer(timerSeconds)}
            </div>

            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title={isTimerRunning ? "Pause" : "Resume"}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={handleLogTimerTime}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log & Save Time</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setActiveTimerCategory(null);
                setTimerSeconds(0);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Cancel Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Two Core Columns: 1. Public Administration Goals | 2. Prelims Practice Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* CARD 1: PUBLIC ADMINISTRATION TOPICS */}
        <div
          id="pubad-goal-card"
          className="rounded-2xl bg-[#141c2c] border border-blue-900/30 p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all shadow-md"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-base">Public Administration</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Optional Paper 1 & 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Theory, thinkers, reforms & case studies</p>
                </div>
              </div>

              {/* Status Pill */}
              {pubAdPercentage >= 100 ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-semibold">
                  {pubAdRemainingHours}h remaining
                </span>
              )}
            </div>

            {/* Progress Bar & Numerical Metrics */}
            <div className="bg-[#101725] rounded-xl p-3.5 border border-slate-800 mb-3.5">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-2xl font-bold text-white">{pubAd.completedHours}</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    / {pubAd.targetHours} Hours Target
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      pubAdPercentage >= 100 ? "text-emerald-400" : "text-blue-400"
                    }`}
                  >
                    {pubAdPercentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">Completion</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pubAdPercentage >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${Math.min(pubAdPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Active Topic Card */}
            <div className="p-3 rounded-xl bg-[#19243a] border border-blue-900/40 mb-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>Today's Focus Topic</span>
                </span>
                <button
                  onClick={() => {
                    setEditPubAdHours(pubAd.targetHours);
                    setEditPrelimsHours(prelims.targetHours);
                    setEditPubAdTopic(pubAd.activeTopic);
                    setEditPrelimsTopic(prelims.activeTopic);
                    setIsEditModalOpen(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-blue-300 font-medium"
                >
                  Change Topic
                </button>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">{pubAd.activeTopic}</p>
              {pubAd.subtopicNotes && (
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                  {pubAd.subtopicNotes}
                </p>
              )}
            </div>

            {/* Quick Log Buttons (+15m, +30m, +1h, -15m) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Quick Log Studied Time</span>
                <span>Incremental Track</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => handleQuickAdd("pub_ad", 0.25)}
                  className="py-1.5 rounded-lg bg-[#19243a] hover:bg-[#223252] text-blue-300 hover:text-white border border-blue-500/20 text-xs font-semibold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>15m</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("pub_ad", 0.5)}
                  className="py-1.5 rounded-lg bg-[#19243a] hover:bg-[#223252] text-blue-300 hover:text-white border border-blue-500/20 text-xs font-semibold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>30m</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("pub_ad", 1.0)}
                  className="py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-bold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-blue-300" />
                  <span>1h</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("pub_ad", -0.25)}
                  disabled={pubAd.completedHours <= 0}
                  className="py-1.5 rounded-lg bg-[#19243a]/50 hover:bg-[#223252] text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition-colors flex items-center justify-center space-x-0.5 disabled:opacity-40"
                  title="Undo 15 minutes"
                >
                  <Minus className="w-3 h-3" />
                  <span>15m</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer for Pub Ad */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (activeTimerCategory === "pub_ad" && isTimerRunning) {
                  setIsTimerRunning(false);
                } else {
                  setActiveTimerCategory("pub_ad");
                  setIsTimerRunning(true);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTimerCategory === "pub_ad" && isTimerRunning
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-[#1d2940] hover:bg-[#243452] text-blue-300 border border-blue-500/30"
              }`}
            >
              {activeTimerCategory === "pub_ad" && isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-blue-300" />
                  <span>Start Focus Timer</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onAskBolt(`Let's revise Public Administration topic: "${pubAd.activeTopic}". Provide key thinkers, theoretical debates, and 1 PYQ answer framework.`)}
                className="px-2.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/20 transition-colors flex items-center space-x-1"
                title="Ask Bolt about this topic"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Ask Bolt</span>
              </button>

              <button
                onClick={() => onNavigate("learn")}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                title="Open Syllabus & Flashcards"
              >
                <span>Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: PRELIMS PRACTICE */}
        <div
          id="prelims-goal-card"
          className="rounded-2xl bg-[#141b22] border border-emerald-900/30 p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-md"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-base">Prelims Practice</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      GS Paper 1 & CSAT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">MCQs, statement drills & speed testing</p>
                </div>
              </div>

              {/* Status Pill */}
              {prelimsPercentage >= 100 ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                  {prelimsRemainingHours}h remaining
                </span>
              )}
            </div>

            {/* Progress Bar & Numerical Metrics */}
            <div className="bg-[#0f1816] rounded-xl p-3.5 border border-slate-800 mb-3.5">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-2xl font-bold text-white">{prelims.completedHours}</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    / {prelims.targetHours} Hours Target
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      prelimsPercentage >= 100 ? "text-emerald-400" : "text-emerald-400"
                    }`}
                  >
                    {prelimsPercentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">Completion</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400"
                  style={{ width: `${Math.min(prelimsPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Active Topic Card */}
            <div className="p-3 rounded-xl bg-[#14261f] border border-emerald-900/40 mb-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  <span>Today's Question Focus</span>
                </span>
                <button
                  onClick={() => {
                    setEditPubAdHours(pubAd.targetHours);
                    setEditPrelimsHours(prelims.targetHours);
                    setEditPubAdTopic(pubAd.activeTopic);
                    setEditPrelimsTopic(prelims.activeTopic);
                    setIsEditModalOpen(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-emerald-300 font-medium"
                >
                  Change Area
                </button>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">{prelims.activeTopic}</p>
              {prelims.subtopicNotes && (
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                  {prelims.subtopicNotes}
                </p>
              )}
            </div>

            {/* Quick Log Buttons (+15m, +30m, +1h, -15m) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Quick Log Practice Time</span>
                <span>Incremental Track</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => handleQuickAdd("prelims", 0.25)}
                  className="py-1.5 rounded-lg bg-[#152a20] hover:bg-[#1d3b2c] text-emerald-300 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>15m</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("prelims", 0.5)}
                  className="py-1.5 rounded-lg bg-[#152a20] hover:bg-[#1d3b2c] text-emerald-300 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>30m</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("prelims", 1.0)}
                  className="py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-bold transition-colors flex items-center justify-center space-x-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-300" />
                  <span>1h</span>
                </button>
                <button
                  onClick={() => handleQuickAdd("prelims", -0.25)}
                  disabled={prelims.completedHours <= 0}
                  className="py-1.5 rounded-lg bg-[#152a20]/50 hover:bg-[#1d3b2c] text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition-colors flex items-center justify-center space-x-0.5 disabled:opacity-40"
                  title="Undo 15 minutes"
                >
                  <Minus className="w-3 h-3" />
                  <span>15m</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer for Prelims */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (activeTimerCategory === "prelims" && isTimerRunning) {
                  setIsTimerRunning(false);
                } else {
                  setActiveTimerCategory("prelims");
                  setIsTimerRunning(true);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTimerCategory === "prelims" && isTimerRunning
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-[#193226] hover:bg-[#204031] text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {activeTimerCategory === "prelims" && isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-emerald-300" />
                  <span>Start Focus Timer</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (onStartTodayMCQs) {
                  onStartTodayMCQs();
                } else {
                  onNavigate("prelims");
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Practice MCQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Customization Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111723] rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Customize Daily Targets</h4>
                  <p className="text-xs text-slate-400">Set realistic hourly quotas for your day</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Routine Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Quick Daily Routine Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyRoutinePreset(3.5, 2.5)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    editPubAdHours === 3.5 && editPrelimsHours === 2.5
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-[#162033] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-bold">Standard</span>
                  <span className="text-[10px]">6.0h Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyRoutinePreset(4.5, 3.5)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    editPubAdHours === 4.5 && editPrelimsHours === 3.5
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-[#162033] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-bold">Intense</span>
                  <span className="text-[10px]">8.0h Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyRoutinePreset(2.0, 1.5)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    editPubAdHours === 2.0 && editPrelimsHours === 1.5
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-[#162033] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-bold">Light</span>
                  <span className="text-[10px]">3.5h Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyRoutinePreset(5.0, 4.0)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    editPubAdHours === 5.0 && editPrelimsHours === 4.0
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-[#162033] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-bold">Weekend</span>
                  <span className="text-[10px]">9.0h Total</span>
                </button>
              </div>
            </div>

            {/* Target 1: Public Administration */}
            <div className="p-4 rounded-xl bg-[#162033] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Public Administration Target</span>
                </span>
                <span className="text-sm font-bold text-blue-400">{editPubAdHours} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={editPubAdHours}
                onChange={(e) => setEditPubAdHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5h</span>
                <span>4.0h</span>
                <span>8.0h</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Primary Focus Topic for Today
                </label>
                <select
                  value={editPubAdTopic}
                  onChange={(e) => setEditPubAdTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1522] border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.paper}: {t.name}
                    </option>
                  ))}
                  <option value="Thinker Revision: Simon, Weber & Barnard">
                    Thinker Revision: Simon, Weber & Barnard
                  </option>
                  <option value="2nd ARC Recommendations & Civil Service Reforms">
                    2nd ARC Recommendations & Civil Service Reforms
                  </option>
                </select>
              </div>
            </div>

            {/* Target 2: Prelims Practice */}
            <div className="p-4 rounded-xl bg-[#162033] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prelims Practice Target</span>
                </span>
                <span className="text-sm font-bold text-emerald-400">{editPrelimsHours} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={editPrelimsHours}
                onChange={(e) => setEditPrelimsHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5h</span>
                <span>3.0h</span>
                <span>6.0h</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Prelims Focus Area
                </label>
                <select
                  value={editPrelimsTopic}
                  onChange={(e) => setEditPrelimsTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1522] border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {PRELIMS_TOPIC_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTargets}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                Save Daily Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
