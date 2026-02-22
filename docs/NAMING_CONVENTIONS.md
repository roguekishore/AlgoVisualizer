# Naming Conventions & Render Chain

> Canonical terminology used across the AlgoVisualizer full-stack application.

---

## Three Core Concepts

| Concept     | Scope            | Count | Example                         |
|-------------|------------------|-------|---------------------------------|
| **Stage**   | Backend + World Map | 27    | "Arrays Level 1", "DP Mastery" |
| **Topic**   | Frontend browsing   | 21    | Sorting, Trees, Graphs         |
| **Problem** | Both                | 164+  | Bubble Sort, Two Sum, N-Queens |

### Stage (backend entity)
- Represents a **world-map learning phase** on the DSA Conquest Map.
- Stored in the Spring Boot database as `Stage` entity (table `stages`).
- A Problem can belong to **multiple Stages** via the `ProblemStage` join entity.
- API: `GET /api/stages` returns all stage names.
- Frontend filter: `ProblemListPage` uses `stageFilter` to query `?stage=...`.

### Topic (frontend browsing group)
- Represents an **algorithm family** for browsing visualizers (e.g. Sorting, Trees, Graphs).
- Defined **statically** in `reactapp/src/data/topics.js` — no backend API needed.
- Each problem in `catalog.js` carries a `topic:` field matching a topic key.
- Route config lives in `reactapp/src/routes/config.js` as `topicConfig`.

### Problem (individual algorithm)
- An individual algorithm with an interactive visualizer.
- Backend entity `Problem` with fields: pid, title, tag, description, lcslug, hasVisualizer.
- Frontend catalog entry in `reactapp/src/search/catalog.js` with fields: label, topic, subpage, difficulty, tags, etc.

---

## Render Chain

### `/visualizers` — Topic Browser
```
URL: /visualizers
Component: TopicsPage
Data: topics (from data/topics.js) + PROBLEM_CATALOG (from search/catalog.js)
Lookup: getTopicByKey() from routes/config.js
Renders: TopicGrid → TopicPixelCard (one per topic)
```

### `/sorting` (or any topic path) — Problem List for a Topic
```
URL: /<topic-path>  (e.g. /sorting, /trees, /dynamic-programming)
Component: TopicPage
Props: topicKey (from topicConfig via routes/index.jsx)
Data: PROBLEM_CATALOG filtered by p.topic === topicKey
Renders: List of problems with links to their visualizers
```

### `/sorting/BubbleSort` (or any visualizer) — Algorithm Visualizer
```
URL: /<topic-path>/<subpage>
Component: VisualizerPage wrapping a lazy-loaded visualizer component
Props: title, topicName, topicPath, icon (from topicConfig)
Renders: Nav bar ("Back to <topicName>") + visualizer component
```

### `/explore` — Card-based Browse All
```
URL: /explore
Component: AlgoCards
Data: topics (from data/topics.js) + PROBLEM_CATALOG (from search/catalog.js)
Lookup: getTopicByKey(), topicConfig
Renders: Topic cards grid + tabbed algorithm cards with bento layout
```

### `/problems` — Backend-powered Problem Table
```
URL: /problems
Component: ProblemListPage
Data: Spring Boot API (GET /api/problems?stage=...&tag=...)
Filters: stageFilter (from GET /api/stages), tagFilter, keyword search
Renders: Paginated table with sortable columns, detail dialog
```

---

## File Map

### Backend (Spring Boot)
| File | Purpose |
|------|---------|
| `Stage.java` | JPA entity — world-map learning phase |
| `ProblemStage.java` | Join entity — Problem ↔ Stage (many-to-many) |
| `StageRepository.java` | `findByName(String name)` |
| `StageController.java` | `GET /api/stages` — returns sorted stage names |
| `ProblemController.java` | `GET /api/problems?stage=&tag=` |
| `ProblemService.java` | Business logic: `associateStages()`, `findOrCreateStage()` |
| `ProblemRequestDTO.java` | Input DTO — `stages` field (list of stage names) |
| `ProblemResponseDTO.java` | Output DTO — `stages` field |

### Frontend (React)
| File | Purpose |
|------|---------|
| `data/topics.js` | Static topic definitions (name, icon, page key, problems list) |
| `search/catalog.js` | Flat problem catalog — each entry has `topic:` field |
| `routes/config.js` | `topicConfig` map + `getTopicByKey()` / `getTopicByPath()` |
| `routes/index.jsx` | All `<Route>` definitions, `VisualizerRoute` helper |
| `pages/TopicsPage.jsx` | `/visualizers` — topic browser with search |
| `pages/topics/TopicPage.jsx` | `/<topic>` — problem list for one topic |
| `pages/visualizer/VisualizerPage.jsx` | Wrapper with nav for visualizer components |
| `components/TopicPixelCard.jsx` | Pixel-art card for one topic |
| `components/AlgoCards.jsx` | `/explore` — bento grid of topics + algorithms |
| `services/problemApi.js` | `fetchProblems()`, `fetchStages()` — Spring Boot API client |
| `pages/problems/ProblemListPage.jsx` | `/problems` — paginated backend-driven table |

---

## Quick Reference

```
Frontend static data flow:
  topics.js ──→ TopicsPage / AlgoCards / TopicPixelCard
  catalog.js ──→ filtered by problem.topic === topicKey

Frontend → Backend API flow:
  problemApi.js → GET /api/problems?stage=X&tag=Y
  problemApi.js → GET /api/stages  (for filter dropdown)

Naming rule of thumb:
  • "Topic"  = what users browse on the frontend  (Sorting, Trees, etc.)
  • "Stage"  = what the backend stores for world-map progression
  • "Problem" = an individual algorithm everywhere
```
