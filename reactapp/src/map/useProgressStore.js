import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ============================================
 * DSA SKILL TREE - PROBLEM DATA MODEL
 * ============================================
 * Countries = Individual DSA Problems
 * Topics = Logical groupings (not geography-based)
 * Hybrid progression: Free topic access + Sequential within topics
 * 
 * Routes are mapped to match the actual application routes from routes/config.js
 */

/**
 * ALL PROBLEMS - Derived from routes/index.jsx
 * Each problem: { id, title, route, topic, order }
 * Routes match the actual categoryConfig paths
 */
export const ALL_PROBLEMS = [
  // ARRAYS (20 problems) - path: /arrays
  { id: 'arrays-1', title: 'Find Max Element', route: '/arrays/FindMaxElement', topic: 'arrays', order: 1 },
  { id: 'arrays-2', title: 'Find Min Element', route: '/arrays/FindMinElement', topic: 'arrays', order: 2 },
  { id: 'arrays-3', title: 'Move Zeros', route: '/arrays/MoveZeros', topic: 'arrays', order: 3 },
  { id: 'arrays-4', title: 'Count Zeros', route: '/arrays/CountZeros', topic: 'arrays', order: 4 },
  { id: 'arrays-5', title: 'Array Sum', route: '/arrays/ArraySum', topic: 'arrays', order: 5 },
  { id: 'arrays-6', title: 'Reverse Array', route: '/arrays/ReverseArray', topic: 'arrays', order: 6 },
  { id: 'arrays-7', title: 'Two Sum', route: '/arrays/TwoSum', topic: 'arrays', order: 7 },
  { id: 'arrays-8', title: '3Sum', route: '/arrays/ThreeSum', topic: 'arrays', order: 8 },
  { id: 'arrays-9', title: '4Sum', route: '/arrays/4-Sum', topic: 'arrays', order: 9 },
  { id: 'arrays-10', title: 'Maximum Subarray', route: '/arrays/MaximumSubarray', topic: 'arrays', order: 10 },
  { id: 'arrays-11', title: 'Rotate Array', route: '/arrays/RotateArray', topic: 'arrays', order: 11 },
  { id: 'arrays-12', title: 'Merge Intervals', route: '/arrays/MergeIntervals', topic: 'arrays', order: 12 },
  { id: 'arrays-13', title: 'Product of Array Except Self', route: '/arrays/ProductOfArrayExceptSelf', topic: 'arrays', order: 13 },
  { id: 'arrays-14', title: 'Trapping Rain Water', route: '/arrays/TrappingRainWater', topic: 'arrays', order: 14 },
  { id: 'arrays-15', title: 'Container With Most Water', route: '/arrays/ContainerWithMostWater', topic: 'arrays', order: 15 },
  { id: 'arrays-16', title: 'Max Consecutive Ones III', route: '/arrays/MaxConsecutiveOnesIII', topic: 'arrays', order: 16 },
  { id: 'arrays-17', title: 'Subarray Ranges', route: '/arrays/SubarrayRanges', topic: 'arrays', order: 17 },
  { id: 'arrays-18', title: 'Split Array Largest Sum', route: '/arrays/SplitArrayLargestSum', topic: 'arrays', order: 18 },
  { id: 'arrays-19', title: 'Squares of Sorted Array', route: '/arrays/SquaresOfSortedArray', topic: 'arrays', order: 19 },
  { id: 'arrays-20', title: 'Maximum Gap', route: '/arrays/MaximumGap', topic: 'arrays', order: 20 },

  // STRINGS (8 problems) - path: /strings
  { id: 'strings-1', title: 'Reverse String', route: '/strings/ReverseString', topic: 'strings', order: 1 },
  { id: 'strings-2', title: 'Palindrome Check', route: '/strings/PalindromeCheck', topic: 'strings', order: 2 },
  { id: 'strings-3', title: 'Count Vowels', route: '/strings/CountVowels', topic: 'strings', order: 3 },
  { id: 'strings-4', title: 'Valid Anagram', route: '/strings/ValidAnagram', topic: 'strings', order: 4 },
  { id: 'strings-5', title: 'String Compression', route: '/strings/StringCompression', topic: 'strings', order: 5 },
  { id: 'strings-6', title: 'Longest Common Prefix', route: '/strings/LongestCP', topic: 'strings', order: 6 },
  { id: 'strings-7', title: 'Is Subsequence', route: '/strings/IsSubSequence', topic: 'strings', order: 7 },
  { id: 'strings-8', title: 'Reverse Words', route: '/strings/ReverseWords', topic: 'strings', order: 8 },

  // LINKED LIST (5 problems) - path: /linked-list
  { id: 'linkedlist-1', title: 'Reverse Linked List', route: '/linked-list/ReverseLinkedList', topic: 'linkedlist', order: 1 },
  { id: 'linkedlist-2', title: 'Linked List Cycle', route: '/linked-list/LinkedListCycle', topic: 'linkedlist', order: 2 },
  { id: 'linkedlist-3', title: 'Merge Two Sorted Lists', route: '/linked-list/MergeTwoSortedLists', topic: 'linkedlist', order: 3 },
  { id: 'linkedlist-4', title: 'Swap Pairs', route: '/linked-list/SwapPairs', topic: 'linkedlist', order: 4 },
  { id: 'linkedlist-5', title: 'Sort List', route: '/linked-list/SortList', topic: 'linkedlist', order: 5 },

  // STACK (6 problems) - path: /stack
  { id: 'stack-1', title: 'Stack Operations', route: '/stack/StackOperation', topic: 'stack', order: 1 },
  { id: 'stack-2', title: 'Next Greater Element', route: '/stack/NextGreaterElement', topic: 'stack', order: 2 },
  { id: 'stack-3', title: 'Largest Rectangle Histogram', route: '/stack/LargestRectangleHistogram', topic: 'stack', order: 3 },
  { id: 'stack-4', title: 'Remove K Digits', route: '/stack/RemoveKDigits', topic: 'stack', order: 4 },
  { id: 'stack-5', title: 'Permutation', route: '/stack/Permutation', topic: 'stack', order: 5 },
  { id: 'stack-6', title: 'Subarray Ranges', route: '/stack/SubarrayRanges', topic: 'stack', order: 6 },

  // QUEUE (3 problems) - path: /queue
  { id: 'queue-1', title: 'Basic Queue', route: '/queue/BasicQueue', topic: 'queue', order: 1 },
  { id: 'queue-2', title: 'Circular Queue', route: '/queue/CircularQueue', topic: 'queue', order: 2 },
  { id: 'queue-3', title: 'Queue Using Stacks', route: '/queue/QueueUsingStacks', topic: 'queue', order: 3 },

  // SORTING (12 problems) - path: /sorting
  { id: 'sorting-1', title: 'Bubble Sort', route: '/sorting/BubbleSort', topic: 'sorting', order: 1 },
  { id: 'sorting-2', title: 'Selection Sort', route: '/sorting/SelectionSort', topic: 'sorting', order: 2 },
  { id: 'sorting-3', title: 'Insertion Sort', route: '/sorting/InsertionSort', topic: 'sorting', order: 3 },
  { id: 'sorting-4', title: 'Merge Sort', route: '/sorting/MergeSort', topic: 'sorting', order: 4 },
  { id: 'sorting-5', title: 'Quick Sort', route: '/sorting/QuickSort', topic: 'sorting', order: 5 },
  { id: 'sorting-6', title: 'Heap Sort', route: '/sorting/HeapSort', topic: 'sorting', order: 6 },
  { id: 'sorting-7', title: 'Counting Sort', route: '/sorting/CountingSort', topic: 'sorting', order: 7 },
  { id: 'sorting-8', title: 'Radix Sort', route: '/sorting/RadixSort', topic: 'sorting', order: 8 },
  { id: 'sorting-9', title: 'Bucket Sort', route: '/sorting/BucketSort', topic: 'sorting', order: 9 },
  { id: 'sorting-10', title: 'Shell Sort', route: '/sorting/ShellSort', topic: 'sorting', order: 10 },
  { id: 'sorting-11', title: 'Comb Sort', route: '/sorting/CombSort', topic: 'sorting', order: 11 },
  { id: 'sorting-12', title: 'Pancake Sort', route: '/sorting/PancakeSort', topic: 'sorting', order: 12 },

  // BINARY SEARCH (9 problems) - path: /binary-search
  { id: 'binarysearch-1', title: 'Binary Search Basic', route: '/binary-search/BinarySearchBasic', topic: 'binarysearch', order: 1 },
  { id: 'binarysearch-2', title: 'Find First and Last Position', route: '/binary-search/FindFirstAndLastPosition', topic: 'binarysearch', order: 2 },
  { id: 'binarysearch-3', title: 'Search in Rotated Array', route: '/binary-search/SearchInRotatedSortedArray', topic: 'binarysearch', order: 3 },
  { id: 'binarysearch-4', title: 'Find Peak Element', route: '/binary-search/FindPeakElement', topic: 'binarysearch', order: 4 },
  { id: 'binarysearch-5', title: 'Find Min in Rotated Array', route: '/binary-search/FindMinimumInRotatedSortedArray', topic: 'binarysearch', order: 5 },
  { id: 'binarysearch-6', title: 'Search 2D Matrix', route: '/binary-search/Search2DMatrix', topic: 'binarysearch', order: 6 },
  { id: 'binarysearch-7', title: 'Peak Index Mountain', route: '/binary-search/PeakIndexInMountainArray', topic: 'binarysearch', order: 7 },
  { id: 'binarysearch-8', title: 'Min Speed to Arrive', route: '/binary-search/MinSpeedToArriveOnTime', topic: 'binarysearch', order: 8 },
  { id: 'binarysearch-9', title: 'Median Two Sorted Arrays', route: '/binary-search/MedianOfTwoSortedArrays', topic: 'binarysearch', order: 9 },

  // RECURSION (6 problems) - path: /recursion
  { id: 'recursion-1', title: 'Factorial', route: '/recursion/Factorial', topic: 'recursion', order: 1 },
  { id: 'recursion-2', title: 'Fibonacci', route: '/recursion/Fibonacci', topic: 'recursion', order: 2 },
  { id: 'recursion-3', title: 'Tower of Hanoi', route: '/recursion/TowerOfHanoi', topic: 'recursion', order: 3 },
  { id: 'recursion-4', title: 'Binary Search Recursive', route: '/recursion/BinarySearchRecursive', topic: 'recursion', order: 4 },
  { id: 'recursion-5', title: 'Subset Sum', route: '/recursion/SubsetSum', topic: 'recursion', order: 5 },
  { id: 'recursion-6', title: 'N-Queens', route: '/recursion/NQueens', topic: 'recursion', order: 6 },

  // TREES (9 problems) - path: /trees
  { id: 'trees-1', title: 'AVL Tree', route: '/trees/AVLTree', topic: 'trees', order: 1 },
  { id: 'trees-2', title: 'Validate BST', route: '/trees/ValidateBST', topic: 'trees', order: 2 },
  { id: 'trees-3', title: 'Symmetric Tree', route: '/trees/SymmetricTreeVisualizer', topic: 'trees', order: 3 },
  { id: 'trees-4', title: 'Binary Tree Right Side', route: '/trees/BinaryTreeRightSideView', topic: 'trees', order: 4 },
  { id: 'trees-5', title: 'Construct Binary Tree', route: '/trees/ConstructBinaryTree', topic: 'trees', order: 5 },
  { id: 'trees-6', title: 'Flatten Binary Tree', route: '/trees/FlattenBinaryTree', topic: 'trees', order: 6 },
  { id: 'trees-7', title: 'LCA of Deepest Leaves', route: '/trees/LCAofDeepestLeaves', topic: 'trees', order: 7 },
  { id: 'trees-8', title: 'Morris Traversal', route: '/trees/MorrisTraversal', topic: 'trees', order: 8 },
  { id: 'trees-9', title: 'Print Binary Tree', route: '/trees/PrintBinaryTree', topic: 'trees', order: 9 },

  // GRAPHS (6 problems) - path: /graphs
  { id: 'graphs-1', title: 'BFS', route: '/graphs/BFS', topic: 'graphs', order: 1 },
  { id: 'graphs-2', title: 'DFS', route: '/graphs/DFS', topic: 'graphs', order: 2 },
  { id: 'graphs-3', title: "Dijkstra's Algorithm", route: '/graphs/Dijkstra', topic: 'graphs', order: 3 },
  { id: 'graphs-4', title: 'Topological Sort', route: '/graphs/TopologicalSort', topic: 'graphs', order: 4 },
  { id: 'graphs-5', title: "Kruskal's Algorithm", route: '/graphs/Kruskal', topic: 'graphs', order: 5 },
  { id: 'graphs-6', title: 'Network Flow', route: '/graphs/NetworkFlow', topic: 'graphs', order: 6 },

  // DYNAMIC PROGRAMMING (8 problems) - path: /dynamic-programming
  { id: 'dp-1', title: 'Coin Change', route: '/dynamic-programming/CoinChange', topic: 'dp', order: 1 },
  { id: 'dp-2', title: 'Longest Common Subsequence', route: '/dynamic-programming/LongestCommonSubsequence', topic: 'dp', order: 2 },
  { id: 'dp-3', title: 'Longest Increasing Subseq', route: '/dynamic-programming/LISubsequence', topic: 'dp', order: 3 },
  { id: 'dp-4', title: 'Edit Distance', route: '/dynamic-programming/EditDistance', topic: 'dp', order: 4 },
  { id: 'dp-5', title: 'Knapsack', route: '/dynamic-programming/KnapSack', topic: 'dp', order: 5 },
  { id: 'dp-6', title: 'Unique Paths', route: '/dynamic-programming/UniquePaths', topic: 'dp', order: 6 },
  { id: 'dp-7', title: 'Burst Balloons', route: '/dynamic-programming/BurstBalloons', topic: 'dp', order: 7 },
  { id: 'dp-8', title: 'Best Time Stock IV', route: '/dynamic-programming/SellStockIV', topic: 'dp', order: 8 },

  // BACKTRACKING (5 problems) - path: /backtracking
  { id: 'backtracking-1', title: 'Permutations', route: '/backtracking/Permutations', topic: 'backtracking', order: 1 },
  { id: 'backtracking-2', title: 'Word Search', route: '/backtracking/WordSearch', topic: 'backtracking', order: 2 },
  { id: 'backtracking-3', title: 'Sudoku Solver', route: '/backtracking/SudokuSolver', topic: 'backtracking', order: 3 },
  { id: 'backtracking-4', title: "Knight's Tour", route: '/backtracking/KnightsTour', topic: 'backtracking', order: 4 },
  { id: 'backtracking-5', title: 'Expression Add Operators', route: '/backtracking/ExpressionAddOperators', topic: 'backtracking', order: 5 },

  // SLIDING WINDOWS (5 problems) - path: /sliding-window
  { id: 'slidingwindows-1', title: 'Longest Substring', route: '/sliding-window/LongestSubstring', topic: 'slidingwindows', order: 1 },
  { id: 'slidingwindows-2', title: 'Minimum Window', route: '/sliding-window/MinimumWindow', topic: 'slidingwindows', order: 2 },
  { id: 'slidingwindows-3', title: 'Sliding Window Maximum', route: '/sliding-window/SlidingWindowMaximum', topic: 'slidingwindows', order: 3 },
  { id: 'slidingwindows-4', title: 'Fruits Into Baskets', route: '/sliding-window/FruitsIntoBaskets', topic: 'slidingwindows', order: 4 },
  { id: 'slidingwindows-5', title: 'Max Consecutive Ones III', route: '/sliding-window/MaxConsecutiveOnesIII', topic: 'slidingwindows', order: 5 },

  // HEAPS (3 problems) - path: /heaps
  { id: 'heaps-1', title: 'Heapify', route: '/heaps/Heapify', topic: 'heaps', order: 1 },
  { id: 'heaps-2', title: 'Top K Frequent Elements', route: '/heaps/TopKFrequent', topic: 'heaps', order: 2 },
  { id: 'heaps-3', title: 'Task Scheduler', route: '/heaps/TaskScheduler', topic: 'heaps', order: 3 },

  // HASHING (4 problems) - path: /hashing
  { id: 'hashing-1', title: 'Valid Anagram', route: '/hashing/ValidAnagram', topic: 'hashing', order: 1 },
  { id: 'hashing-2', title: 'Longest Consecutive Seq', route: '/hashing/LongestConsecutiveSequence', topic: 'hashing', order: 2 },
  { id: 'hashing-3', title: 'Subarray Sum Equals K', route: '/hashing/SubarraySumEqualsK', topic: 'hashing', order: 3 },
  { id: 'hashing-4', title: 'Equal Rows Column Pair', route: '/hashing/EqualRowsColumnPair', topic: 'hashing', order: 4 },

  // BIT MANIPULATION (5 problems) - path: /bit-manipulation
  { id: 'bitmanipulation-1', title: 'Single Number', route: '/bit-manipulation/SingleNumber', topic: 'bitmanipulation', order: 1 },
  { id: 'bitmanipulation-2', title: 'Power of Two', route: '/bit-manipulation/PowerOfTwo', topic: 'bitmanipulation', order: 2 },
  { id: 'bitmanipulation-3', title: 'Counting Bits', route: '/bit-manipulation/CountingBits', topic: 'bitmanipulation', order: 3 },
  { id: 'bitmanipulation-4', title: 'Number of 1 Bits', route: '/bit-manipulation/NumberOf1Bits', topic: 'bitmanipulation', order: 4 },
  { id: 'bitmanipulation-5', title: 'Reverse Bits', route: '/bit-manipulation/ReverseBits', topic: 'bitmanipulation', order: 5 },

  // GREEDY (4 problems) - path: /greedy
  { id: 'greedy-1', title: 'Assign Cookies', route: '/greedy/AssignCookies', topic: 'greedy', order: 1 },
  { id: 'greedy-2', title: 'Best Time Stock II', route: '/greedy/BestTimeStockII', topic: 'greedy', order: 2 },
  { id: 'greedy-3', title: 'Job Scheduling', route: '/greedy/JobScheduling', topic: 'greedy', order: 3 },
  { id: 'greedy-4', title: 'Two City Scheduling', route: '/greedy/TwoCityScheduling', topic: 'greedy', order: 4 },

  // SEARCHING (6 problems) - path: /searching
  { id: 'searching-1', title: 'Linear Search', route: '/searching/LinearSearch', topic: 'searching', order: 1 },
  { id: 'searching-2', title: 'Exponential Search', route: '/searching/ExponentialSearch', topic: 'searching', order: 2 },
  { id: 'searching-3', title: 'Kth Missing Number', route: '/searching/KthMissingNumber', topic: 'searching', order: 3 },
  { id: 'searching-4', title: 'Smallest Letter', route: '/searching/SmallestLetter', topic: 'searching', order: 4 },
  { id: 'searching-5', title: 'Special Array', route: '/searching/SpecialArray', topic: 'searching', order: 5 },
  { id: 'searching-6', title: 'Unknown Size Search', route: '/searching/UnknownSizeSearch', topic: 'searching', order: 6 },

  // DESIGN (6 problems) - path: /design
  { id: 'design-1', title: 'Min Stack', route: '/design/MinStack', topic: 'design', order: 1 },
  { id: 'design-2', title: 'Design HashMap', route: '/design/DesignHashMap', topic: 'design', order: 2 },
  { id: 'design-3', title: 'Design Linked List', route: '/design/DesignLinkedList', topic: 'design', order: 3 },
  { id: 'design-4', title: 'Implement Trie', route: '/design/ImplementTrie', topic: 'design', order: 4 },
  { id: 'design-5', title: 'LRU Cache', route: '/design/LRUCache', topic: 'design', order: 5 },
  { id: 'design-6', title: 'LFU Cache', route: '/design/LFUCache', topic: 'design', order: 6 },

  // PATHFINDING (5 problems) - path: /pathfinding
  { id: 'pathfinding-1', title: 'BFS Pathfinding', route: '/pathfinding/BFS', topic: 'pathfinding', order: 1 },
  { id: 'pathfinding-2', title: 'A* Algorithm', route: '/pathfinding/AStar', topic: 'pathfinding', order: 2 },
  { id: 'pathfinding-3', title: 'Flood Fill', route: '/pathfinding/FloodFill', topic: 'pathfinding', order: 3 },
  { id: 'pathfinding-4', title: 'Color Islands', route: '/pathfinding/ColorIslands', topic: 'pathfinding', order: 4 },
  { id: 'pathfinding-5', title: 'Rat in Maze', route: '/pathfinding/RatInMaze', topic: 'pathfinding', order: 5 },

  // MATHS (5 problems) - path: /maths
  { id: 'maths-1', title: 'Count Primes', route: '/maths/CountPrimes', topic: 'maths', order: 1 },
  { id: 'maths-2', title: 'Power', route: '/maths/Power', topic: 'maths', order: 2 },
  { id: 'maths-3', title: 'Factorial Zeroes', route: '/maths/FactorialZeroes', topic: 'maths', order: 3 },
  { id: 'maths-4', title: 'Excel Sheet Column', route: '/maths/ExcelSheetColumnTitle', topic: 'maths', order: 4 },
  { id: 'maths-5', title: 'Prime Palindrome', route: '/maths/PrimePalindrome', topic: 'maths', order: 5 },
];

