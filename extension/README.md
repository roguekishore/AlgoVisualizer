# DSA Skill Tree Sync — Chrome Extension

> Real-time DSA World Map progress tracker with auto-sync, account verification,
> and token-based authentication for the **AlgoVisualizer (Vantage)** platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Reference](#file-reference)
4. [Authentication Flow](#authentication-flow)
5. [State Model (`chrome.storage.local`)](#state-model-chromestoragelocal)
6. [Sync Flows](#sync-flows)
   - [Auto-sync (real-time)](#auto-sync-real-time)
   - [Manual sync (popup)](#manual-sync-popup)
7. [Account Mismatch Detection](#account-mismatch-detection)
8. [Error Handling & Resilience](#error-handling--resilience)
9. [Setup & Installation](#setup--installation)
10. [Development Notes](#development-notes)

---

## Overview

This Chrome MV3 extension bridges **LeetCode** and the **Vantage** web app
(AlgoVisualizer). It:

| Feature | Description |
|---|---|
| **Auto-sync** | Automatically detects accepted/attempted submissions on LeetCode and pushes them to the Spring Boot backend in real time. |
| **Manual bulk sync** | "Sync Now" button in the popup fetches *all* accepted solutions from LeetCode's GraphQL API and sends them to the backend in one batch. |
| **Account verification** | Compares the active LeetCode session with the app-linked account and blocks sync if they don't match, preventing impersonation. |
| **Token authentication** | Every backend request carries a `Bearer` session token tied to the authenticated user, so the server never trusts a client-provided `lcusername`. |
| **Live popup updates** | The popup UI reactively updates whenever login/logout occurs in any tab, without needing to close and reopen. |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  LeetCode tab  (https://leetcode.com/problems/*)             │
│                                                              │
│  ┌──────────────────────┐  CustomEvents  ┌────────────────┐  │
│  │  injected.js         │ ─────────────> │ content-script  │  │
│  │  (MAIN world)        │  lc-vantage-*  │  (ISOLATED)     │  │
│  │  wraps fetch + XHR   │                │  auth check     │  │
│  │  detects submissions │                │  → sendMessage  │  │
│  └──────────────────────┘                └───────┬────────┘  │
│                                                  │           │
└──────────────────────────────────────────────────│───────────┘
                                                   │ chrome.runtime
                                                   ▼
                                          ┌────────────────┐
                                          │  background.js  │
                                          │  (service wkr)  │
                                          │  POST /api/sync │
                                          └───────┬────────┘
                                                  │ fetch + Bearer token
                                                  ▼
                                       ┌─────────────────────┐
                                       │  Spring Boot backend │
                                       │  localhost:8080      │
                                       └─────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  React app tab  (http://localhost:3000/*)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  content-script.js (ISOLATED)                          │  │
│  │  reads localStorage("user") → writes chrome.storage    │  │
│  │  listens for VANTAGE_LOGIN / VANTAGE_LOGOUT postMsg    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Popup (popup.html)  │
│  reads chrome.storage│
│  queries backend     │
│  Sync Now → GraphQL  │
│       + POST backend │
└──────────────────────┘
```

### Key design decisions

| Decision | Reason |
|---|---|
| **Auth check in content-script, not background** | Content-scripts inside LeetCode pages have full cookie access; MV3 service workers cannot reliably attach third-party cookies. |
| **`lcSessionUser` cached in chrome.storage** | The popup runs in the extension's own origin and cannot read LeetCode cookies. The content-script writes the session username to storage so the popup can read it. |
| **Token-based backend auth** | Prevents impersonation — the backend resolves the user from the `Bearer` token, ignoring any client-provided `lcusername`. |
| **Dual content-script contexts** | `injected.js` runs in MAIN world (can wrap `fetch`/`XHR`), while `content-script.js` runs in ISOLATED world (has chrome API access). They communicate via `CustomEvent`. |

---

## File Reference

### `manifest.json`

| Field | Value |
|---|---|
| `manifest_version` | 3 |
| `permissions` | `storage`, `activeTab` |
| `host_permissions` | `https://leetcode.com/*`, `http://localhost:8080/*`, `http://localhost:3000/*` |
| `background.service_worker` | `background.js` |
| Content scripts | See below |

**Content script injection:**

| Script | World | `run_at` | Matches |
|---|---|---|---|
| `injected.js` | MAIN | `document_start` | `leetcode.com/problems/*`, `leetcode.com/submissions/*` |
| `content-script.js` | ISOLATED (default) | `document_idle` | `leetcode.com/problems/*`, `leetcode.com/submissions/*`, `localhost:3000/*` |

---

### `injected.js` — MAIN world interceptor

Runs at `document_start` in LeetCode's own JS context *before* React boots.

**Responsibilities:**

1. **Wrap `window.fetch` and `XMLHttpRequest`** to intercept LeetCode API calls.
2. **Detect submission POSTs** (`/problems/{slug}/submit/`) — stores the problem slug.
3. **Watch polling responses** (`/submissions/detail/{id}/check/`) — when `state === "SUCCESS"`, dispatches a `lc-vantage-result` `CustomEvent` with full result metadata.
4. **Query the current LC session** (relative GraphQL `/graphql`) on page load and dispatch `lc-vantage-user` so the content-script can cache the username.

**Events dispatched:**

| Event name | Payload | When |
|---|---|---|
| `lc-vantage-result` | `{ slug, statusMsg, statusCode, lang, runtime, memory, accepted, … }` | Judge finishes (accepted or rejected) |
| `lc-vantage-user` | `{ username, isSignedIn }` | Page load (session query result) |

---

### `content-script.js` — ISOLATED world bridge

Runs at `document_idle`. Behaviour depends on the host:

#### On `localhost:3000` (React app)

Keeps `chrome.storage.local` in sync with the React app's `localStorage("user")`:

| Trigger | Mechanism |
|---|---|
| Page load | Reads `localStorage("user")` immediately |
| Login/signup | Listens for `VANTAGE_LOGIN` `postMessage` from the React app |
| Logout | Listens for `VANTAGE_LOGOUT` `postMessage` |
| Cross-tab change | `window.addEventListener('storage')` fires when another tab writes to `localStorage` |
| Tab becomes visible | `visibilitychange` event → re-reads `localStorage` |
| Safety-net poll | `setInterval` every 15 seconds |

Writes/removes `{ lcusername, uid, sessionToken }` in `chrome.storage.local`.

#### On `leetcode.com` (LeetCode)

1. **Caches the LC session** — listens for `lc-vantage-user` → persists `lcSessionUser` to `chrome.storage.local` so the popup can read it reliably.
2. **Auth-checks every submission** — compares the live LC session (`currentLcUser`) with the stored `lcusername`. Only forwards to background if they match.
3. **Forwards results to background** via `chrome.runtime.sendMessage`:
   - `submissionAccepted` → solved
   - `submissionAttempted` → attempted
   - `authMismatch` → blocked (wrong account)
4. **DOM MutationObserver fallback** — if the fetch/XHR interception misses a result, a DOM observer catches the `[data-e2e-locator="submission-result"]` element.

#### Context invalidation guard

After extension reload/update, old content-scripts become "zombies" with no chrome API access. Every chrome.\* call is wrapped in a safe helper (`safeStorageGet`, `safeStorageSet`, `safeSendMessage`, etc.) that:

- Checks `chrome.runtime.id` before each call
- Sets `_contextDead = true` on first failure
- Logs a one-time warning: *"Extension was reloaded — this tab has a stale content-script. Please refresh the page (F5) to restore sync."*
- Stops the polling interval and prevents further API calls

---

### `background.js` — MV3 service worker

Receives `chrome.runtime.sendMessage` calls from content-scripts and forwards
them to the Spring Boot backend.

**Message actions:**

| Action | Endpoint | Method | Description |
|---|---|---|---|
| `submissionAccepted` | `/api/sync` | POST | Marks a problem as SOLVED |
| `submissionAttempted` | `/api/sync/attempt` | POST | Marks a problem as ATTEMPTED |
| `syncWithBackend` | `/api/sync` | POST | Legacy bulk sync from popup |
| `authMismatch` | *(none)* | — | Flashes a red **!** badge for 8 seconds |

**Authentication:** Reads `sessionToken` from `chrome.storage.local` and attaches
it as `Authorization: Bearer <token>` on every backend request.

**Badge feedback:**

| Badge | Color | Meaning |
|---|---|---|
| ✓ | Green | Submission synced successfully |
| ↩ | Indigo | Attempt recorded |
| E | Orange | Sync error |
| ! | Red | Account mismatch |

---

### `popup.html` + `popup.js` — Extension popup UI

The popup is the user-facing control panel. It shows:

| Row | Element ID | Description |
|---|---|---|
| **LC Session** | `#lcUser` | The LeetCode account currently signed in (from `lcSessionUser` in storage, with a direct GraphQL fallback) |
| **App Linked** | `#appLinkedUser` | The `lcusername` confirmed by the backend for this user |
| **Auth Chip** | `#authChip` | `✓ match`, `⚠ mismatch`, `not signed in`, `offline`, or `—` |
| **Sync Now** | `#syncBtn` | Manual bulk sync button |
| **Status Box** | `#statusBox` | Progress / result messages |
| **Sign-in Prompt** | `#signinPrompt` | Shown when no linked account is found |

**Auth status check (`checkAuthStatus`):**

1. Reads `{ lcusername, uid, sessionToken, lcSessionUser }` from `chrome.storage.local`.
2. Validates `uid` against the backend (`GET /api/users/{uid}`).
3. Updates `linked` username from the backend's response (authoritative source of truth).
4. Reads `lcSessionUser` from storage (cached by content-script) → falls back to direct GraphQL query.
5. Compares linked vs. session → sets the auth chip accordingly.

**Live updates:** `chrome.storage.onChanged` listener triggers `checkAuthStatus()`
whenever `lcusername`, `uid`, `sessionToken`, or `lcSessionUser` changes — even
while the popup is open.

**LeetCode rate-limit handling:** The `lcQuery()` helper retries with exponential
back-off (1 s, 2 s, 3 s) on HTTP `429` and `499` responses (up to 3 attempts).

---

## Authentication Flow

```
React App                Extension                    Spring Boot
─────────                ─────────                    ───────────
Login / Signup  ────────>
                         VANTAGE_LOGIN postMessage
                         { lcusername, uid,
                           sessionToken }
                         ───> chrome.storage.local.set()
                                                                
                         ┌─ On LeetCode submit ────┐
                         │ content-script checks:   │
                         │  LC session == stored lc? │
                         │  YES → forward to bgnd   │
                         │  NO  → block + badge "!" │
                         └──────────────────────────┘
                                   │
                                   ▼
                         background.js
                         Authorization: Bearer <token>
                         POST /api/sync
                         { lcusername, leetcodeSlugs }
                                                      ───>
                                                      resolveToken(token)
                                                      → finds User by token
                                                      → uses THAT user's
                                                        lcusername (ignores
                                                        client-provided one)
                                                      → syncs problems
```

**Why this prevents cheating:** Even if someone crafts a request with another
user's `lcusername`, the backend ignores it and resolves the actual owner from
the `Bearer` token. The token is a random UUID generated at login/signup and
stored in the database.

---

## State Model (`chrome.storage.local`)

| Key | Written by | Read by | Type | Description |
|---|---|---|---|---|
| `lcusername` | content-script (localhost) | popup, content-script (LC) | `string` | App-linked LeetCode username |
| `uid` | content-script (localhost) | popup | `number` | Backend user ID |
| `sessionToken` | content-script (localhost) | popup, background | `string` | UUID Bearer token for backend auth |
| `lcSessionUser` | content-script (LeetCode) | popup | `string` | Currently signed-in LeetCode username |

All four keys are **cleared** on `VANTAGE_LOGOUT`.

---

## Sync Flows

### Auto-sync (real-time)

Triggered automatically whenever you submit a solution on LeetCode.

```
1. You click "Submit" on a LeetCode problem
2. injected.js intercepts the POST to /problems/{slug}/submit/
3. injected.js watches the polling response (/check/)
4. When the judge returns a result:
   → dispatches lc-vantage-result CustomEvent
5. content-script.js receives the event
6. Auth check: is the LC session == app-linked account?
   YES → sends chrome.runtime.sendMessage to background
   NO  → blocks sync, warns in console, flashes "!" badge
7. background.js POSTs to /api/sync (accepted) or /api/sync/attempt
   with Bearer token in Authorization header
8. Backend resolves user from token, syncs the problem
9. Badge flashes ✓ (accepted) or ↩ (attempted)
```

### Manual sync (popup)

Triggered by clicking **Sync Now** in the popup.

```
1. Popup queries LeetCode GraphQL: userStatus → gets username
2. Popup queries LeetCode GraphQL: problemsetQuestionList
   (filters: { status: "AC" }, limit: 3000)
3. Collects all accepted problem slugs
4. POSTs to /api/sync with Bearer token + all slugs
5. Backend returns { updated, matched }
6. Popup shows "X newly synced · Y matched on map"
```

---

## Account Mismatch Detection

The extension prevents syncing data under the wrong account at **three levels**:

| Level | Where | What happens |
|---|---|---|
| **Content-script** | LeetCode tab | Compares `currentLcUser` (from `lc-vantage-user`) with `lcusername` (from chrome.storage). Blocks the sync and sends `authMismatch` to background. |
| **Popup** | Auth chip | Shows `⚠ mismatch` with an explanation message and instructions to re-link or switch LC account. |
| **Backend** | `SyncController` | Ignores the client-provided `lcusername` and resolves the actual user from the `Bearer` token. If no token is present, falls back to lcusername lookup (legacy path). |

---

## Error Handling & Resilience

| Scenario | Handling |
|---|---|
| **Extension reloaded** while tabs are open | Context-invalidation guard detects dead `chrome.runtime.id`, stops all polling, logs a one-time warning to refresh. |
| **Backend offline** | Popup shows "Backend offline". Auto-sync logs errors but doesn't crash. Badge flashes "E". |
| **LeetCode 429/499** (rate limit) | `lcQuery()` retries up to 3 times with exponential back-off (1s, 2s, 3s). |
| **No linked account** | Content-script blocks sync with a console warning. Popup shows sign-in prompt. |
| **Cross-tab login/logout** | `window.addEventListener('storage')` fires on all other localhost tabs → re-syncs to `chrome.storage`. Popup's `onChanged` listener reactively updates the UI. |
| **SPA navigation** | `VANTAGE_LOGIN`/`VANTAGE_LOGOUT` `postMessage` events fire on login/signup/logout actions within the React app. |
| **Fetch/XHR miss** | DOM `MutationObserver` fallback on LeetCode watches `[data-e2e-locator="submission-result"]` as a safety net. |

---

## Setup & Installation

### Prerequisites

| Dependency | Version | Purpose |
|---|---|---|
| Google Chrome | 116+ | MV3 support |
| Spring Boot backend | Running on `localhost:8080` | `/api/sync`, `/api/users` endpoints |
| React app | Running on `localhost:3000` | User login/signup, profile management |

### Install the extension (developer mode)

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this repository.
5. The **DSA Skill Tree Sync** extension icon should appear in your toolbar.

### First-time setup

1. **Sign up / Log in** on the React app at `http://localhost:3000`.
2. Set your **LeetCode username** in your profile.
3. **Sign in to LeetCode** in another tab (`https://leetcode.com`).
4. Click the extension icon → the popup should show:
   - **LC Session:** `@your_lc_username` (green dot)
   - **App Linked:** `@your_lc_username`
   - **Auth Chip:** `✓ match`
5. Click **Sync Now** to do an initial bulk sync of all your accepted solutions.
6. From now on, every submission on LeetCode auto-syncs in real time.

---

## Development Notes

### Debugging

| What to inspect | How |
|---|---|
| Content-script logs | Open DevTools on the LeetCode / localhost tab → Console (filter by `[Vantage]`) |
| Background (service worker) logs | `chrome://extensions` → DSA Skill Tree Sync → "Service worker" link → Console |
| Popup logs | Right-click the extension icon → "Inspect popup" |
| chrome.storage contents | In any extension DevTools console: `chrome.storage.local.get(null, console.log)` |

### Common gotchas

- **"Extension context invalidated"** — You reloaded/updated the extension while
  LeetCode tabs were open. Refresh those tabs (F5) to inject a fresh content-script.
- **Popup shows "Not detected" for LC Session** — No LeetCode tab is open, or the
  content-script hasn't run yet. Open any LeetCode problem page to cache the session.
- **Auto-sync not firing** — The content-script only matches `/problems/*`. It won't
  intercept submissions from the LeetCode Playground or Contest pages.

### Adding support for new pages

To intercept submissions on additional LeetCode URL patterns (e.g., contests):

1. Add the new URL pattern to `manifest.json` → `content_scripts[].matches`.
2. Ensure `injected.js`'s URL regexes (`SUBMIT_RE`, `CHECK_RE_*`) cover the new
   API paths LeetCode uses on those pages.
3. Reload the extension and refresh the target page.

### Manifest permissions

The extension uses the minimum required permissions:

- **`storage`** — Read/write `chrome.storage.local` for state bridging.
- **`activeTab`** — Not strictly required currently but reserved for future features.
- **`host_permissions`** — `leetcode.com` (intercept submissions + session),
  `localhost:8080` (backend API), `localhost:3000` (content-script injection on React app).
