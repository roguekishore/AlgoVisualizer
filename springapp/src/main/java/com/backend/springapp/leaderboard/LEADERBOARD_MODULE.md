# Leaderboard Module Documentation

**Package:** `com.backend.springapp.leaderboard`  
**Location:** `src/main/java/com/backend/springapp/leaderboard/`

---

## Overview

The Leaderboard module ranks users based on the difficulty-weighted rating accumulated from solving problems. It exposes three REST endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/leaderboard/global` | Paginated global ranking across all users |
| `GET` | `/api/leaderboard/institution/{institutionId}` | Paginated ranking scoped to one institution |
| `GET` | `/api/leaderboard/rank?userId={uid}` | A single user's global and institutional rank |

Institution is **optional** on every user account — users without one appear on the global leaderboard but never on any institutional leaderboard.

---

## Rating System

Every user has a `rating` column stored directly on the `users` table. It starts at `0` and is **incremented atomically each time a new problem is solved** — re-marking an already-solved problem does not add points.

Points per problem difficulty:

| Difficulty tag | Points |
|----------------|--------|
| `HARD`         | 3      |
| `MEDIUM`       | 2      |
| `EASY` / `BASIC` | 1    |

Rating is written by `UserProgressService.markAsSolved` via `UserRepository.addRating`, which issues a single `UPDATE users SET rating = rating + :points WHERE uid = :uid`. Because rating is persisted on the user row, leaderboard queries never need to recompute it with `SUM(CASE ...)` at read time.

### Ordering / Tie-breaking

Users are sorted in this priority order across all leaderboard queries:

1. **`u.rating` descending** — highest accumulated rating first
2. **`COUNT(up.id)` descending** — if two users have the same rating, the one with more solved problems ranks higher
3. **`MAX(up.solved_at)` ascending** — if both are still tied, the user who reached that rating earlier ranks higher

---

## Files

### 1. `LeaderboardEntryDTO.java` — Response DTO for the Paginated List Endpoints

Used as elements inside the `Page<LeaderboardEntryDTO>` returned by `/global` and `/institution/{id}`. Each object represents one row in the ranked table.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `rank` | `int` | 1-based sequential position on the current page (page 2, size 20 → ranks start at 21) |
| `uid` | `Long` | User's primary key |
| `username` | `String` | Display name |
| `lcusername` | `String` | LeetCode handle — `null` if not set |
| `institutionName` | `String` | Institution name — `null` for users without one |
| `solvedCount` | `long` | Total `userprogress` rows with `status = SOLVED` |
| `rating` | `long` | Stored rating value from `users.rating` |

**Why not `UserRankDTO` here?**  
The list endpoints serve a leaderboard table — they need a simple position number (`rank`) and don't need to compare two different scopes at once. `UserRankDTO` is a different shape designed for the profile use-case (see below).

**How rank is assigned:**  
The repository builds each entry with `rank = 0`. The service then stamps `rank = offset + i + 1` in-place before wrapping in `PageImpl`. Ties in rating are already resolved by the SQL ordering, so every entry gets a unique rank number.

---

### 2. `UserRankDTO.java` — Response DTO for the Single-User Rank Endpoint

Returned by `GET /api/leaderboard/rank?userId={uid}`. Contains a user's standing in both scopes simultaneously — useful for profile pages.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `Long` | User's primary key |
| `username` | `String` | Display name |
| `globalRank` | `long` | Competition rank across **all** users — ties share the same rank number |
| `institutionalRank` | `Long` | Same competition-style rank scoped to the user's institution. `null` if no institution |
| `institutionId` | `Long` | FK to the `institution` table. `null` if none |
| `institutionName` | `String` | Institution display name. `null` if none |
| `solvedCount` | `long` | Total SOLVED problems |
| `rating` | `long` | Stored rating from `users.rating` |

**How rank is calculated:**  
Standard competition (1224) ranking:

```
globalRank        = COUNT(users WHERE rating > thisUser.rating) + 1
institutionalRank = COUNT(users WHERE rating > thisUser.rating AND institution_id = X) + 1
```

Both are single `SELECT COUNT(*)` queries against indexed columns — no sorting or aggregation needed.

---

### 3. `LeaderboardRepository.java` — Data Access Layer

Uses `EntityManager` with native SQL queries and is annotated `@Transactional(readOnly = true)`. Builds `LeaderboardEntryDTO` objects directly — there is no intermediate internal record.

#### SQL constants

| Constant | Content |
|----------|---------|
| `LEADERBOARD_SQL` | Full `SELECT … FROM userprogress JOIN users LEFT JOIN institution WHERE status = 'SOLVED'` — shared by both list queries |
| `GROUP_ORDER` | `GROUP BY … ORDER BY u.rating DESC, COUNT(up.id) DESC, MAX(up.solved_at) ASC` |

The institution query appends `AND u.institution_id = :institutionId` between the two constants. No separate `FROM_INSTITUTION` constant is needed.

#### Methods

---

##### `findGlobalLeaderboard(int offset, int limit) → List<LeaderboardEntryDTO>`

Runs `LEADERBOARD_SQL + GROUP_ORDER` with `setFirstResult(offset)` and `setMaxResults(limit)`. Uses a `LEFT JOIN` to institution so users with no institution are included (their `institutionName` is `NULL`). Returns page-sized slice with `rank = 0` on each entry (rank is stamped by the service).

---

##### `countGlobalLeaderboard() → long`

```sql
SELECT COUNT(*) FROM users WHERE rating > 0
```

Any user with at least one solve has `rating >= 1`, so `rating > 0` is equivalent to "has at least one solved problem". Used to build the `Page` total-elements count.

---

##### `findInstitutionLeaderboard(Long institutionId, int offset, int limit) → List<LeaderboardEntryDTO>`

Same as `findGlobalLeaderboard` but appends `AND u.institution_id = :institutionId` before `GROUP_ORDER`. The `LEFT JOIN institution` becomes effectively an inner join because only users with a matching `institution_id` pass the filter.

---

##### `countInstitutionLeaderboard(Long institutionId) → long`

```sql
SELECT COUNT(*) FROM users WHERE institution_id = :institutionId AND rating > 0
```

---

##### `countUsersWithHigherRating(long userRating) → long`

```sql
SELECT COUNT(*) FROM users WHERE rating > :userRating
```

Used to compute the global competition rank: `rank = result + 1`. Single indexed column lookup.

---

##### `countUsersWithHigherInstitutionRating(Long institutionId, long userRating) → long`

```sql
SELECT COUNT(*) FROM users WHERE rating > :userRating AND institution_id = :institutionId
```

Used to compute the institution-scoped competition rank.

---

##### `toEntries(List<Object[]> rows) → List<LeaderboardEntryDTO>` _(private)_

Converts raw `Object[]` results from native queries into `LeaderboardEntryDTO`. Column order matches `LEADERBOARD_SQL` exactly:

| Index | Column | Field |
|-------|--------|-------|
| 0 | `u.uid` | `uid` |
| 1 | `u.username` | `username` |
| 2 | `u.lcusername` | `lcusername` |
| 3 | `i.name` | `institutionName` |
| 4 | `COUNT(up.id)` | `solvedCount` |
| 5 | `u.rating` | `rating` |

`rank` is set to `0` here and stamped by the service.

---

### 4. `LeaderboardService.java` — Business Logic Layer

Orchestrates repository calls, applies pagination, and stamps rank numbers. Depends on four beans:

| Dependency | Purpose |
|------------|---------|
| `LeaderboardRepository` | Native SQL aggregation queries for list endpoints |
| `InstitutionRepository` | Validates institution existence before scoped queries |
| `UserRepository` | Loads the `User` entity with institution for the `/rank` endpoint |
| `UserProgressRepository` | Counts solved problems for the `/rank` endpoint |

#### Methods

---

##### `getGlobalLeaderboard(Pageable pageable) → Page<LeaderboardEntryDTO>`

1. Extracts `offset` and `limit` from `Pageable`.
2. `leaderboardRepository.findGlobalLeaderboard(offset, limit)` → page of entries with `rank = 0`.
3. `leaderboardRepository.countGlobalLeaderboard()` → total element count.
4. `applyRanks(entries, offset)` → stamps sequential ranks in-place.
5. Returns `PageImpl`.

---

##### `getInstitutionLeaderboard(Long institutionId, Pageable pageable) → Page<LeaderboardEntryDTO>`

1. `institutionRepository.existsById(institutionId)` — throws `EntityNotFoundException` (→ `404`) if not found.
2. Same flow as above but using the institution-scoped repository methods.

---

##### `getUserRank(Long uid) → UserRankDTO`

Does **not** touch `LeaderboardRepository` for user data. Instead:

1. `userRepository.findByIdWithInstitution(uid)` — one JPQL query with `LEFT JOIN FETCH` loads the `User` and its `Institution` together. Throws `404` if uid doesn't exist.
2. `userProgressRepository.countByUserIdAndStatus(uid, SOLVED)` — solved count.
3. `leaderboardRepository.countUsersWithHigherRating(user.getRating()) + 1` — global rank.
4. If user has an institution: `leaderboardRepository.countUsersWithHigherInstitutionRating(...) + 1` — institutional rank.
5. Assembles and returns `UserRankDTO`.

Total: **3 queries** (user fetch, solved count, rating comparison) — or 4 if the user has an institution.

---

##### `applyRanks(List<LeaderboardEntryDTO> entries, int offset)` _(private)_

Stamps rank numbers in-place: `entries.get(i).setRank(offset + i + 1)`. No new list is allocated. Page 3, size 10 → ranks 21–30.

---

### 5. `LeaderboardController.java` — REST Layer

`@RestController`, base path `/api/leaderboard`. All responses wrapped in `ResponseEntity`.

#### Endpoints

---

##### `GET /api/leaderboard/global`

```
Query params : page (default 0), size (default 20)
Response     : 200 OK — Page<LeaderboardEntryDTO>
```

`sort` query param is accepted by Spring's `Pageable` resolver but **ignored** — ordering is fixed by the SQL query.

Example: `GET /api/leaderboard/global?page=0&size=50`

---

##### `GET /api/leaderboard/institution/{institutionId}`

```
Path param   : institutionId (Long)
Query params : page (default 0), size (default 20)
Response     : 200 OK — Page<LeaderboardEntryDTO>
               404 Not Found — unknown institutionId
