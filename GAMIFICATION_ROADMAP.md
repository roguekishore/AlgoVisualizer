# Vantage — Gamification Roadmap

> **Last updated:** February 2026  
> **Approach:** Phased, independently testable stages  
> **New tech required:** `spring-boot-starter-websocket` (Phase 6 only) + `@stomp/stompjs` npm package (Phase 6 only)  
> **Everything else uses the existing stack:** Spring Boot 4 + MySQL + React 19 + Node.js Judge

---

## Table of Contents

- [Pre-Requisites: Critical Bug Fixes](#pre-requisites-critical-bug-fixes)
- [Phase 0 — Foundation: Coins + XP](#phase-0--foundation-coins--xp)
- [Phase 1 — Streaks](#phase-1--streaks)
- [Phase 2 — Store + Inventory](#phase-2--store--inventory)
- [Phase 3 — Streak Shield (First Live Powerup)](#phase-3--streak-shield-first-live-powerup)
- [Phase 4 — Leaderboard](#phase-4--leaderboard)
- [Phase 5 — 1v1 Battle via HTTP Polling](#phase-5--1v1-battle-via-http-polling)
- [Phase 6 — WebSocket Upgrade](#phase-6--websocket-upgrade)
- [Phase 7 — Badges + Achievements](#phase-7--badges--achievements)
- [Phase 8 — Group Battle](#phase-8--group-battle)
- [Phase 9 — Institutions](#phase-9--institutions)
- [Architecture Reference](#architecture-reference)
- [Appendix A: Audit Findings](#appendix-a-audit-findings)

---

## Pre-Requisites: Critical Bug Fixes

> **DO NOT start any gamification phase until these are resolved.**  
> The current codebase has critical issues that would corrupt gamification data.

### P0 — Blockers (Fix First)

| # | Layer | Issue | Why It Blocks Gamification |
|---|-------|-------|---------------------------|
| 1 | **Spring** | `ddl-auto=create` drops all tables on restart | Every restart wipes coins, XP, streaks, inventory — everything |
| 2 | **Spring** | Plaintext password storage | Users must be securely authenticated before any coin/rating system exists |
| 3 | **Spring** | Zero authentication on all endpoints | Anyone can call `POST /api/progress/:id/solve` for any user, farming infinite coins |
| 4 | **Spring** | IDOR — userId passed as query param, no ownership check | Same as above — impersonate any user to earn rewards |
| 5 | **Spring** | Session tokens leaked in `GET /api/users` response | Attackers can grab tokens and impersonate users to farm coins |
| 6 | **Spring** | No `@ControllerAdvice` global error handler | Unhandled exceptions return stack traces with internal details |
| 7 | **React** | 5+ hardcoded `localhost:8080` URLs with no env-var fallback | App is non-functional outside localhost |
| 8 | **React** | Undefined variable `category` in `useProblems` hook | Instant `ReferenceError` crash at runtime |
| 9 | **React** | `localStorage.getItem` without try/catch in ThemeContext | App crashes in incognito/restricted environments |
| 10 | **Judge** | Docker socket mount = full host escape | A compromised submission gets root on the host machine |

### P0 Fix Checklist

```
[ ] Change spring.jpa.hibernate.ddl-auto from 'create' to 'update' (or add Flyway)
[ ] Add Spring Security with BCrypt password hashing
[ ] Add JWT-based authentication (or session-based with Spring Security)
[ ] Remove userId from query params — derive from authenticated principal
[ ] Remove sessionToken from user list DTOs
[ ] Add @ControllerAdvice with proper error responses
[ ] Extract all API URLs to environment variables (REACT_APP_API_BASE)
[ ] Fix the undefined 'category' variable in useProblems hook
[ ] Wrap localStorage access in try/catch throughout the app
[ ] Replace Docker socket mount with docker-socket-proxy or rootless Docker
```

### P1 — High Priority (Fix During Phase 0)

| # | Layer | Issue |
|---|-------|-------|
| 11 | **Spring** | N+1 queries in `ProblemService.toProblemResponseDTO` — 40 extra queries per page |
| 12 | **Spring** | `deleteUser` fails with FK constraint (no cascade to UserProgress) |
| 13 | **Spring** | `deleteProblem` fails with FK constraint (no cascade to UserProgress) |
| 14 | **Spring** | Mixed `@Transactional` annotations (Jakarta vs Spring) — rollback may not work |
| 15 | **Spring** | `@Data` on entities with lazy collections — StackOverflow / LazyInitException |
| 16 | **Spring** | Race condition on progress upsert (read-then-write not atomic) |
| 17 | **React** | SSE EventSource has no reconnection management / backoff |
| 18 | **React** | Stale closure bugs in useEffect with empty dependency arrays |
| 19 | **React** | WorldMap subscribes to entire Zustand store (re-renders on every change) |
| 20 | **Judge** | All Docker operations use synchronous `execSync` — blocks event loop |
| 21 | **Judge** | Shell injection possible via test-case data in batch runner |
| 22 | **Judge** | No `unhandledRejection` handler — silent crash kills server |
| 23 | **Judge** | No rate limiting on submission endpoints |
| 24 | **Judge** | No code-size or input-size validation (5MB allowed) |

---

## Phase 0 — Foundation: Coins + XP

> **Goal:** Solving a problem earns coins and XP. A player has a stats profile.  
> **New tech:** None  
> **Depends on:** Pre-requisites (authentication must exist)  
> **Estimated time:** 3–5 days

### Backend

#### New Module: `gamification/`

Create package `com.backend.springapp.gamification` with these files:

**Entity: `PlayerStats.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK, auto-generated |
| `userId` | Long | FK → users.id, UNIQUE |
| `coins` | Integer | Default 0, never negative |
| `xp` | Integer | Default 0, never decreases |
| `level` | Integer | Derived from XP brackets |
| `currentStreak` | Integer | Default 0 (used in Phase 1) |
| `longestStreak` | Integer | Default 0 (used in Phase 1) |
| `lastActivityDate` | LocalDate | Nullable (used in Phase 1) |
| `battleRating` | Integer | Default 1200 (used in Phase 5) |
| `createdAt` | LocalDateTime | Auto-set |
| `updatedAt` | LocalDateTime | Auto-updated |

**Entity: `CoinTransaction.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `userId` | Long | FK → users.id |
| `amount` | Integer | Positive = earn, Negative = spend |
| `source` | Enum | PROBLEM_SOLVED, BATTLE_WIN, STREAK_BONUS, MISSION, STORE_PURCHASE, DAILY_LOGIN |
| `balanceAfter` | Integer | Snapshot of coin balance after this transaction |
| `referenceId` | Long | Nullable — problemId, battleId, etc. |
| `createdAt` | LocalDateTime | Auto-set |

**Coin Reward Table:**

| Action | Coins |
|--------|-------|
| Solve BASIC problem | 3 |
| Solve EASY problem | 5 |
| Solve MEDIUM problem | 15 |
| Solve HARD problem | 30 |
| Speed bonus (top 25% time) | +25% of base |
| Accuracy bonus (first attempt) | +20% of base |
| Daily login | 10 |

**XP Reward Table:**

| Action | XP |
|--------|-----|
| Solve BASIC problem | 5 |
| Solve EASY problem | 10 |
| Solve MEDIUM problem | 25 |
| Solve HARD problem | 50 |

**Level Brackets:**

| Level | XP Range | Title |
|-------|----------|-------|
| 1–10 | 0 – 500 | Initiate |
| 11–25 | 501 – 2500 | Apprentice |
| 26–50 | 2501 – 8000 | Challenger |
| 51–75 | 8001 – 20000 | Veteran |
| 76–100 | 20001 – 50000 | Elite |
| 100+ | 50001+ | Legend |

**Service: `GamificationService.java`**

```
Methods:
- rewardProblemSolve(userId, problemId, tag, isFirstAttempt, solveTimeMs)
  → Calculates coins (with bonuses) + XP
  → Creates CoinTransaction
  → Updates PlayerStats
  → Returns reward summary

- getPlayerStats(userId)
  → Returns PlayerStats DTO

- calculateLevel(xp)
  → Returns level number from XP brackets

- creditCoins(userId, amount, source, referenceId)
  → Atomic coin credit + transaction log

- debitCoins(userId, amount, source, referenceId)
  → Atomic coin debit + transaction log
  → Throws InsufficientCoinsException if balance < amount
```

**Controller: `GamificationController.java`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/stats` | Current player's stats (coins, xp, level, streak, rating) |
| GET | `/api/me/coin-history` | Paginated coin transaction history |
| GET | `/api/users/{id}/stats` | Public stats for any player |

**Integration Point:**

Hook into the existing `UserProgressService.solveProblem()` method:
- After recording the solve → call `gamificationService.rewardProblemSolve(...)`
- This is the ONLY integration point. No other existing code changes.

### Frontend

**Navbar Coin/XP Widget:**
- Show coin icon + count in the top navbar
- Show XP bar with current level
- Fetch from `GET /api/me/stats` on app load (for logged-in users)
- Update optimistically when a problem is solved

**Profile Page Enhancement:**
- Add a stats section showing: Level, XP progress bar, Coins, Total problems solved
- Add coin history table (paginated)

### How to Test

```
1. Log in as a user
2. Solve any problem
3. Check: GET /api/me/stats → coins and XP should have increased
4. Check: GET /api/me/coin-history → transaction should appear
5. Solve 10 EASY problems → verify level calculation is correct
6. Try to access another user's private stats → should be blocked
7. Verify coins are exactly right:
   - EASY problem, first attempt = 5 × 1.2 = 6 coins
   - EASY problem, second attempt = 5 coins (no accuracy bonus)
```

### Definition of Done

```
[ ] PlayerStats entity exists and is auto-created on first solve
[ ] Coins are credited correctly for each difficulty tag
[ ] XP is credited correctly
[ ] Level is calculated from XP brackets
[ ] CoinTransaction audit trail is complete
[ ] GET /api/me/stats returns correct data
[ ] GET /api/me/coin-history is paginated
[ ] Navbar shows coins + level for logged-in users
[ ] Profile page shows stats section
[ ] No existing tests are broken
[ ] Solving a problem via the visualizer triggers reward
```

---

## Phase 1 — Streaks

> **Goal:** Daily solving maintains a streak. Missing a day breaks it.  
> **New tech:** None  
> **Depends on:** Phase 0 (PlayerStats entity must exist)  
> **Estimated time:** 3–4 days

### Backend

**Streak Logic in `GamificationService`:**

```
onProblemSolved(userId):
  stats = getPlayerStats(userId)
  today = LocalDate.now()
  
  if stats.lastActivityDate == today:
    // Already solved today, streak unchanged
    return
  
  if stats.lastActivityDate == today - 1:
    // Consecutive day → increment streak
    stats.currentStreak += 1
  else if stats.lastActivityDate == null OR stats.lastActivityDate < today - 1:
    // Missed a day → reset to 1 (today counts)
    stats.currentStreak = 1
  
  stats.longestStreak = max(stats.longestStreak, stats.currentStreak)
  stats.lastActivityDate = today
  
  checkStreakMilestones(userId, stats.currentStreak)
```

**Streak Milestones:**

| Milestone | Coin Bonus | XP Bonus |
|-----------|-----------|----------|
| 3 days | +50 | — |
| 7 days | +150 | +100 |
| 14 days | +300 | +200 |
| 30 days | +500 | +400 |
| 100 days | +2000 | +1000 |
| 365 days | +10000 | — |

**Streak Coin Multiplier:**

```
effective_coins = base_coins × min(1.5, 1 + currentStreak × 0.01)
```

So a 20-day streak = 1.2× coins. Caps at 1.5× after 50 days.

**Scheduled Task: `StreakResetJob.java`**

```
@Scheduled(cron = "0 0 0 * * *")  // Midnight daily
void resetBrokenStreaks():
  // Find all users where lastActivityDate < yesterday
  // AND currentStreak > 0
  // AND user does NOT have a StreakShield in inventory (Phase 3)
  // → Set currentStreak = 0
```

**New Endpoint:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/streak` | Current streak, longest streak, multiplier, next milestone |

### Frontend

**Streak Widget (Navbar):**
- Flame icon + day count next to the coin widget
- Tooltip shows: "Solve a problem today to keep your streak!"
- Color changes: 1–6 days (orange), 7–29 (blue), 30+ (purple), 100+ (gold animated)

**Streak Milestone Toast:**
- When a milestone is reached, show a celebratory Framer Motion animation
- Display: "🔥 7-Day Streak! +150 coins, +100 XP"

### How to Test

```
1. Solve a problem → streak should be 1
2. Solve another problem same day → streak stays 1
3. Manually set lastActivityDate to yesterday in DB → solve a problem → streak = 2
4. Manually set lastActivityDate to 3 days ago → solve a problem → streak resets to 1
5. Set currentStreak to 7, lastActivityDate to yesterday → solve → verify +150 coin milestone
6. Set currentStreak to 20 → solve → verify coin multiplier is 1.2×
7. Trigger the midnight scheduled job manually:
   - Set lastActivityDate to 2 days ago
   - Call the job
   - Verify currentStreak is now 0
8. Verify longestStreak is never decreased
```

### Definition of Done

```
[ ] Streak increments on consecutive daily solves
[ ] Streak resets to 1 on missed days
[ ] longestStreak only increases, never decreases
[ ] Streak multiplier applies to coin rewards
[ ] Milestone bonuses fire at 3, 7, 14, 30, 100, 365 days
[ ] Midnight scheduled job resets broken streaks
[ ] Navbar streak widget displays correctly
[ ] Milestone toast animation works
```

---

## Phase 2 — Store + Inventory

> **Goal:** Players can browse a store, spend coins to buy items, and see their inventory.  
> **New tech:** None  
> **Depends on:** Phase 0 (coin economy must exist)  
> **Estimated time:** 5–7 days

### Backend

#### New Module: `store/`

Create package `com.backend.springapp.store`:

**Entity: `StoreItem.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `name` | String | e.g., "Streak Shield" |
| `description` | String | Display text |
| `type` | Enum | BATTLE_POWERUP, STREAK_POWERUP, BOOST, COSMETIC |
| `cost` | Integer | In coins |
| `iconUrl` | String | Nullable — path to icon asset |
| `maxOwnable` | Integer | Max a player can hold at once (-1 = unlimited) |
| `isActive` | Boolean | Can this item be purchased right now? |
| `createdAt` | LocalDateTime | |

**Entity: `InventoryItem.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `userId` | Long | FK → users.id |
| `storeItemId` | Long | FK → store_items.id |
| `quantity` | Integer | How many the player owns |
| `acquiredAt` | LocalDateTime | When first acquired |
| `lastUsedAt` | LocalDateTime | Nullable |

Unique constraint on (userId, storeItemId).

**Service: `StoreService.java`**

```
Methods:
- getStoreItems()
  → Returns all active store items

- buyItem(userId, itemId, quantity)
  → Validate item exists and isActive
  → Validate user has enough coins
  → Validate user won't exceed maxOwnable
  → Debit coins via gamificationService.debitCoins()
  → Upsert InventoryItem (increment quantity if exists)
  → Return updated inventory entry

- getInventory(userId)
  → Returns all InventoryItem for user with StoreItem details

- consumeItem(userId, itemId)
  → Decrement quantity by 1
  → Throws if quantity is 0
  → Update lastUsedAt
  → Used internally by other services (streak shield, battle powerups)
```

**Controller: `StoreController.java`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/store` | List all active store items |
| POST | `/api/store/buy` | Buy an item `{ itemId, quantity }` |
| GET | `/api/inventory` | Current user's inventory |

**Seed Data (via DataInitializer):**

| Name | Type | Cost | Max |
|------|------|------|-----|
| Streak Shield | STREAK_POWERUP | 50 | 5 |
| Streak Freeze | STREAK_POWERUP | 120 | 3 |
| XP Surge (24h) | BOOST | 120 | 3 |
| Coin Rush (10 problems) | BOOST | 100 | 3 |
| Hint Token | BATTLE_POWERUP | 75 | 5 |
| Time Extend (+3 min) | BATTLE_POWERUP | 100 | 3 |
| Focus Mode | BATTLE_POWERUP | 80 | 5 |
| Shield | BATTLE_POWERUP | 80 | 5 |
| Double or Nothing | BATTLE_POWERUP | 200 | 3 |

Battle powerups won't be usable until Phase 5, but they can be bought and held now.

### Frontend

**Store Page (`/store`):**
- Grid of item cards
- Each card shows: icon, name, description, cost
- Buy button (disabled if insufficient coins)
- Shows "Owned: X" badge if already in inventory
- Category filter tabs: All / Battle / Streak / Boost / Cosmetic

**Inventory Page (`/inventory`):**
- Grid of owned items with quantity badges
- Battle powerups show "Usable in battles" label (grayed out until Phase 5)
- Streak powerups show "Auto-activated" label

**Navbar Update:**
- Coin count should link to the store page

### How to Test

```
1. GET /api/store → should list all seeded items
2. With 100 coins, buy a Streak Shield (50 coins):
   - POST /api/store/buy { itemId: 1, quantity: 1 }
   - Verify coins decreased by 50
   - Verify CoinTransaction created with source=STORE_PURCHASE
   - Verify inventory shows quantity=1
3. Buy same item again → quantity should be 2
4. Try to buy with insufficient coins → should return 400 with clear message
5. Buy 5 Streak Shields (max), try to buy a 6th → should return 400
6. Check inventory endpoint returns all items with details
7. Verify the store page renders correctly with all items
8. Verify disabled buy button when coins < cost
```

### Definition of Done

```
[ ] Store items seeded on startup (idempotent)
[ ] GET /api/store returns all active items
[ ] POST /api/store/buy validates coins, max ownership, item existence
[ ] Coins are debited atomically with transaction log
[ ] Inventory tracks quantity per item per user
[ ] Store page renders with category filter
[ ] Inventory page shows owned items
[ ] Buy flow works end-to-end in UI
[ ] Edge cases: insufficient coins, max quantity, inactive item
```

---

## Phase 3 — Streak Shield (First Live Powerup)

> **Goal:** A Streak Shield in inventory automatically saves your streak on a missed day.  
> **New tech:** None  
> **Depends on:** Phase 1 (streaks) + Phase 2 (store/inventory)  
> **Estimated time:** 2 days

### Backend

**Modify the midnight `StreakResetJob`:**

```
resetBrokenStreaks():
  usersToReset = findUsersWithBrokenStreaks()  // lastActivityDate < yesterday AND currentStreak > 0
  
  for each user:
    shieldCount = inventoryService.getItemQuantity(user.id, STREAK_SHIELD_ITEM_ID)
    
    if shieldCount > 0:
      inventoryService.consumeItem(user.id, STREAK_SHIELD_ITEM_ID)
      // Log: "Streak Shield consumed for user X"
      // DO NOT reset streak
      // Optionally: create a notification record
    else:
      user.currentStreak = 0
      // save
```

**New Endpoint (optional but useful):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/streak/history` | Shows streak saves, breaks, milestones |

### Frontend

**Streak Widget Enhancement:**
- If a streak was saved by a shield, show a one-time toast: "🛡️ Your Streak Shield saved your 15-day streak!"
- Show shield count next to streak flame: "🔥 15 🛡️ ×2"

### How to Test

```
1. Ensure user has currentStreak=10, lastActivityDate=2 days ago, 1 Streak Shield in inventory
2. Trigger the scheduled job manually
3. Verify: currentStreak is still 10, shield quantity decreased to 0
4. Trigger job again (no shield left, still inactive)
5. Verify: currentStreak is now 0
6. Edge case: User has streak shield but lastActivityDate is yesterday → no shield consumed, streak normal
```

### Definition of Done

```
[ ] Midnight job checks for shields before resetting
[ ] Shield is consumed (quantity decremented)
[ ] Streak is preserved when shield is consumed
[ ] No shield consumption if streak is not broken
[ ] Toast notification appears after shield save
[ ] Shield count visible in streak widget
```

---

## Phase 4 — Leaderboard

> **Goal:** Players can see ranked lists of top performers.  
> **New tech:** None  
> **Depends on:** Phase 0 (PlayerStats with XP/coins)  
> **Estimated time:** 3–4 days

### Backend

#### New Module: `ranking/`

Create package `com.backend.springapp.ranking`:

**Entity: `WeeklyStats.java`** (or add columns to PlayerStats)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `userId` | Long | FK, UNIQUE per week |
| `weekStart` | LocalDate | Monday of the week |
| `xpEarned` | Integer | XP earned this week only |
| `coinsEarned` | Integer | Coins earned this week only |
| `problemsSolved` | Integer | Problems solved this week |

**Scheduled Task: `WeeklyResetJob.java`**

```
@Scheduled(cron = "0 0 0 * * MON")  // Every Monday midnight
void startNewWeek():
  // Archive current week's WeeklyStats (optional)
  // Create new WeeklyStats rows for all active users with zeroed counts
  // OR: simply query by weekStart in the service
```

**Service: `LeaderboardService.java`**

```
Methods:
- getGlobalXPLeaderboard(page, size)
  → Query PlayerStats ordered by xp DESC
  → Return with rank numbers

- getWeeklyXPLeaderboard(page, size)
  → Query WeeklyStats for current week ordered by xpEarned DESC

- getWeeklyCoinsLeaderboard(page, size)
  → Same but by coinsEarned

- getStreakLeaderboard(page, size)
  → Query PlayerStats ordered by currentStreak DESC (active streaks)

- getPlayerRank(userId, leaderboardType)
  → Return the user's rank + surrounding 5 entries
```

**Controller: `LeaderboardController.java`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/global-xp` | All-time XP rankings |
| GET | `/api/leaderboard/weekly-xp` | This week's XP rankings |
| GET | `/api/leaderboard/weekly-coins` | This week's coin earnings |
| GET | `/api/leaderboard/streaks` | Active streak rankings |
| GET | `/api/leaderboard/me?type=global-xp` | My rank + context |

### Frontend

**Leaderboard Page (`/leaderboard`):**
- Tab bar: Global XP | Weekly XP | Weekly Coins | Streaks
- Table: Rank, Avatar, Username, Metric Value, Level Badge
- Highlight the current user's row
- "Your Rank" card at the top showing where you stand
- Pagination at the bottom

### How to Test

```
1. Create 3+ user accounts with varying XP/coins
2. GET /api/leaderboard/global-xp → verify correct ordering
3. Solve problems with one user this week → verify weekly leaderboard updates
4. Check pagination: set page size to 2, verify page 1 and page 2
5. Check "me" endpoint returns correct rank
6. Trigger Monday reset → verify weekly stats reset to 0
7. Verify tie-breaking: two users with same XP → stable ordering
```

### Definition of Done

```
[ ] 4 leaderboard types work correctly
[ ] Pagination works
[ ] Current user rank is highlighted
[ ] Weekly stats reset on Monday
[ ] "My rank" endpoint works
[ ] Leaderboard page renders with tabs
[ ] Performance: query uses ORDER BY + LIMIT at DB level, not in-memory sorting
```

---

## Phase 5 — 1v1 Battle via HTTP Polling

> **Goal:** Two players match, solve the same problems simultaneously, winner gets rewards.  
> **New tech:** None (uses HTTP polling — WebSocket comes in Phase 6)  
> **Depends on:** Phase 0 (coins/XP for rewards), Phase 4 (rating for matchmaking)  
> **Estimated time:** 2–3 weeks

### Backend

#### New Module: `battle/`

Create package `com.backend.springapp.battle`:

**Entity: `Battle.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `mode` | Enum | CASUAL_1V1, RANKED_1V1 |
| `state` | Enum | WAITING, ACTIVE, COMPLETED, CANCELLED |
| `difficulty` | Enum | EASY, MEDIUM, HARD |
| `problemCount` | Integer | 1, 2, or 3 |
| `timeLimitSeconds` | Integer | 900, 1800, or 2700 |
| `startedAt` | LocalDateTime | When both players readied up |
| `endsAt` | LocalDateTime | startedAt + timeLimitSeconds |
| `winnerId` | Long | Nullable, set on completion |
| `createdAt` | LocalDateTime | |

**Entity: `BattleParticipant.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `battleId` | Long | FK → battles.id |
| `userId` | Long | FK → users.id |
| `language` | String | "cpp", "java", "python" |
| `problemsSolved` | Integer | Default 0 |
| `totalSubmissions` | Integer | Default 0 |
| `totalSolveTimeMs` | Long | Cumulative time for solved problems |
| `ratingBefore` | Integer | Snapshot of BR at battle start |
| `ratingAfter` | Integer | Set on completion |
| `coinsEarned` | Integer | Set on completion |
| `xpEarned` | Integer | Set on completion |
| `equippedPowerupId` | Long | Nullable FK → store_items.id |
| `powerupUsed` | Boolean | Default false |
| `isReady` | Boolean | Default false |

**Entity: `BattleProblem.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `battleId` | Long | FK → battles.id |
| `problemId` | Long | FK → problems.id |
| `problemIndex` | Integer | 0, 1, or 2 (order in the battle) |

**Entity: `BattleSubmission.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `battleId` | Long | FK |
| `userId` | Long | FK |
| `problemIndex` | Integer | Which problem |
| `language` | String | |
| `code` | Text | The submitted code |
| `verdict` | Enum | ACCEPTED, WRONG_ANSWER, TIME_LIMIT, RUNTIME_ERROR, COMPILE_ERROR |
| `executionTimeMs` | Long | |
| `submittedAt` | LocalDateTime | |

**Entity: `MatchmakingQueue.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `userId` | Long | FK, UNIQUE |
| `mode` | Enum | CASUAL_1V1, RANKED_1V1 |
| `difficulty` | Enum | |
| `problemCount` | Integer | |
| `battleRating` | Integer | Snapshot for matching |
| `joinedAt` | LocalDateTime | |

#### Matchmaking Flow

```
Player A calls POST /api/battle/queue { mode, difficulty, problemCount }
  → Creates MatchmakingQueue entry
  → Returns { status: "QUEUED", queueId }

Player A polls GET /api/battle/queue/status
  → Returns { status: "QUEUED" } if no match yet
  → Returns { status: "MATCHED", battleId } if matched

Scheduled job every 5 seconds: MatchmakingJob
  → Finds pairs in the queue with compatible mode + difficulty + rating range
  → Casual: ±300 BR
  → Ranked: ±200 BR (widens by 50 every 30 seconds in queue)
  → Creates Battle + BattleParticipants + selects problems
  → Removes both from queue
  → Battle state = WAITING (lobby phase)

Problem selection:
  → Randomly pick N problems matching the difficulty from the problem catalog
  → Exclude problems both players have already solved (query UserProgress)
  → If not enough fresh problems, allow previously solved ones
```

#### Lobby Phase

```
Both players poll GET /api/battle/{battleId}
  → Returns battle details + both participants + readiness status

Player calls POST /api/battle/{battleId}/ready { language, powerupId? }
  → Sets isReady = true for this participant
  → If BOTH are ready → set battle.state = ACTIVE, startedAt = now()

If not both ready within 60 seconds → state = CANCELLED, remove from queue
```

#### Battle Phase

```
Player polls GET /api/battle/{battleId}/state (every 3 seconds)
  → Returns:
    {
      timeRemainingMs: ...,
      myProgress: { problemsSolved, totalSubmissions },
      opponentProgress: { problemsSolved, totalSubmissions },
      problems: [ { index, title, description, examples, constraints, isSolved } ]
    }
  → NEVER returns opponent's code or approach

Player submits: POST /api/battle/{battleId}/submit
  Body: { problemIndex, language, code }
  → Validates battle is ACTIVE and time hasn't expired
  → Proxies code to the Judge service
  → Records BattleSubmission
  → If ACCEPTED:
    → Increment participant.problemsSolved
    → Add solve time to participant.totalSolveTimeMs
    → If all problems solved → trigger early completion check

Rate limit: 1 submission per 10 seconds per participant per battle
```

#### Battle Completion

```
Triggered by:
  a) Timer expires (scheduled check every 5 seconds)
  b) A player solves all problems

Win condition (tiebreaker chain):
  1. More problems solved → WINS
  2. Equal problems → faster total solve time → WINS
  3. Equal time → fewer total submissions → WINS
  4. Full tie → DRAW

On completion:
  → Set battle.state = COMPLETED
  → Set battle.winnerId
  → Calculate and apply rating changes (ELO formula)
  → Credit coins and XP to winner (and smaller amount to loser)
  → Save ratingAfter on both participants
```

#### Rating Change (ELO)

```
K = 40 if battles_played < 10
K = 20 if battles_played < 30
K = 15 otherwise

expected = 1 / (1 + 10^((opponent_rating - my_rating) / 400))
actual = 1.0 (win), 0.5 (draw), 0.0 (loss)

new_rating = old_rating + K × (actual - expected)
```

#### Reward Table

| Outcome | Coins | XP |
|---------|-------|----|
| Win Casual | 30 | 40 |
| Win Ranked | 60 | 75 |
| Lose Casual | 5 | 10 |
| Lose Ranked | 10 | 15 |
| Draw | 15 | 25 |
| Abandon (ranked) | 0 | 0 + penalty: -50 BR |

**Service: `BattleService.java`**

```
Core methods:
- joinQueue(userId, mode, difficulty, problemCount)
- getQueueStatus(userId)
- leaveQueue(userId)
- getBattle(battleId, userId)
- readyUp(battleId, userId, language, powerupId)
- getBattleState(battleId, userId)
- submitCode(battleId, userId, problemIndex, language, code)
- completeBattle(battleId)
- calculateRatingChange(winnerRating, loserRating, kFactor)
```

**Controller: `BattleController.java`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battle/queue` | Join matchmaking queue |
| GET | `/api/battle/queue/status` | Check queue status (poll) |
| DELETE | `/api/battle/queue` | Leave queue |
| GET | `/api/battle/{id}` | Get battle details (lobby) |
| POST | `/api/battle/{id}/ready` | Ready up in lobby |
| GET | `/api/battle/{id}/state` | Poll battle state (during battle) |
| POST | `/api/battle/{id}/submit` | Submit code |
| GET | `/api/battle/{id}/result` | Get final results |
| POST | `/api/battle/{id}/forfeit` | Forfeit the battle |

**Scheduled Jobs:**

| Job | Frequency | Purpose |
|-----|-----------|---------|
| `MatchmakingJob` | Every 5s | Pair compatible players in queue |
| `BattleTimerJob` | Every 5s | Check for expired battles, trigger completion |
| `QueueTimeoutJob` | Every 30s | Remove players who've been in queue > 5 minutes |

### Frontend

**Battle Lobby Page (`/battle`):**
- Mode selector: Casual / Ranked
- Difficulty selector: Easy / Medium / Hard
- Problem count: 1 / 2 / 3
- "Find Battle" button → enters queue
- Searching animation while polling queue status
- Cancel button to leave queue

**Battle Lobby Screen (after match found):**
```
┌─────────────────────────────────────────────────┐
│  ⚔️  BATTLE LOBBY                                │
├──────────────┬────────┬─────────────────────────┤
│  YOU         │  VS    │  OPPONENT               │
│  Avatar      │        │  Avatar                 │
│  Username    │        │  Username               │
│  BR: 1540    │        │  BR: 1480               │
│  Level 42    │        │  Level 38               │
├──────────────┴────────┴─────────────────────────┤
│  Format: RANKED · 2 Problems · 30 Min · MEDIUM  │
│  Language: [C++ ▾]                               │
│  Powerup: [Hint Token ▾] (optional)             │
├─────────────────────────────────────────────────┤
│  [READY ✓]                        [FORFEIT]     │
│  Waiting for opponent...                         │
└─────────────────────────────────────────────────┘
```

**Battle Arena Page (`/battle/match/:battleId`):**
```
┌──────────────────────────────────────────────────────────┐
│ ⏱ 24:37 │ Problem 1 ✓  Problem 2 ◌ │ [POWERUP 🎯]     │
├───────────────────┬──────────────────────────────────────┤
│ PROBLEM STATEMENT │ CODE EDITOR (Monaco)                 │
│                   │                                      │
│ Title, examples,  │ [▶ RUN CODE]  [✓ SUBMIT]            │
│ constraints       ├──────────────────────────────────────┤
│                   │ Test Results / Submission Feedback    │
│ [← Prev] [Next →] │                                     │
├───────────────────┴──────────────────────────────────────┤
│ YOU: ■■□ 1/2 solved    OPPONENT: ■□□ 0/2 solved         │
└──────────────────────────────────────────────────────────┘
```

**Post-Battle Screen (`/battle/result/:battleId`):**
```
┌─────────────────────────────────────────┐
│        🏆 YOU WIN!  (or 💀 DEFEAT)     │
├────────────────┬────────────────────────┤
│ YOUR STATS     │ OPPONENT STATS         │
│ Solved: 2/2   │ Solved: 1/2            │
│ Time: 18:42   │ Time: DNF              │
│ Attempts: 4   │ Attempts: 6            │
├────────────────┴────────────────────────┤
│ +75 XP    +60 Coins    BR: 1540→1562   │
├─────────────────────────────────────────┤
│ [REMATCH]  [VIEW SOLUTIONS]  [LOBBY]   │
└─────────────────────────────────────────┘
```

**New Zustand Store: `useBattleStore.js`**

```
State:
- queueStatus: null | 'QUEUED' | 'MATCHED'
- battleId: null | string
- battleState: null | { timeRemaining, myProgress, opponentProgress, problems }
- pollingInterval: null (ref to setInterval)

Actions:
- joinQueue(mode, difficulty, count)
- pollQueueStatus()  → calls GET /api/battle/queue/status every 3s
- pollBattleState()  → calls GET /api/battle/{id}/state every 3s
- submitCode(problemIndex, language, code)
- readyUp(language, powerupId)
- forfeit()
- stopPolling()  → clearInterval
```

### Judge Integration

The battle submission endpoint proxies to the existing Judge service:
- POST to `http://judge:9000/api/submit` with the code, language, and problem's test cases
- The battle controller waits for the judge response, then records the verdict
- No changes to the Judge service itself — it just receives a standard submission

### How to Test

```
1. Open two browser windows, logged in as different users
2. Both click "Find Battle" with same settings
3. Verify they get matched within ~10 seconds
4. Both ready up → battle starts → timer begins
5. Solve a problem in window 1 → verify opponent progress bar updates in window 2 (within 3s)
6. Submit wrong code → verify WRONG_ANSWER verdict
7. Solve all problems → verify early completion triggers
8. Verify winner/loser screen shows correct stats
9. Check coins, XP, and BR updated for both users
10. Test forfeit: forfeit mid-battle → verify instant loss + penalty
11. Test timeout: wait for timer → verify win condition chain works
12. Test queue cancellation: join queue, cancel, verify removed
13. Test lobby timeout: match found, one player doesn't ready → cancelled after 60s
14. Rate limit: submit code, submit again within 10s → should be rejected
```

### Definition of Done

```
[ ] Matchmaking pairs compatible players
[ ] Queue status polling works
[ ] Lobby shows both players + ready state
[ ] Battle starts when both ready
[ ] Problems are displayed identically for both players
[ ] Code submission proxied to Judge correctly
[ ] Opponent progress visible (solve count only, no code)
[ ] Timer counts down and triggers completion
[ ] Win condition chain works (problems > time > submissions > draw)
[ ] ELO rating updated correctly for ranked battles
[ ] Coins + XP credited on completion
[ ] Forfeit works with penalty
[ ] Post-battle screen shows all stats
[ ] Polling cleans up on unmount (no memory leaks)
[ ] Rate limiting on submissions works
```

---

## Phase 6 — WebSocket Upgrade

> **Goal:** Replace HTTP polling in the battle arena with real-time push via WebSocket.  
> **New tech:** `spring-boot-starter-websocket` + `@stomp/stompjs`  
> **Depends on:** Phase 5 (battle works via polling)  
> **Estimated time:** 5–7 days

### Backend

**Add dependency to `pom.xml`:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**New config in `common/`:**

**`WebSocketConfig.java`**
```
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    configureMessageBroker(registry):
      registry.enableSimpleBroker("/topic", "/queue")
      registry.setApplicationDestinationPrefixes("/app")
      registry.setUserDestinationPrefix("/user")
    
    registerStompEndpoints(registry):
      registry.addEndpoint("/ws")
             .setAllowedOriginPatterns("*")
             .withSockJS()
}
```

**Changes to BattleService:**

When battle state changes (problem solved, timer tick, battle complete):
- Instead of just updating the DB, also broadcast to:
  - `/topic/battle/{battleId}/state` → opponent progress update
  - `/topic/battle/{battleId}/result` → battle complete notification
  - `/user/{userId}/queue/matched` → matchmaking success

**No changes to:**
- Battle entities
- Win condition logic
- Rating calculation
- Reward distribution
- Any business logic

### Frontend

**Add npm package:**
```
npm install @stomp/stompjs sockjs-client
```

**Changes to `useBattleStore.js`:**

Replace:
```javascript
// OLD: Poll every 3 seconds
pollingInterval = setInterval(() => fetchBattleState(), 3000)
```

With:
```javascript
// NEW: Subscribe to WebSocket topic
stompClient.subscribe(`/topic/battle/${battleId}/state`, (message) => {
  setBattleState(JSON.parse(message.body))
})
```

**Keep polling as fallback:**
- If WebSocket connection fails, fall back to 3-second polling
- This means Phase 5's code is not deleted, just deprioritized

### How to Test

```
1. Run the exact same two-window test from Phase 5
2. Verify opponent progress appears in <1 second (not 3 seconds)
3. Check browser DevTools → Network → WS tab → verify STOMP frames
4. Kill the WebSocket connection (browser DevTools) → verify fallback to polling
5. Reconnect → verify WebSocket resumes
6. Test with multiple concurrent battles → verify messages route correctly
```

### Definition of Done

```
[ ] STOMP endpoint accessible at /ws
[ ] Battle state broadcasts in real-time
[ ] Matchmaking notifications via user-specific queue
[ ] Fallback to polling if WebSocket fails
[ ] No duplicate state updates
[ ] WebSocket connections cleaned up on battle end
[ ] All Phase 5 tests still pass
```

---

## Phase 7 — Badges + Achievements

> **Goal:** Players earn badges for milestones. Badges appear on profile.  
> **New tech:** None  
> **Depends on:** Phase 0 (stats tracking). Can be built **in parallel** with Phase 5/6.  
> **Estimated time:** 3–4 days

### Backend

**Add to `gamification/` module:**

**Entity: `Achievement.java`** (catalog)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `key` | String | UNIQUE — e.g., "FIRST_SOLVE", "STREAK_7", "BATTLE_WIN_5" |
| `name` | String | Display name |
| `description` | String | How to earn it |
| `iconUrl` | String | Badge icon path |
| `category` | Enum | PROBLEM, STREAK, BATTLE, SPECIAL |
| `coinReward` | Integer | Coins awarded on unlock |
| `xpReward` | Integer | XP awarded on unlock |
| `isHidden` | Boolean | Hidden until earned (surprise badges) |

**Entity: `PlayerAchievement.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `userId` | Long | FK |
| `achievementId` | Long | FK |
| `earnedAt` | LocalDateTime | |

Unique constraint on (userId, achievementId).

**Achievement Catalog (seed data):**

| Key | Name | Condition | Coins | XP |
|-----|------|-----------|-------|----|
| FIRST_SOLVE | First Blood | Solve your first problem | 50 | 20 |
| SOLVE_10 | Getting Started | Solve 10 problems | 100 | 50 |
| SOLVE_50 | Half Century | Solve 50 problems | 300 | 200 |
| SOLVE_100 | Centurion | Solve 100 problems | 500 | 400 |
| ALL_EASY | Easy Sweep | Solve all EASY problems | 200 | 150 |
| ALL_MEDIUM | Medium Mastery | Solve all MEDIUM problems | 500 | 400 |
| STREAK_7 | Week Warrior | 7-day streak | 150 | 100 |
| STREAK_30 | Monthly Grinder | 30-day streak | 500 | 400 |
| STREAK_100 | Centurion Streak | 100-day streak | 2000 | 1000 |
| FIRST_BATTLE_WIN | Victorious | Win your first battle | 100 | 75 |
| BATTLE_WIN_5 | Fighter | Win 5 battles | 200 | 150 |
| BATTLE_WIN_20 | Warrior | Win 20 battles | 500 | 400 |
| SPEED_DEMON | Speed Demon | Solve a battle problem in under 5 min | 150 | 100 |
| UNDERDOG | Underdog | Beat someone 200+ BR above you | 300 | 200 |

**Service: `AchievementService.java`**

```
Uses Spring ApplicationEvent pattern:

Listens to:
- ProblemSolvedEvent → check FIRST_SOLVE, SOLVE_10, SOLVE_50, etc.
- StreakMilestoneEvent → check STREAK_7, STREAK_30, etc.
- BattleCompletedEvent → check FIRST_BATTLE_WIN, BATTLE_WIN_5, etc.

Methods:
- checkAndAward(userId, eventType, context)
  → Query which achievements user doesn't have yet
  → Evaluate conditions
  → If met → create PlayerAchievement + credit coins/XP + return badge info

- getPlayerAchievements(userId)
  → Return all earned badges

- getAllAchievements()
  → Return full catalog (with hidden ones marked)
```

**Controller: `AchievementController.java`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | Full catalog (hidden ones show "???" until earned) |
| GET | `/api/me/achievements` | My earned badges |
| GET | `/api/users/{id}/achievements` | Another player's badges |

### Frontend

**Badge Unlock Animation:**
- When a badge is earned, show a full-screen overlay with Framer Motion
- Badge icon zooms in with particle effects
- Shows: badge name, description, "+100 coins, +50 XP"
- Auto-dismisses after 3 seconds or on click

**Profile Page Badge Grid:**
- Grid of all badges (earned = full color, unearned = grayed out silhouette)
- Hover/click shows description + earn date
- Hidden badges show "???" until earned

**Achievement Page (`/achievements`):**
- Full catalog with progress indicators
- "Solve 10 problems" → shows "7/10" progress bar

### How to Test

```
1. Create fresh account, solve 1 problem → FIRST_SOLVE badge should unlock
2. Solve 10 problems → SOLVE_10 badge should unlock + coins/XP credited
3. Check /api/me/achievements → both badges present
4. Check /api/achievements → hidden badges show "???"
5. Check profile page → badge grid shows earned badges in color
6. Verify coin rewards from badges appear in coin transaction history
7. Verify badge unlock animation fires in the UI
```

### Definition of Done

```
[ ] Achievement catalog seeded
[ ] Event listeners trigger badge checks
[ ] Badges awarded correctly with coin/XP rewards
[ ] No duplicate badge awards
[ ] Badge unlock animation works
[ ] Profile badge grid works
[ ] Hidden badges shown as "???" until earned
[ ] Achievement progress tracking (X/N)
```

---

## Phase 8 — Group Battle

> **Goal:** 3–8 players compete in a shared room.  
> **New tech:** None  
> **Depends on:** Phase 5 (battle infrastructure), Phase 6 (WebSocket preferred but not required)  
> **Estimated time:** 1–2 weeks

### Backend

**Extend `battle/` module:**

**Entity changes:**
- `Battle.mode` → add `GROUP_FFA`, `GROUP_TEAM`
- `Battle.maxPlayers` → new column (3–8)
- `Battle.roomCode` → new column, 6-char alphanumeric, UNIQUE
- `Battle.creatorId` → new column, FK → users.id
- `BattleParticipant.teamId` → new column, nullable (for team mode)

**New endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battle/room` | Create a room `{ mode, difficulty, problemCount, maxPlayers, timeLimitSeconds }` |
| GET | `/api/battle/room/{code}` | Get room details by code |
| POST | `/api/battle/room/{code}/join` | Join a room |
| POST | `/api/battle/room/{code}/leave` | Leave a room |
| POST | `/api/battle/room/{code}/kick/{userId}` | Creator kicks a player |
| POST | `/api/battle/room/{code}/start` | Creator starts the battle (min 3 players, all ready) |
| GET | `/api/battle/{id}/scoreboard` | Live scoreboard for group battle |

**Scoring Formula (FFA):**

```
For each problem solved:
  base_points = { EASY: 100, MEDIUM: 250, HARD: 500 }
  time_bonus = 1 + (time_remaining / total_time) × 0.5
  accuracy = max(0.5, 1 - wrong_submissions × 0.1)
  points = base_points × time_bonus × accuracy
  
Total score = sum of points for all solved problems
```

**Ranking within group:**
1. Highest total score
2. Tiebreak: earliest last solve timestamp

**Team mode:**
- Team score = sum of all member scores
- Winning team's members all get winner rewards

### Frontend

**Group Lobby Page (`/group/:roomCode`):**
- Room settings (shown by creator)
- Player list with ready indicators
- Share room code button
- Creator controls: kick, start, set teams

**Group Battle Arena:**
- Same as 1v1 arena but with a collapsible sidebar showing live scoreboard
- Scoreboard: Rank, Username, Score, Problems Solved
- Updates in real-time (WebSocket) or every 3s (polling)

### How to Test

```
1. Create a room with 3 accounts in 3 browser windows
2. All join via room code
3. Creator starts battle
4. Verify all 3 see the same problems
5. Solve problems at different speeds → verify live scoreboard ordering
6. Verify scoring formula (early solve = more points)
7. Verify wrong submissions reduce accuracy multiplier
8. Test team mode: 2v2, verify team score aggregation
9. Test creator controls: kick a player before start
10. Test min player check: try to start with only 2 → should fail
```

### Definition of Done

```
[ ] Room creation with code works
[ ] Join/leave/kick works
[ ] Min 3 players to start
[ ] Same problems for all participants
[ ] Scoring formula applied correctly
[ ] Live scoreboard updates
[ ] Team mode works (score aggregation)
[ ] Creator controls work
[ ] Rewards distributed by placement
```

---

## Phase 9 — Institutions

> **Goal:** Organizations can register, link members, and compete.  
> **New tech:** None  
> **Depends on:** Phase 8 (group battles for institution battles)  
> **Estimated time:** 2–3 weeks

### Backend

#### New Module: `institution/`

**Entity: `Institution.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `name` | String | e.g., "IIT Bombay" |
| `slug` | String | UNIQUE, URL-safe, e.g., "iit-bombay" |
| `emailDomain` | String | e.g., "iitb.ac.in" (for auto-verification) |
| `crestUrl` | String | Institution logo |
| `adminUserId` | Long | FK → users.id |
| `memberCount` | Integer | Denormalized counter |
| `institutionRating` | Integer | Default 1000, for inter-institution battles |
| `createdAt` | LocalDateTime | |

**Entity: `InstitutionMember.java`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Long | PK |
| `institutionId` | Long | FK |
| `userId` | Long | FK, UNIQUE (one institution per user) |
| `role` | Enum | ADMIN, MEMBER |
| `joinedAt` | LocalDateTime | |
| `isVerified` | Boolean | Verified via email domain or admin approval |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/institutions` | Register a new institution (requires admin account) |
| GET | `/api/institutions/{slug}` | Public profile |
| GET | `/api/institutions/{slug}/members` | Member list with stats |
| POST | `/api/institutions/{slug}/join` | Request to join |
| POST | `/api/institutions/{slug}/approve/{userId}` | Admin approves member |
| GET | `/api/institutions/{slug}/leaderboard` | Internal member leaderboard |
| POST | `/api/institutions/{slug}/battle` | Create intra-institution battle room |
| GET | `/api/leaderboard/institutions` | Global institution ranking |

**Institution Battle Flow:**
- Intra-institution: Admin creates a group battle room scoped to members only
- Inter-institution: Two admins agree, each selects N players, group battle starts
- Institution rating changes based on result

### Frontend

**Institution Page (`/institution/:slug`):**
- Crest, name, rating, member count
- Member leaderboard tab
- Battle history tab
- Admin panel (if current user is admin): approve members, create battles

**Join Institution Flow:**
- Settings page → "Link Institution" → search by name → request to join
- Or: auto-verified if email domain matches

### How to Test

```
1. Create institution with admin account
2. Second account requests to join
3. Admin approves → member appears in list
4. Create intra-institution battle → verify only members can join
5. Check institution leaderboard → members ranked by XP
6. Check global institution leaderboard
```

### Definition of Done

```
[ ] Institution registration works
[ ] Member join + approval flow works
[ ] Email domain auto-verification works
[ ] Institution page shows members + stats
[ ] Intra-institution battles work
[ ] Institution leaderboard works
[ ] Admin controls (approve, create battles) work
```

---

## Architecture Reference

### New Backend Module Map (Final State)

```
com.backend.springapp
├── common/                   # EXISTING — add WebSocketConfig, GlobalExceptionHandler
├── problem/                  # EXISTING — no changes
├── user/                     # EXISTING — add authentication (Pre-req)
├── gamification/             # NEW (Phase 0) — PlayerStats, CoinTransaction, XP, Streaks
├── store/                    # NEW (Phase 2) — StoreItem, Inventory, Purchasing
├── ranking/                  # NEW (Phase 4) — Leaderboards, WeeklyStats
├── battle/                   # NEW (Phase 5) — Battles, Matchmaking, Submissions
└── institution/              # NEW (Phase 9) — Institutions, Members
```

### New Frontend Route Map (Final State)

```
/                        # EXISTING — Homepage
/:category               # EXISTING — Category page
/:category/:algorithm    # EXISTING — Visualizer page
/world-map               # EXISTING — DSA Conquest Map
/store                   # NEW (Phase 2) — Powerup store
/inventory               # NEW (Phase 2) — Player inventory
/leaderboard             # NEW (Phase 4) — Rankings
/achievements            # NEW (Phase 7) — Badge catalog
/battle                  # NEW (Phase 5) — Battle mode selector + queue
/battle/match/:battleId  # NEW (Phase 5) — Live battle arena
/battle/result/:battleId # NEW (Phase 5) — Post-battle results
/group/:roomCode         # NEW (Phase 8) — Group battle lobby
/institution/:slug       # NEW (Phase 9) — Institution profile
/profile/:userId         # NEW (Phase 0) — Enhanced player profile
```

### New Database Tables (Final State)

```
Phase 0:  player_stats, coin_transactions
Phase 2:  store_items, inventory_items
Phase 4:  weekly_stats
Phase 5:  battles, battle_participants, battle_problems, battle_submissions, matchmaking_queue
Phase 7:  achievements, player_achievements
Phase 9:  institutions, institution_members
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| HTTP polling before WebSocket | Lets you build and test all battle logic without real-time complexity |
| Single ELO rating (not per-mode) | Simpler to implement; split later if needed |
| Coins as only currency | Prevents economy complexity; no premium currency |
| Modular Spring Boot packages | Each phase is a self-contained package, no cross-contamination |
| Zustand for battle state | Already used for progress store; consistent pattern |
| No Redis initially | MySQL + scheduled jobs handle everything at current scale |

---

## Appendix A: Audit Findings

> Full audit of the existing codebase conducted February 2026.  
> These issues should be tracked and resolved before or during gamification development.

### ✅ Resolution Summary (Post-Audit Fixes Applied)

The following fixes have been applied across all three layers. Items marked ✅ are resolved.

**Spring Boot Backend (17 of 35 resolved):**
- ✅ #8 `@Modifying` without `clearAutomatically` → fixed in UserRepository
- ✅ #9 N+1 in ProblemService → batch `mapPageToDTO` with single JPQL for stages + progress
- ✅ #10 N+1 in user progress → `JOIN FETCH` on `findAllByUserId`
- ✅ #11 `deleteUser` FK constraint → cascade via `deleteAllByUserId` before user delete
- ✅ #12 `deleteProblem` FK constraint → cascade via `deleteAllByProblemId` before problem delete
- ✅ #13 Mixed `@Transactional` → Jakarta→Spring in UserProgressService, SyncService, ProblemService
- ✅ #14 `@Data` on entities → replaced with `@Getter/@Setter/@EqualsAndHashCode/@ToString` on all 6 entities
- ✅ #15 No `@ControllerAdvice` → created `GlobalExceptionHandler` with 4 exception handlers
- ✅ #17 NPE on null tag → `parseTag` now returns null for null/blank input
- ✅ #18 Duplicate CORS → removed `@CrossOrigin` from ProgressEventController and SyncController
- ✅ #21 Detached proxy → `createUserReference` now uses `getReferenceById`
- ✅ #22 No user validation → added `existsById` checks in `markAsAttempted`/`markAsSolved`
- ✅ #23 Institution search in-memory limit → paginated repository query
- ✅ #25 Inconsistent ranking → competition-style ranking in `applyRanks`
- ✅ #27 Unused import → removed `CriteriaBuilder.In` from User.java
- ✅ #28 `@Data` equals/hashCode → explicit `@EqualsAndHashCode(onlyExplicitlyIncluded=true)` on all entities
- ✅ #32 Manual JSON in SSE → replaced with Jackson `ObjectMapper` (added `spring-boot-starter-json`)

**React Frontend (9 of 30 resolved):**
- ✅ #1–#5 Hardcoded `localhost:8080` → all 6 references now use `REACT_APP_API_URL` env var
- ✅ #6 Undefined `category` → fixed to `topic` in `useProblemSearch` dependency array
- ✅ #11 `localStorage` without try/catch → wrapped in theme-provider `useState` initializer and `setTheme`
- ✅ #13 WorldMap subscribes to entire store → converted to individual Zustand selectors
- ✅ #20 No 404 route → added catch-all `<Route path="*">` with 404 page

**Judge Service (4 of 28 resolved):**
- ✅ #2 Shell injection → extracted `shellEscape()` helper, applied to all test case values in batch runner
- ✅ #4 No `unhandledRejection` → added `unhandledRejection` and `uncaughtException` process handlers
- ✅ #8 No input validation → added `MAX_CODE_SIZE` (64KB) and `MAX_INPUT_SIZE` (1MB) checks on both endpoints
- ✅ #23 Duplicate Docker socket mount → removed from docker-compose.yml

### Spring Boot Backend — 35 Issues Found

#### CRITICAL (6)

| # | Issue | Files Affected |
|---|-------|---------------|
| 1 | **Plaintext password storage** — no BCrypt, no hashing. Passwords readable in DB. | User entity, UserService, login/signup controllers |
| 2 | **`ddl-auto=create` drops all tables on every restart** — all data lost on redeploy. | application.properties |
| 3 | **IDOR — any user can modify any user's progress** — userId passed as query param with zero auth check. | UserProgressController (attempt, solve, get endpoints) |
| 4 | **Unauthenticated sync fallback allows impersonation** — sync endpoint trusts userId from request body when no auth header present. | Sync-related controller |
| 5 | **Session tokens leaked in user list response** — `GET /api/users` exposes every user's session token. | UserResponseDTO, UserController |
| 6 | **No authentication on admin endpoints** — anyone can create/update/delete problems and users. | ProblemController, UserController |

#### HIGH (9)

| # | Issue |
|---|-------|
| 7 | Hardcoded DB credentials (`root/root`) in properties file |
| 8 | `@Modifying` query without `clearAutomatically = true` — stale persistence context |
| 9 | N+1 query in `ProblemService.toProblemResponseDTO` — 40 extra queries per page of 20 |
| 10 | N+1 query in user progress retrieval — lazy load per row |
| 11 | `deleteUser` fails with FK constraint — no cascade to UserProgress |
| 12 | `deleteProblem` fails with FK constraint — no cascade to UserProgress |
| 13 | Mixed `@Transactional` annotations (Jakarta vs Spring) — rollback may not work |
| 14 | `@Data` on entities with lazy collections — StackOverflow / LazyInitException risk |
| 15 | No `@ControllerAdvice` global error handler — stack traces leaked to clients |

#### MEDIUM (11)

| # | Issue |
|---|-------|
| 16 | Status filter ignores stage/tag parameters when set |
| 17 | NPE when tag is null in problem filter |
| 18 | Duplicate CORS configuration (3 places) — can cause duplicate headers |
| 19 | SyncRequest DTO has no validation annotations — NPE on null fields |
| 20 | LoginRequest has no validation — null username/password causes NPE |
| 21 | Progress upsert creates detached proxy instead of using `getReferenceById` |
| 22 | No user existence validation in progress attempt/solve |
| 23 | Institution search loads full result set then limits in memory |
| 24 | Race condition on progress upsert — read-then-write not atomic |
| 25 | Inconsistent ranking logic — sequential vs competition ranking |
| 26 | Error responses return empty 400 body — error message swallowed |

#### LOW (9)

| # | Issue |
|---|-------|
| 27 | Unused import in controller |
| 28 | `@Data` on all JPA entities — equals/hashCode issues with detached instances |
| 29 | Missing `@Table` on ProblemStage entity |
| 30 | Leaderboard sorts in memory instead of in DB query |
| 31 | SSE emitter memory leak potential on ungraceful client disconnect |
| 32 | Manual JSON construction in SSE publisher — fragile string concatenation |
| 33 | Page size parameter not validated for minimum/maximum |
| 34 | DataInitializer only checks stages, not problems — partial seed unrecoverable |
| 35 | No size constraint on batch slug query — could send thousands of slugs |

---

### React Frontend — 30 Issues Found

#### CRITICAL (6)

| # | Issue | Files Affected |
|---|-------|---------------|
| 1 | Hardcoded `localhost:8080` in API service — no env-var fallback | services/api.js |
| 2 | Hardcoded `localhost:8080` in login-form fetch call | components/login-form.jsx |
| 3 | Hardcoded `localhost:8080` in signup-form | components/signup-form.jsx |
| 4 | Hardcoded `localhost:8080` in progress store | map/useProgressStore.js |
| 5 | Hardcoded `localhost:8080` in another component | Additional component with fetch call |
| 6 | **Undefined variable `category`** in useProblems hook — ReferenceError crash at runtime | hooks/useProblems |

#### HIGH (8)

| # | Issue |
|---|-------|
| 7 | `useNavigate()` called outside Router context scope on every render |
| 8 | Empty dependency array useEffect with external references — stale closures |
| 9 | `JSON.parse(localStorage.getItem(...))` without try/catch — crash on corrupt data |
| 10 | Redundant/confusing URL construction in progress store |
| 11 | `localStorage.getItem` in ThemeContext without try/catch — crash in incognito |
| 12 | Stale closure in SSE event handler — keeps updating after logout |
| 13 | Subscribing to entire Zustand store in WorldMap — excessive re-renders |
| 14 | Fetch error swallowed by catch — user sees "not found" instead of "network error" |

#### MEDIUM (10)

| # | Issue |
|---|-------|
| 15 | No URL encoding for query parameters in search |
| 16 | SSE EventSource has no reconnection backoff or max-retry |
| 17 | `fetchSolvedIds` clears state before async fetch — flash of empty state |
| 18 | No AbortController for sequential API calls — race condition on rapid filter changes |
| 19 | `useMemo` with empty deps but referencing outer-scope values — stale user object |
| 20 | No 404/catch-all route — unmatched URLs render blank page |
| 21 | `markProblemComplete` silently fails when not logged in — no user feedback |
| 22 | React.lazy inside useMemo — unmount/remount on key change |
| 23 | `connectSSE` and `fetchSolvedIds` race condition — SSE can overwrite fetch results |
| 24 | Debounced fetch without AbortController — unmount during fetch causes warning |

#### LOW (6)

| # | Issue |
|---|-------|
| 25 | No listener for system theme changes — OS dark mode switch not detected |
| 26 | `localStorage.setItem` inside SSE handler without try/catch |
| 27 | Eager import of large catalog on TopicsPage mount |
| 28 | No-op `useMemo` with inert dependency |
| 29 | Wrapper component not memoized — recreates element tree on each render |
| 30 | Potential off-by-one in array index after push |

---

### Judge Service — 28 Issues Found

#### CRITICAL (4)

| # | Issue | Files Affected |
|---|-------|---------------|
| 1 | **Docker socket mount = full host escape** — any compromised code gets root on host | docker-compose.yml |
| 2 | **Shell injection via test-case data** — double-quoted bash interpolation allows `$(...)` execution | src/executor.js |
| 3 | **Multiline/special-char breakage** in batch runner — corrupts verdict parsing silently | src/executor.js |
| 4 | **No `unhandledRejection` handler** — silent crash kills server, orphans containers | src/index.js |

#### HIGH (7)

| # | Issue |
|---|-------|
| 5 | All Docker operations use synchronous `execSync` — blocks entire event loop |
| 6 | Path traversal possible in `writeFile` — no validation on filename |
| 7 | Missing container hardening flags — no `--cap-drop ALL`, no seccomp profile |
| 8 | No code-size or input-size validation — 5MB source files accepted |
| 9 | Shell metacharacter risk in host-mode g++ compilation |
| 10 | Shell metacharacter risk in host-mode javac compilation |
| 11 | Graceful shutdown doesn't drain in-flight requests |

#### MEDIUM (10)

| # | Issue |
|---|-------|
| 12 | No rate limiting on submission endpoints |
| 13 | CORS fully open (`*`) |
| 14 | Unbounded wait queue — thousands of pending promises can exhaust memory |
| 15 | `rm -rf /workspace/.*` dangerous on some shells |
| 16 | Stale temp files never cleaned up from previous crashes |
| 17 | No resource limits on the judge container itself |
| 18 | Batch timeout scales linearly with test case count — can lock worker for 250s |
| 19 | Stdout parsing relies on exact marker strings — user code can corrupt it |
| 20 | No security headers (helmet) |
| 21 | Java filename fallback (`Main.java`) gives confusing errors |

#### LOW (7)

| # | Issue |
|---|-------|
| 22 | No-op `apt-get install` in C++ sandbox Dockerfile |
| 23 | Duplicate Docker socket volume mount in compose file |
| 24 | No `--ulimit` flags on worker containers |
| 25 | Hardcoded fallback port with misleading EXPOSE directive |
| 26 | `require()` module cache not cleared on `reloadProblems()` |
| 27 | Test-case expected outputs partially exposed via API |
| 28 | 5MB JSON body limit is generous for code submissions |

---

*End of document. Each phase is independently testable. Fix the pre-requisites first, then proceed phase by phase.*
