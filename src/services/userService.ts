import { UserProfile, SyllabusTopic, MainsAnswerEvaluation, TimetableSlot, StudySessionLog, UserFullProgressData } from "../types";
import { publicAdminSyllabus } from "../data/mockData";
import { DEFAULT_TIMETABLE_SLOTS } from "../data/timetableData";

const CURRENT_USER_KEY = "bolt_current_user";
const USER_PROGRESS_KEY_PREFIX = "bolt_user_progress_";
const ACCOUNTS_KEY = "bolt_upsc_accounts";

/**
 * Returns pristine syllabus topics with zero mock progress for a clean user account
 */
export function getCleanSyllabus(): SyllabusTopic[] {
  return publicAdminSyllabus.map((topic) => ({
    ...topic,
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning" as const,
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    subtopics: topic.subtopics.map((sub) => ({
      ...sub,
      status: "learning" as const,
      confidence: 0,
    })),
  }));
}

/**
 * Returns pristine timetable slots with zero completed status or spent time
 */
export function getCleanTimetableSlots(): TimetableSlot[] {
  return DEFAULT_TIMETABLE_SLOTS.map((slot) => ({
    ...slot,
    isCompleted: false,
    timeSpentMinutes: 0,
  }));
}

/**
 * Retrieve the active user from localStorage if previously signed in
 */
export function getStoredCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (e) {
    console.error("Error reading stored current user:", e);
  }
  return null;
}

/**
 * Save user's full progress both locally and to the server
 */
export async function saveUserProgress(progress: UserFullProgressData): Promise<boolean> {
  const userId = progress.user.id || "guest";

  // 1. Immediate local cache write
  try {
    localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(progress.user));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // 2. Persist to server API if user is authenticated (not guest)
  if (userId && !userId.startsWith("guest")) {
    try {
      const res = await fetch("/api/user/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          user: progress.user,
          topics: progress.topics,
          evaluations: progress.evaluations,
          timetableSlots: progress.timetableSlots,
          studySessions: progress.studySessions,
          prelimsAttempts: progress.prelimsAttempts,
          bookmarks: progress.bookmarks,
        }),
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn("Failed to persist progress to server, cached locally:", e);
    }
  }

  return true;
}

/**
 * Load user's full progress from the server (with localStorage fallback)
 */
export async function loadUserProgress(userId: string): Promise<UserFullProgressData | null> {
  // Try server first if authenticated
  if (userId && !userId.startsWith("guest")) {
    try {
      const res = await fetch(`/api/user/progress?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.progress) {
          const p = json.progress;
          const fullData: UserFullProgressData = {
            user: p.user,
            topics: p.topics && p.topics.length > 0 ? p.topics : getCleanSyllabus(),
            evaluations: p.evaluations || [],
            timetableSlots: p.timetableSlots && p.timetableSlots.length > 0 ? p.timetableSlots : getCleanTimetableSlots(),
            studySessions: p.studySessions || [],
            prelimsAttempts: p.prelimsAttempts || {},
            bookmarks: p.bookmarks || [],
            lastSavedAt: p.updatedAt,
          };
          // Sync to local cache
          try {
            localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(fullData));
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fullData.user));
          } catch {}
          return fullData;
        }
      }
    } catch (e) {
      console.warn("Could not load progress from server, falling back to local storage:", e);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw) as UserFullProgressData;
    }
  } catch (e) {
    console.error("Error reading local progress:", e);
  }

  return null;
}

/**
 * Register a new user account
 */
export async function registerAccount(params: {
  name: string;
  email: string;
  password?: string;
  target?: string;
  optionalSubject?: string;
}): Promise<{ success: boolean; message?: string; user?: UserProfile; progress?: UserFullProgressData }> {
  const cleanTopics = getCleanSyllabus();
  const cleanSlots = getCleanTimetableSlots();

  // Try server registration
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...params,
        initialData: {
          topics: cleanTopics,
          timetableSlots: cleanSlots,
        },
      }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      const user = json.user as UserProfile;
      const progress: UserFullProgressData = {
        user,
        topics: json.progress?.topics || cleanTopics,
        evaluations: json.progress?.evaluations || [],
        timetableSlots: json.progress?.timetableSlots || cleanSlots,
        studySessions: json.progress?.studySessions || [],
        prelimsAttempts: {},
        bookmarks: [],
        lastSavedAt: new Date().toISOString(),
      };

      // Save to local cache
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${user.id}`, JSON.stringify(progress));
      } catch {}

      return { success: true, user, progress };
    } else {
      return { success: false, message: json.message || "Registration failed." };
    }
  } catch (e) {
    console.warn("Server register failed, falling back to local store:", e);
  }

  // Local fallback registration
  const userId = `user_${Date.now()}`;
  const newUser: UserProfile = {
    id: userId,
    name: params.name.trim(),
    email: params.email.trim(),
    target: params.target || "UPSC CSE 2026",
    optionalSubject: params.optionalSubject || "Public Administration",
    studyStreakDays: 0,
    totalStudyHours: 0,
    questionsAttempted: 0,
    mainsEvaluatedCount: 0,
    overallAccuracy: 0,
    themeMode: "dark",
  };

  const progress: UserFullProgressData = {
    user: newUser,
    topics: cleanTopics,
    evaluations: [],
    timetableSlots: cleanSlots,
    studySessions: [],
    prelimsAttempts: {},
    bookmarks: [],
    lastSavedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));
    // Save to accounts list
    const existingAccountsRaw = localStorage.getItem(ACCOUNTS_KEY);
    const accounts = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];
    accounts.push({
      id: userId,
      name: newUser.name,
      email: newUser.email,
      password: params.password || "",
      target: newUser.target,
      optionalSubject: newUser.optionalSubject,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}

  return { success: true, user: newUser, progress };
}