/**
 * TOPIC CONFIGURATION
 */
export const TOPICS = {
  arrays: { name: 'Arrays', color: '#3b82f6', icon: '📊' },
  strings: { name: 'Strings', color: '#10b981', icon: '📝' },
  linkedlist: { name: 'Linked List', color: '#8b5cf6', icon: '🔗' },
  stack: { name: 'Stack', color: '#f59e0b', icon: '📚' },
  queue: { name: 'Queue', color: '#06b6d4', icon: '🚶' },
  sorting: { name: 'Sorting', color: '#6366f1', icon: '📈' },
  binarysearch: { name: 'Binary Search', color: '#14b8a6', icon: '🔍' },
  recursion: { name: 'Recursion', color: '#f97316', icon: '🔄' },
  trees: { name: 'Trees', color: '#84cc16', icon: '🌲' },
  graphs: { name: 'Graphs', color: '#ef4444', icon: '🕸️' },
  dp: { name: 'Dynamic Programming', color: '#ec4899', icon: '🧩' },
  backtracking: { name: 'Backtracking', color: '#a855f7', icon: '↩️' },
  slidingwindows: { name: 'Sliding Windows', color: '#0ea5e9', icon: '🪟' },
  heaps: { name: 'Heaps', color: '#22c55e', icon: '⛰️' },
  hashing: { name: 'Hashing', color: '#eab308', icon: '#️⃣' },
  bitmanipulation: { name: 'Bit Manipulation', color: '#64748b', icon: '🔢' },
  greedy: { name: 'Greedy', color: '#facc15', icon: '🏃' },
  searching: { name: 'Searching', color: '#7c3aed', icon: '🔎' },
  design: { name: 'Design', color: '#2dd4bf', icon: '🏗️' },
  pathfinding: { name: 'Pathfinding', color: '#f472b6', icon: '🗺️' },
  maths: { name: 'Mathematics', color: '#fb923c', icon: '➕' },
};

