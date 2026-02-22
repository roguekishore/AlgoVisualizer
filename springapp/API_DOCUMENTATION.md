# Problem API Documentation

> **Package structure:** Feature-based modules under `com.backend.springapp.*`
> - Problem endpoints → `com.backend.springapp.problem` (ProblemController, StageController)
> - Progress endpoints → `com.backend.springapp.user` (UserProgressController)
> - Shared config → `com.backend.springapp.common` (WebConfig, DataInitializer)

## Endpoints

### GET /api/problems
Get paginated list of problems with optional filters and user status.

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort criteria (e.g., "id,asc", "title,desc")
- `topic` (optional): Filter by topic name
- `tag` (optional): Filter by difficulty (BASIC, EASY, MEDIUM, HARD)
- `userId` (optional): Include user progress status
- `status` (optional): Filter by solve status (NOT_STARTED, ATTEMPTED, SOLVED)

**Response:** `Page<ProblemResponseDTO>` — `userStatus` is `null` for guests, populated for logged-in users.

---

### GET /api/problems/{id}
Get a single problem by ID.

**Response:** `ProblemResponseDTO`

---

### POST /api/problems
Create a new problem.

**Request Body:** `ProblemRequestDTO`
```json
{
  "title": "string (required)",
  "lcslug": "string (optional)",
  "tag": "string (required) - BASIC|EASY|MEDIUM|HARD",
  "hasVisualizer": "boolean (required)",
  "description": "string (optional)",
  "topics": ["string (optional)"]
}
```

**Response:** `ProblemResponseDTO`

---

### PUT /api/problems/{id}
Update an existing problem.

**Request Body:** `ProblemRequestDTO`
```json
{
  "title": "string (required)",
  "lcslug": "string (optional)",
  "tag": "string (required) - BASIC|EASY|MEDIUM|HARD",
  "hasVisualizer": "boolean (required)",
  "description": "string (optional)",
  "topics": ["string (optional)"]
}
```

**Response:** `ProblemResponseDTO`

---

### DELETE /api/problems/{id}
Delete a problem by ID.

**Response:** `204 No Content`

---

### GET /api/problems/search
Search problems by title keyword.

**Query Parameters:**
- `keyword` (required): Search term
- `page` (optional): Page number
- `size` (optional): Page size
- `sort` (optional): Sort criteria

**Response:** `Page<ProblemResponseDTO>`

---

## User Progress Endpoints

### GET /api/progress
Get all user progress for app startup (localStorage).

**Query Parameters:**
- `userId` (required): User ID

**Response:** `Map<Long, UserProgressResponseDTO>`
```json
{
  "1": {
    "pid": 1,
    "status": "SOLVED",
    "attemptCount": 3,
    "firstAttemptedAt": "2026-02-10T10:30:00",
    "solvedAt": "2026-02-12T15:45:00"
  },
  "5": {
    "pid": 5,
    "status": "ATTEMPTED",
    "attemptCount": 2,
    "firstAttemptedAt": "2026-02-13T09:00:00",
    "solvedAt": null
  }
}
```

---

### POST /api/progress/{pid}/attempt
Mark a problem as attempted.

**Query Parameters:**
- `userId` (required): User ID

**Response:** `UserProgressResponseDTO`

---

### POST /api/progress/{pid}/solve
Mark a problem as solved.

**Query Parameters:**
- `userId` (required): User ID

**Response:** `UserProgressResponseDTO`

---

### GET /api/progress/stats
Get user statistics.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "solved": 25,
  "attempted": 10,
  "notStarted": 115,
  "total": 150
}
```

---

## Response Types

### ProblemResponseDTO
```json
{
  "pid": "number",
  "title": "string",
  "lcslug": "string",
  "tag": "string (BASIC|EASY|MEDIUM|HARD)",
  "hasVisualizer": "boolean",
  "description": "string",
  "topics": ["string"],
  "userStatus": "string|null (null=guest, NOT_STARTED, ATTEMPTED, SOLVED)"
}
```

### UserProgressResponseDTO
```json
{
  "pid": "number",
  "status": "string (ATTEMPTED|SOLVED)",
  "attemptCount": "number",
  "firstAttemptedAt": "datetime",
  "solvedAt": "datetime"
}
```

### Page<ProblemResponseDTO>
```json
{
  "content": [ProblemResponseDTO],
  "pageable": {
    "pageNumber": "number",
    "pageSize": "number",
    "sort": {},
    "offset": "number",
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "totalPages": "number",
  "totalElements": "number",
  "last": "boolean",
  "first": "boolean",
  "size": "number",
  "number": "number",
  "numberOfElements": "number",
  "empty": "boolean"
}
```

---

## Example Usage

### Get all problems with user status
```
GET /api/problems?userId=1&page=0&size=20&sort=title,asc
```

### Get solved problems only
```
GET /api/problems?userId=1&status=SOLVED
```

### Get attempted Array problems
```
GET /api/problems?userId=1&status=ATTEMPTED&topic=Array
```

### Load progress on app startup
```
GET /api/progress?userId=1
```

### Mark problem as solved
```
POST /api/progress/15/solve?userId=1
```
