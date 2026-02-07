# DSA Conquest Map - Problem Mapping Documentation

## Overview

The DSA Conquest Map is a gamified world map interface that tracks user progress through a curated **164-problem learning path** across **27 stages**. Each country on the world map represents an individual DSA problem, creating an engaging visual journey as users master Data Structures & Algorithms concepts.

---

## 📊 Learning Path Statistics

| Metric | Count |
|--------|-------|
| **Total Problems** | 164 |
| **Main Stages** | 24 (numbered 1-24) |
| **Bonus Stages** | 3 (A, B, C) |
| **Problems with Visualizers** | 144 |
| **New Basic Problems** | 20 |
| **Problems with LeetCode Links** | 115 |
| **Countries Used** | 164 |

---

## 🗺️ Component Architecture

```
src/map/
├── index.js              # Module exports
├── useProgressStore.js   # Zustand store + data re-exports
├── WorldMap.jsx          # Main interactive map component
├── WorldMap.css          # Styling for map and UI elements
├── world.svg             # SVG world map asset (~200 countries)
└── README.md             # Component documentation

src/data/
└── dsa-conquest-map.js   # Single source of truth for all problem data
```

### Component Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    dsa-conquest-map.js                              │
│                    (Data Source Layer)                              │
├─────────────────────────────────────────────────────────────────────┤
│  Exports:                                                           │
│  • ALL_PROBLEMS (164 problems with full metadata)                   │
│  • STAGES (27 stage definitions with colors/icons)                  │
│  • STAGE_ORDER [1,2,3...24,'A','B','C']                            │
│  • FULL_ROADMAP (ordered problem array)                            │
│  • Country mappings (PROBLEM_TO_COUNTRY, COUNTRY_TO_PROBLEM)       │
│  • Helper functions (getProblemsByStage, getLeetCodeUrl, etc.)     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Imports all data
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    useProgressStore.js                              │
│                    (State Management Layer)                         │
├─────────────────────────────────────────────────────────────────────┤
│  • Re-exports all data from dsa-conquest-map.js                    │
│  • Zustand store for progress tracking                             │
│  • LocalStorage persistence (key: 'dsa-conquest-map-progress-v4')  │
│  • Progress functions: completeProblem, getStageProgress, etc.     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Uses store + data
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      WorldMap.jsx                                   │
│                      (UI Component Layer)                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Interactive SVG world map with pan/zoom                         │
│  • Country click handlers → problem side panel                     │
│  • Sidebar with stage list and progress                            │
│  • Position marker for current problem                             │
│  • Debug panel for testing                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Reference

### 1. `dsa-conquest-map.js` - Data Source

**Location:** `src/data/dsa-conquest-map.js`

**Purpose:** Single source of truth for the entire 164-problem learning path with country mappings.

#### Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `ALL_PROBLEMS` | `Object` | Map of all 164 problems keyed by ID |
| `STAGES` | `Object` | Stage definitions with name, color, icon, pattern |
| `STAGE_ORDER` | `Array` | Ordered array: `[1,2,3,...,24,'A','B','C']` |
| `FULL_ROADMAP` | `Array` | All problems in learning order |
| `PROBLEM_TO_COUNTRY` | `Object` | Problem ID → Country code mapping |
| `COUNTRY_TO_PROBLEM` | `Object` | Country code → Problem ID mapping |
| `getProblemsByStage(stage)` | `Function` | Get all problems for a stage |
| `getStageProgress(stage)` | `Function` | Get completion stats for a stage |
| `getLeetCodeUrl(number, slug)` | `Function` | Generate LeetCode problem URL |

#### Problem Object Structure

```javascript
{
  id: 'two-sum',                    // Unique identifier
  title: 'Two Sum',                 // Display name
  stage: 1,                         // Stage number (1-24) or letter ('A','B','C')
  order: 1,                         // Order within stage
  difficulty: Difficulty.EASY,      // EASY | MEDIUM | HARD
  country: 'United States',         // Mapped country name
  countryCode: 'US',                // ISO country code
  route: '/arrays/TwoSum',          // Visualizer route (if exists)
  leetcode: 1,                      // LeetCode problem number (if exists)
  leetcodeSlug: 'two-sum',          // LeetCode URL slug
  isNew: false,                     // true for problems without visualizers
}
```

#### Stage Object Structure

```javascript
{
  name: 'Arrays Fundamentals',      // Display name
  color: '#3498db',                 // Theme color (hex)
  icon: '📊',                       // Emoji icon
  pattern: 'solid',                 // Visual pattern
}
```

---

### 2. `useProgressStore.js` - State Management

