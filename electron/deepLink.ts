import { randomBytes } from "crypto";
import logger from "./logger";
import { BOLT_PROTOCOL } from "./constants";

/**
 * Tracks the single in-flight desktop sign-in attempt. A random `state`
 * value is handed to the system-browser page and must round-trip back
 * through the bolt://auth-callback deep link before its token is trusted —
 * this stops a stray/forged deep link from injecting a credential.
 */
let pendingState: { value: string; expiresAt: number } | null = null;

export function createPendingAuthState(): string {
  const value = randomBytes(24).toString("hex");
  pendingState = { value, expiresAt: Date.now() + 5 * 60 * 1000 };
  return value;
}

function consumePendingState(state: string): boolean {
  if (!pendingState) return false;
  const { value, expiresAt } = pendingState;
  pendingState = null;
  return value === state && Date.now() < expiresAt;
}

export interface AuthCallbackResult {
  token: string;
}

/**
 * Parses a bolt://auth-callback?state=...&token=... URL (from either
 * app.on('open-url') on macOS or a second-instance argv on Windows/Linux)
 * and returns the embedded custom token only if the CSRF state matches a
 * sign-in this app instance actually started.
 */
export function parseAuthCallback(rawUrl: string): AuthCallbackResult | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== `${BOLT_PROTOCOL}:`) return null;
  // Accept both bolt://auth-callback?... and bolt:auth-callback?... shapes.
  const host = parsed.hostname || parsed.pathname.replace(/^\/+/, "");
  if (host !== "auth-callback") return null;

  const state = parsed.searchParams.get("state") || "";
  const token = parsed.searchParams.get("token") || "";
  if (!state || !token) return null;

  if (!consumePendingState(state)) {
    logger.warn("Rejected deep-link auth callback with unknown/expired state.");
    return null;
  }

  return { token };
}

/** Finds a bolt://... URL among process argv (Windows/Linux launch args). */
export function findDeepLinkInArgv(argv: string[]): string | null {
  return argv.find((arg) => arg.startsWith(`${BOLT_PROTOCOL}://`)) || null;
}