/**
 * Sign in an existing user and restore their saved progress
 */
export async function loginAccount(params: {
  email: string;
  password?: string;
}): Promise<{ success: boolean; message?: string; user?: UserProfile; progress?: UserFullProgressData }> {
  // 1. Try server login
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      const user = json.user as UserProfile;
      const rawP = json.progress;
      const progress: UserFullProgressData = {
        user,
        topics: rawP?.topics && rawP.topics.length > 0 ? rawP.topics : getCleanSyllabus(),
        evaluations: rawP?.evaluations || [],
        timetableSlots: rawP?.timetableSlots && rawP.timetableSlots.length > 0 ? rawP.timetableSlots : getCleanTimetableSlots(),
        studySessions: rawP?.studySessions || [],
        prelimsAttempts: rawP?.prelimsAttempts || {},
        bookmarks: rawP?.bookmarks || [],
        lastSavedAt: rawP?.updatedAt || new Date().toISOString(),
      };

      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${user.id}`, JSON.stringify(progress));
      } catch {}

      return { success: true, user, progress };
    } else {
      // If server returned explicit error (like wrong password)
      if (json.message) {
        return { success: false, message: json.message };
      }
    }
  } catch (e) {
    console.warn("Server login request failed, checking local accounts:", e);
  }

  // 2. Local fallback
  try {
    const existingAccountsRaw = localStorage.getItem(ACCOUNTS_KEY);
    const accounts = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];
    const matched = accounts.find((a: any) => a.email.toLowerCase() === params.email.trim().toLowerCase());

    if (!matched) {
      return { success: false, message: "No account found with this email. Please check your credentials or create a new account." };
    }

    if (matched.password && params.password && matched.password !== params.password) {
      return { success: false, message: "Invalid password. Please check your credentials." };
    }

    // Load saved progress from local store
    const localProgressRaw = localStorage.getItem(`${USER_PROGRESS_KEY_PREFIX}${matched.id}`);
    let progress: UserFullProgressData;
    if (localProgressRaw) {
      progress = JSON.parse(localProgressRaw);
    } else {
      const userObj: UserProfile = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        target: matched.target || "UPSC CSE 2026",
        optionalSubject: matched.optionalSubject || "Public Administration",
        studyStreakDays: 0,
        totalStudyHours: 0,
        questionsAttempted: 0,
        mainsEvaluatedCount: 0,
        overallAccuracy: 0,
        themeMode: "dark",
      };
      progress = {
        user: userObj,
        topics: getCleanSyllabus(),
        evaluations: [],
        timetableSlots: getCleanTimetableSlots(),
        studySessions: [],
        prelimsAttempts: {},
        bookmarks: [],
        lastSavedAt: new Date().toISOString(),
      };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(progress.user));
    return { success: true, user: progress.user, progress };
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to sign in." };
  }
}

/**
 * Sign out the current user
 */
export function logoutCurrentUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {}
}

export const logoutAccount = logoutCurrentUser;
