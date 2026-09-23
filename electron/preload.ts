import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "./constants";
import type { BoltDesktopBridge, DesktopUpdateStatus } from "../src/lib/desktopBridge";

// contextIsolation is on and nodeIntegration is off (see electron/main.ts),
// so this is the ONLY surface the loaded page can use to reach anything
// privileged. Every method here is a narrow, single-purpose wrapper around
// one IPC round-trip — never a raw ipcRenderer/electron/node passthrough.

const bridge: BoltDesktopBridge = {
  isDesktop: true,
  platform: process.platform,
  appVersion: process.env.npm_package_version || "",

  startGoogleAuth: () => ipcRenderer.invoke(IPC.AUTH_START_GOOGLE),

  onAuthToken: (callback: (token: string) => void) => {
    const listener = (_event: unknown, token: string) => callback(token);
    ipcRenderer.on(IPC.AUTH_TOKEN, listener);
    return () => ipcRenderer.removeListener(IPC.AUTH_TOKEN, listener);
  },

  openExternal: (url: string) => {
    ipcRenderer.send(IPC.SHELL_OPEN_EXTERNAL, url);
  },

  getConnectivity: () => ipcRenderer.invoke(IPC.CONNECTIVITY_GET),

  onConnectivityChange: (callback: (online: boolean) => void) => {
    const listener = (_event: unknown, online: boolean) => callback(online);
    ipcRenderer.on(IPC.CONNECTIVITY_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC.CONNECTIVITY_CHANGED, listener);
  },

  checkForUpdates: () => ipcRenderer.send(IPC.UPDATE_CHECK),
  installUpdateAndRestart: () => ipcRenderer.send(IPC.UPDATE_INSTALL),

  onUpdateStatus: (callback: (status: DesktopUpdateStatus) => void) => {
    const listener = (_event: unknown, status: DesktopUpdateStatus) => callback(status);
    ipcRenderer.on(IPC.UPDATE_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC.UPDATE_STATUS, listener);
  },
};

contextBridge.exposeInMainWorld("boltDesktop", bridge);
