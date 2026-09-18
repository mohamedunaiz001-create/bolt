import React, { useState, useEffect } from "react";
import {
  WifiOff,
  Wifi,
  Database,
  CheckCircle2,
  Download,
  RefreshCw,
  X,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
} from "lucide-react";
import {
  getOfflineCacheStats,
  subscribeOfflineStatus,
  cacheSyllabusOffline,
  cacheTimetableOffline,
  OfflineCacheStats,
} from "../services/offlineSyncService";
import { SyllabusTopic, TimetableSlot } from "../types";

interface OfflineStatusIndicatorProps {
  topics: SyllabusTopic[];
  timetableSlots: TimetableSlot[];
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  topics,
  timetableSlots,
}) => {
  const [stats, setStats] = useState<OfflineCacheStats>(getOfflineCacheStats());
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeOfflineStatus((newStats) => {
      setStats(newStats);
    });

    // Capture beforeinstallprompt for PWA installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Proactively cache syllabus and timetable when props update
  useEffect(() => {
    if (topics && topics.length > 0) {
      cacheSyllabusOffline(topics);
    }
  }, [topics]);

  useEffect(() => {
    if (timetableSlots && timetableSlots.length > 0) {
      cacheTimetableOffline(timetableSlots);
    }
  }, [timetableSlots]);

  const handleManualCacheRefresh = async () => {
    setIsSyncing(true);
    try {
      await cacheSyllabusOffline(topics);
      await cacheTimetableOffline(timetableSlots);
      setSyncSuccessMessage("Syllabus and timetable successfully cached for offline use!");
      setTimeout(() => setSyncSuccessMessage(null), 3500);
    } catch (e) {
      console.warn("Manual cache refresh failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("PWA install prompt error:", err);
    }
  };

  return (
    <>
      {/* Offline Alert Strip (Visible when device is offline) */}
      {!stats.isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-between z-40 sticky top-0 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Offline Mode Active</strong>: Your syllabus topics ({stats.syllabusCount}) and
              weekly timetable ({stats.timetableCount} slots) are fully accessible offline.
            </span>
          </div>
          <button
            onClick={() => setIsOpenModal(true)}
            className="px-2.5 py-1 rounded bg-amber-800/60 hover:bg-amber-700/60 text-amber-100 font-semibold border border-amber-500/30 flex items-center space-x-1"
          >
            <Database className="w-3 h-3" />
            <span>Cache Details</span>
          </button>
        </div>
      )}

      {/* Floating Status Pill (Corner button) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-2">
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all hover:scale-105"
            title="Install Bolt UPSC App to Home Screen"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        <button
          onClick={() => setIsOpenModal(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium shadow-md backdrop-blur-md transition-all ${
            !stats.isOnline
              ? "bg-amber-900/90 border-amber-500/60 text-amber-200 hover:bg-amber-800/90"
              : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
          title="Inspect Offline Caching & Service Worker status"
        >
          {!stats.isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Ready</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Offline Cache Ready</span>
              <span className="sm:hidden">Offline</span>
            </>
          )}
        </button>
      </div>

      {/* Modal: Offline Storage Details & Manual Cache Trigger */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111723] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    !stats.isOnline
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    Offline Cache & Storage
                  </h3>
                  <p className="text-xs text-slate-400">
                    Network:{" "}
                    <strong className={stats.isOnline ? "text-emerald-400" : "text-amber-400"}>
                      {stats.isOnline ? "Online" : "Offline"}
                    </strong>{" "}
                    • Service Worker Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Content Checklist */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#162033] border border-slate-800 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <BookOpen className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Syllabus Data & Structure</p>
                    <p className="text-[11px] text-slate-400">
                      Public Administration & GS Core topics with subtopics & notes
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {stats.syllabusCount} Topics ({stats.subTopicsCount} Subtopics)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#162033] border border-slate-800 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <Calendar className="w-4 h-4 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Weekly Timetable & Schedule</p>
                    <p className="text-[11px] text-slate-400">
                      Monday to Sunday study slots, drag & drop planner state
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {stats.timetableCount} Slots Cached
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#162033] border border-slate-800 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <Layers className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Focus Timer & Study Sessions</p>
                    <p className="text-[11px] text-slate-400">
                      Offline session logging, Pomodoro timer, and daily hour tracking
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
            </div>

            {/* Notification message */}
            {syncSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                {stats.lastCachedAt
                  ? `Last cached: ${new Date(stats.lastCachedAt).toLocaleTimeString()}`
                  : "Auto-syncs on every change"}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleManualCacheRefresh}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Caching..." : "Update Offline Cache"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
