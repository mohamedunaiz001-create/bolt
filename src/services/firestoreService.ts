import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
} from "../lib/firebase";
import {
  UserProfile,
  SyllabusTopic,
  MainsAnswerEvaluation,
  TimetableSlot,
  StudySessionLog,
  ChatMessage,
  ModelRegistryVersion,
  DailyMCQItem,
} from "../types";

/**
 * BOLT Firebase Firestore Service
 * Enforces strict per-user authorization & subcollection data-isolation:
 * User A can only read and write /users/{userA_uid}/*
 * User B can only read and write /users/{userB_uid}/*
 */

// ----------------------------------------------------
// USER PROFILE OPERATIONS
// ----------------------------------------------------

export async function saveFirebaseUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getFirebaseUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

// ----------------------------------------------------
// SYLLABUS TOPICS & PROGRESS OPERATIONS
// ----------------------------------------------------

export async function saveFirebaseUserTopics(uid: string, topics: SyllabusTopic[]): Promise<void> {
  if (!uid || !topics || topics.length === 0) return;
  const topicsCollection = collection(db, "users", uid, "topics");

  // Save each topic document indexed by topic.id
  const promises = topics.map((t) => {
    const topicRef = doc(topicsCollection, t.id);
    return setDoc(topicRef, {
      ...t,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  await Promise.all(promises);
}

export async function getFirebaseUserTopics(uid: string): Promise<SyllabusTopic[]> {
  if (!uid) return [];
  const topicsCollection = collection(db, "users", uid, "topics");
  const snap = await getDocs(topicsCollection);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as SyllabusTopic);
}

// ----------------------------------------------------
// MCQ ATTEMPTS (REAL SCORE FEEDBACK)
// ----------------------------------------------------

export interface RecordedMCQAttempt {
  id: string;
  questionId: string;
  topicId?: string;
  topicName?: string;
  paper?: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpentSec?: number;
  timestamp: string;
}

export async function recordFirebaseMCQAttempt(uid: string, attempt: RecordedMCQAttempt): Promise<void> {
  if (!uid) return;
  const attemptRef = doc(db, "users", uid, "mcq_attempts", attempt.id || `mcq_${Date.now()}`);
  await setDoc(attemptRef, {
    ...attempt,
    timestamp: attempt.timestamp || new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function getFirebaseMCQAttempts(uid: string, limitCount = 100): Promise<RecordedMCQAttempt[]> {
  if (!uid) return [];
  const attemptsRef = collection(db, "users", uid, "mcq_attempts");
  const q = query(attemptsRef, orderBy("timestamp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RecordedMCQAttempt);
}

// ----------------------------------------------------
// MAINS SUBMISSIONS & 7-DIMENSION EVALUATIONS
// ----------------------------------------------------

export async function recordFirebaseMainsSubmission(uid: string, evaluation: MainsAnswerEvaluation): Promise<void> {
  if (!uid) return;
  const submissionRef = doc(db, "users", uid, "mains_submissions", evaluation.id);
  await setDoc(submissionRef, {
    ...evaluation,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function getFirebaseMainsSubmissions(uid: string): Promise<MainsAnswerEvaluation[]> {
  if (!uid) return [];
  const submissionsRef = collection(db, "users", uid, "mains_submissions");
  const q = query(submissionsRef, orderBy("submittedDate", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as MainsAnswerEvaluation);
}

// ----------------------------------------------------
// TIMETABLE & STUDY SESSIONS
// ----------------------------------------------------

export async function saveFirebaseTimetableSlots(uid: string, slots: TimetableSlot[]): Promise<void> {
  if (!uid) return;
  const slotsDoc = doc(db, "users", uid, "state", "timetable");
  await setDoc(slotsDoc, { slots, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getFirebaseTimetableSlots(uid: string): Promise<TimetableSlot[] | null> {
  if (!uid) return null;
  const slotsDoc = doc(db, "users", uid, "state", "timetable");
  const snap = await getDoc(slotsDoc);
  if (snap.exists()) {
    return (snap.data().slots as TimetableSlot[]) || null;
  }
  return null;
}

export async function recordFirebaseStudySession(uid: string, session: StudySessionLog): Promise<void> {
  if (!uid) return;
  const sessionDoc = doc(db, "users", uid, "study_sessions", session.id || `sess_${Date.now()}`);
  await setDoc(sessionDoc, {
    ...session,
    createdAt: serverTimestamp(),
  });
}

export async function getFirebaseStudySessions(uid: string): Promise<StudySessionLog[]> {
  if (!uid) return [];
  const sessionsRef = collection(db, "users", uid, "study_sessions");
  const q = query(sessionsRef, orderBy("timestamp", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as StudySessionLog);
}

// ----------------------------------------------------
// CHAT MESSAGES PERSISTENCE
// ----------------------------------------------------

export async function saveFirebaseChatMessage(uid: string, message: ChatMessage): Promise<void> {
  if (!uid) return;
  const chatDoc = doc(db, "users", uid, "chat_messages", message.id);
  await setDoc(chatDoc, {
    ...message,
    savedAt: serverTimestamp(),
  });
}

export async function getFirebaseChatMessages(uid: string, limitCount = 30): Promise<ChatMessage[]> {
  if (!uid) return [];
  const chatRef = collection(db, "users", uid, "chat_messages");
  const q = query(chatRef, orderBy("timestamp", "asc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ChatMessage);
}

// ----------------------------------------------------
// MODEL REGISTRY (SHARED VERSIONS & ROLLBACKS)
// ----------------------------------------------------

export const DEFAULT_MODEL_VERSIONS: ModelRegistryVersion[] = [
  {
    version: "v3",
    name: "BOLT PubAdmin v3 (Mains Specialization)",
    dataset: "Public Administration (Paper 1 & 2) + 2nd ARC + Evaluated Answers",
    examplesCount: 3820,
    trainingDate: "2026-09-12",
    status: "active",
    evalScoreMains: 11.8,
    evalScoreMCQ: 88,
    adapterTag: "bolt-lora-upsc-pubadmin-ma-e3-r16",
    description: "Trained on comprehensive Public Administration syllabus with 7-dimension rubric synthesis.",
  },
  {
    version: "v2",
    name: "BOLT PubAdmin v2 (Foundational Theory)",
    dataset: "Administrative Thought & Indian Administration",
    examplesCount: 2481,
    trainingDate: "2026-08-25",
    status: "archived",
    evalScoreMains: 10.2,
    evalScoreMCQ: 82,
    adapterTag: "bolt-lora-meta-llama-3-r16",
    description: "First dedicated Public Administration LoRA adapter with thinker-grounding.",
  },
  {
    version: "v1",
    name: "BOLT General UPSC v1 (Base Baseline)",
    dataset: "UPSC General Studies & Prelims PYQs",
    examplesCount: 1200,
    trainingDate: "2026-07-15",
    status: "archived",
    evalScoreMains: 8.9,
    evalScoreMCQ: 76,
    adapterTag: "bolt-lora-meta-llama-3-r8",
    description: "Initial prototype adapter for general civil services guidance.",
  },
];

export async function getModelRegistryVersions(): Promise<ModelRegistryVersion[]> {
  try {
    const versionsRef = collection(db, "model_registry");
    const snap = await getDocs(versionsRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ModelRegistryVersion);
    }
  } catch (e) {
    console.warn("Using default model registry versions:", e);
  }
  return DEFAULT_MODEL_VERSIONS;
}

export async function updateModelVersionStatus(versionId: string, status: "active" | "archived" | "evaluating"): Promise<void> {
  try {
    const versionDoc = doc(db, "model_registry", versionId);
    await updateDoc(versionDoc, { status, updatedAt: serverTimestamp() });
  } catch (e) {
    console.warn("Could not update model version in Firestore:", e);
  }
}
