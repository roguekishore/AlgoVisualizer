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
 * Utility function to extract problem names for a given topic
 * @param {string} topicKey - The topic key (e.g., "Arrays", "Sorting")
 * @returns {string[]} Array of problem labels from that topic (max 4)
 */
function getProblemsForTopic(topicKey) {
  return problems
    .filter((problem) => problem.topic === topicKey)
    .slice(0, 4)
    .map((problem) => problem.label);
}

/**
 * Topics Data â€” Algorithm browsing groups for /visualizers
 * 
 * Each topic contains:
 * - name: Display name
 * - icon: Lucide icon component
 * - description: Brief description of the topic
 * - page: Route identifier / key for navigation
 * - spotlightColor: Color for the CardSpotlight effect (hex or rgb)
 * - subtitle: Short subtitle for CardFlip
 * - problems: Array of problem labels in this topic (from catalog)
 */
export const topics = [
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
    problems: getProblemsForTopic("Sorting"),
  },
  {
    name: "Arrays",
    icon: Brackets,
    description: "Contiguous data, two-pointers, and traversals.",
    page: "Arrays",
    spotlightColor: "#3b82f6",
    subtitle: "Explore array techniques",
    problems: getProblemsForTopic("Arrays"),
  },
  {
    name: "BinarySearch",
    icon: SearchCode,
    description: "Logarithmic time search in sorted data.",
    page: "BinarySearch",
    spotlightColor: "#14b8a6",
    subtitle: "Efficient searching",
    problems: getProblemsForTopic("BinarySearch"),
  },
  {
    name: "Strings",
    icon: Type,
    description:
      "Text manipulation, pattern matching, and character operations.",
    page: "Strings",
    spotlightColor: "#a855f7",
    subtitle: "String manipulation mastery",
    problems: getProblemsForTopic("Strings"),
  },
  {
    name: "Searching",
    icon: Search,
    description: "Find elements using efficient search logic.",
    page: "Searching",
    spotlightColor: "#10b981",
    subtitle: "Search algorithm techniques",
    problems: getProblemsForTopic("Searching"),
  },
  {
    name: "Hashing",
    icon: Hash,
    description: "Key-value pairs, hash maps, and collision resolution.",
    page: "Hashing",
    spotlightColor: "#ef4444",
    subtitle: "Hash-based data structures",
    problems: getProblemsForTopic("Hashing"),
  },
  {
    name: "Linked List",
    icon: GitBranch,
    description: "Nodes, pointers, cycle detection, and list manipulation.",
    page: "LinkedList",
    spotlightColor: "#6366f1",
    subtitle: "Linked list structures",
    problems: getProblemsForTopic("LinkedList"),
  },
  {
    name: "Recursion",
    icon: Repeat,
    description: "Solve problems by breaking them into smaller instances.",
    page: "Recursion",
    spotlightColor: "#8b5cf6",
    subtitle: "Recursive problem solving",
    problems: getProblemsForTopic("Recursion"),
  },
  {
    name: "Bit Manipulation",
    icon: Binary,
    description:
      "Work with data at the binary level for ultimate efficiency.",
    page: "BitManipulation",
    spotlightColor: "#64748b",
    subtitle: "Binary operations",
    problems: getProblemsForTopic("BitManipulation"),
  },
  {
    name: "Stack",
    icon: Layers,
    description:
      "LIFO-based problems, expression evaluation, and histograms.",
    page: "Stack",
    spotlightColor: "#7c3aed",
    subtitle: "Stack data structures",
    problems: getProblemsForTopic("Stack"),
  },
  {
    name: "Queue",
    icon: ArrowRightLeft,
    description: "FIFO principle, breadth-first search, and schedulers.",
    page: "Queue",
    spotlightColor: "#ec4899",
    subtitle: "Queue operations",
    problems: getProblemsForTopic("Queue"),
  },
  {
    name: "Sliding Window",
    icon: RectangleHorizontal,
    description: "Efficiently process subarrays, substrings, and ranges.",
    page: "SlidingWindows",
    spotlightColor: "#0d9488",
    subtitle: "Window-based techniques",
    problems: getProblemsForTopic("SlidingWindows"),
  },
  {
    name: "Heaps",
    icon: Filter,
    description:
      "Priority queues and finding min/max elements efficiently.",
    page: "Heaps",
    spotlightColor: "#ea580c",
    subtitle: "Priority queue mastery",
    problems: getProblemsForTopic("Heaps"),
  },
  {
    name: "Trees",
    icon: Network,
    description:
      "Hierarchical data, traversals (BFS, DFS), and binary trees.",
    page: "Trees",
    spotlightColor: "#22c55e",
    subtitle: "Tree traversals",
    problems: getProblemsForTopic("Trees"),
  },
  {
    name: "Graphs",
    icon: Network,
    description:
      "Networks of nodes, traversal algorithms, and pathfinding.",
    page: "Graphs",
    spotlightColor: "#0ea5e9",
    subtitle: "Graph algorithms",
    problems: getProblemsForTopic("Graphs"),
  },
  {
    name: "Pathfinding",
    icon: Navigation,
    description:
      "Navigate through mazes using BFS, DFS, and advanced pathfinding algorithms.",
    page: "Pathfinding",
    spotlightColor: "#d946ef",
    subtitle: "Navigation techniques",
    problems: getProblemsForTopic("Pathfinding"),
  },
  {
    name: "Greedy Algorithms",
    icon: CheckCircle,
    description:
      "Make locally optimal choices in the hope of finding a global optimum.",
    page: "GreedyAlgorithms",
    spotlightColor: "#f43f5e",
    subtitle: "Greedy optimization",
    problems: getProblemsForTopic("GreedyAlgorithms"),
  },
  {
    name: "Backtracking",
    icon: ArrowLeft,
    description:
      "Exploring all possible solutions by trying and undoing choices efficiently.",
    page: "Backtracking",
    spotlightColor: "#fb923c",
    subtitle: "Backtracking exploration",
    problems: getProblemsForTopic("Backtracking"),
  },
  {
    name: "Dynamic Programming",
    icon: Workflow,
    description: "Optimization by solving and caching sub-problems.",
    page: "DynamicProgramming",
    spotlightColor: "#c026d3",
    subtitle: "Memoization mastery",
    problems: getProblemsForTopic("DynamicProgramming"),
  },
  {
    name: "Design",
    icon: Wrench,
    description:
      "Implement complex data structures combining HashMap, Linked List, and advanced design patterns.",
    page: "Design",
    spotlightColor: "#06b6d4",
    subtitle: "System design patterns",
    problems: getProblemsForTopic("Design"),
  },
  {
    name: "Mathematical & Miscellaneous",
    icon: Calculator,
    description:
      "Master the numerical foundations and essential utilities for efficient problem-solving.",
    page: "MathematicalMiscellaneous",
    spotlightColor: "#2dd4bf",
    subtitle: "Mathematical foundations",
    problems: getProblemsForTopic("MathematicalMiscellaneous"),
  },
];

export default topics;
