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
import { generateMilestones } from "../data/milestonesData";
import { mockNewsArticles } from "../data/mockData";

interface HomeDashboardProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  articles?: NewsArticle[];
  evaluations?: MainsAnswerEvaluation[];
  studySessions?: StudySessionLog[];
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
  articles = mockNewsArticles,
  evaluations = [],
  studySessions = [],
  onNavigate,
  onAskBoltAboutWeakness,
  onStartRevision,
  onViewEvaluation,
  onAskBolt = () => {},
  onStartTodayMCQs = () => onNavigate("prelims"),
}) => {
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#162033]/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Study Streak</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{user.studyStreakDays} Days</p>
            <span className="text-[10px] text-emerald-400 font-medium">Consistent daily goal</span>
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
          {/* Today's Target Card */}
          <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Today's Study Target</span>
              </h3>
              <span className="text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Sep 16, 2026
              </span>
            </div>

            <ul className="space-y-2.5 mb-5">
              <li className="flex items-start space-x-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-[#162033] border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Polity – Parliament</p>
                  <p className="text-[11px] text-slate-400">Financial committees & legislative control</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-[#162033] border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Public Administration – Accountability</p>
                  <p className="text-[11px] text-slate-400">2nd ARC 4th report & citizen charters</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-[#162033] border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">20 Current Affairs MCQs</p>
                  <p className="text-[11px] text-slate-400">NPCI UPI MDR framework & Trade deficit</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-[#162033] border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">1 Mains 15-Mark Answer</p>
                  <p className="text-[11px] text-slate-400">Herbert Simon Bounded Rationality PYQ</p>
                </div>
              </li>
            </ul>

            <button
              onClick={() => {
                const el = document.getElementById("daily-study-goals-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  onNavigate("prelims");
                }
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Track Hourly Study Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                    Score: {latestEvaluation.score} / {latestEvaluation.totalMarks}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-2">
                  "{latestEvaluation.question}"
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Bolt feedback: {latestEvaluation.feedback?.strengths?.[0] || "Evaluation complete."}
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
