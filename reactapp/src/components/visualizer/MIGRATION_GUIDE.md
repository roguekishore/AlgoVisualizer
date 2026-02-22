# Visualizer Migration Guide — AI Context Document

> **Purpose**: Hand this file to any AI (Copilot, Claude, Gemini, etc.) along with
> the target visualizer file. The AI will have all the context it needs to refactor
> that visualizer to use the shared design-system components.

---

## 1 · Project Overview

- **Framework**: React (JSX, no TypeScript), CRA + craco build, Tailwind CSS
- **Component Library**: shadcn/ui (css-variables, dark mode via class). Components used:
  `Button`, `Badge`, `Card`, `Tabs`, `Input`, `Separator`, `Select`, `ScrollArea`
- **Utility**: `cn()` from `src/lib/utils.js` (clsx + tailwind-merge)
- **Icons**: `lucide-react` — all icons used everywhere
- **Design Tokens**: shadcn CSS variables — `bg-background`, `bg-card`, `bg-muted`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`,
  `bg-input`, `ring-ring`, etc.
- **Font**: Inter (imported in index.css)
- **Critical Rule**: **NO SHADOWS** — use `border` to differentiate cards/sections
- **Card Pattern**: `rounded-lg border bg-card` (never shadow)
- **Design Philosophy**: **Monochrome-first** — Linear / Vercel / Raycast inspired.
  One accent color (`primary`), neutral everything else, subtle tinted backgrounds.
- **Typography Rules**:
  - Component headers: `text-[13px] font-medium text-foreground` using `<span>` (never `<h3>`)
  - Section labels: `text-[11px] font-medium text-muted-foreground` (NEVER `uppercase`)
  - Data values: `font-mono text-xl font-semibold text-foreground` (NEVER colored)
  - Body text: `text-[13px] text-foreground`
  - Tiny labels: `text-[10px]` or `text-[11px]`
- **Icon Rules**: All component header icons use `h-3.5 w-3.5 text-muted-foreground`
- **Spacing**: Component headers use `py-2.5 px-4`, content uses `p-4`
- **Existing Hook**: `useModeHistorySwitch` — controls brute-force/optimal mode toggling
  (import from `../../../hooks/useModeHistorySwitch`)
- **Existing Component**: `VisualizerPointer` — DOM-positioned arrow pointer above array elements
  (used internally by `ArrayBar`)
- **Visualizer Count**: ~144 JSX files across 24 algorithm categories

### 1.1 · Color Palette for Visualizer States

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default/Unsorted | `bg-secondary` | (inherits) | `text-secondary-foreground` |
| Active/Comparing | `bg-primary/15` | `border-primary/50` | `text-primary` |
| Sorted/Success | `bg-emerald-500/15` | `border-emerald-500/40` | `text-emerald-400` |
| Highlighted | `bg-primary/10` | `border-primary/30` | `text-foreground` |
| Visited | `bg-sky-500/15` | `border-sky-500/40` | `text-sky-400` |
| Error/Danger | `bg-red-500/15` | `border-red-500/40` | `text-red-400` |
| Inactive | `bg-muted/30` | `border-transparent` | `text-muted-foreground` |

> **Key principle**: Use transparent tinted backgrounds (`/15`) and semi-transparent
> borders (`/40`) instead of solid fills. This keeps the dark theme cohesive and
> avoids garish color blocks. Never use `text-white` for state colors.

All reusable components live at:
```
src/components/visualizer/
├── index.js              ← barrel export (import from here)
├── VisualizerShell.jsx
├── ControlPanel.jsx
├── CodeBlock.jsx
├── ExplanationBox.jsx
├── ComplexityCard.jsx
├── StatsGrid.jsx
├── ArrayBar.jsx
├── GridBoard.jsx
├── TreeCanvas.jsx
├── GraphCanvas.jsx
├── LinkedListChain.jsx
├── StackColumn.jsx
├── QueueRow.jsx
├── DPTable.jsx
├── HashMapView.jsx
├── SlidingWindowOverlay.jsx
├── ModeToggle.jsx
├── LangTabs.jsx
├── ColorLegend.jsx
├── InputBar.jsx
├── StatusBanner.jsx
├── CallStackView.jsx
└── BinaryView.jsx
```

---

## 2 · Import Pattern

Every refactored visualizer should import ONLY the components it needs:

```jsx
import {
  VisualizerShell,
  ControlPanel,
  ArrayBar,         // ← pick only what you need
  CodeBlock,
  ExplanationBox,
  ComplexityCard,
  StatsGrid,
  ColorLegend,
} from "../../../components/visualizer";
```

Adjust the relative path depth based on the file's location.  
Most visualizers are at `src/pages/algorithms/<category>/<Name>.jsx` → `"../../../components/visualizer"`.

---

## 3 · Component API Reference

### 3.1 · `VisualizerShell` — Page Wrapper (EVERY visualizer)

Wraps the entire page. Provides max-width container, centered title, subtitle, optional LeetCode badge.

```jsx
<VisualizerShell
  title="Bubble Sort Visualizer"
  subtitle="Visualizing the classic comparison sorting algorithm"
  icon={<List />}           // any Lucide icon
  leetcode="#912"            // optional — shows "LeetCode #912" badge
