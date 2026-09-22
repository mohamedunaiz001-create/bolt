import fs from "fs";
import path from "path";
import crypto from "crypto";
import { generateSignedSessionToken } from "./authMiddleware";

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  target: string;
  optionalSubject: string;
  createdAt: string;
}

function hashPassword(password: string): string {
  if (!password) return "";
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(inputPassword: string, storedHash: string): boolean {
  if (!inputPassword || !storedHash) return false;
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedKey = parts[2];
      const derived = crypto.scryptSync(inputPassword, salt, 64).toString("hex");
      if (derived.length !== expectedKey.length) return false;
      return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(expectedKey, "hex"));
    }
  }
  // Migration verification for pre-existing records (never plaintext)
  const legacySalt = "bolt_upsc_secure_salt_2026";
  const legacyHash = crypto.createHash("sha256").update(inputPassword + legacySalt).digest("hex");
  if (legacyHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(legacyHash, "hex"), Buffer.from(storedHash, "hex"));
}

export interface StoredUserProfile {
  id: string;
  name: string;
  email: string;
  target: string;
  optionalSubject: string;
  avatarUrl?: string;
  studyStreakDays: number;
  totalStudyHours: number;
  questionsAttempted: number;
  mainsEvaluatedCount: number;
  overallAccuracy: number;
  themeMode?: "dark" | "light";
  dailyStudyGoal?: number;
  dailyStudyHoursGoal?: number;
}

export interface StoredUserProgress {
  userId: string;
  user: StoredUserProfile;
  topics?: any[];
  evaluations?: any[];
  timetableSlots?: any[];
  studySessions?: any[];
  prelimsAttempts?: Record<string, { selectedOption: string; isCorrect: boolean; timestamp: string }>;
  bookmarks?: string[];
  updatedAt: string;
}

interface UserDatabaseFile {
  accounts: StoredAccount[];
  userProgress: Record<string, StoredUserProgress>;
}

const DATA_DIR = path.join(process.cwd(), "data");
// In-memory store: Production uses Firebase Auth & Cloud Firestore.
// Sensitive user credentials and progress are NEVER written to disk JSON files.
const inMemoryStore: UserDatabaseFile = {
  accounts: [],
  userProgress: {},
};

function ensureStoreExists(): UserDatabaseFile {
  return inMemoryStore;
}

function writeStore(data: UserDatabaseFile): void {
  inMemoryStore.accounts = data.accounts;
  inMemoryStore.userProgress = data.userProgress;
}

export function registerUser(params: {
  name: string;
  email: string;
  password?: string;
  target?: string;
  optionalSubject?: string;
  initialData?: {
    topics?: any[];
    timetableSlots?: any[];
  };
}): { success: boolean; message?: string; token?: string; account?: StoredAccount; user?: StoredUserProfile; progress?: StoredUserProgress } {
  const store = ensureStoreExists();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = store.accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, message: "An account with this email address already exists. Please sign in." };
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const target = params.target?.trim() || "UPSC CSE 2026";
  const optionalSubject = params.optionalSubject?.trim() || "Public Administration";

  const newAccount: StoredAccount = {
    id: userId,
    name: params.name.trim(),
    email: normalizedEmail,
    password: params.password ? hashPassword(params.password) : "",
    target,
    optionalSubject,
    createdAt: new Date().toISOString(),
  };

  const newUserProfile: StoredUserProfile = {
    id: userId,
    name: params.name.trim(),
    email: normalizedEmail,
    target,
    optionalSubject,
    studyStreakDays: 0,
    totalStudyHours: 0,
    questionsAttempted: 0,
    mainsEvaluatedCount: 0,
    overallAccuracy: 0,
    themeMode: "dark",
    dailyStudyGoal: 6,
    dailyStudyHoursGoal: 6,
  };

  const initialProgress: StoredUserProgress = {
    userId,
    user: newUserProfile,
    topics: params.initialData?.topics || [],
    evaluations: [],
    timetableSlots: params.initialData?.timetableSlots || [],
    studySessions: [],
    prelimsAttempts: {},
    bookmarks: [],
    updatedAt: new Date().toISOString(),
  };

  store.accounts.push(newAccount);
  store.userProgress[userId] = initialProgress;
  writeStore(store);

  const sessionToken = generateSignedSessionToken({
    uid: userId,
    email: normalizedEmail,
  });

  return {
    success: true,
    token: sessionToken,
    account: newAccount,
    user: newUserProfile,
    progress: initialProgress,
  };
}

