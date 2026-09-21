import React, { useState, useMemo } from "react";
import {
  Zap,
  Flame,
  AlertTriangle,
  RotateCcw,
  Target,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Award,
  Sparkles,
  Clock,
  Calendar,
  Brain,
  Upload,
  History,
  Newspaper,
  GraduationCap,
  Sliders,
  Plus,
  Minus,
  Check,
  X,
} from "lucide-react";
import { StudentIntelligenceModal } from "./StudentIntelligenceModal";
import { StudentIntelligenceDashboard } from "./StudentIntelligenceDashboard";
import {
  UserProfile,
  SyllabusTopic,
  NavigationTab,
  NewsArticle,
  MainsAnswerEvaluation,
  StudySessionLog,
} from "../types";
import { MilestonesSection } from "./MilestonesSection";
import { DailyNewsDashboardSection } from "./DailyNewsDashboardSection";
import { DailyStudyGoalsSection } from "./DailyStudyGoalsSection";
import { DailyStudyGoalTracker } from "./DailyStudyGoalTracker";
import { generateMilestones } from "../data/milestonesData";

interface HomeDashboardProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  articles?: NewsArticle[];
  evaluations?: MainsAnswerEvaluation[];
  studySessions?: StudySessionLog[];
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateStudySessions?: (sessions: StudySessionLog[]) => void;
  onNavigate: (tab: NavigationTab) => void;
  onAskBoltAboutWeakness: (weaknessName: string) => void;
  onStartRevision: () => void;
  onViewEvaluation: () => void;
  onAskBolt?: (prompt: string) => void;
  onStartTodayMCQs?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  topics,
  articles = [],
  evaluations = [],
  studySessions = [],
  onUpdateUser,
  onUpdateStudySessions,
  onNavigate,
  onAskBoltAboutWeakness,
  onStartRevision,
  onViewEvaluation,
  onAskBolt = () => {},
  onStartTodayMCQs = () => onNavigate("prelims"),
}) => {
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);

  // Daily study goal calculations for top banner and progress bar
  const currentGoalHours = user.dailyStudyGoal || user.dailyStudyHoursGoal || 6;
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter study sessions achieved today based on study session logs
  const todaySessions = useMemo(() => {
    return (studySessions || []).filter((s) => {
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

  const todayAchievedMinutes = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [todaySessions]);

  const todayAchievedHours = useMemo(() => {
    return parseFloat((todayAchievedMinutes / 60).toFixed(1));
  }, [todayAchievedMinutes]);

  const rawPercentage = currentGoalHours > 0 ? (todayAchievedHours / currentGoalHours) * 100 : 0;
  const todayGoalPercentage = Math.round(rawPercentage);
  const clampedGoalPercentage = Math.min(todayGoalPercentage, 100);
  const isGoalAchieved = todayAchievedHours >= currentGoalHours;
  const remainingHours = Math.max(0, parseFloat((currentGoalHours - todayAchievedHours).toFixed(1)));

  // State for adjusting the profile's daily study goal inline
  const [isAdjustingGoal, setIsAdjustingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(currentGoalHours);

  const handleSaveGoal = (newGoal: number) => {
    const val = Math.max(0.5, Math.min(18, parseFloat(newGoal.toFixed(1))));
    setTempGoal(val);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        dailyStudyGoal: val,
        dailyStudyHoursGoal: val,
      });
    }
    setIsAdjustingGoal(false);
  };

  const handleQuickLog = (minutes: number, topicTitle: string) => {
    const newSession: StudySessionLog = {
      id: "sess-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: todayStr,
      subject: "pub_ad",
      topic: topicTitle,
      durationMinutes: minutes,
      mode: "deep_work",
    };
    const updated = [newSession, ...(studySessions || [])];
    if (onUpdateStudySessions) {
      onUpdateStudySessions(updated);
    }
    try {
      localStorage.setItem("bolt_study_sessions", JSON.stringify(updated));
    } catch {}
    if (onUpdateUser) {
      const addedHours = parseFloat((minutes / 60).toFixed(2));
      onUpdateUser({
        ...user,
        totalStudyHours: parseFloat(((user.totalStudyHours || 0) + addedHours).toFixed(1)),
      });
    }
  };

  // Generate gamified milestones dynamically based on current user state
  const milestones = useMemo(() => {
    return generateMilestones(user, topics, evaluations);
  }, [user, topics, evaluations]);

  // Calculate analytics
  const paper1Topics = topics.filter((t) => t.paper === "Paper 1");
  const paper2Topics = topics.filter((t) => t.paper === "Paper 2");

  const avgPaper1 = Math.round(
    paper1Topics.reduce((acc, t) => acc + t.completionPercentage, 0) / (paper1Topics.length || 1)
  );
  const avgPaper2 = Math.round(
    paper2Topics.reduce((acc, t) => acc + t.completionPercentage, 0) / (paper2Topics.length || 1)
  );
  const overallCompletion = Math.round((avgPaper1 + avgPaper2) / 2);

  const weakTopics = topics.filter((t) => t.status === "needs_revision");
  const strongTopics = topics.filter((t) => t.status === "strong");

  const latestEvaluation = evaluations && evaluations.length > 0 ? evaluations[0] : null;
  const avgMainsScore =
    evaluations && evaluations.length > 0
      ? (evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Welcome & Study Target Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121b2d] via-[#101726] to-[#0d121c] border border-[#22314e] p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Good Morning, {user.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              Your UPSC Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Targeting <span className="text-slate-200 font-semibold">{user.target}</span> • Optional:{" "}
              <span className="text-blue-400 font-semibold">{user.optionalSubject}</span> • Day {user.studyStreakDays} of active discipline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("bolt")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Ask Bolt Mentor</span>
            </button>
            <button
              onClick={() => onNavigate("learn")}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Syllabus Tree</span>
            </button>
            <button
              onClick={() => onNavigate("planner")}
              className="px-4 py-2.5 rounded-xl bg-[#162033] hover:bg-[#1e2c46] text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-950/40"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Study Planner & Timetable</span>
            </button>
          </div>
        </div>

        {/* Academic Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Study Streak</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{user.studyStreakDays} Days</p>
            <span className="text-[10px] text-emerald-400 font-medium">Consistent daily goal</span>
          </div>

          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Today's Study</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {todaySessions.length} {todaySessions.length === 1 ? "log" : "logs"}
                </span>
              </div>
              <p className="text-xl font-bold text-white mt-1">
                {todayAchievedHours} <span className="text-xs font-normal text-slate-400">/ {currentGoalHours}h</span>
              </p>
            </div>
            <div className="mt-2 space-y-1">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalAchieved
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${clampedGoalPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold ${
                    isGoalAchieved ? "text-emerald-400" : "text-blue-400"
                  }`}
                >
                  {isGoalAchieved ? "✓ Goal Met" : `${todayGoalPercentage}% completed`}
                </span>
                <span className="text-slate-500">
                  {isGoalAchieved ? "100%+" : `${remainingHours}h left`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Award className="w-4 h-4 text-purple-400" />
              <span>MCQs Practiced</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{user.questionsAttempted}</p>
            <span className="text-[10px] text-slate-400">
              {user.questionsAttempted > 0 ? `${user.overallAccuracy || 0}% Prelims accuracy` : "Start practicing MCQs"}
            </span>
          </div>

          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Mains Evaluated</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{user.mainsEvaluatedCount}</p>
            <span className="text-[10px] text-emerald-400 font-medium">
              {avgMainsScore ? `Avg ${avgMainsScore} / 15 Marks` : "No answers graded yet"}
            </span>
          </div>

          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Revision Due</span>
            </div>
            <p className="text-xl font-bold text-amber-400 mt-1">{weakTopics.length} Topics</p>
            <span className="text-[10px] text-amber-300 font-medium">Spaced interval alert</span>
          </div>
        </div>
      </div>

      {/* Prominent Daily Study Goal Progress Bar Section */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121a2a] via-[#101624] to-[#0c101a] border border-[#223250] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div
          className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isGoalAchieved ? "bg-emerald-500/15" : "bg-blue-500/10"
          }`}
        />

        <div className="relative z-10 space-y-4">
          {/* Header Row: Title, Profile Daily Goal Target, and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
                  isGoalAchieved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/40"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-blue-950/40"
                }`}
              >
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                    Daily Study Goal Progress
                  </h2>
                  {isGoalAchieved ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Goal Achieved!</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated from study session logs • Target:{" "}
                  <strong className="text-slate-200">{currentGoalHours} hours/day</strong>
                </p>
              </div>
            </div>

            {/* Goal Controls & Actions */}
            <div className="flex items-center space-x-2 self-start sm:self-center">
              {!isAdjustingGoal ? (
                <button
                  onClick={() => {
                    setTempGoal(currentGoalHours);
                    setIsAdjustingGoal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                  title="Modify your profile daily study goal in hours"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adjust Goal ({currentGoalHours}h)</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 bg-[#162033] border border-blue-500/60 rounded-xl p-1 shadow-lg">
                  <button
                    onClick={() =>
                      setTempGoal((prev) => Math.max(1, parseFloat((prev - 0.5).toFixed(1))))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors"
                    title="Decrease goal by 30 mins"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="18"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(parseFloat(e.target.value) || 1)}
                    className="w-14 text-center bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white py-1 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold px-0.5">hrs</span>
                  <button
                    onClick={() =>
                      setTempGoal((prev) => Math.min(18, parseFloat((prev + 0.5).toFixed(1))))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors"
                    title="Increase goal by 30 mins"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSaveGoal(tempGoal)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center space-x-1"
                    title="Save to Profile"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsAdjustingGoal(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => onNavigate("planner")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20"
                title="Open Study Planner & Pomodoro Timer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Open Timer</span>
              </button>
            </div>
          </div>

          {/* Quick presets when adjusting */}
          {isAdjustingGoal && (
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Quick Goal Presets:</span>
              {[4, 6, 8, 10, 12].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSaveGoal(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    currentGoalHours === preset
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {preset} hrs
                </button>
              ))}
            </div>
          )}

          {/* Primary Progress Bar Display */}
          <div className="space-y-2.5">
            {/* Numeric Indicators */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  {todayAchievedHours}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {currentGoalHours} hours completed
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({todayAchievedMinutes} mins logged today)
                </span>
                {todayGoalPercentage > 100 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    +{todayGoalPercentage - 100}% extra study
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-xl font-black font-['Outfit'] ${
                    isGoalAchieved ? "text-emerald-400" : "text-blue-400"
                  }`}
                >
                  {todayGoalPercentage}%
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                  {isGoalAchieved ? "Goal Accomplished" : `${remainingHours} hrs remaining`}
                </span>
              </div>
            </div>

            {/* The Visual Progress Bar */}
            <div className="relative w-full h-5 bg-[#0b101b] rounded-full p-0.5 border border-slate-700/60 overflow-hidden shadow-inner">
              {/* Background milestone tick markers */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
                <div className="border-r border-slate-400 h-full" style={{ left: "25%" }} />
                <div className="border-r border-slate-400 h-full" style={{ left: "50%" }} />
                <div className="border-r border-slate-400 h-full" style={{ left: "75%" }} />
              </div>

              {/* Dynamic filled bar */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative shadow-lg ${
                  isGoalAchieved
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-emerald-500/30"
                    : todayGoalPercentage >= 50
                    ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shadow-blue-500/30"
                    : "bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-600 shadow-blue-500/20"
                }`}
                style={{
                  width: `${Math.max(clampedGoalPercentage, todayAchievedHours > 0 ? 3 : 0)}%`,
                }}
              >
                {/* Active pulse glow on right tip */}
                {todayAchievedHours > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Milestones Scale Labels */}
            <div className="flex justify-between text-[11px] text-slate-500 font-mono px-1">
              <span>0h (0%)</span>
              <span>{(currentGoalHours * 0.25).toFixed(1)}h (25%)</span>
              <span>{(currentGoalHours * 0.5).toFixed(1)}h (50%)</span>
              <span>{(currentGoalHours * 0.75).toFixed(1)}h (75%)</span>
              <span className={isGoalAchieved ? "text-emerald-400 font-bold" : ""}>
                {currentGoalHours}h (100%)
              </span>
            </div>
          </div>

          {/* Today's Logged Study Sessions Breakdown */}
          <div className="pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Today's Logged Sessions ({todaySessions.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Total: <strong className="text-white">{todayAchievedHours} hrs</strong> logged
              </span>
            </div>

            {todaySessions.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {todaySessions.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#151f32] border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="font-bold text-white font-mono">{session.durationMinutes}m</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                      {session.topic || session.subject}
                    </span>
                    {session.timestamp && (
                      <span className="text-[10px] text-slate-500 ml-1 font-mono">
                        {session.timestamp}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#141b2a]/60 border border-dashed border-slate-800 text-xs text-slate-400">
                <p>
                  No study sessions recorded today yet. Launch the focus timer or add a session to
                  track your progress against your {currentGoalHours}h target.
                </p>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleQuickLog(45, "Public Administration Core Revision")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    + Log 45m Session
                  </button>
                  <button
                    onClick={() => onNavigate("planner")}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                  >
                    Start Timer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPSC Core Study Pillars: Direct Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upload Materials & Attend Test */}
        <button
          onClick={() => onNavigate("materials")}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#131b2c] to-[#0e1422] border border-blue-500/30 hover:border-blue-400 text-left transition-all hover:-translate-y-0.5 shadow-lg group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider">
              PDF & DOCX
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
            Upload & Attend Quiz
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Upload study files or paste notes to auto-generate & attend custom UPSC questions.
          </p>
        </button>

        {/* Historical PYQs (1855–2026) */}
        <button
          onClick={() => onNavigate("pyqs")}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1815] to-[#120f0d] border border-amber-500/30 hover:border-amber-400 text-left transition-all hover:-translate-y-0.5 shadow-lg group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
              1855 – 2026
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
            Historical PYQ Archive
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            170+ years of civil service questions with peripheral area & current affairs tagging.
          </p>
        </button>

        {/* NCERT Foundation (6–12) */}
        <button
          onClick={() => onNavigate("ncert")}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#101b17] to-[#0c1411] border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:-translate-y-0.5 shadow-lg group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
              Class 6 – 12
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            NCERT Foundation Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Chapter-wise concepts, mindmap points, and foundation practice tests.
          </p>
        </button>

        {/* Daily Current Affairs & News */}
        <button
          onClick={() => onNavigate("news")}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#161a28] to-[#10131e] border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:-translate-y-0.5 shadow-lg group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider">
              Daily Feeds
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
            Daily News & Editorials
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Live RSS from The Hindu, IE, Down to Earth, LiveLaw, PRS & Business Standard.
          </p>
        </button>
      </div>

      {/* Aspirant Milestones & Gamification Section */}
      <MilestonesSection
        milestones={milestones}
        onNavigate={onNavigate}
        onAskBolt={onAskBolt}
      />

      {/* Daily News & Current Affairs Editorial Updates (Matching User Photo) */}
      <DailyNewsDashboardSection
        articles={articles}
        onNavigate={onNavigate}
        onAskBolt={onAskBolt}
        onStartTodayMCQs={onStartTodayMCQs}
      />

      {/* Daily Study Goals Section - Hourly targets for Public Administration & Prelims Practice */}
      <DailyStudyGoalsSection
        user={user}
        topics={topics}
        onNavigate={onNavigate}
        onAskBolt={onAskBolt}
        onStartTodayMCQs={onStartTodayMCQs}
      />

      {/* Unified Student Intelligence Dashboard: 4 Required Dimensions */}
      <StudentIntelligenceDashboard
        user={user}
        topics={topics}
        evaluations={evaluations}
        studySessions={studySessions}
        onNavigate={onNavigate}
        onAskBoltTopic={onAskBoltAboutWeakness}
        onOpenDiagnosticModal={() => setIsIntelligenceOpen(true)}
      />

      {/* Main Grid: Syllabus Progress & Today's Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Syllabus & Diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus Completion Card */}
          <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg flex items-center space-x-2">
                  <span>Syllabus Completion</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                    Real-time
                  </span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Public Administration Optional (Paper 1 & Paper 2)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsIntelligenceOpen(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold flex items-center space-x-1.5 border border-purple-500/30 transition-colors"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cognitive Diagnostics</span>
                </button>
                <button
                  onClick={() => onNavigate("learn")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  <span>Full Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Total Curriculum Covered</span>
                <span className="text-white font-bold text-sm">{overallCompletion}%</span>
              </div>
              <div className="h-3 w-full bg-[#1e293b] rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${overallCompletion}%` }}
                />
              </div>
            </div>

            {/* Paper 1 vs Paper 2 split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#162033] border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-200">Paper 1: Theory</span>
                  <span className="text-xs font-bold text-blue-400">{avgPaper1}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgPaper1}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  6 of 6 Core units active • 1 weak unit flagged
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#162033] border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-200">Paper 2: Indian Admin</span>
                  <span className="text-xs font-bold text-indigo-400">{avgPaper2}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${avgPaper2}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Civil Services & Reforms requires revision
                </p>
              </div>
            </div>
          </div>

          {/* Weak Areas vs Strong Areas Diagnostic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak Areas Card */}
            <div className="bg-[#17131b] rounded-2xl border border-red-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Priority Weak Areas</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                  {weakTopics.length} Units
                </span>
              </div>

              <div className="space-y-2.5">
                {weakTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic.id}
                    className="p-2.5 rounded-xl bg-[#201520] border border-red-900/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{topic.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {topic.paper} • Knowledge Score:{" "}
                        <span className="text-red-400 font-bold">{topic.knowledgeScore}%</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onAskBoltAboutWeakness(topic.name)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors"
                    >
                      Ask Bolt
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("learn")}
                className="w-full mt-3 text-center text-xs text-red-400 hover:text-red-300 font-medium py-1"
              >
                View Detailed Diagnostic Report →
              </button>
            </div>

            {/* Strong Areas Card */}
            <div className="bg-[#11191e] rounded-2xl border border-emerald-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">High-Scoring Mastery</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {strongTopics.length} Units
                </span>
              </div>

              <div className="space-y-2.5">
                {strongTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic.id}
                    className="p-2.5 rounded-xl bg-[#142323] border border-emerald-900/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{topic.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {topic.paper} • MCQ Accuracy:{" "}
                        <span className="text-emerald-400 font-bold">{topic.mcqAccuracy}%</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">✓ Strong</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("learn")}
                className="w-full mt-3 text-center text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1"
              >
                Inspect Topic Knowledge Signals →
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Today's Targets & Daily Action */}
        <div className="space-y-6">
          {/* Daily Study Goal & Session Progress Tracker */}
          <DailyStudyGoalTracker
            user={user}
            studySessions={studySessions}
            onUpdateUser={onUpdateUser}
            onUpdateStudySessions={onUpdateStudySessions}
            onNavigate={onNavigate}
          />

          {/* Today's MCQs Banner (Matching Screenshot 6) */}
          <div className="rounded-2xl bg-gradient-to-r from-red-950/60 via-purple-950/40 to-[#121b2d] border border-red-900/40 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                Current Affairs Test
              </span>
              <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">
                Today's MCQs
              </h4>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                <span>{user.questionsAttempted} practiced</span>
                <span>• 15 fresh questions</span>
              </p>
            </div>
            <button
              onClick={() => onNavigate("prelims")}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              Practice Now
            </button>
          </div>

          {/* Thinker Flashcards Quick Revision Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-[#121b2d] border border-amber-800/40 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rapid Revision Deck</span>
              </span>
              <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">
                Thinker Flashcards
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Quiz yourself on Simon, Weber, Barnard & 20+ key thinkers
              </p>
            </div>
            <button
              onClick={() => onNavigate("learn")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center space-x-1"
            >
              <span>Start Quiz</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Evaluation Card */}
          <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-4">
            {latestEvaluation ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Latest Answer Graded</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Score: {latestEvaluation.score} / {latestEvaluation.maxMarks}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-2">
                  "{latestEvaluation.questionText}"
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Bolt feedback: {latestEvaluation.boltFeedback || latestEvaluation.whatWentWell?.[0] || "Evaluation complete."}
                </p>
                <button
                  onClick={onViewEvaluation}
                  className="w-full mt-3 py-2 rounded-xl bg-[#162033] hover:bg-[#1d2b45] text-blue-400 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>View Full Evaluation Sheet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="text-center py-3 space-y-2">
                <div className="flex items-center justify-center text-slate-400 space-x-1.5 text-xs font-semibold">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Mains Answer Evaluation</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Submit a handwritten or typed answer to receive instant UPSC standard scoring and breakdown.
                </p>
                <button
                  onClick={() => onNavigate("mains")}
                  className="w-full mt-2 py-2 rounded-xl bg-[#162033] hover:bg-[#1d2b45] text-blue-400 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>Submit Answer for Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Intelligence Engine Modal */}
      <StudentIntelligenceModal
        isOpen={isIntelligenceOpen}
        onClose={() => setIsIntelligenceOpen(false)}
        user={user}
        topics={topics}
        onAskBoltTopic={onAskBolt}
        onPracticeTopic={() => {
          setIsIntelligenceOpen(false);
          onNavigate("prelims");
        }}
      />
    </div>
  );
};