>
  {/* all content goes here */}
</VisualizerShell>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Page heading |
| `subtitle` | string | ✅ | Sub-heading |
| `icon` | ReactNode | ✅ | Lucide icon element |
| `leetcode` | string | ❌ | LeetCode problem reference |
| `children` | ReactNode | ✅ | Page content |

---

### 3.2 · `ControlPanel` — Play/Pause/Step/Reset Bar (EVERY visualizer)

Unified control bar with two modes: unloaded (shows Load button) and loaded (step controls + speed + counter + reset).

```jsx
<ControlPanel
  isLoaded={isLoaded}
  onLoad={loadData}
  onStepForward={stepForward}
  onStepBackward={stepBackward}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  onReset={reset}
  isPlaying={isPlaying}
  currentStep={currentStep}
  totalSteps={history.length}
  speed={speed}
  onSpeedChange={setSpeed}
  // Optional slots:
  inputSlot={<input ... />}        // rendered before buttons (array input, etc.)
  extraControls={<button>Random</button>}  // rendered after Load or in loaded mode
  useSlider={false}                 // true = range slider, false = dropdown
  speedOptions={[                   // customize speed presets
    { label: "Slow", value: 1500 },
    { label: "Medium", value: 1000 },
    { label: "Fast", value: 500 },
    { label: "Very Fast", value: 250 },
  ]}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isLoaded` | boolean | ✅ | Controls which mode to show |
| `onLoad` | function | ✅ | "Load & Visualize" click handler |
| `onStepForward` | function | ✅ | Step forward handler |
| `onStepBackward` | function | ✅ | Step backward handler |
| `onPlay` | function | ✅ | Start auto-play |
| `onPause` | function | ✅ | Pause auto-play |
| `onReset` | function | ✅ | Reset handler |
| `isPlaying` | boolean | ✅ | Current play state |
| `currentStep` | number | ✅ | Current step index |
| `totalSteps` | number | ✅ | `history.length` |
| `speed` | number | ✅ | Current speed (ms delay) |
| `onSpeedChange` | function | ❌ | Speed change handler |
| `inputSlot` | ReactNode | ❌ | Input fields before buttons |
| `extraControls` | ReactNode | ❌ | Extra buttons/toggles |
| `useSlider` | boolean | ❌ | Range slider vs dropdown |
| `speedOptions` | array | ❌ | `[{label, value}]` |

---

### 3.3 · `CodeBlock` — Pseudocode Panel

Supports TWO code formats:

**Format A — Token-based** (BubbleSort, NQueens, Stack, etc.):
```js
const CODE = [
  { l: 1, c: [{ t: "function sort(arr) {", c: "" }] },
  { l: 2, c: [{ t: "  for", c: "purple" }, { t: " (let i ...) {", c: "" }] },
];
// Token colors: "purple" | "cyan" | "yellow" | "orange" | "light-gray" | ""
```

