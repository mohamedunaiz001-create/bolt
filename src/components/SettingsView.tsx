import React, { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Cpu,
  Server,
  Activity,
  ShieldCheck,
  Database,
  Sliders,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Laptop,
  User,
  Moon,
  Sun,
  Flame,
  Sparkles,
  Terminal,
  Play,
  Check,
  Clock,
  Radio,
  Info,
  ChevronRight,
  Layers,
  Award,
  Brain,
} from "lucide-react";
import {
  UserProfile,
  ActiveModelConfig,
  LaptopSpecs,
  AppThemeMode,
  NavigationTab,
} from "../types";
import {
  AVAILABLE_MODELS,
  DEFAULT_LAPTOP_SPECS,
  DEFAULT_ACTIVE_MODEL_CONFIG,
  calculateHardwareRecommendation,
} from "../data/modelsData";

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  activeModelConfig: ActiveModelConfig;
  onUpdateActiveModelConfig: (config: ActiveModelConfig) => void;
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  themeMode?: AppThemeMode;
  onToggleTheme?: (mode?: AppThemeMode) => void;
  onNavigate?: (tab: NavigationTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  activeModelConfig,
  onUpdateActiveModelConfig,
  onOpenAuth,
  themeMode = "dark",
  onToggleTheme,
  onNavigate,
}) => {
  const [activeSection, setActiveSection] = useState<
    "ai_models" | "hardware" | "profile" | "appearance" | "dataset_pipeline"
  >("ai_models");

  // Local state for active model config
  const [localConfig, setLocalConfig] = useState<ActiveModelConfig>(
    activeModelConfig || DEFAULT_ACTIVE_MODEL_CONFIG
  );

  // Live AI Ping State
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    connected: boolean;
    latencyMs?: number;
    message: string;
    model?: string;
    provider?: string;
    timestamp?: string;
  } | null>(null);

  // Hardware Specs State
  const [specs, setSpecs] = useState<LaptopSpecs>(() => {
    try {
      const saved = localStorage.getItem("bolt_laptop_specs");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LAPTOP_SPECS;
  });

  // User Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user.name || "Aspirant",
    target: user.target || "UPSC CSE 2026",
    optionalSubject: user.optionalSubject || "Public Administration",
    dailyStudyHoursGoal: user.dailyStudyHoursGoal || 6,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Real backend dataset & training pipeline items
  const [datasetItems, setDatasetItems] = useState<any[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<any[]>([]);
  const [registeredModels, setRegisteredModels] = useState<any[]>([]);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (activeModelConfig) {
      setLocalConfig(activeModelConfig);
    }
  }, [activeModelConfig]);

  // Load pipeline data when navigating to dataset_pipeline tab
  useEffect(() => {
    if (activeSection === "dataset_pipeline") {
      setIsLoadingPipeline(true);
      Promise.all([
        fetch("/api/ai/dataset/items").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/ai/training/jobs").then((r) => r.json()).catch(() => ({ jobs: [] })),
        fetch("/api/ai/registry/models").then((r) => r.json()).catch(() => ({ models: [] })),
      ])
        .then(([datasetRes, jobsRes, modelsRes]) => {
          if (datasetRes.success && Array.isArray(datasetRes.items)) setDatasetItems(datasetRes.items);
          if (jobsRes.success && Array.isArray(jobsRes.jobs)) setTrainingJobs(jobsRes.jobs);
          if (modelsRes.success && Array.isArray(modelsRes.models)) setRegisteredModels(modelsRes.models);
        })
        .finally(() => setIsLoadingPipeline(false));
    }
  }, [activeSection]);

  const handleConfigChange = (updates: Partial<ActiveModelConfig>) => {
    const next = { ...localConfig, ...updates };
    setLocalConfig(next);
    onUpdateActiveModelConfig(next);
    try {
      localStorage.setItem("bolt_active_model_config", JSON.stringify(next));
    } catch {}

    // Sync to backend gateway config if changed
    fetch("/api/ai/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cloudModelId: next.selectedModelId,
        localEndpoint: next.localEndpoint,
        temperature: next.temperature,
        contextWindow: next.contextWindowTokens,
        provider: next.modelType === "local" ? "local" : "cloud",
      }),
    }).catch(console.error);
  };

  const handleRunPingTest = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: localConfig.selectedModelId,
          modelType: localConfig.modelType,
          localEndpoint: localConfig.localEndpoint,
        }),
      });
      const data = await res.json();
      setPingResult(data);
    } catch (err: any) {
      setPingResult({
        success: false,
        connected: false,
        message: err?.message || "Failed to reach AI diagnostic service",
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: profileForm.name.trim() || "Aspirant",
      target: profileForm.target.trim() || "UPSC CSE 2026",
      optionalSubject: profileForm.optionalSubject.trim() || "Public Administration",
      dailyStudyHoursGoal: Number(profileForm.dailyStudyHoursGoal) || 6,
    };
    onUpdateUser(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const hardwareRec = calculateHardwareRecommendation(specs);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1e293b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                System & AI Model Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Configure Gemini models, deliberation parameters, UPSC rubrics, and offline inference
              </p>
            </div>
          </div>

          {/* Quick Latency / Status Badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunPingTest}
              disabled={isPinging}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
              <span>{isPinging ? "Testing Connection..." : "Test AI Model Ping"}</span>
            </button>
          </div>
        </div>

        {/* Live Ping Notification Banner if Tested */}
        {pingResult && (
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 text-xs animate-in fade-in slide-in-from-top-2 ${
              pingResult.connected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            {pingResult.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {pingResult.connected ? "AI Connection Operational" : "AI Connection Notice"}
                </span>
                {pingResult.latencyMs !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {pingResult.latencyMs}ms Latency
                  </span>
                )}
              </div>
              <p className="text-slate-300">{pingResult.message}</p>
              <p className="text-[11px] text-slate-400">
                Model: <span className="font-mono text-white">{localConfig.selectedModelId}</span> • Provider: {localConfig.modelType === "cloud" ? "Google Gemini Cloud" : "Local Open-Weight"}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-[#111624] rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setActiveSection("ai_models")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === "ai_models"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>AI Model & Deliberation</span>
          </button>

          <button
            onClick={() => setActiveSection("hardware")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === "hardware"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Laptop & Hardware Advisor</span>
          </button>

          <button
            onClick={() => setActiveSection("profile")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === "profile"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <User className="w-4 h-4 text-purple-400" />
            <span>Aspirant Profile</span>
          </button>

          <button
            onClick={() => setActiveSection("appearance")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === "appearance"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveSection("dataset_pipeline")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === "dataset_pipeline"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Dataset & Fine-Tuning Pipeline</span>
          </button>
        </div>

        {/* SECTION 1: AI MODELS & DELIBERATION */}
        {activeSection === "ai_models" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Active Model Cards */}
            <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>Select Foundation Model</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Switch between flagship Gemini cloud models and local offline architectures
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Active: {localConfig.selectedModelId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = localConfig.selectedModelId === model.id;
                  const isCloud = model.type === "cloud";

                  return (
                    <div
                      key={model.id}
                      onClick={() =>
                        handleConfigChange({
                          selectedModelId: model.id,
                          modelType: model.type,
                          huggingFaceModelId: model.huggingFaceModelId,
                          ollamaModelTag: model.ollamaModelTag,
                        })
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "bg-gradient-to-b from-blue-900/30 to-[#121929] border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "bg-[#141b2a]/70 border-[#222f46] hover:border-slate-600 hover:bg-[#182133]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              isCloud
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isCloud ? "Cloud (Gemini)" : "Local / Offline"}
                          </span>
                          {isSelected && (
                            <span className="flex items-center space-x-1 text-[11px] font-bold text-blue-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-white">{model.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {model.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                        <div className="flex justify-between">
                          <span>Context Window:</span>
                          <span className="text-slate-300 font-mono">{model.contextWindow}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>UPSC Role:</span>
                          <span className="text-slate-300 font-medium">
                            {model.strengths?.[0] || "General Analysis"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inference Routing & Local Daemon Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Routing Mode */}
              <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Inference Routing Strategy</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      id: "cloud",
                      title: "Cloud First (Google Gemini)",
                      desc: "Instant responses, 1M context tokens, zero local RAM usage",
                    },
                    {
                      id: "local",
                      title: "Local First (Ollama / On-Device)",
                      desc: "Complete data privacy, works fully offline with open weights",
                    },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      onClick={() => handleConfigChange({ modelType: mode.id as "cloud" | "local" })}
                      className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        localConfig.modelType === mode.id
                          ? "bg-purple-900/20 border-purple-500/60 ring-1 ring-purple-500/40"
                          : "bg-[#141b2a]/50 border-[#222f46] hover:bg-[#182133]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="modelType"
                        checked={localConfig.modelType === mode.id}
                        onChange={() => {}}
                        className="mt-1 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{mode.title}</p>
                        <p className="text-[11px] text-slate-400">{mode.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {localConfig.modelType === "local" && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Ollama Local Daemon URL:
                    </label>
                    <input
                      type="text"
                      value={localConfig.localEndpoint || "http://localhost:11434"}
                      onChange={(e) => handleConfigChange({ localEndpoint: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Run <code className="text-emerald-400">ollama serve</code> on your terminal to connect.
                    </p>
                  </div>
                )}
              </div>

              {/* Reasoning Deliberation Budget */}
              <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>Reasoning & Deliberation Depth</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      id: "fast",
                      title: "Fast / Direct Drill (0 Deliberation)",
                      desc: "Instant answers, recommended for rapid Prelims MCQ drilling",
                    },
                    {
                      id: "balanced",
                      title: "Balanced Reasoning (Recommended)",
                      desc: "Step-by-step conceptual justification and structured synthesis",
                    },
                    {
                      id: "deep",
                      title: "Deep Mains Deliberation",
                      desc: "Multidimensional arguments, thinker dialectics & 2nd ARC integration",
                    },
                  ].map((level) => (
                    <label
                      key={level.id}
                      onClick={() =>
                        handleConfigChange({
                          reasoningDeliberation: level.id as "fast" | "balanced" | "deep",
                        })
                      }
                      className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        (localConfig.reasoningDeliberation || "balanced") === level.id
                          ? "bg-emerald-900/20 border-emerald-500/60 ring-1 ring-emerald-500/40"
                          : "bg-[#141b2a]/50 border-[#222f46] hover:bg-[#182133]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliberation"
                        checked={(localConfig.reasoningDeliberation || "balanced") === level.id}
                        onChange={() => {}}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{level.title}</p>
                        <p className="text-[11px] text-slate-400">{level.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Hyperparameters & UPSC Evaluator Persona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature & Token Controls */}
              <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Temperature & Generation Parameters</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">Temperature (Creativity vs Factual Precision):</span>
                      <span className="font-mono text-amber-400 font-bold">{localConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={localConfig.temperature}
                      onChange={(e) => handleConfigChange({ temperature: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0.1 (Strict Facts / Prelims)</span>
                      <span>0.7 (Mains Synthesis)</span>
                      <span>1.0 (Creative Essays)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">Context Window Allocation:</span>
                      <span className="font-mono text-blue-400 font-bold">
                        {localConfig.contextWindowTokens?.toLocaleString()} Tokens
                      </span>
                    </div>
                    <select
                      value={localConfig.contextWindowTokens || 32768}
                      onChange={(e) => handleConfigChange({ contextWindowTokens: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="8192">8,192 Tokens (Fast Prelims Memory)</option>
                      <option value="16384">16,384 Tokens (Balanced Mains Memory)</option>
                      <option value="32768">32,768 Tokens (Extended Syllabus Memory - Default)</option>
                      <option value="65536">65,536 Tokens (Comprehensive Multi-Unit Memory)</option>
                      <option value="131072">131,072 Tokens (Full Book / RAG Synthesis)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* UPSC Academic Persona */}
              <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>UPSC Mentor & Evaluator Persona</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      id: "strict_upsc",
                      title: "Strict 2nd ARC Evaluator",
                      desc: "Demands precise structural formatting, committee reports & constitutional articles",
                    },
                    {
                      id: "socratic_prelims",
                      title: "Socratic Prelims Drillmaster",
                      desc: "Focuses on elimination techniques, statement traps & PYQ trend patterns",
                    },
                    {
                      id: "pubadmin_specialist",
                      title: "Public Administration Specialist",
                      desc: "Grounds every response in core thinkers: Wilson, Weber, Simon, Waldo, NPM",
                    },
                    {
                      id: "comprehensive_mentor",
                      title: "Comprehensive GS Civil Servant",
                      desc: "Holistic policy perspectives across Governance, Economy, Environment & Ethics",
                    },
                  ].map((persona) => (
                    <label
                      key={persona.id}
                      onClick={() =>
                        handleConfigChange({
                          evaluatorPersona: persona.id as any,
                        })
                      }
                      className={`flex items-start space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        (localConfig.evaluatorPersona || "strict_upsc") === persona.id
                          ? "bg-indigo-900/20 border-indigo-500/60 ring-1 ring-indigo-500/40"
                          : "bg-[#141b2a]/50 border-[#222f46] hover:bg-[#182133]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="persona"
                        checked={(localConfig.evaluatorPersona || "strict_upsc") === persona.id}
                        onChange={() => {}}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{persona.title}</p>
                        <p className="text-[10px] text-slate-400">{persona.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HARDWARE ADVISOR */}
        {activeSection === "hardware" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>Hardware & Laptop Spec Analyzer</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Input your machine specs to calculate whether on-device LLMs or Google Gemini Cloud is optimal
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Architecture / OS</label>
                  <select
                    value={specs.deviceType}
                    onChange={(e) => {
                      const next = { ...specs, deviceType: e.target.value as any };
                      setSpecs(next);
                      localStorage.setItem("bolt_laptop_specs", JSON.stringify(next));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                  >
                    <option value="mac_apple_silicon">Mac (Apple Silicon M1/M2/M3/M4)</option>
                    <option value="windows_nvidia">Windows + NVIDIA GPU (CUDA)</option>
                    <option value="windows_intel">Windows (Intel / AMD CPU only)</option>
                    <option value="linux_cuda">Linux Workstation (CUDA)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Total System RAM (GB)</label>
                  <select
                    value={specs.totalRamGb}
                    onChange={(e) => {
                      const next = { ...specs, totalRamGb: Number(e.target.value) };
                      setSpecs(next);
                      localStorage.setItem("bolt_laptop_specs", JSON.stringify(next));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                  >
                    <option value="8">8 GB RAM</option>
                    <option value="16">16 GB RAM (Standard)</option>
                    <option value="24">24 GB RAM</option>
                    <option value="32">32 GB RAM</option>
                    <option value="64">64 GB+ RAM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dedicated VRAM (GB)</label>
                  <select
                    value={specs.vramGb}
                    onChange={(e) => {
                      const next = { ...specs, vramGb: Number(e.target.value) };
                      setSpecs(next);
                      localStorage.setItem("bolt_laptop_specs", JSON.stringify(next));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                  >
                    <option value="0">0 GB (Unified Memory or CPU)</option>
                    <option value="4">4 GB (RTX 3050)</option>
                    <option value="6">6 GB (RTX 3060 Laptop)</option>
                    <option value="8">8 GB (RTX 4060 / 3070)</option>
                    <option value="12">12 GB+ (RTX 4070 / 4080)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Available SSD Free (GB)</label>
                  <input
                    type="number"
                    value={specs.storageFreeGb}
                    onChange={(e) => {
                      const next = { ...specs, storageFreeGb: Number(e.target.value) };
                      setSpecs(next);
                      localStorage.setItem("bolt_laptop_specs", JSON.stringify(next));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                  />
                </div>
              </div>

              {/* Hardware Recommendation Result */}
              <div className="p-4 rounded-xl bg-[#141b2a] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Hardware Analysis Result</span>
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                    Fit: {hardwareRec.fitLevel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{hardwareRec.headline}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{hardwareRec.reason}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Est. Throughput:</span>
                    <p className="font-bold text-emerald-400 font-mono">
                      ~{hardwareRec.expectedTokensPerSec} tok/sec
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Weight Footprint:</span>
                    <p className="font-bold text-slate-200 font-mono">
                      {hardwareRec.memoryBudget.modelWeightsGb} GB
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">KV Cache Buffer:</span>
                    <p className="font-bold text-slate-200 font-mono">
                      {hardwareRec.memoryBudget.kvCacheGb} GB
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Total Required:</span>
                    <p className="font-bold text-slate-200 font-mono">
                      {hardwareRec.memoryBudget.totalRequiredGb} GB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ASPIRANT PROFILE */}
        {activeSection === "profile" && (
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-400" />
                <span>Aspirant Profile & Study Preferences</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage your candidate name, optional subject, target UPSC year, and daily hours
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Aspirant Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target UPSC CSE Year</label>
                <select
                  value={profileForm.target}
                  onChange={(e) => setProfileForm({ ...profileForm, target: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                >
                  <option value="UPSC CSE 2025">UPSC CSE 2025</option>
                  <option value="UPSC CSE 2026">UPSC CSE 2026</option>
                  <option value="UPSC CSE 2027">UPSC CSE 2027</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Optional Subject</label>
                <select
                  value={profileForm.optionalSubject}
                  onChange={(e) => setProfileForm({ ...profileForm, optionalSubject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white"
                >
                  <option value="Public Administration">Public Administration</option>
                  <option value="Political Science & IR (PSIR)">Political Science & IR (PSIR)</option>
                  <option value="Geography">Geography</option>
                  <option value="Sociology">Sociology</option>
                  <option value="History">History</option>
                  <option value="Anthropology">Anthropology</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Daily Study Hours Target</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={profileForm.dailyStudyHoursGoal}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, dailyStudyHoursGoal: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#141b2a] border border-[#222f46] text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                >
                  Save Profile Changes
                </button>
                {profileSaved && (
                  <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* SECTION 4: APPEARANCE */}
        {activeSection === "appearance" && (
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Appearance & Reading Theme</span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose the visual reading mode best suited for your study sessions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div
                onClick={() => onToggleTheme?.("dark")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  themeMode === "dark"
                    ? "bg-slate-900 border-blue-500 ring-2 ring-blue-500/30"
                    : "bg-[#141b2a]/50 border-[#222f46] hover:bg-[#182133]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">High-Contrast Dark</span>
                  </div>
                  {themeMode === "dark" && <Check className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Engineered for nocturnal deep-work, low glare, and high OLED battery efficiency.
                </p>
              </div>

              <div
                onClick={() => onToggleTheme?.("light")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  themeMode === "light"
                    ? "bg-slate-800 border-amber-500 ring-2 ring-amber-500/30"
                    : "bg-[#141b2a]/50 border-[#222f46] hover:bg-[#182133]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Light Reading Mode</span>
                  </div>
                  {themeMode === "light" && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Paper-like readability suited for daytime study, newspaper editorial analysis, and long documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: DATASET & FINE-TUNING PIPELINE */}
        {activeSection === "dataset_pipeline" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0f1422] p-5 rounded-2xl border border-[#1e293b] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Instruction Dataset Builder & Fine-Tuning Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real backend QLoRA training queue and curated instruction-tuning QA pairs
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsLoadingPipeline(true);
                    Promise.all([
                      fetch("/api/ai/dataset/items").then((r) => r.json()),
                      fetch("/api/ai/training/jobs").then((r) => r.json()),
                      fetch("/api/ai/registry/models").then((r) => r.json()),
                    ])
                      .then(([d, j, m]) => {
                        if (d.items) setDatasetItems(d.items);
                        if (j.jobs) setTrainingJobs(j.jobs);
                        if (m.models) setRegisteredModels(m.models);
                      })
                      .finally(() => setIsLoadingPipeline(false));
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#151d2c] hover:bg-[#1c273a] text-slate-300 text-xs border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPipeline ? "animate-spin" : ""}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {/* Training Jobs Queue */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active QLoRA Background Jobs ({trainingJobs.length})
                </h3>
                {trainingJobs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#141b2a] border border-[#222f46] text-xs text-slate-400 text-center">
                    No active background training jobs in queue. The system is operating in live inference mode.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trainingJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-xl bg-[#141b2a] border border-[#222f46] flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white">{job.adapterName || job.modelName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                              {job.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Base Model: <span className="font-mono text-slate-300">{job.baseModel || job.baseArchitecture}</span>
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-[10px] text-slate-400">Progress:</span>
                          <p className="font-mono font-bold text-emerald-400">
                            {job.progressPercent ? `${job.progressPercent}%` : "Queued"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dataset Items Overview */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Curated Instruction-Tuning Samples ({datasetItems.length})
                </h3>
                {datasetItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#141b2a] border border-[#222f46] text-xs text-slate-400 text-center">
                    Dataset items synchronize automatically during answer evaluation and syllabus indexing.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {datasetItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#141b2a] border border-[#222f46] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{item.category}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              item.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2">{item.instruction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
