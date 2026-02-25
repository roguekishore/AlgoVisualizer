# Live Progress Updates — Server-Sent Events (SSE)

## Overview

This application uses **Server-Sent Events (SSE)** to push real-time progress updates from the Spring Boot backend to the React frontend. When a user completes or attempts a problem (either through the Chrome extension on LeetCode or directly in the app), all open browser tabs instantly reflect the change without requiring a page refresh.

---

## SSE vs WebSocket — Why SSE?

| Feature | SSE (Server-Sent Events) | WebSocket |
|---------|-------------------------|-----------|
| **Direction** | Server → Client (one-way) | Bidirectional (both ways) |
| **Protocol** | HTTP (uses `text/event-stream`) | Separate protocol (`ws://`) |
| **Auto-reconnect** | Built-in — browser reconnects automatically | Must implement manually |
| **Complexity** | Lightweight — no extra dependencies | Requires STOMP/SockJS or custom protocol |
| **Use case** | Server pushes updates to client | Real-time chat, multiplayer games |
| **Our need** | ✅ Backend tells React "progress changed" | ❌ React never needs to send data back |

**Decision**: SSE is perfect for our use case — we only need the backend to notify the frontend when progress changes. No bidirectional communication needed.

---

## Architecture Flow

```
┌──────────────┐
│   LeetCode   │ User submits a problem
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Chrome Extension │ Intercepts submission result
└──────┬───────────┘
       │
       │ POST /api/sync/attempt
       ▼
┌────────────────────────────────────────────────────┐
│           Spring Boot Backend                      │
│                                                    │
│  SyncController → SyncService.markAttempted()      │
│                        │                           │
│                        ▼                           │
│         Database UPDATE (UserProgress)             │
│                        │                           │
│                        ▼                           │
│  ProgressEventService.publish(userId, event)       │
│         │                                          │
│         └─► SseEmitter.send() [PER-USER STREAMS]  │
└─────────────────────┬──────────────────────────────┘
                      │ SSE Event (JSON)
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Browser  │    │ Browser  │    │ Browser  │
│  Tab 1   │    │  Tab 2   │    │  Tab 3   │  (all tabs for same user)
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     │ EventSource.onmessage        │
     │ (React client)               │
     ▼               ▼               ▼
┌────────────────────────────────────────┐
│   Zustand Store (useProgressStore)     │
│   completedProblems array merges       │
│   → Map component re-renders           │
└────────────────────────────────────────┘
```

---

## Backend Implementation

### 1. ProgressEvent (Data Model)

**File**: `springapp/src/main/java/com/backend/springapp/sse/ProgressEvent.java`

```java
package com.backend.springapp.sse;

/**
 * Lightweight event payload pushed to the React frontend via SSE
 * whenever a user's progress changes (solved/attempted via extension or in-app).
 */
public record ProgressEvent(
        Long   pid,        // backend problem ID
        String status,     // "SOLVED" | "ATTEMPTED"
        String slug,       // LC slug (nullable for in-app solves)
        int    attemptCount
) {}
```

#### Annotation: `record` (Java 14+)
- **What it does**: Automatically generates constructor, getters (`pid()`, `status()`), `equals()`, `hashCode()`, `toString()`
- **Why use it**: Immutable data carrier — perfect for events that should never be modified after creation
- **Equivalent to**:
  ```java
  @Data @AllArgsConstructor
  public class ProgressEvent {
      private final Long pid;
      private final String status;
      // ...
  }
  ```

---

### 2. ProgressEventService (SSE Manager)

**File**: `springapp/src/main/java/com/backend/springapp/sse/ProgressEventService.java`

This is the **core SSE orchestrator** — it manages per-user connections and broadcasts events.

#### Key Components

##### a) `@Service`
```java
@Slf4j
@Service
public class ProgressEventService {
```

- **`@Service`**: Marks this as a Spring-managed bean (business logic layer)
- **`@Slf4j`**: Lombok annotation — generates a `log` field for logging
- **Lifecycle**: Spring creates **one singleton instance** at startup — all users share the same service

---

##### b) Thread-Safe Connection Storage

```java
private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
```

