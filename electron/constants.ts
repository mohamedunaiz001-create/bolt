/**
 * Central, non-secret configuration for the BOLT Desktop shell.
 * Nothing in this file is sensitive — it only names the production origin
 * BOLT talks to and the custom protocol used for the OAuth deep-link
 * callback. Server-side secrets (Gemini keys, Firebase Admin credentials,
 * etc.) never enter the Electron process.
 */

/** The production BOLT web origin this desktop shell is a client of. */
export const BOLT_APP_URL = process.env.BOLT_APP_URL || "https://bolt-maddy.vercel.app";

/** Custom protocol used for the desktop OAuth deep-link callback (bolt://auth-callback?...). */
export const BOLT_PROTOCOL = "bolt";

/** IPC channel names — kept in one place so main/preload/renderer never drift. */
export const IPC = {
  AUTH_START_GOOGLE: "auth:start-google",
  AUTH_TOKEN: "auth:token",
  SHELL_OPEN_EXTERNAL: "shell:open-external",
  CONNECTIVITY_GET: "connectivity:get",
  CONNECTIVITY_CHANGED: "connectivity:changed",
  UPDATE_CHECK: "update:check",
  UPDATE_INSTALL: "update:install",
  UPDATE_STATUS: "update:status",
  APP_VERSION: "app:version",
} as const;
