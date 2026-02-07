# AlgoVisualizer - Application Architecture

## Overview

AlgoVisualizer is a React-based interactive algorithm learning platform that provides visual explanations and step-by-step walkthroughs for various data structures and algorithms.

---

## Project Structure

```
src/
├── App.jsx                    # Main application entry with React Router
├── index.js                   # React DOM render entry
├── index.css                  # Global styles
├── main.jsx                   # Vite entry point
│
├── routes/                    # Routing configuration
│   ├── config.js              # Category route definitions
│   └── index.jsx              # All route declarations with lazy loading
│
├── pages/                     # Page components
│   ├── HomePage.css           # Shared styling for all pages
│   ├── HomePageNew.jsx        # Main homepage component
│   ├── CategoryPage.jsx       # Reusable category template
│   ├── VisualizerPage.jsx     # Wrapper for algorithm visualizers
│   ├── VisualizerLayout.jsx   # Alternative layout component
│   │
│   ├── Arrays/                # Array algorithm visualizers
│   │   ├── Arrays.jsx         # (Legacy) Category main page
│   │   ├── TwoSum.jsx
│   │   ├── ThreeSum.jsx
│   │   └── ...
│   │
│   ├── Sorting/               # Sorting algorithm visualizers
│   │   ├── Sorting.jsx        # (Legacy) Category main page
│   │   ├── BubbleSort.jsx
│   │   ├── MergeSort.jsx
│   │   └── ...
│   │
│   └── [Other Categories]/    # Similar structure for all categories
│
├── components/                # Reusable UI components
│   ├── Footer.jsx
│   ├── AlertBox.jsx
│   ├── ChatbotWidget.jsx
│   ├── StarButton.jsx
│   ├── ui/
│   │   ├── card-spotlight.jsx
│   │   └── canvas-reveal-effect.jsx
│   ├── kokonut-ui/
│   │   └── card-flip.jsx
│   └── magic-ui/
│       └── magic-card.jsx
│
├── context/                   # React Context providers
│   ├── ThemeContext.jsx       # Dark/Light theme management
│   ├── AlertContext.jsx       # Global alert notifications
│   └── ChatbotContext.jsx     # Chatbot state management
│
├── data/                      # Static data
│   └── categories.js          # Category definitions for homepage
│
├── search/                    # Search functionality
│   └── catalog.js             # Master catalog of all problems
│
├── hooks/                     # Custom React hooks
│   ├── useChatbot.js
│   ├── useInfoModal.js
│   └── useModeHistorySwitch.js
│
├── lib/                       # Utility libraries
│   └── utils.js               # Helper functions (cn, etc.)
│
└── utils/                     # Additional utilities
    └── starredManager.js      # Starred problems persistence
```

---

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE (/)                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Hero Section: Title, Description, Search Bar               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Category Grid: CardFlip components for each category       │    │
│  │  - Sorting, Arrays, Binary Search, Strings, etc.            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Click on category
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CATEGORY PAGE (e.g., /sorting)                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Navigation: Back to Home | Category Title                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Hero Section: Category name, description                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Algorithm Grid: CardSpotlight for each algorithm            │    │
│  │  - Shows: Name, difficulty, technique, time complexity       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Click on algorithm
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│               VISUALIZER PAGE (e.g., /sorting/BubbleSort)            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Navigation: Back to Category | Algorithm Title              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Visualizer Content: Interactive algorithm visualization     │    │
│  │  - Array/data visualization                                  │    │
│  │  - Step controls (play, pause, step forward/back)            │    │
│  │  - Code highlighting                                         │    │
│  │  - Explanation panel                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Routing System

### URL Structure

| Route Pattern | Example | Component |
|--------------|---------|-----------|
| `/` | Homepage | `HomePageNew.jsx` |
| `/:category` | `/sorting` | `CategoryPage.jsx` |
| `/:category/:algorithm` | `/sorting/BubbleSort` | `VisualizerPage.jsx` + Visualizer |

### Route Configuration ([src/routes/config.js](../src/routes/config.js))

```javascript
export const categoryConfig = {
  sorting: {
    key: "Sorting",           // Matches catalog.js category
    title: "Sorting Algorithms",
    eyebrow: "Sorting techniques",
    description: "Arrange data efficiently...",
    icon: ArrowDownUp,        // Lucide icon
    path: "/sorting",         // URL path
  },
  // ... other categories
};
```

### Route Definitions ([src/routes/index.jsx](../src/routes/index.jsx))

- All routes use React Router v6+ with `<Routes>` and `<Route>`
- Lazy loading via `React.lazy()` for code splitting
- `VisualizerRoute` wrapper provides consistent navigation

---

## Key Components

### 1. CategoryPage ([src/pages/CategoryPage.jsx](../src/pages/CategoryPage.jsx))