**Format B — Plain string** (Sudoku, LCS, SlidingWindow, etc.):
```js
const CODE = [
  { line: 1, content: "function sort(arr) {" },
  { line: 2, content: "  for (let i = 0; ...) {" },
];
```

```jsx
<CodeBlock
  title="Pseudocode"
  lines={CODE}
  activeLine={state.line}    // which line number to highlight
  maxHeight="24rem"           // optional scroll height
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ❌ | Heading (default "Pseudocode") |
| `lines` | array | ✅ | Code line objects (Format A or B) |
| `activeLine` | number | ✅ | Currently highlighted line |
| `maxHeight` | string | ❌ | CSS max-height |
| `children` | ReactNode | ❌ | Override default renderer |

---

### 3.4 · `ExplanationBox` — Step Explanation

Two modes: simple (single line) and scrollable history.

**Simple mode** (BubbleSort, most sorting):
```jsx
<ExplanationBox
  explanation={state.explanation}
  finished={state.finished}
/>
```

**History mode** (BFS, DFS, graph traversals):
```jsx
<ExplanationBox
  history={history}
  currentStep={currentStep}
  title="Traversal Log"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `explanation` | string | ❌ | Current step text (simple mode) |
| `finished` | boolean | ❌ | Shows ✓ checkmark |
| `history` | array | ❌ | Full history array (history mode) |
| `currentStep` | number | ❌ | For highlighting in history mode |
| `title` | string | ❌ | Heading |

---

### 3.5 · `ComplexityCard` — Time/Space Complexity

Full-width card for algorithm complexity analysis.

```jsx
<ComplexityCard
  time={[
    { label: "Worst Case", value: "O(N²)", description: "When array is reversed..." },
    { label: "Best Case", value: "O(N)", description: "Already sorted..." },
  ]}
  space={[
    { value: "O(1)", description: "In-place algorithm..." },
  ]}
  insights={[
    "Bubble sort is stable.",
    "Early termination gives O(N) best case.",
  ]}
  fullWidth={true}   // adds lg:col-span-3 for grid layouts
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `time` | array | ✅ | `[{label, value, description}]` |
| `space` | array | ✅ | `[{value, description}]` |
| `insights` | string[] | ❌ | Bullet points |
| `fullWidth` | boolean | ❌ | Spans full grid row (default true) |

---

### 3.6 · `StatsGrid` — Metric Stat Boxes

Small colored stat boxes for counters (comparisons, swaps, visited nodes, etc.).

```jsx
<StatsGrid
  stats={[
    { icon: <GitCompareArrows size={16} />, label: "Comparisons", value: state.comparisons, color: "teal" },
    { icon: <Repeat size={16} />,           label: "Swaps",       value: state.swaps,       color: "purple" },
  ]}
/>
```

Available colors: `"teal"` | `"purple"` | `"blue"` | `"emerald"` | `"amber"` | `"red"` | `"orange"` | `"rose"` | `"indigo"`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `stats` | array | ✅ | `[{icon, label, value, color}]` |

---

### 3.7 · `ArrayBar` — Horizontal Array Boxes + Pointers

For sorting, arrays, binary search, sliding window string chars, etc.

```jsx
<ArrayBar
  items={array}                   // [{id, value}] or plain numbers
  containerId="array-container"   // unique DOM id
  title="Array Visualization"
  getStyle={(item, index) => {    // return className string
    if (state.sorted.includes(index)) return "bg-emerald-600 border-emerald-500 text-white";
    if (index === state.j)             return "bg-amber-500 border-amber-400 text-white";
    return "bg-muted border-border text-foreground";
  }}
  pointers={[
    { index: state.j,   color: "amber", label: "j" },
    { index: state.j+1, color: "amber", label: "j+1" },
  ]}
  cellSize={4}     // rem (default 4)
  showIndex={false}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | array | ✅ | Array data |