/**
 * PREFERRED ROADMAP ORDER - Suggested learning path
 */
export const ROADMAP_ORDER = [
  'arrays', 'strings', 'linkedlist', 'stack', 'queue', 'sorting',
  'binarysearch', 'recursion', 'trees', 'graphs', 'dp', 'backtracking',
  'slidingwindows', 'heaps', 'hashing', 'bitmanipulation', 'greedy',
  'searching', 'design', 'pathfinding', 'maths'
];

/**
 * Build full roadmap (flat array of all problems in preferred order)
 */
export const FULL_ROADMAP = ROADMAP_ORDER.flatMap(topic =>
  ALL_PROBLEMS.filter(p => p.topic === topic).sort((a, b) => a.order - b.order)
);

/**
 * Country IDs ordered by GEOGRAPHIC PROXIMITY
 * Problems will be assigned to geographically close countries in sequence
 * This creates a natural "journey" across the map
 */
export const ALL_COUNTRY_IDS = [
  // Start in North America (West to East, North to South)
  'US', 'CA', 'MX', 'GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'JM', 'HT', 'DO',
  // Central/South America (North to South)
  'CO', 'VE', 'GY', 'SR', 'EC', 'PE', 'BR', 'BO', 'PY', 'UY', 'AR', 'CL',
  // Cross Atlantic to Western Europe
  'PT', 'ES', 'FR', 'BE', 'NL', 'GB', 'IE', 'DE', 'CH', 'AT', 'IT', 'SI', 'HR',
  // Northern Europe  
  'DK', 'NO', 'SE', 'FI', 'EE', 'LV', 'LT',
  // Central/Eastern Europe
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'RS', 'BA', 'ME', 'AL', 'MK', 'GR',
  // Eastern Europe
  'MD', 'UA', 'BY', 'RU',
  // Middle East
  'TR', 'GE', 'AM', 'AZ', 'SY', 'LB', 'IL', 'JO', 'IQ', 'KW', 'SA', 'AE', 'QA', 'OM', 'YE',
  // Central Asia
  'IR', 'TM', 'UZ', 'TJ', 'KG', 'KZ', 'AF', 'PK',
  // South Asia
  'IN', 'NP', 'BT', 'BD', 'LK', 'MM',
  // Southeast Asia  
  'TH', 'LA', 'VN', 'KH', 'MY', 'BN', 'ID', 'TL', 'PH',
  // East Asia
  'CN', 'MN', 'KP', 'KR', 'JP', 'TW',
  // North Africa (West to East)
  'MA', 'DZ', 'TN', 'LY', 'EG', 'SD', 'SS',
  // West Africa
  'MR', 'ML', 'NE', 'TD', 'SN', 'GM', 'GW', 'GN', 'SL', 'LR', 'CI', 'BF', 'GH', 'TG', 'BJ', 'NG',
  // Central Africa
  'CM', 'CF', 'GA', 'CG', 'CD', 'RW', 'BI', 'UG',
  // East Africa
  'KE', 'ET', 'ER', 'DJ', 'SO', 'TZ', 'MZ', 'MW', 'ZM', 'ZW',
  // Southern Africa
  'BW', 'NA', 'ZA', 'LS', 'SZ', 'MG',
  // Oceania
  'AU', 'PG', 'NZ'
];