| Data Structure | Why This Choice? |
|----------------|------------------|
| `ConcurrentHashMap<Long, List<SseEmitter>>` | Thread-safe map — multiple extension sync requests can fire simultaneously |
| **Key**: `Long` (userId) | Each user can have multiple open connections (multiple browser tabs) |
| **Value**: `List<SseEmitter>` | One emitter per tab — using `CopyOnWriteArrayList` for safe iteration during concurrent modifications |

**Why thread-safe?** The Chrome extension might sync 5 problems at once (bulk sync). Each triggers `publish()` concurrently. Without thread-safety → race conditions, lost events, or corrupted connection lists.

---

##### c) `subscribe(Long userId)` — Open SSE Connection

```java
public SseEmitter subscribe(Long userId) {
    SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
```

**`SseEmitter`**: Spring's built-in class for SSE streams
- **Constructor parameter**: Timeout in milliseconds (30 minutes here)
- **What it does**: Holds the HTTP response stream open, allows sending multiple events over time
- **After timeout**: Connection closes, browser's `EventSource` auto-reconnects

---

**Connection Registration**:
```java
emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
```

- **`computeIfAbsent`**: If `userId` key doesn't exist, create a new empty list — then add the emitter
- **`CopyOnWriteArrayList`**: Thread-safe list variant — safe to iterate while other threads add/remove

---

**Cleanup on Disconnect**:
```java
Runnable cleanup = () -> {
    List<SseEmitter> list = emitters.get(userId);
    if (list != null) {
        list.remove(emitter);
        if (list.isEmpty()) emitters.remove(userId);
    }
};
emitter.onCompletion(cleanup);
emitter.onTimeout(cleanup);
emitter.onError(e -> cleanup.run());
```

- **`onCompletion`**: Fires when client closes the connection gracefully (tab closed, page navigated away)
- **`onTimeout`**: Fires after 30 minutes of inactivity
- **`onError`**: Fires on network errors, browser crashes, etc.
- **Why important**: Prevents memory leaks — if we never remove dead emitters, the map grows forever

---

**Initial "Connected" Event**:
```java
emitter.send(SseEmitter.event()
        .name("connected")
        .data("{\"status\":\"connected\"}", MediaType.APPLICATION_JSON));
```

- **`.name("connected")`**: Event type — in JavaScript, this fires `EventSource.addEventListener('connected', ...)`
- **`.data(...)`**: JSON payload sent to the client
- **`MediaType.APPLICATION_JSON`**: Sets `Content-Type` header so browser parses it as JSON
- **Why send this?**: Confirms the connection is live — React logs "SSE connected" in console

---

##### d) `publish(Long userId, ProgressEvent event)` — Broadcast to All Tabs

```java
public void publish(Long userId, ProgressEvent event) {
    List<SseEmitter> list = emitters.get(userId);
    if (list == null || list.isEmpty()) {
        log.debug("No SSE subscribers for userId={}, skipping event", userId);
        return;
    }
```

**Early exit**: If no tabs are open for this user, don't waste CPU serializing JSON.

---

**Manual JSON Serialization** (avoiding Jackson dependency issues):
```java
String slug = event.slug() != null ? "\"" + event.slug().replace("\"", "\\\"") + "\"" : "null";
String json = String.format(
        "{\"pid\":%d,\"status\":\"%s\",\"slug\":%s,\"attemptCount\":%d}",
        event.pid(), event.status(), slug, event.attemptCount());
```

- **Why manual?**: Avoids importing `com.fasterxml.jackson.databind.ObjectMapper` (package path changed in Spring Boot 3.4+)
- **Escape handling**: `replace("\"", "\\\"")` prevents JSON injection if slug contains quotes
- **Null-safe**: If slug is null, outputs `"slug":null` (valid JSON)

---

**Broadcasting to All Tabs**:
```java
List<SseEmitter> dead = new java.util.ArrayList<>();
for (SseEmitter emitter : list) {
    try {
        emitter.send(SseEmitter.event()
                .name("progress-update")
                .data(json, MediaType.APPLICATION_JSON));
    } catch (IOException e) {
        log.debug("SSE send failed for userId={}, removing emitter", userId);
        dead.add(emitter);
    }
}
if (!dead.isEmpty()) {
    list.removeAll(dead);
    if (list.isEmpty()) emitters.remove(userId);
}
```

