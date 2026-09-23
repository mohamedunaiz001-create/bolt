import { initializeApp, getApps, App, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK for token verification and claims management.
 * Credentials must come from environment variables or Google Application Default Credentials.
 */
export function initFirebaseAdmin(): App | null {
  if (isInitialized || getApps().length > 0) {
    isInitialized = true;
    return getApps()[0] || null;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        const app = initializeApp({
          credential: cert(sa),
          projectId: projectId || sa.project_id,
        });
        isInitialized = true;
        console.log("Firebase Admin initialized with service account.");
        return app;
      } catch (err: any) {
        console.warn("Failed parsing FIREBASE_SERVICE_ACCOUNT:", err.message);
      }
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      if (fs.existsSync(credentialsPath)) {
        const sa = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
        const app = initializeApp({
          credential: cert(sa),
          projectId: projectId || sa.project_id,
        });
        isInitialized = true;
        console.log("Firebase Admin initialized from application credentials file.");
        return app;
      }
    }

    if (projectId) {
      const app = initializeApp({ projectId });
      isInitialized = true;
      console.log("Firebase Admin initialized for project:", projectId);
      return app;
    }

    console.warn(
      "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT, " +
        "GOOGLE_APPLICATION_CREDENTIALS, or FIREBASE_PROJECT_ID."
    );
    return null;
  } catch (e: any) {
    console.warn("Firebase Admin initialization notice (operating in fallback mode):", e.message);
    return null;
  }
}

/** Set custom admin claims on a Firebase user account. */
export async function setAdminCustomClaim(uid: string, isAdmin: boolean): Promise<boolean> {
  try {
    const app = initFirebaseAdmin();
    if (!app) return false;

    const auth = getAuth(app);
    await auth.setCustomUserClaims(uid, {
      admin: isAdmin,
      role: isAdmin ? "admin" : "student",
    });
    return true;
  } catch (err: any) {
    console.warn(`setAdminCustomClaim notice for user ${uid}:`, err.message);
    return false;
  }
}