/**
 * Country name to ISO code mapping (for class-based countries in SVG)
 * The SVG uses class names for some countries instead of id attributes
 */
export const COUNTRY_NAME_TO_CODE = {
  // Countries that use class="CountryName" in the SVG
  'Angola': 'AO', 
  'Argentina': 'AR', 
  'Australia': 'AU', 
  'Azerbaijan': 'AZ',
  'Canada': 'CA', 
  'Chile': 'CL', 
  'China': 'CN', 
  'Denmark': 'DK', 
  'Greece': 'GR',
  'Malaysia': 'MY', 
  'New Zealand': 'NZ', 
  'Norway': 'NO', 
  'Philippines': 'PH',
  'United Kingdom': 'GB', 
  'Russia': 'RU', 
  'Russian Federation': 'RU',
  'Indonesia': 'ID',
  'United States': 'US',
  'Japan': 'JP',
  'Italy': 'IT',
  'France': 'FR',
  'Fiji': 'FJ',
  'Vanuatu': 'VU',
  'Samoa': 'WS',
  'American Samoa': 'AS',
  'Antigua and Barbuda': 'AG',
  'Guadeloupe': 'GP',
  'Canary Islands (Spain)': 'IC',
};

// Reverse mapping
export const CODE_TO_COUNTRY_NAME = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => [code, name])
);