export function loginUser(params: {
  email: string;
  password?: string;
}): { success: boolean; message?: string; token?: string; account?: StoredAccount; user?: StoredUserProfile; progress?: StoredUserProgress } {
  const store = ensureStoreExists();
  const normalizedEmail = params.email.trim().toLowerCase();

  const account = store.accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!account) {
    return { success: false, message: "No account found with this email. Please check your email or create a new account." };
  }

  if (account.password && params.password && !verifyPassword(params.password, account.password)) {
    return { success: false, message: "Invalid password. Please check your credentials." };
  }

  let progress = store.userProgress[account.id];
  if (!progress) {
    progress = {
      userId: account.id,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        target: account.target,
        optionalSubject: account.optionalSubject,
        studyStreakDays: 0,
        totalStudyHours: 0,
        questionsAttempted: 0,
        mainsEvaluatedCount: 0,
        overallAccuracy: 0,
        themeMode: "dark",
      },
      topics: [],
      evaluations: [],
      timetableSlots: [],
      studySessions: [],
      prelimsAttempts: {},
      bookmarks: [],
      updatedAt: new Date().toISOString(),
    };
    store.userProgress[account.id] = progress;
    writeStore(store);
  }

  const sessionToken = generateSignedSessionToken({
    uid: account.id,
    email: account.email,
  });

  return {
    success: true,
    token: sessionToken,
    account,
    user: progress.user,
    progress,
  };
}

export function saveUserProgress(
  userId: string,
  data: Partial<Omit<StoredUserProgress, "user">> & { user?: Partial<StoredUserProfile> }
): { success: boolean; progress?: StoredUserProgress; message?: string } {
  const store = ensureStoreExists();
  
  // Resolve target ID in case email was passed
  let resolvedId = userId;
  const matchedAccount = store.accounts.find(
    (a) => a.id === userId || a.email.toLowerCase() === userId.trim().toLowerCase()
  );
  if (matchedAccount) {
    resolvedId = matchedAccount.id;
  }

  const existing = store.userProgress[resolvedId];

  if (!existing) {
    // If progress record not yet created, create one
    const initialUser: StoredUserProfile = {
      id: resolvedId,
      name: matchedAccount?.name || data.user?.name || "Aspirant",
      email: matchedAccount?.email || data.user?.email || "",
      target: matchedAccount?.target || data.user?.target || "UPSC CSE 2026",
      optionalSubject: matchedAccount?.optionalSubject || data.user?.optionalSubject || "Public Administration",
      studyStreakDays: data.user?.studyStreakDays || 0,
      totalStudyHours: data.user?.totalStudyHours || 0,
      questionsAttempted: data.user?.questionsAttempted || 0,
      mainsEvaluatedCount: data.user?.mainsEvaluatedCount || 0,
      overallAccuracy: data.user?.overallAccuracy || 0,
      themeMode: data.user?.themeMode || "dark",
    };

    const newProgress: StoredUserProgress = {
      userId: resolvedId,
      user: initialUser,
      topics: data.topics || [],
      evaluations: data.evaluations || [],
      timetableSlots: data.timetableSlots || [],
      studySessions: data.studySessions || [],
      prelimsAttempts: data.prelimsAttempts || {},
      bookmarks: data.bookmarks || [],
      updatedAt: new Date().toISOString(),
    };

    store.userProgress[resolvedId] = newProgress;
    writeStore(store);
    return { success: true, progress: newProgress };
  }

  // Update existing
  const updatedUser: StoredUserProfile = data.user ? { ...existing.user, ...data.user } : existing.user;

  const updatedProgress: StoredUserProgress = {
    ...existing,
    ...data,
    user: updatedUser,
    updatedAt: new Date().toISOString(),
  };

  store.userProgress[resolvedId] = updatedProgress;

  // Also sync account name/target/optional if user changed
  const accountIndex = store.accounts.findIndex((a) => a.id === resolvedId);
  if (accountIndex >= 0 && data.user) {
    if (data.user.name) store.accounts[accountIndex].name = data.user.name;
    if (data.user.target) store.accounts[accountIndex].target = data.user.target;
    if (data.user.optionalSubject) store.accounts[accountIndex].optionalSubject = data.user.optionalSubject;
  }

  writeStore(store);
  return { success: true, progress: updatedProgress };
}

