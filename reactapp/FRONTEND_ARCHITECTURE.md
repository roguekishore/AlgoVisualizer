# Vantage Frontend Architecture

This document describes the architectural layout of the Vantage frontend (`reactapp/src`). It details how the project is structured, the purpose of each directory, and exactly which components are rendered at each URL endpoint.

## Design Philosophy
The frontend follows a **Feature-Based Folder Structure**. Instead of grouping files by type (e.g., all CSS files in one folder, all pages in another, all shared generic components in another), files are grouped by the specific *feature* or *route* they belong to.

This makes it significantly easier to maintain the codebase, as all files (components, styles, specific logic) related to a particular endpoint (e.g., `/battle`) are co-located in `src/pages/battle/`.

## High-Level Directory Structure

```plaintext
src/
├── App.jsx                 # Main entry point and global layout wrapper
├── index.css               # Global Tailwind utilities and base styles
├── components/             # Reusable, feature-agnostic components
│   ├── animations/         # Heavy canvas-based background animations
│   ├── common/             # Universally used parts (Cursor, Theme, Tooltip)
│   ├── layout/             # High-level layout shells (Navbar, ProtectedRoute)
│   ├── problems/           # Shared problem-related UI (AlgoCards, Table)
│   ├── ui/                 # shadcn UI primitives (cards, buttons, dialogs)
│   └── visualizer/         # The core Algorithm Visualizer engine components
│
├── pages/                  # The actual routed endpoints (Grouped by Feature)
│   ├── achievements/       # /achievements
│   ├── algorithms/         # /<algorithm-topic>/<algorithm-name> (Visualizers)
│   ├── auth/               # /login, /signup
│   ├── battle/             # /battle, /battle/lobby, /battle/result
│   ├── friends/            # /friends
│   ├── group/              # Group battle lobbies and arenas
│   ├── home/               # / (The main landing page)
│   ├── inventory/          # /store/inventory
│   ├── judge/              # The code editor and execution environment
│   ├── leaderboard/        # /leaderboard
│   ├── profile/            # /profile
│   ├── store/              # /store
│   └── topics/             # /visualizers, /<topic-name>
│
├── map/                    # The /map World Map module (uses Three.js)
├── routes/                 # Lazy-loaded route definitions (routes/index.jsx)
├── services/               # API clients (axios fetch calls)
├── stores/                 # Zustand global state (auth, progress, etc.)
├── data/                   # Static data (topic configs, map nodes, etc.)
└── search/                 # Client-side search indices and catalog
```

## Endpoint to Component Mapping

The following table maps exactly what happens when a user navigates to a specific URL in the browser, showing the primary feature page and its key child components.

| **Endpoint** | **Entry Component** | **Key Child Components / UI Rendered** |
| :--- | :--- | :--- |
| **Global Shell** | `App.jsx` + `Navbar.jsx` | `AppContent` wraps the app. It renders the global `Navbar`, `AppToast`, `CustomCursor`, and lazy-loads all routes below. |
| `/` | `pages/home/HomePage.jsx` | Includes inline sections: Hero, Features, BentoCards, and Battle Section. Uses `HomePageAnimations` and `ComplexAnimations` in the background. |
| `/login` <br> `/signup` | `pages/auth/AuthPage.jsx` | Dual-sided authentication page. Uses `zentry` styled inputs. Handles Firebase auth and synchronizes with `useUserStore`. |
| `/problems` | `pages/home/ProblemListPage.jsx` | Returns `ProblemsTable` (from `components/problems/`) integrated with the search catalog. |
| `/visualizers` | `pages/topics/TopicsPage.jsx` | The "Topics Hub". Renders `TopicPixelCard`s for each algorithm category. |
| `/explore` | `components/problems/AlgoCards.jsx` | Global view of interactive problem cards. |
| `/<topic-name>` <br> *(e.g. `/sorting`)* | `pages/topics/TopicPage.jsx` | Shows all individual algorithms under a specific category (e.g., Bubble Sort, Merge Sort). |
| `/<topic-name>/<algo>` <br> *(e.g. `/sorting/BubbleSort`)* | `pages/visualizer/VisualizerPage.jsx` | **The Core App.** Provides the shell (Back button, Title). The actual algorithm (e.g. `BubbleSort.jsx` from `pages/algorithms/`) renders inside this shell, utilizing `VisualizerShell`, `ArrayBox`, and the `judge/JudgePage` drawer. |
| `/map` | `map/WorldMap.jsx` | A 3D interactive node map. Uses `r3f` (React Three Fiber) to render the DSA progression path. |
| `/battle` | `pages/battle/BattleLobbyPage.jsx` | 1v1 matchmaking lobby. Connects to WebSockets via `battleApi`. |
| `/battle/match/*` | `pages/battle/BattleArenaPage.jsx` | The live multiplayer coding arena. Renders `Editor` and a split-screen opponent view. |
| `/battle/result` | `pages/battle/BattleResultPage.jsx` | Post-match analysis, showing win/loss, XP gained, and ranking changes. |
| `/profile` | `pages/profile/ProfilePage.jsx` | Displays user stats, radar charts, recent submissions, and progress tracking. |
| `/leaderboard` | `pages/leaderboard/LeaderboardPage.jsx` | Global ranking list. Uses `Terminal` aesthetic styling. |
| `/store` | `pages/store/StorePage.jsx` | The cosmetic shop (Cursors, Themes, Banners) using the user's `coins` balance. |
| `/store/inventory` | `pages/inventory/InventoryPage.jsx` | Shows what cosmetic items the user has unlocked/purchased and allows equipping them. |
| `/achievements` | `pages/achievements/AchievementsPage.jsx` | Displays "Badges" earned via the gamification engine (`useAchievementStore`). |
| `/friends` | `pages/friends/FriendsPage.jsx` | Friend list, friend requests, and direct challenge features (`FriendChallengeModal`). |

## Global State Architecture (Zustand)

The frontend relies heavily on Zustand for state management, located in `src/stores/`. This avoids prop-drilling and keeps the UI stateless.

- **`useUserStore`**: Holds Firebase authentication state, JWT tokens, and basic user profile properties.
- **`useGamificationStore`**: Tracks `xp`, `level`, `coins`, and `streak` data.
- **`useAchievementStore`**: Manages unlocked badges and tracks progress towards locked badges.
- **`useBattleStore`**: Manages the ephemeral WebSocket state when a user is in a match.
- **`useFriendsStore`**: Stores the friend list and incoming challenge requests.
- **`useProgressStore`**: (Located in `map/`) Tracks which nodes/algorithms on the 3D map have been successfully solved.

## UI & Styling Guidelines

- **Tailwind (`index.css`)**: Used for absolute positioning, flexbox layouts, and rapid prototyping.
- **Terminal Brutalism**: The core aesthetic of the app. It relies heavily on absolute darkness (`#09090b`), sharp acid-yellow accents (`#EDFF66`), and monospace/Monument typography traits.
- **Inline Styles**: Frequently used for complex, highly specific dynamic elements, specifically in animations and the Visualizer engine where performance is critical.
- **GSAP**: The primary engine for all sequence animations and scroll-triggers (especially inside `Navbar` and the `HomePage`).
