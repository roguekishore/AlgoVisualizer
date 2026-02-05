import {
  Star,
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
import { problems } from "../search/catalog";

/**
 * Utility function to extract unique problem names (topics) for a given category
 * @param {string} categoryName - The category name (e.g., "Arrays", "Sorting")
 * @returns {string[]} Array of problem labels from that category (max 5)
 */
function getTopicsForCategory(categoryName) {
  return problems
    .filter((problem) => problem.category === categoryName)
    .slice(0, 4)
    .map((problem) => problem.label);
}

/**
 * Algorithm Categories Data
 * 
 * Each category contains:
 * - name: Display name
 * - icon: Lucide icon component
 * - description: Brief description of the category
 * - page: Route identifier for navigation
 * - spotlightColor: Color for the CardSpotlight effect (hex or rgb)
 * - subtitle: Short subtitle for CardFlip
 * - topics: Array of problem names/topics in this category (from catalog)
 */
export const categories = [
  // {
  //   name: "Starred Topics",
  //   icon: Star,
  //   description: "Review your saved problems and topics for easy access.",
  //   page: "Starred",
  //   spotlightColor: "#f59e0b",
  //   subtitle: "Explore your saved problems",
  //   topics: [],
  // },
  {
    name: "Sorting",
    icon: ArrowDownUp,
    description:
      "Arrange data efficiently using algorithms like QuickSort, MergeSort, and BubbleSort.",
    page: "Sorting",
    spotlightColor: "#f97316",
    subtitle: "Master sorting algorithms",
    topics: getTopicsForCategory("Sorting"),
  },
  {
    name: "Arrays",
    icon: Brackets,
    description: "Contiguous data, two-pointers, and traversals.",
    page: "Arrays",
    spotlightColor: "#3b82f6",
    subtitle: "Explore array techniques",
    topics: getTopicsForCategory("Arrays"),
  },
  {
    name: "BinarySearch",
    icon: SearchCode,
    description: "Logarithmic time search in sorted data.",
    page: "BinarySearch",
    spotlightColor: "#14b8a6",
    subtitle: "Efficient searching",
    topics: getTopicsForCategory("BinarySearch"),
  },
  {
    name: "Strings",
    icon: Type,
    description:
      "Text manipulation, pattern matching, and character operations.",
    page: "Strings",
    spotlightColor: "#a855f7",
    subtitle: "String manipulation mastery",
    topics: getTopicsForCategory("Strings"),
  },
  {
    name: "Searching",
    icon: Search,
    description: "Find elements using efficient search logic.",
    page: "Searching",
    spotlightColor: "#10b981",
    subtitle: "Search algorithm techniques",
    topics: getTopicsForCategory("Searching"),
  },
  {
    name: "Hashing",
    icon: Hash,
    description: "Key-value pairs, hash maps, and collision resolution.",
    page: "Hashing",
    spotlightColor: "#ef4444",
    subtitle: "Hash-based data structures",
    topics: getTopicsForCategory("Hashing"),
  },
  {
    name: "Linked List",
    icon: GitBranch,
    description: "Nodes, pointers, cycle detection, and list manipulation.",
    page: "LinkedList",
    spotlightColor: "#6366f1",
    subtitle: "Linked list structures",
    topics: getTopicsForCategory("LinkedList"),
  },
  {
    name: "Recursion",
    icon: Repeat,
    description: "Solve problems by breaking them into smaller instances.",
    page: "Recursion",
    spotlightColor: "#8b5cf6",
    subtitle: "Recursive problem solving",
    topics: getTopicsForCategory("Recursion"),
  },
  {
    name: "Bit Manipulation",
    icon: Binary,
    description:
      "Work with data at the binary level for ultimate efficiency.",
    page: "BitManipulation",
    spotlightColor: "#64748b",
    subtitle: "Binary operations",
    topics: getTopicsForCategory("BitManipulation"),
  },
  {
    name: "Stack",
    icon: Layers,
    description:
      "LIFO-based problems, expression evaluation, and histograms.",
    page: "Stack",
    spotlightColor: "#7c3aed",
    subtitle: "Stack data structures",
    topics: getTopicsForCategory("Stack"),
  },
  {
    name: "Queue",
    icon: ArrowRightLeft,
    description: "FIFO principle, breadth-first search, and schedulers.",
    page: "Queue",
    spotlightColor: "#ec4899",
    subtitle: "Queue operations",
    topics: getTopicsForCategory("Queue"),
  },
  {
    name: "Sliding Window",
    icon: RectangleHorizontal,
    description: "Efficiently process subarrays, substrings, and ranges.",
    page: "SlidingWindows",
    spotlightColor: "#0d9488",
    subtitle: "Window-based techniques",
    topics: getTopicsForCategory("SlidingWindows"),
  },
  {
    name: "Heaps",
    icon: Filter,
    description:
      "Priority queues and finding min/max elements efficiently.",
    page: "Heaps",
    spotlightColor: "#ea580c",
    subtitle: "Priority queue mastery",
    topics: getTopicsForCategory("Heaps"),
  },
  {
    name: "Trees",
    icon: Network,
    description:
      "Hierarchical data, traversals (BFS, DFS), and binary trees.",
    page: "Trees",
    spotlightColor: "#22c55e",
    subtitle: "Tree traversals",
    topics: getTopicsForCategory("Trees"),
  },
  {
    name: "Graphs",
    icon: Network,
    description:
      "Networks of nodes, traversal algorithms, and pathfinding.",
    page: "Graphs",
    spotlightColor: "#0ea5e9",
    subtitle: "Graph algorithms",
    topics: getTopicsForCategory("Graphs"),
  },
  {
    name: "Pathfinding",
    icon: Navigation,
    description:
      "Navigate through mazes using BFS, DFS, and advanced pathfinding algorithms.",
    page: "Pathfinding",
    spotlightColor: "#d946ef",
    subtitle: "Navigation techniques",
    topics: getTopicsForCategory("Pathfinding"),
  },
  {
    name: "Greedy Algorithms",
    icon: CheckCircle,
    description:
      "Make locally optimal choices in the hope of finding a global optimum.",
    page: "GreedyAlgorithms",
    spotlightColor: "#f43f5e",
    subtitle: "Greedy optimization",
    topics: getTopicsForCategory("GreedyAlgorithms"),
  },
  {
    name: "Backtracking",
    icon: ArrowLeft,
    description:
      "Exploring all possible solutions by trying and undoing choices efficiently.",
    page: "Backtracking",
    spotlightColor: "#fb923c",
    subtitle: "Backtracking exploration",
    topics: getTopicsForCategory("Backtracking"),
  },
  {
    name: "Dynamic Programming",
    icon: Workflow,
    description: "Optimization by solving and caching sub-problems.",
    page: "DynamicProgramming",
    spotlightColor: "#c026d3",
    subtitle: "Memoization mastery",
    topics: getTopicsForCategory("DynamicProgramming"),
  },
  {
    name: "Design",
    icon: Wrench,
    description:
      "Implement complex data structures combining HashMap, Linked List, and advanced design patterns.",
    page: "Design",
    spotlightColor: "#06b6d4",
    subtitle: "System design patterns",
    topics: getTopicsForCategory("Design"),
  },
  {
    name: "Mathematical & Miscellaneous",
    icon: Calculator,
    description:
      "Master the numerical foundations and essential utilities for efficient problem-solving.",
    page: "MathematicalMiscellaneous",
    spotlightColor: "#2dd4bf",
    subtitle: "Mathematical foundations",
    topics: getTopicsForCategory("MathematicalMiscellaneous"),
  },
];

export default categories;