export function getUserProgress(userIdOrEmail: string): StoredUserProgress | null {
  const store = ensureStoreExists();
  if (store.userProgress[userIdOrEmail]) {
    return store.userProgress[userIdOrEmail];
  }
  const matched = store.accounts.find(
    (a) => a.id === userIdOrEmail || a.email.toLowerCase() === userIdOrEmail.trim().toLowerCase()
  );
  if (matched && store.userProgress[matched.id]) {
    return store.userProgress[matched.id];
  }
  return null;
}

export function getUserProfile(userId: string): any {
  const progress = getUserProgress(userId);
  if (progress && progress.user) {
    return {
      id: progress.userId,
      name: progress.user.name || "Aspirant",
      email: progress.user.email || "",
      target: progress.user.target || "UPSC 2026",
      optionalSubject: progress.user.optionalSubject || "Public Administration",
      streakDays: progress.user.studyStreakDays || 0,
      totalStudyHours: progress.user.totalStudyHours || 0,
      weakAreas: [],
      dailyStudyLogs: (progress.studySessions || []).map((s: any) => ({
        date: s.date || new Date().toISOString().split("T")[0],
        minutes: s.durationMinutes || s.minutes || 30,
        topic: s.topicName || "General Study",
      })),
    };
  }
  return {
    id: userId,
    name: "Aspirant",
    email: "",
    target: "UPSC 2026",
    optionalSubject: "Public Administration",
    streakDays: 0,
    totalStudyHours: 0,
    weakAreas: [],
    dailyStudyLogs: [],
  };
}

export function updateUserProfile(userId: string, updates: any): any {
  const store = ensureStoreExists();
  const existing = store.userProgress[userId];
  if (existing) {
    existing.user = { ...existing.user, ...updates };
    writeStore(store);
    return { ...existing.user, ...updates };
  }
  saveUserProgress(userId, { user: updates });
  return getUserProfile(userId);
}

export function recordStudySession(userId: string, session: any): any {
  const store = ensureStoreExists();
  let progress = store.userProgress[userId];
  const durationHours = Math.round(((session.durationMinutes || 30) / 60) * 10) / 10;
  if (!progress) {
    saveUserProgress(userId, {
      studySessions: [session],
      user: {
        studyStreakDays: 1,
        totalStudyHours: durationHours,
      },
    });
    progress = store.userProgress[userId];
  } else {
    progress.studySessions = progress.studySessions || [];
    progress.studySessions.push(session);
    if (progress.user) {
      progress.user.studyStreakDays = Math.max(1, (progress.user.studyStreakDays || 0) + 1);
      progress.user.totalStudyHours =
        Math.round(((progress.user.totalStudyHours || 0) + durationHours) * 10) / 10;
    }
    writeStore(store);
  }
  return session;
}

export function exportAllUserData(userId: string): any {
  const store = ensureStoreExists();
  const progress = getUserProgress(userId);
  const account = store.accounts.find((a) => a.id === userId);
  return {
    exportedAt: new Date().toISOString(),
    account: account
      ? { id: account.id, name: account.name, email: account.email, target: account.target, optionalSubject: account.optionalSubject }
      : null,
    progress,
    user: getUserProfile(userId),
  };
}

export function deleteUserAccount(userId: string): boolean {
  const store = ensureStoreExists();
  let modified = false;

  if (store.userProgress[userId]) {
    delete store.userProgress[userId];
    modified = true;
  }

  const accIndex = store.accounts.findIndex((a) => a.id === userId);
  if (accIndex >= 0) {
    store.accounts.splice(accIndex, 1);
    modified = true;
  }

  if (modified) {
    writeStore(store);
  }
  return true;
}

export async function registerUserAsync(params: {
  name: string;
  email: string;
  password?: string;
  target?: string;
  optionalSubject?: string;
  initialData?: any;
}): Promise<any> {
  return registerUser(params);
}

export async function saveUserProgressAsync(
  userId: string,
  data: Partial<StoredUserProgress>
): Promise<any> {
  return saveUserProgress(userId, data);
}

export async function getUserProgressAsync(userIdOrEmail: string): Promise<StoredUserProgress | null> {
  return getUserProgress(userIdOrEmail);
}

export async function exportAllUserDataAsync(userId: string): Promise<any> {
  return exportAllUserData(userId);
}

export async function deleteUserAccountAsync(userId: string): Promise<boolean> {
  return deleteUserAccount(userId);
}