**Location:** `src/map/useProgressStore.js`

**Purpose:** Zustand store for tracking user progress with localStorage persistence.

#### Store State

```javascript
{
  completedProblems: [],  // Array of completed problem IDs
}
```

#### Store Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `completeProblem` | `(problemId)` | Mark a problem as complete |
| `isProblemCompleted` | `(problemId)` | Check if problem is done |
| `isProblemUnlocked` | `(problemId)` | Check if problem can be attempted |
| `getProblemState` | `(problemId)` | Returns: 'locked' \| 'available' \| 'completed' \| 'current' |
| `getCurrentRoadmapProblem` | `()` | Get the next problem to attempt |
| `getRoadmapIndex` | `()` | Get current position (0-163) |
| `getStageProgress` | `(stageKey)` | Get `{completed, total, isComplete}` |
| `getTotalProgress` | `()` | Get overall `{completed, total, percentage}` |
| `markStageComplete` | `(stageKey)` | Complete all problems in a stage |
| `resetProgress` | `()` | Clear all progress |

#### Progression Rules

1. **Free Stage Access:** First problem in each stage is always unlocked
2. **Sequential Within Stage:** Must complete problem N to unlock problem N+1 in same stage
3. **Visual States:**
   - 🔒 **Locked** - Cannot attempt yet
   - ⚪ **Available** - Can attempt
   - 🎯 **Current** - Next in roadmap order
   - ✅ **Completed** - Done

---

### 3. `WorldMap.jsx` - Interactive Map Component

**Location:** `src/map/WorldMap.jsx`

**Purpose:** Main UI component rendering the interactive world map.

#### Features

| Feature | Description |
|---------|-------------|
| **Pan & Zoom** | Mouse wheel zoom, drag to pan, pinch gestures |
| **Country Interaction** | Click countries to view problem details |
| **Side Panel** | Shows problem info, LeetCode link, actions |
| **Sidebar** | Stage list with progress indicators |
| **Position Marker** | Pulsing indicator on current problem |
| **Debug Panel** | Dev tool for testing (Ctrl+Shift+D) |
| **HD Toggle** | Switch between SD/HD rendering |

#### Visual States (CSS Classes)

Countries receive CSS classes based on problem state:

```css
.country-completed  /* Green - problem done */
.country-available  /* Amber - can attempt */
.country-current    /* Blue with pulse - next up */
.country-locked     /* Gray - not unlocked */
.country-placeholder /* Very light - no problem mapped */
```

---

## 📋 Stage-to-Problem Mapping

### Main Stages (1-24)

| Stage | Name | Problems | Countries (Examples) |
|-------|------|----------|---------------------|
| 1 | Arrays Fundamentals | 10 | US, CA, MX, BR, AR, CL, PE, CO, VE, EC |
| 2 | Searching Basics | 6 | AU, NZ, PG, FJ, SB, VU |
| 3 | Basic Math & Manipulation | 6 | CN, IN, JP, KR, TW, PH |
| 4 | Binary Search | 6 | GB, FR, DE, IT, ES, PT |
| 5 | Two Pointers | 7 | RU, UA, PL, CZ, HU, RO, BG |
| 6 | Sliding Window | 7 | EG, ZA, NG, KE, ET, TZ, MA |
| 7 | String Fundamentals | 6 | SA, AE, TR, IR, IQ, IL |
| 8 | String Algorithms | 5 | SE, NO, FI, DK, IS |
| 9 | Hashing Techniques | 6 | TH, VN, MY, SG, ID, MM |
| 10 | Linked List | 10 | PK, BD, LK, NP, AF, KZ, UZ, TJ, KG, TM |
| 11 | Advanced Linked List | 6 | GR, HR, RS, SI, BA, MK |
| 12 | Stack | 7 | AT, CH, BE, NL, LU, IE, SK |
| 13 | Monotonic Stack | 6 | DZ, LY, TN, SD, AO, MZ |
| 14 | Queue & Deque | 7 | GH, CI, CM, SN, ML, BF, NE |
| 15 | Recursion & Backtracking | 6 | CU, DO, HT, JM, PR, TT |
| 16 | Backtracking Advanced | 5 | GT, HN, SV, NI, CR |
| 17 | Trees Fundamentals | 10 | PA, BZ, GY, SR, BO, PY, UY, NA, BW, ZW |
| 18 | Binary Search Trees | 5 | MG, RW, BI, UG, MW |
| 19 | Tree Algorithms | 7 | LA, KH, BN, TL, MN, BT, MV |
| 20 | Graphs Basics | 6 | AL, XK, ME, MD, BY, AM |
| 21 | Graph Traversal | 6 | GE, AZ, CY, MT, LV, LT |
| 22 | Advanced Graphs | 7 | EE, FO, GL, AD, MC, SM, VA |
| 23 | Heaps & Priority Queues | 7 | LI, GI, SJ, AX, IM, JE, GG |
| 24 | Dynamic Programming | 8 | GP, MQ, RE, YT, NC, PF, WF, PM |

