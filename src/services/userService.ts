import {
  UserProfile,
  SyllabusTopic,
  MainsAnswerEvaluation,
  TimetableSlot,
  StudySessionLog,
  UserFullProgressData,
} from "../types";
import { publicAdminSyllabus } from "../data/upscData";
import { DEFAULT_TIMETABLE_SLOTS } from "../data/timetableData";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  FirebaseUser,
} from "../lib/firebase";
import {
  saveFirebaseUserProfile,
  getFirebaseUserProfile,
  saveFirebaseUserTopics,
  getFirebaseUserTopics,
  getFirebaseMainsSubmissions,
  recordFirebaseMainsSubmission,
  saveFirebaseTimetableSlots,
  getFirebaseTimetableSlots,
  getFirebaseStudySessions,
} from "./firestoreService";

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
    status: "not_started" as const,
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    subtopics: topic.subtopics.map((sub) => ({
      ...sub,
      status: "not_started" as const,
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
 * Save user's full progress to Firebase Firestore with strict user isolation,
 * plus local storage backup and Express server sync.
 */
export async function saveUserProgress(progress: UserFullProgressData): Promise<boolean> {
  const userId = progress.user.id || auth.currentUser?.uid || "guest";

  // 1. Immediate local cache write
  try {
    localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(progress.user));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // 2. Persist to Firebase Firestore if not guest
  if (userId && !userId.startsWith("guest")) {
    try {
      await Promise.all([
        saveFirebaseUserProfile(userId, progress.user),
        saveFirebaseUserTopics(userId, progress.topics),
        saveFirebaseTimetableSlots(userId, progress.timetableSlots),
      ]);
    } catch (e) {
      console.warn("Firestore sync error (falling back to server endpoint):", e);
    }
  }

  // 3. Persist to server API as secondary backup
  if (userId && !userId.startsWith("guest")) {
    try {
      await fetch("/api/user/save-progress", {
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
    } catch (e) {
      console.warn("Server endpoint save failed, data is safe in Firestore/local:", e);
    }
  }

  return true;
}

/**
 * Load user's full progress from Firebase Firestore first,
 * falling back to the Express server and local storage.
 */
export async function loadUserProgress(userId: string): Promise<UserFullProgressData | null> {
  if (userId && !userId.startsWith("guest")) {
    // 1. Try Firebase Firestore
    try {
      const [fireProfile, fireTopics, fireMains, fireSlots, fireSessions] = await Promise.all([
        getFirebaseUserProfile(userId),
        getFirebaseUserTopics(userId),
        getFirebaseMainsSubmissions(userId),
        getFirebaseTimetableSlots(userId),
        getFirebaseStudySessions(userId),
      ]);

      if (fireProfile || (fireTopics && fireTopics.length > 0)) {
        const fullData: UserFullProgressData = {
          user: fireProfile || {
            id: userId,
            name: auth.currentUser?.displayName || "UPSC Aspirant",
            email: auth.currentUser?.email || "",
            target: "UPSC CSE 2026",
            optionalSubject: "Public Administration",
            studyStreakDays: 1,
            totalStudyHours: 0,
            questionsAttempted: 0,
            mainsEvaluatedCount: fireMains.length,
            overallAccuracy: 0,
          },
          topics: fireTopics.length > 0 ? fireTopics : getCleanSyllabus(),
          evaluations: fireMains,
          timetableSlots: fireSlots && fireSlots.length > 0 ? fireSlots : getCleanTimetableSlots(),
          studySessions: fireSessions,
          prelimsAttempts: {},
          bookmarks: [],
          lastSavedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(fullData));
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fullData.user));
        } catch {}

        return fullData;
      }
    } catch (e) {
      console.warn("Could not read from Firestore, trying Express API:", e);
    }

    // 2. Try Express server API
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
          return fullData;
        }
      }
    } catch (e) {
      console.warn("Server API fallback failed:", e);
    }
  }

  // 3. Fallback to local storage
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
 * Register a new user account with Firebase Authentication
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

  // Try Firebase Auth
  if (params.password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password);
      const userId = cred.user.uid;

      const newUser: UserProfile = {
        id: userId,
        name: params.name.trim(),
        email: params.email.trim(),
        target: params.target || "UPSC CSE 2026",
        optionalSubject: params.optionalSubject || "Public Administration",
        studyStreakDays: 1,
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

      // Save to Firestore
      await saveFirebaseUserProfile(userId, newUser);
      await saveFirebaseUserTopics(userId, cleanTopics);
      await saveFirebaseTimetableSlots(userId, cleanSlots);

      // Save to local cache
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));

      return { success: true, user: newUser, progress };
    } catch (err: any) {
      console.warn("Firebase createUser failed:", err);
      if (err.code === "auth/email-already-in-use") {
        return { success: false, message: "An account with this email already exists. Please sign in instead." };
      }
    }
  }

  // Fallback to Express backend registration
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

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${user.id}`, JSON.stringify(progress));

      return { success: true, user, progress };
    }
  } catch (e) {
    console.warn("Server register fallback failed:", e);
  }

  // Local fallback
  const userId = `user_${Date.now()}`;
  const newUser: UserProfile = {
    id: userId,
    name: params.name.trim(),
    email: params.email.trim(),
    target: params.target || "UPSC CSE 2026",
    optionalSubject: params.optionalSubject || "Public Administration",
    studyStreakDays: 1,
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

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));

  return { success: true, user: newUser, progress };
}

/**
 * Sign in an existing user with Firebase Auth or fallback
 */
export async function loginAccount(params: {
  email: string;
  password?: string;
}): Promise<{ success: boolean; message?: string; user?: UserProfile; progress?: UserFullProgressData }> {
  // 1. Try Firebase Auth
  if (params.password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, params.email.trim(), params.password);
      const userId = cred.user.uid;
      const progress = await loadUserProgress(userId);

      if (progress) {
        return { success: true, user: progress.user, progress };
      }

      // Default user if no progress doc yet
      const defaultUser: UserProfile = {
        id: userId,
        name: cred.user.displayName || params.email.split("@")[0],
        email: params.email,
        target: "UPSC CSE 2026",
        optionalSubject: "Public Administration",
        studyStreakDays: 1,
        totalStudyHours: 0,
        questionsAttempted: 0,
        mainsEvaluatedCount: 0,
        overallAccuracy: 0,
      };

      return {
        success: true,
        user: defaultUser,
        progress: {
          user: defaultUser,
          topics: getCleanSyllabus(),
          evaluations: [],
          timetableSlots: getCleanTimetableSlots(),
          studySessions: [],
          prelimsAttempts: {},
          bookmarks: [],
        },
      };
    } catch (err: any) {
      console.warn("Firebase signInWithEmailAndPassword failed:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        return { success: false, message: "Invalid email or password. Please verify your credentials." };
      }
    }
  }

  // 2. Try Express server API
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

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${user.id}`, JSON.stringify(progress));

      return { success: true, user, progress };
    }
  } catch (e) {
    console.warn("Server login fallback failed:", e);
  }

  // 3. Local storage accounts check
  try {
    const existingAccountsRaw = localStorage.getItem(ACCOUNTS_KEY);
    const accounts = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];
    const matched = accounts.find((a: any) => a.email.toLowerCase() === params.email.trim().toLowerCase());

    if (!matched) {
      return { success: false, message: "No account found with this email. Please create a new account." };
    }

    if (matched.password && params.password && matched.password !== params.password) {
      return { success: false, message: "Invalid password. Please check your credentials." };
    }

    const localProgressRaw = localStorage.getItem(`${USER_PROGRESS_KEY_PREFIX}${matched.id}`);
    const progress: UserFullProgressData = localProgressRaw
      ? JSON.parse(localProgressRaw)
      : {
          user: {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            target: matched.target || "UPSC CSE 2026",
            optionalSubject: matched.optionalSubject || "Public Administration",
            studyStreakDays: 1,
            totalStudyHours: 0,
            questionsAttempted: 0,
            mainsEvaluatedCount: 0,
            overallAccuracy: 0,
          },
          topics: getCleanSyllabus(),
          evaluations: [],
          timetableSlots: getCleanTimetableSlots(),
          studySessions: [],
          prelimsAttempts: {},
          bookmarks: [],
        };

    return { success: true, user: progress.user, progress };
  } catch {}

  return { success: false, message: "Authentication failed. Please check your network connection." };
}

