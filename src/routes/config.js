/**
 * Routes Configuration
 * Centralized route definitions for all algorithm categories and visualizers
 */

// Import category icons
import {
  ArrowDownUp,
  Brackets,
  SearchCode,
  Type,
  Search,
  Hash,
  GitBranch,
  Repeat,
  Binary,
  Layers,
  ArrowRightLeft,
  RectangleHorizontal,
  Filter,
  Network,
  Navigation,
  CheckCircle,
  ArrowLeft,
  Workflow,
  Wrench,
  Calculator,
} from "lucide-react";

/**
 * Category configuration
 * Maps category keys to their display information
 */
export const categoryConfig = {
  sorting: {
    key: "Sorting",
    title: "Sorting Algorithms",
    eyebrow: "Sorting techniques",
    description: "Arrange data efficiently using algorithms like QuickSort, MergeSort, and BubbleSort.",
    icon: ArrowDownUp,
    path: "/sorting",
  },
  arrays: {
    key: "Arrays",
    title: "Array Algorithms",
    eyebrow: "Array techniques",
    description: "Contiguous data, two-pointers, and traversals for solving array problems.",
    icon: Brackets,
    path: "/arrays",
  },
  binarysearch: {
    key: "BinarySearch",
    title: "Binary Search",
    eyebrow: "Search techniques",
    description: "Logarithmic time search in sorted data using divide and conquer.",
    icon: SearchCode,
    path: "/binary-search",
  },
  strings: {
    key: "Strings",
    title: "String Algorithms",
    eyebrow: "String techniques",
    description: "Text manipulation, pattern matching, and character operations.",
    icon: Type,
    path: "/strings",
  },
  searching: {
    key: "Searching",
    title: "Searching Algorithms",
    eyebrow: "Search techniques",
    description: "Find elements using efficient search logic.",
    icon: Search,
    path: "/searching",
  },
  hashing: {
    key: "Hashing",
    title: "Hashing Algorithms",
    eyebrow: "Hashing techniques",
    description: "Key-value pairs, hash maps, and collision resolution.",
    icon: Hash,
    path: "/hashing",
  },
  linkedlist: {
    key: "LinkedList",
    title: "Linked List",
    eyebrow: "Linked list techniques",
    description: "Nodes, pointers, cycle detection, and list manipulation.",
    icon: GitBranch,
    path: "/linked-list",
  },
  recursion: {
    key: "Recursion",
    title: "Recursion",
    eyebrow: "Recursive techniques",
    description: "Solve problems by breaking them into smaller instances.",
    icon: Repeat,
    path: "/recursion",
  },
  bitmanipulation: {
    key: "BitManipulation",
    title: "Bit Manipulation",
    eyebrow: "Binary operations",
    description: "Work with data at the binary level for ultimate efficiency.",
    icon: Binary,
    path: "/bit-manipulation",
  },
  stack: {
    key: "Stack",
    title: "Stack",
    eyebrow: "Stack techniques",
    description: "LIFO-based problems, expression evaluation, and histograms.",
    icon: Layers,
    path: "/stack",
  },
  queue: {
    key: "Queue",
    title: "Queue",
    eyebrow: "Queue techniques",
    description: "FIFO principle, breadth-first search, and schedulers.",
    icon: ArrowRightLeft,
    path: "/queue",
  },
  slidingwindows: {
    key: "SlidingWindows",
    title: "Sliding Window",
    eyebrow: "Window techniques",
    description: "Efficiently process subarrays, substrings, and ranges.",
    icon: RectangleHorizontal,
    path: "/sliding-window",
  },
  heaps: {
    key: "Heaps",
    title: "Heaps",
    eyebrow: "Heap techniques",
    description: "Priority queues and finding min/max elements efficiently.",
    icon: Filter,
    path: "/heaps",
  },
  trees: {
    key: "Trees",
    title: "Trees",
    eyebrow: "Tree techniques",
    description: "Hierarchical data, traversals (BFS, DFS), and binary trees.",
    icon: Network,
    path: "/trees",
  },
  graphs: {
    key: "Graphs",
    title: "Graph Algorithms",
    eyebrow: "Graph techniques",
    description: "Networks of nodes, traversal algorithms, and pathfinding.",
    icon: Network,
    path: "/graphs",
  },
  pathfinding: {
    key: "Pathfinding",
    title: "Pathfinding",
    eyebrow: "Navigation techniques",
    description: "Navigate through mazes using BFS, DFS, and advanced pathfinding algorithms.",
    icon: Navigation,
    path: "/pathfinding",
  },
  greedy: {
    key: "GreedyAlgorithms",
    title: "Greedy Algorithms",
    eyebrow: "Greedy techniques",
    description: "Make locally optimal choices in the hope of finding a global optimum.",
    icon: CheckCircle,
    path: "/greedy",
  },
  backtracking: {
    key: "Backtracking",
    title: "Backtracking",
    eyebrow: "Backtracking techniques",
    description: "Exploring all possible solutions by trying and undoing choices efficiently.",
    icon: ArrowLeft,
    path: "/backtracking",
  },
  dp: {
    key: "DynamicProgramming",
    title: "Dynamic Programming",
    eyebrow: "DP techniques",
    description: "Optimization by solving and caching sub-problems.",
    icon: Workflow,
    path: "/dynamic-programming",
  },
  design: {
    key: "Design",
    title: "Design",
    eyebrow: "Design patterns",
    description: "Implement complex data structures combining HashMap, Linked List, and advanced design patterns.",
    icon: Wrench,
    path: "/design",
  },
  maths: {
    key: "MathematicalMiscellaneous",
    title: "Mathematical & Miscellaneous",
    eyebrow: "Mathematical foundations",
    description: "Master the numerical foundations and essential utilities for efficient problem-solving.",
    icon: Calculator,
    path: "/maths",
  },
};

/**
 * Get category config by path segment
 */
export function getCategoryByPath(pathSegment) {
  return Object.values(categoryConfig).find(c => c.path === `/${pathSegment}`) || null;
}

/**
 * Get category config by key
 */
export function getCategoryByKey(key) {
  return Object.values(categoryConfig).find(c => c.key === key) || null;
}
