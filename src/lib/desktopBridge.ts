/**
 * Optional bridge to the BOLT Desktop (Electron) shell.
 *
 * On the web, `window.boltDesktop` is undefined and every call site here
 * falls back to normal browser behavior unchanged. Inside the packaged
 * desktop app, electron/preload.ts exposes this object via a context-isolated
 * contextBridge — never raw Node/Electron APIs.
 */
export interface BoltDesktopBridge {
  isDesktop: true;
  platform: string;
  appVersion: string;
  /** Opens the system browser to the desktop-auth bridge page and returns the state token used to correlate the callback. */
  startGoogleAuth: () => Promise<string>;
  /** Registers a one-time listener for the custom token delivered via the bolt:// deep-link callback. */
  onAuthToken: (callback: (token: string) => void) => () => void;
  openExternal: (url: string) => void;
  getConnectivity: () => Promise<{ online: boolean }>;
  onConnectivityChange: (callback: (online: boolean) => void) => () => void;
  checkForUpdates: () => void;
  installUpdateAndRestart: () => void;
  onUpdateStatus: (callback: (status: DesktopUpdateStatus) => void) => () => void;
}

export type DesktopUpdateStatus =
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "not-available" }
  | { state: "downloading"; percent: number }
  | { state: "downloaded"; version: string }
  | { state: "error"; message: string };

declare global {
  interface Window {
    boltDesktop?: BoltDesktopBridge;
  }
}

export function getDesktopBridge(): BoltDesktopBridge | null {
  return typeof window !== "undefined" && window.boltDesktop ? window.boltDesktop : null;
}
