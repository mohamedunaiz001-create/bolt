import { BrowserWindow, WebContents, shell, session } from "electron";
import { BOLT_APP_URL } from "./constants";
import logger from "./logger";

const allowedOrigin = new URL(BOLT_APP_URL).origin;

/**
 * Origins the privileged Electron window is allowed to navigate to directly.
 * Everything else (including Google's own accounts.google.com sign-in
 * pages) is intentionally NOT in this list — those flows happen in the
 * user's real system browser via the bolt:// deep-link bridge, never inside
 * the app's own webContents. See electron/main.ts + public/desktop-auth.html.
 */
function isAllowedOrigin(targetUrl: string): boolean {
  try {
    return new URL(targetUrl).origin === allowedOrigin;
  } catch {
    return false;
  }
}

/**
 * Applies the full Electron security checklist to a window's webContents:
 * block navigation outside the BOLT origin, send window.open() and target=_blank
 * links to the system browser instead of spawning privileged child windows,
 * and deny permission requests the app has no legitimate use for.
 */
export function hardenWebContents(contents: WebContents): void {
  contents.setWindowOpenHandler(({ url }) => {
    // BOLT never legitimately needs a second in-app window; any link that
    // wants a new window (including OAuth pages) goes to the default browser.
    shell.openExternal(url).catch((err) => logger.warn("openExternal failed:", err.message));
    return { action: "deny" };
  });

  contents.on("will-navigate", (event, targetUrl) => {
    if (!isAllowedOrigin(targetUrl)) {
      event.preventDefault();
      shell.openExternal(targetUrl).catch((err) => logger.warn("openExternal failed:", err.message));
    }
  });

  contents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    // Notifications are handled natively (see electron/main.ts); the loaded
    // page itself never needs camera/mic/geolocation/etc.
    const allowed = permission === "notifications";
    callback(allowed);
  });
}

/** Locks down the default session before any window is created. */
export function hardenSession(): void {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === "notifications");
  });

  // Strip Electron's default UA suffix so the loaded site sees a normal
  // Chrome UA rather than one that flags it as an embedded webview to
  // third-party auth providers (relevant only if the site itself ever
  // opens an OAuth popup unexpectedly; the desktop app's own Google
  // sign-in never runs inside this session — see electron/main.ts).
  session.defaultSession.setUserAgent(
    session.defaultSession.getUserAgent().replace(/\sElectron\/\S+/, "")
  );
}

export function isTrustedOrigin(targetUrl: string): boolean {
  return isAllowedOrigin(targetUrl);
}
