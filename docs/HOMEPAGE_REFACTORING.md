# HomePage Refactoring Documentation

## Overview

The HomePage component has been completely refactored to be more modular, maintainable, and use vanilla CSS for styling. This document outlines all the changes made and the new project structure.

## Changes Summary

### 1. Project Structure Changes

```
src/
├── components/
│   ├── home/
│   │   ├── CategoryCard.jsx      # NEW - Modular category card component
│   │   └── CategoryCard.css      # NEW - Vanilla CSS for CategoryCard
│   └── ui/
│       ├── card-spotlight.jsx    # NEW - Aceternity UI CardSpotlight component
│       └── canvas-reveal-effect.jsx  # NEW - WebGL effect for spotlight
├── data/
│   └── categories.js             # NEW - Categories data extracted here
├── lib/
│   └── utils.js                  # NEW - Utility functions (cn helper)
└── pages/
    ├── HomePage.jsx              # REFACTORED - Clean, modular version
    ├── HomePage.module.css       # NEW - Vanilla CSS for HomePage
    ├── HomePage.old.jsx          # BACKUP - Original HomePage
    └── HomePageNew.jsx           # NEW - Source for the refactored version
```

### 2. New Files Created

#### `src/lib/utils.js`
Utility function for merging Tailwind classes (shadcn/ui pattern):
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

#### `src/data/categories.js`
Categories data extracted from HomePage with simplified properties:
- Removed: `gradient`, `borderColor`, `iconBg`, `iconColor`
- Added: `spotlightColor` - Hex color for the CardSpotlight effect

```javascript
export const categories = [
  {
    name: "Starred Topics",
    icon: Star,
    description: "Review your saved problems and topics...",
    page: "Starred",
    spotlightColor: "#f59e0b", // Each category has unique spotlight color
  },
  // ... more categories
];
```

#### `src/components/ui/card-spotlight.jsx`
Aceternity UI CardSpotlight component adapted for this project:
- Interactive spotlight effect on hover
- Uses motion/react for animations
- Integrates CanvasRevealEffect for dot matrix animation

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | Required | Card content |
| radius | number | 350 | Spotlight radius in pixels |
| color | string | "#262626" | Spotlight background color |
| className | string | undefined | Additional CSS classes |

#### `src/components/ui/canvas-reveal-effect.jsx`
WebGL-based animated dot matrix effect (dependency of CardSpotlight)

#### `src/components/home/CategoryCard.jsx`
Modular category card component using CardSpotlight:
- Clean separation of concerns
- All styling via CSS classes
- Props-based configuration

#### `src/components/home/CategoryCard.css`
Vanilla CSS for CategoryCard:
- Uses CSS variables for theming
- Responsive design with media queries
- Animations defined in CSS

#### `src/pages/HomePage.module.css`
Vanilla CSS for HomePage:
- CSS custom properties for easy customization
- No hardcoded sizes (uses relative units)
- Responsive breakpoints
- All animations in pure CSS

### 3. Dependencies

The following dependencies were already installed or added:
- `clsx` - For conditional class composition
- `tailwind-merge` - For deduplicating Tailwind classes
- `motion` (framer-motion) - For spotlight animations
- `@react-three/fiber` - For WebGL canvas
- `three` - For 3D rendering
- `class-variance-authority` - NEW - For shadcn/ui patterns

### 4. Customization Guide

#### Changing Category Spotlight Colors
Edit `src/data/categories.js`:
```javascript
{
  name: "Arrays",
  spotlightColor: "#3b82f6", // Change this hex color
  // ...
}
```

#### Customizing HomePage Colors
Edit CSS variables in `src/pages/HomePage.module.css`:
```css
:root {
  --homepage-header-blur-1: var(--color-accent-primary-light);
  --homepage-header-blur-2: var(--color-purple-light);
  --homepage-gradient-start: var(--color-accent-primary);
  --homepage-gradient-mid: #a78bfa;
  --homepage-gradient-end: var(--color-pink);
}
```

#### Customizing CategoryCard Styles
Edit `src/components/home/CategoryCard.css`:
- All styles use CSS variables from the theme
- Animations can be modified in the `@keyframes` section

### 5. Architecture Flow

```
HomePage.jsx
    ├── AlgorithmCategories (component)
    │   ├── Header Section (logo, title, search)
    │   ├── Feature Badges
    │   └── Categories Grid
    │       └── CategoryCard.jsx (for each category)
    │           └── CardSpotlight (UI component)
    │               └── CanvasRevealEffect (WebGL)
    └── Page Routing (switch/case)
        └── Various Page Components
```

### 6. Benefits of the New Structure

1. **Modularity**: Each component has a single responsibility
2. **Maintainability**: CSS is separate and easier to modify
3. **Customizability**: Colors can be changed via CSS variables
4. **Performance**: CSS animations instead of JS-based ones
5. **Scalability**: Easy to add new categories or modify existing ones
6. **No Hardcoded Values**: Uses CSS variables and relative units

### 7. Backup & Rollback

Original files are preserved:
- `src/pages/HomePage.old.jsx` - Original HomePage
- `src/pages/HomePage.backup.jsx` - Previous backup (if exists)

To rollback:
```powershell
Copy-Item -Path "src/pages/HomePage.old.jsx" -Destination "src/pages/HomePage.jsx" -Force
```

### 8. Note on shadcn/ui Setup

This project uses React (Create React App) with JavaScript, not TypeScript. The shadcn/ui components have been adapted to work with this setup:
- Components use `.jsx` instead of `.tsx`
- No type annotations (JavaScript compatible)
- Import paths adjusted for the project structure

For a full shadcn/ui setup with TypeScript, you would need to:
1. Add TypeScript: `npm install typescript @types/react @types/react-dom`
2. Create `tsconfig.json`
3. Initialize shadcn: `npx shadcn@latest init`
4. Add components: `npx shadcn@latest add [component]`

---

## File Reference

| File | Purpose |
|------|---------|
| [src/pages/HomePage.jsx](src/pages/HomePage.jsx) | Main page component |
| [src/pages/HomePage.module.css](src/pages/HomePage.module.css) | Vanilla CSS styles |
| [src/components/home/CategoryCard.jsx](src/components/home/CategoryCard.jsx) | Category card component |
| [src/components/home/CategoryCard.css](src/components/home/CategoryCard.css) | Category card styles |
| [src/components/ui/card-spotlight.jsx](src/components/ui/card-spotlight.jsx) | Spotlight effect component |
| [src/components/ui/canvas-reveal-effect.jsx](src/components/ui/canvas-reveal-effect.jsx) | WebGL dot matrix effect |
| [src/data/categories.js](src/data/categories.js) | Categories configuration |
| [src/lib/utils.js](src/lib/utils.js) | Utility functions |
