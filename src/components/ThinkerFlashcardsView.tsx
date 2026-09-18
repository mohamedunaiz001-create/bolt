import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  AlertTriangle,
  Star,
  BookOpen,
  HelpCircle,
  Zap,
  Flame,
  Award,
  Filter,
  Search,
  Check,
  Eye,
  Layers,
  GraduationCap,
  ArrowRight,
  Volume2,
  RefreshCw,
  Library,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ThinkerFlashcard, FlashcardProgress } from "../types";
import { THINKER_FLASHCARDS } from "../data/flashcardsData";

interface ThinkerFlashcardsViewProps {
  onAskBoltTopic?: (topicName: string) => void;
  onSelectTopicToPractice?: (topicId: string) => void;
}

export const ThinkerFlashcardsView: React.FC<ThinkerFlashcardsViewProps> = ({
  onAskBoltTopic,
  onSelectTopicToPractice,
}) => {
  // Mode: "carousel" (Flashcard study), "quiz" (Active recall test), "grid" (Cheatsheet table)
  const [viewMode, setViewMode] = useState<"carousel" | "quiz" | "grid">("carousel");

  // Filter states
  const [filterPaper, setFilterPaper] = useState<"all" | "Paper 1" | "Paper 2">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "needs_review" | "mastered" | "starred">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Carousel card index and flip state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showClues, setShowClues] = useState<boolean>(false);

  // Active recall quiz states
  const [quizCardIndex, setQuizCardIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswerSubmitted, setQuizAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [streakCount, setStreakCount] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Persisted progress dictionary: { [cardId: string]: FlashcardProgress }
  const [progressMap, setProgressMap] = useState<Record<string, FlashcardProgress>>(() => {
    try {
      const saved = localStorage.getItem("bolt_flashcard_progress");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load flashcard progress:", e);
    }
    // Default initial state
    const initial: Record<string, FlashcardProgress> = {};
    THINKER_FLASHCARDS.forEach((card) => {
      initial[card.id] = {
        cardId: card.id,
        status: "unseen",
        reviewCount: 0,
        isStarred: false,
      };
    });
    return initial;
  });

  // Save progress on change
  useEffect(() => {
    try {
      localStorage.setItem("bolt_flashcard_progress", JSON.stringify(progressMap));
    } catch (e) {
      console.warn("Failed to save flashcard progress:", e);
    }
  }, [progressMap]);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return THINKER_FLASHCARDS.filter((card) => {
      // Paper filter
      if (filterPaper !== "all" && card.paper !== filterPaper && card.paper !== "Both") {
        return false;
      }
      // Status filter
      const prog = progressMap[card.id];
      if (filterStatus === "needs_review" && prog?.status !== "needs_review") return false;
      if (filterStatus === "mastered" && prog?.status !== "mastered") return false;
      if (filterStatus === "starred" && !prog?.isStarred) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = card.thinkerOrConcept.toLowerCase().includes(q);
        const matchesPrompt = card.frontPrompt.toLowerCase().includes(q);
        const matchesConcepts = card.keyConcepts.some((c) => c.toLowerCase().includes(q));
        const matchesUnit = card.unit.toLowerCase().includes(q);
        const matchesWorks = card.keyWorksAndYear?.some((w) => w.toLowerCase().includes(q));
        if (!matchesName && !matchesPrompt && !matchesConcepts && !matchesUnit && !matchesWorks) {
          return false;
        }
      }
      return true;
    });
  }, [filterPaper, filterStatus, searchQuery, progressMap]);

  // Clamp current index when filtered cards change
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
    setIsFlipped(false);
    setShowClues(false);
  }, [filteredCards.length, currentIndex]);

  const currentCard: ThinkerFlashcard | undefined = filteredCards[currentIndex];

  // Stats calculation
  const totalCards = THINKER_FLASHCARDS.length;
  const progressList = Object.values(progressMap) as FlashcardProgress[];
  const masteredCount = progressList.filter((p) => p.status === "mastered").length;
  const needsReviewCount = progressList.filter((p) => p.status === "needs_review").length;
  const learningCount = progressList.filter((p) => p.status === "learning").length;
  const starredCount = progressList.filter((p) => p.isStarred).length;
  const masteryPercentage = Math.round((masteredCount / (totalCards || 1)) * 100);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowClues(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowClues(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Update card rating
  const handleRateCard = (status: "mastered" | "learning" | "needs_review") => {
    if (!currentCard) return;

    setProgressMap((prev) => {
      const existing = prev[currentCard.id] || {
        cardId: currentCard.id,
        status: "unseen",
        reviewCount: 0,
      };
      return {
        ...prev,
        [currentCard.id]: {
          ...existing,
          status,
          reviewCount: existing.reviewCount + 1,
          lastReviewed: new Date().toISOString(),
        },
      };
    });

    if (status === "mastered") {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
      });
    }

    // Auto advance to next card after brief delay
    setTimeout(() => {
      handleNext();
    }, 280);
  };

  const handleToggleStar = (cardId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setProgressMap((prev) => {
      const existing = prev[cardId] || {
        cardId,
        status: "unseen",
        reviewCount: 0,
      };
      return {
        ...prev,
        [cardId]: {
          ...existing,
          isStarred: !existing.isStarred,
        },
      };
    });
  };

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setShowClues(false);
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIndex);
  };

  const handleResetProgress = () => {
    if (window.confirm("Reset all flashcard mastery marks and review counts?")) {
      const initial: Record<string, FlashcardProgress> = {};
      THINKER_FLASHCARDS.forEach((card) => {
        initial[card.id] = {
          cardId: card.id,
          status: "unseen",
          reviewCount: 0,
          isStarred: false,
        };
      });
      setProgressMap(initial);
      localStorage.removeItem("bolt_flashcard_progress");
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (viewMode !== "carousel") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1") {
        handleRateCard("needs_review");
      } else if (e.key === "2") {
        handleRateCard("learning");
      } else if (e.key === "3") {
        handleRateCard("mastered");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, handleFlip, handleNext, handlePrev]);

  // Active recall quiz logic
  const currentQuizCard = THINKER_FLASHCARDS[quizCardIndex];

  const handleSelectQuizOption = (index: number) => {
    if (quizAnswerSubmitted) return;
    setSelectedOption(index);
    setQuizAnswerSubmitted(true);

    const isCorrect = index === currentQuizCard.quizChallenge.correctIndex;
    setQuizScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setStreakCount((prev) => {
        const next = prev + 1;
        if (next % 3 === 0) {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        }
        return next;
      });
      // Mark as mastered or learning
      setProgressMap((prev) => ({
        ...prev,
        [currentQuizCard.id]: {
          ...(prev[currentQuizCard.id] || { cardId: currentQuizCard.id, reviewCount: 0 }),
          status: "mastered",
          reviewCount: (prev[currentQuizCard.id]?.reviewCount || 0) + 1,
        },
      }));
    } else {
      setStreakCount(0);
      setProgressMap((prev) => ({
        ...prev,
        [currentQuizCard.id]: {
          ...(prev[currentQuizCard.id] || { cardId: currentQuizCard.id, reviewCount: 0 }),
          status: "needs_review",
          reviewCount: (prev[currentQuizCard.id]?.reviewCount || 0) + 1,
        },
      }));
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizCardIndex + 1 < THINKER_FLASHCARDS.length) {
      setQuizCardIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuizAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      confetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleRestartQuiz = () => {
    setQuizCardIndex(0);
    setSelectedOption(null);
    setQuizAnswerSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
    setStreakCount(0);
    setQuizCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Progress Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-[#131b2c] via-[#0f1728] to-[#0c1220] border border-blue-900/40 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Public Administration High-Yield Thinker Revision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] tracking-tight">
              Thinkers & Administrative Concepts Flashcards
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Rapid active recall and spaced self-quizzing across Classical, Behavioural, Ecological thinkers and Indian Administrative reforms.
            </p>
          </div>

          {/* Quick stats badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-[#162035]/80 border border-slate-700/80 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mastery</div>
              <div className="text-base font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{masteryPercentage}%</span>
                <span className="text-xs text-slate-400 font-normal">({masteredCount}/{totalCards})</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#162035]/80 border border-slate-700/80 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Needs Review</div>
              <div className="text-base font-bold text-amber-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{needsReviewCount}</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#162035]/80 border border-slate-700/80 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Starred</div>
              <div className="text-base font-bold text-yellow-400 flex items-center space-x-1.5">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{starredCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
            <span className="font-medium">Syllabus Flashcard Coverage</span>
            <span className="font-bold text-blue-400">
              {masteredCount + learningCount} of {totalCards} cards actively reviewed
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(masteredCount / totalCards) * 100}%` }}
              title={`Mastered: ${masteredCount}`}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(learningCount / totalCards) * 100}%` }}
              title={`Learning: ${learningCount}`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${(needsReviewCount / totalCards) * 100}%` }}
              title={`Needs Review: ${needsReviewCount}`}
            />
          </div>
        </div>
      </div>

      {/* Mode Navigation & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#111726] border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              setViewMode("carousel");
              setIsFlipped(false);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              viewMode === "carousel"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Interactive Flip Deck</span>
          </button>

          <button
            onClick={() => {
              setViewMode("quiz");
              handleRestartQuiz();
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              viewMode === "quiz"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Active Recall Quiz</span>
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thinker Cheatsheet</span>
          </button>
        </div>

        {/* Filter Controls (Paper & Status & Search) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Paper selector */}
          <div className="flex items-center space-x-1 bg-[#111726] p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterPaper("all")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPaper === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Papers
            </button>
            <button
              onClick={() => setFilterPaper("Paper 1")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPaper === "Paper 1" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paper 1 (Theories)
            </button>
            <button
              onClick={() => setFilterPaper("Paper 2")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPaper === "Paper 2" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paper 2 (Indian Admin)
            </button>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-[#111726] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Mastery Levels</option>
            <option value="needs_review">Needs Review ⚠️</option>
            <option value="mastered">Mastered ✅</option>
            <option value="starred">Starred Only ⭐</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search thinker, concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE FLIP CAROUSEL                                          */}
      {/* ========================================================================= */}
      {viewMode === "carousel" && (
        <div className="space-y-4">
          {filteredCards.length === 0 ? (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No flashcards match your current filter</h3>
              <p className="text-xs text-slate-400">
                Try selecting "All Papers" or clearing the search query to view all {totalCards} thinker cards.
              </p>
              <button
                onClick={() => {
                  setFilterPaper("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : currentCard ? (
            <div className="space-y-4">
              {/* Carousel Top Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">
                    Card {currentIndex + 1} of {filteredCards.length}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{currentCard.unit}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShuffle}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                    title="Shuffle Cards"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Shuffle</span>
                  </button>

                  <button
                    onClick={() => handleToggleStar(currentCard.id)}
                    className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
                      progressMap[currentCard.id]?.isStarred
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                    }`}
                    title={progressMap[currentCard.id]?.isStarred ? "Remove Star" : "Star this card"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        progressMap[currentCard.id]?.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {progressMap[currentCard.id]?.isStarred ? "Starred" : "Star"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3D-Like Flashcard Container */}
              <div
                onClick={handleFlip}
                className="cursor-pointer select-none group perspective-[1000px]"
              >
                <div
                  className={`min-h-[380px] sm:min-h-[420px] w-full rounded-2xl border transition-all duration-500 p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl ${
                    isFlipped
                      ? "bg-gradient-to-br from-[#121c2e] via-[#0e1626] to-[#0a101d] border-blue-500/50 shadow-blue-500/10"
                      : "bg-gradient-to-br from-[#111726] via-[#0f1422] to-[#0c101c] border-slate-700/80 hover:border-slate-500 shadow-black/40"
                  }`}
                >
                  {/* Card Corner Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                        {currentCard.paper}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">
                        {currentCard.eraOrPeriod || currentCard.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentCard.difficulty === "Easy"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : currentCard.difficulty === "Medium"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {currentCard.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {progressMap[currentCard.id]?.status === "mastered" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center space-x-1 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mastered</span>
                        </span>
                      )}
                      {progressMap[currentCard.id]?.status === "needs_review" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center space-x-1 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Needs Review</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {isFlipped ? "BACK • ANSWER" : "FRONT • PROMPT"}
                      </span>
                    </div>
                  </div>

                  {/* ================= FRONT SIDE ================= */}
                  {!isFlipped ? (
                    <div className="my-auto py-4 space-y-5">
                      <div className="space-y-3">
                        <span className="text-xs uppercase tracking-wider text-blue-400 font-bold flex items-center space-x-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span>Thinker / Concept Identification Challenge</span>
                        </span>

                        <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                          {currentCard.frontPrompt}
                        </h3>
                      </div>

                      {/* Thinker Quote / Tagline */}
                      {currentCard.keyQuoteOrTagline && (
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 italic border-l-4 border-l-blue-500">
                          {currentCard.keyQuoteOrTagline}
                        </div>
                      )}

                      {/* Progressive Hints / Clues Toggle */}
                      {currentCard.clues && currentCard.clues.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowClues((prev) => !prev);
                            }}
                            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{showClues ? "Hide Clues" : "Stuck? Reveal 3 UPSC Clues"}</span>
                          </button>

                          {showClues && (
                            <div className="mt-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1.5 text-xs text-amber-200">
                              {currentCard.clues.map((clue, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                  <span>{clue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ================= BACK SIDE ================= */
                    <div className="my-auto py-3 space-y-4 text-left">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                          Identity & Verified Concept
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                          <span>{currentCard.thinkerOrConcept}</span>
                        </h3>
                      </div>

                      {/* Core Thesis */}
                      <div className="p-3.5 rounded-xl bg-[#141d2e] border border-blue-900/50">
                        <div className="text-[11px] uppercase tracking-wider text-blue-300 font-bold mb-1">
                          Core Administrative Thesis
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {currentCard.coreThesis}
                        </p>
                      </div>

                      {/* Key Concepts & Publications */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <span className="font-bold text-slate-300 block mb-1.5">Key Concepts & Terms:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentCard.keyConcepts.map((concept, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 text-[11px] font-medium"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>

                        {currentCard.keyWorksAndYear && currentCard.keyWorksAndYear.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                            <span className="font-bold text-slate-300 block mb-1.5">Milestone Treatises:</span>
                            <ul className="space-y-1 text-slate-300 text-[11px]">
                              {currentCard.keyWorksAndYear.map((work, idx) => (
                                <li key={idx} className="flex items-center space-x-1.5">
                                  <BookOpen className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                  <span>{work}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Mains Application & Critique */}
                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs space-y-1.5">
                        <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>UPSC Mains Exam Application & Paper 2 Linkage:</span>
                        </div>
                        <p className="text-amber-200/90 leading-relaxed text-[11px] sm:text-xs">
                          {currentCard.mainsExamApplication}
                        </p>
                      </div>

                      {/* Mnemonic Memory Hook */}
                      {currentCard.mnemonicOrMemoryHook && (
                        <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-800/40 p-2 rounded-lg">
                          <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span><strong>Mnemonic Hook:</strong> {currentCard.mnemonicOrMemoryHook}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Flip Indicator */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5 text-blue-400 font-medium">
                      <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                      <span>{isFlipped ? "Click or press Space to see Prompt" : "Click anywhere or press Space to Flip"}</span>
                    </span>

                    <span className="hidden sm:inline text-slate-500 text-[11px]">
                      Keys: Space (Flip) • ← → (Nav) • 1/2/3 (Rate)
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Recall Self-Assessment Grading Buttons (Shown when flipped) */}
              {isFlipped && (
                <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-3 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span>How well did you recall {currentCard.thinkerOrConcept}?</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Updates your spaced retention schedule</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleRateCard("needs_review")}
                      className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>1 • Need Revision (Hard)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRateCard("learning")}
                      className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 text-blue-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
                    >
                      <RotateCw className="w-4 h-4 text-blue-400" />
                      <span>2 • Partially Recalled (Medium)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRateCard("mastered")}
                      className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>3 • Mastered! (Easy)</span>
                    </button>
                  </div>

                  {/* Ask Bolt AI helper button */}
                  {onAskBoltTopic && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          onAskBoltTopic(
                            `Explain ${currentCard.thinkerOrConcept}'s core theory, major contributions to Public Administration, and how to link it with contemporary Indian governance in UPSC Mains answers.`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#182338] hover:bg-[#223352] text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ask Bolt AI to generate a Mains answer framework for {currentCard.thinkerOrConcept}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Controls (Prev / Next Buttons) */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl bg-[#111726] hover:bg-[#182238] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Thinker</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    {isFlipped ? "Show Question" : "Reveal Answer"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-[#111726] hover:bg-[#182238] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Next Thinker</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: RAPID ACTIVE RECALL QUIZ                                          */}
      {/* ========================================================================= */}
      {viewMode === "quiz" && (
        <div className="rounded-2xl bg-[#111726] border border-purple-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
          {!quizCompleted ? (
            <div className="space-y-6">
              {/* Quiz Header with Streak and Progress */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider text-purple-400 font-bold flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Active Recall Quiz • Question {quizCardIndex + 1} of {THINKER_FLASHCARDS.length}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {streakCount > 0 && (
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{streakCount} Streak!</span>
                    </div>
                  )}

                  <div className="text-xs font-semibold text-slate-300">
                    Score: <span className="text-emerald-400 font-bold">{quizScore.correct}</span> / {quizScore.total}
                  </div>
                </div>
              </div>

              {/* Question Context & Prompt */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                    {currentQuizCard.paper}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">
                    {currentQuizCard.unit}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Thinker: <strong className="text-white">{currentQuizCard.thinkerOrConcept}</strong>
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed">
                  {currentQuizCard.quizChallenge.question}
                </h3>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-3">
                {currentQuizCard.quizChallenge.options.map((option, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === currentQuizCard.quizChallenge.correctIndex;

                  let buttonStyles = "bg-[#162033] border-slate-800 hover:border-slate-600 text-slate-200";

                  if (quizAnswerSubmitted) {
                    if (isCorrect) {
                      buttonStyles = "bg-emerald-950/60 border-emerald-500 text-white font-semibold";
                    } else if (isChosen && !isCorrect) {
                      buttonStyles = "bg-red-950/60 border-red-500 text-white";
                    } else {
                      buttonStyles = "bg-[#111726] border-slate-800 text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizAnswerSubmitted}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${buttonStyles}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isChosen
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {quizAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {quizAnswerSubmitted && isChosen && !isCorrect && (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-Answer Explanation Box */}
              {quizAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-[#0f172a] border border-blue-900/50 space-y-2 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Syllabus Explanation & Concept Rationale:</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {selectedOption === currentQuizCard.quizChallenge.correctIndex ? "✅ Correct" : "❌ Incorrect"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQuizCard.quizChallenge.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-md shadow-purple-600/30"
                    >
                      <span>
                        {quizCardIndex + 1 === THINKER_FLASHCARDS.length ? "Finish Quiz & View Report" : "Next Question"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Screen */
            <div className="py-8 text-center space-y-5 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  Rapid Recall Challenge Complete!
                </h3>
                <p className="text-xs text-slate-400">
                  You tested your active memory against key Public Administration thinkers and reform paradigms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-2xl font-bold text-purple-400">
                  {quizScore.correct} / {quizScore.total}
                </div>
                <div className="text-xs text-slate-400">
                  Accuracy: <strong>{Math.round((quizScore.correct / (quizScore.total || 1)) * 100)}%</strong>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setViewMode("carousel")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Return to Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: THINKER CHEATSHEET GRID                                            */}
      {/* ========================================================================= */}
      {viewMode === "grid" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredCards.length} Thinkers & Administrative Concepts</span>
            <button
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-red-400 transition-colors text-[11px]"
            >
              Reset Session Progress
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card, idx) => {
              const prog = progressMap[card.id];
              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-bold border border-blue-500/20">
                            {card.paper}
                          </span>
                          <span className="text-[10px] text-slate-400">{card.eraOrPeriod}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {card.thinkerOrConcept}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => handleToggleStar(card.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prog?.isStarred ? "text-yellow-400" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${prog?.isStarred ? "fill-yellow-400" : ""}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {card.coreThesis}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {card.keyConcepts.slice(0, 3).map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span
                      className={`text-[11px] font-semibold flex items-center space-x-1 ${
                        prog?.status === "mastered"
                          ? "text-emerald-400"
                          : prog?.status === "needs_review"
                          ? "text-amber-400"
                          : "text-slate-400"
                      }`}
                    >
                      {prog?.status === "mastered" && <CheckCircle2 className="w-3 h-3" />}
                      {prog?.status === "needs_review" && <AlertTriangle className="w-3 h-3" />}
                      <span>
                        {prog?.status === "mastered"
                          ? "Mastered"
                          : prog?.status === "needs_review"
                          ? "Needs Review"
                          : "Unreviewed"}
                      </span>
                    </span>

                    <button
                      onClick={() => {
                        const targetIdx = filteredCards.findIndex((c) => c.id === card.id);
                        if (targetIdx !== -1) {
                          setCurrentIndex(targetIdx);
                          setViewMode("carousel");
                          setIsFlipped(false);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <span>Study Card</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
