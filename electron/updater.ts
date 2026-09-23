import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import logger from "./logger";
import { IPC } from "./constants";

autoUpdater.autoDownload = false; // ask before using the user's bandwidth
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = logger;

let wired = false;

/** Wires electron-updater events to the given window's renderer via IPC. Safe to call once. */
export function initAutoUpdater(getWindow: () => BrowserWindow | null): void {
  if (wired) return;
  wired = true;

  const send = (status: Parameters<typeof autoUpdater.emit>[0] extends never ? never : any) => {
    getWindow()?.webContents.send(IPC.UPDATE_STATUS, status);
  };

  autoUpdater.on("checking-for-update", () => send({ state: "checking" }));
  autoUpdater.on("update-available", (info) => {
    send({ state: "available", version: info.version });
    autoUpdater.downloadUpdate().catch((err) => logger.error("downloadUpdate failed:", err.message));
  });
  autoUpdater.on("update-not-available", () => send({ state: "not-available" }));
  autoUpdater.on("download-progress", (progress) => {
    send({ state: "downloading", percent: Math.round(progress.percent) });
  });
  autoUpdater.on("update-downloaded", (info) => send({ state: "downloaded", version: info.version }));
  autoUpdater.on("error", (err) => {
    logger.error("autoUpdater error:", err.message);
    send({ state: "error", message: "Update check failed." });
  });

  // Check on startup, then every 4 hours. Never force-installs — the
  // renderer decides when to prompt "Restart to update" (see
  // src/lib/desktopBridge.ts onUpdateStatus and UPDATE_DOWNLOADED handling
  // in electron/main.ts, which only quits+installs after explicit consent).
  checkForUpdatesSafely();
  setInterval(checkForUpdatesSafely, 4 * 60 * 60 * 1000);
}

export function checkForUpdatesSafely(): void {
  autoUpdater.checkForUpdates().catch((err) => {
    // Expected in dev / when no publish config is configured yet — not fatal.
    logger.warn("checkForUpdates skipped:", err.message);
  });
}

export function quitAndInstallUpdate(): void {
  autoUpdater.quitAndInstall();
}
