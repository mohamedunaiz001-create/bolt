import { SyllabusTopic, TimetableSlot } from "../types";

export interface OfflineCacheStats {
  isOnline: boolean;
  swActive: boolean;
  syllabusCount: number;
  subTopicsCount: number;
  timetableCount: number;
  lastCachedAt: string | null;
  pendingSyncs: number;
}

const SYLLABUS_STORAGE_KEY = "bolt_topics";
const TIMETABLE_STORAGE_KEY = "bolt_custom_timetable_slots";
const OFFLINE_META_KEY = "bolt_offline_metadata";
const OFFLINE_QUEUE_KEY = "bolt_offline_sync_queue";
const DATA_CACHE_NAME = "bolt-upsc-data-v1";

type StatusListener = (stats: OfflineCacheStats) => void;
const listeners = new Set<StatusListener>();

let swRegistration: ServiceWorkerRegistration | null = null;

function notifyListeners() {
  const stats = getOfflineCacheStats();
  listeners.forEach((fn) => fn(stats));
}

/**
 * Register Service Worker for offline support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    swRegistration = registration;
    console.log("[PWA] ServiceWorker registered with scope:", registration.scope);

    // If waiting service worker, prompt or skip waiting
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[PWA] New version installed and ready for offline use.");
          }
        });
      }
    });

    notifyListeners();
    return registration;
  } catch (err) {
    console.warn("[PWA] ServiceWorker registration skipped or failed:", err);
    return null;
  }
}

/**
 * Persists syllabus topics to both CacheStorage and localStorage
 */
export async function cacheSyllabusOffline(topics: SyllabusTopic[]): Promise<void> {
  if (!topics || topics.length === 0) return;

  try {
    // 1. LocalStorage primary cache
    localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(topics));

    // 2. Browser CacheStorage API for standard fetch intercept
    if ("caches" in window) {
      const cache = await caches.open(DATA_CACHE_NAME);
      const payload = {
        success: true,
        cachedAt: new Date().toISOString(),
        topicsCount: topics.length,
        topics,
      };
      const response = new Response(JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
          "X-Bolt-Cached-At": new Date().toISOString(),
          "X-Bolt-Offline": "true",
        },
      });
      await cache.put("/api/syllabus", response);
    }

    // 3. Post to ServiceWorker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_OFFLINE_DATA",
        syllabus: { success: true, topics },
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Update metadata
    updateOfflineMetadata({ lastSyllabusSync: new Date().toISOString() });
    notifyListeners();
  } catch (err) {
    console.warn("[OfflineCache] Error caching syllabus:", err);
  }
}

/**
 * Persists timetable slots to both CacheStorage and localStorage
 */
export async function cacheTimetableOffline(slots: TimetableSlot[]): Promise<void> {
  if (!slots) return;

  try {
    // 1. LocalStorage primary cache
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(slots));

    // 2. Browser CacheStorage API
    if ("caches" in window) {
      const cache = await caches.open(DATA_CACHE_NAME);
      const payload = {
        success: true,
        cachedAt: new Date().toISOString(),
        slotCount: slots.length,
        slots,
      };
      const response = new Response(JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
          "X-Bolt-Cached-At": new Date().toISOString(),
          "X-Bolt-Offline": "true",
        },
      });
      await cache.put("/api/timetable", response);
    }

    // 3. Post to ServiceWorker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_OFFLINE_DATA",
        timetable: { success: true, slots },
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Update metadata
    updateOfflineMetadata({ lastTimetableSync: new Date().toISOString() });
    notifyListeners();
  } catch (err) {
    console.warn("[OfflineCache] Error caching timetable:", err);
  }
}

/**
 * Read cached syllabus topics safely with fallback hierarchy
 */
export function getCachedSyllabus(): SyllabusTopic[] | null {
  try {
    const raw = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[OfflineCache] Failed to parse local syllabus:", e);
  }
  return null;
}

/**
 * Read cached timetable slots safely with fallback hierarchy
 */
export function getCachedTimetable(): TimetableSlot[] | null {
  try {
    const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[OfflineCache] Failed to parse local timetable:", e);
  }
  return null;
}

/**
 * Queue changes made while offline
 */
export function queueOfflineChange(action: string, data: any): void {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      id: "queue-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    notifyListeners();
  } catch (err) {
    console.warn("[OfflineQueue] Error pushing change:", err);
  }
}

/**
 * Get offline sync statistics
 */
export function getOfflineCacheStats(): OfflineCacheStats {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const swActive = typeof navigator !== "undefined" && !!navigator.serviceWorker?.controller;

  let syllabusCount = 0;
  let subTopicsCount = 0;
  try {
    const cachedTopics = getCachedSyllabus();
    if (cachedTopics) {
      syllabusCount = cachedTopics.length;
      subTopicsCount = cachedTopics.reduce(
        (acc, t) => acc + (t.subtopics ? t.subtopics.length : 0),
        0
      );
    }
  } catch {}

  let timetableCount = 0;
  try {
    const cachedSlots = getCachedTimetable();
    if (cachedSlots) {
      timetableCount = cachedSlots.length;
    }
  } catch {}

  let lastCachedAt: string | null = null;
  try {
    const rawMeta = localStorage.getItem(OFFLINE_META_KEY);
    if (rawMeta) {
      const meta = JSON.parse(rawMeta);
      lastCachedAt = meta.lastSyllabusSync || meta.lastTimetableSync || null;
    }
  } catch {}

  let pendingSyncs = 0;
  try {
    const rawQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (rawQueue) {
      const queue = JSON.parse(rawQueue);
      pendingSyncs = Array.isArray(queue) ? queue.length : 0;
    }
  } catch {}

  return {
    isOnline,
    swActive,
    syllabusCount,
    subTopicsCount,
    timetableCount,
    lastCachedAt,
    pendingSyncs,
  };
}

function updateOfflineMetadata(patch: Record<string, any>) {
  try {
    const raw = localStorage.getItem(OFFLINE_META_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(OFFLINE_META_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Flush and synchronize offline queue when connection returns
 */
export async function flushOfflineQueue(userId?: string): Promise<number> {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return 0;

    console.log(`[OfflineSync] Syncing ${queue.length} pending items back online...`);

    // If user is authenticated, save current state to backend
    if (userId) {
      const topics = getCachedSyllabus();
      const timetableSlots = getCachedTimetable();
      try {
        await fetch("/api/user/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            topics: topics || undefined,
            timetableSlots: timetableSlots || undefined,
          }),
        });
      } catch (err) {
        console.warn("[OfflineSync] Network sync post failed:", err);
      }
    }

    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    notifyListeners();
    return queue.length;
  } catch (err) {
    console.warn("[OfflineSync] Error flushing queue:", err);
    return 0;
  }
}

/**
 * Subscribe to online/offline network changes
 */
export function subscribeOfflineStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(getOfflineCacheStats());

  const handleOnline = () => {
    console.log("[Network] Connection restored: ONLINE");
    flushOfflineQueue();
    notifyListeners();
  };

  const handleOffline = () => {
    console.log("[Network] Connection lost: OFFLINE mode activated");
    notifyListeners();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  };
}