/**
 * Sign in using Google OAuth with Firebase
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  message?: string;
  user?: UserProfile;
  progress?: UserFullProgressData;
}> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;
    const userId = fbUser.uid;

    let progress = await loadUserProgress(userId);

    if (!progress) {
      const newUser: UserProfile = {
        id: userId,
        name: fbUser.displayName || "UPSC Aspirant",
        email: fbUser.email || "",
        avatarUrl: fbUser.photoURL || undefined,
        target: "UPSC CSE 2026",
        optionalSubject: "Public Administration",
        studyStreakDays: 1,
        totalStudyHours: 0,
        questionsAttempted: 0,
        mainsEvaluatedCount: 0,
        overallAccuracy: 0,
        themeMode: "dark",
      };

      progress = {
        user: newUser,
        topics: getCleanSyllabus(),
        evaluations: [],
        timetableSlots: getCleanTimetableSlots(),
        studySessions: [],
        prelimsAttempts: {},
        bookmarks: [],
        lastSavedAt: new Date().toISOString(),
      };

      await saveFirebaseUserProfile(userId, newUser);
      await saveFirebaseUserTopics(userId, progress.topics);
      await saveFirebaseTimetableSlots(userId, progress.timetableSlots);
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(progress.user));
    localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${userId}`, JSON.stringify(progress));

    return { success: true, user: progress.user, progress };
  } catch (err: any) {
    console.warn("Google sign-in failed:", err);
    return { success: false, message: err.message || "Google sign-in was cancelled or failed." };
  }
}

/**
 * Sign out current user
 */
export async function logoutAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase sign-out error:", e);
  }
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Listen for persistent Firebase Auth state changes
 */
export function subscribeToAuthState(
  onUserChanged: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, onUserChanged);
}
