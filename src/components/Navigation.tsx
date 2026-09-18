import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  GraduationCap,
  BookOpen,
  Network,
  CheckSquare,
  FileText,
  Newspaper,
  Calendar,
  Clock,
  Zap,
  Bookmark,
  Settings,
  Flame,
  Search,
  LogIn,
  User,
  ChevronDown,
  Cpu,
  LogOut,
  UserPlus,
  Sun,
  Moon,
  Terminal,
  Upload,
  History,
} from "lucide-react";
import { NavigationTab, UserProfile, ActiveModelConfig, AppThemeMode } from "../types";
import { AVAILABLE_MODELS } from "../data/modelsData";

interface NavigationProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
  onOpenSearch: () => void;
  revisionDueCount: number;
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  onLogout?: () => void;
  activeModelConfig?: ActiveModelConfig;
  themeMode?: AppThemeMode;
  onToggleTheme?: (mode?: AppThemeMode) => void;
  onOpenPythonConsole?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenSettings,
  onOpenBookmarks,
  onOpenSearch,
  revisionDueCount,
  onOpenAuth,
  onLogout,
  activeModelConfig,
  themeMode = "dark",
  onToggleTheme,
  onOpenPythonConsole,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === activeModelConfig?.selectedModelId) ||
    AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d111a]/95 backdrop-blur-md border-b border-[#1e293b] px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-wider text-white font-['Outfit']">
                    BOLT
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold uppercase tracking-wider border border-blue-500/30">
                    UPSC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Public Administration & GS Hub
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#151b28] p-1 rounded-xl border border-[#232f45]">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "home"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "learn"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Syllabus & Analytics</span>
              {revisionDueCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "knowledge"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge & RAG</span>
            </button>
            <button
              onClick={() => setActiveTab("knowledgeGraph")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "knowledgeGraph"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Network className="w-3.5 h-3.5 text-blue-400" />
              <span>Knowledge Graph</span>
            </button>
            <button
              onClick={() => setActiveTab("prelims")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "prelims"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Prelims Practice</span>
            </button>
            <button
              onClick={() => setActiveTab("pyqs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "pyqs"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm ring-1 ring-amber-400/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>PYQs (1855–2026)</span>
            </button>
            <button
              onClick={() => setActiveTab("mains")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "mains"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mains</span>
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "materials"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-400/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Materials & Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab("ncert")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "ncert"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>NCERT (6-12)</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "news"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Daily News</span>
            </button>
            <button
              onClick={() => setActiveTab("planner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "planner" || activeTab === "schedule"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Study Planner & Timetable</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Settings</span>
            </button>
          </nav>

          {/* User Status, Bolt Trigger & Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Bolt AI Assistant Tab Button */}
            <button
              onClick={() => setActiveTab("bolt")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
                activeTab === "bolt"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 ring-2 ring-blue-500/40"
                  : "bg-blue-950/60 text-blue-300 border-blue-800/60 hover:bg-blue-900/80 hover:text-white"
              }`}
              title="Open Bolt AI Assistant"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-400" />
              <span>Ask Bolt</span>
            </button>

            {/* Streak Counter */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{user.studyStreakDays}d Streak</span>
            </div>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Search Topics & PYQs"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Bookmarks */}
            <button
              onClick={onOpenBookmarks}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Saved Questions & Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Python 3.10 Engine Console Trigger */}
            <button
              onClick={onOpenPythonConsole}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              title="Open Python 3.10 Engine Terminal & Telemetry"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Python 3.10</span>
            </button>

            {/* Theme Toggle (High-Contrast Dark vs Light Reading) */}
            <button
              onClick={() => onToggleTheme?.()}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                themeMode === "light"
                  ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              title={
                themeMode === "light"
                  ? "Switch to High-Contrast Dark Mode"
                  : "Switch to Light Reading Mode"
              }
              aria-label="Toggle Reading Theme"
            >
              {themeMode === "light" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings (Model & Specs) */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-purple-600/30 text-purple-400 border border-purple-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              title="System & AI Model Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Sign In / Sign Up OR Profile Dropdown */}
            <div className="relative pl-1 border-l border-slate-800" ref={menuRef}>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 py-1 px-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors group"
                title="Aspirant Profile & Accounts"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white hidden lg:inline-block max-w-[110px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white hidden sm:inline-block" />
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f1522] border border-[#222f48] shadow-2xl p-3 z-50 space-y-3 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2 py-1.5 border-b border-slate-800">
                    <p className="font-bold text-white text-xs truncate">{user?.name || "Aspirant"}</p>
                    <p className="text-[11px] text-blue-400 font-medium">
                      {user?.optionalSubject || "Public Administration"} • {user?.target || "UPSC CSE 2026"}
                    </p>
                    {user?.email && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        onToggleTheme?.();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {themeMode === "light" ? (
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>Theme Mode</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {themeMode === "light" ? "Light Reading" : "High Contrast"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveTab("settings");
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>Model & Laptop Specs</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveTab("settings");
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Edit Aspirant Name & Target</span>
                    </button>

                    {user.email ? (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAuth?.("signin");
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5 text-blue-400" />
                          <span>Switch Account</span>
                        </button>

                        <div className="pt-2 border-t border-slate-800">
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onLogout) onLogout();
                              else onOpenAuth?.("signin");
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center space-x-2 text-xs transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out (Data Saved)</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAuth?.("signin");
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sign In to Restore Progress</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAuth?.("signup");
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                          <span>Create Account</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Matching Screenshots 1, 3, 4, 6) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d111a]/95 backdrop-blur-lg border-t border-[#1e293b] px-2 py-1.5">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              activeTab === "home" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("learn")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors relative ${
              activeTab === "learn" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Learn</span>
            {revisionDueCount > 0 && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0d111a]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "knowledge" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">RAG</span>
          </button>

          <button
            onClick={() => setActiveTab("knowledgeGraph")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "knowledgeGraph" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] font-medium">Graph</span>
          </button>

          <button
            onClick={() => setActiveTab("prelims")}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              activeTab === "prelims" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Prelims</span>
          </button>

          <button
            onClick={() => setActiveTab("pyqs")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "pyqs" ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="text-[10px] font-medium">PYQs</span>
          </button>

          <button
            onClick={() => setActiveTab("mains")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "mains" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Mains</span>
          </button>

          <button
            onClick={() => setActiveTab("materials")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "materials" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] font-medium">Upload</span>
          </button>

          <button
            onClick={() => setActiveTab("ncert")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "ncert" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5 text-emerald-400" />
            <span className="text-[10px] font-medium">NCERT</span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "news" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Newspaper className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">News</span>
          </button>

          <button
            onClick={() => setActiveTab("planner")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "planner" || activeTab === "schedule" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Planner</span>
          </button>

          <button
            onClick={() => setActiveTab("bolt")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "bolt" ? "text-amber-400 font-bold" : "text-blue-400 hover:text-blue-300"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500/40 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] font-semibold">Bolt</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === "settings" ? "text-purple-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};