| `containerId` | string | ✅ | Unique DOM id |
| `title` | string | ❌ | Section heading |
| `getStyle` | function | ❌ | `(item, index) => className` |
| `pointers` | array | ❌ | `[{index, color, label}]` |
| `cellSize` | number | ❌ | Box size in rem |
| `showIndex` | boolean | ❌ | Show index numbers |

---

### 3.8 · `GridBoard` — 2D Grid (Pathfinding, Sudoku, N-Queens, Flood Fill)

```jsx
<GridBoard
  rows={grid.length}
  cols={grid[0].length}
  getCellContent={(r, c) => grid[r][c] === 1 ? "Q" : ""}
  getCellClass={(r, c) => {
    if (grid[r][c] === 2) return "bg-emerald-500 text-white";
    if (grid[r][c] === 1) return "bg-blue-500 text-white";
    return "bg-muted";
  }}
  onCellClick={(r, c) => toggleWall(r, c)}       // optional
  onMouseDown={(r, c) => startDrag(r, c)}         // optional
  onMouseEnter={(r, c) => continueDrag(r, c)}     // optional
  cellSize={40}                                    // px (default 40)
  legend={<ColorLegend items={...} />}             // optional slot
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `rows` | number | ✅ | Grid row count |
| `cols` | number | ✅ | Grid column count |
| `getCellContent` | function | ✅ | `(r, c) => ReactNode` |
| `getCellClass` | function | ✅ | `(r, c) => className` |
| `onCellClick` | function | ❌ | Click handler |
| `onMouseDown` | function | ❌ | Drag start |
| `onMouseEnter` | function | ❌ | Drag continue |
| `cellSize` | number | ❌ | Cell size in px |
| `legend` | ReactNode | ❌ | Legend slot below grid |

---

### 3.9 · `TreeCanvas` — SVG Binary Tree

```jsx
<TreeCanvas
  root={treeRoot}          // { val, left?, right?, highlight? }
  width={800}
  height={400}
  nodeRadius={20}
  renderNode={(node, x, y) => (
    <g key={node.val}>
      <circle cx={x} cy={y} r={20}
        className={node.highlight ? "fill-green-500" : "fill-blue-500"} />
      <text x={x} y={y} textAnchor="middle" dy="5" className="fill-white text-sm">
        {node.val}
      </text>
    </g>
  )}
  getEdgeColor={(parent, child) =>
    child.highlight ? "stroke-emerald-400" : "stroke-muted-foreground"
  }
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `root` | object | ✅ | Tree root `{val, left?, right?}` |
| `renderNode` | function | ❌ | `(node, x, y) => SVG element` |
| `getEdgeColor` | function | ❌ | `(parent, child) => className` |
| `width` | number | ❌ | SVG width |
| `height` | number | ❌ | SVG height |
| `nodeRadius` | number | ❌ | Default 20 |

---

### 3.10 · `GraphCanvas` — SVG+DOM Graph (BFS, DFS, Dijkstra)

```jsx
<GraphCanvas
  nodes={["A", "B", "C"]}
  edges={[
    { from: "A", to: "B", weight: 3 },
    { from: "B", to: "C" },
  ]}
  positions={new Map([["A", {x:100,y:100}], ["B", {x:200,y:100}]])}
  getNodeClass={(nodeId) =>
    visited.has(nodeId) ? "bg-emerald-500 text-white" : "bg-muted"
  }
  getEdgeStyle={(edge) => ({
    className: edge.active ? "stroke-emerald-400" : "stroke-muted-foreground",
    strokeWidth: edge.active ? 3 : 1,
  })}
  directed={true}
  width={600}
  height={400}
  legend={<ColorLegend items={...} />}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `nodes` | array | ✅ | Node identifiers |
| `edges` | array | ✅ | `[{from, to, weight?}]` |
| `positions` | Map | ✅ | `Map<nodeId, {x,y}>` |
| `getNodeClass` | function | ❌ | `(nodeId) => className` |
| `getEdgeStyle` | function | ❌ | `(edge) => {className, strokeWidth}` |
| `directed` | boolean | ❌ | Show arrowheads |
| `width/height` | number | ❌ | Canvas size |
| `legend` | ReactNode | ❌ | Legend slot |

---

### 3.11 · `LinkedListChain` — Horizontal Node Chain

```jsx
<LinkedListChain
  nodes={[
    { value: 1, id: "a", highlight: false },
    { value: 2, id: "b", highlight: true },
  ]}
  getNodeClass={(node) => node.highlight ? "bg-emerald-500" : "bg-muted"}}
  externalPointers={[
    { targetId: "a", label: "head" },
    { targetId: "b", label: "curr" },
  ]}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `nodes` | array | ✅ | `[{value, id, ...}]` |