- **`emitter.send()`**: Writes data to the HTTP stream (non-blocking)
- **`IOException` handling**: Network errors (user lost WiFi, closed tab mid-send) — mark emitter as dead
- **Post-send cleanup**: Remove all failed emitters from the active list
- **Why not remove inside loop?** `CopyOnWriteArrayList` allows safe iteration, but batch removal is more efficient

---

### 3. ProgressEventController (SSE Endpoint)

**File**: `springapp/src/main/java/com/backend/springapp/sse/ProgressEventController.java`

```java
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"},
             allowCredentials = "true")
@RequiredArgsConstructor
public class ProgressEventController {
```

#### Annotations Explained

| Annotation | Purpose |
|------------|---------|
| `@RestController` | Combines `@Controller` + `@ResponseBody` — all methods return data (not views) |
| `@RequestMapping("/api/progress")` | Base path for all endpoints in this controller |
| `@CrossOrigin(...)` | **CORS** — allows React (`localhost:3000`) to call this endpoint from a different origin |
| `@RequiredArgsConstructor` | Lombok — generates constructor for all `final` fields (dependency injection) |

---

**Why `@CrossOrigin` is critical for SSE**:
- By default, browsers block cross-origin requests (React at `localhost:3000` calling Spring at `localhost:8080`)
- SSE uses `EventSource` which makes a GET request with `Accept: text/event-stream`
- Without `@CrossOrigin`, the browser gets a CORS error and the connection fails

---

#### SSE Endpoint

```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter stream(@RequestParam Long userId) {
    return progressEventService.subscribe(userId);
}
```

##### Annotations Breakdown

| Annotation | Purpose |
|------------|---------|
| `@GetMapping(value = "/stream")` | Maps `GET /api/progress/stream` to this method |
| `produces = MediaType.TEXT_EVENT_STREAM_VALUE` | Sets `Content-Type: text/event-stream` — tells browser this is an SSE stream |
| `@RequestParam Long userId` | Extracts `?userId=123` from query string, converts to `Long` |

---

**Full URL**: `http://localhost:8080/api/progress/stream?userId=1`

**What happens**:
1. React opens: `new EventSource("http://localhost:8080/api/progress/stream?userId=1")`
2. Browser sends `GET` request with `Accept: text/event-stream`
3. Spring calls `progressEventService.subscribe(1)`
4. Returns `SseEmitter` — Spring keeps the HTTP connection open
5. Every time `publish()` is called, data flows to the browser instantly

---

### 4. Wiring into Existing Services

#### SyncService (Extension Sync Path)

**File**: `springapp/src/main/java/com/backend/springapp/sync/SyncService.java`

```java
@Service
@RequiredArgsConstructor
public class SyncService {
    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final ProblemRepository problemRepository;
    private final ProgressEventService progressEventService; // ← INJECTED
```