Reusable template for all category landing pages:
- Fetches algorithms from `catalog.js` by `categoryKey`
- Uses `HomePage.css` for consistent styling
- Renders algorithm cards with `CardSpotlight`

### 2. VisualizerPage ([src/pages/VisualizerPage.jsx](../src/pages/VisualizerPage.jsx))

Wrapper for individual algorithm visualizers:
- Provides back navigation to category
- Displays category icon and algorithm title
- Wraps visualizer content with consistent layout

### 3. CardFlip ([src/components/kokonut-ui/card-flip.jsx](../src/components/kokonut-ui/card-flip.jsx))

Interactive card component for homepage categories:
- Flip animation on hover
- Shows category icon, title, description, topics

### 4. CardSpotlight ([src/components/ui/card-spotlight.jsx](../src/components/ui/card-spotlight.jsx))

Card component with mouse-following spotlight effect:
- Used for algorithm cards in category pages
- Provides visual feedback on hover

---

## Data Architecture

### Master Catalog ([src/search/catalog.js](../src/search/catalog.js))

Single source of truth for all algorithm metadata:

```javascript
export const problems = [
  {
    label: "Bubble Sort",           // Display name
    category: "Sorting",            // Category key
    subpage: "BubbleSort",          // Route segment
    keywords: ["sort", "bubble"],   // Search keywords
    number: "N/A",                  // LeetCode number (if applicable)
    icon: ArrowDownUp,              // Lucide icon
    description: "Simple sorting...",
    difficulty: "Easy",
    tier: "Tier 1",
    difficultyColor: "text-success",
    difficultyBg: "bg-success/10",
    technique: "Comparison",
    timeComplexity: "O(n²)",
    platforms: ["GfG"],
    tags: ["Sorting", "Comparison"],
  },
  // ... more problems
];
```

### Categories ([src/data/categories.js](../src/data/categories.js))

Category definitions for homepage display:

```javascript
export const categories = [
  {
    name: "Sorting",
    icon: ArrowDownUp,
    description: "Arrange data efficiently...",
    page: "Sorting",              // Maps to categoryConfig key
    spotlightColor: "#f97316",
    subtitle: "Master sorting algorithms",
    topics: getTopicsForCategory("Sorting"),  // Auto-populated from catalog
  },
  // ... more categories
];
```

---

## Styling System

### HomePage.css Variables

```css
:root {
  /* Light Mode */
  --home-bg: oklch(1 0 0);
  --home-surface: oklch(0.97 0 0);
  --home-card-bg: oklch(1 0 0);
  --home-card-border: oklch(0.922 0 0);
  --home-card-hover: oklch(0.97 0 0);
  --home-text-strong: oklch(0.145 0 0);
  --home-text: oklch(0.205 0 0);
  --home-muted: oklch(0.556 0 0);
  --home-accent: oklch(0.205 0 0);
}

.dark {
  /* Dark Mode - Same variables, different values */
}
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.home-shell` | Main page container |
| `.home-content` | Content wrapper with max-width |
| `.home-hero` | Hero section with title |
| `.home-title` | Main page title |
| `.home-lede` | Subtitle/description |
| `.category-grid` | Grid layout for cards |
| `.category-card` | Individual card styling |
| `.category-nav` | Category page navigation |
| `.visualizer-shell` | Visualizer page container |
| `.visualizer-nav` | Visualizer navigation bar |

---

## Context Providers

### ThemeContext
- Manages dark/light theme
- Persists preference to localStorage
- Provides `theme` and `toggleTheme`

### AlertContext
- Global alert/notification system
- Provides `showAlert(message, type)`

### ChatbotContext
- AI chatbot state management
- Provides chatbot visibility and messages

---

## Algorithm Categories

| Category | Path | Key | # of Algorithms |
|----------|------|-----|-----------------|
| Sorting | `/sorting` | `Sorting` | 12 |
| Arrays | `/arrays` | `Arrays` | 20+ |
| Binary Search | `/binary-search` | `BinarySearch` | 9 |
| Strings | `/strings` | `Strings` | 8 |
| Searching | `/searching` | `Searching` | 6 |
| Hashing | `/hashing` | `Hashing` | 4 |
| Linked List | `/linked-list` | `LinkedList` | 5 |
| Recursion | `/recursion` | `Recursion` | 6 |
| Bit Manipulation | `/bit-manipulation` | `BitManipulation` | 5 |
| Stack | `/stack` | `Stack` | 6 |
| Queue | `/queue` | `Queue` | 3 |
| Sliding Window | `/sliding-window` | `SlidingWindows` | 5 |
| Heaps | `/heaps` | `Heaps` | 3 |
| Trees | `/trees` | `Trees` | 9 |
| Graphs | `/graphs` | `Graphs` | 6 |
| Pathfinding | `/pathfinding` | `Pathfinding` | 5 |
| Greedy | `/greedy` | `GreedyAlgorithms` | 4 |
| Backtracking | `/backtracking` | `Backtracking` | 5 |
| Dynamic Programming | `/dynamic-programming` | `DynamicProgramming` | 8 |
| Design | `/design` | `Design` | 6 |
| Mathematical | `/maths` | `MathematicalMiscellaneous` | 5 |

