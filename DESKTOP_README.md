# BOLT Desktop — Windows Client

BOLT Desktop is a thin, hardened Electron shell around the existing production
BOLT web app. It does **not** bundle a copy of the frontend or backend — it
loads `https://bolt-maddy.vercel.app` (or whatever `BOLT_APP_URL` is set to)
directly, the same way a real desktop browser would, and adds native-app
conveniences (installer, Start Menu entry, splash screen, offline/crash
fallback screens, Windows notifications, auto-update, and a proper deep-link
Google sign-in flow).

This was possible with almost no changes to the existing app because BOLT's
frontend already calls its API with relative paths (`/api/...`) rather than
an absolute base URL — so pointing the Electron window at the production
origin makes every existing API call, RAG upload, chat session, etc. work
unmodified.

## Architecture

```
BOLT Desktop (Electron, Windows)
   │
   │  BrowserWindow → loadURL(BOLT_APP_URL)     (contextIsolation, no nodeIntegration, sandboxed)
   │  preload.ts → window.boltDesktop bridge    (only privileged surface exposed to the page)
   │
   ▼
https://bolt-maddy.vercel.app   (unchanged production BOLT deployment)
   │
   ▼
Firebase Auth · Firestore · Cloud Storage · AI Gateway · RAG
   (all server-side, unchanged, same project as the web app)
```

Nothing server-side moved. No Firebase Admin credentials, Gemini keys, or
other secrets exist anywhere in the Electron process or the packaged
installer — they stay exactly where they already were, on the server.

## What's new in the repo

| Path | Purpose |
|---|---|
| `electron/main.ts` | App lifecycle, window creation, security wiring, deep-link + crash/offline handling |
| `electron/preload.ts` | The **only** bridge exposed to the loaded page, via `contextBridge` |
| `electron/security.ts` | Navigation allowlist, external-link handling, permission lockdown |
| `electron/deepLink.ts` | Parses and CSRF-validates the `bolt://auth-callback` deep link |
| `electron/updater.ts` | `electron-updater` wiring (manual publish config — see below) |
| `electron/logger.ts` | `electron-log` wrapper with basic token/secret redaction |
| `electron/renderer/*.html` | Local splash / offline / crash fallback pages |
| `build/electron-builder.yml` | Windows NSIS installer config |
| `build/icons/icon.ico` | Generated from your existing `public/pwa-512x512.png` |
| `src/lib/desktopBridge.ts` | Typed accessor for `window.boltDesktop` (undefined on web — no behavior change there) |
| `src/services/userService.ts` | `signInWithGoogle()` now branches to the desktop flow *only* when `window.boltDesktop` exists |
| `server/desktopAuth.ts` | New `/api/desktop-auth/exchange` endpoint (verifies a Firebase ID token, mints a custom token) |
| `public/desktop-auth.html` | Runs Google sign-in in the user's **real system browser**, then redirects to `bolt://auth-callback` |

## Why Google sign-in needed a new flow

Google blocks OAuth (`signInWithPopup`) inside embedded/Electron browser
windows outright (`disallowed_useragent`). So BOLT Desktop never attempts
sign-in inside its own window:

1. Electron opens the system default browser to `/desktop-auth.html?state=…`.
2. That static page runs normal Firebase Google sign-in (allowed — it's a
   real browser).
3. It POSTs the resulting Firebase ID token to `/api/desktop-auth/exchange`.
4. The server verifies that token cryptographically with the Admin SDK
   (`verifyIdToken`, not the faster non-cryptographic decode the rest of the
   API uses) and mints a short-lived custom token.
5. The page redirects to `bolt://auth-callback?state=…&token=…`.
6. Electron's protocol handler checks the `state` against the one it
   generated (rejecting anything else) and hands the token to the renderer,
   which calls `signInWithCustomToken`.

Email/password sign-in needed no changes — it already works fine inside an
embedded window and runs exactly as it does on the web.

## Build & run

```bash
npm install                 # pulls in electron, electron-builder, electron-updater, electron-log, etc.

# Development: run the web app locally AND the desktop shell pointed at it
npm run desktop:dev

# Production: compile the Electron shell (no web build needed — see above)
npm run desktop:build

# Package an unpacked app (for quick local testing, no installer)
npm run desktop:package

# Build the full Windows installer
npm run desktop:installer
```