**Dependency Injection**:
- `@RequiredArgsConstructor` generates constructor with all `final` fields
- Spring automatically injects `ProgressEventService` (because it's annotated with `@Service`)
- **Constructor-based DI** (recommended over `@Autowired` field injection — easier to test)

---

**Publishing Events After Solving**:

```java
@Transactional
public SyncResponseDTO syncProgress(String lcusername, List<String> slugs) {
    // ... resolve user, save progress to DB ...
    
    // Push live update to any open React tabs
    progressEventService.publish(uid, new ProgressEvent(
            pid, "SOLVED", slug,
            progress.getAttemptCount() != null ? progress.getAttemptCount() : 1));
    
    updated++;
    log.info("Synced: user={} problem={} ({})", lcusername, slug, problem.getTag());
}
```

**Why inside `@Transactional`?**
- Events are only published **after** the database commit succeeds
- If the transaction rolls back (DB error), no event is sent — prevents frontend showing stale/incorrect data
- **Transaction boundary**: Method entry → DB writes → commit → SSE publish → method exit

---

**Publishing Events After Attempts**:

```java
@Transactional
public boolean markAttempted(String lcusername, String lcslug) {
    // ... save attempt to DB ...
    
    progressRepository.save(progress);
    
    // Push live update to any open React tabs
    progressEventService.publish(uid, new ProgressEvent(
            pid, "ATTEMPTED", lcslug, progress.getAttemptCount()));
    
    log.info("Attempt recorded: user={} slug={} attempts={}", lcusername, lcslug, progress.getAttemptCount());
    return true;
}
```

---

#### UserProgressService (In-App Solve Path)

**File**: `springapp/src/main/java/com/backend/springapp/user/UserProgressService.java`

Same pattern — injected `ProgressEventService`, publishes after `markAsSolved()` and `markAsAttempted()`.

```java
@Transactional
public UserProgressResponseDTO markAsSolved(Long uid, Long pid) {
    // ... save to DB, award rating ...
    
    // Push live update to any open React tabs
    progressEventService.publish(uid, new ProgressEvent(
            pid, "SOLVED", problem.getLcslug(),
            saved.getAttemptCount() != null ? saved.getAttemptCount() : 1));
    
    return mapToDTO(saved);
}
```

**Coverage**: Events are now sent from:
1. ✅ Extension bulk sync (`POST /api/sync`)
2. ✅ Extension single attempt (`POST /api/sync/attempt`)
3. ✅ In-app solve button (`POST /api/progress/{pid}/solve`)
4. ✅ In-app attempt tracking (`POST /api/progress/{pid}/attempt`)

---

## Frontend Implementation

### React — Zustand Store

**File**: `reactapp/src/map/useProgressStore.js`

#### Opening the SSE Connection

```javascript
subscribeToLiveUpdates: (userId) => {
  if (!userId) return () => {};
  
  // Tear down any previous connection
  get()._eventSource?.close();
  
  const es = new EventSource(`${API_BASE}/progress/stream?userId=${userId}`);
  set({ _eventSource: es });
```

**`EventSource`**: Browser API for SSE
- **Built-in**: No library needed (works in all modern browsers)
- **Auto-reconnect**: If connection drops, browser retries after 3 seconds
- **Same-origin policy**: Must have CORS headers (which we do via `@CrossOrigin`)

---

#### Listening for Events

```javascript
es.addEventListener('connected', () => {
  console.log('[ProgressStore] SSE connected for userId', userId);
});

es.addEventListener('progress-update', (e) => {
  try {
    const event = JSON.parse(e.data);
    const frontendId = toFrontendId(event.pid);
    if (!frontendId) return;
    
    const { completedProblems } = get();
    
    if (event.status === 'SOLVED') {
      if (!completedProblems.includes(frontendId)) {
        console.log('[ProgressStore] Live update: SOLVED', frontendId, event.slug);
        set({ completedProblems: [...completedProblems, frontendId] });
```

**Event Name Matching**:
- Backend: `emitter.send(SseEmitter.event().name("progress-update"))`
- Frontend: `es.addEventListener('progress-update', ...)`
- **Must match exactly** — case-sensitive

---

**State Merge**:
```javascript
set({ completedProblems: [...completedProblems, frontendId] });
```

- **Immutable update**: Creates new array (React/Zustand detect changes via reference equality)
- **Deduplication**: `if (!completedProblems.includes(frontendId))` prevents duplicates
- **Triggers re-render**: Any component subscribed to `completedProblems` updates instantly

---

#### Cleanup on Unmount

```javascript
// Return cleanup function
return () => {
  es.close();
  set({ _eventSource: null });
  console.log('[ProgressStore] SSE disconnected');
};
```

**Called by React** when `useEffect` dependency changes or component unmounts:
```javascript
useEffect(() => {
  const cleanup = subscribeToLiveUpdates(user.uid);
  return cleanup; // React calls this on unmount
}, []);
```

---

### WorldMap Component

**File**: `reactapp/src/map/WorldMap.jsx`

```javascript
useEffect(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.uid) {
      loadProgress(user.uid);
      // Open SSE stream for live updates from the extension / other tabs
      const cleanup = subscribeToLiveUpdates(user.uid);
      return cleanup; // close SSE on unmount
    }
  } catch { /* not logged in */ }
}, []);
```

**Lifecycle**:
1. **Mount**: Load initial progress + open SSE connection
2. **Live**: Events arrive → Zustand updates → Map re-renders
3. **Unmount**: SSE connection closed (cleanup function)

---

## Testing the Implementation

### Backend Console Logs

When SSE connection opens:
```
INFO  ProgressEventService : SSE subscribed: userId=1 (active emitters=1)
```

When extension syncs a problem:
```
INFO  SyncService : Synced: user=johndoe problem=two-sum (EASY)
DEBUG ProgressEventService : Published SSE event to 1 emitter(s) for userId=1: ProgressEvent[pid=19, status=SOLVED, slug=two-sum, attemptCount=1]
```

---

### Browser Console Logs (React)

Connection established:
```
[ProgressStore] SSE connected for userId 1
```

Event received:
```
[ProgressStore] Live update: SOLVED stage1-1 two-sum
```

---

### Network Tab Verification

1. Open Chrome DevTools → Network tab
2. Filter by `stream`
3. Find: `stream?userId=1` with Type: `eventsource`
4. Click it → see event stream in real-time:

```
event: connected
data: {"status":"connected"}

event: progress-update
data: {"pid":19,"status":"SOLVED","slug":"two-sum","attemptCount":1}
```

---

## Common Pitfalls & Solutions

### 1. "SSE connection keeps reconnecting every 3 seconds"

**Cause**: Backend threw an exception before returning the `SseEmitter`, or connection timed out immediately

**Fix**:
- Check backend logs for errors
- Verify `userId` is valid (user exists in DB)
- Increase timeout: `new SseEmitter(60_000L)` for 1-minute timeout

---

### 2. "Events not arriving in React"

**Checklist**:
- ✅ Backend logs show "Published SSE event to X emitter(s)" — if X=0, no tabs are subscribed
- ✅ React console shows "[ProgressStore] SSE connected"
- ✅ Event name matches: `emitter.send(...name("progress-update"))` ↔ `es.addEventListener('progress-update')`
- ✅ CORS configured correctly (check browser console for CORS errors)

---

### 3. "Multiple tabs receive the event twice"

**Expected behavior**: If a user has 3 tabs open, each tab maintains its own `EventSource` connection. When an event is published, all 3 tabs receive it independently. This is correct — each tab's Zustand store should update.

**If you see duplicates in a single tab**: Check for multiple `subscribeToLiveUpdates()` calls (e.g., `useEffect` running twice in React Strict Mode during development).

---

## Performance Considerations

### Scalability

| Scenario | Impact |
|----------|--------|
| 1 user, 1 tab | 1 `SseEmitter` in memory (~4KB) |
| 1 user, 5 tabs | 5 `SseEmitter`s (~20KB) |
| 1000 users, 1 tab each | 1000 `SseEmitter`s (~4MB) |
| 1000 users, 3 tabs each | 3000 `SseEmitter`s (~12MB) |

**Conclusion**: SSE is lightweight. Memory usage scales linearly with number of open connections.

---

### Alternatives for High Load

If you have **10,000+ concurrent users**:

1. **Redis Pub/Sub**: Publish events to Redis, each server instance subscribes
2. **Message Queue** (RabbitMQ/Kafka): Decouple event publishing from SSE
3. **WebSocket with STOMP**: More complex but supports clustering

For this app's scale (100-1000 users): **Current SSE implementation is optimal**.

---

## Summary

| Component | Responsibility |
|-----------|----------------|
| **ProgressEvent** | Immutable event payload (`record`) |
| **ProgressEventService** | Manages per-user `SseEmitter` connections, broadcasts events |
| **ProgressEventController** | Exposes `GET /api/progress/stream?userId=X` SSE endpoint |
| **SyncService** | Publishes events after extension sync/attempt |
| **UserProgressService** | Publishes events after in-app solve/attempt |
| **useProgressStore** | Opens `EventSource`, merges events into Zustand state |
| **WorldMap** | Subscribes on mount, cleans up on unmount |

**End result**: Submit on LeetCode → map updates in <100ms without page refresh.
