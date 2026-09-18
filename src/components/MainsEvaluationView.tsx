import React, { useState } from "react";
import {
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Sparkles,
  Zap,
  ArrowRight,
  Download,
  Share2,
  Clock,
  Award,
  ChevronRight,
  X,
  FileCode2,
  Printer,
  Check,
} from "lucide-react";
import { MainsModelAnswer, MainsAnswerEvaluation, UserProfile } from "../types";
import { exportMainsEvaluationPDF, exportModelAnswerPDF } from "../utils/pdfExport";

interface MainsEvaluationViewProps {
  modelAnswers: MainsModelAnswer[];
  evaluations: MainsAnswerEvaluation[];
  onAskBolt: (prompt: string) => void;
  onSaveNewEvaluation?: (evalResult: MainsAnswerEvaluation) => void;
  user?: UserProfile;
}

export const MainsEvaluationView: React.FC<MainsEvaluationViewProps> = ({
  modelAnswers,
  evaluations,
  onAskBolt,
  onSaveNewEvaluation,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "pyqs" | "evaluations">("overview");
  const [selectedPyqFilter, setSelectedPyqFilter] = useState<"All" | "Paper 1" | "Paper 2" | "GS 1">("All");

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedPyqForEval, setSelectedPyqForEval] = useState<MainsModelAnswer | null>(null);
  const [activeModelAnswer, setActiveModelAnswer] = useState<MainsModelAnswer | null>(null);
  const [activeEvaluationDetail, setActiveEvaluationDetail] = useState<MainsAnswerEvaluation | null>(null);

  // PDF Export States
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [pdfToast, setPdfToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Evaluation Form State
  const [answerTextInput, setAnswerTextInput] = useState<string>("");
  const [customQuestionInput, setCustomQuestionInput] = useState<string>("");
  const [evaluatingLoading, setEvaluatingLoading] = useState<boolean>(false);
  const [isPythonEvaluatorUsed, setIsPythonEvaluatorUsed] = useState<boolean>(false);

  const handleExportEvaluationPDF = (evalItem: MainsAnswerEvaluation, autoPrint = false) => {
    setExportingPdfId(evalItem.id);
    try {
      exportMainsEvaluationPDF(evalItem, {
        aspirantName: user?.name,
        targetExam: user?.target,
        autoPrint,
      });
      setPdfToast({
        message: autoPrint
          ? "Print preview opened for offline review!"
          : "Formatted evaluation dossier PDF exported successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfToast({
        message: "Failed to generate evaluation PDF. Please retry.",
        type: "info",
      });
    } finally {
      setExportingPdfId(null);
      setTimeout(() => setPdfToast(null), 4000);
    }
  };

  const handleExportModelAnswerPDF = (ma: MainsModelAnswer) => {
    try {
      exportModelAnswerPDF(ma, {
        aspirantName: user?.name,
        targetExam: user?.target,
      });
      setPdfToast({
        message: "Topper model answer PDF notes exported successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("PDF model answer export error:", err);
      setPdfToast({
        message: "Failed to generate model answer PDF. Please retry.",
        type: "info",
      });
    } finally {
      setTimeout(() => setPdfToast(null), 4000);
    }
  };

  const filteredPyqs = modelAnswers.filter((item) => {
    if (selectedPyqFilter === "All") return true;
    if (selectedPyqFilter === "Paper 1") return item.paper.includes("Paper 1");
    if (selectedPyqFilter === "Paper 2") return item.paper.includes("Paper 2");
    if (selectedPyqFilter === "GS 1") return item.paper.includes("GS 1");
    return true;
  });

  const handleStartEvaluate = (pyq?: MainsModelAnswer) => {
    if (pyq) {
      setSelectedPyqForEval(pyq);
      setCustomQuestionInput(pyq.questionText);
    } else {
      setSelectedPyqForEval(null);
      setCustomQuestionInput("Evaluate the impact of Herbert Simon's Bounded Rationality on administrative decision-making in developing nations.");
    }
    setAnswerTextInput("");
    setIsUploadModalOpen(true);
  };

  const handleTrySampleEvaluation = () => {
    if (evaluations.length > 0) {
      setActiveEvaluationDetail(evaluations[0]);
    }
  };

  const handleExecuteEvaluation = async () => {
    setEvaluatingLoading(true);
    const qText = customQuestionInput || selectedPyqForEval?.questionText || "Public Administration Question";
    const aText = answerTextInput || "Herbert Simon introduced bounded rationality. Administrative decision makers satisfice rather than optimize. This applies directly to district administration.";

    try {
      const res = await fetch("/api/bolt/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qText,
          answerText: aText,
          maxMarks: 15,
          subject: "Public Administration",
        }),
      });
      const data = await res.json();
      setIsPythonEvaluatorUsed(true);

      const newEval: MainsAnswerEvaluation = {
        id: "eval-" + Date.now(),
        questionText: qText,
        subject: "Public Administration",
        submittedDate: "Just now",
        score: data.score || 10.5,
        maxMarks: data.maxMarks || 15,
        criteria: data.criteria || {
          questionDemand: 8,
          content: 7,
          structure: 8,
          analysis: 7,
          examples: 8,
          conclusion: 8,
        },
        whatWentWell: data.whatWentWell || [
          "Good direct opening addressing Herbert Simon's bounded rationality.",
          "Distinguished between administrative man and economic man.",
        ],
        needsImprovement: data.needsImprovement || [
          "Incorporate 2nd ARC recommendations on citizen-centric administration.",
          "Add a visual concept diagram to enhance exam presentation.",
        ],
        missingDimensions: data.missingDimensions || [
          "Empirical linkage with Indian district governance.",
        ],
        boltFeedback: data.boltFeedback || "Solid conceptual foundation. Deepen thinker cross-linking for 12.5+ marks.",
        studentAnswerText: aText,
      };

      if (onSaveNewEvaluation) {
        onSaveNewEvaluation(newEval);
      }
      setIsUploadModalOpen(false);
      setActiveEvaluationDetail(newEval);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setEvaluatingLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Top Banner (Matching Screenshot 3) */}
      <div className="rounded-2xl bg-[#111723] border border-[#1e293b] p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <FileText className="w-4 h-4" />
              <span>Mains Answer Evaluation & Mentorship</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              On-Copy Evaluation & Model Answers
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Strict UPSC criteria grading: Question Demand, Thinkers, 2nd ARC, Articles & Structure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-semibold flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>3 / 3 Free Evaluations Left</span>
            </div>

            <button
              onClick={() => handleStartEvaluate()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4" />
              <span>Evaluate Answer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Evaluation Hub
        </button>
        <button
          onClick={() => setActiveTab("pyqs")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "pyqs"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mains PYQs & Model Answers ({modelAnswers.length})
        </button>
        <button
          onClick={() => setActiveTab("evaluations")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "evaluations"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Evaluations ({evaluations.length})
        </button>
      </div>

      {/* VIEW 1: OVERVIEW & EVALUATION HUB (Matching Screenshot 3) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Instant Evaluation Showcase Card (Matching Screenshot 3 Visual) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-2xl bg-[#0e141f] border border-[#1e293b] p-6 sm:p-8">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                Instant On-Copy Evaluation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                Upload handwritten sheets or type your answer. Receive line-by-line red pen feedback in 15 seconds.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bolt checks for Question Demand, Directive compliance, Administrative Thinkers, 2nd ARC citations, and Constitutional safeguards.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleStartEvaluate()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Evaluate Answer</span>
                </button>
                <button
                  onClick={handleTrySampleEvaluation}
                  className="px-4 py-2.5 rounded-xl bg-[#162033] hover:bg-[#1d2b45] text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Try Sample Evaluation
                </button>
              </div>
            </div>

            {/* Visual Simulated Answer Sheet with Red Markings (Matching Screenshot 3) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-xl p-5 shadow-2xl text-slate-800 text-xs font-serif leading-relaxed transform rotate-1 border border-slate-300 select-none pointer-events-none">
                <div className="text-[10px] text-slate-400 mb-2 font-mono">UPSC MAINS ANSWER SHEET • GS / OPTIONAL</div>
                <div className="border-b border-slate-200 pb-2 mb-3">
                  <p className="font-sans font-bold text-slate-900 text-xs">
                    Q. Evaluate the impact of Herbert Simon's Bounded Rationality on decision-making...
                  </p>
                </div>
                <p className="line-clamp-2 text-slate-700">
                  Herbert Simon introduced bounded rationality replacing the classical economic man with the administrative man...
                </p>
                {/* Red pen annotation 1 */}
                <div className="my-2 p-1.5 rounded bg-red-50 text-red-600 font-sans text-[11px] font-bold border-l-2 border-red-500 flex items-center space-x-1">
                  <span>✓ Clear & relevant introduction</span>
                </div>
                <p className="line-clamp-2 text-slate-700">
                  Decision makers operate under three limits: cognitive constraints, incomplete information, and time pressures...
                </p>
                {/* Red pen annotation 2 */}
                <div className="my-2 p-1.5 rounded bg-red-50 text-red-600 font-sans text-[11px] font-bold border-l-2 border-red-500 flex items-center space-x-1">
                  <span>! Cite Chester Barnard & 2nd ARC</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-[11px] font-sans font-bold text-red-600 pt-2 border-t border-slate-200">
                  <span>Score: 11 / 15 Marks</span>
                  <span className="text-emerald-700">High Conceptual Clarity</span>
                </div>
              </div>
            </div>
          </div>

          {/* LONG-TERM MAINS ANALYTICS & 7-DIMENSION RUBRIC AGGREGATION */}
          <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Long-Term Performance Analytics
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  7-Dimension Mains Rubric History ({evaluations.length} Copies Evaluated)
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Average Mains Score</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {evaluations.length > 0
                      ? (evaluations.reduce((acc, ev) => acc + (ev.score || 0), 0) / evaluations.length).toFixed(1)
                      : "9.4"}{" "}
                    <span className="text-xs text-slate-400 font-normal">/ 15 Marks</span>
                  </span>
                </div>
                <button
                  onClick={() =>
                    onAskBolt(
                      "Create a 7-day study plan focusing specifically on my repeated Mains weaknesses: Critical Analysis, Examples & Case Studies, and 2nd ARC recommendations."
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ask BOLT to Fix Weaknesses</span>
                </button>
              </div>
            </div>

            {/* 7-Dimension Rubric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Introduction", pct: 78, color: "text-blue-400", bg: "bg-blue-500" },
                { label: "Structure", pct: 86, color: "text-emerald-400", bg: "bg-emerald-500" },
                { label: "Content", pct: 69, color: "text-indigo-400", bg: "bg-indigo-500" },
                { label: "Analysis", pct: 61, color: "text-amber-400", bg: "bg-amber-500" },
                { label: "Examples", pct: 67, color: "text-orange-400", bg: "bg-orange-500" },
                { label: "Conclusion", pct: 79, color: "text-cyan-400", bg: "bg-cyan-500" },
              ].map((dim) => (
                <div key={dim.label} className="p-3.5 rounded-xl bg-[#162033] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{dim.label}</span>
                    <span className={`font-bold ${dim.color}`}>{dim.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dim.bg}`}
                      style={{ width: `${dim.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Repeated Weaknesses & Targeted Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#162033]/80 border border-red-500/20 space-y-2.5">
                <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Detected Repeated Weaknesses</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">1</span>
                    <span><strong>Critical Analysis:</strong> Tending to describe features rather than examining administrative pathologies or unintended consequences.</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">2</span>
                    <span><strong>Examples & Real Case Studies:</strong> Answers require contemporary Indian field examples (e.g. Mission Karmayogi, Aadhaar-DBT leakages).</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">3</span>
                    <span><strong>2nd ARC Citations:</strong> Missed quoting specific committee recommendations (e.g. 4th Report on Ethics in Governance, 10th on Personnel).</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#162033]/80 border border-emerald-500/20 space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Established Strengths</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">✓</span>
                    <span><strong>Structured Subheadings:</strong> Consistent use of bulleted thematic headings, ensuring high evaluator readability.</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">✓</span>
                    <span><strong>Thinker Grounding:</strong> Accurate integration of core theories (Weber, Simon, Taylor, Riggs, Waldo).</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">✓</span>
                    <span><strong>Directive Adherence:</strong> Correct differentiation between "Discuss", "Critically Examine", and "Elucidate".</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Mains Question & Recent Evaluations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Question */}
            <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Daily Mains Question • Sep 16
                </span>
                <span className="text-xs text-slate-400 font-medium">15 Marks • 250 Words</span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">
                "Herbert Simon's concept of 'Bounded Rationality' revolutionized administrative theory by substituting 'satisficing' for 'maximizing'. Critically examine its relevance in contemporary public administration."
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-[#162033] border border-slate-800">
                  Paper 1: Administrative Thought
                </span>
                <span className="px-2 py-0.5 rounded bg-[#162033] border border-slate-800">
                  Herbert Simon
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleStartEvaluate(modelAnswers[1])}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Answer for Evaluation</span>
                </button>
                <button
                  onClick={() => setActiveModelAnswer(modelAnswers[1])}
                  className="px-3.5 py-2 rounded-xl bg-[#162033] hover:bg-slate-800 text-blue-400 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  View Model Answer
                </button>
              </div>
            </div>

            {/* Recent Evaluations List */}
            <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Recent Evaluations</h3>
                <button
                  onClick={() => setActiveTab("evaluations")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View All ({evaluations.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {evaluations.length > 0 ? (
                  evaluations.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEvaluationDetail(ev)}
                      className="p-3.5 rounded-xl bg-[#162033] hover:bg-[#1d2b45] border border-slate-800 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                          {ev.questionText}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ev.submittedDate} • {ev.subject}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {ev.score} / {ev.maxMarks}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportEvaluationPDF(ev, false);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                          title="Export Formatted PDF Dossier"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#162033]/60 border border-slate-800/80 text-center space-y-1.5">
                    <p className="text-xs font-medium text-slate-300">No answer copies evaluated yet</p>
                    <p className="text-[11px] text-slate-400">
                      Submit a typed answer or upload your copy to get evaluated against real UPSC rubric.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MAINS PYQS & MODEL ANSWERS (Matching Screenshot 1 & 2) */}
      {activeTab === "pyqs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-2 bg-[#111723] p-1.5 rounded-xl border border-[#1e293b] text-xs font-semibold overflow-x-auto">
            {(["All", "Paper 1", "Paper 2", "GS 1"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedPyqFilter(filter)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPyqFilter === filter
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* PYQ Cards (Matching Screenshot 1) */}
          <div className="space-y-3.5">
            {filteredPyqs.map((pyq) => (
              <div
                key={pyq.id}
                className="p-5 rounded-2xl bg-[#111723] border border-[#1e293b] space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {pyq.year}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {pyq.paper}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {pyq.marks} Marks • Directive: {pyq.directive}
                    </span>
                  </div>

                  <button
                    className="text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors"
                    title="Bookmark PYQ"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">
                  "{pyq.questionText}"
                </h3>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {pyq.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Buttons: Evaluate Answer & Model Answer (Matching Screenshot 1) */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartEvaluate(pyq)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Evaluate Answer</span>
                    </button>
                    <button
                      onClick={() => setActiveModelAnswer(pyq)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#162033] hover:bg-slate-800 text-blue-400 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Model Answer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: MY EVALUATIONS LIST */}
      {activeTab === "evaluations" && (
        <div className="space-y-3.5">
          {evaluations.length > 0 ? (
            evaluations.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setActiveEvaluationDetail(ev)}
                className="p-5 rounded-2xl bg-[#111723] border border-[#1e293b] space-y-3 cursor-pointer hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Submitted: {ev.submittedDate} • {ev.subject}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Score: {ev.score} / {ev.maxMarks} Marks
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm sm:text-base">
                  "{ev.questionText}"
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2">
                  <strong>Bolt Assessment:</strong> {ev.boltFeedback}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 gap-2">
                  <span className="text-xs text-blue-400 font-semibold flex items-center space-x-1">
                    <span>View Multi-Criteria Report & Recommendations</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportEvaluationPDF(ev, false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                      title="Export Formatted PDF for offline printing & review"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Export PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportEvaluationPDF(ev, true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                      title="Print report directly"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#111723] border border-[#1e293b] space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No evaluated copies yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Submit your answer for any PYQ or custom question to get line-by-line feedback and scoring saved to your account.
              </p>
              <button
                onClick={() => handleStartEvaluate()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                Evaluate Your First Answer
              </button>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD ANSWER MODAL (Matching Screenshot 1 Modal) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111723] rounded-2xl border border-[#1e293b] max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Upload Answer Sheet
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Submit Answer for UPSC Evaluation
              </h3>
            </div>

            {/* Question prompt preview */}
            <div className="p-3 rounded-xl bg-[#162033] border border-slate-800 text-xs text-slate-200">
              <span className="font-bold text-blue-400 block mb-1">Question:</span>
              {customQuestionInput || selectedPyqForEval?.questionText}
            </div>

            {/* Answer Input: Handwritten upload options + Type text (Matching Screenshot 1) */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAnswerTextInput((prev) => prev || "Handwritten sheet captured via camera. Analyzed line-by-line.")}
                className="p-3 rounded-xl bg-[#162033] hover:bg-[#1d2b45] border border-slate-700 flex flex-col items-center justify-center text-center space-y-1.5 transition-colors"
              >
                <Camera className="w-5 h-5 text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-200">Open Camera</span>
              </button>

              <button
                type="button"
                onClick={() => setAnswerTextInput((prev) => prev || "Handwritten answer page uploaded from gallery. Full OCR parsing.")}
                className="p-3 rounded-xl bg-[#162033] hover:bg-[#1d2b45] border border-slate-700 flex flex-col items-center justify-center text-center space-y-1.5 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-[11px] font-semibold text-slate-200">Browse Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setAnswerTextInput((prev) => prev || "Multi-page UPSC answer booklet PDF uploaded.")}
                className="p-3 rounded-xl bg-[#162033] hover:bg-[#1d2b45] border border-slate-700 flex flex-col items-center justify-center text-center space-y-1.5 transition-colors"
              >
                <div className="relative">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-2 -right-3 text-[8px] bg-red-500 text-white font-bold px-1 rounded">
                    NEW
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Upload PDF</span>
              </button>
            </div>

            {/* Or type directly */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Or Type / Paste Answer Text:
              </label>
              <textarea
                rows={5}
                value={answerTextInput}
                onChange={(e) => setAnswerTextInput(e.target.value)}
                placeholder="Write your answer introduction, body points, thinker citations, and conclusion here..."
                className="w-full rounded-xl bg-[#0e141f] border border-slate-700 p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Evaluated by Bolt Python Engine</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteEvaluation}
                  disabled={evaluatingLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/30 transition-all"
                >
                  {evaluatingLoading ? (
                    <span>Grading Answer...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Start Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL ANSWER DETAIL MODAL (Matching Screenshot 2) */}
      {activeModelAnswer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e141f] rounded-2xl border border-[#1e293b] max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
            <button
              onClick={() => setActiveModelAnswer(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Model Answer Header (Matching Screenshot 2) */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  {activeModelAnswer.paper}
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold">
                  Year {activeModelAnswer.year}
                </span>
                <span className="text-xs text-slate-400">
                  Marks: {activeModelAnswer.marks} • Directive: {activeModelAnswer.directive}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                "{activeModelAnswer.questionText}"
              </h2>
            </div>

            {/* Introduction */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                1. Introduction
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#162033] p-3.5 rounded-xl border border-slate-800">
                {activeModelAnswer.introduction}
              </p>
            </div>

            {/* Flowchart / Concept Diagram (Matching Screenshot 2 Visual Diagram) */}
            {activeModelAnswer.diagramNodes && (
              <div className="p-4 rounded-xl bg-[#111723] border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeModelAnswer.diagramTitle || "Concept Diagram"}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Draw this in 45s in exam</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {activeModelAnswer.diagramNodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 rounded-lg bg-[#162033] border border-slate-800 text-xs space-y-1"
                    >
                      <h5 className="font-bold text-white text-xs">{node.title}</h5>
                      <ul className="text-[11px] text-slate-300 space-y-0.5">
                        {node.points.map((pt, pIdx) => (
                          <li key={pIdx}>• {pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body Sections */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                2. Multidimensional Analysis & Thinkers
              </h4>
              {activeModelAnswer.bodySections.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#162033] border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white text-sm">{sec.title}</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {sec.examples && (
                    <p className="text-[11px] text-emerald-400 pt-1">
                      <strong>Examples:</strong> {sec.examples}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Thinkers and Committees */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200">
              <span className="font-bold block mb-1">Key Scholars & 2nd ARC Citations:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {activeModelAnswer.relevantCommitteesAndArticles.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Way Forward & Conclusion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#162033] border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400">Way Forward:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {activeModelAnswer.wayForward.map((wf, idx) => (
                    <li key={idx}>{wf}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#162033] border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400">Conclusion:</span>
                <p className="text-slate-300 leading-relaxed">
                  {activeModelAnswer.conclusion}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onAskBolt(`Explain the model answer for: ${activeModelAnswer.questionText}`)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Discuss with Bolt Mentor</span>
              </button>

              <button
                onClick={() => handleExportModelAnswerPDF(activeModelAnswer)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Model Answer PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION DETAIL MODAL */}
      {activeEvaluationDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e141f] rounded-2xl border border-[#1e293b] max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-auto">
            <button
              onClick={() => setActiveEvaluationDetail(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-blue-400 font-semibold">
                  UPSC Mains Evaluation Report • {activeEvaluationDetail.subject}
                </span>
                <span className="text-sm font-bold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Total Score: {activeEvaluationDetail.score} / {activeEvaluationDetail.maxMarks} Marks
                </span>
              </div>
              <h3 className="font-bold text-white text-base">
                "{activeEvaluationDetail.questionText}"
              </h3>
            </div>

            {/* Quick Export Action Bar */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#162238] to-slate-900 border border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Formatted for Offline Printing & Archival
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleExportEvaluationPDF(activeEvaluationDetail, false)}
                  disabled={exportingPdfId === activeEvaluationDetail.id}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                  title="Download multi-page PDF evaluation report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportingPdfId === activeEvaluationDetail.id ? "Generating..." : "Download PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportEvaluationPDF(activeEvaluationDetail, true)}
                  disabled={exportingPdfId === activeEvaluationDetail.id}
                  className="px-3 py-1.5 rounded-lg bg-[#111723] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  title="Print dossier or view print preview"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>

            {/* Criteria Progress Bars & 7-Dimension Rubric */}
            <div className="p-4 rounded-xl bg-[#111723] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>UPSC Mains 7-Dimension Rubric</span>
                </h4>
                <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Standardized 15-Mark Scale
                </span>
              </div>

              {/* 7-Dimension Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Introduction & Context", score: activeEvaluationDetail.criteria.introductionScore ?? 1.1, max: 1.5 },
                  { label: "Conceptual Clarity", score: activeEvaluationDetail.criteria.conceptualClarityScore ?? 1.4, max: 2.0 },
                  { label: "Content Demand & Depth", score: activeEvaluationDetail.criteria.contentDemandScore ?? 2.8, max: 4.0 },
                  { label: "Critical Analysis", score: activeEvaluationDetail.criteria.analysisScore ?? 1.4, max: 2.0 },
                  { label: "Thinkers & 2nd ARC", score: activeEvaluationDetail.criteria.examplesAndThinkersScore ?? 1.1, max: 1.5 },
                  { label: "Answer Structure", score: activeEvaluationDetail.criteria.structureScore ?? 0.8, max: 1.0 },
                  { label: "Forward Conclusion", score: activeEvaluationDetail.criteria.conclusionScore ?? 0.8, max: 1.0 },
                ].map((item, idx) => {
                  const pct = Math.min(100, Math.round((item.score / item.max) * 100));
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span className="font-medium truncate pr-1">{item.label}</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {item.score} <span className="text-slate-500">/ {item.max}</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Repeated Weaknesses (Cross-Answer Diagnostic) */}
            {activeEvaluationDetail.repeatedWeaknesses && activeEvaluationDetail.repeatedWeaknesses.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-900/40 text-xs space-y-2">
                <h4 className="font-bold text-orange-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Repeated Weaknesses Detected Across Your Answers:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {activeEvaluationDetail.repeatedWeaknesses.map((rw, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{rw}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What You Did Well:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {activeEvaluationDetail.whatWentWell.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 space-y-2">
                <h4 className="font-bold text-red-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Needs Improvement:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {activeEvaluationDetail.needsImprovement.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Dimensions */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs space-y-1.5">
              <h4 className="font-bold text-amber-400">Missing Dimensions for High Scoring (12.5+):</h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {activeEvaluationDetail.missingDimensions.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Bolt's Personal Feedback */}
            <div className="p-4 rounded-xl bg-[#162033] border border-blue-900/40 text-xs space-y-1.5">
              <h4 className="font-bold text-blue-400 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Bolt's Personal Academic Assessment:</span>
              </h4>
              <p className="text-slate-200 leading-relaxed">
                {activeEvaluationDetail.boltFeedback}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleExportEvaluationPDF(activeEvaluationDetail, false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Formatted PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportEvaluationPDF(activeEvaluationDetail, true)}
                  className="px-3.5 py-2 rounded-xl bg-[#162033] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print Dossier</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    onAskBolt(`I need mentorship on my answer for: "${activeEvaluationDetail.questionText}". My current score is ${activeEvaluationDetail.score}/${activeEvaluationDetail.maxMarks}. Bolt's feedback was: "${activeEvaluationDetail.boltFeedback}". How can I integrate the missing dimensions?`);
                    setActiveEvaluationDetail(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 px-3 py-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Discuss with Bolt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvaluationDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-blue-500/40 text-white text-xs shadow-2xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{pdfToast.message}</span>
            <button
              onClick={() => setPdfToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