---

## Adding a New Algorithm

### Step 1: Add to Catalog
Edit `src/search/catalog.js`:

```javascript
{
  label: "New Algorithm",
  category: "Sorting",  // Must match categoryConfig key
  subpage: "NewAlgorithm",  // URL segment
  keywords: ["new", "algorithm"],
  icon: SomeIcon,
  description: "Description here",
  difficulty: "Medium",
  technique: "Technique",
  timeComplexity: "O(n)",
  // ... other fields
},
```

### Step 2: Create Visualizer Component
Create `src/pages/Sorting/NewAlgorithm.jsx`:

```jsx
const NewAlgorithmVisualizer = () => {
  // Visualization logic
  return <div>...</div>;
};

export default NewAlgorithmVisualizer;
```

### Step 3: Add Route
Edit `src/routes/index.jsx`:

```jsx
// Add lazy import
const NewAlgorithm = lazy(() => import("../pages/Sorting/NewAlgorithm"));

// Add route
<Route 
  path={`${sorting.path}/NewAlgorithm`} 
  element={<VisualizerRoute component={NewAlgorithm} title="New Algorithm" category="sorting" />} 
/>
```

---

## Adding a New Category

### Step 1: Add to Route Config
Edit `src/routes/config.js`:

```javascript
newcategory: {
  key: "NewCategory",
  title: "New Category",
  eyebrow: "New techniques",
  description: "Description...",
  icon: SomeIcon,
  path: "/new-category",
},
```

### Step 2: Add to Categories Data
Edit `src/data/categories.js`:

```javascript
{
  name: "New Category",
  icon: SomeIcon,
  description: "Description...",
  page: "NewCategory",
  spotlightColor: "#hexcolor",
  subtitle: "Subtitle",
  topics: getTopicsForCategory("NewCategory"),
},
```

### Step 3: Add Routes
Edit `src/routes/index.jsx`:
- Add category route
- Add algorithm routes

---

## Technologies Used

- **React 19** - UI framework
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite/CRA** - Build tool

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | PascalCase | `HomePage.jsx` |
| Components | PascalCase | `CardSpotlight.jsx` |
| Visualizers | PascalCase | `BubbleSort.jsx` |
| Utilities | camelCase | `utils.js` |
| Styles | PascalCase | `HomePage.css` |
| Hooks | camelCase with `use` | `useChatbot.js` |

---

## Performance Optimizations

1. **Lazy Loading** - All visualizers are lazy-loaded
2. **Code Splitting** - Each category/algorithm is a separate chunk
3. **Memoization** - Search index is memoized with `useMemo`
4. **CSS Variables** - Theme switching without re-renders

---

## DSA Conquest Map (Gamification System)

The application includes a gamified world map that visualizes user progress through a curated 164-problem learning path.

### Overview

| Feature | Description |
|---------|-------------|
| **Total Problems** | 164 across 27 stages |
| **Main Stages** | 24 (numbered 1-24) |
| **Bonus Stages** | 3 (A, B, C) |
| **Visualization** | Interactive SVG world map |
| **Persistence** | LocalStorage via Zustand |

### Component Structure

```
src/
├── map/                          # World Map module
│   ├── index.js                  # Module exports
│   ├── WorldMap.jsx              # Main interactive map component
│   ├── WorldMap.css              # Map styling
│   ├── useProgressStore.js       # Zustand store + data re-exports
│   ├── world.svg                 # SVG map asset
│   └── README.md                 # Component documentation
│
└── data/
    └── dsa-conquest-map.js       # Single source of truth for problem data
```

### Key Concepts

- **Countries = Problems**: Each country represents one DSA problem
- **Stages = Learning Units**: 27 stages group related problems
- **Progression**: Sequential within stages, free access to first problem of any stage
- **Visual States**: locked (gray), available (amber), current (blue pulse), completed (green)

### Data Flow

```
dsa-conquest-map.js (164 problems, 27 stages)
         ↓
useProgressStore.js (Zustand store + re-exports)
         ↓
WorldMap.jsx (Interactive UI)
         ↓
User completes problem → Store updates → Country turns green
```

### Route

| Path | Component | Description |
|------|-----------|-------------|
| `/world-map` | `WorldMap` | Gamified DSA learning map |

For detailed documentation, see [DSA_CONQUEST_MAP.md](./DSA_CONQUEST_MAP.md).

---

*Last updated: February 2026*
