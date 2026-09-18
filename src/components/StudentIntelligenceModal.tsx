import React, { useState, useEffect } from "react";
import {
  Brain,
  Network,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Zap,
  Activity,
  Award,
} from "lucide-react";
import { UserProfile, SyllabusTopic } from "../types";

export interface UnifiedStudentIntelligenceReport {
  studentSummary: {
    userId: string;
    userName: string;
    targetExam: string;
    optionalSubject: string;
    studyStreakDays: number;
  };
  syllabusCoverage: {
    overallCompletionPercent: number;
    paper1CompletionPercent: number;
    paper2CompletionPercent: number;
    unitsCompletedCount: number;
    unitsTotalCount: number;
  };
  knowledgeMastery: {
    overallMasteryScore: number;
    masteryLevel: "Beginner" | "Intermediate" | "Advanced" | "Mains-Ready";
    knowledgeRetentionFactor: number;
    diagnosticConfidenceScore: number;
    insight: string;
  };
  divergenceAnalysis: {
    gap: number;
    status: "healthy_alignment" | "illusion_of_competence" | "deep_mastery";
    diagnosticMessage: string;
  };
  topicGraph: {
    nodes: Array<{
      id: string;
      title: string;
      paper: "Paper 1" | "Paper 2";
      masteryScore: number;
      completionPercent: number;
      prerequisites: string[];
      mainsLinkages: string[];
      status: "critical_weakness" | "needs_consolidation" | "proficient" | "mastered";
      recommendedMCQDifficulty: "foundation" | "moderate" | "advanced";
    }>;
  };
  mainsLearningLoop: {
    evaluationsAnalyzed: number;
    averageMainsScore: number;
    dimensionPerformance: {
      questionDemand: number;
      contentClarity: number;
      structure: number;
      thinkersAndArc: number;
      indianExamples: number;
      wayForward: number;
    };
    weakestDimension: string;
    strongestDimension: string;
    prescribedFix: string;
  };
  adaptiveLearningPlan: Array<{
    topicId: string;
    topicName: string;
    action: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM";
    recommendedDifficulty: string;
    rationale: string;
  }>;
}

interface StudentIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  topics: SyllabusTopic[];
  onAskBoltTopic?: (topic: string) => void;
  onPracticeTopic?: (topicId: string) => void;
}

