# 🎯 AlgoVisualizer - Clean Project Structure

## 📁 Directory Structure Overview

```
src/
├── 📄 App.jsx                 # Main application entry (cleaned & simplified)
├── 📄 main.jsx               # React entry point
├── 📄 index.css              # Global styles
│
├── 📂 components/             # UI Components
│   ├── 📂 ui/                # Base UI components
│   ├── 📂 cult-ui/           # Cult UI library components
│   ├── 📂 kokonut-ui/        # Kokonut UI library components
│   ├── 📂 magic-ui/          # Magic UI library components
│   ├── Footer.jsx
│   ├── StarButton.jsx
│   ├── Tooltip.jsx
│   └── VisualizerPointer.jsx
│
├── 📂 pages/                  # Page Components
│   ├── 📂 algorithms/        # ⭐ Algorithm visualizer pages (24 categories)
│   │   ├── Arrays/
│   │   ├── BinarySearch/
│   │   ├── Graphs/
│   │   ├── Trees/
│   │   ├── Stack/
│   │   ├── Queue/
│   │   ├── LinkedList/
│   │   ├── Sorting/
│   │   ├── Searching/
│   │   ├── Heaps/
│   │   ├── Strings/
│   │   ├── Hashing/
│   │   ├── DynamicProgramming/
│   │   ├── GreedyAlgorithms/
│   │   ├── Backtracking/
│   │   ├── BitManipulation/
│   │   ├── SlidingWindows/
│   │   ├── Recursion/
│   │   ├── Pathfinding/
│   │   ├── MathematicalMiscellaneous/
│   │   ├── Design/
│   │   ├── Trie/
│   │   ├── Deque/
│   │   └── Demo/
│   │
│   ├── 📂 categories/        # Category listing pages
│   │   └── CategoryPage.jsx
│   │
│   ├── 📂 visualizer/        # Visualizer layout pages
│   │   ├── VisualizerPage.jsx
│   │   └── VisualizerLayout.jsx
│   │
│   ├── 📂 special/           # Special feature pages
│   │   ├── WorldMapPage.jsx
│   │   └── Starred/
│   │
│   ├── HomePage.jsx          # Main landing page
│   └── HomePage.css
│
├── 📂 routes/                 # Routing configuration
│   ├── index.jsx             # Route definitions
│   └── config.js             # Route configuration
│
├── 📂 context/                # React Context providers
│   └── ThemeContext.jsx      # Theme management
│
├── 📂 hooks/                  # Custom React hooks
│   └── useModeHistorySwitch.js
│
├── 📂 data/                   # Static data
│   └── categories.js
│
├── 📂 search/                 # Search functionality
│   └── catalog.js
│
├── 📂 utils/                  # Utility functions
│   └── starredManager.js
│
└── 📂 lib/                    # Library utilities
    └── utils.js
```

## 🎨 Component Organization

### Active Components
- ✅ **Footer.jsx** - Site footer
- ✅ **StarButton.jsx** - Star/favorite functionality
- ✅ **Tooltip.jsx** - Tooltip component
- ✅ **VisualizerPointer.jsx** - Visualizer pointer component
- ✅ **UI Libraries** - cult-ui, kokonut-ui, magic-ui

### Removed Components (Unused)
- ❌ ChatbotWidget.jsx
- ❌ AlertBox.jsx
- ❌ InfoButton.jsx
- ❌ InfoModal.jsx
- ❌ ScrollToTop.jsx

## 🧩 Context & State Management

### Active
- ✅ **ThemeContext** - Manages light/dark theme

### Removed (Unused)
- ❌ AlertContext
- ❌ ChatbotContext

## 📍 Quick Navigation Guide

### To add a new algorithm:
1. Navigate to: `src/pages/algorithms/[Category]/`
2. Add your component file
3. Register in `src/routes/index.jsx`

### To modify home page:
- Edit: `src/pages/HomePage.jsx`

### To add new UI component:
- Add to: `src/components/` (or appropriate UI library folder)

### To modify routing:
- Edit: `src/routes/index.jsx` or `src/routes/config.js`

## 🚀 Benefits

✨ **Clear Separation** - Pages organized by type (algorithms, categories, visualizer, special)
✨ **Easy Navigation** - Logical folder structure
✨ **Reduced Clutter** - Removed 10+ unused files
✨ **Better Maintainability** - Professional organization
✨ **Cleaner Code** - Simplified App.jsx with only necessary providers

## 📝 Notes

- All algorithm-related pages are under `algorithms/` folder
- Import paths have been updated throughout the project
- No breaking changes - all existing functionality preserved
- Ready for future enhancements

---
**Last Updated:** January 6, 2026
