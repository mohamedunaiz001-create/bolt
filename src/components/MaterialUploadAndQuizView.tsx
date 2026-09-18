import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Clock,
  Compass,
  Check,
  X,
  ChevronRight,
  Bookmark,
  FileCode,
  Terminal,
} from "lucide-react";
import { UploadedMaterial, MaterialQuestion } from "../types";

const SAMPLE_MATERIALS: UploadedMaterial[] = [
  {
    id: "mat-sample-arc",
    title: "2nd ARC 10th Report (Civil Services Reforms)",
    filename: "2nd_ARC_10th_Report_Refined.txt",
    fileType: "TXT",
    uploadDate: "Today",
    wordCount: 380,
    estimatedReadMinutes: 2,
    summary:
      "The 2nd Administrative Reforms Commission (10th Report) chaired by Veerappa Moily recommends establishing a statutory Civil Services Authority to insulate civil servants from arbitrary political transfers. It emphasizes tenure stability, domain specialization, and performance-linked accountability while reforming Article 311 disciplinary mechanisms.",
    detectedTags: ["Public Administration", "Polity & Governance", "Administrative Ethics"],
    peripheralAreas: [
      "Colonial Civil Service Evolution (1855-1947)",
      "Civil Services Authority Statutory Mechanics",
    ],
    gsPaperMapping: ["GS 2", "Public Administration Paper 1 & 2"],
    questions: [
      {
        id: "mat-q-sample-1",
        questionNumber: 1,
        subject: "Civil Services Reforms",
        topic: "Tenure Stability & Civil Services Authority",
        tags: ["2nd ARC", "Civil Services", "Governance"],
        isCurrentAffairs: false,
        questionText:
          "According to the 2nd Administrative Reforms Commission (10th Report), which institutional mechanism was recommended to safeguard civil servants from arbitrary transfers and premature displacements?",
        options: [
          { key: "A", text: "Direct supervision by the Central Vigilance Commission (CVC)" },
          { key: "B", text: "Creation of a statutory, independent Civil Services Authority" },
          { key: "C", text: "Vesting transfer powers exclusively in the State Governor" },
          { key: "D", text: "Mandatory judicial review by the Supreme Court for every transfer" },
        ],
        correctOption: "B",
        explanation:
          "The 2nd ARC recommended the constitution of a statutory Civil Services Authority (both at the Union and State levels) to oversee senior postings, transfers, and tenures, mitigating the adverse effects of frequent, politically motivated transfers.",
        sourceCitation: "2nd ARC 10th Report, Chapter 3: Tenure Stability & Postings",
        relatedConcept: "Tenure Protection, Civil Services Authority, Article 311",
        difficulty: "Medium",
      },
      {
        id: "mat-q-sample-2",
        questionNumber: 2,
        subject: "Constitutional Safeguards",
        topic: "Article 311 & Natural Justice",
        tags: ["Polity", "Constitutional Law", "Civil Services"],
        isCurrentAffairs: false,
        questionText:
          "Consider the following statements regarding constitutional safeguards under Article 311 of the Constitution of India:\n\n1. No civil servant can be dismissed by an authority subordinate to that by which they were appointed.\n2. A departmental inquiry may be dispensed with if the President or Governor is satisfied that in the interest of the security of the State it is not expedient to hold such inquiry.\n\nWhich of the statements given above is/are correct?",
        options: [
          { key: "A", text: "1 only" },
          { key: "B", text: "2 only" },
          { key: "C", text: "Both 1 and 2" },
          { key: "D", text: "Neither 1 nor 2" },
        ],
        correctOption: "C",
        explanation:
          "Both statements are correct. Article 311(1) ensures that dismissal or removal cannot be done by an authority subordinate to the appointing authority. Article 311(2) Clause (c) permits dispensing with an inquiry where the President or Governor is satisfied that the security of the State warrants it.",
        sourceCitation: "Article 311, Constitution of India & 2nd ARC Analysis",
        relatedConcept: "Article 311, Civil Service Immunity, Doctrine of Pleasure",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "mat-sample-pesa",
    title: "PESA Act & Tribal Customary Self-Governance",
    filename: "PESA_Act_Tribal_Rights.docx",
    fileType: "DOCX",
    uploadDate: "Yesterday",
    wordCount: 420,
    estimatedReadMinutes: 3,
    summary:
      "The Provisions of the Panchayats (Extension to the Scheduled Areas) Act, 1996 recognizes the customary laws, social and religious practices, and traditional management practices of community resources in Fifth Schedule areas, designating the Gram Sabha as the supreme decision-making institution.",
    detectedTags: ["Tribal Governance", "Fifth Schedule", "Local Self Government"],
    peripheralAreas: [
      "Tribal Customary Laws & PESA Peripheral Provisions",
      "Minor Forest Produce Ownership Jurisprudence",
    ],
    gsPaperMapping: ["GS 2", "GS 3 Environment"],
    questions: [
      {
        id: "mat-q-pesa-1",
        questionNumber: 1,
        subject: "Peripheral Tribal Governance",
        topic: "Gram Sabha Powers under PESA 1996",
        tags: ["PESA", "Gram Sabha", "Fifth Schedule"],
        isCurrentAffairs: true,
        questionText:
          "Under the PESA Act 1996, the ownership of minor forest produce in Scheduled Areas is endowed in which of the following institutions?",
        options: [
          { key: "A", text: "State Forest Development Corporation" },
          { key: "B", text: "Gram Sabha and Panchayats at appropriate levels" },
          { key: "C", text: "Union Ministry of Environment, Forest and Climate Change" },
          { key: "D", text: "District Forest Officer (DFO)" },
        ],
        correctOption: "B",
        explanation:
          "Section 4(m)(ii) of PESA 1996 specifically endows the ownership of minor forest produce directly in the Gram Sabha and Panchayats at the appropriate level, restoring customary livelihood autonomy to tribal communities.",
        sourceCitation: "Section 4(m)(ii), PESA Act 1996",
        relatedConcept: "Minor Forest Produce, PESA, Tribal Customary Autonomy",
        difficulty: "Medium",
      },
    ],
  },
];

export const MaterialUploadAndQuizView: React.FC = () => {
  const [materials, setMaterials] = useState<UploadedMaterial[]>(SAMPLE_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState<UploadedMaterial>(SAMPLE_MATERIALS[0]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload and process via Python Engine
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(`Python 3.10 Engine is parsing ${file.name}...`);

    try {
      // Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Call Python Material Processor API
        const response = await fetch("/api/python/materials/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileBase64: base64Data,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            questionsCount: 5,
          }),
        });

        if (!response.ok) {
          throw new Error("Python material extraction service failed");
        }

        const resData = await response.json();
        const data = resData.data;

        const newMaterial: UploadedMaterial = {
          id: `mat-${Date.now()}`,
          title: data.title || file.name,
          filename: file.name,
          fileType: file.name.split(".").pop()?.toUpperCase() || "DOC",
          uploadDate: "Just now",
          wordCount: data.wordCount || 350,
          estimatedReadMinutes: Math.max(1, Math.round((data.wordCount || 350) / 180)),
          summary: data.summary || "Document parsed by Python Engine.",
          detectedTags: data.detectedTags || ["General Studies"],
          peripheralAreas: data.peripheralAreas || ["Core Syllabus"],
          gsPaperMapping: data.gsPaperMapping || ["GS Multi-disciplinary"],
          questions: data.questions || [],
        };

        setMaterials((prev) => [newMaterial, ...prev]);
        setSelectedMaterial(newMaterial);
        setIsQuizMode(false);
        setUserAnswers({});
        setShowExplanations({});
        setStatusMessage("Extracted successfully with custom questions generated by Python!");
        setTimeout(() => setStatusMessage(null), 5000);
      };

      reader.onerror = () => {
        throw new Error("Failed to read file.");
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || "Failed to process file"}`);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: "A" | "B" | "C" | "D") => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowExplanations({});
  };

  const calculateScore = () => {
    let score = 0;
    selectedMaterial.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctOption) {
        score += 2;
      }
    });
    return score;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = selectedMaterial.questions.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-xs border border-blue-500/30 flex items-center space-x-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Python 3.10 Material & Quiz Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                PDF & DOCX Parser
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              Study Materials & Automated Test Attendance
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Upload your personal notes, government reports, or coaching handouts in{" "}
              <strong className="text-white">PDF, DOCX, or TXT</strong> format. The Python engine
              extracts core arguments, highlights peripheral areas, and instantly generates UPSC
              Prelims and Mains questions for you to attend.
            </p>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? "Processing in Python..." : "Upload PDF or DOCX"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-blue-900/40 border border-blue-700/60 text-blue-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Upload Dropzone & Material Selector (Left), Content & Quiz (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Dropzone & Materials List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-500/10"
                : "border-[#232f45] bg-[#101622] hover:border-blue-500/50 hover:bg-[#151d2c]"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white font-['Outfit']">
              Drop your study file here
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports <span className="text-blue-300">.pdf</span>,{" "}
              <span className="text-blue-300">.docx</span>,{" "}
              <span className="text-blue-300">.txt</span> up to 25MB
            </p>
            <div className="mt-4 inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/60">
              <Terminal className="w-3 h-3" />
              <span>Parsed via Python stdlib & stream engine</span>
            </div>
          </div>

          {/* Uploaded Materials Library */}
          <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Uploaded Materials ({materials.length})
              </h2>
              <span className="text-[11px] text-blue-400">Select to practice</span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {materials.map((mat) => {
                const isSelected = selectedMaterial.id === mat.id;
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setIsQuizMode(false);
                      setUserAnswers({});
                      setShowExplanations({});
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-md"
                        : "bg-[#101622] border-[#232f45] text-slate-300 hover:border-slate-700 hover:bg-[#131b2a]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-blue-400 border border-slate-700 uppercase">
                          {mat.fileType}
                        </span>
                        <h4 className="text-xs font-bold line-clamp-1">{mat.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{mat.estimatedReadMinutes}m</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {mat.summary}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {mat.questions.length} questions ready
                      </span>
                      <span className="text-blue-400 font-semibold flex items-center space-x-1">
                        <span>Attend Test</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Material Overview & Interactive Quiz Attendance */}
        <div className="lg:col-span-8 space-y-6">
          {/* Material Metadata Header Card */}
          <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232f45]">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    {selectedMaterial.fileType} Document
                  </span>
                  <span className="text-xs text-slate-400">{selectedMaterial.wordCount} words</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">~{selectedMaterial.estimatedReadMinutes} min read</span>
                </div>
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  {selectedMaterial.title}
                </h2>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsQuizMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    !isQuizMode
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-[#101622] text-slate-300 hover:text-white border border-[#232f45]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Document Insights</span>
                </button>
                <button
                  onClick={() => setIsQuizMode(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isQuizMode
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-400"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Attend Questions ({selectedMaterial.questions.length})</span>
                </button>
              </div>
            </div>

            {/* Document Insights Mode */}
            {!isQuizMode && (
              <div className="mt-5 space-y-5 animate-fadeIn">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Executive Crux & Extract (Python Engine)</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45] text-sm text-slate-200 leading-relaxed">
                    {selectedMaterial.summary}
                  </div>
                </div>

                {/* GS Paper Mapping & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>UPSC Syllabus Alignment</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMaterial.gsPaperMapping.map((paper, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                        >
                          {paper}
                        </span>
                      ))}
                      {selectedMaterial.detectedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Peripheral Areas Detected */}
                  <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center space-x-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Peripheral Areas & Edge Concepts</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedMaterial.peripheralAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Call to Action to attend test */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">
                      Ready to test your comprehension?
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Attend the {selectedMaterial.questions.length} questions synthesized directly from
                      this text.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuizMode(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Practice Test Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Question Attendance Mode */}
            {isQuizMode && (
              <div className="mt-5 space-y-6 animate-fadeIn">
                {/* Score & Progress Tracker */}
                <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Current Score</div>
                      <div className="text-base font-bold text-white">
                        {calculateScore()} / {totalQuestions * 2} Marks{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          ({answeredCount} of {totalQuestions} answered)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={resetQuiz}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Test</span>
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {selectedMaterial.questions.map((q, qIndex) => {
                    const selected = userAnswers[q.id];
                    const isAnswered = !!selected;
                    const isCorrect = selected === q.correctOption;
                    const showExp = showExplanations[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl bg-[#101622] border border-[#232f45] space-y-4"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                              Q{qIndex + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              {q.topic}
                            </span>
                          </div>

                          {q.difficulty && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                                q.difficulty === "Hard"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <p className="text-sm font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2.5 pt-1">
                          {q.options.map((opt) => {
                            const isThisSelected = selected === opt.key;
                            const isThisCorrect = q.correctOption === opt.key;

                            let optStyle =
                              "bg-[#151c2a] border-[#232f45] text-slate-200 hover:border-blue-500/50 hover:bg-[#182133]";

                            if (isAnswered) {
                              if (isThisCorrect) {
                                optStyle =
                                  "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                              } else if (isThisSelected && !isThisCorrect) {
                                optStyle =
                                  "bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
                              } else {
                                optStyle =
                                  "bg-[#151c2a]/40 border-[#232f45]/50 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={opt.key}
                                onClick={() => handleSelectOption(q.id, opt.key)}
                                className={`p-3 rounded-xl border text-left text-xs font-medium flex items-start space-x-3 transition-all ${optStyle}`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                                    isAnswered && isThisCorrect
                                      ? "bg-emerald-500 text-white"
                                      : isAnswered && isThisSelected
                                      ? "bg-rose-500 text-white"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="flex-1 leading-relaxed">{opt.text}</span>
                                {isAnswered && isThisCorrect && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                )}
                                {isAnswered && isThisSelected && !isThisCorrect && (
                                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box when answered */}
                        {showExp && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold flex items-center space-x-1.5 ${
                                  isCorrect ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <AlertCircle className="w-4 h-4" />
                                )}
                                <span>
                                  {isCorrect ? "Correct! +2.0 Marks" : `Incorrect. Correct Option: ${q.correctOption}`}
                                </span>
                              </span>
                              {q.sourceCitation && (
                                <span className="text-[10px] text-blue-400 italic">
                                  {q.sourceCitation}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                              {q.explanation}
                            </p>

                            {q.relatedConcept && (
                              <div className="pt-1 text-[11px] text-slate-400 flex items-center space-x-1">
                                <span className="font-semibold text-slate-300">Core Concept:</span>
                                <span>{q.relatedConcept}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