| `getNodeClass` | function | ❌ | `(node) => className` |
| `externalPointers` | array | ❌ | `[{targetId, label}]` |

---

### 3.12 · `StackColumn` — Vertical LIFO Stack

```jsx
<StackColumn
  items={[3, 7, 1]}           // top of stack = index 0
  getItemClass={(item, index) =>
    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
  }
  maxVisible={8}
  title="Stack"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | array | ✅ | Stack contents (top first) |
| `getItemClass` | function | ❌ | `(item, index) => className` |
| `maxVisible` | number | ❌ | Scroll threshold |
| `title` | string | ❌ | Panel heading |

---

### 3.13 · `QueueRow` — Horizontal FIFO Queue

```jsx
<QueueRow
  items={["A", "B", "C"]}
  getItemClass={(item, index) =>
    index === 0 ? "bg-primary text-primary-foreground scale-110" : "bg-muted"
  }
  showLabels={true}
  title="BFS Queue"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | array | ✅ | Queue contents (front first) |
| `getItemClass` | function | ❌ | `(item, index) => className` |
| `showLabels` | boolean | ❌ | Show "Front"/"Back" labels |
| `title` | string | ❌ | Panel heading |

---

### 3.14 · `DPTable` — 2D DP Table

```jsx
<DPTable
  table={dp}                     // 2D array of values
  rowHeaders={["", "a", "b"]}    // optional
  colHeaders={["", "x", "y"]}    // optional
  getCellClass={(r, c) =>
    r === activeR && c === activeC ? "bg-primary text-primary-foreground" : ""
  }
  title="DP Table"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `table` | 2D array | ✅ | The DP values |
| `rowHeaders` | array | ❌ | Row labels |
| `colHeaders` | array | ❌ | Column labels |
| `getCellClass` | function | ❌ | `(r, c) => className` |
| `title` | string | ❌ | Panel heading |

---

### 3.15 · `HashMapView` — Key→Value Map Display

```jsx
<HashMapView
  map={new Map([[2, 0], [7, 1]])}   // or plain object {2: 0, 7: 1}
  getEntryClass={(key, value) =>
    key === activeKey ? "ring-2 ring-primary" : ""
  }
  title="Hash Map"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `map` | Map or object | ✅ | Key-value data |
| `getEntryClass` | function | ❌ | `(key, value) => className` |
| `title` | string | ❌ | Panel heading |

---

### 3.16 · `SlidingWindowOverlay` — Animated Bounding Box

Measures DOM positions and renders an absolutely-positioned highlight rectangle.

```jsx
{/* Parent container must have position: relative and the id */}
<div id="string-container" className="relative flex ...">
  {chars.map((ch, i) => (
    <span key={i} id={`string-container-element-${i}`}>{ch}</span>
  ))}
  <SlidingWindowOverlay
    containerId="string-container"
    startIndex={windowStart}
    endIndex={windowEnd}
    color="blue"     // "blue" | "red" | "green" | "purple"
  />
</div>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `containerId` | string | ✅ | Parent container DOM id |
| `startIndex` | number | ✅ | Window start index |
| `endIndex` | number | ✅ | Window end index |
| `color` | string | ❌ | Overlay color theme |
| `elementPrefix` | string | ❌ | DOM id prefix override |

---

### 3.17 · `ModeToggle` — Brute Force / Optimal Switcher

```jsx
<ModeToggle
  mode={mode}                    // "brute" | "optimal"
  onModeChange={setMode}
  bruteLabel="Brute Force"       // optional custom labels
  optimalLabel="Optimal"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | string | ✅ | Current mode |
