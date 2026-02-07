/**
 * DSA Conquest Map - Unified Data Source
 * =======================================
 * 
 * Single source of truth based on the 164-problem learning path:
 * - 27 stages (24 main + 3 bonus)
 * - Stage-based progression (pattern-first learning)
 * - LeetCode URLs and visualizer routes
 * - Country mappings with intuitive size-to-difficulty
 * 
 * ARCHITECTURE:
 * - Problems follow the exact JSON learning path order
 * - Large countries = Hard/Important problems
 * - Small countries = Easy/introductory problems
 * - Geographic flow creates a natural learning journey
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const LEETCODE_BASE_URL = 'https://leetcode.com/problems';
export const VISUALIZER_BASE_PATH = '/visualizer';

export const Difficulty = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const ProblemStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED_VISUALIZER: 'completed_visualizer',
  COMPLETED_LEETCODE: 'completed_leetcode',
  COMPLETED_BOTH: 'completed_both',
};

// =============================================================================
// STAGE CONFIGURATION (27 stages from JSON learning path)
// =============================================================================

export const STAGES = {
  1: { name: 'Absolute Programming Basics', goal: 'Understand arrays as memory blocks and basic traversal', pattern: 'Sequential Access', color: '#22c55e' },
  2: { name: 'Array Index Manipulation', goal: 'Learn to manipulate array indices and rearrange elements', pattern: 'Index-based Operations', color: '#3b82f6' },
  3: { name: 'Prefix & Subarray Thinking', goal: 'Build prefix sums and understand subarray patterns', pattern: 'Cumulative Computation', color: '#6366f1' },
  4: { name: 'Two Pointers', goal: 'Master the two-pointer technique for optimization', pattern: 'Converging/Diverging Pointers', color: '#8b5cf6' },
  5: { name: 'Sliding Window', goal: 'Master fixed and variable-size window patterns', pattern: 'Window Expansion/Contraction', color: '#0ea5e9' },
  6: { name: 'String Fundamentals', goal: 'Learn basic string manipulation and character counting', pattern: 'Character-level Operations', color: '#10b981' },
  7: { name: 'Advanced Strings', goal: 'Handle complex string transformations and matching', pattern: 'String Transformation', color: '#14b8a6' },
  8: { name: 'Binary Search – Core', goal: 'Develop logarithmic thinking with basic binary search', pattern: 'Divide and Conquer (Search)', color: '#f59e0b' },
  9: { name: 'Binary Search – Advanced', goal: 'Apply binary search to complex scenarios', pattern: 'Search Space Reduction', color: '#f97316' },
  10: { name: 'Linked List – Construction', goal: 'Build and manipulate linked list structures', pattern: 'Pointer Manipulation', color: '#8b5cf6' },
  11: { name: 'Linked List – LC Problems', goal: 'Solve classic linked list problems', pattern: 'Fast/Slow Pointers & Reversal', color: '#a855f7' },
  12: { name: 'Stack – Fundamentals', goal: 'Understand LIFO operations and basic stack usage', pattern: 'Last-In-First-Out', color: '#f59e0b' },
  13: { name: 'Stack – Applications', goal: 'Apply monotonic stack and expression evaluation', pattern: 'Monotonic Stack', color: '#ea580c' },
  14: { name: 'Queue', goal: 'Master FIFO operations and circular queues', pattern: 'First-In-First-Out', color: '#06b6d4' },
  15: { name: 'Sorting', goal: 'Understand sorting algorithms and their tradeoffs', pattern: 'Ordering & Comparison', color: '#6366f1' },
  16: { name: 'Heaps & Priority Queues', goal: 'Learn heap construction and priority-based problems', pattern: 'Heap Property Maintenance', color: '#22c55e' },
  17: { name: 'Trees – Construction', goal: 'Build and insert into tree structures', pattern: 'Hierarchical Construction', color: '#84cc16' },
  18: { name: 'Trees – Traversals & Properties', goal: 'Master tree traversals and validate properties', pattern: 'Recursive Tree Processing', color: '#65a30d' },
  19: { name: 'Trees – Views & Transformations', goal: 'Handle complex tree views and transformations', pattern: 'Level-wise & Path Processing', color: '#4d7c0f' },
  20: { name: 'Graphs & Grids', goal: 'Explore graph traversals and grid-based problems', pattern: 'Graph Traversal (BFS/DFS)', color: '#ef4444' },
  21: { name: 'Recursion & Backtracking', goal: 'Master recursive thinking and backtracking patterns', pattern: 'Explore-Backtrack', color: '#a855f7' },
  22: { name: 'Dynamic Programming', goal: 'Learn memoization and tabulation for optimization', pattern: 'Optimal Substructure', color: '#ec4899' },
  23: { name: 'Greedy Algorithms', goal: 'Make locally optimal choices for global optimization', pattern: 'Greedy Choice Property', color: '#facc15' },
  24: { name: 'Design & Systems', goal: 'Combine patterns to design complex data structures', pattern: 'System Design', color: '#2dd4bf' },
  'A': { name: 'Bit Manipulation', goal: 'Master bitwise operations and tricks', pattern: 'Binary Representation', color: '#64748b', isBonus: true },
  'B': { name: 'Mathematical & Miscellaneous', goal: 'Solve number theory and math-based problems', pattern: 'Mathematical Properties', color: '#fb923c', isBonus: true },
  'C': { name: 'Hashing Patterns', goal: 'Use hash maps for efficient lookups', pattern: 'Hash-based Optimization', color: '#eab308', isBonus: true },
};

// =============================================================================
// COUNTRY MAPPINGS (SVG Compatibility)
// =============================================================================

export const COUNTRY_NAME_TO_CODE = {
  'Angola': 'AO', 'Argentina': 'AR', 'Australia': 'AU', 'Azerbaijan': 'AZ',
  'Canada': 'CA', 'Chile': 'CL', 'China': 'CN', 'Denmark': 'DK', 'Greece': 'GR',
  'Malaysia': 'MY', 'New Zealand': 'NZ', 'Norway': 'NO', 'Philippines': 'PH',
  'United Kingdom': 'GB', 'Russia': 'RU', 'Russian Federation': 'RU',
  'Indonesia': 'ID', 'United States': 'US', 'Japan': 'JP', 'Italy': 'IT',
  'France': 'FR', 'Fiji': 'FJ', 'Vanuatu': 'VU', 'Samoa': 'WS',
  'Brazil': 'BR', 'India': 'IN', 'Mexico': 'MX', 'Germany': 'DE', 'Spain': 'ES',
  'South Africa': 'ZA', 'Egypt': 'EG', 'Saudi Arabia': 'SA', 'Turkey': 'TR',
  'Iran': 'IR', 'Pakistan': 'PK', 'Thailand': 'TH', 'Vietnam': 'VN',
  'South Korea': 'KR', 'Poland': 'PL', 'Ukraine': 'UA', 'Colombia': 'CO',
  'Peru': 'PE', 'Venezuela': 'VE', 'Nigeria': 'NG', 'Kenya': 'KE',
  'Ethiopia': 'ET', 'Tanzania': 'TZ', 'Congo': 'CD', 'Kazakhstan': 'KZ',
  'Mongolia': 'MN', 'Sweden': 'SE', 'Finland': 'FI',
};

export const CODE_TO_COUNTRY_NAME = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => [code, name])
);

// =============================================================================
// COUNTRY SIZE CATEGORIES
// =============================================================================

export const COUNTRY_SIZES = {
  large: ['RU', 'CA', 'US', 'CN', 'BR', 'AU', 'IN', 'AR', 'KZ', 'DZ', 'CD', 'SA', 'MX', 'ID', 'SD', 'LY'],
  medium: [
    'MN', 'PE', 'TD', 'NE', 'AO', 'ML', 'ZA', 'CO', 'ET', 'BO', 'MR', 'EG', 'TZ', 'NG', 'VE',
    'PK', 'TR', 'CL', 'ZM', 'MM', 'AF', 'SO', 'CF', 'UA', 'MZ', 'FR', 'ES', 'TH', 'YE', 'IQ',
    'JP', 'DE', 'PL', 'FI', 'NO', 'SE', 'IT', 'GB', 'NZ', 'PG', 'MY', 'VN', 'PH', 'IR', 'KE'
  ],
  small: [
    'PT', 'HU', 'RO', 'BG', 'GR', 'CZ', 'AT', 'CH', 'BE', 'NL', 'DK', 'IE', 'SK', 'HR', 'BA',
    'RS', 'AL', 'MK', 'SI', 'ME', 'EE', 'LV', 'LT', 'MD', 'GE', 'AM', 'AZ', 'JO', 'IL', 'LB',
    'SY', 'KW', 'QA', 'AE', 'OM', 'BH', 'NP', 'BT', 'BD', 'LK', 'KH', 'LA', 'SG', 'BN', 'TL',
    'TW', 'KR', 'KP', 'UZ', 'TM', 'TJ', 'KG', 'BY', 'GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA',
    'CU', 'JM', 'HT', 'DO', 'GY', 'SR', 'EC', 'PY', 'UY', 'MA', 'TN', 'SN', 'GH', 'CI', 'CM',
    'UG', 'RW', 'BW', 'NA', 'ZW', 'MW', 'MG', 'FJ', 'WS', 'VU', 'TO', 'NC'
  ]
};

// =============================================================================
// ALL PROBLEMS - 164 Problems from Learning Path JSON
// =============================================================================

/**
 * Complete 164-problem database following the exact learning path order
 * hasVisualizer: true = has existing visualizer component
 * isNew: true = basic problem to be added (no visualizer yet)
 */