/**
 * Build country <-> problem mapping
 */
const buildCountryMapping = () => {
  const problemToCountry = {};
  const countryToProblem = {};
  
  FULL_ROADMAP.forEach((problem, index) => {
    if (index < ALL_COUNTRY_IDS.length) {
      const countryId = ALL_COUNTRY_IDS[index];
      problemToCountry[problem.id] = countryId;
      countryToProblem[countryId] = problem.id;
    }
  });
  
  return { problemToCountry, countryToProblem };
};

export const { problemToCountry: PROBLEM_TO_COUNTRY, countryToProblem: COUNTRY_TO_PROBLEM } = buildCountryMapping();

// Helper functions
export const getProblemById = (id) => ALL_PROBLEMS.find(p => p.id === id);
export const getProblemsByTopic = (topic) => ALL_PROBLEMS.filter(p => p.topic === topic).sort((a, b) => a.order - b.order);
export const getCountryForProblem = (problemId) => PROBLEM_TO_COUNTRY[problemId];
export const getProblemForCountry = (countryId) => {
  const problemId = COUNTRY_TO_PROBLEM[countryId];
  return problemId ? getProblemById(problemId) : null;
};
export const isPlaceholderCountry = (countryId) => !COUNTRY_TO_PROBLEM[countryId];


