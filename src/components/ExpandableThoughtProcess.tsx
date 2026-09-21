import React, { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Landmark,
  Target,
  ArrowRight,
  Copy,
  Check,
  Lightbulb,
  Clock,
  Layers,
} from "lucide-react";
import { ReasoningPhase } from "../services/thoughtProcessService";

interface ExpandableThoughtProcessProps {
  thoughtProcess?: string;
  reasoningPhases: ReasoningPhase[];
  durationEstimateSeconds?: number;
  initiallyExpanded?: boolean;
}

export const ExpandableThoughtProcess: React.FC<ExpandableThoughtProcessProps> = ({
  thoughtProcess = "",
  reasoningPhases = [],
  durationEstimateSeconds = 2.2,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(initiallyExpanded);
  const [activeTab, setActiveTab] = useState<"steps" | "raw">("steps");
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const contentToCopy =
      thoughtProcess ||
      reasoningPhases.map((p) => `${p.phase}: ${p.title}\n${p.detail}`).join("\n\n");

    navigator.clipboard?.writeText(contentToCopy).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const getPhaseIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Brain className="w-3.5 h-3.5 text-amber-400" />;
      case 1:
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 2:
        return <Landmark className="w-3.5 h-3.5 text-purple-400" />;
      case 3:
        return <Target className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0d1424] overflow-hidden transition-all duration-200 shadow-sm">
      {/* Header bar that toggles expand / collapse */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="px-3 py-2.5 bg-gradient-to-r from-[#11192b] via-[#101726] to-[#121c30] hover:bg-[#152037] cursor-pointer flex items-center justify-between gap-2 select-none transition-colors border-b border-slate-800/80"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Brain className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>

          <div className="flex items-center space-x-2 min-w-0 flex-wrap">
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              AI Thought Process
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-medium text-[10px] whitespace-nowrap">
              {reasoningPhases.length || 5} Reasoning Phases
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>~{durationEstimateSeconds}s deliberation</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy thought process"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {hasCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <div className="flex items-center space-x-1 text-[11px] font-medium text-blue-300 hover:text-blue-200">
            <span>{isExpanded ? "Collapse" : "View reasoning"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Collapsed Preview Teaser */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1.5 bg-[#0b101c] hover:bg-[#0e1628] text-[11px] text-slate-400 flex items-center justify-between cursor-pointer border-t border-slate-900/40"
        >
          <div className="truncate flex items-center space-x-1.5">
            <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {reasoningPhases[0]
                ? `${reasoningPhases[0].title}: ${reasoningPhases[0].detail.slice(0, 75)}...`
                : "Explored intent, theoretical thinkers, constitutional articles & scoring rubrics"}
            </span>
          </div>
          <span className="text-[10px] text-blue-400 font-medium whitespace-nowrap ml-2">
            Click to expand
          </span>
        </div>
      )}

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-3 bg-[#0a0f1b] space-y-3 animate-fadeIn border-t border-slate-800/80">
          {/* Sub-header Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
            <div className="flex items-center space-x-1.5 bg-[#121927] p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("steps")}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center space-x-1.5 ${
                  activeTab === "steps"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Step-by-Step Chain</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center space-x-1.5 ${
                  activeTab === "raw"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Raw Deliberation</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-400 italic">
              Pedagogical transparency protocol
            </span>
          </div>

          {/* Tab 1: Step-by-Step Visual Reasoning Chain */}
          {activeTab === "steps" && (
            <div className="space-y-2.5">
              {reasoningPhases.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#0e1628] border border-slate-800/90 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        {getPhaseIcon(idx)}
                      </div>
                      <span className="font-semibold text-slate-200">
                        {phase.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {phase.phase}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                    {phase.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Raw Deliberation Trace */}
          {activeTab === "raw" && (
            <div className="relative">
              <pre className="p-3 bg-[#060a12] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed scrollbar-thin">
                {thoughtProcess || "No raw thought logs recorded."}
              </pre>
            </div>
          )}

          {/* Educational Callout Banner */}
          <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-200 flex items-start space-x-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Educational Value:</strong> This transparent reasoning chain exposes the exact cognitive steps BOLT used—from identifying syllabus hooks to cross-referencing thinkers and 2nd ARC recommendations—before composing your answer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