export const ALL_PROBLEMS = [
  // =================================================================
  // STAGE 1: Absolute Programming Basics (7 problems)
  // Pattern: Sequential Access
  // Countries: Start in Central America - easy small countries
  // =================================================================
  { id: 'stage1-1', title: 'Find Maximum Element', route: '/arrays/FindMaxElement', stage: 1, order: 1, lcNumber: null, lcSlug: null, countryId: 'GT', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'FindMaxElement' },
  { id: 'stage1-2', title: 'Find Minimum Element', route: '/arrays/FindMinElement', stage: 1, order: 2, lcNumber: null, lcSlug: null, countryId: 'BZ', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'FindMinElement' },
  { id: 'stage1-3', title: 'Array Sum', route: '/arrays/ArraySum', stage: 1, order: 3, lcNumber: null, lcSlug: null, countryId: 'HN', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ArraySum' },
  { id: 'stage1-4', title: 'Reverse Array', route: '/arrays/ReverseArray', stage: 1, order: 4, lcNumber: null, lcSlug: null, countryId: 'SV', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ReverseArray' },
  { id: 'stage1-5', title: 'Count Zeros in Array', route: '/arrays/CountZeros', stage: 1, order: 5, lcNumber: null, lcSlug: null, countryId: 'NI', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'CountZeros' },
  { id: 'stage1-6', title: 'Insert Element at Index', route: '/arrays/InsertElement', stage: 1, order: 6, lcNumber: null, lcSlug: null, countryId: 'CR', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage1-7', title: 'Delete Element at Index', route: '/arrays/DeleteElement', stage: 1, order: 7, lcNumber: null, lcSlug: null, countryId: 'PA', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },

  // =================================================================
  // STAGE 2: Array Index Manipulation (5 problems)
  // Pattern: Index-based Operations
  // Countries: Caribbean + Mexico
  // =================================================================
  { id: 'stage2-1', title: 'Linear Search in Array', route: '/searching/LinearSearchBasic', stage: 2, order: 1, lcNumber: null, lcSlug: null, countryId: 'CU', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage2-2', title: 'Linear Search', route: '/searching/LinearSearch', stage: 2, order: 2, lcNumber: null, lcSlug: null, countryId: 'JM', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'LinearSearch', note: 'Full visualizer version' },
  { id: 'stage2-3', title: 'Move Zeros', route: '/arrays/MoveZeros', stage: 2, order: 3, lcNumber: 283, lcSlug: 'move-zeroes', countryId: 'HT', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'MoveZeros' },
  { id: 'stage2-4', title: 'Rotate Array', route: '/arrays/RotateArray', stage: 2, order: 4, lcNumber: 189, lcSlug: 'rotate-array', countryId: 'DO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'RotateArray' },
  { id: 'stage2-5', title: 'Squares of a Sorted Array', route: '/arrays/SquaresOfSortedArray', stage: 2, order: 5, lcNumber: 977, lcSlug: 'squares-of-a-sorted-array', countryId: 'MX', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'SquaresOfSortedArray' },

  // =================================================================
  // STAGE 3: Prefix & Subarray Thinking (6 problems)
  // Pattern: Cumulative Computation
  // Countries: Northern South America
  // =================================================================
  { id: 'stage3-1', title: 'Prefix Sum Construction', route: '/arrays/PrefixSum', stage: 3, order: 1, lcNumber: null, lcSlug: null, countryId: 'CO', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage3-2', title: 'Maximum Subarray', route: '/arrays/MaximumSubarray', stage: 3, order: 2, lcNumber: 53, lcSlug: 'maximum-subarray', countryId: 'VE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MaximumSubarray', note: "Kadane's Algorithm" },
  { id: 'stage3-3', title: 'Product of Array Except Self', route: '/arrays/ProductOfArrayExceptSelf', stage: 3, order: 3, lcNumber: 238, lcSlug: 'product-of-array-except-self', countryId: 'GY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ProductOfArrayExceptSelf' },
  { id: 'stage3-4', title: 'Sum of Subarray Ranges', route: '/arrays/SubarrayRanges', stage: 3, order: 4, lcNumber: 2104, lcSlug: 'sum-of-subarray-ranges', countryId: 'SR', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SubarrayRanges' },
  { id: 'stage3-5', title: 'Subarray Sum Equals K', route: '/hashing/SubarraySumEqualsK', stage: 3, order: 5, lcNumber: 560, lcSlug: 'subarray-sum-equals-k', countryId: 'EC', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SubarraySumEqualsK' },
  { id: 'stage3-6', title: 'Split Array Largest Sum', route: '/arrays/SplitArrayLargestSum', stage: 3, order: 6, lcNumber: 410, lcSlug: 'split-array-largest-sum', countryId: 'BR', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'SplitArrayLargestSum' },

  // =================================================================
  // STAGE 4: Two Pointers (5 problems)
  // Pattern: Converging/Diverging Pointers
  // Countries: Southern South America
  // =================================================================
  { id: 'stage4-1', title: 'Two Sum', route: '/arrays/TwoSum', stage: 4, order: 1, lcNumber: 1, lcSlug: 'two-sum', countryId: 'PE', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'TwoSum', note: 'Classic problem #1' },
  { id: 'stage4-2', title: '3Sum', route: '/arrays/ThreeSum', stage: 4, order: 2, lcNumber: 15, lcSlug: '3sum', countryId: 'BO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ThreeSum' },
  { id: 'stage4-3', title: '4Sum', route: '/arrays/FourSum', stage: 4, order: 3, lcNumber: 18, lcSlug: '4sum', countryId: 'PY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FourSum' },
  { id: 'stage4-4', title: 'Container With Most Water', route: '/arrays/ContainerWithMostWater', stage: 4, order: 4, lcNumber: 11, lcSlug: 'container-with-most-water', countryId: 'AR', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ContainerWithMostWater' },
  { id: 'stage4-5', title: 'Trapping Rain Water', route: '/arrays/TrappingRainWater', stage: 4, order: 5, lcNumber: 42, lcSlug: 'trapping-rain-water', countryId: 'CL', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'TrappingRainWater', note: 'Iconic Hard Problem' },

  // =================================================================
  // STAGE 5: Sliding Window (5 problems)
  // Pattern: Window Expansion/Contraction
  // Countries: West Africa coast
  // =================================================================
  { id: 'stage5-1', title: 'Max Consecutive Ones III', route: '/arrays/MaxConsecutiveOnesIII', stage: 5, order: 1, lcNumber: 1004, lcSlug: 'max-consecutive-ones-iii', countryId: 'SN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MaxConsecutiveOnesIII' },
  { id: 'stage5-2', title: 'Longest Substring Without Repeating Characters', route: '/sliding-window/LongestSubstring', stage: 5, order: 2, lcNumber: 3, lcSlug: 'longest-substring-without-repeating-characters', countryId: 'GH', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LongestSubstring' },
  { id: 'stage5-3', title: 'Fruit Into Baskets', route: '/sliding-window/FruitsIntoBaskets', stage: 5, order: 3, lcNumber: 904, lcSlug: 'fruit-into-baskets', countryId: 'CI', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FruitsIntoBaskets' },
  { id: 'stage5-4', title: 'Minimum Window Substring', route: '/sliding-window/MinimumWindow', stage: 5, order: 4, lcNumber: 76, lcSlug: 'minimum-window-substring', countryId: 'NG', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'MinimumWindow' },
  { id: 'stage5-5', title: 'Sliding Window Maximum', route: '/sliding-window/SlidingWindowMaximum', stage: 5, order: 5, lcNumber: 239, lcSlug: 'sliding-window-maximum', countryId: 'CM', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'SlidingWindowMaximum' },

  // =================================================================
  // STAGE 6: String Fundamentals (5 problems)
  // Pattern: Character-level Operations
  // Countries: Central/East Africa
  // =================================================================
  { id: 'stage6-1', title: 'Palindrome Check', route: '/strings/PalindromeCheck', stage: 6, order: 1, lcNumber: 125, lcSlug: 'valid-palindrome', countryId: 'GA', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'PalindromeCheck' },
  { id: 'stage6-2', title: 'Reverse String', route: '/strings/ReverseString', stage: 6, order: 2, lcNumber: 344, lcSlug: 'reverse-string', countryId: 'CG', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ReverseString' },
  { id: 'stage6-3', title: 'Count Vowels', route: '/strings/CountVowels', stage: 6, order: 3, lcNumber: null, lcSlug: null, countryId: 'CD', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'CountVowels' },
  { id: 'stage6-4', title: 'Valid Anagram', route: '/hashing/ValidAnagram', stage: 6, order: 4, lcNumber: 242, lcSlug: 'valid-anagram', countryId: 'AO', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ValidAnagram' },
  { id: 'stage6-5', title: 'First Unique Character', route: '/strings/FirstUniqueCharacter', stage: 6, order: 5, lcNumber: 387, lcSlug: 'first-unique-character-in-a-string', countryId: 'ZM', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'FirstUniqueCharacter' },

  // =================================================================
  // STAGE 7: Advanced Strings (6 problems)
  // Pattern: String Transformation
  // Countries: Southern/Eastern Africa
  // =================================================================
  { id: 'stage7-1', title: 'Longest Common Prefix', route: '/strings/LongestCP', stage: 7, order: 1, lcNumber: 14, lcSlug: 'longest-common-prefix', countryId: 'ZW', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'LongestCommonPrefix' },
  { id: 'stage7-2', title: 'String Compression', route: '/strings/StringCompression', stage: 7, order: 2, lcNumber: 443, lcSlug: 'string-compression', countryId: 'BW', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'StringCompression' },
  { id: 'stage7-3', title: 'Reverse Words in a String', route: '/strings/ReverseWords', stage: 7, order: 3, lcNumber: 151, lcSlug: 'reverse-words-in-a-string', countryId: 'NA', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ReverseWords' },
  { id: 'stage7-4', title: 'Is Subsequence', route: '/strings/IsSubSequence', stage: 7, order: 4, lcNumber: 392, lcSlug: 'is-subsequence', countryId: 'ZA', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'IsSubsequence' },
  { id: 'stage7-5', title: 'Group Anagrams', route: '/strings/GroupAnagrams', stage: 7, order: 5, lcNumber: 49, lcSlug: 'group-anagrams', countryId: 'MZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'GroupAnagrams' },
  { id: 'stage7-6', title: 'Longest Palindromic Substring', route: '/strings/LongestPalindrome', stage: 7, order: 6, lcNumber: 5, lcSlug: 'longest-palindromic-substring', countryId: 'MG', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LongestPalindrome' },

  // =================================================================
  // STAGE 8: Binary Search – Core (5 problems)
  // Pattern: Divide and Conquer (Search)
  // Countries: North Africa + Mediterranean
  // =================================================================
  { id: 'stage8-1', title: 'Binary Search Basic', route: '/binary-search/BinarySearch', stage: 8, order: 1, lcNumber: 704, lcSlug: 'binary-search', countryId: 'MA', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'BinarySearch' },
  { id: 'stage8-2', title: 'Peak Index in Mountain Array', route: '/binary-search/PeakMountain', stage: 8, order: 2, lcNumber: 852, lcSlug: 'peak-index-in-a-mountain-array', countryId: 'DZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'PeakMountain' },
  { id: 'stage8-3', title: 'Find First and Last Position', route: '/binary-search/FirstLastPosition', stage: 8, order: 3, lcNumber: 34, lcSlug: 'find-first-and-last-position-of-element-in-sorted-array', countryId: 'TN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FirstLastPosition' },
  { id: 'stage8-4', title: 'Kth Missing Positive Number', route: '/searching/KthMissingNumber', stage: 8, order: 4, lcNumber: 1539, lcSlug: 'kth-missing-positive-number', countryId: 'LY', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'KthMissingNumber' },
  { id: 'stage8-5', title: 'Find Smallest Letter Greater Than Target', route: '/searching/SmallestLetter', stage: 8, order: 5, lcNumber: 744, lcSlug: 'find-smallest-letter-greater-than-target', countryId: 'EG', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'SmallestLetter' },

  // =================================================================
  // STAGE 9: Binary Search – Advanced (9 problems)
  // Pattern: Search Space Reduction
  // Countries: Middle East + Eastern Mediterranean
  // =================================================================
  { id: 'stage9-1', title: 'Search in Rotated Sorted Array', route: '/binary-search/SearchRotatedArray', stage: 9, order: 1, lcNumber: 33, lcSlug: 'search-in-rotated-sorted-array', countryId: 'SD', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SearchRotatedArray' },
  { id: 'stage9-2', title: 'Find Minimum in Rotated Sorted Array', route: '/binary-search/MinRotatedArray', stage: 9, order: 2, lcNumber: 153, lcSlug: 'find-minimum-in-rotated-sorted-array', countryId: 'ET', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MinRotatedArray' },
  { id: 'stage9-3', title: 'Find Peak Element', route: '/binary-search/FindPeakElement', stage: 9, order: 3, lcNumber: 162, lcSlug: 'find-peak-element', countryId: 'ER', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FindPeakElement' },
  { id: 'stage9-4', title: 'Search a 2D Matrix', route: '/binary-search/Search2DMatrix', stage: 9, order: 4, lcNumber: 74, lcSlug: 'search-a-2d-matrix', countryId: 'DJ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Search2DMatrix' },
  { id: 'stage9-5', title: 'Min Speed to Arrive on Time', route: '/binary-search/MinSpeed', stage: 9, order: 5, lcNumber: 1870, lcSlug: 'minimum-speed-to-arrive-on-time', countryId: 'SO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MinSpeed' },
  { id: 'stage9-6', title: 'Median of Two Sorted Arrays', route: '/binary-search/MedianTwoArrays', stage: 9, order: 6, lcNumber: 4, lcSlug: 'median-of-two-sorted-arrays', countryId: 'SA', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'MedianTwoArrays' },
  { id: 'stage9-7', title: 'Special Array With X Elements', route: '/searching/SpecialArray', stage: 9, order: 7, lcNumber: 1608, lcSlug: 'special-array-with-x-elements-greater-than-or-equal-x', countryId: 'YE', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'SpecialArray' },
  { id: 'stage9-8', title: 'Search in Sorted Array of Unknown Size', route: '/searching/UnknownSizeSearch', stage: 9, order: 8, lcNumber: 702, lcSlug: 'search-in-a-sorted-array-of-unknown-size', countryId: 'OM', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'UnknownSizeSearch' },
  { id: 'stage9-9', title: 'Exponential Search', route: '/searching/ExponentialSearch', stage: 9, order: 9, lcNumber: null, lcSlug: null, countryId: 'AE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ExponentialSearch' },

  // =================================================================
  // STAGE 10: Linked List – Construction (7 problems)
  // Pattern: Pointer Manipulation
  // Countries: Arabian Peninsula + Iran
  // INCLUDES 6 NEW BASIC PROBLEMS
  // =================================================================
  { id: 'stage10-1', title: 'Build Linked List from Array', route: '/linked-list/BuildLinkedList', stage: 10, order: 1, lcNumber: null, lcSlug: null, countryId: 'QA', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-2', title: 'Insert at Head', route: '/linked-list/InsertAtHead', stage: 10, order: 2, lcNumber: null, lcSlug: null, countryId: 'BH', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-3', title: 'Insert at Tail', route: '/linked-list/InsertAtTail', stage: 10, order: 3, lcNumber: null, lcSlug: null, countryId: 'KW', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-4', title: 'Insert at Position', route: '/linked-list/InsertAtPosition', stage: 10, order: 4, lcNumber: null, lcSlug: null, countryId: 'JO', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-5', title: 'Delete Node in Linked List', route: '/linked-list/DeleteNode', stage: 10, order: 5, lcNumber: null, lcSlug: null, countryId: 'IL', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-6', title: 'Search in Linked List', route: '/linked-list/SearchLinkedList', stage: 10, order: 6, lcNumber: null, lcSlug: null, countryId: 'LB', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage10-7', title: 'Design Linked List', route: '/design/DesignLinkedList', stage: 10, order: 7, lcNumber: 707, lcSlug: 'design-linked-list', countryId: 'IR', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'DesignLinkedList' },

  // =================================================================
  // STAGE 11: Linked List – LC Problems (5 problems)
  // Pattern: Fast/Slow Pointers & Reversal
  // Countries: Turkey + Caucasus
  // =================================================================
  { id: 'stage11-1', title: 'Reverse Linked List', route: '/linked-list/ReverseLinkedList', stage: 11, order: 1, lcNumber: 206, lcSlug: 'reverse-linked-list', countryId: 'TR', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ReverseLinkedList' },
  { id: 'stage11-2', title: 'Linked List Cycle', route: '/linked-list/LinkedListCycle', stage: 11, order: 2, lcNumber: 141, lcSlug: 'linked-list-cycle', countryId: 'GE', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'LinkedListCycle' },
  { id: 'stage11-3', title: 'Merge Two Sorted Lists', route: '/linked-list/MergeTwoSortedLists', stage: 11, order: 3, lcNumber: 21, lcSlug: 'merge-two-sorted-lists', countryId: 'AM', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'MergeTwoSortedLists' },
  { id: 'stage11-4', title: 'Sort List', route: '/linked-list/SortList', stage: 11, order: 4, lcNumber: 148, lcSlug: 'sort-list', countryId: 'AZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SortList' },
  { id: 'stage11-5', title: 'Swap Nodes in Pairs', route: '/linked-list/SwapPairs', stage: 11, order: 5, lcNumber: 24, lcSlug: 'swap-nodes-in-pairs', countryId: 'SY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SwapNodesInPairs' },

  // =================================================================
  // STAGE 12: Stack – Fundamentals (4 problems)
  // Pattern: Last-In-First-Out
  // Countries: Central Asia
  // INCLUDES 2 NEW BASIC PROBLEMS
  // =================================================================
  { id: 'stage12-1', title: 'Stack Push / Pop / Peek', route: '/stack/StackBasics', stage: 12, order: 1, lcNumber: null, lcSlug: null, countryId: 'TM', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage12-2', title: 'Stack Operations', route: '/stack/StackOperation', stage: 12, order: 2, lcNumber: null, lcSlug: null, countryId: 'UZ', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'StackOperations' },
  { id: 'stage12-3', title: 'Valid Parentheses', route: '/stack/ValidParentheses', stage: 12, order: 3, lcNumber: 20, lcSlug: 'valid-parentheses', countryId: 'TJ', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage12-4', title: 'Min Stack', route: '/design/MinStack', stage: 12, order: 4, lcNumber: 155, lcSlug: 'min-stack', countryId: 'KG', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MinStack' },

  // =================================================================
  // STAGE 13: Stack – Applications (4 problems)
  // Pattern: Monotonic Stack
  // Countries: Kazakhstan + Afghanistan + Pakistan + India
  // =================================================================
  { id: 'stage13-1', title: 'Next Greater Element', route: '/stack/NextGreaterElement', stage: 13, order: 1, lcNumber: 496, lcSlug: 'next-greater-element-i', countryId: 'KZ', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'NextGreaterElement' },
  { id: 'stage13-2', title: 'Remove K Digits', route: '/stack/RemoveKDigits', stage: 13, order: 2, lcNumber: 402, lcSlug: 'remove-k-digits', countryId: 'AF', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'RemoveKDigits' },
  { id: 'stage13-3', title: 'Largest Rectangle in Histogram', route: '/stack/LargestRectangleHistogram', stage: 13, order: 3, lcNumber: 84, lcSlug: 'largest-rectangle-in-histogram', countryId: 'PK', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'LargestRectangleHistogram' },
  { id: 'stage13-4', title: 'Sum of Subarray Ranges (Stack)', route: '/stack/SubarrayRangesStack', stage: 13, order: 4, lcNumber: 2104, lcSlug: 'sum-of-subarray-ranges', countryId: 'IN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SubarrayRangesStack', note: 'Monotonic stack application' },

  // =================================================================
  // STAGE 14: Queue (4 problems)
  // Pattern: First-In-First-Out
  // Countries: South Asia (Nepal, Bangladesh, Sri Lanka, Myanmar)
  // INCLUDES 1 NEW BASIC PROBLEM
  // =================================================================
  { id: 'stage14-1', title: 'Queue using Array (Enqueue/Dequeue)', route: '/queue/QueueBasics', stage: 14, order: 1, lcNumber: null, lcSlug: null, countryId: 'NP', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage14-2', title: 'Basic Queue', route: '/queue/BasicQueue', stage: 14, order: 2, lcNumber: null, lcSlug: null, countryId: 'BD', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'BasicQueue' },
  { id: 'stage14-3', title: 'Circular Queue', route: '/queue/CircularQueue', stage: 14, order: 3, lcNumber: 622, lcSlug: 'design-circular-queue', countryId: 'LK', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'CircularQueue' },
  { id: 'stage14-4', title: 'Implement Queue using Stacks', route: '/queue/QueueUsingStacks', stage: 14, order: 4, lcNumber: 232, lcSlug: 'implement-queue-using-stacks', countryId: 'MM', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'QueueUsingStacks' },

  // =================================================================
  // STAGE 15: Sorting (8 problems)
  // Pattern: Ordering & Comparison
  // Countries: Southeast Asia
  // =================================================================
  { id: 'stage15-1', title: 'Quadratic Sorting (Bubble, Selection, Insertion)', route: '/sorting/QuadraticSorting', stage: 15, order: 1, lcNumber: null, lcSlug: null, countryId: 'TH', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'QuadraticSorting', note: 'Compressed: O(n²) algorithms' },
  { id: 'stage15-2', title: 'Efficient Sorting (Merge, Quick, Heap)', route: '/sorting/EfficientSorting', stage: 15, order: 2, lcNumber: 912, lcSlug: 'sort-an-array', countryId: 'VN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'EfficientSorting', note: 'Compressed: O(n log n) algorithms' },
  { id: 'stage15-3', title: 'Counting Sort', route: '/sorting/CountingSort', stage: 15, order: 3, lcNumber: null, lcSlug: null, countryId: 'LA', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'CountingSort' },
  { id: 'stage15-4', title: 'Radix Sort', route: '/sorting/RadixSort', stage: 15, order: 4, lcNumber: null, lcSlug: null, countryId: 'KH', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'RadixSort' },
  { id: 'stage15-5', title: 'Bucket Sort', route: '/sorting/BucketSort', stage: 15, order: 5, lcNumber: null, lcSlug: null, countryId: 'MY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'BucketSort' },
  { id: 'stage15-6', title: 'Shell Sort', route: '/sorting/ShellSort', stage: 15, order: 6, lcNumber: null, lcSlug: null, countryId: 'SG', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ShellSort' },
  { id: 'stage15-7', title: 'Comb Sort', route: '/sorting/CombSort', stage: 15, order: 7, lcNumber: null, lcSlug: null, countryId: 'BN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'CombSort' },
  { id: 'stage15-8', title: 'Pancake Sort', route: '/sorting/PancakeSort', stage: 15, order: 8, lcNumber: 969, lcSlug: 'pancake-sorting', countryId: 'ID', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'PancakeSort' },

  // =================================================================
  // STAGE 16: Heaps & Priority Queues (4 problems)
  // Pattern: Heap Property Maintenance
  // Countries: Philippines + Taiwan + East Timor + Papua New Guinea
  // =================================================================
  { id: 'stage16-1', title: 'Heapify (Build Heap)', route: '/heaps/Heapify', stage: 16, order: 1, lcNumber: null, lcSlug: null, countryId: 'PH', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Heapify' },
  { id: 'stage16-2', title: 'Top K Frequent Elements', route: '/heaps/TopKFrequent', stage: 16, order: 2, lcNumber: 347, lcSlug: 'top-k-frequent-elements', countryId: 'TW', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'TopKFrequent' },
  { id: 'stage16-3', title: 'Task Scheduler', route: '/heaps/TaskScheduler', stage: 16, order: 3, lcNumber: 621, lcSlug: 'task-scheduler', countryId: 'TL', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'TaskScheduler' },
  { id: 'stage16-4', title: 'Maximum Gap', route: '/arrays/MaximumGap', stage: 16, order: 4, lcNumber: 164, lcSlug: 'maximum-gap', countryId: 'PG', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MaximumGap' },

  // =================================================================
  // STAGE 17: Trees – Construction (5 problems)
  // Pattern: Hierarchical Construction
  // Countries: China + Mongolia + Korea + Japan
  // INCLUDES 4 NEW BASIC PROBLEMS
  // =================================================================
  { id: 'stage17-1', title: 'Build Binary Tree (Level Order)', route: '/trees/BuildBinaryTree', stage: 17, order: 1, lcNumber: null, lcSlug: null, countryId: 'MN', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage17-2', title: 'Search in Binary Tree', route: '/trees/SearchBinaryTree', stage: 17, order: 2, lcNumber: null, lcSlug: null, countryId: 'KP', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage17-3', title: 'Insert in Binary Search Tree', route: '/trees/InsertBST', stage: 17, order: 3, lcNumber: null, lcSlug: null, countryId: 'KR', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage17-4', title: 'Search in Binary Search Tree', route: '/trees/SearchBST', stage: 17, order: 4, lcNumber: null, lcSlug: null, countryId: 'JP', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage17-5', title: 'Construct Binary Tree from Preorder and Inorder', route: '/trees/ConstructBinaryTree', stage: 17, order: 5, lcNumber: 105, lcSlug: 'construct-binary-tree-from-preorder-and-inorder-traversal', countryId: 'CN', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ConstructBinaryTree' },

  // =================================================================
  // STAGE 18: Trees – Traversals & Properties (5 problems)
  // Pattern: Recursive Tree Processing
  // Countries: Russia (west) + Eastern Europe
  // =================================================================
  { id: 'stage18-1', title: 'Morris Traversal (Inorder)', route: '/trees/MorrisTraversal', stage: 18, order: 1, lcNumber: 94, lcSlug: 'binary-tree-inorder-traversal', countryId: 'BY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MorrisTraversal' },
  { id: 'stage18-2', title: 'Validate Binary Search Tree', route: '/trees/ValidateBST', stage: 18, order: 2, lcNumber: 98, lcSlug: 'validate-binary-search-tree', countryId: 'UA', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ValidateBST' },
  { id: 'stage18-3', title: 'AVL Tree Visualizer', route: '/trees/AVLTree', stage: 18, order: 3, lcNumber: 110, lcSlug: 'balanced-binary-tree', countryId: 'PL', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'AVLTree' },
  { id: 'stage18-4', title: 'Symmetric Tree', route: '/trees/SymmetricTreeVisualizer', stage: 18, order: 4, lcNumber: 101, lcSlug: 'symmetric-tree', countryId: 'MD', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'SymmetricTree' },
  { id: 'stage18-5', title: 'Implement Trie (Prefix Tree)', route: '/design/ImplementTrie', stage: 18, order: 5, lcNumber: 208, lcSlug: 'implement-trie-prefix-tree', countryId: 'RO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ImplementTrie' },

  // =================================================================
  // STAGE 19: Trees – Views & Transformations (4 problems)
  // Pattern: Level-wise & Path Processing
  // Countries: Central Europe (Balkans + Hungary + Czech)
  // =================================================================
  { id: 'stage19-1', title: 'Binary Tree Right Side View', route: '/trees/BinaryTreeRightSideView', stage: 19, order: 1, lcNumber: 199, lcSlug: 'binary-tree-right-side-view', countryId: 'HU', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'BinaryTreeRightSideView' },
  { id: 'stage19-2', title: 'Print Binary Tree', route: '/trees/PrintBinaryTree', stage: 19, order: 2, lcNumber: 655, lcSlug: 'print-binary-tree', countryId: 'CZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'PrintBinaryTree' },
  { id: 'stage19-3', title: 'LCA of Deepest Leaves', route: '/trees/LCAofDeepestLeaves', stage: 19, order: 3, lcNumber: 1123, lcSlug: 'lowest-common-ancestor-of-deepest-leaves', countryId: 'SK', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LCAofDeepestLeaves' },
  { id: 'stage19-4', title: 'Flatten Binary Tree to Linked List', route: '/trees/FlattenBinaryTree', stage: 19, order: 4, lcNumber: 114, lcSlug: 'flatten-binary-tree-to-linked-list', countryId: 'AT', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FlattenBinaryTree' },

  // =================================================================
  // STAGE 20: Graphs & Grids (9 problems)
  // Pattern: Graph Traversal (BFS/DFS)
  // Countries: Scandinavia + UK + Western Europe
  // =================================================================
  { id: 'stage20-1', title: 'DFS (Graph)', route: '/graphs/DFS', stage: 20, order: 1, lcNumber: null, lcSlug: null, countryId: 'NO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'DFS' },
  { id: 'stage20-2', title: 'BFS (Graph)', route: '/graphs/BFS', stage: 20, order: 2, lcNumber: null, lcSlug: null, countryId: 'SE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'BFS' },
  { id: 'stage20-3', title: 'Number of Islands', route: '/pathfinding/ColorIslands', stage: 20, order: 3, lcNumber: 200, lcSlug: 'number-of-islands', countryId: 'FI', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'ColorIslands' },
  { id: 'stage20-4', title: 'Flood Fill', route: '/pathfinding/FloodFill', stage: 20, order: 4, lcNumber: 733, lcSlug: 'flood-fill', countryId: 'DK', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'FloodFill' },
  { id: 'stage20-5', title: "Dijkstra's Algorithm", route: '/graphs/Dijkstra', stage: 20, order: 5, lcNumber: null, lcSlug: null, countryId: 'NL', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Dijkstra' },
  { id: 'stage20-6', title: 'Topological Sort', route: '/graphs/TopologicalSort', stage: 20, order: 6, lcNumber: 207, lcSlug: 'course-schedule', countryId: 'BE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'TopologicalSort' },
  { id: 'stage20-7', title: "Kruskal's MST", route: '/graphs/Kruskal', stage: 20, order: 7, lcNumber: null, lcSlug: null, countryId: 'DE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Kruskal' },
  { id: 'stage20-8', title: 'A* Pathfinding', route: '/pathfinding/AStar', stage: 20, order: 8, lcNumber: null, lcSlug: null, countryId: 'FR', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'AStar' },
  { id: 'stage20-9', title: 'Network Flow (Edmonds-Karp/Dinic)', route: '/graphs/NetworkFlow', stage: 20, order: 9, lcNumber: null, lcSlug: null, countryId: 'GB', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'NetworkFlow' },

  // =================================================================
  // STAGE 21: Recursion & Backtracking (13 problems)
  // Pattern: Explore-Backtrack
  // Countries: Spain, Portugal, Italy, Balkans, Greece
  // INCLUDES 1 NEW BASIC PROBLEM
  // =================================================================
  { id: 'stage21-1', title: 'Recursion Call Stack Visualization', route: '/recursion/CallStackVisualization', stage: 21, order: 1, lcNumber: null, lcSlug: null, countryId: 'PT', difficulty: Difficulty.EASY, hasVisualizer: false, isNew: true },
  { id: 'stage21-2', title: 'Fibonacci', route: '/recursion/Fibonacci', stage: 21, order: 2, lcNumber: 509, lcSlug: 'fibonacci-number', countryId: 'ES', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'Fibonacci' },
  { id: 'stage21-3', title: 'Factorial', route: '/recursion/Factorial', stage: 21, order: 3, lcNumber: null, lcSlug: null, countryId: 'IT', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'Factorial' },
  { id: 'stage21-4', title: 'Binary Search (Recursive)', route: '/recursion/BinarySearchRecursive', stage: 21, order: 4, lcNumber: 704, lcSlug: 'binary-search', countryId: 'CH', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'BinarySearchRecursive' },
  { id: 'stage21-5', title: 'Tower of Hanoi', route: '/recursion/TowerOfHanoi', stage: 21, order: 5, lcNumber: null, lcSlug: null, countryId: 'SI', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'TowerOfHanoi' },
  { id: 'stage21-6', title: 'Subset Sum', route: '/recursion/SubsetSum', stage: 21, order: 6, lcNumber: null, lcSlug: null, countryId: 'HR', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'SubsetSum' },
  { id: 'stage21-7', title: 'Permutations', route: '/backtracking/Permutations', stage: 21, order: 7, lcNumber: 46, lcSlug: 'permutations', countryId: 'BA', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Permutations' },
  { id: 'stage21-8', title: 'N-Queens', route: '/backtracking/NQueens', stage: 21, order: 8, lcNumber: 51, lcSlug: 'n-queens', countryId: 'RS', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'NQueens' },
  { id: 'stage21-9', title: 'Rat in a Maze', route: '/pathfinding/RatInMaze', stage: 21, order: 9, lcNumber: null, lcSlug: null, countryId: 'ME', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'RatInMaze' },
  { id: 'stage21-10', title: 'Word Search', route: '/backtracking/WordSearch', stage: 21, order: 10, lcNumber: 79, lcSlug: 'word-search', countryId: 'AL', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'WordSearch' },
  { id: 'stage21-11', title: 'Sudoku Solver', route: '/backtracking/SudokuSolver', stage: 21, order: 11, lcNumber: 37, lcSlug: 'sudoku-solver', countryId: 'MK', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'SudokuSolver' },
  { id: 'stage21-12', title: 'Expression Add Operators', route: '/backtracking/ExpressionAddOperators', stage: 21, order: 12, lcNumber: 282, lcSlug: 'expression-add-operators', countryId: 'GR', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'ExpressionAddOperators' },
  { id: 'stage21-13', title: "Knight's Tour", route: '/backtracking/KnightsTour', stage: 21, order: 13, lcNumber: null, lcSlug: null, countryId: 'BG', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'KnightsTour' },

  // =================================================================
  // STAGE 22: Dynamic Programming (9 problems)
  // Pattern: Optimal Substructure
  // Countries: Baltic States + Iceland + Greenland + North America
  // =================================================================
  { id: 'stage22-1', title: 'Unique Paths', route: '/dynamic-programming/UniquePaths', stage: 22, order: 1, lcNumber: 62, lcSlug: 'unique-paths', countryId: 'EE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'UniquePaths' },
  { id: 'stage22-2', title: '0/1 Knapsack', route: '/dynamic-programming/KnapSack', stage: 22, order: 2, lcNumber: 416, lcSlug: 'partition-equal-subset-sum', countryId: 'LV', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'KnapSack' },
  { id: 'stage22-3', title: 'Coin Change', route: '/dynamic-programming/CoinChange', stage: 22, order: 3, lcNumber: 322, lcSlug: 'coin-change', countryId: 'LT', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'CoinChange' },
  { id: 'stage22-4', title: 'Longest Increasing Subsequence', route: '/dynamic-programming/LISubsequence', stage: 22, order: 4, lcNumber: 300, lcSlug: 'longest-increasing-subsequence', countryId: 'IE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LISubsequence' },
  { id: 'stage22-5', title: 'Longest Common Subsequence', route: '/dynamic-programming/LongestCommonSubsequence', stage: 22, order: 5, lcNumber: 1143, lcSlug: 'longest-common-subsequence', countryId: 'IS', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LongestCommonSubsequence' },
  { id: 'stage22-6', title: 'Edit Distance', route: '/dynamic-programming/EditDistance', stage: 22, order: 6, lcNumber: 72, lcSlug: 'edit-distance', countryId: 'GL', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'EditDistance' },
  { id: 'stage22-7', title: 'Burst Balloons', route: '/dynamic-programming/BurstBalloons', stage: 22, order: 7, lcNumber: 312, lcSlug: 'burst-balloons', countryId: 'CA', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'BurstBalloons' },
  { id: 'stage22-8', title: 'Burst Balloons (Top Down)', route: '/dynamic-programming/BurstBalloonsTopDown', stage: 22, order: 8, lcNumber: 312, lcSlug: 'burst-balloons', countryId: 'US', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'BurstBalloonsTopDown' },
  { id: 'stage22-9', title: 'Best Time to Buy and Sell Stock IV', route: '/dynamic-programming/SellStockIV', stage: 22, order: 9, lcNumber: 188, lcSlug: 'best-time-to-buy-and-sell-stock-iv', countryId: 'RU', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'SellStockIV' },

  // =================================================================
  // STAGE 23: Greedy Algorithms (8 problems)
  // Pattern: Greedy Choice Property
  // Countries: Australia + Oceania
  // =================================================================
  { id: 'stage23-1', title: 'Best Time to Buy and Sell Stock', route: '/greedy/BestTimeStock', stage: 23, order: 1, lcNumber: 121, lcSlug: 'best-time-to-buy-and-sell-stock', countryId: 'AU', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'BestTimeStock' },
  { id: 'stage23-2', title: 'Best Time to Buy and Sell Stock II', route: '/greedy/BestTimeStockII', stage: 23, order: 2, lcNumber: 122, lcSlug: 'best-time-to-buy-and-sell-stock-ii', countryId: 'NZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'BestTimeStockII' },
  { id: 'stage23-3', title: 'Assign Cookies', route: '/greedy/AssignCookies', stage: 23, order: 3, lcNumber: 455, lcSlug: 'assign-cookies', countryId: 'FJ', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'AssignCookies' },
  { id: 'stage23-4', title: 'Two City Scheduling', route: '/greedy/TwoCityScheduling', stage: 23, order: 4, lcNumber: 1029, lcSlug: 'two-city-scheduling', countryId: 'VU', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'TwoCityScheduling' },
  { id: 'stage23-5', title: 'Maximum Profit in Job Scheduling', route: '/greedy/JobScheduling', stage: 23, order: 5, lcNumber: 1235, lcSlug: 'maximum-profit-in-job-scheduling', countryId: 'NC', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'JobScheduling' },
  { id: 'stage23-6', title: 'Merge Intervals', route: '/arrays/MergeIntervals', stage: 23, order: 6, lcNumber: 56, lcSlug: 'merge-intervals', countryId: 'SB', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'MergeIntervals' },
  { id: 'stage23-7', title: 'Jump Game II', route: '/greedy/JumpGameII', stage: 23, order: 7, lcNumber: 45, lcSlug: 'jump-game-ii', countryId: 'WS', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'JumpGameII' },
  { id: 'stage23-8', title: 'Gas Station', route: '/greedy/GasStation', stage: 23, order: 8, lcNumber: 134, lcSlug: 'gas-station', countryId: 'TO', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'GasStation' },

  // =================================================================
  // STAGE 24: Design & Systems (4 problems)
  // Pattern: System Design
  // Countries: East Africa (Kenya, Uganda, Tanzania, Rwanda)
  // =================================================================
  { id: 'stage24-1', title: 'Design HashMap', route: '/design/DesignHashMap', stage: 24, order: 1, lcNumber: 706, lcSlug: 'design-hashmap', countryId: 'KE', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'DesignHashMap' },
  { id: 'stage24-2', title: 'Design Linked List', route: '/design/DesignLinkedList', stage: 24, order: 2, lcNumber: 707, lcSlug: 'design-linked-list', countryId: 'UG', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'DesignLinkedList' },
  { id: 'stage24-3', title: 'LRU Cache', route: '/design/LRUCache', stage: 24, order: 3, lcNumber: 146, lcSlug: 'lru-cache', countryId: 'TZ', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LRUCache' },
  { id: 'stage24-4', title: 'LFU Cache', route: '/design/LFUCache', stage: 24, order: 4, lcNumber: 460, lcSlug: 'lfu-cache', countryId: 'RW', difficulty: Difficulty.HARD, hasVisualizer: true, component: 'LFUCache' },

  // =================================================================
  // BONUS STAGE A: Bit Manipulation (5 problems)
  // Pattern: Binary Representation
  // Countries: Caribbean islands
  // =================================================================
  { id: 'bonusA-1', title: 'Single Number', route: '/bit-manipulation/SingleNumber', stage: 'A', order: 1, lcNumber: 136, lcSlug: 'single-number', countryId: 'PR', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'SingleNumber' },
  { id: 'bonusA-2', title: 'Number of 1 Bits', route: '/bit-manipulation/NumberOf1Bits', stage: 'A', order: 2, lcNumber: 191, lcSlug: 'number-of-1-bits', countryId: 'TT', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'NumberOf1Bits' },
  { id: 'bonusA-3', title: 'Counting Bits', route: '/bit-manipulation/CountingBits', stage: 'A', order: 3, lcNumber: 338, lcSlug: 'counting-bits', countryId: 'BB', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'CountingBits' },
  { id: 'bonusA-4', title: 'Reverse Bits', route: '/bit-manipulation/ReverseBits', stage: 'A', order: 4, lcNumber: 190, lcSlug: 'reverse-bits', countryId: 'LC', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ReverseBits' },
  { id: 'bonusA-5', title: 'Power of Two', route: '/bit-manipulation/PowerOfTwo', stage: 'A', order: 5, lcNumber: 231, lcSlug: 'power-of-two', countryId: 'VC', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'PowerOfTwo' },

  // =================================================================
  // BONUS STAGE B: Mathematical & Miscellaneous (5 problems)
  // Pattern: Mathematical Properties
  // Countries: Mediterranean islands
  // =================================================================
  { id: 'bonusB-1', title: 'Count Primes', route: '/maths/CountPrimes', stage: 'B', order: 1, lcNumber: 204, lcSlug: 'count-primes', countryId: 'CY', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'CountPrimes' },
  { id: 'bonusB-2', title: 'Excel Sheet Column Title', route: '/maths/ExcelSheetColumnTitle', stage: 'B', order: 2, lcNumber: 168, lcSlug: 'excel-sheet-column-title', countryId: 'MT', difficulty: Difficulty.EASY, hasVisualizer: true, component: 'ExcelSheetColumnTitle' },
  { id: 'bonusB-3', title: 'Factorial Trailing Zeroes', route: '/maths/FactorialZeroes', stage: 'B', order: 3, lcNumber: 172, lcSlug: 'factorial-trailing-zeroes', countryId: 'SC', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'FactorialZeroes' },
  { id: 'bonusB-4', title: 'Pow(x, n)', route: '/maths/Power', stage: 'B', order: 4, lcNumber: 50, lcSlug: 'powx-n', countryId: 'MU', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'Power' },
  { id: 'bonusB-5', title: 'Prime Palindrome', route: '/maths/PrimePalindrome', stage: 'B', order: 5, lcNumber: 866, lcSlug: 'prime-palindrome', countryId: 'MV', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'PrimePalindrome' },

  // =================================================================
  // BONUS STAGE C: Hashing Patterns (2 problems)
  // Pattern: Hash-based Optimization
  // Countries: Indian Ocean islands
  // =================================================================
  { id: 'bonusC-1', title: 'Longest Consecutive Sequence', route: '/hashing/LongestConsecutiveSequence', stage: 'C', order: 1, lcNumber: 128, lcSlug: 'longest-consecutive-sequence', countryId: 'KM', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'LongestConsecutiveSequence' },
  { id: 'bonusC-2', title: 'Equal Row and Column Pairs', route: '/hashing/EqualRowsColumnPair', stage: 'C', order: 2, lcNumber: 2352, lcSlug: 'equal-row-and-column-pairs', countryId: 'RE', difficulty: Difficulty.MEDIUM, hasVisualizer: true, component: 'EqualRowsColumnPair' },
];

// =============================================================================
// HELPER FUNCTIONS & LOOKUP MAPS
// =============================================================================

// O(1) lookup maps
export const problemByIdMap = new Map(ALL_PROBLEMS.map(p => [p.id, p]));
export const problemByCountryMap = new Map(ALL_PROBLEMS.map(p => [p.countryId, p]));
export const problemByLeetCodeMap = new Map(
  ALL_PROBLEMS.filter(p => p.lcNumber).map(p => [p.lcNumber, p])
);

// Get problem by ID
export const getProblemById = (id) => problemByIdMap.get(id) || null;

// Get problem by country code
export const getProblemByCountry = (countryId) => problemByCountryMap.get(countryId) || null;
export const getProblemForCountry = getProblemByCountry; // Alias for backward compatibility

// Get problem by LeetCode number
export const getProblemByLeetCode = (lcNumber) => problemByLeetCodeMap.get(lcNumber) || null;

// Get problems by stage
export const getProblemsByStage = (stage) => 
  ALL_PROBLEMS.filter(p => p.stage === stage).sort((a, b) => a.order - b.order);

// Check if country is mapped to a problem
export const isPlaceholderCountry = (countryId) => !problemByCountryMap.has(countryId);

// Get country for a problem
export const getCountryForProblem = (problemId) => {
  const problem = getProblemById(problemId);
  return problem ? problem.countryId : null;
};

// Generate LeetCode URL
export const getLeetCodeUrl = (lcSlug) => lcSlug ? `${LEETCODE_BASE_URL}/${lcSlug}` : null;

export const getLeetCodeUrlForProblem = (problemId) => {
  const problem = getProblemById(problemId);
  return problem?.lcSlug ? getLeetCodeUrl(problem.lcSlug) : null;
};

// Generate visualizer route
export const getVisualizerRoute = (problemId) => {
  const problem = getProblemById(problemId);
  return problem?.route || null;
};

// Get all new problems (without visualizers)
export const getNewProblems = () => ALL_PROBLEMS.filter(p => p.isNew);

// Get all problems with visualizers
export const getProblemsWithVisualizers = () => ALL_PROBLEMS.filter(p => p.hasVisualizer);

// Get all problems with LeetCode links
export const getProblemsWithLeetCode = () => ALL_PROBLEMS.filter(p => p.lcNumber);

// =============================================================================
// ROADMAP / PROGRESSION EXPORTS
// =============================================================================

// Stage order for progression
export const STAGE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 'A', 'B', 'C'];

// Full roadmap (flat array of all problems in learning order)
export const FULL_ROADMAP = [...ALL_PROBLEMS];

// Roadmap order (for backward compatibility - same as STAGE_ORDER)
export const ROADMAP_ORDER = STAGE_ORDER;

// All country IDs used in the roadmap
export const ALL_COUNTRY_IDS = ALL_PROBLEMS.map(p => p.countryId);

// Country <-> Problem mappings
export const PROBLEM_TO_COUNTRY = Object.fromEntries(
  ALL_PROBLEMS.map(p => [p.id, p.countryId])
);

export const COUNTRY_TO_PROBLEM = Object.fromEntries(
  ALL_PROBLEMS.map(p => [p.countryId, p.id])
);

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS (for useProgressStore.js)
// =============================================================================

// TOPICS - for backward compatibility with topic-based views
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

// getProblemsByTopic - for backward compatibility (maps to stage-based)
export const getProblemsByTopic = (topic) => {
  // This is a compatibility layer - in the new system, we use stages
  // Map old topic names to relevant stages
  const topicToStageMap = {
    arrays: [1, 2, 3, 4],
    strings: [6, 7],
    linkedlist: [10, 11],
    stack: [12, 13],
    queue: [14],
    sorting: [15],
    binarysearch: [8, 9],
    recursion: [21],
    trees: [17, 18, 19],
    graphs: [20],
    dp: [22],
    backtracking: [21],
    slidingwindows: [5],
    heaps: [16],
    hashing: ['C'],
    bitmanipulation: ['A'],
    greedy: [23],
    searching: [8, 9],
    design: [24],
    pathfinding: [20],
    maths: ['B'],
  };
  
  const stages = topicToStageMap[topic] || [];
  return stages.flatMap(s => getProblemsByStage(s));
};

// =============================================================================
// STATISTICS
// =============================================================================

export const STATS = {
  totalProblems: ALL_PROBLEMS.length,
  withVisualizer: ALL_PROBLEMS.filter(p => p.hasVisualizer).length,
  withoutVisualizer: ALL_PROBLEMS.filter(p => !p.hasVisualizer).length,
  withLeetCode: ALL_PROBLEMS.filter(p => p.lcNumber).length,
  withoutLeetCode: ALL_PROBLEMS.filter(p => !p.lcNumber).length,
  newBasicProblems: ALL_PROBLEMS.filter(p => p.isNew).length,
  mainStages: 24,
  bonusStages: 3,
  totalStages: 27,
};
