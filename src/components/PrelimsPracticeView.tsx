import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  BookOpen,
  Award,
} from "lucide-react";
import { PrelimsQuestion } from "../types";

interface PrelimsPracticeViewProps {
  questions: PrelimsQuestion[];
  onAskBoltQuestion: (q: PrelimsQuestion) => void;
  onRecordAnswer?: (questionId: string, isCorrect: boolean) => void;
}

export const PrelimsPracticeView: React.FC<PrelimsPracticeViewProps> = ({
  questions,
  onAskBoltQuestion,
  onRecordAnswer,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  const currentQ = questions[currentIndex] || questions[0];
  const selectedOption = selectedAnswers[currentQ.id];
  const isRevealed = revealedQuestions[currentQ.id] || Boolean(selectedOption);

  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    const isFirstAttempt = !selectedAnswers[currentQ.id];
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
    setRevealedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    if (isFirstAttempt && onRecordAnswer) {
      onRecordAnswer(currentQ.id, key === currentQ.correctOption);
    }
  };

  const handleSkipAndReveal = () => {
    setRevealedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const isCorrect = selectedOption === currentQ.correctOption;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Top Question Navigator (Matching Screenshot 4) */}
      <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 font-medium">Question Navigator</span>
          <span className="text-blue-400 font-bold">
            {Object.keys(selectedAnswers).length} / {questions.length} Answered
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {questions.map((q, idx) => {
            const hasAnswered = Boolean(selectedAnswers[q.id]);
            const isQCorrect = selectedAnswers[q.id] === q.correctOption;
            const isCurrent = currentIndex === idx;
            const isFlagged = flaggedQuestions[q.id];

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 flex-shrink-0 rounded-xl font-bold text-xs flex items-center justify-center transition-all relative ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-2 ring-blue-400 shadow-md shadow-blue-500/20"
                    : hasAnswered
                    ? isQCorrect
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-[#162033] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{q.questionNumber || idx + 1}</span>
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#111723]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card (Matching Screenshot 4) */}
      <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-5 sm:p-7 space-y-6 shadow-md">
        {/* Question Header & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              Q{currentQ.questionNumber || currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {currentQ.subject}
            </span>
            {currentQ.isCurrentAffairs && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 font-bold border border-red-500/20">
                Current Affairs
              </span>
            )}
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFlag}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                flaggedQuestions[currentQ.id]
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-[#162033] border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Flag for later review"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">
                {flaggedQuestions[currentQ.id] ? "Flagged" : "Flag"}
              </span>
            </button>

            <button
              onClick={() => onAskBoltQuestion(currentQ)}
              className="p-2 sm:px-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              title="Ask Bolt about this question"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Ask Bolt</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
            {currentQ.questionText}
          </p>

          {/* Formatted Statements (if any, matching screenshot 4) */}
          {currentQ.statements && currentQ.statements.length > 0 && (
            <div className="space-y-2 p-4 rounded-xl bg-[#162033] border border-slate-800 text-sm text-slate-200">
              {currentQ.statements.map((stmt, sIdx) => (
                <div key={sIdx} className="flex items-start space-x-2.5">
                  <span className="font-bold text-blue-400 flex-shrink-0">
                    {sIdx + 1}.
                  </span>
                  <span>{stmt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options List (A, B, C, D) */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isThisOptionCorrect = opt.key === currentQ.correctOption;

            let optionStyles = "bg-[#162033] border-slate-800 text-slate-200 hover:bg-slate-800/80";

            if (isRevealed) {
              if (isThisOptionCorrect) {
                optionStyles = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
              } else if (isSelected && !isThisOptionCorrect) {
                optionStyles = "bg-red-950/40 border-red-500/60 text-red-200 font-semibold ring-1 ring-red-500/40";
              } else {
                optionStyles = "bg-[#162033]/50 border-slate-800/60 text-slate-400 opacity-60";
              }
            } else if (isSelected) {
              optionStyles = "bg-blue-600/30 border-blue-500 text-white font-semibold";
            }

            return (
              <button
                key={opt.key}
                onClick={() => !isRevealed && handleSelectOption(opt.key)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-xl border flex items-start space-x-3.5 transition-all text-sm ${optionStyles}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                    isRevealed
                      ? isThisOptionCorrect
                        ? "bg-emerald-500 text-white"
                        : isSelected
                        ? "bg-red-500 text-white"
                        : "bg-slate-800 text-slate-400"
                      : isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {opt.key}
                </div>
                <span className="flex-grow pt-0.5 leading-relaxed">{opt.text}</span>
                {isRevealed && isThisOptionCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                {isRevealed && isSelected && !isThisOptionCorrect && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Navigation (Matching Screenshot 4) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div>
            {!isRevealed ? (
              <button
                onClick={handleSkipAndReveal}
                className="px-4 py-2.5 rounded-xl bg-[#162033] hover:bg-[#1f2d48] text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Skip & Reveal Answer</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                {isCorrect ? (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct Answer (+2.00 Marks)</span>
                  </span>
                ) : selectedOption ? (
                  <span className="text-red-400 font-bold flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect (-0.66 Negative Marks)</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    Question Skipped (0 Marks)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-[#162033] hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Detailed Explanation Sheet (Revealed upon answer) */}
        {isRevealed && (
          <div className="mt-6 p-5 rounded-xl bg-[#0e141f] border border-blue-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Option-by-Option Explanation & Analysis</span>
              </h4>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
                Correct: Option {currentQ.correctOption}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>

            {/* Option breakdown */}
            {currentQ.optionAnalysis && currentQ.optionAnalysis.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {currentQ.optionAnalysis.map((oa, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs flex items-start space-x-2.5 ${
                      oa.isCorrect
                        ? "bg-emerald-950/30 text-emerald-200 border border-emerald-900/30"
                        : "bg-slate-900/60 text-slate-300 border border-slate-800/60"
                    }`}
                  >
                    <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-800">
                      Option {oa.optionKey}
                    </span>
                    <span className="pt-0.5">{oa.analysis}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Metadata & UPSC Relevance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">Related Concept:</span>{" "}
                {currentQ.relatedConcept}
              </div>
              <div>
                <span className="font-semibold text-slate-300">Source:</span>{" "}
                {currentQ.source}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