export const StudentIntelligenceModal: React.FC<StudentIntelligenceModalProps> = ({
  isOpen,
  onClose,
  user,
  topics,
  onAskBoltTopic = (_topic: string) => {},
  onPracticeTopic = (_topicId: string) => {},
}) => {
  const [report, setReport] = useState<UnifiedStudentIntelligenceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "graph" | "mains_loop" | "adaptive_queue">("overview");
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);

  const fetchIntelligence = async () => {
    setLoading(true);
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
      console.error("Failed to load student intelligence report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIntelligence();
    }
  }, [isOpen, user, topics]);

  if (!isOpen) return null;

  const selectedNodeData = report?.topicGraph.nodes.find((n) => n.id === selectedGraphNode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        id="student-intelligence-modal"
        className="relative w-full max-w-5xl bg-[#0d131f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#121c2d] to-[#0d131f]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Student Intelligence Engine
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 uppercase tracking-wider">
                  Real-time Diagnostic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deep cognitive tracking: Syllabus Completion ≠ Knowledge Mastery
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchIntelligence}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center space-x-1 px-5 border-b border-slate-800 bg-[#0f1724] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeSubTab === "overview"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery vs. Coverage</span>
          </button>

          <button
            onClick={() => setActiveSubTab("graph")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeSubTab === "graph"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Topic Dependency Graph</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              Graph
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("mains_loop")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeSubTab === "mains_loop"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mains Learning Loop</span>
          </button>

          <button
            onClick={() => setActiveSubTab("adaptive_queue")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeSubTab === "adaptive_queue"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Adaptive Study Plan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              Actionable
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300 scrollbar-thin">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-semibold text-white">Running Student Intelligence Diagnostic...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Analyzing knowledge graph topology, prerequisite health, Mains rubric dimensions, and memory retention factors.
              </p>
            </div>
          ) : !report ? (
            <div className="py-16 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p>Could not load intelligence analytics. Please try again.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MASTERY VS COVERAGE */}
              {activeSubTab === "overview" && (
                <div className="space-y-6">
                  {/* Divergence Alert Box */}
                  <div
                    className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                      report.divergenceAnalysis.status === "illusion_of_competence"
                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                        : "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">
                          Cognitive Diagnostic: {report.divergenceAnalysis.status === "illusion_of_competence" ? "Coverage Exceeds Deep Mastery" : "Healthy Cognitive Alignment"}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                          Gap: {report.divergenceAnalysis.gap}%
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {report.divergenceAnalysis.diagnosticMessage}
                      </p>
                    </div>
                  </div>

                  {/* High Level 2-Column Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Syllabus Coverage Card */}
                    <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <h4 className="font-bold text-white text-sm">Syllabus Coverage</h4>
                        </div>
                        <span className="text-xl font-bold text-blue-400 font-['Outfit']">
                          {report.syllabusCoverage.overallCompletionPercent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Superficial material read, video lectures watched, or topics completed on paper.
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Paper 1 (Theoretical Foundations)</span>
                          <span className="text-slate-200 font-bold">{report.syllabusCoverage.paper1CompletionPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${report.syllabusCoverage.paper1CompletionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Paper 2 (Indian Administration)</span>
                          <span className="text-slate-200 font-bold">{report.syllabusCoverage.paper2CompletionPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${report.syllabusCoverage.paper2CompletionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex justify-between">
                        <span>Units Checked Off:</span>
                        <span className="font-semibold text-white">
                          {report.syllabusCoverage.unitsCompletedCount} / {report.syllabusCoverage.unitsTotalCount} Units
                        </span>
                      </div>
                    </div>

                    {/* Knowledge Mastery Card */}
                    <div className="p-4 rounded-xl bg-[#141b2a] border border-purple-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <h4 className="font-bold text-white text-sm">Knowledge Mastery Score</h4>
                        </div>
                        <span className="text-xl font-bold text-purple-400 font-['Outfit']">
                          {report.knowledgeMastery.overallMasteryScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Evaluated via MCQ accuracy, Mains evaluation depth, retrieval retention, and thinker linkage.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Mastery Tier</span>
                          <span className="text-xs font-bold text-purple-300">
                            {report.knowledgeMastery.masteryLevel}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Retention Factor</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {Math.round(report.knowledgeMastery.knowledgeRetentionFactor * 100)}% Memory
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/40">
                        💡 <span className="font-semibold">Engine Insight:</span> {report.knowledgeMastery.insight}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TOPIC DEPENDENCY GRAPH */}
              {activeSubTab === "graph" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Public Administration Canonical Topic Graph</h4>
                      <p className="text-[11px] text-slate-400">
                        Click on any node to view its prerequisite health, cross-paper linkages, and diagnostic score.
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {report.topicGraph.nodes.length} Key Curriculum Nodes
                    </span>
                  </div>

                  {/* Grid of Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {report.topicGraph.nodes.map((node) => {
                      const isSelected = selectedGraphNode === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedGraphNode(node.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/50"
                              : "bg-[#141b2a] border-slate-800 hover:border-slate-700 hover:bg-[#182133]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-white text-xs">{node.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                node.status === "critical_weakness"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : node.status === "needs_consolidation"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {node.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Mastery:</span>
                            <span className="font-bold text-purple-300">{node.masteryScore}%</span>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Coverage:</span>
                            <span className="font-bold text-blue-300">{node.completionPercent}%</span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{node.paper}</span>
                            <span className="text-amber-400 font-mono">MCQ: {node.recommendedMCQDifficulty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Node Details Drawer */}
                  {selectedNodeData && (
                    <div className="p-4 rounded-xl bg-[#162033] border border-blue-500/40 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            Selected Node Inspection
                          </span>
                          <h5 className="font-bold text-white text-sm">{selectedNodeData.title}</h5>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onAskBoltTopic(selectedNodeData.title)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Ask Bolt</span>
                          </button>
                          <button
                            onClick={() => onPracticeTopic(selectedNodeData.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                          >
                            <Target className="w-3 h-3" />
                            <span>Practice MCQs</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            Prerequisites in Knowledge Graph
                          </span>
                          {selectedNodeData.prerequisites.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {selectedNodeData.prerequisites.map((p) => (
                                <li key={p}>{p}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 italic">Foundational Node (No prerequisites)</span>
                          )}
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            Paper 1 ↔ Paper 2 Mains Linkages
                          </span>
                          {selectedNodeData.mainsLinkages.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {selectedNodeData.mainsLinkages.map((m) => (
                                <li key={m}>{m}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 italic">Core Theoretical Node</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MAINS LEARNING LOOP */}
              {activeSubTab === "mains_loop" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Mains Answer Loop Diagnostics</h4>
                      <p className="text-[11px] text-slate-400">
                        7-Dimension UPSC Civil Services Rubric breakdown across {report.mainsLearningLoop.evaluationsAnalyzed} evaluated answers.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30">
                      Average: {report.mainsLearningLoop.averageMainsScore} / 15 Marks
                    </span>
                  </div>

                  {/* 7 Dimensions Bar Breakdown */}
                  <div className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 space-y-3">
                    <h5 className="font-bold text-white text-xs">UPSC Rubric Performance (Out of 10)</h5>

                    {Object.entries(report.mainsLearningLoop.dimensionPerformance).map(([key, scoreVal]) => {
                      const score = Number(scoreVal);
                      const labelMap: Record<string, string> = {
                        questionDemand: "Question Demand & Directive Fulfillment",
                        contentClarity: "Content & Conceptual Clarity",
                        structure: "Introduction, Headings & Visionary Conclusion",
                        thinkersAndArc: "Thinkers, 2nd ARC & Committee Citations",
                        indianExamples: "Indian Empirical Examples & Case Studies",
                        wayForward: "Pragmatic & Constitutional Way Forward",
                      };
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">{labelMap[key] || key}</span>
                            <span className="font-bold text-white">{score} / 10</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 7
                                  ? "bg-emerald-500"
                                  : score >= 5
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weakest vs Strongest Diagnosis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1.5">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        Primary Bottleneck
                      </span>
                      <h5 className="font-bold text-white text-sm">{report.mainsLearningLoop.weakestDimension}</h5>
                      <p className="text-xs text-red-200/90 leading-relaxed">
                        {report.mainsLearningLoop.prescribedFix}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Strongest Dimension
                      </span>
                      <h5 className="font-bold text-white text-sm">{report.mainsLearningLoop.strongestDimension}</h5>
                      <p className="text-xs text-emerald-200/90 leading-relaxed">
                        Maintain this benchmark standard while cross-applying thinker citations and case studies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADAPTIVE LEARNING PLAN */}
              {activeSubTab === "adaptive_queue" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Personalized Adaptive Study Queue</h4>
                      <p className="text-[11px] text-slate-400">
                        Prioritized curriculum items generated strictly to remediate diagnostic weaknesses.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {report.adaptiveLearningPlan.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#141b2a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                item.priority === "CRITICAL"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : item.priority === "HIGH"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {item.priority}
                            </span>
                            <h5 className="font-bold text-white text-sm">{item.topicName}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.recommendedDifficulty})
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{item.action}</p>
                          <p className="text-[11px] text-slate-500 italic">
                            Rationale: {item.rationale}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                          <button
                            onClick={() => onAskBoltTopic(item.topicName)}
                            className="px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center space-x-1 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ask Bolt</span>
                          </button>
                          <button
                            onClick={() => onPracticeTopic(item.topicId)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <Target className="w-3.5 h-3.5" />
                            <span>Practice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c121d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BOLT Unified Student Intelligence Engine active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