Installer output: `release/BOLT-Setup-1.0.0.exe` (electron-builder's default
`dist/` output directory was renamed to `release/` to avoid colliding with
Vite's own `dist/` build output and the compiled `dist-electron/` main
process — same idea as the spec's `dist-electron/BOLT-Setup-*.exe`, just a
non-colliding folder name).

## Troubleshooting

**`7za.exe` crashes with exit code `3221226505` while building the installer.**
That's a Windows stack-buffer-overrun inside 7-Zip itself, not your code. Two
known causes, both worth fixing regardless of which one is it:
- **Bundle size.** Earlier versions of `build/electron-builder.yml` let
  electron-builder auto-include the *entire* root `node_modules` (react,
  firebase, vite, esbuild — everything the web app needs, none of which the
  Electron shell does), producing a ~600MB unpacked app. That's now fixed:
  `scripts/prepare-electron-dist.mjs` installs only `electron-log` +
  `electron-updater` into an isolated `dist-electron/node_modules`, and
  `electron-builder.yml` explicitly excludes the root `node_modules` from
  packaging. The unpacked app should now be a few tens of MB, not hundreds.
- **Building inside a OneDrive-synced folder.** If your project lives under
  `...\OneDrive\Desktop\...`, OneDrive can lock files mid-sync while 7-Zip is
  reading them, which is a well-known trigger for this exact crash. Move the
  project to a local, non-synced path (e.g. `C:\dev\bolt`), or pause OneDrive
  sync / exclude the folder from it while building.
- If it still happens: temporarily exclude the project folder from
  Windows Defender / your antivirus's real-time scanning (AVs intercepting
  7-Zip's file handles mid-archive is the other common cause), then retry
  `npm run desktop:installer`.

## Known limitations / what's genuinely left to do

I inspected the repo, designed the architecture, and wrote every source file
listed above — but I could not run `npm install`, compile, package, or test
any of this myself: this sandbox has no network access and no Windows
machine. Concretely, still needed before this is shippable:

- **Run it once.** `npm install && npm run desktop:dev` on your machine and
  fix whatever the first real compile turns up (version pins above are my
  best-effort choices, not verified against your other dependency versions).
- **Code signing.** No certificate is configured. Without one, Windows
  SmartScreen will show an "unrecognized publisher" warning on first run —
  functionally fine, but not the polished experience. Add a cert and a
  `win.certificateFile`/`certificatePassword` (or CI signing step) in
  `build/electron-builder.yml` when you have one.
- **Auto-update publish target.** `electron-updater` is wired up but has no
  `publish` target configured yet (see the commented-out block at the bottom
  of `build/electron-builder.yml`) — pick GitHub Releases or a generic static
  host and fill it in.
- **Deep-link registration on a clean machine.** `app.setAsDefaultProtocolClient('bolt')`
  is called on every launch, which is the standard approach, but the very
  first real end-to-end Google sign-in test (fresh install → click "Continue
  with Google" → browser → back to the app) needs to happen on a real
  Windows box to confirm the OS actually routes the `bolt://` link back to a
  *running* vs *cold-started* instance correctly in both cases.
- **CSP.** I deliberately did *not* inject a Content-Security-Policy header,
  since getting it wrong would silently break Firebase/Google/Gemini network
  calls the real site depends on, and I can't test against live traffic from
  here. Electron's navigation allowlist (which I did implement) covers the
  actual attack surface that matters (arbitrary sites loading inside the
  privileged window); a CSP would be extra hardening on top, worth adding
  once you can watch real network requests fail/pass in dev.
- Windows notification **preferences UI**, a visible **update banner** in the
  app itself, and the **Settings → About BOLT → Check for updates** UI are
  not built — the underlying IPC/bridge (`window.boltDesktop.onUpdateStatus`,
  `checkForUpdates`, `installUpdateAndRestart`) is there for your React app
  to call, but no component calls it yet.
- Sections 23 (Windows 10/11 test matrix), 24 (startup performance tuning),
  29 (CI/CD pipeline), and the full acceptance checklist in the original spec
  all require an actual Windows environment and are unverified.

None of this is destructive to try — worst case something in `npm install`
or the first build needs a version bump, which is a normal part of getting
any new Electron project running the first time.
