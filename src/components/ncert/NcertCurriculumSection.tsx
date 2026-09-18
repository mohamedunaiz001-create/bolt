import React, { useState, useMemo } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  RotateCcw,
  Check,
  Flame,
  Layers,
  Bookmark,
  BookMarked,
  BarChart3,
  ListFilter,
  Target,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { NcertChapter } from "../../types";
import {
  NCERT_CLASS_METADATA,
  NCERT_SUBJECT_METADATA,
  NcertClassMetadata,
} from "../../data/ncertCurriculumData";

export type ChapterStudyStatus = "unstudied" | "in_progress" | "completed" | "needs_revision";

interface NcertCurriculumSectionProps {
  chapters: NcertChapter[];
  selectedChapter: NcertChapter;
  onSelectChapter: (chapter: NcertChapter, autoStartQuiz?: boolean) => void;
  chapterStatuses: Record<string, ChapterStudyStatus>;
  onUpdateStatus: (chapterId: string, status: ChapterStudyStatus) => void;
  quizScores: Record<string, { score: number; maxScore: number; timestamp: string }>;
}

export const NcertCurriculumSection: React.FC<NcertCurriculumSectionProps> = ({
  chapters,
  selectedChapter,
  onSelectChapter,
  chapterStatuses,
  onUpdateStatus,
  quizScores,
}) => {
  // Navigation & Filtering
  const [curriculumTab, setCurriculumTab] = useState<"matrix" | "byClass" | "bySubject">("matrix");
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | "all">("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyHighYield, setOnlyHighYield] = useState<boolean>(false);

  // Active class for "byClass" tab
  const [activeClassTab, setActiveClassTab] = useState<number>(11);
  // Active subject for "bySubject" tab
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>("Polity");

  // Calculated Progress Metrics
  const totalChapters = chapters.length;

  const completedCount = useMemo(() => {
    return chapters.filter((c) => chapterStatuses[c.id] === "completed").length;
  }, [chapters, chapterStatuses]);

  const inProgressCount = useMemo(() => {
    return chapters.filter((c) => chapterStatuses[c.id] === "in_progress").length;
  }, [chapters, chapterStatuses]);

  const needsRevisionCount = useMemo(() => {
    return chapters.filter((c) => chapterStatuses[c.id] === "needs_revision").length;
  }, [chapters, chapterStatuses]);

  const progressPercentage = Math.round((completedCount / Math.max(1, totalChapters)) * 100);

  // Class-wise progress calculation (Classes 6 to 12)
  const classProgress = useMemo(() => {
    const map: Record<number, { total: number; completed: number; percentage: number }> = {};
    for (let c = 6; c <= 12; c++) {
      const classChaps = chapters.filter((ch) => ch.classNum === c);
      const done = classChaps.filter((ch) => chapterStatuses[ch.id] === "completed").length;
      map[c] = {
        total: classChaps.length,
        completed: done,
        percentage: classChaps.length > 0 ? Math.round((done / classChaps.length) * 100) : 0,
      };
    }
    return map;
  }, [chapters, chapterStatuses]);

  // Subject-wise progress calculation
  const subjectProgress = useMemo(() => {
    const subjects = ["Polity", "History", "Geography", "Economy", "Science"];
    const map: Record<string, { total: number; completed: number; percentage: number }> = {};
    subjects.forEach((subj) => {
      const subjChaps = chapters.filter((ch) => ch.subject.toLowerCase() === subj.toLowerCase());
      const done = subjChaps.filter((ch) => chapterStatuses[ch.id] === "completed").length;
      map[subj] = {
        total: subjChaps.length,
        completed: done,
        percentage: subjChaps.length > 0 ? Math.round((done / subjChaps.length) * 100) : 0,
      };
    });
    return map;
  }, [chapters, chapterStatuses]);

  // Filtered chapters for matrix and lists
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      // Class filter
      if (selectedClassFilter !== "all" && c.classNum !== selectedClassFilter) {
        return false;
      }
      // Subject filter
      if (
        selectedSubjectFilter !== "all" &&
        c.subject.toLowerCase() !== selectedSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== "all") {
        const currentStatus = chapterStatuses[c.id] || "unstudied";
        if (currentStatus !== selectedStatusFilter) return false;
      }
      // High yield filter
      if (onlyHighYield && c.upscWeightage !== "Very High") {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = c.chapterTitle.toLowerCase().includes(q);
        const inBook = c.bookTitle.toLowerCase().includes(q);
        const inConcepts = c.keyConcepts.some((k) => k.toLowerCase().includes(q));
        const inGsPaper = c.gsPaper?.toLowerCase().includes(q);
        if (!inTitle && !inBook && !inConcepts && !inGsPaper) return false;
      }
      return true;
    });
  }, [
    chapters,
    selectedClassFilter,
    selectedSubjectFilter,
    selectedStatusFilter,
    onlyHighYield,
    searchQuery,
    chapterStatuses,
  ]);

  // Status Badge Colors & Labels
  const getStatusBadge = (chapterId: string) => {
    const status = chapterStatuses[chapterId] || "unstudied";
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Mastered</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Reading</span>
          </span>
        );
      case "needs_revision":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <AlertTriangle className="w-3 h-3 text-purple-400" />
            <span>Revise</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <span>Not Started</span>
          </span>
        );
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case "polity":
        return "blue";
      case "history":
        return "amber";
      case "geography":
        return "emerald";
      case "economy":
        return "purple";
      case "science":
        return "teal";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Section Header & Foundation Progress Overview */}
      <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>UPSC Core Foundation Curriculum</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                Classes 6 to 12 • 5 Subjects
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20">
                GS 1, GS 2 & GS 3 Syllabus Map
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <span>NCERT Foundation Syllabus Directory</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Systematically navigate and track your mastery through the mandatory NCERT textbook syllabus
              from Class 6 through 12. Each module correlates direct UPSC General Studies paper linkages,
              high-yield conceptual cruxes, revision mindmaps, and concept-grounded evaluation MCQs.
            </p>
          </div>

          {/* Core Foundation Mastery Gauge */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-3 rounded-xl bg-[#101622] border border-[#232f45]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Overall Mastery</span>
                <span className="font-bold text-emerald-400">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{completedCount} of {totalChapters} Mastered</span>
                <Flame className="w-3 h-3 text-amber-400" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101622] border border-[#232f45] flex flex-col justify-between">
              <span className="text-[11px] text-slate-400">Status Breakdown</span>
              <div className="flex items-center space-x-3 mt-1 text-xs">
                <span className="text-emerald-400 font-bold" title="Completed">
                  ✓ {completedCount}
                </span>
                <span className="text-amber-400 font-bold" title="In Progress">
                  ⏳ {inProgressCount}
                </span>
                <span className="text-purple-400 font-bold" title="Needs Revision">
                  ↻ {needsRevisionCount}
                </span>
                <span className="text-slate-400 font-bold" title="Unstudied">
                  • {totalChapters - completedCount - inProgressCount - needsRevisionCount}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Real-time local & cloud sync</span>
            </div>
          </div>
        </div>

        {/* Class-wise Foundation Progress Strip (Class 6 through 12) */}
        <div className="mt-5 pt-4 border-t border-[#232f45]">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
            <span className="flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Class-by-Class Foundation Progress (Class 6 - 12):</span>
            </span>
            <span className="text-[11px] text-slate-400">Click any class pill to filter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {[6, 7, 8, 9, 10, 11, 12].map((c) => {
              const stat = classProgress[c] || { total: 0, completed: 0, percentage: 0 };
              const isSelected = selectedClassFilter === c;
              const isSenior = c >= 11;

              return (
                <button
                  key={c}
                  onClick={() => setSelectedClassFilter(selectedClassFilter === c ? "all" : c)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 ring-1 ring-blue-500"
                      : "bg-[#101622] border-[#232f45] hover:border-slate-600 hover:bg-[#151c2a]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${isSelected ? "text-blue-300" : "text-white"}`}>
                      Class {c}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {stat.completed}/{stat.total}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        stat.percentage === 100
                          ? "bg-emerald-400"
                          : stat.percentage > 0
                          ? "bg-blue-500"
                          : "bg-transparent"
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                    <span>{isSenior ? "High-Yield" : c <= 8 ? "Bedrock" : "Core"}</span>
                    <span>{stat.percentage}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Curriculum View Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232f45] pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setCurriculumTab("matrix")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              curriculumTab === "matrix"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-[#151b28] text-slate-300 hover:text-white border border-[#232f45]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Matrix (All Chapters)</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {filteredChapters.length}
            </span>
          </button>

          <button
            onClick={() => setCurriculumTab("byClass")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              curriculumTab === "byClass"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-[#151b28] text-slate-300 hover:text-white border border-[#232f45]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class-by-Class Roadmaps (6-12)</span>
          </button>

          <button
            onClick={() => setCurriculumTab("bySubject")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              curriculumTab === "bySubject"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-[#151b28] text-slate-300 hover:text-white border border-[#232f45]"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Subject Continuity Tracks</span>
          </button>
        </div>

        {/* Quick Search & Filters Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters, concepts, GS paper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#101622] border border-[#232f45] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlyHighYield(!onlyHighYield)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all whitespace-nowrap ${
              onlyHighYield
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-[#101622] text-slate-400 border-[#232f45] hover:text-white"
            }`}
            title="Filter Very High Weightage"
          >
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">High Yield Only</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CURRICULUM MATRIX VIEW */}
      {curriculumTab === "matrix" && (
        <div className="space-y-4">
          {/* Sub-Filters: Subject & Status */}
          <div className="bg-[#151b28] border border-[#232f45] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-slate-400 font-semibold flex items-center space-x-1 mr-1">
                <Filter className="w-3 h-3" />
                <span>Subject:</span>
              </span>
              {["all", "Polity", "History", "Geography", "Economy", "Science"].map((subj) => {
                const isSelected = selectedSubjectFilter.toLowerCase() === subj.toLowerCase();
                return (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubjectFilter(subj)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-[#101622] text-slate-300 hover:text-white border border-[#232f45]"
                    }`}
                  >
                    {subj === "all" ? "All Subjects" : subj}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[#101622] border border-[#232f45] text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Mastered (Completed)</option>
                <option value="in_progress">Currently Reading</option>
                <option value="needs_revision">Needs Revision</option>
                <option value="unstudied">Not Started</option>
              </select>

              {(selectedClassFilter !== "all" ||
                selectedSubjectFilter !== "all" ||
                selectedStatusFilter !== "all" ||
                onlyHighYield ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedClassFilter("all");
                    setSelectedSubjectFilter("all");
                    setSelectedStatusFilter("all");
                    setOnlyHighYield(false);
                    setSearchQuery("");
                  }}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px] underline ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Curriculum Chapters Grid */}
          {filteredChapters.length === 0 ? (
            <div className="p-8 text-center bg-[#151b28] border border-[#232f45] rounded-2xl">
              <GraduationCap className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No NCERT chapters match the filter criteria</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try clearing active filters or changing your search terms.
              </p>
              <button
                onClick={() => {
                  setSelectedClassFilter("all");
                  setSelectedSubjectFilter("all");
                  setSelectedStatusFilter("all");
                  setOnlyHighYield(false);
                  setSearchQuery("");
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredChapters.map((ch) => {
                const isSelected = selectedChapter.id === ch.id;
                const status = chapterStatuses[ch.id] || "unstudied";
                const qScore = quizScores[ch.id];

                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg"
                        : "bg-[#151b28] border-[#232f45] hover:border-slate-600 hover:bg-[#182133]"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            Class {ch.classNum} • {ch.subject}
                          </span>
                          {ch.gsPaper && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {ch.gsPaper}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                            ch.upscWeightage === "Very High"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          }`}
                        >
                          {ch.upscWeightage}
                        </span>
                      </div>

                      {/* Chapter Title & Textbook */}
                      <h3
                        onClick={() => onSelectChapter(ch)}
                        className="text-sm font-bold text-white mt-2.5 cursor-pointer hover:text-emerald-400 line-clamp-2 transition-colors"
                      >
                        Ch {ch.chapterNumber}: {ch.chapterTitle}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ch.bookTitle}</p>

                      {/* Key Concepts Snippet */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {ch.keyConcepts.slice(0, 3).map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-[#101622] text-[10px] text-slate-300 border border-[#232f45] line-clamp-1"
                          >
                            {concept}
                          </span>
                        ))}
                        {ch.keyConcepts.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{ch.keyConcepts.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Controls & Status Tracker */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          {getStatusBadge(ch.id)}
                          {qScore && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              Quiz: {qScore.score}/{qScore.maxScore}
                            </span>
                          )}
                        </div>

                        {/* Interactive Status Cycle Button */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const nextStatus: Record<ChapterStudyStatus, ChapterStudyStatus> = {
                                unstudied: "in_progress",
                                in_progress: "completed",
                                completed: "needs_revision",
                                needs_revision: "unstudied",
                              };
                              onUpdateStatus(ch.id, nextStatus[status]);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center space-x-1"
                            title="Cycle Study Status"
                          >
                            <span>Toggle Status</span>
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => onSelectChapter(ch, false)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-[#101622] text-slate-300 hover:text-white border border-[#232f45]"
                          }`}
                        >
                          <span>{isSelected ? "Active in Study Hub" : "Study Notes"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onSelectChapter(ch, true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all flex items-center space-x-1"
                          title="Attend Chapter MCQ Quiz"
                        >
                          <Award className="w-3 h-3" />
                          <span>Quiz ({ch.quizQuestions.length})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLASS-BY-CLASS ROADMAPS (Class 6 - 12) */}
      {curriculumTab === "byClass" && (
        <div className="space-y-5">
          {/* Class Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-[#232f45]">
            {[6, 7, 8, 9, 10, 11, 12].map((clsNum) => {
              const isActive = activeClassTab === clsNum;
              const stat = classProgress[clsNum] || { total: 0, completed: 0, percentage: 0 };

              return (
                <button
                  key={clsNum}
                  onClick={() => setActiveClassTab(clsNum)}
                  className={`px-4 py-2.5 rounded-xl text-left border transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-500 shadow-md ring-1 ring-blue-400"
                      : "bg-[#151b28] border-[#232f45] text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Class {clsNum}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-emerald-400"
                      }`}
                    >
                      {stat.completed}/{stat.total}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {clsNum <= 8 ? "Bedrock" : clsNum <= 10 ? "Secondary" : "Senior (High-Yield)"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Class Focus & Strategy Banner */}
          {(() => {
            const classMeta =
              NCERT_CLASS_METADATA.find((m) => m.classNum === activeClassTab) ||
              NCERT_CLASS_METADATA[0];
            const classChapters = chapters.filter((c) => c.classNum === activeClassTab);
            const classDone = classChapters.filter(
              (c) => chapterStatuses[c.id] === "completed"
            ).length;
            const classPercent =
              classChapters.length > 0
                ? Math.round((classDone / classChapters.length) * 100)
                : 0;

            return (
              <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                        {classMeta.stage}
                      </span>
                      <span className="text-xs text-slate-400">
                        Pace: {classMeta.recommendedDuration}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{classMeta.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {classMeta.focusAreas}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101622] border border-[#232f45] min-w-[200px]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Class {activeClassTab} Progress</span>
                      <span className="font-bold text-emerald-400">{classPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${classPercent}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{classDone} of {classChapters.length} Chapters Mastered</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* UPSC Significance Note */}
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-300">UPSC Significance: </span>
                    <span>{classMeta.upscSignificance}</span>
                  </div>
                </div>

                {/* Prescribed NCERT Textbooks for this class */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Core UPSC NCERT Books for Class {activeClassTab}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {classMeta.books.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#101622] border border-[#232f45] text-xs flex items-center space-x-2.5"
                      >
                        <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="text-[10px] font-bold text-emerald-400">{b.subject}</div>
                          <div className="font-semibold text-white line-clamp-1">{b.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapters in this Class */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Curriculum Chapters ({classChapters.length})</span>
                    <span className="text-emerald-400 text-[11px]">Click to study or attend quiz</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classChapters.map((ch) => {
                      const isSelected = selectedChapter.id === ch.id;
                      const status = chapterStatuses[ch.id] || "unstudied";

                      return (
                        <div
                          key={ch.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/50"
                              : "bg-[#101622] border-[#232f45] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">
                                {ch.subject}
                              </span>
                              {ch.gsPaper && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-300">
                                  {ch.gsPaper}
                                </span>
                              )}
                            </div>
                            {getStatusBadge(ch.id)}
                          </div>

                          <h4
                            onClick={() => onSelectChapter(ch)}
                            className="text-sm font-bold text-white mt-2 cursor-pointer hover:text-emerald-400"
                          >
                            Ch {ch.chapterNumber}: {ch.chapterTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ch.bookTitle}</p>

                          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                            {ch.highYieldCrux}
                          </p>

                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {(["unstudied", "in_progress", "completed", "needs_revision"] as ChapterStudyStatus[]).map(
                                (st) => (
                                  <button
                                    key={st}
                                    onClick={() => onUpdateStatus(ch.id, st)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                      status === st
                                        ? st === "completed"
                                          ? "bg-emerald-600 text-white"
                                          : st === "in_progress"
                                          ? "bg-amber-600 text-white"
                                          : st === "needs_revision"
                                          ? "bg-purple-600 text-white"
                                          : "bg-slate-700 text-white"
                                        : "bg-slate-800 text-slate-400 hover:text-white"
                                    }`}
                                  >
                                    {st === "completed"
                                      ? "Done"
                                      : st === "in_progress"
                                      ? "Reading"
                                      : st === "needs_revision"
                                      ? "Revise"
                                      : "Reset"}
                                  </button>
                                )
                              )}
                            </div>

                            <button
                              onClick={() => onSelectChapter(ch, true)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center space-x-1"
                            >
                              <Award className="w-3 h-3" />
                              <span>Quiz</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: SUBJECT CONTINUITY TRACKS */}
      {curriculumTab === "bySubject" && (
        <div className="space-y-5">
          {/* Subject Selector Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#232f45]">
            {["Polity", "History", "Geography", "Economy", "Science"].map((subj) => {
              const isActive = activeSubjectTab.toLowerCase() === subj.toLowerCase();
              const stat = subjectProgress[subj] || { total: 0, completed: 0, percentage: 0 };

              return (
                <button
                  key={subj}
                  onClick={() => setActiveSubjectTab(subj)}
                  className={`px-4 py-2.5 rounded-xl text-left border transition-all shrink-0 ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-500 shadow-md ring-1 ring-purple-400"
                      : "bg-[#151b28] border-[#232f45] text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>{subj}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-emerald-400"
                      }`}
                    >
                      {stat.completed}/{stat.total}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {subj === "Polity"
                      ? "GS 2 & Prelims"
                      : subj === "History"
                      ? "GS 1 & Prelims"
                      : subj === "Geography"
                      ? "GS 1 & Prelims"
                      : subj === "Economy"
                      ? "GS 3 & Prelims"
                      : "GS 3 & Ecology"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Subject Continuum Banner */}
          {(() => {
            const subjMeta =
              NCERT_SUBJECT_METADATA[activeSubjectTab] || NCERT_SUBJECT_METADATA["Polity"];
            const subjChapters = chapters
              .filter((c) => c.subject.toLowerCase() === activeSubjectTab.toLowerCase())
              .sort((a, b) => a.classNum - b.classNum);

            return (
              <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {subjMeta.gsPaper}
                    </span>
                    <span className="text-xs text-slate-400">
                      Classes Covered: {subjMeta.classesCovered.join(", ")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{subjMeta.subject} Foundation Track</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{subjMeta.coreTheme}</p>
                </div>

                {/* Strategy Note */}
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                  <span className="font-bold text-purple-300">UPSC Reading Strategy: </span>
                  <span>{subjMeta.readingStrategy}</span>
                </div>

                {/* Vertical Timeline from Class 6 to 12 */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Syllabus Progression from Lower to Higher Classes
                  </h4>

                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                    {subjChapters.map((ch) => {
                      const isSelected = selectedChapter.id === ch.id;
                      const status = chapterStatuses[ch.id] || "unstudied";

                      return (
                        <div key={ch.id} className="relative">
                          {/* Timeline Dot */}
                          <div
                            className={`absolute -left-6 top-3 w-3 h-3 rounded-full border-2 ${
                              status === "completed"
                                ? "bg-emerald-500 border-emerald-300"
                                : status === "in_progress"
                                ? "bg-amber-500 border-amber-300"
                                : status === "needs_revision"
                                ? "bg-purple-500 border-purple-300"
                                : "bg-slate-800 border-slate-600"
                            }`}
                          />

                          <div
                            className={`p-4 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500"
                                : "bg-[#101622] border-[#232f45] hover:border-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300">
                                Class {ch.classNum} • Ch {ch.chapterNumber}
                              </span>
                              {getStatusBadge(ch.id)}
                            </div>

                            <h4
                              onClick={() => onSelectChapter(ch)}
                              className="text-sm font-bold text-white mt-1.5 cursor-pointer hover:text-emerald-400"
                            >
                              {ch.chapterTitle}
                            </h4>
                            <p className="text-[11px] text-slate-400">{ch.bookTitle}</p>

                            <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                              {ch.highYieldCrux}
                            </p>

                            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                {(["unstudied", "in_progress", "completed", "needs_revision"] as ChapterStudyStatus[]).map(
                                  (st) => (
                                    <button
                                      key={st}
                                      onClick={() => onUpdateStatus(ch.id, st)}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                        status === st
                                          ? "bg-purple-600 text-white"
                                          : "bg-slate-800 text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {st === "completed"
                                        ? "Mastered"
                                        : st === "in_progress"
                                        ? "Reading"
                                        : st === "needs_revision"
                                        ? "Revise"
                                        : "Reset"}
                                    </button>
                                  )
                                )}
                              </div>

                              <button
                                onClick={() => onSelectChapter(ch, true)}
                                className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center space-x-1"
                              >
                                <span>Study & Quiz</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
