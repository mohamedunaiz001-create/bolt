import fs from "fs";
import path from "path";
import crypto from "crypto";

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
  const salt = "bolt_upsc_secure_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function verifyPassword(inputPassword: string, storedHash: string): boolean {
  if (!inputPassword || !storedHash) return false;
  if (storedHash === inputPassword) return true; // Backward compatibility for any pre-migration mock records
  return hashPassword(inputPassword) === storedHash;
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
const STORE_FILE = path.join(DATA_DIR, "user_store.json");

function ensureStoreExists(): UserDatabaseFile {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: UserDatabaseFile = {
        accounts: [],
        userProgress: {},
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(content) as UserDatabaseFile;
  } catch (err) {
    console.error("Error reading user_store.json:", err);
    return { accounts: [], userProgress: {} };
  }
}

function writeStore(data: UserDatabaseFile): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing user_store.json:", err);
  }
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
}): { success: boolean; message?: string; account?: StoredAccount; user?: StoredUserProfile; progress?: StoredUserProgress } {
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

  return {
    success: true,
    account: newAccount,
    user: newUserProfile,
    progress: initialProgress,
  };
}

export function loginUser(params: {
  email: string;
  password?: string;
}): { success: boolean; message?: string; account?: StoredAccount; user?: StoredUserProfile; progress?: StoredUserProgress } {
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

  return {
    success: true,
    account,
    user: progress.user,
    progress,
  };
}

export function saveUserProgress(userId: string, data: Partial<StoredUserProgress>): { success: boolean; progress?: StoredUserProgress; message?: string } {
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
    const initialUser: StoredUserProfile = data.user || {
      id: resolvedId,
      name: matchedAccount?.name || "Aspirant",
      email: matchedAccount?.email || "",
      target: matchedAccount?.target || "UPSC CSE 2026",
      optionalSubject: matchedAccount?.optionalSubject || "Public Administration",
      studyStreakDays: 0,
      totalStudyHours: 0,
      questionsAttempted: 0,
      mainsEvaluatedCount: 0,
      overallAccuracy: 0,
      themeMode: "dark",
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