| `onModeChange` | function | ✅ | Mode change handler |
| `bruteLabel` | string | ❌ | Custom label |
| `optimalLabel` | string | ❌ | Custom label |

---

### 3.18 · `LangTabs` — Multi-Language Code Tabs

```jsx
<LangTabs
  langs={[
    { lang: "cpp",    label: "C++",    code: "..." },
    { lang: "python", label: "Python", code: "..." },
    { lang: "java",   label: "Java",   code: "..." },
  ]}
  activeLang={lang}          // optional controlled mode
  onLangChange={setLang}     // optional
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `langs` | array | ✅ | `[{lang, label?, code}]` |
| `activeLang` | string | ❌ | Controlled active tab |
| `onLangChange` | function | ❌ | Tab change handler |
| `renderCode` | function | ❌ | Custom code renderer |

---

### 3.19 · `ColorLegend` — Colored Dot + Label Strip

```jsx
<ColorLegend
  items={[
    { color: "bg-emerald-500", label: "Sorted" },
    { color: "bg-amber-500", label: "Comparing" },
    { color: "#3b82f6", label: "Custom CSS color" },
  ]}
  layout="row"   // "row" | "wrap"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | array | ✅ | `[{color, label}]` — color is Tailwind bg class OR CSS hex |
| `layout` | string | ❌ | `"row"` or `"wrap"` |

---

### 3.20 · `InputBar` — Labeled Input Field

```jsx
<InputBar
  label="Array Size"
  type="number"
  value={size}
  onChange={(e) => setSize(e.target.value)}
  min={2}
  max={50}
  action={{ label: "Generate", onClick: generate, icon: <RefreshCw size={14} /> }}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | ✅ | Input label |
| `type` | string | ❌ | `"text"` / `"number"` / `"select"` |
| `value` | any | ✅ | Controlled value |
| `onChange` | function | ✅ | Change handler |
| `options` | array | ❌ | For select: `[{label, value}]` |
| `min/max` | number | ❌ | For number input |
| `action` | object | ❌ | `{label, onClick, icon?}` button |
| `disabled` | boolean | ❌ | Disabled state |

---

### 3.21 · `StatusBanner` — Success/Error/Loading Banner

```jsx
<StatusBanner
  variant="success"      // "success" | "error" | "warning" | "loading" | "info"
  message="Solution found!"
  dismissible={true}
  onDismiss={() => setBanner(null)}
>
  <span>Found in 3 steps</span>   {/* optional extra content */}
</StatusBanner>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `variant` | string | ✅ | Banner type |
| `message` | string | ✅ | Main message |
| `children` | ReactNode | ❌ | Extra details |
| `dismissible` | boolean | ❌ | Show X button |
| `onDismiss` | function | ❌ | Dismiss handler |

---

### 3.22 · `CallStackView` — Recursion Call Stack

```jsx
<CallStackView
  frames={[
    "merge(0, 7)",                          // string frames
    { label: "merge(0, 3)", value: "done" },  // object frames with optional value
  ]}
  activeIndex={0}          // index of the currently executing frame
  title="Call Stack"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `frames` | array | ✅ | `string[]` or `[{label, value?}]` — index 0 = bottom of stack |
| `activeIndex` | number | ❌ | Index of active frame (highlights with primary tint) |
| `title` | string | ❌ | Panel heading |

---

### 3.23 · `BinaryView` — Bit-Level Binary Display

```jsx
<BinaryView
  value={13}
  bits={8}
  highlightBits={[3, 2, 0]}   // bit indices (0 = LSB) to highlight with primary
  showDecimal={true}
  label="Number 13"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | number | ✅ | Integer to display |
