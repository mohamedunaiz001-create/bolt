import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  Layers,
  Award,
  Calendar,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Target,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Zap,
  Info,
  ChevronRight,
  RefreshCw,
  Clock,
  Flame,
  ShieldCheck,
  Network,
} from "lucide-react";
import {
  UserProfile,
  SyllabusTopic,
  NavigationTab,
  MainsAnswerEvaluation,
  StudySessionLog,
} from "../types";
import { StudyConsistencyHeatmap } from "./StudyConsistencyHeatmap";
import { CircularProgressRing, DualConcentricComparison } from "./CircularProgressGauge";

export interface StudentIntelligenceDashboardProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  evaluations?: MainsAnswerEvaluation[];
  studySessions?: StudySessionLog[];
  onNavigate: (tab: NavigationTab) => void;
  onAskBoltTopic?: (topicName: string) => void;
  onOpenDiagnosticModal?: () => void;
  className?: string;
}

interface IntelligenceReportState {
  overallSyllabusCompletion: number;
  overallKnowledgeMastery: number;
  mcqOverallAccuracy: number | null;
  mainsOverallAverage: number | null;
  totalMcqAttempted: number;
  totalMainsEvaluated: number;
  dataConfidence: "sufficient" | "insufficient_data";
  revisionQueueLength: number;
  criticalRevisionTopics: string[];
  topWeakAreas: Array<{
    topic: string;
    paper: string;
    mastery: number;
    completion: number;
    flaw: string;
    status: string;
  }>;
  topStrongAreas: Array<{
    topic: string;
    mastery: number;
    mcqAccuracy: number | null;
    status: string;
  }>;
  trends?: {
    period: string;
    mcqAccuracyDelta: number;
    mainsScoreDelta: number;
    trajectory: "improving" | "stable" | "declining" | "insufficient_data";
  };
  mainsDimensionWeaknesses?: Array<{
    dimension: string;
    frequency: number;
    recommendation: string;
  }>;
}