### Bonus Stages (A, B, C)

| Stage | Name | Problems | Description |
|-------|------|----------|-------------|
| A | Greedy Algorithms | 5 | Optimization strategies |
| B | Bit Manipulation | 5 | Bitwise operations |
| C | Advanced DP | 4 | Complex DP patterns |

---

## 🆕 New Problems (Without Visualizers)

These 20 problems have `isNew: true` and link directly to LeetCode:

| Stage | Problem | LeetCode # |
|-------|---------|------------|
| 1 | Insert Element at Index | - |
| 1 | Delete Element at Index | - |
| 2 | Linear Search Basic | - |
| 3 | Prefix Sum | 303 |
| 10 | Build Linked List | - |
| 10 | Insert at Head | - |
| 10 | Insert at Tail | - |
| 10 | Insert at Position | - |
| 10 | Delete Node | 237 |
| 10 | Search in Linked List | - |
| 12 | Build Stack | - |
| 12 | Valid Parentheses | 20 |
| 14 | Build Queue | - |
| 14 | Implement Queue using Stacks | 232 |
| 17 | Build Binary Tree | - |
| 17 | Insert in BST | 701 |
| 17 | Search in BST | 700 |
| 17 | Delete from BST | 450 |
| 21 | Call Stack Visualization | - |
| 24 | Climbing Stairs | 70 |

---

## 🎨 Styling Reference

### Color Scheme by Stage Group

```
Arrays/Searching (1-3):    #3498db (Blue)
Binary Search/Pointers (4-5): #9b59b6 (Purple)
Sliding Window/Strings (6-8): #e74c3c (Red)
Hashing/LinkedList (9-11):  #2ecc71 (Green)
Stack/Queue (12-14):        #f39c12 (Orange)
Recursion/Backtracking (15-16): #1abc9c (Teal)
Trees (17-19):              #34495e (Dark)
Graphs (20-22):             #e91e63 (Pink)
Heaps/DP (23-24):           #673ab7 (Deep Purple)
Bonus (A-C):                #ff5722 (Deep Orange)
```

---

## 🔧 Usage Example

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorldMap } from './map';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/world-map" element={<WorldMap />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Accessing Progress Programmatically

```jsx
import useProgressStore, { 
  getProblemsByStage,
  STAGES 
} from './map/useProgressStore';

function ProgressDisplay() {
  const { getTotalProgress, getStageProgress } = useProgressStore();
  
  const total = getTotalProgress();
  const stage1 = getStageProgress(1);
  
  return (
    <div>
      <p>Overall: {total.completed}/{total.total} ({total.percentage}%)</p>
      <p>Stage 1: {stage1.completed}/{stage1.total}</p>
    </div>
  );
}
```

---

## 🔄 Data Flow Summary

```
User clicks country
       ↓
WorldMap.jsx: handleCountryClick()
       ↓
getProblemForCountry(countryCode) ← from useProgressStore
       ↓
Opens side panel with problem info
       ↓
User clicks "Go to Visualizer" or "Open on LeetCode"
       ↓
If visualizer exists: navigate(problem.route)
If isNew: window.open(getLeetCodeUrl())
       ↓
User completes problem
       ↓
completeProblem(problemId) → updates Zustand store
       ↓
Store persists to localStorage
       ↓
WorldMap re-renders, country turns green ✓
```

---

## 📝 Adding New Problems

1. **Add to `dsa-conquest-map.js`:**
   ```javascript
   'new-problem': {
     id: 'new-problem',
     title: 'New Problem',
     stage: 1,
     order: 11,  // Next order in stage
     difficulty: Difficulty.MEDIUM,
     country: 'New Zealand',
     countryCode: 'NZ',
     route: '/arrays/NewProblem',  // or null if isNew
     leetcode: 123,
     leetcodeSlug: 'new-problem',
     isNew: false,
   }
   ```

2. **Add country mapping:**
   ```javascript
   PROBLEM_TO_COUNTRY['new-problem'] = 'NZ';
   COUNTRY_TO_PROBLEM['NZ'] = 'new-problem';
   ```

3. **Update stage problem count if needed**

4. **Create visualizer component** (if `isNew: false`)

---

**Last Updated:** February 7, 2026