| `bits` | number | ❌ | Bit width (default 8) |
| `highlightBits` | number[] | ❌ | Bit indices (0 = LSB) to highlight |
| `showDecimal` | boolean | ❌ | Show decimal label |
| `label` | string | ❌ | Optional heading with Binary icon |

---

## 4 · Category → Component Mapping

Use this table to know which components each category typically needs:

| Category | Shell | Control | Code | Explain | Complex | Stats | Data-Specific Components |
|----------|:-----:|:-------:|:----:|:-------:|:-------:|:-----:|--------------------------|
| **Sorting** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `ArrayBar`, `ColorLegend` |
| **Arrays** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `ArrayBar`, `HashMapView` |
| **Trees** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `TreeCanvas`, `CallStackView` |
| **Graphs** | ✅ | ✅ | ✅ | ✅ (history) | ✅ | ✅ | `GraphCanvas`, `QueueRow`, `ColorLegend` |
| **LinkedList** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `LinkedListChain`, `ModeToggle` |
| **Stack** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `StackColumn` |
| **Queue** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `QueueRow` |
| **Pathfinding** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `GridBoard`, `ColorLegend`, `StatusBanner` |
| **DP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `DPTable`, `LangTabs` |
| **SlidingWindow** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `ArrayBar`, `SlidingWindowOverlay`, `ModeToggle` |
| **BitManipulation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `BinaryView` |
| **Recursion** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `GridBoard` or `TreeCanvas`, `CallStackView` |
| **Backtracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `GridBoard`, `StatusBanner`, `CallStackView` |
| **Design** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `LinkedListChain`, `HashMapView` |
| **Heaps** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `TreeCanvas`, `ArrayBar`, `ModeToggle` |

---

## 5 · Standard Page Layout Pattern

Every refactored visualizer should follow this grid:

```
┌─────────────────────────────────────────────┐
│               VisualizerShell               │
│  ┌─────────────────────────────────────┐    │
│  │           ControlPanel              │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────────┬──────────────────────────┐    │
│  │ CodeBlock│  Data Canvas (ArrayBar,  │    │
│  │ (1 col)  │  TreeCanvas, GridBoard,  │    │
│  │          │  etc.)       (2 cols)    │    │
│  │          ├──────────────────────────┤    │
│  │          │  StatsGrid               │    │
│  │          ├──────────────────────────┤    │
│  │          │  ExplanationBox          │    │
│  └──────────┴──────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ComplexityCard (full-width, 3cols) │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

In JSX:

```jsx
<VisualizerShell title="..." subtitle="..." icon={<Icon />}>
  <ControlPanel ... />

  {isLoaded ? (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <CodeBlock ... />

      {/* Right 2 columns */}
      <div className="lg:col-span-2 space-y-6">
        <ArrayBar ... />           {/* or TreeCanvas, GridBoard, etc. */}
        <ColorLegend items={...} />
        <StatsGrid stats={[...]} />
        <ExplanationBox ... />
      </div>

      {/* Full-width bottom */}
      <ComplexityCard ... />
    </div>
  ) : (
    <p className="text-center text-muted-foreground py-10">
      Load data to begin visualization.
    </p>
  )}