export const StudentIntelligenceDashboard: React.FC<StudentIntelligenceDashboardProps> = ({
  user,
  topics,
  evaluations = [],
  studySessions = [],
  onNavigate,
  onAskBoltTopic = (_topicName: string) => {},
  onOpenDiagnosticModal,
  className = "",
}) => {
  const [activeDimension, setActiveDimension] = useState<"all" | "syllabus" | "mastery" | "performance" | "consistency">("all");
  const [report, setReport] = useState<IntelligenceReportState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compute immediate local analytics from props so there is zero initial delay
  const localAnalytics = useMemo(() => {
    const paper1Topics = topics.filter((t) => t.paper === "Paper 1");
    const paper2Topics = topics.filter((t) => t.paper === "Paper 2");

    const p1Completion = Math.round(
      paper1Topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) / (paper1Topics.length || 1)
    );
    const p2Completion = Math.round(
      paper2Topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) / (paper2Topics.length || 1)
    );
    const overallCompletion = Math.round((p1Completion + p2Completion) / 2);

    const validMasteryTopics = topics.filter((t) => typeof t.knowledgeScore === "number");
    const overallMastery = validMasteryTopics.length > 0
      ? Math.round(validMasteryTopics.reduce((acc, t) => acc + t.knowledgeScore, 0) / validMasteryTopics.length)
      : 0;

    // Divergence analysis (Syllabus Coverage vs Verified Mastery)
    const divergence = overallCompletion - overallMastery;
    let divergenceStatus: "healthy" | "gap" | "mastered" = "healthy";
    let divergenceLabel = "Balanced Alignment";
    let divergenceDesc = "Your theoretical reading and diagnostic mastery are evenly matched.";

    if (divergence >= 15) {
      divergenceStatus = "gap";
      divergenceLabel = "Illusion of Competence Risk";
      divergenceDesc = `Coverage (${overallCompletion}%) exceeds tested mastery (${overallMastery}%). High risk of passive reading without retention.`;
    } else if (overallMastery >= 75 && overallCompletion >= 70) {
      divergenceStatus = "mastered";
      divergenceLabel = "High-Retention Grounding";
      divergenceDesc = "Deep conceptual clarity confirmed through active recall and evaluated output.";
    }

    const weakTopics = topics.filter(
      (t) => t.status === "needs_revision" || (t.knowledgeScore > 0 && t.knowledgeScore < 65)
    );
    const strongTopics = topics.filter(
      (t) => t.status === "strong" || t.knowledgeScore >= 75
    );

    const avgMainsScore = evaluations.length > 0
      ? (evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length).toFixed(1)
      : null;

    // Consistency score (0-100) calculated from streak, daily targets, and regular practice
    const streakFactor = Math.min(user.studyStreakDays * 4, 40);
    const hoursFactor = Math.min((user.totalStudyHours / 150) * 30, 30);
    const practiceFactor = Math.min(((user.questionsAttempted + user.mainsEvaluatedCount * 10) / 200) * 30, 30);
    const consistencyIndex = Math.min(Math.round(streakFactor + hoursFactor + practiceFactor), 100);

    return {
      paper1Topics,
      paper2Topics,
      p1Completion,
      p2Completion,
      overallCompletion,
      overallMastery,
      divergence,
      divergenceStatus,
      divergenceLabel,
      divergenceDesc,
      weakTopics,
      strongTopics,
      avgMainsScore,
      consistencyIndex,
    };
  }, [user, topics, evaluations]);

  // Fetch backend intelligence data asynchronously to augment diagnostic insights
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || "candidate-1",
          userName: user.name,
          targetExam: user.target,
          optionalSubject: user.optionalSubject,
          topics,
          evaluations,
          studyStreakDays: user.studyStreakDays,
          questionsAttempted: user.questionsAttempted,
          overallAccuracy: user.overallAccuracy,
          mainsEvaluatedCount: user.mainsEvaluatedCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.warn("Using client-side intelligence calculations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [user.id, topics.length, evaluations.length]);

  return (
    <div
      id="student-intelligence-dashboard"
      className={`rounded-2xl bg-[#0e1524] border border-[#223354] p-5 sm:p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Subtle background ambient gradients */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with title, status badge & action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-inner">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] tracking-tight">
                Student Intelligence Dashboard
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 uppercase tracking-wider">
                Multi-Signal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive telemetry across Coverage, Mastery, Exam Output & Discipline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenDiagnosticModal && (
            <button
              onClick={onOpenDiagnosticModal}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#162238] hover:bg-[#1d2d4a] text-purple-300 font-semibold border border-purple-500/30 flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Full Cognitive Map</span>
            </button>
          )}
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/80 transition-colors"
            title="Refresh Intelligence Engine"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dimension Filter Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 pt-4 pb-2 overflow-x-auto text-xs font-semibold scrollbar-none relative z-10">
        <button
          onClick={() => setActiveDimension("all")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeDimension === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All 4 Dimensions</span>
        </button>
        <button
          onClick={() => setActiveDimension("syllabus")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeDimension === "syllabus"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Syllabus Coverage</span>
        </button>
        <button
          onClick={() => setActiveDimension("mastery")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeDimension === "mastery"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>2. Knowledge Mastery</span>
        </button>
        <button
          onClick={() => setActiveDimension("performance")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeDimension === "performance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>3. Prelims / Mains</span>
        </button>
        <button
          onClick={() => setActiveDimension("consistency")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeDimension === "consistency"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>4. Study Consistency</span>
        </button>
      </div>

      {/* Primary 4-Pillar High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 relative z-10">
        {/* Dimension 1: Syllabus Coverage */}
        <div
          onClick={() => setActiveDimension("syllabus")}
          className={`cursor-pointer rounded-xl p-3.5 sm:p-4 transition-all border ${
            activeDimension === "syllabus"
              ? "bg-[#142036] border-blue-500 shadow-md shadow-blue-500/10"
              : "bg-[#111928] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Syllabus Coverage</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              P1 & P2
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white font-['Outfit']">
                  {localAnalytics.overallCompletion}%
                </span>
                <span className="text-[11px] text-slate-400">read</span>
              </div>
              <div className="mt-2 space-y-1 text-[10px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  <span>P1: <strong className="text-slate-200">{localAnalytics.p1Completion}%</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  <span>P2: <strong className="text-slate-200">{localAnalytics.p2Completion}%</strong></span>
                </div>
              </div>
            </div>

            <CircularProgressRing
              value={localAnalytics.overallCompletion}
              size={62}
              strokeWidth={5.5}
              gradientFrom="#3b82f6"
              gradientTo="#6366f1"
              sublabel="COVER"
            />
          </div>

          <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: `${localAnalytics.overallCompletion}%` }}
            />
          </div>
        </div>

        {/* Dimension 2: Knowledge Mastery */}
        <div
          onClick={() => setActiveDimension("mastery")}
          className={`cursor-pointer rounded-xl p-3.5 sm:p-4 transition-all border ${
            activeDimension === "mastery"
              ? "bg-[#1b152d] border-purple-500 shadow-md shadow-purple-500/10"
              : "bg-[#111928] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Knowledge Mastery</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Tested
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-purple-300 font-['Outfit']">
                  {localAnalytics.overallMastery}%
                </span>
                <span className="text-[11px] text-slate-400">mastery</span>
              </div>
              <div className="mt-2 text-[10px]">
                <span className="text-slate-400">Retention Gap: </span>
                <span
                  className={`font-semibold ${
                    localAnalytics.divergence >= 15
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {localAnalytics.divergence > 0 ? `-${localAnalytics.divergence}%` : "Aligned"}
                </span>
              </div>
            </div>

            <CircularProgressRing
              value={localAnalytics.overallMastery}
              size={62}
              strokeWidth={5.5}
              gradientFrom="#a855f7"
              gradientTo="#ec4899"
              valueColor="text-purple-300"
              sublabel="MASTERY"
            />
          </div>

          <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${localAnalytics.overallMastery}%` }}
            />
          </div>
        </div>

        {/* Dimension 3: Prelims & Mains Performance */}
        <div
          onClick={() => setActiveDimension("performance")}
          className={`cursor-pointer rounded-xl p-3.5 sm:p-4 transition-all border ${
            activeDimension === "performance"
              ? "bg-[#112328] border-emerald-500 shadow-md shadow-emerald-500/10"
              : "bg-[#111928] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exam Performance</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Dual Track
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold text-white font-['Outfit']">
                  {user.questionsAttempted > 0 ? `${user.overallAccuracy || 0}%` : "—"}
                </span>
                <span className="text-[11px] text-slate-400">MCQ Acc.</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Mains: <strong className="text-emerald-400 font-semibold">{localAnalytics.avgMainsScore ? `${localAnalytics.avgMainsScore}/15` : "—"}</strong>
              </p>
            </div>

            <CircularProgressRing
              value={user.questionsAttempted > 0 ? (user.overallAccuracy || 0) : 0}
              size={62}
              strokeWidth={5.5}
              gradientFrom="#10b981"
              gradientTo="#06b6d4"
              valueColor="text-emerald-300"
              sublabel="ACCURACY"
            />
          </div>

          <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${Math.min(user.overallAccuracy || 50, 100)}%` }}
            />
          </div>
        </div>

        {/* Dimension 4: Study Consistency */}
        <div
          onClick={() => setActiveDimension("consistency")}
          className={`cursor-pointer rounded-xl p-3.5 sm:p-4 transition-all border ${
            activeDimension === "consistency"
              ? "bg-[#25181c] border-orange-500 shadow-md shadow-orange-500/10"
              : "bg-[#111928] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Study Consistency</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Discipline
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-orange-400 font-['Outfit']">
                  {user.studyStreakDays}
                </span>
                <span className="text-[11px] text-slate-400">day streak 🔥</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Logged: <strong className="text-orange-300 font-semibold">{user.totalStudyHours}h</strong>
              </p>
            </div>

            <CircularProgressRing
              value={localAnalytics.consistencyIndex}
              size={62}
              strokeWidth={5.5}
              gradientFrom="#f97316"
              gradientTo="#fbbf24"
              valueColor="text-orange-400"
              sublabel="INDEX"
            />
          </div>

          <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
              style={{ width: `${localAnalytics.consistencyIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Dimensional Breakdown Sections */}
      <div className="mt-5 space-y-4 relative z-10">
        {/* 1. SYLLABUS COVERAGE DEEP-DIVE */}
        {(activeDimension === "all" || activeDimension === "syllabus") && (
          <div className="p-4 rounded-xl bg-[#121a2a] border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Dimension 1: Syllabus Coverage</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                  {topics.length} Total Units Tracked
                </span>
              </div>
              <button
                onClick={() => onNavigate("learn")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <span>Explore Full Syllabus Tree</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paper 1 Card */}
              <div className="p-3.5 rounded-xl bg-[#162136] border border-slate-800">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">Paper 1: Administrative Theory</span>
                      <span className="text-xs font-bold text-blue-400">{localAnalytics.p1Completion}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${localAnalytics.p1Completion}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Core Thinkers, Bureaucracy, Accountability & Public Policy
                    </p>
                  </div>
                  <CircularProgressRing
                    value={localAnalytics.p1Completion}
                    size={52}
                    strokeWidth={5}
                    gradientFrom="#3b82f6"
                    gradientTo="#60a5fa"
                    sublabel="P1"
                  />
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {localAnalytics.paper1Topics.slice(0, 4).map((t) => (
                    <span
                      key={t.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {t.name.split(":")[0] || t.name} ({t.completionPercentage}%)
                    </span>
                  ))}
                  {localAnalytics.paper1Topics.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                      +{localAnalytics.paper1Topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Paper 2 Card */}
              <div className="p-3.5 rounded-xl bg-[#162136] border border-slate-800">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">Paper 2: Indian Administration</span>
                      <span className="text-xs font-bold text-indigo-400">{localAnalytics.p2Completion}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${localAnalytics.p2Completion}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Evolution, Union Executive, Civil Services, Law & Order
                    </p>
                  </div>
                  <CircularProgressRing
                    value={localAnalytics.p2Completion}
                    size={52}
                    strokeWidth={5}
                    gradientFrom="#6366f1"
                    gradientTo="#818cf8"
                    sublabel="P2"
                  />
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {localAnalytics.paper2Topics.slice(0, 4).map((t) => (
                    <span
                      key={t.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {t.name.split(":")[0] || t.name} ({t.completionPercentage}%)
                    </span>
                  ))}
                  {localAnalytics.paper2Topics.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                      +{localAnalytics.paper2Topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. KNOWLEDGE MASTERY & DIVERGENCE ANALYSIS */}
        {(activeDimension === "all" || activeDimension === "mastery") && (
          <div className="p-4 rounded-xl bg-[#141223] border border-purple-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Dimension 2: Knowledge Mastery & Divergence</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    localAnalytics.divergenceStatus === "gap"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {localAnalytics.divergenceLabel}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Separating passive reading from active retention
              </span>
            </div>

            {/* Dual Concentric Circular Gauge: Syllabus Coverage vs Tested Knowledge Mastery */}
            <div className="p-3.5 rounded-xl mb-3.5 bg-[#181329] border border-purple-900/40">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <DualConcentricComparison
                  outerValue={localAnalytics.overallCompletion}
                  innerValue={localAnalytics.overallMastery}
                  outerLabel="Syllabus Coverage (Read)"
                  innerLabel="Tested Mastery (Recall)"
                  size={104}
                  className="w-full md:w-auto"
                />
                <div className="md:border-l md:border-purple-900/40 md:pl-4 text-xs space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                      Active Retention Divergence
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        localAnalytics.divergence >= 15
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {localAnalytics.divergence > 0 ? `-${localAnalytics.divergence}% Gap` : "Fully Aligned"}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {localAnalytics.divergenceStatus === "gap"
                      ? "A significant divergence exists between what you have read and what you actively retain under timed testing. Prioritize targeted MCQ drills and mains answer-writing to bridge this gap."
                      : "Your syllabus coverage and diagnostic recall are tightly harmonized, indicating resilient retention without the illusion of competence."}
                  </p>
                </div>
              </div>
            </div>

            {/* Divergence warning or reassurance box */}
            <div
              className={`p-3 rounded-xl mb-3.5 border flex items-start space-x-3 ${
                localAnalytics.divergenceStatus === "gap"
                  ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                  : "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
              }`}
            >
              {localAnalytics.divergenceStatus === "gap" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-semibold">{localAnalytics.divergenceDesc}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  UPSC Mandate: Merely completing pages produces an illusion of competence. Focus drills on high-divergence units.
                </p>
              </div>
            </div>

            {/* Weak Areas vs Strong Areas Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Weak Topics */}
              <div className="p-3 rounded-xl bg-[#1b1524] border border-red-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Priority Weak Units</span>
                  </span>
                  <span className="text-[10px] text-red-400 font-semibold">
                    {localAnalytics.weakTopics.length} Need Revision
                  </span>
                </div>
                <div className="space-y-1.5">
                  {localAnalytics.weakTopics.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-[#24172c] border border-red-900/30 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-200 truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400">Score: {t.knowledgeScore}%</p>
                      </div>
                      <button
                        onClick={() => onAskBoltTopic(t.name)}
                        className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-[10px] whitespace-nowrap transition-colors"
                      >
                        Ask Bolt
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strong Topics */}
              <div className="p-3 rounded-xl bg-[#111f1f] border border-emerald-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High Mastery Grounding</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {localAnalytics.strongTopics.length} Mastered
                  </span>
                </div>
                <div className="space-y-1.5">
                  {localAnalytics.strongTopics.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-[#142624] border border-emerald-900/30 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-200 truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400">MCQ Acc: {t.mcqAccuracy}%</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">✓ Grounded</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRELIMS & MAINS PERFORMANCE */}
        {(activeDimension === "all" || activeDimension === "performance") && (
          <div className="p-4 rounded-xl bg-[#111b22] border border-emerald-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Dimension 3: Prelims & Mains Performance</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Dual Exam Calibration
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("prelims")}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Prelims Drill →
                </button>
                <button
                  onClick={() => onNavigate("mains")}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Mains Grader →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Prelims Track */}
              <div className="p-3.5 rounded-xl bg-[#152329] border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200">Prelims MCQ Precision</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {user.questionsAttempted > 0 ? `${user.overallAccuracy}% Accuracy` : "Insufficient Data"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {user.questionsAttempted} questions completed • 1/3rd negative marking calibrated
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Elimination Accuracy:</span>
                  <span className="text-emerald-400 font-semibold">
                    {user.questionsAttempted >= 20 ? "UPSC Competitive" : "Calibrating (need 20+)"}
                  </span>
                </div>
              </div>

              {/* Mains Track */}
              <div className="p-3.5 rounded-xl bg-[#152329] border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200">Mains 7-Dimension Evaluation</span>
                  <span className="text-xs font-bold text-blue-400">
                    {localAnalytics.avgMainsScore ? `Avg ${localAnalytics.avgMainsScore} / 15` : "0 Evaluated"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {user.mainsEvaluatedCount} answers graded • Scored against UPSC rubric standards
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Thinker & 2nd ARC Density:</span>
                  <span className="text-blue-400 font-semibold">
                    {user.mainsEvaluatedCount > 0 ? "Targeting 2+ citations" : "Submit 1st answer"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. STUDY CONSISTENCY & SPACED RETENTION */}
        {(activeDimension === "all" || activeDimension === "consistency") && (
          <div className="p-4 rounded-xl bg-[#1a141b] border border-orange-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Dimension 4: Study Consistency & Spaced Retention</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                  Ebbinghaus Decay Protection
                </span>
              </div>
              <button
                onClick={() => onNavigate("planner")}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
              >
                <span>View Study Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Daily Streak */}
              <div className="p-3 rounded-xl bg-[#231722] border border-orange-900/30 flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active Streak</p>
                  <p className="text-base font-bold text-white">{user.studyStreakDays} Days</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Daily goal unbroken</p>
                </div>
              </div>

              {/* Total Hours */}
              <div className="p-3 rounded-xl bg-[#231722] border border-orange-900/30 flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Study Time</p>
                  <p className="text-base font-bold text-white">{user.totalStudyHours} Hours</p>
                  <p className="text-[10px] text-slate-400">Target: 3.5 hrs/day</p>
                </div>
              </div>

              {/* Spaced Revision Queue */}
              <div className="p-3 rounded-xl bg-[#231722] border border-orange-900/30 flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Revision Queue</p>
                  <p className="text-base font-bold text-amber-400">
                    {localAnalytics.weakTopics.length} Units Due
                  </p>
                  <p className="text-[10px] text-amber-300 font-medium">Spaced recall window</p>
                </div>
              </div>
            </div>

            {/* 30-Day Study Consistency Heatmap & Bar Chart Component */}
            <StudyConsistencyHeatmap
              user={user}
              studySessions={studySessions}
              onExplorePlanner={() => onNavigate("planner")}
              className="mt-4"
            />
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            Candidate profile calibrated for <strong className="text-slate-200">{user.target}</strong> with{" "}
            <strong className="text-blue-400">{user.optionalSubject}</strong>.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate("knowledgeGraph")}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curriculum Knowledge Graph</span>
          </button>
          <button
            onClick={() => onNavigate("bolt")}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Consult Bolt on Weakness</span>
          </button>
        </div>
      </div>
    </div>
  );
};
