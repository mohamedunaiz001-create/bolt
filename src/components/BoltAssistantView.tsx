import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
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
  ArrowDown,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  FileText,
  Bookmark,
  Calendar,
  Layers,
  Compass,
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
  AgentToolCall,
  TimetableSlot,
  StudySessionLog,
} from "../types";
import { computeBoltAppContext } from "../services/appContextService";
import { executeAgentTool, detectToolFromPrompt, BOLT_TOOL_DEFINITIONS } from "../services/boltAgentTools";
import { saveFirebaseChatMessage } from "../services/firestoreService";

interface BoltAssistantViewProps {
  user: UserProfile;
  topics: SyllabusTopic[];
  evaluations?: MainsAnswerEvaluation[];
  articles?: NewsArticle[];
  questions?: PrelimsQuestion[];
  timetableSlots?: TimetableSlot[];
  studySessions?: StudySessionLog[];
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
  timetableSlots = [],
  studySessions = [],
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
      text: `Hello ${user.name}! I am **BOLT**, your dedicated UPSC mentor and preparation companion.

I have real-time access to your entire study workspace:
- **Syllabus completion:** ${liveContext.syllabus.overallCompletion}% overall (Paper 1: ${liveContext.syllabus.paper1Completion}%, Paper 2: ${liveContext.syllabus.paper2Completion}%)
- **Critical weak units:** ${
        liveContext.syllabus.weakTopics.map((w) => `${w.name} (${w.score}%)`).join(", ") ||
        "Administrative Thought, Accountability & Control"
      }
- **Strong areas:** ${
        liveContext.syllabus.strongTopics.map((s) => `${s.name} (${s.score}%)`).join(", ") ||
        "Administrative Behaviour, Constitutional Framework"
      }
- **Practice record:** ${liveContext.prelimsPerformance.questionsAttempted} MCQs attempted • ${liveContext.prelimsPerformance.accuracyPercentage}% accuracy
- **Mains evaluations:** ${liveContext.mainsPerformance.evaluatedCount} answers evaluated (${liveContext.mainsPerformance.averageScore}/15 average)

You can ask me to:
- **Diagnose weak spots** and formulate tailored revision schedules
- **Evaluate your Mains answers** against UPSC 7-dimension rubrics
- **Generate topper model answers** with flowcharts and 2nd ARC citations
- **Navigate directly to any section** using interactive action links below

[⚡ Practice Prelims MCQs](#action:prelims) &nbsp; [📝 Evaluate Mains Answer](#action:mains) &nbsp; [📅 View Study Planner](#action:planner)`,
      timestamp: "Just now",
      mode: "public_admin",
      actionCards: [
        {
          type: "topic",
          title: "Public Administration Diagnostic",
          description: "Analyze your knowledge level in Administrative Thought (Herbert Simon & Max Weber)",
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
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [pendingSensitiveAction, setPendingSensitiveAction] = useState<{
    toolName: string;
    args: Record<string, any>;
    prompt: string;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottom(isScrolledUp);
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

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "m-" + Date.now(),
        role: "assistant",
        text: `Chat cleared. Ready for a new discussion! What would you like to explore regarding your UPSC preparation?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
      },
    ]);
  };

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
      // 1. Tool-Calling Check: Check if prompt warrants controlled agent tool execution
      const detected = detectToolFromPrompt(query);
      let executedToolCall: AgentToolCall | undefined;

      if (detected) {
        const toolDef = BOLT_TOOL_DEFINITIONS.find((t) => t.name === detected.name);
        if (toolDef?.permissionLevel === "sensitive") {
          setPendingSensitiveAction({
            toolName: detected.name,
            args: detected.args,
            prompt: toolDef.confirmationPrompt || `Confirm execution of ${detected.name}?`,
          });
          setIsLoading(false);
          return;
        }

        try {
          const toolRes = await executeAgentTool(detected.name, detected.args, {
            user,
            topics,
            evaluations,
            articles,
            questions,
            mcqAttempts: [],
            onNavigateTab,
          });

          executedToolCall = {
            id: `call-${Date.now()}`,
            name: detected.name,
            arguments: detected.args,
            result: toolRes.result,
            status: "success",
          };
        } catch (tErr) {
          console.warn("Tool execution error:", tErr);
        }
      }

      // Re-compute fresh live context on each message to ensure 100% sync
      const freshContext = computeBoltAppContext(user, topics, evaluations, articles, questions);

      const sessionToken = localStorage.getItem("bolt_auth_token");
      const authHeaders: Record<string, string> = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};

      const response = await fetch("/api/bolt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-14).map((m) => ({
            role: m.role,
            text: m.text,
            name: m.role === "assistant" ? "BOLT" : (user.name || "Student"),
          })),
          mode,
          user,
          topics,
          evaluations,
          articles,
          timetableSlots,
          studySessions,
          modelId: activeModelConfig?.selectedModelId || "gemini-3.8-flash",
          modelType: activeModelConfig?.modelType || "cloud",
          localEndpoint: activeModelConfig?.localEndpoint || "http://localhost:11434",
          activeAdapter: activeModelConfig?.activeAdapter,
          temperature: activeModelConfig?.temperature ?? 0.7,
          appContext: freshContext,
          toolExecution: executedToolCall ? { name: executedToolCall.name, result: executedToolCall.result } : undefined,
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
      const isFallback = Boolean(data.isFallback || data.status === "AI_FALLBACK");
      const assistantMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        text: data.response || "I am analyzing your request. Please ask again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
        status: (data.status as any) || (isFallback ? "AI_FALLBACK" : "AI_SUCCESS"),
        isFallback,
        engine: data.engine,
        citations: data.citations || [],
        toolCalls: executedToolCall ? [executedToolCall] : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to Firestore if authenticated
      if (user.id && !user.id.startsWith("guest")) {
        saveFirebaseChatMessage(user.id, userMsg).catch(() => {});
        saveFirebaseChatMessage(user.id, assistantMsg).catch(() => {});
      }
    } catch (error) {
      console.error("Bolt chat error:", error);
      const fallbackMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        text: `⚠️ **BOLT is currently offline. Your study records and metrics remain securely saved.**\n\n### ⚡ Offline Guidance for: "${query}"\n\n1. **Theoretical Foundation (Paper 1):**\nAnchor your conceptual reasoning in classical vs behavioural paradigms (Herbert Simon's Bounded Rationality, Chester Barnard's informal organization).\n\n2. **Indian Administrative Reality (Paper 2):**\nCross-reference with Constitutional Articles (Art 311 for civil service safeguards, Art 243 for local devolution) and 2nd ARC recommendations (Report 4 on Ethics and Report 10 on Personnel Administration).\n\n3. **Recommended Actions:**\n- [⚡ Practice Prelims MCQs](#action:prelims)\n- [📝 Evaluate Mains Answer](#action:mains)\n- [📅 View Timetable & Schedule](#action:planner)`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
        status: "AI_UNAVAILABLE",
        isFallback: true,
        engine: "Bolt Offline Heuristic Fallback",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "Analyze my weak areas",
      prompt: "Analyze my Public Administration syllabus progress, topic knowledge scores, and critical weak units.",
    },
    {
      label: "Why am I weak in Thinkers?",
      prompt: "Why is my knowledge score in Administrative Thought low, and what specific steps should I take?",
    },
    {
      label: "Model Answer: Herbert Simon",
      prompt: "Give me a 15-marker UPSC Mains model answer for Herbert Simon's Bounded Rationality with diagram and 2nd ARC citations.",
    },
    {
      label: "7-Day Targeted Study Plan",
      prompt: "Create a 7-day personalized revision timetable targeting my weakest units in Paper 1 and Paper 2.",
    },
    {
      label: "Today's UPSC Current Affairs",
      prompt: "Summarize today's top editorial developments with 3 Prelims facts and 2 Mains Public Administration dimensions.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 h-[calc(100vh-4.5rem)] flex flex-col relative">
      {/* Mentor Header & Mode Switcher */}
      <div className="bg-[#111723] rounded-2xl border border-[#1e293b] p-3 sm:p-4 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-base sm:text-lg font-['Outfit'] flex items-center gap-1.5">
                <span>BOLT AI</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active & Connected</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs truncate sm:whitespace-normal">
              Context-aware UPSC preparation assistant with live access to your syllabus & performance data.
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center space-x-2 self-start sm:self-center flex-wrap gap-y-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#162033] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <div className="flex items-center space-x-1 bg-[#162033] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode("public_admin")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                mode === "public_admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pub Admin</span>
            </button>
            <button
              onClick={() => setMode("general")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
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
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin"
      >
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
                className={`max-w-[90%] sm:max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 leading-relaxed shadow-sm relative group ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-[#111723] text-slate-200 border border-[#1e293b] rounded-tl-none"
                }`}
              >
                {/* Fallback Warning Badge */}
                {!isUser && msg.isFallback && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span>
                      {msg.status === "AI_UNAVAILABLE"
                        ? "Offline Fallback: AI service unreachable. Showing deterministic syllabus guidance."
                        : `Offline Academic Rule-Base: ${msg.engine || "Deterministic syllabus heuristic"}`}
                    </span>
                  </div>
                )}

                {/* Agent Tool Execution Badge */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 pb-2">
                    {msg.toolCalls.map((tc) => {
                      const insight = (tc.result as any)?.traceInsight;
                      return (
                        <div
                          key={tc.id}
                          className="p-3 rounded-xl bg-[#0d1525] border border-blue-500/40 text-[11px] shadow-sm"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-blue-200">
                                {insight?.headline || `⚡ Verified Tool Execution: ${tc.name}`}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Live App Data</span>
                            </span>
                          </div>

                          {insight?.bullets && (
                            <div className="mt-2 space-y-1">
                              {insight.bullets.map((b: string, bIdx: number) => (
                                <div key={bIdx} className="flex items-start space-x-1.5 text-slate-300 text-[11px]">
                                  <span className="text-emerald-400 font-bold">✓</span>
                                  <span>{b.replace(/^✓\s*/, "")}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {insight?.findings && insight.findings.length > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-[11px]">
                              <div className="font-semibold text-red-300 mb-1">Deficits requiring attention:</div>
                              {insight.findings.map((f: string, fIdx: number) => (
                                <div key={fIdx} className="text-red-200">• {f}</div>
                              ))}
                            </div>
                          )}

                          {insight?.recommendation && (
                            <div className="mt-2 text-blue-300 italic text-[11px]">
                              💡 {insight.recommendation}
                            </div>
                          )}

                          <details className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                            <summary className="cursor-pointer hover:text-slate-200 flex items-center gap-1 font-medium">
                              <span>View technical analysis</span>
                              <ChevronDown className="w-3 h-3" />
                            </summary>
                            <pre className="mt-1.5 p-2 bg-black/60 rounded text-[9px] font-mono text-slate-300 overflow-x-auto max-h-36">
                              {JSON.stringify(tc.result, null, 2)}
                            </pre>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rich Markdown Rendered Body */}
                <div className="markdown-body text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2.5">
                  <Markdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-base sm:text-lg font-bold text-white mt-3.5 mb-1.5 pb-1 border-b border-slate-700/60">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm sm:text-base font-bold text-blue-200 mt-3 mb-1">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xs sm:text-sm font-bold text-amber-300 mt-2.5 mb-1">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 mb-0.5">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => <p className="mb-2 leading-relaxed text-slate-200">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-slate-200">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-slate-200">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                      em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-blue-500/80 pl-3 py-1 my-2 bg-blue-950/20 rounded-r-lg text-slate-300 text-xs italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({ inline, children, ...props }: any) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="block p-3 rounded-xl bg-[#0b101b] border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto my-2" {...props}>
                            {children}
                          </code>
                        ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3 rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs border-collapse">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-[#162033] text-slate-200 border-b border-slate-700/60">{children}</thead>,
                      th: ({ children }) => <th className="p-2 font-semibold text-slate-100">{children}</th>,
                      td: ({ children }) => <td className="p-2 border-b border-slate-800/60 text-slate-300">{children}</td>,
                      a: ({ href, children }) => {
                        if (href && href.startsWith("#action:")) {
                          const actionTab = href.replace("#action:", "") as NavigationTab;
                          return (
                            <button
                              type="button"
                              onClick={() => onNavigateTab(actionTab)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 mx-0.5 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 hover:text-white font-medium text-xs transition-all cursor-pointer shadow-sm"
                            >
                              <span>{children}</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            </button>
                          );
                        }
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline inline-flex items-center gap-0.5 font-medium"
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </Markdown>
                </div>

                {/* Verified RAG Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Verified Knowledge Sources ({msg.citations.length})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">High Confidence RAG</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, cIdx) => {
                        const isCurrentAffairs =
                          cite.category?.toLowerCase().includes("current") ||
                          cite.documentTitle?.toLowerCase().includes("pib") ||
                          cite.documentTitle?.toLowerCase().includes("hindu");
                        const isUploaded =
                          cite.category?.toLowerCase().includes("upload") ||
                          cite.category?.toLowerCase().includes("custom");

                        return (
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
                            <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                              <span className="inline-flex items-center gap-1 font-semibold text-blue-300">
                                {isUploaded ? (
                                  <>
                                    <FileText className="w-3 h-3 text-indigo-400" />
                                    <span>📄 Uploaded material</span>
                                  </>
                                ) : isCurrentAffairs ? (
                                  <>
                                    <Globe className="w-3 h-3 text-cyan-400" />
                                    <span>🌐 Current-affairs source</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-3 h-3 text-amber-400" />
                                    <span>📚 UPSC/PYQ Canon</span>
                                  </>
                                )}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {cite.category}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional Action Cards */}
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

                {/* Message Footer: Timestamp & Copy Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-70 hover:opacity-100 flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-opacity"
                        title="Copy message text"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <span className={isUser ? "text-blue-200" : "text-slate-400"}>{msg.timestamp}</span>
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
              <span>Bolt is synthesizing UPSC syllabus & your latest metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-28 right-6 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xl border border-blue-400/30 transition-all transform hover:scale-105 active:scale-95"
          title="Scroll to latest message"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>Latest message</span>
        </button>
      )}

      {/* Sensitive Action Confirmation Dialog */}
      {pendingSensitiveAction && (
        <div className="mb-2 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn flex-shrink-0">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-200">Confirmation Required for Sensitive Action</h4>
              <p className="text-[11px] text-slate-300">{pendingSensitiveAction.prompt}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => setPendingSensitiveAction(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const action = pendingSensitiveAction;
                setPendingSensitiveAction(null);
                try {
                  const toolRes = await executeAgentTool(action.toolName, action.args, {
                    user,
                    topics,
                    evaluations,
                    articles,
                    questions,
                    mcqAttempts: [],
                    onNavigateTab,
                  });
                  const confMsg: ChatMessage = {
                    id: "c-" + Date.now(),
                    role: "assistant",
                    text: `✅ **Action Confirmed and Completed**: ${toolRes.summary}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  };
                  setMessages((prev) => [...prev, confMsg]);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto flex items-center space-x-2 flex-shrink-0 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-[#162033] hover:bg-[#1f2d48] border border-slate-800 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors flex items-center space-x-1.5 flex-shrink-0"
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
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors shadow-md shadow-blue-600/30 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
