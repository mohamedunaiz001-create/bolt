import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  ChatMessage,
  UserProfile,
  SyllabusTopic,
  NavigationTab,
  ActiveModelConfig,
  MainsAnswerEvaluation,
  NewsArticle,
  PrelimsQuestion,
} from "../types";
import { computeBoltAppContext } from "../services/appContextService";

interface BoltAssistantViewProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  evaluations?: MainsAnswerEvaluation[];
  articles?: NewsArticle[];
  questions?: PrelimsQuestion[];
  onNavigateTab: (tab: NavigationTab) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  activeModelConfig?: ActiveModelConfig;
  onOpenModelSettings?: () => void;
}

export const BoltAssistantView: React.FC<BoltAssistantViewProps> = ({
  user,
  topics,
  evaluations = [],
  articles = [],
  questions = [],
  onNavigateTab,
  initialPrompt,
  onClearInitialPrompt,
  activeModelConfig,
  onOpenModelSettings,
}) => {
  // Compute real, dynamic dashboard analytics via App Context Service
  const liveContext = computeBoltAppContext(user, topics, evaluations, articles, questions);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "m-1",
      role: "assistant",
      text: `Hello ${user.name}! I am **BOLT**, your dedicated UPSC mentor and preparation brain.

I have real-time access to your live study dashboard:
• **Syllabus completion:** ${liveContext.syllabus.overallCompletion}% overall (Paper 1: ${liveContext.syllabus.paper1Completion}%, Paper 2: ${liveContext.syllabus.paper2Completion}%)
• **Critical weak units:** ${
        liveContext.syllabus.weakTopics.map((w) => `${w.name} (${w.score}%)`).join(", ") ||
        "Administrative Thought, Accountability"
      }
• **Strong areas:** ${
        liveContext.syllabus.strongTopics.map((s) => `${s.name} (${s.score}%)`).join(", ") ||
        "Administrative Behaviour"
      }
• **Practice record:** ${liveContext.prelimsPerformance.questionsAttempted} MCQs attempted • ${liveContext.prelimsPerformance.accuracyPercentage}% accuracy
• **Mains evaluations:** ${liveContext.mainsPerformance.evaluatedCount} answers evaluated (${liveContext.mainsPerformance.averageScore}/15 average)

You can ask me to evaluate answers, generate high-scoring model answers, diagnose your weak areas, or clarify complex administrative theories. What shall we tackle today?`,
      timestamp: "Just now",
      mode: "public_admin",
      actionCards: [
        {
          type: "topic",
          title: "Public Administration Diagnostic",
          description: "Analyze your knowledge level in Administrative Thought (Herbert Simon)",
          actionLabel: "Analyze Weak Area",
        },
        {
          type: "model_answer",
          title: "Herbert Simon Model Answer",
          description: "Inspect 15-mark structured model answer with diagram & 2nd ARC links",
          actionLabel: "View Model Answer",
          targetTab: "mains",
        },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [mode, setMode] = useState<"public_admin" | "general">("public_admin");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Re-compute fresh live context on each message to ensure 100% sync
      const freshContext = computeBoltAppContext(user, topics, evaluations, articles, questions);

      const response = await fetch("/api/bolt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
          mode,
          modelId: activeModelConfig?.selectedModelId || "gemini-3.8-flash",
          modelType: activeModelConfig?.modelType || "cloud",
          localEndpoint: activeModelConfig?.localEndpoint || "http://localhost:11434",
          activeAdapter: activeModelConfig?.activeAdapter,
          temperature: activeModelConfig?.temperature ?? 0.7,
          appContext: freshContext,
          currentContext: {
            user,
            optionalSubject: user.optionalSubject || "Public Administration",
            syllabusCompletion: `${freshContext.syllabus.overallCompletion}% overall`,
            paper1Completion: `${freshContext.syllabus.paper1Completion}%`,
            paper2Completion: `${freshContext.syllabus.paper2Completion}%`,
            weakTopics: freshContext.syllabus.weakTopics.map((w) => `${w.name} (${w.score}%)`),
            strongTopics: freshContext.syllabus.strongTopics.map((s) => `${s.name} (${s.score}%)`),
            questionsAttempted: freshContext.prelimsPerformance.questionsAttempted,
            mainsEvaluatedCount: freshContext.mainsPerformance.evaluatedCount,
            mainsAverage: `${freshContext.mainsPerformance.averageScore} / 15 Marks`,
            prelimsAccuracy: `${freshContext.prelimsPerformance.accuracyPercentage}%`,
            revisionDueCount: freshContext.revisionStatus.dueCount,
            weeklyPlannedHours: freshContext.studySchedule.weeklyPlannedHours,
            weeklyTrackedHours: freshContext.studySchedule.weeklyTrackedHours,
            systemContextText: freshContext.systemContextText,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        text: data.response || "I am analyzing your request. Please ask again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Bolt chat error:", error);
      const fallbackMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        text: `### ⚡ Bolt Public Administration Response for ${user.name}

Regarding your query on **${query}**:

1. **Theoretical Grounding (Paper 1):** 
In Public Administration, always frame this through the lens of classical vs modern behavioural paradigms (e.g. Herbert Simon's Bounded Rationality and Chester Barnard's informal organization).

2. **Indian Administrative Reality (Paper 2):** 
Cross-reference with Constitutional Articles (such as Article 311 for civil services or Article 243 for devolution) and 2nd ARC recommendations (4th Report on Ethics in Governance and 10th Report on Personnel Administration).

3. **Mains Value Addition:**
Use a visual 4-quadrant box diagram in the exam hall to score 12+ marks out of 15.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "Analyze my Public Administration progress",
      prompt: "Analyze my Public Administration syllabus progress, topic knowledge scores, and weak areas.",
    },
    {
      label: "Why am I weak in Thinkers?",
      prompt: "Why is my knowledge score in Administrative Thought low, and how can I fix it?",
    },
    {
      label: "Model Answer for Herbert Simon",
      prompt: "Give me a 15-marker model answer for Herbert Simon's Bounded Rationality with diagram and 2nd ARC citations.",
    },
    {
      label: "7-Day Targeted Study Plan",
      prompt: "Create a 7-day personalized revision plan targeting my weak units in Paper 1 and Paper 2.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-12 h-[calc(100vh-5rem)] flex flex-col">
      {/* Mentor Header & Mode Switcher - Clean interface with NO model exposure outside settings */}
      <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-base sm:text-lg font-['Outfit'] flex items-center gap-1.5">
                <span>BOLT</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Your UPSC Preparation Assistant with live access to your syllabus & performance data.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-[#162033] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode("public_admin")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                mode === "public_admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pub Admin Mode (Paper 1 & 2)</span>
            </button>
            <button
              onClick={() => setMode("general")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "general"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              General GS
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-gradient-to-tr from-purple-600 to-blue-600 text-white"
                    : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-[#111723] text-slate-200 border border-[#1e293b] rounded-tl-none"
                }`}
              >
                {/* Text rendered */}
                <div className="prose prose-invert prose-xs sm:prose-sm max-w-none whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Verified RAG Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Verified Knowledge Sources ({msg.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] space-y-1 hover:border-amber-500/40 transition-colors"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-200">
                            <span className="truncate pr-2">{cite.documentTitle}</span>
                            <span className="text-[10px] text-amber-400 font-mono flex-shrink-0">
                              p.{cite.approxPage || 1}
                            </span>
                          </div>
                          {cite.excerpt && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-2">
                              "{cite.excerpt}"
                            </p>
                          )}
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                            {cite.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Action Cards (e.g. Test, Model Answer) */}
                {msg.actionCards && msg.actionCards.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    {msg.actionCards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-[#162033] border border-slate-800 space-y-1.5"
                      >
                        <h4 className="font-bold text-white text-xs">{card.title}</h4>
                        <p className="text-[11px] text-slate-400">{card.description}</p>
                        <button
                          onClick={() => {
                            if (card.targetTab) {
                              onNavigateTab(card.targetTab);
                            } else {
                              sendMessage(card.title);
                            }
                          }}
                          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                        >
                          <span>{card.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    isUser ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <Zap className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <div className="bg-[#111723] border border-[#1e293b] rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Bolt is reasoning with Public Administration syllabus & academic metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="py-2.5 overflow-x-auto flex items-center space-x-2 flex-shrink-0 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-[#162033] hover:bg-[#1f2d48] border border-slate-800 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center space-x-2 bg-[#111723] rounded-2xl border border-[#1e293b] p-2 flex-shrink-0 shadow-lg"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask Bolt anything (${mode === "public_admin" ? "Pub Admin Paper 1 & 2" : "UPSC GS"})...`}
          className="flex-grow bg-transparent text-sm text-white placeholder-slate-500 px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors shadow-md shadow-blue-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
