# CardFlip Component Data Flow Documentation

## Overview
This document explains the complete data flow for dynamically populating CardFlip component features (topics) from the centralized problem catalog.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Data Source Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  src/search/catalog.js                                             │
│  ├─ problems[] array                                               │
│  │  └─ Each problem has:                                          │
│  │     • label: "Container With Most Water"                      │
│  │     • category: "Arrays"                                       │
│  │     • subpage: "ContainerWithMostWater"                        │
│  │     • (and other properties)                                   │
│  │                                                                │
│  └─ Contains 129+ problems across 20+ categories                 │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Imported in:
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Category Configuration Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  src/data/categories.js                                            │
│  ├─ getTopicsForCategory(categoryName) function                    │
│  │  └─ Filters problems by category                              │
│  │  └─ Extracts first 5 problem labels (topics)                 │
│  │  └─ Returns array of topic names                             │
│  │                                                                │
│  ├─ categories[] array                                            │
│  │  └─ Each category object now includes:                        │
│  │     • name: "Arrays"                                          │
│  │     • icon: Brackets                                          │
│  │     • description: "Contiguous data..."                       │
│  │     • page: "Arrays"                                          │
│  │     • subtitle: "Explore array techniques"                    │
│  │     • topics: [] ← Populated by getTopicsForCategory()       │
│  │                                                                │
│  └─ Example:                                                     │
│     {                                                             │
│       name: "Arrays",                                             │
│       topics: [                                                   │
│         "Container With Most Water",                             │
│         "3Sum",                                                  │
│         "4Sum",                                                  │
│         "Trapping Rain Water",                                  │
│         "Maximum Subarray"                                       │
│       ]                                                          │
│     }                                                             │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Imported in:
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Page Component Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  src/pages/HomePage.jsx                                            │
│  ├─ CategoryCard Component                                         │
│  │  └─ Receives category object prop                             │
│  │  └─ Extracts Icon from category.icon                         │
│  │  └─ Passes to CardFlip:                                      │
│  │     • title={category.name}                                   │
│  │     • subtitle={category.subtitle}                            │
│  │     • description={category.description}                      │
│  │     • features={category.topics} ← THE KEY PROP             │
│  │     • icon={Icon}                                             │
│  │     • onNavigate={() => onSelect(category.page)}            │
│  │                                                                │
│  └─ Map through all categories and render CategoryCards         │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Props passed to:
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              UI Component Layer                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  src/components/kokonut-ui/card-flip.jsx                          │
│  ├─ Props:                                                         │
│  │  • title: string                                               │
│  │  • subtitle: string                                            │
│  │  • description: string                                         │
│  │  • features: string[] ← Array of topic names                 │
│  │  • icon: React.ComponentType                                  │
│  │  • onNavigate: Function                                       │
│  │                                                                │
│  ├─ Front Side (visible on load):                                │
│  │  └─ Displays icon (category.icon)                            │
│  │  └─ Shows title and subtitle                                 │
│  │                                                                │
│  ├─ Back Side (visible on hover/flip):                           │
│  │  ├─ Title and description                                     │
│  │  ├─ Features List:                                            │
│  │  │  └─ Maps through features array                          │
│  │  │  └─ Renders each topic with:                            │
│  │  │     • ArrowRight icon                                     │
│  │  │     • Topic name (e.g., "Container With Most Water")    │
│  │  │     • Animated reveal on flip                            │
│  │  │                                                            │
│  │  └─ "Start {title}" Button:                                  │
│  │     └─ Calls onNavigate() on click                          │
│  │     └─ Navigates to category page                          │
│  │                                                                │
│  └─ Animations:                                                  │
│     • 3D card flip on hover                                      │
│     • Feature items fade in with staggered delay                │
│     • Icon rotates on hover                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Input: Category Object
```javascript
{
  name: "Arrays",
  icon: Brackets,
  description: "Contiguous data, two-pointers, and traversals.",
  page: "Arrays",
  spotlightColor: "#3b82f6",
  subtitle: "Explore array techniques",
  topics: getTopicsForCategory("Arrays")
}
```

### Processing in getTopicsForCategory()
```javascript
function getTopicsForCategory("Arrays") {
  return problems
    .filter(p => p.category === "Arrays")
    // Filter returns all problem objects where category is "Arrays"
    .slice(0, 5)
    // Take first 5 problems
    .map(p => p.label)
    // Extract only the label (problem name) from each
}
```

### Output: Topics Array
```javascript
[
  "Container With Most Water",
  "3Sum",
  "4Sum",
  "Trapping Rain Water",
  "Maximum Subarray"
]
```

### CardFlip Rendering
```jsx
<CardFlip
  features={[
    "Container With Most Water",
    "3Sum",
    "4Sum",
    "Trapping Rain Water",
    "Maximum Subarray"
  ]}
/>
```

#### Back of Card Display:
```
Features List (animated reveal):
→ Container With Most Water
→ 3Sum
→ 4Sum
→ Trapping Rain Water
→ Maximum Subarray

[Start Arrays →]
```

## Key Components

### 1. **Data Source: src/search/catalog.js**
- Contains `problems[]` array with 129+ algorithm problems
- Each problem has: `label`, `category`, `subpage`, and metadata
- **Single source of truth** for all problems across the site

### 2. **Configuration: src/data/categories.js**
- `getTopicsForCategory(categoryName)` function
  - Dynamically extracts topics from catalog
  - Returns first 5 problem names per category
  - Called during category object initialization
- `categories[]` array enhanced with:
  - `subtitle`: Short description for CardFlip
  - `topics`: Array of problem names for that category

### 3. **Page Component: src/pages/HomePage.jsx**
- `CategoryCard` component
  - Extracts category object properties
  - Passes `category.topics` as `features` prop to CardFlip
  - Passes `category.icon` as `icon` prop to CardFlip
  - Binds navigation to `category.page` for button click

### 4. **UI Component: src/components/kokonut-ui/card-flip.jsx**
- Accepts `features` prop (array of strings)
- Renders features on back of card
- Maps through features and displays each with animation
- OnNavigate handler connected to "Start" button

## Data Propagation Steps

1. **Initialization** (categories.js)
   ```
   getTopicsForCategory("Arrays") 
   → filters problems by category 
   → extracts labels 
   → returns ["Problem1", "Problem2", ...]
   ```

2. **Assignment** (categories.js)
   ```
   category.topics = getTopicsForCategory(category.name)
   ```

3. **Component Props** (HomePage.jsx)
   ```
   <CardFlip features={category.topics} />
   ```

4. **Rendering** (card-flip.jsx)
   ```
   features.map((feature) => (
     <div>{feature}</div>
   ))
   ```

5. **Display** (UI)
   ```
   Back of card shows:
   → Container With Most Water
   → 3Sum
   → 4Sum
   ...
   ```

## Benefits of This Architecture

✅ **Single Source of Truth**: Problems defined once in catalog.js  
✅ **Automatic Updates**: New problems added to catalog automatically appear on cards  
✅ **Maintainable**: Category-problem mapping is dynamic and flexible  
✅ **Scalable**: Works for any number of categories and problems  
✅ **Clean Separation**: Data (catalog) → Configuration (categories) → UI (components)  
✅ **No Duplication**: Topics generated on-demand, not hardcoded  

## Future Enhancements

- Add filtering to show "most popular" problems instead of first 5
- Include difficulty levels in topic display
- Add problem counts per category
- Add dynamic topic selection based on user preferences
- Add "More topics" expandable section for categories with 5+ problems
