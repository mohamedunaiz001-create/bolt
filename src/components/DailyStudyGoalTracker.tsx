import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Target,
  Clock,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Play,
  Calendar,
  Flame,
  ChevronRight,
  Sliders,
  Check,
  X,
  BookOpen,
  Award,
} from "lucide-react";
import {
  UserProfile,
  StudySessionLog,
  NavigationTab,
  StudySubjectCategory,
} from "../types";
import { CircularProgressRing } from "./CircularProgressGauge";

export interface DailyStudyGoalTrackerProps {
  user: UserProfile;
  studySessions?: StudySessionLog[];
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateStudySessions?: (sessions: StudySessionLog[]) => void;
  onNavigate: (tab: NavigationTab) => void;
  className?: string;
}

const GOAL_STORAGE_KEY = "bolt_daily_study_goal_hours";

export const DailyStudyGoalTracker: React.FC<DailyStudyGoalTrackerProps> = ({
  user,
  studySessions = [],
  onUpdateUser,
  onUpdateStudySessions,
  onNavigate,
  className = "",
}) => {
  // Goal in hours (defaults to user.dailyStudyHoursGoal || saved in localStorage || 6)
  const [goalHours, setGoalHours] = useState<number>(() => {
    if (user.dailyStudyHoursGoal && user.dailyStudyHoursGoal > 0) {
      return user.dailyStudyHoursGoal;
    }
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return 6;
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState<string>(goalHours.toString());
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickSubject, setQuickSubject] = useState<StudySubjectCategory>("pub_ad");
  const [quickTopic, setQuickTopic] = useState("Public Administration Core Revision");
  const [quickMinutes, setQuickMinutes] = useState(45);

  // Today's formatted date
  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const todayDisplayDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Filter study sessions achieved today
  const todaySessions = useMemo(() => {
    return studySessions.filter((s) => {
      if (s.date === todayStr) return true;
      if (s.timestamp) {
        try {
          const sDate = new Date(s.timestamp);
          if (!isNaN(sDate.getTime())) {
            return sDate.toISOString().split("T")[0] === todayStr;
          }
        } catch {
          // ignore
        }
      }
      return false;
    });
  }, [studySessions, todayStr]);

  // Aggregate today's study minutes and hours
  const todayMinutes = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [todaySessions]);

  const todayHours = useMemo(() => {
    return parseFloat((todayMinutes / 60).toFixed(1));
  }, [todayMinutes]);

  // Progress percentage (can exceed 100%)
  const progressPercentage = useMemo(() => {
    if (goalHours <= 0) return 0;
    return Math.round((todayHours / goalHours) * 100);
  }, [todayHours, goalHours]);

  const clampedProgress = Math.min(progressPercentage, 100);
  const isGoalAchieved = progressPercentage >= 100;
  const hoursRemaining = Math.max(0, parseFloat((goalHours - todayHours).toFixed(1)));
  const minutesRemaining = Math.max(0, Math.round(goalHours * 60 - todayMinutes));

  // Handler for setting goal
  const handleSaveGoal = (newGoal: number) => {
    const validatedGoal = Math.max(0.5, Math.min(18, parseFloat(newGoal.toFixed(1))));
    setGoalHours(validatedGoal);
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, validatedGoal.toString());
    } catch {
      // ignore
    }
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        dailyStudyHoursGoal: validatedGoal,
      });
    }
    setIsEditingGoal(false);
  };

  const handleAdjustGoal = (delta: number) => {
    const nextGoal = Math.max(0.5, Math.min(18, parseFloat((goalHours + delta).toFixed(1))));
    handleSaveGoal(nextGoal);
  };

  // Quick Log a completed study session
  const handleQuickLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickMinutes <= 0) return;

    const newSession: StudySessionLog = {
      id: "sess-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: todayStr,
      subject: quickSubject,
      topic: quickTopic.trim() || "Study Session",
      durationMinutes: quickMinutes,
      mode: "deep_work",
    };

    const updatedSessions = [newSession, ...studySessions];

    if (onUpdateStudySessions) {
      onUpdateStudySessions(updatedSessions);
    } else {
      try {
        localStorage.setItem("bolt_study_sessions", JSON.stringify(updatedSessions));
      } catch {}
    }

    // Also update user's total study hours
    if (onUpdateUser) {
      const addedHours = parseFloat((quickMinutes / 60).toFixed(2));
      onUpdateUser({
        ...user,
        totalStudyHours: parseFloat(((user.totalStudyHours || 0) + addedHours).toFixed(1)),
      });
    }

    setIsQuickLogOpen(false);
  };

  // Ring gradient coloring based on progress
  const ringGradient = useMemo(() => {
    if (isGoalAchieved) {
      return { from: "#10b981", to: "#06b6d4" }; // emerald to cyan
    }
    if (progressPercentage >= 50) {
      return { from: "#3b82f6", to: "#6366f1" }; // blue to indigo
    }
    return { from: "#f59e0b", to: "#3b82f6" }; // amber to blue
  }, [isGoalAchieved, progressPercentage]);

  return (
    <div
      className={`bg-[#111723] rounded-2xl border border-[#1e293b] p-5 shadow-sm space-y-4 relative overflow-hidden ${className}`}
    >
      {/* Background ambient glow */}
      {isGoalAchieved && (
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header: Title, Date, and Edit Goal Button */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isGoalAchieved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}
          >
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-base font-['Outfit']">
                Daily Study Goal
              </h3>
              {isGoalAchieved && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Goal Met!</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{todayDisplayDate}</span>
              <span>•</span>
              <span>Based on logged sessions</span>
            </p>
          </div>
        </div>

        {/* Goal Setting & Stepper */}
        <div className="flex items-center space-x-1.5">
          {!isEditingGoal ? (
            <button
              onClick={() => {
                setTempGoalInput(goalHours.toString());
                setIsEditingGoal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Set your daily target in hours"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Target: <strong className="text-white">{goalHours}h</strong>
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 bg-[#162033] border border-blue-500/50 rounded-lg p-1">
              <button
                onClick={() => handleAdjustGoal(-0.5)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                title="Decrease goal by 30 mins"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                step="0.5"
                min="1"
                max="18"
                value={tempGoalInput}
                onChange={(e) => setTempGoalInput(e.target.value)}
                className="w-12 text-center bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white py-0.5"
              />
              <span className="text-[11px] text-slate-400 font-semibold px-0.5">h</span>
              <button
                onClick={() => handleAdjustGoal(0.5)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                title="Increase goal by 30 mins"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  const parsed = parseFloat(tempGoalInput);
                  if (!isNaN(parsed) && parsed > 0) {
                    handleSaveGoal(parsed);
                  } else {
                    setIsEditingGoal(false);
                  }
                }}
                className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs"
                title="Save goal"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Routine Goal Presets when editing */}
      {isEditingGoal && (
        <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-[#162033]/90 border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Presets:</span>
          {[4, 6, 8, 10].map((preset) => (
            <button
              key={preset}
              onClick={() => handleSaveGoal(preset)}
              className={`px-2 py-0.5 rounded text-xs font-semibold border transition-all ${
                goalHours === preset
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {preset}h
            </button>
          ))}
        </div>
      )}

      {/* Main Goal Achievement Display: Circular Ring + Detailed Metrics */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-3.5 rounded-xl bg-[#162033]/60 border border-slate-800/80">
        {/* Progress Ring with SVG Animation */}
        <div className="flex-shrink-0 relative">
          <CircularProgressRing
            value={clampedProgress}
            size={105}
            strokeWidth={8}
            gradientFrom={ringGradient.from}
            gradientTo={ringGradient.to}
            sublabel={isGoalAchieved ? "Met" : "Achieved"}
            valueSuffix="%"
            valueColor={isGoalAchieved ? "text-emerald-400" : "text-white"}
          />
        </div>

        {/* Numeric Breakdown & Status */}
        <div className="flex-grow space-y-2 w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <div className="flex items-baseline justify-center sm:justify-start space-x-1.5">
                <span
                  className={`text-2xl font-black font-['Outfit'] ${
                    isGoalAchieved ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {todayHours}
                </span>
                <span className="text-sm font-bold text-slate-400">/ {goalHours} hrs</span>
                {progressPercentage > 100 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +{progressPercentage - 100}% bonus
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isGoalAchieved ? (
                  <span className="text-emerald-400 font-semibold flex items-center justify-center sm:justify-start space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Target surpassed for today! Keep up the momentum.</span>
                  </span>
                ) : (
                  <span>
                    <strong className="text-slate-200">
                      {hoursRemaining >= 1
                        ? `${hoursRemaining} hrs`
                        : `${minutesRemaining} mins`}
                    </strong>{" "}
                    remaining to reach your daily {goalHours}h target
                  </span>
                )}
              </p>
            </div>

            <div className="text-center sm:text-right flex-shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Logged Sessions
              </span>
              <span className="text-xs font-bold text-slate-200">
                {todaySessions.length} {todaySessions.length === 1 ? "session" : "sessions"}
              </span>
            </div>
          </div>

          {/* Linear Progress Bar with Animated Entrance */}
          <div className="space-y-1 pt-1">
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <motion.div
                className={`h-full rounded-full ${
                  isGoalAchieved
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-sm shadow-emerald-500/50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>0h</span>
              <span>{(goalHours / 2).toFixed(1)}h (50%)</span>
              <span className={isGoalAchieved ? "text-emerald-400 font-bold" : ""}>
                {goalHours}h Target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Study Sessions Breakdown or Empty State */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Today's Study Session Logs</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQuickLogOpen(!isQuickLogOpen)}
              className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Quick Log</span>
            </button>
            <button
              onClick={() => onNavigate("planner")}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-0.5"
            >
              <span>Timer</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inline Quick Log Session Form */}
        {isQuickLogOpen && (
          <form
            onSubmit={handleQuickLogSession}
            className="p-3 rounded-xl bg-[#162033] border border-blue-500/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Log Offline Study Session</span>
              </span>
              <button
                type="button"
                onClick={() => setIsQuickLogOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Subject</label>
                <select
                  value={quickSubject}
                  onChange={(e) => setQuickSubject(e.target.value as StudySubjectCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                >
                  <option value="pub_ad">Public Administration</option>
                  <option value="prelims">Prelims Practice & MCQs</option>
                  <option value="mains">Mains Answer Writing</option>
                  <option value="current_affairs">Current Affairs & Editorials</option>
                  <option value="gs_core">General Studies Core</option>
                  <option value="revision">Spaced Revision</option>
                  <option value="csat">CSAT Drills</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Duration (Minutes)</label>
                <div className="flex items-center space-x-1">
                  {[25, 45, 60, 90].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setQuickMinutes(m)}
                      className={`px-1.5 py-1 rounded text-[11px] font-semibold flex-1 border transition-all ${
                        quickMinutes === m
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Topic Notes</label>
                <input
                  type="text"
                  value={quickTopic}
                  onChange={(e) => setQuickTopic(e.target.value)}
                  placeholder="e.g. Herbert Simon or Polity MCQs"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsQuickLogOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Save Session (+{quickMinutes}m)
              </button>
            </div>
          </form>
        )}

        {/* Sessions list */}
        {todaySessions.length > 0 ? (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {todaySessions.slice(0, 4).map((session) => (
              <div
                key={session.id}
                className="p-2.5 rounded-xl bg-[#162033]/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      session.subject === "pub_ad"
                        ? "bg-blue-400"
                        : session.subject === "prelims"
                        ? "bg-purple-400"
                        : session.subject === "current_affairs"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{session.topic}</p>
                    <p className="text-[10px] text-slate-400">
                      {session.subject === "pub_ad"
                        ? "Public Administration"
                        : session.subject === "prelims"
                        ? "Prelims Drill"
                        : session.subject === "mains"
                        ? "Mains Answer"
                        : session.subject}
                      {session.timestamp && ` • ${session.timestamp}`}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="font-bold text-slate-100">{session.durationMinutes} mins</span>
                  <span className="text-[10px] text-slate-400 block">
                    ({(session.durationMinutes / 60).toFixed(1)}h)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#162033]/40 border border-slate-800/60 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No study sessions logged today yet. Start a timer or log offline hours to advance your{" "}
              <strong className="text-slate-200">{goalHours}h</strong> target!
            </p>
            <div className="flex justify-center space-x-2 pt-0.5">
              <button
                onClick={() => onNavigate("planner")}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Study Timer</span>
              </button>
              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Hours</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA: Launch Timetable & Timer */}
      <button
        onClick={() => onNavigate("planner")}
        className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-700/60 transition-colors"
      >
        <span>Open Timetable, Planner & Focus Timer</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </div>
  );
};