/**
 * ============================================
 * ZUSTAND STORE
 * ============================================
 */
const useProgressStore = create(
  persist(
    (set, get) => ({
      // State: Array of completed problem IDs
      completedProblems: [],
      
      // Check if a problem is completed
      isProblemCompleted: (problemId) => {
        return get().completedProblems.includes(problemId);
      },
      
      // Check if a problem is unlocked
      // Rule: First problem in each topic is ALWAYS unlocked (free topic access)
      // Sequential within topic: must complete previous to unlock next
      isProblemUnlocked: (problemId) => {
        const problem = getProblemById(problemId);
        if (!problem) return false;
        
        // First problem in any topic is always unlocked
        if (problem.order === 1) return true;
        
        // Find previous problem in same topic
        const topicProblems = getProblemsByTopic(problem.topic);
        const prevProblem = topicProblems.find(p => p.order === problem.order - 1);
        
        if (!prevProblem) return true;
        
        // Previous must be completed
        return get().completedProblems.includes(prevProblem.id);
      },
      
      // Get problem state: 'locked' | 'available' | 'completed' | 'current'
      getProblemState: (problemId) => {
        const { completedProblems, isProblemUnlocked, getCurrentRoadmapProblem } = get();
        
        if (completedProblems.includes(problemId)) return 'completed';
        
        const currentProblem = getCurrentRoadmapProblem();
        if (currentProblem && currentProblem.id === problemId) return 'current';
        
        if (isProblemUnlocked(problemId)) return 'available';
        
        return 'locked';
      },
      
      // Get the current roadmap problem (first uncompleted in roadmap order)
      getCurrentRoadmapProblem: () => {
        const { completedProblems } = get();
        return FULL_ROADMAP.find(p => !completedProblems.includes(p.id)) || null;
      },
      
      // Get roadmap index
      getRoadmapIndex: () => {
        const { completedProblems } = get();
        const currentProblem = FULL_ROADMAP.find(p => !completedProblems.includes(p.id));
        return currentProblem ? FULL_ROADMAP.indexOf(currentProblem) : FULL_ROADMAP.length;
      },
      
      // Get next problem in roadmap after completing current
      getNextRoadmapProblem: () => {
        const index = get().getRoadmapIndex();
        return FULL_ROADMAP[index + 1] || null;
      },
      
      // Complete a problem
      completeProblem: (problemId) => {
        const { completedProblems, isProblemUnlocked } = get();
        
        // Must be unlocked to complete
        if (!isProblemUnlocked(problemId)) return { success: false, nextProblem: null };
        
        // Already completed
        if (completedProblems.includes(problemId)) return { success: false, nextProblem: null };
        
        // Get next roadmap problem BEFORE updating state
        const currentIndex = FULL_ROADMAP.findIndex(p => p.id === problemId);
        const nextProblem = FULL_ROADMAP[currentIndex + 1] || null;
        
        set({ completedProblems: [...completedProblems, problemId] });
        
        return { success: true, nextProblem };
      },
      
      // Mark all problems in a topic as complete (DEBUG/TESTING)
      markTopicComplete: (topic) => {
        const { completedProblems } = get();
        const topicProblems = getProblemsByTopic(topic);
        const newCompleted = [...new Set([...completedProblems, ...topicProblems.map(p => p.id)])];
        set({ completedProblems: newCompleted });
      },
      
      // Get topic progress
      getTopicProgress: (topic) => {
        const { completedProblems } = get();
        const topicProblems = getProblemsByTopic(topic);
        const completed = topicProblems.filter(p => completedProblems.includes(p.id)).length;
        return {
          completed,
          total: topicProblems.length,
          percentage: topicProblems.length > 0 ? Math.round((completed / topicProblems.length) * 100) : 0,
          isComplete: completed === topicProblems.length
        };
      },
      
      // Get overall progress
      getTotalProgress: () => {
        const { completedProblems } = get();
        return {
          completed: completedProblems.length,
          total: ALL_PROBLEMS.length,
          percentage: Math.round((completedProblems.length / ALL_PROBLEMS.length) * 100)
        };
      },
      
      // Reset all progress
      resetProgress: () => {
        set({ completedProblems: [] });
      },
    }),
    {
      name: 'dsa-skill-tree-progress-v2',
    }
  )
);

export default useProgressStore;