```

Only users whose `institution_id` matches are included. Users with no institution are excluded regardless of rating.

Example: `GET /api/leaderboard/institution/3?page=0&size=20`

---

##### `GET /api/leaderboard/rank`

```
Query param : userId (Long, required)
Response    : 200 OK — UserRankDTO
              404 Not Found — unknown userId
```

Returns both global and institutional rank in one call. `institutionalRank` is `null` when the user has no institution set.

Example: `GET /api/leaderboard/rank?userId=42`

---

## Data Flow

```
HTTP Request
     │
     ▼
LeaderboardController
     │
     ▼
LeaderboardService
     │── (list endpoints) LeaderboardRepository → native SQL → toEntries() → applyRanks()
     │                                                                              │
     │── (rank endpoint)  UserRepository.findByIdWithInstitution()                 │
     │                    UserProgressRepository.countByUserIdAndStatus()           │
     │                    LeaderboardRepository.countUsersWithHigherRating()        │
     ▼                                                                              ▼
LeaderboardEntryDTO (inside Page)                                            UserRankDTO
     │                                                                              │
     └──────────────────────── JSON response to client ─────────────────────────────┘
```

---

## Database Tables Used

| Table | Columns used | Purpose |
|-------|-------------|---------|
| `userprogress` | `uid, id, status, solved_at` | Source of solved-problem records for list queries |
| `users` | `uid, username, lcusername, institution_id, rating` | User identity, institution FK, and stored rating |
| `institution` | `id, name` | Institution display name |

Note: the `problems` table is **not** joined in any leaderboard query. Rating is pre-computed and stored on the user row, so problem difficulty is only needed at solve time (in `UserProgressService`).

---

## Key Design Decisions

### Rating stored on the user row, not computed at read time
Previously the leaderboard recomputed `SUM(CASE p.tag WHEN 'HARD' THEN 3 ...)` on every request, joining `userprogress` to `problems` for every user. Now `users.rating` is incremented by `UserRepository.addRating` exactly once per new solve. Leaderboard queries read a single indexed column — no aggregation over `problems` needed.

### No intermediate internal record (`LeaderboardRankRow` removed)
The old design used a package-private record as a staging type between the repository and service. Since the repository now builds the final `LeaderboardEntryDTO` directly (with `rank = 0` as a placeholder), the intermediate type is unnecessary.

### `getUserRank` uses the entity, not native SQL
Fetching a user's own stats (username, institution, rating) via a join over `userprogress` was wasteful — all that data already lives on the `User` entity. `UserRepository.findByIdWithInstitution` fetches the user and institution in one `LEFT JOIN FETCH` query, avoiding the userprogress join entirely.

### Count queries for rank instead of sort + position
Computing a user's rank via `SELECT COUNT(*) FROM users WHERE rating > :userRating` is O(log n) with a B-tree index on `users.rating`. Sorting all rows and finding position would be O(n log n).

### Why EntityManager instead of `@Query` in a JpaRepository?
The list queries use string-concatenated SQL fragments to share the `LEADERBOARD_SQL` base between global and institution variants, and require direct `setFirstResult` / `setMaxResults` control for offset pagination. `EntityManager` supports both cleanly.

### Two different rank styles (sequential vs. competition)
- **List endpoints** (`/global`, `/institution/{id}`): Sequential ranks (`1, 2, 3, …`) — ties are broken by the SQL ordering so every row gets a unique visible number, keeping the table clean.
- **Rank endpoint** (`/rank`): Competition ranks (1224 standard) — users with identical ratings share the same rank, which is the conventional expectation when a user looks up their own position.