</VisualizerShell>
```

---

## 6 · Refactoring Checklist

When migrating a visualizer file, follow these steps:

1. **Read** the original file completely
2. **Identify** which data-specific components it needs (use Category table above)
3. **Keep** the algorithm logic (history generation) **unchanged** — just extract it to a standalone function or `useCallback` at the top
4. **Keep** pseudocode data as a constant outside the component
5. **Keep** complexity text as constants outside the component
6. **Replace** the inline `<header>` with `<VisualizerShell>`
7. **Replace** all control buttons/speed/counter with `<ControlPanel>`
8. **Replace** the inline pseudocode rendering with `<CodeBlock>`
9. **Replace** the inline array/tree/grid rendering with the appropriate data canvas component
10. **Replace** inline stat boxes with `<StatsGrid>`
11. **Replace** explanation text with `<ExplanationBox>`
12. **Replace** complexity section with `<ComplexityCard>`
13. **Add** `<ColorLegend>` if the visualizer uses color-coded elements
14. **Move** the `getStyle` / `getBoxStyle` callback into the component (this is where per-visualizer custom coloring lives)
15. **Verify** the file parses correctly

### DO NOT change:
- Algorithm logic / history generation
- State variable names
- Keyboard/mouse event handling patterns
- The `useModeHistorySwitch` hook usage (just keep it)
- Any feature-specific logic (drag-and-drop, custom input parsing, etc.)

### DO change:
- All JSX layout structure → use shared components
- All inline CSS/Tailwind for common elements → handled by shared components
- All hand-rolled control buttons → `ControlPanel`
- All hand-rolled code display → `CodeBlock`
- All hand-rolled stat boxes → `StatsGrid`

---

## 7 · Golden Standard Reference

See `src/pages/algorithms/Sorting/BubbleSort.jsx` for the complete
golden-standard refactored visualizer.

Key patterns demonstrated:
- Algorithm logic extracted to standalone function
- Pseudocode and complexity as module-level constants
- Clean `getBoxStyle` callback using **subtle tinted backgrounds**:
  - `"bg-emerald-500/15 border-emerald-500/40 text-emerald-400"` for sorted
  - `"bg-primary/15 border-primary/50 text-primary"` for comparing
  - `"bg-secondary text-secondary-foreground"` for default
- `inputSlot` using shadcn-styled input with `text-[11px]` labels and `gap-2`
- `pointers` array for VisualizerPointer integration
- Standard `grid grid-cols-1 lg:grid-cols-3 gap-6` layout
- No shadows anywhere — borders only
- `text-muted-foreground` for placeholder/empty state text
- **Monochrome stats**: StatsGrid uses no colored borders, all values are `text-foreground`
- **No uppercase labels**: ExplanationBox, ComplexityCard use sentence-case
- **Compact controls**: ControlPanel uses neutral `text-foreground` buttons, no green/amber

---

## 8 · AI Prompt Template

Copy-paste this when giving a visualizer to an AI for migration:

```
I need you to refactor the following React visualizer component to use our shared
design-system components. Follow the MIGRATION_GUIDE.md (attached) exactly.

RULES:
1. Import only the components you need from "../../../components/visualizer"
2. DO NOT change the algorithm logic or history generation
3. Extract pseudocode and complexity data as module-level constants
4. Use the standard grid layout from Section 5
5. Create a getStyle callback for per-element conditional coloring
6. Keep all existing features (keyboard control, click-outside, etc.)
7. Output the COMPLETE refactored file — no placeholders, no "..."

SHADCN STYLING RULES:
- NEVER use shadows (no shadow-*, no drop-shadow). Use borders only.
- Use shadcn CSS variables: bg-card, bg-muted, bg-background, text-foreground,
  text-muted-foreground, border-border, bg-input, ring-ring, bg-primary, text-primary
- Cards: "rounded-lg border bg-card" (never shadow)
- MONOCHROME-FIRST: Use primary as the ONLY accent. No rainbow stat cards.
- State colors use SUBTLE TINTS (bg-primary/15, bg-emerald-500/15), NEVER solid fills.
- Default cells: "bg-secondary text-secondary-foreground" (not bg-muted)
- Comparing/active cells: "bg-primary/15 border-primary/50 text-primary"
- Sorted/success cells: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
- NEVER use text-white for state colors — use the color's own text token
- NEVER use uppercase labels (no "uppercase tracking-wider")
- Component headers: text-[13px] font-medium, icons h-3.5 w-3.5
- Section labels: text-[11px] font-medium text-muted-foreground
- Use cn() from "../../lib/utils" for conditional class merging
- Font: font-mono for data, text-[13px] for body, text-[11px] for labels

Here is the file to refactor:

<paste file contents here>
```

---

*Generated for AlgoVisualizer migration — 22 reusable components, 144 target files.*
