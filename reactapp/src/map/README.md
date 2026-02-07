# 🗺️ DSA Skill Tree World Map Component

A gamified, interactive world map component for tracking progress through Data Structures & Algorithms problems. Countries represent individual problems, creating an engaging visual journey across the globe as you master DSA concepts.

![DSA Skill Tree](https://img.shields.io/badge/React-18+-blue) ![Zustand](https://img.shields.io/badge/State-Zustand-orange) ![TypeScript Ready](https://img.shields.io/badge/TypeScript-Ready-green)

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Component Structure](#-component-structure)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Customization](#-customization)
- [Performance](#-performance)
- [Future Roadmap](#-future-roadmap)

---

## ✨ Features

### Core Features
- **🌍 Interactive World Map** - SVG-based world map with ~200+ clickable country paths
- **📊 164 DSA Problems** - Covering 27 stages from Arrays to Dynamic Programming
- **🎮 Gamified Progression** - Countries light up as you complete problems
- **🔄 Hybrid Unlocking** - Free stage access + sequential progression within stages
- **💾 Persistent Progress** - Local storage saves your journey automatically

### UI/UX Features
- **🔍 Smooth Pan & Zoom** - Mouse wheel zoom, click-drag pan, pinch gestures
- **📍 Position Marker** - Pulsing indicator shows your current problem
- **🎯 Jump to Current** - One-click navigation to your next challenge
- **📋 Stage Legend** - Quick overview with progress for each stage
- **📱 Responsive Design** - Works on desktop and mobile devices

### Performance Features
- **⚡ SD/HD Toggle** - Switch between performance and quality modes
- **🖥️ GPU Acceleration** - Hardware-accelerated transforms
- **🎨 CSS Class-based Styling** - Efficient state updates without re-renders
- **📦 Optimized Bundle** - Minimal dependencies, tree-shakeable exports

---

## 📦 Installation

### Prerequisites

Ensure your project has these peer dependencies:

```bash
npm install react react-dom react-router-dom
```

### Required Dependencies

```bash
# State management
npm install zustand

# Pan/Zoom functionality
npm install react-zoom-pan-pinch

# Icons
npm install lucide-react
```

### Full Installation Command

```bash
npm install zustand react-zoom-pan-pinch lucide-react
```

---

## 🚀 Quick Start

### 1. Copy the `map` folder to your project

```
your-project/
├── src/
│   ├── map/                    # Copy this entire folder
│   │   ├── WorldMap.jsx        # Main component
│   │   ├── WorldMap.css        # Styles
│   │   ├── useProgressStore.js # Zustand store
│   │   ├── world.svg           # Map asset
│   │   └── index.js            # Exports
│   └── App.jsx
```

### 2. Import and use the component

```jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorldMap } from './map';

function App() {
  return (
    <BrowserRouter>
      <WorldMap />
    </BrowserRouter>
  );
}

export default App;
```

### 3. Run your application

```bash
npm start
```

---

## 📁 Component Structure

```
map/
├── WorldMap.jsx          # Main React component (~700 lines)
│   ├── Pan/Zoom controls
│   ├── Country click handling
│   ├── State management integration
│   ├── Position marker overlay
│   ├── Stage legend sidebar
│   ├── Debug panel
│   └── Side panel (problem details)
│
├── WorldMap.css          # Self-contained styles (~550 lines)
│   ├── CSS Variables (theming)
│   ├── SVG path state classes
│   ├── Performance optimizations
│   └── Responsive breakpoints
│
├── useProgressStore.js   # Zustand state management (~220 lines)
│   ├── Progress tracking state
│   ├── Re-exports from dsa-conquest-map.js
│   ├── Persistence middleware
│   └── Problem state calculations
│
├── world.svg             # SVG world map asset (~200 countries)
│
└── index.js              # Module exports

../data/
└── dsa-conquest-map.js   # Single source of truth (~800 lines)
    ├── ALL_PROBLEMS (164 problems)
    ├── STAGES (27 stage definitions)
    ├── Country-Problem mappings
    └── Helper functions
```

---

## ⚙️ Configuration

### Problem Data Source

All problem data is defined in `src/data/dsa-conquest-map.js`:

```javascript
export const ALL_PROBLEMS = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    stage: 1,                    // Stage number (1-24) or letter ('A','B','C')
    order: 1,                    // Order within stage
    difficulty: Difficulty.EASY,
    country: 'United States',
    countryCode: 'US',
    route: '/arrays/TwoSum',     // Visualizer route (or null if isNew)
    leetcode: 1,                 // LeetCode problem number
    leetcodeSlug: 'two-sum',
    isNew: false,                // true if no visualizer exists
  },
  // ... more problems
};
```

### Stage Definitions

```javascript
export const STAGES = {
  1: { 
    name: 'Arrays Fundamentals',
    color: '#3498db',
    icon: '📊',
    pattern: 'solid'
  },
  // ... 24 numbered stages + 'A', 'B', 'C' bonus stages
};

export const STAGE_ORDER = [1, 2, 3, /* ... */ 24, 'A', 'B', 'C'];
```

### Country Assignment

Countries are assigned to problems in geographic sequence:

```javascript
// Problem → Country mapping
export const PROBLEM_TO_COUNTRY = {
  'two-sum': 'US',
  'best-time-to-buy-and-sell-stock': 'CA',
  // ... 164 mappings
};

// Reverse mapping
export const COUNTRY_TO_PROBLEM = {
  'US': 'two-sum',
  'CA': 'best-time-to-buy-and-sell-stock',
  // ... 
};
```

---

## 📖 API Reference

### WorldMap Component

```jsx
import { WorldMap } from './map';

// Basic usage - no props required
<WorldMap />
```

The component is self-contained and manages its own state.

### useProgressStore Hook

```javascript
import useProgressStore from './map/useProgressStore';

// In your component
const { 
  completedProblems,        // string[] - IDs of completed problems
  completeProblem,          // (id) => { success, nextProblem }
  getProblemState,          // (id) => 'locked' | 'available' | 'current' | 'completed'
  getCurrentRoadmapProblem, // () => Problem | null
  getStageProgress,         // (stage) => { completed, total, isComplete }
  getTotalProgress,         // () => { completed, total, percentage }
  markStageComplete,        // (stage) => void - for testing
  resetProgress,            // () => void
} = useProgressStore();
```

### Exported Data (from useProgressStore)

```javascript
import { 
  ALL_PROBLEMS,           // Object - All 164 problems keyed by ID
  STAGES,                 // Object - Stage configs (27 stages)
  STAGE_ORDER,            // Array - [1,2,3,...24,'A','B','C']
  FULL_ROADMAP,           // Array - Flat ordered problem list
  getProblemById,         // (id) => Problem
  getProblemsByStage,     // (stage) => Problem[]
  getStageProgress,       // (stage) => { completed, total, isComplete }
  getCountryForProblem,   // (problemId) => countryCode
  getProblemForCountry,   // (countryCode) => Problem
  getLeetCodeUrl,         // (number, slug) => URL string
  getNewProblems,         // () => Problem[] (problems with isNew: true)
} from './map/useProgressStore';
```

---

## 🎨 Customization

### Theming

Override CSS variables in your app:

```css
:root {
  --bg-primary: #0f172a;      /* Main background */
  --bg-secondary: #1e293b;    /* Cards, panels */
  --bg-tertiary: #334155;     /* Borders, hover states */
  --text-primary: #f8fafc;    /* Main text */
  --text-secondary: #94a3b8;  /* Secondary text */
  --accent-primary: #6366f1;  /* Primary accent (indigo) */
  --success: #10b981;         /* Completed states */
  --warning: #f59e0b;         /* Current state */
}
```

### Country State Colors

```css
/* Completed problems - uses topic color */
svg path.country-completed {
  fill: var(--topic-color, #6366f1);
}

/* Current problem - yellow highlight */
svg path.country-current {
  fill: #fef08a;
}

/* Available problems - white */
svg path.country-available {
  fill: #f8fafc;
}

/* Locked problems - gray */
svg path.country-locked {
  fill: #6b7280;
}
```

---

## ⚡ Performance

### SD/HD Mode Toggle

The component includes a performance toggle:

- **SD Mode (Default)**: 
  - `contain: layout style` on SVG paths
  - GPU acceleration with `translateZ(0)`
  - No CSS transitions
  - Better for lower-end devices

- **HD Mode**:
  - Smooth color transitions
  - Higher visual quality
  - May cause lag on slower devices

### Best Practices

1. **Avoid inline styles** - The component uses CSS classes for state changes
2. **Batch state updates** - Progress updates are batched automatically
3. **Lazy load** - Consider lazy loading this component if it's not on the landing page

---

## 🔮 Future Roadmap

### Backend Integration (Planned)

```javascript
// Proposed API structure
const useProgressStore = create(
  persist(
    (set, get) => ({
      // ... existing state
      
      // Sync with backend
      syncProgress: async () => {
        const response = await fetch('/api/progress');
        const data = await response.json();
        set({ completedProblems: data.completedProblems });
      },
      
      // Save to backend
      saveProgress: async (problemId) => {
        await fetch('/api/progress', {
          method: 'POST',
          body: JSON.stringify({ problemId })
        });
      },
    }),
    { name: 'dsa-progress' }
  )
);
```

### Planned Features

| Feature | Priority | Status |
|---------|----------|--------|
| Backend sync API | High | 🔄 Planned |
| User authentication | High | 🔄 Planned |
| Leaderboard | Medium | 💭 Idea |
| Achievement badges | Medium | 💭 Idea |
| Custom problem sets | Low | 💭 Idea |
| Multiple map themes | Low | 💭 Idea |
| WebGL rendering | Low | ❌ Attempted, reverted |

### Integration Points

To connect to a backend:

1. **Authentication**: Add user context to the store
2. **API Layer**: Create fetch utilities for CRUD operations
3. **Sync Logic**: Implement optimistic updates with rollback
4. **Conflict Resolution**: Handle offline/online sync conflicts

---

## 🐛 Troubleshooting

### Map not rendering
- Ensure `world.svg` is in the same directory as `WorldMap.jsx`
- Check that SVGR is configured in your bundler

### Countries not clickable
- Verify the SVG has proper path elements with IDs or classes
- Check browser console for JavaScript errors

### Progress not persisting
- Check browser localStorage is enabled
- Verify no localStorage quota exceeded errors

### Performance issues
- Switch to SD mode using the toggle button
- Consider reducing the number of problems if custom

---

## 📄 License

MIT License - Feel free to use in personal and commercial projects.

---

## 🙏 Credits

- World SVG Map: [amCharts](https://www.amcharts.com/svg-maps/)
- Icons: [Lucide React](https://lucide.dev/)
- State Management: [Zustand](https://zustand-demo.pmnd.rs/)
- Pan/Zoom: [react-zoom-pan-pinch](https://prc5.github.io/react-zoom-pan-pinch/)

---

**Made with ❤️ for DSA learners worldwide**
