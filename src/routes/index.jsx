import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { categoryConfig } from "./config";
import CategoryPage from "../pages/CategoryPage";
import VisualizerPage from "../pages/VisualizerPage";

// Loading fallback component
const LoadingFallback = () => (
  <div className="home-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', color: 'var(--home-muted)' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Loading...</div>
    </div>
  </div>
);

// Helper to create visualizer routes with layout wrapper
const VisualizerRoute = ({ component: Component, title, category }) => {
  const config = categoryConfig[category];
  return (
    <VisualizerPage
      title={title}
      categoryName={config.title}
      categoryPath={config.path}
      icon={config.icon}
    >
      <Component />
    </VisualizerPage>
  );
};

// Lazy load all visualizer components
// SORTING
const BubbleSort = lazy(() => import("../pages/Sorting/BubbleSort"));
const MergeSort = lazy(() => import("../pages/Sorting/MergeSort"));
const QuickSort = lazy(() => import("../pages/Sorting/QuickSort"));
const InsertionSort = lazy(() => import("../pages/Sorting/InsertionSort"));
const RadixSort = lazy(() => import("../pages/Sorting/RadixSort"));
const CountingSort = lazy(() => import("../pages/Sorting/CountingSort"));
const HeapSort = lazy(() => import("../pages/Sorting/HeapSort"));
const SelectionSort = lazy(() => import("../pages/Sorting/SelectionSort"));
const CombSort = lazy(() => import("../pages/Sorting/CombSort"));
const BucketSort = lazy(() => import("../pages/Sorting/BucketSort"));
const ShellSort = lazy(() => import("../pages/Sorting/ShellSort"));
const PancakeSort = lazy(() => import("../pages/Sorting/PancakeSort"));

// ARRAYS
const TrappingRainWater = lazy(() => import("../pages/Arrays/TrappingRainWater"));
const ContainerWithMostWater = lazy(() => import("../pages/Arrays/ContainerWithMostWater"));
const MaxConsecutiveOnesIIIArrays = lazy(() => import("../pages/Arrays/MaxConsecutiveOnesIII"));
const SubarrayRangesArrays = lazy(() => import("../pages/Arrays/SubarrayRanges"));
const FindMaxElement = lazy(() => import("../pages/Arrays/FindMaxElement"));
const FindMinElement = lazy(() => import("../pages/Arrays/FindMinElement"));
const MoveZeros = lazy(() => import("../pages/Arrays/MoveZeros"));
const CountZeros = lazy(() => import("../pages/Arrays/CountZeros"));
const ArraySum = lazy(() => import("../pages/Arrays/ArraySum"));
const ReverseArray = lazy(() => import("../pages/Arrays/ReverseArray"));
const TwoSum = lazy(() => import("../pages/Arrays/TwoSum"));
const ThreeSum = lazy(() => import("../pages/Arrays/3Sum"));
const FourSum = lazy(() => import("../pages/Arrays/4-sum"));
const SplitArrayLargestSum = lazy(() => import("../pages/Arrays/SplitArrayLargestSum"));
const SquaresOfSortedArray = lazy(() => import("../pages/Arrays/SquaresOfSortedArray.tsx"));
const ProductOfArrayExceptSelf = lazy(() => import("../pages/Arrays/ProductOfArrayExceptSelf"));
const MaximumSubarray = lazy(() => import("../pages/Arrays/MaximumSubarray"));
const MergeIntervals = lazy(() => import("../pages/Arrays/MergeIntervals"));
const RotateArray = lazy(() => import("../pages/Arrays/RotateArray"));
const MaximumGap = lazy(() => import("../pages/Arrays/MaximumGap"));

// BINARY SEARCH
const BinarySearchBasic = lazy(() => import("../pages/BinarySearch/BinarySearchBasic"));
const FindFirstAndLastPosition = lazy(() => import("../pages/BinarySearch/FindFirstAndLastPosition"));
const FindMinimumInRotatedSortedArray = lazy(() => import("../pages/BinarySearch/FindMinimumInRotatedSortedArray"));
const FindPeakElement = lazy(() => import("../pages/BinarySearch/FindPeakElement"));
const MedianOfTwoSortedArrays = lazy(() => import("../pages/BinarySearch/MedianOfTwoSortedArrays"));
const MinSpeedToArriveOnTime = lazy(() => import("../pages/BinarySearch/MinSpeedToArriveOnTime"));
const PeakIndexInMountainArray = lazy(() => import("../pages/BinarySearch/PeakIndexInMountainArray"));
const Search2DMatrix = lazy(() => import("../pages/BinarySearch/Search2DMatrix"));
const SearchInRotatedSortedArray = lazy(() => import("../pages/BinarySearch/SearchInRotatedSortedArray"));

// GRAPHS
const BFSGraphs = lazy(() => import("../pages/Graphs/BFS"));
const DFSGraphs = lazy(() => import("../pages/Graphs/DFS"));
const Dijkstra = lazy(() => import("../pages/Graphs/Dijkstra"));
const TopologicalSort = lazy(() => import("../pages/Graphs/TopologicalSort"));
const Kruskal = lazy(() => import("../pages/Graphs/Kruskal"));
const NetworkFlow = lazy(() => import("../pages/Graphs/NetworkFlow"));

// TREES
const AVLTree = lazy(() => import("../pages/Trees/AVLTree"));
const BinaryTreeRightSideView = lazy(() => import("../pages/Trees/BinaryTreeRightSideView"));
const ConstructBinaryTree = lazy(() => import("../pages/Trees/ConstructBinaryTree"));
const FlattenBinaryTree = lazy(() => import("../pages/Trees/FlattenBinaryTree"));
const LCAofDeepestLeaves = lazy(() => import("../pages/Trees/LCAofDeepestLeaves"));
const MorrisTraversal = lazy(() => import("../pages/Trees/MorrisTraversal"));
const PrintBinaryTree = lazy(() => import("../pages/Trees/PrintBinaryTree"));
const SymmetricTreeVisualizer = lazy(() => import("../pages/Trees/SymmetricTreeVisualizer"));
const ValidateBST = lazy(() => import("../pages/Trees/ValidateBST"));

// STACK
const LargestRectangleHistogram = lazy(() => import("../pages/Stack/LargestRectangleHistogram"));
const NextGreaterElement = lazy(() => import("../pages/Stack/NextGreaterElement"));
const PermutationStack = lazy(() => import("../pages/Stack/Permutation"));
const RemoveKDigits = lazy(() => import("../pages/Stack/RemoveKDigits"));
const StackOperation = lazy(() => import("../pages/Stack/StackOperstion"));
const SubarrayRangesStack = lazy(() => import("../pages/Stack/SubarrayRanges"));

// LINKED LIST
const LinkedListCycle = lazy(() => import("../pages/LinkedList/LinkedListCycle"));
const MergeTwoSortedLists = lazy(() => import("../pages/LinkedList/MergeTwoSortedLists"));
const ReverseLinkedList = lazy(() => import("../pages/LinkedList/ReverseLinkedList"));
const SortList = lazy(() => import("../pages/LinkedList/SortList"));
const SwapPairs = lazy(() => import("../pages/LinkedList/SwapPairs"));

// DYNAMIC PROGRAMMING
const BurstBalloons = lazy(() => import("../pages/DynamicProgramming/BurstBalloons"));
const CoinChange = lazy(() => import("../pages/DynamicProgramming/CoinChange"));
const EditDistance = lazy(() => import("../pages/DynamicProgramming/EditDistance"));
const KnapSack = lazy(() => import("../pages/DynamicProgramming/KnapSack"));
const LISubsequence = lazy(() => import("../pages/DynamicProgramming/LISubsequence"));
const LongestCommonSubsequence = lazy(() => import("../pages/DynamicProgramming/LongestCommonSubsequence"));
const SellStockIV = lazy(() => import("../pages/DynamicProgramming/SellStockIVVisualizer"));
const UniquePaths = lazy(() => import("../pages/DynamicProgramming/UniquePaths"));

// SLIDING WINDOWS
const FruitsIntoBaskets = lazy(() => import("../pages/SlidingWindows/FruitsIntoBaskets"));
const LongestSubstring = lazy(() => import("../pages/SlidingWindows/LongestSubstring"));
const MaxConsecutiveOnesIII = lazy(() => import("../pages/SlidingWindows/MaxConsecutiveOnesIII"));
const MinimumWindow = lazy(() => import("../pages/SlidingWindows/MinimumWindow"));
const SlidingWindowMaximum = lazy(() => import("../pages/SlidingWindows/SlidingWindowMaximum"));

// BACKTRACKING
const ExpressionAddOperators = lazy(() => import("../pages/Backtracking/ExpressionAddOperators"));
const KnightsTour = lazy(() => import("../pages/Backtracking/KnightsTour"));
const Permutations = lazy(() => import("../pages/Backtracking/Permutations"));
const SudokuSolver = lazy(() => import("../pages/Backtracking/SudokuSolver"));
const WordSearch = lazy(() => import("../pages/Backtracking/WordSearch"));

// STRINGS
const CountVowels = lazy(() => import("../pages/Strings/CountVowels"));
const IsSubSequence = lazy(() => import("../pages/Strings/IsSubSequence"));
const LongestCP = lazy(() => import("../pages/Strings/LongestCP"));
const PalindromeCheck = lazy(() => import("../pages/Strings/PalindromeCheck"));
const ReverseString = lazy(() => import("../pages/Strings/ReverseString"));
const ReverseWords = lazy(() => import("../pages/Strings/ReverseWords"));
const StringCompression = lazy(() => import("../pages/Strings/StringCompression"));
const ValidAnagramStrings = lazy(() => import("../pages/Strings/ValidAnagram"));

// QUEUE
const BasicQueue = lazy(() => import("../pages/Queue/BasicQueue"));
const CircularQueue = lazy(() => import("../pages/Queue/CircularQueue"));
const QueueUsingStacks = lazy(() => import("../pages/Queue/QueueUsingStacks"));

// HEAPS
const Heapify = lazy(() => import("../pages/Heaps/Heapify"));
const TaskScheduler = lazy(() => import("../pages/Heaps/TaskScheduler"));
const TopKFrequent = lazy(() => import("../pages/Heaps/TopKFrequentVisualizer"));

// HASHING
const EqualRowsColumnPair = lazy(() => import("../pages/Hashing/EqualRowsColumnPair"));
const LongestConsecutiveSequence = lazy(() => import("../pages/Hashing/LongestConsecutiveSequence"));
const SubarraySumEqualsK = lazy(() => import("../pages/Hashing/SubarraySumEqualsK"));
const ValidAnagramHashing = lazy(() => import("../pages/Hashing/ValidAnagram"));

// RECURSION
const BinarySearchRecursive = lazy(() => import("../pages/Recursion/BinarySearchRecursive"));
const Factorial = lazy(() => import("../pages/Recursion/Factorial"));
const Fibonacci = lazy(() => import("../pages/Recursion/Fibonacci"));
const NQueens = lazy(() => import("../pages/Recursion/NQueens"));
const SubsetSum = lazy(() => import("../pages/Recursion/SubsetSum"));
const TowerOfHanoi = lazy(() => import("../pages/Recursion/TowerOfHanoi"));

// BIT MANIPULATION
const CountingBits = lazy(() => import("../pages/BitManipulation/CountingBits"));
const NumberOf1Bits = lazy(() => import("../pages/BitManipulation/NumberOf1Bits"));
const PowerOfTwo = lazy(() => import("../pages/BitManipulation/PowerOfTwo"));
const ReverseBits = lazy(() => import("../pages/BitManipulation/ReverseBits"));
const SingleNumber = lazy(() => import("../pages/BitManipulation/SingleNumber"));

// GREEDY
const AssignCookies = lazy(() => import("../pages/GreedyAlgorithms/AssignCookies"));
const BestTimeStockII = lazy(() => import("../pages/GreedyAlgorithms/BestTimeStockII"));
const JobScheduling = lazy(() => import("../pages/GreedyAlgorithms/JobScheduling"));
const TwoCityScheduling = lazy(() => import("../pages/GreedyAlgorithms/TwoCityScheduling"));

// MATHS
const CountPrimes = lazy(() => import("../pages/MathematicalMiscellaneous/CountPrimes"));
const ExcelSheetColumnTitle = lazy(() => import("../pages/MathematicalMiscellaneous/ExcelSheetColumnTitle"));
const FactorialZeroes = lazy(() => import("../pages/MathematicalMiscellaneous/FactorialZeroes"));
const Power = lazy(() => import("../pages/MathematicalMiscellaneous/Power"));
const PrimePalindrome = lazy(() => import("../pages/MathematicalMiscellaneous/PrimePalindrome"));

// SEARCHING
const ExponentialSearch = lazy(() => import("../pages/Searching/ExponentialSearch"));
const KthMissingNumber = lazy(() => import("../pages/Searching/KthMissingNumber"));
const LinearSearch = lazy(() => import("../pages/Searching/LinearSearch"));
const SmallestLetter = lazy(() => import("../pages/Searching/SmallestLetter"));
const SpecialArray = lazy(() => import("../pages/Searching/specialArray"));
const UnknownSizeSearch = lazy(() => import("../pages/Searching/UnknownSizeSearch"));

// DESIGN
const DesignHashMap = lazy(() => import("../pages/Design/DesignHashMap"));
const DesignLinkedList = lazy(() => import("../pages/Design/DesignLinkedList"));
const ImplementTrie = lazy(() => import("../pages/Design/ImplementTrie"));
const LFUCache = lazy(() => import("../pages/Design/LFUCache"));
const LRUCache = lazy(() => import("../pages/Design/LRUCache"));
const MinStack = lazy(() => import("../pages/Design/MinStack"));

// PATHFINDING
const AStarPathfinding = lazy(() => import("../pages/Pathfinding/AStar"));
const BFSPathfinding = lazy(() => import("../pages/Pathfinding/BFS"));
const ColorIslands = lazy(() => import("../pages/Pathfinding/ColorIslands"));
const FloodFill = lazy(() => import("../pages/Pathfinding/FloodFill"));
const RatInMaze = lazy(() => import("../pages/Pathfinding/RatInMaze"));

/**
 * AppRoutes - All application routes
 */
const AppRoutes = () => {
  const { sorting, arrays, binarysearch, strings, searching, hashing, linkedlist,
    recursion, bitmanipulation, stack, queue, slidingwindows, heaps, trees,
    graphs, pathfinding, greedy, backtracking, dp, design, maths } = categoryConfig;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* SORTING */}
        <Route path={sorting.path} element={
          <CategoryPage {...sorting} basePath={sorting.path} categoryKey={sorting.key} />
        } />
        <Route path={`${sorting.path}/BubbleSort`} element={<VisualizerRoute component={BubbleSort} title="Bubble Sort" category="sorting" />} />
        <Route path={`${sorting.path}/MergeSort`} element={<VisualizerRoute component={MergeSort} title="Merge Sort" category="sorting" />} />
        <Route path={`${sorting.path}/QuickSort`} element={<VisualizerRoute component={QuickSort} title="Quick Sort" category="sorting" />} />
        <Route path={`${sorting.path}/InsertionSort`} element={<VisualizerRoute component={InsertionSort} title="Insertion Sort" category="sorting" />} />
        <Route path={`${sorting.path}/RadixSort`} element={<VisualizerRoute component={RadixSort} title="Radix Sort" category="sorting" />} />
        <Route path={`${sorting.path}/CountingSort`} element={<VisualizerRoute component={CountingSort} title="Counting Sort" category="sorting" />} />
        <Route path={`${sorting.path}/HeapSort`} element={<VisualizerRoute component={HeapSort} title="Heap Sort" category="sorting" />} />
        <Route path={`${sorting.path}/SelectionSort`} element={<VisualizerRoute component={SelectionSort} title="Selection Sort" category="sorting" />} />
        <Route path={`${sorting.path}/CombSort`} element={<VisualizerRoute component={CombSort} title="Comb Sort" category="sorting" />} />
        <Route path={`${sorting.path}/BucketSort`} element={<VisualizerRoute component={BucketSort} title="Bucket Sort" category="sorting" />} />
        <Route path={`${sorting.path}/ShellSort`} element={<VisualizerRoute component={ShellSort} title="Shell Sort" category="sorting" />} />
        <Route path={`${sorting.path}/PancakeSort`} element={<VisualizerRoute component={PancakeSort} title="Pancake Sort" category="sorting" />} />

        {/* ARRAYS */}
        <Route path={arrays.path} element={
          <CategoryPage {...arrays} basePath={arrays.path} categoryKey={arrays.key} />
        } />
        <Route path={`${arrays.path}/TrappingRainWater`} element={<VisualizerRoute component={TrappingRainWater} title="Trapping Rain Water" category="arrays" />} />
        <Route path={`${arrays.path}/ContainerWithMostWater`} element={<VisualizerRoute component={ContainerWithMostWater} title="Container With Most Water" category="arrays" />} />
        <Route path={`${arrays.path}/MaxConsecutiveOnesIII`} element={<VisualizerRoute component={MaxConsecutiveOnesIIIArrays} title="Max Consecutive Ones III" category="arrays" />} />
        <Route path={`${arrays.path}/SubarrayRanges`} element={<VisualizerRoute component={SubarrayRangesArrays} title="Subarray Ranges" category="arrays" />} />
        <Route path={`${arrays.path}/FindMaxElement`} element={<VisualizerRoute component={FindMaxElement} title="Find Max Element" category="arrays" />} />
        <Route path={`${arrays.path}/FindMinElement`} element={<VisualizerRoute component={FindMinElement} title="Find Min Element" category="arrays" />} />
        <Route path={`${arrays.path}/MoveZeros`} element={<VisualizerRoute component={MoveZeros} title="Move Zeros" category="arrays" />} />
        <Route path={`${arrays.path}/CountZeros`} element={<VisualizerRoute component={CountZeros} title="Count Zeros" category="arrays" />} />
        <Route path={`${arrays.path}/ArraySum`} element={<VisualizerRoute component={ArraySum} title="Array Sum" category="arrays" />} />
        <Route path={`${arrays.path}/ReverseArray`} element={<VisualizerRoute component={ReverseArray} title="Reverse Array" category="arrays" />} />
        <Route path={`${arrays.path}/TwoSum`} element={<VisualizerRoute component={TwoSum} title="Two Sum" category="arrays" />} />
        <Route path={`${arrays.path}/ThreeSum`} element={<VisualizerRoute component={ThreeSum} title="3Sum" category="arrays" />} />
        <Route path={`${arrays.path}/4-Sum`} element={<VisualizerRoute component={FourSum} title="4Sum" category="arrays" />} />
        <Route path={`${arrays.path}/SplitArrayLargestSum`} element={<VisualizerRoute component={SplitArrayLargestSum} title="Split Array Largest Sum" category="arrays" />} />
        <Route path={`${arrays.path}/SquaresOfSortedArray`} element={<VisualizerRoute component={SquaresOfSortedArray} title="Squares of Sorted Array" category="arrays" />} />
        <Route path={`${arrays.path}/ProductOfArrayExceptSelf`} element={<VisualizerRoute component={ProductOfArrayExceptSelf} title="Product of Array Except Self" category="arrays" />} />
        <Route path={`${arrays.path}/MaximumSubarray`} element={<VisualizerRoute component={MaximumSubarray} title="Maximum Subarray" category="arrays" />} />
        <Route path={`${arrays.path}/MergeIntervals`} element={<VisualizerRoute component={MergeIntervals} title="Merge Intervals" category="arrays" />} />
        <Route path={`${arrays.path}/RotateArray`} element={<VisualizerRoute component={RotateArray} title="Rotate Array" category="arrays" />} />
        <Route path={`${arrays.path}/MaximumGap`} element={<VisualizerRoute component={MaximumGap} title="Maximum Gap" category="arrays" />} />

        {/* BINARY SEARCH */}
        <Route path={binarysearch.path} element={
          <CategoryPage {...binarysearch} basePath={binarysearch.path} categoryKey={binarysearch.key} />
        } />
        <Route path={`${binarysearch.path}/BinarySearchBasic`} element={<VisualizerRoute component={BinarySearchBasic} title="Binary Search" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/FindFirstAndLastPosition`} element={<VisualizerRoute component={FindFirstAndLastPosition} title="Find First and Last Position" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/FindMinimumInRotatedSortedArray`} element={<VisualizerRoute component={FindMinimumInRotatedSortedArray} title="Find Minimum in Rotated Sorted Array" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/FindPeakElement`} element={<VisualizerRoute component={FindPeakElement} title="Find Peak Element" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/MedianOfTwoSortedArrays`} element={<VisualizerRoute component={MedianOfTwoSortedArrays} title="Median of Two Sorted Arrays" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/MinSpeedToArriveOnTime`} element={<VisualizerRoute component={MinSpeedToArriveOnTime} title="Min Speed to Arrive on Time" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/PeakIndexInMountainArray`} element={<VisualizerRoute component={PeakIndexInMountainArray} title="Peak Index in Mountain Array" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/Search2DMatrix`} element={<VisualizerRoute component={Search2DMatrix} title="Search 2D Matrix" category="binarysearch" />} />
        <Route path={`${binarysearch.path}/SearchInRotatedSortedArray`} element={<VisualizerRoute component={SearchInRotatedSortedArray} title="Search in Rotated Sorted Array" category="binarysearch" />} />

        {/* GRAPHS */}
        <Route path={graphs.path} element={
          <CategoryPage {...graphs} basePath={graphs.path} categoryKey={graphs.key} />
        } />
        <Route path={`${graphs.path}/BFS`} element={<VisualizerRoute component={BFSGraphs} title="Breadth-First Search" category="graphs" />} />
        <Route path={`${graphs.path}/DFS`} element={<VisualizerRoute component={DFSGraphs} title="Depth-First Search" category="graphs" />} />
        <Route path={`${graphs.path}/Dijkstra`} element={<VisualizerRoute component={Dijkstra} title="Dijkstra's Algorithm" category="graphs" />} />
        <Route path={`${graphs.path}/TopologicalSort`} element={<VisualizerRoute component={TopologicalSort} title="Topological Sort" category="graphs" />} />
        <Route path={`${graphs.path}/Kruskal`} element={<VisualizerRoute component={Kruskal} title="Kruskal's Algorithm" category="graphs" />} />
        <Route path={`${graphs.path}/NetworkFlow`} element={<VisualizerRoute component={NetworkFlow} title="Network Flow" category="graphs" />} />

        {/* TREES */}
        <Route path={trees.path} element={
          <CategoryPage {...trees} basePath={trees.path} categoryKey={trees.key} />
        } />
        <Route path={`${trees.path}/AVLTree`} element={<VisualizerRoute component={AVLTree} title="AVL Tree" category="trees" />} />
        <Route path={`${trees.path}/BinaryTreeRightSideView`} element={<VisualizerRoute component={BinaryTreeRightSideView} title="Binary Tree Right Side View" category="trees" />} />
        <Route path={`${trees.path}/ConstructBinaryTree`} element={<VisualizerRoute component={ConstructBinaryTree} title="Construct Binary Tree" category="trees" />} />
        <Route path={`${trees.path}/FlattenBinaryTree`} element={<VisualizerRoute component={FlattenBinaryTree} title="Flatten Binary Tree" category="trees" />} />
        <Route path={`${trees.path}/LCAofDeepestLeaves`} element={<VisualizerRoute component={LCAofDeepestLeaves} title="LCA of Deepest Leaves" category="trees" />} />
        <Route path={`${trees.path}/MorrisTraversal`} element={<VisualizerRoute component={MorrisTraversal} title="Morris Traversal" category="trees" />} />
        <Route path={`${trees.path}/PrintBinaryTree`} element={<VisualizerRoute component={PrintBinaryTree} title="Print Binary Tree" category="trees" />} />
        <Route path={`${trees.path}/SymmetricTree`} element={<VisualizerRoute component={SymmetricTreeVisualizer} title="Symmetric Tree" category="trees" />} />
        <Route path={`${trees.path}/ValidateBST`} element={<VisualizerRoute component={ValidateBST} title="Validate BST" category="trees" />} />

        {/* STACK */}
        <Route path={stack.path} element={
          <CategoryPage {...stack} basePath={stack.path} categoryKey={stack.key} />
        } />
        <Route path={`${stack.path}/LargestRectangleHistogram`} element={<VisualizerRoute component={LargestRectangleHistogram} title="Largest Rectangle in Histogram" category="stack" />} />
        <Route path={`${stack.path}/NextGreaterElement`} element={<VisualizerRoute component={NextGreaterElement} title="Next Greater Element" category="stack" />} />
        <Route path={`${stack.path}/Permutation`} element={<VisualizerRoute component={PermutationStack} title="Permutation" category="stack" />} />
        <Route path={`${stack.path}/RemoveKDigits`} element={<VisualizerRoute component={RemoveKDigits} title="Remove K Digits" category="stack" />} />
        <Route path={`${stack.path}/StackOperation`} element={<VisualizerRoute component={StackOperation} title="Stack Operations" category="stack" />} />
        <Route path={`${stack.path}/SubarrayRanges`} element={<VisualizerRoute component={SubarrayRangesStack} title="Subarray Ranges" category="stack" />} />

        {/* LINKED LIST */}
        <Route path={linkedlist.path} element={
          <CategoryPage {...linkedlist} basePath={linkedlist.path} categoryKey={linkedlist.key} />
        } />
        <Route path={`${linkedlist.path}/LinkedListCycle`} element={<VisualizerRoute component={LinkedListCycle} title="Linked List Cycle" category="linkedlist" />} />
        <Route path={`${linkedlist.path}/MergeTwoSortedLists`} element={<VisualizerRoute component={MergeTwoSortedLists} title="Merge Two Sorted Lists" category="linkedlist" />} />
        <Route path={`${linkedlist.path}/ReverseLinkedList`} element={<VisualizerRoute component={ReverseLinkedList} title="Reverse Linked List" category="linkedlist" />} />
        <Route path={`${linkedlist.path}/SortList`} element={<VisualizerRoute component={SortList} title="Sort List" category="linkedlist" />} />
        <Route path={`${linkedlist.path}/SwapPairs`} element={<VisualizerRoute component={SwapPairs} title="Swap Pairs" category="linkedlist" />} />

        {/* DYNAMIC PROGRAMMING */}
        <Route path={dp.path} element={
          <CategoryPage {...dp} basePath={dp.path} categoryKey={dp.key} />
        } />
        <Route path={`${dp.path}/BurstBalloons`} element={<VisualizerRoute component={BurstBalloons} title="Burst Balloons" category="dp" />} />
        <Route path={`${dp.path}/CoinChange`} element={<VisualizerRoute component={CoinChange} title="Coin Change" category="dp" />} />
        <Route path={`${dp.path}/EditDistance`} element={<VisualizerRoute component={EditDistance} title="Edit Distance" category="dp" />} />
        <Route path={`${dp.path}/KnapSack`} element={<VisualizerRoute component={KnapSack} title="Knapsack" category="dp" />} />
        <Route path={`${dp.path}/LISubsequence`} element={<VisualizerRoute component={LISubsequence} title="Longest Increasing Subsequence" category="dp" />} />
        <Route path={`${dp.path}/LongestCommonSubsequence`} element={<VisualizerRoute component={LongestCommonSubsequence} title="Longest Common Subsequence" category="dp" />} />
        <Route path={`${dp.path}/SellStockIV`} element={<VisualizerRoute component={SellStockIV} title="Best Time to Buy and Sell Stock IV" category="dp" />} />
        <Route path={`${dp.path}/UniquePaths`} element={<VisualizerRoute component={UniquePaths} title="Unique Paths" category="dp" />} />

        {/* SLIDING WINDOWS */}
        <Route path={slidingwindows.path} element={
          <CategoryPage {...slidingwindows} basePath={slidingwindows.path} categoryKey={slidingwindows.key} />
        } />
        <Route path={`${slidingwindows.path}/FruitsIntoBaskets`} element={<VisualizerRoute component={FruitsIntoBaskets} title="Fruits Into Baskets" category="slidingwindows" />} />
        <Route path={`${slidingwindows.path}/LongestSubstring`} element={<VisualizerRoute component={LongestSubstring} title="Longest Substring" category="slidingwindows" />} />
        <Route path={`${slidingwindows.path}/MaxConsecutiveOnesIII`} element={<VisualizerRoute component={MaxConsecutiveOnesIII} title="Max Consecutive Ones III" category="slidingwindows" />} />
        <Route path={`${slidingwindows.path}/MinimumWindow`} element={<VisualizerRoute component={MinimumWindow} title="Minimum Window" category="slidingwindows" />} />
        <Route path={`${slidingwindows.path}/SlidingWindowMaximum`} element={<VisualizerRoute component={SlidingWindowMaximum} title="Sliding Window Maximum" category="slidingwindows" />} />

        {/* BACKTRACKING */}
        <Route path={backtracking.path} element={
          <CategoryPage {...backtracking} basePath={backtracking.path} categoryKey={backtracking.key} />
        } />
        <Route path={`${backtracking.path}/ExpressionAddOperators`} element={<VisualizerRoute component={ExpressionAddOperators} title="Expression Add Operators" category="backtracking" />} />
        <Route path={`${backtracking.path}/KnightsTour`} element={<VisualizerRoute component={KnightsTour} title="Knight's Tour" category="backtracking" />} />
        <Route path={`${backtracking.path}/Permutations`} element={<VisualizerRoute component={Permutations} title="Permutations" category="backtracking" />} />
        <Route path={`${backtracking.path}/SudokuSolver`} element={<VisualizerRoute component={SudokuSolver} title="Sudoku Solver" category="backtracking" />} />
        <Route path={`${backtracking.path}/WordSearch`} element={<VisualizerRoute component={WordSearch} title="Word Search" category="backtracking" />} />

        {/* STRINGS */}
        <Route path={strings.path} element={
          <CategoryPage {...strings} basePath={strings.path} categoryKey={strings.key} />
        } />
        <Route path={`${strings.path}/CountVowels`} element={<VisualizerRoute component={CountVowels} title="Count Vowels" category="strings" />} />
        <Route path={`${strings.path}/IsSubSequence`} element={<VisualizerRoute component={IsSubSequence} title="Is Subsequence" category="strings" />} />
        <Route path={`${strings.path}/LongestCP`} element={<VisualizerRoute component={LongestCP} title="Longest Common Prefix" category="strings" />} />
        <Route path={`${strings.path}/PalindromeCheck`} element={<VisualizerRoute component={PalindromeCheck} title="Palindrome Check" category="strings" />} />
        <Route path={`${strings.path}/ReverseString`} element={<VisualizerRoute component={ReverseString} title="Reverse String" category="strings" />} />
        <Route path={`${strings.path}/ReverseWords`} element={<VisualizerRoute component={ReverseWords} title="Reverse Words" category="strings" />} />
        <Route path={`${strings.path}/StringCompression`} element={<VisualizerRoute component={StringCompression} title="String Compression" category="strings" />} />
        <Route path={`${strings.path}/ValidAnagram`} element={<VisualizerRoute component={ValidAnagramStrings} title="Valid Anagram" category="strings" />} />

        {/* QUEUE */}
        <Route path={queue.path} element={
          <CategoryPage {...queue} basePath={queue.path} categoryKey={queue.key} />
        } />
        <Route path={`${queue.path}/BasicQueue`} element={<VisualizerRoute component={BasicQueue} title="Basic Queue" category="queue" />} />
        <Route path={`${queue.path}/CircularQueue`} element={<VisualizerRoute component={CircularQueue} title="Circular Queue" category="queue" />} />
        <Route path={`${queue.path}/QueueUsingStacks`} element={<VisualizerRoute component={QueueUsingStacks} title="Queue Using Stacks" category="queue" />} />

        {/* HEAPS */}
        <Route path={heaps.path} element={
          <CategoryPage {...heaps} basePath={heaps.path} categoryKey={heaps.key} />
        } />
        <Route path={`${heaps.path}/Heapify`} element={<VisualizerRoute component={Heapify} title="Heapify" category="heaps" />} />
        <Route path={`${heaps.path}/TaskScheduler`} element={<VisualizerRoute component={TaskScheduler} title="Task Scheduler" category="heaps" />} />
        <Route path={`${heaps.path}/TopKFrequent`} element={<VisualizerRoute component={TopKFrequent} title="Top K Frequent Elements" category="heaps" />} />

        {/* HASHING */}
        <Route path={hashing.path} element={
          <CategoryPage {...hashing} basePath={hashing.path} categoryKey={hashing.key} />
        } />
        <Route path={`${hashing.path}/EqualRowsColumnPair`} element={<VisualizerRoute component={EqualRowsColumnPair} title="Equal Rows Column Pair" category="hashing" />} />
        <Route path={`${hashing.path}/LongestConsecutiveSequence`} element={<VisualizerRoute component={LongestConsecutiveSequence} title="Longest Consecutive Sequence" category="hashing" />} />
        <Route path={`${hashing.path}/SubarraySumEqualsK`} element={<VisualizerRoute component={SubarraySumEqualsK} title="Subarray Sum Equals K" category="hashing" />} />
        <Route path={`${hashing.path}/ValidAnagram`} element={<VisualizerRoute component={ValidAnagramHashing} title="Valid Anagram" category="hashing" />} />

        {/* RECURSION */}
        <Route path={recursion.path} element={
          <CategoryPage {...recursion} basePath={recursion.path} categoryKey={recursion.key} />
        } />
        <Route path={`${recursion.path}/BinarySearchRecursive`} element={<VisualizerRoute component={BinarySearchRecursive} title="Binary Search (Recursive)" category="recursion" />} />
        <Route path={`${recursion.path}/Factorial`} element={<VisualizerRoute component={Factorial} title="Factorial" category="recursion" />} />
        <Route path={`${recursion.path}/Fibonacci`} element={<VisualizerRoute component={Fibonacci} title="Fibonacci" category="recursion" />} />
        <Route path={`${recursion.path}/NQueens`} element={<VisualizerRoute component={NQueens} title="N-Queens" category="recursion" />} />
        <Route path={`${recursion.path}/SubsetSum`} element={<VisualizerRoute component={SubsetSum} title="Subset Sum" category="recursion" />} />
        <Route path={`${recursion.path}/TowerOfHanoi`} element={<VisualizerRoute component={TowerOfHanoi} title="Tower of Hanoi" category="recursion" />} />

        {/* BIT MANIPULATION */}
        <Route path={bitmanipulation.path} element={
          <CategoryPage {...bitmanipulation} basePath={bitmanipulation.path} categoryKey={bitmanipulation.key} />
        } />
        <Route path={`${bitmanipulation.path}/CountingBits`} element={<VisualizerRoute component={CountingBits} title="Counting Bits" category="bitmanipulation" />} />
        <Route path={`${bitmanipulation.path}/NumberOf1Bits`} element={<VisualizerRoute component={NumberOf1Bits} title="Number of 1 Bits" category="bitmanipulation" />} />
        <Route path={`${bitmanipulation.path}/PowerOfTwo`} element={<VisualizerRoute component={PowerOfTwo} title="Power of Two" category="bitmanipulation" />} />
        <Route path={`${bitmanipulation.path}/ReverseBits`} element={<VisualizerRoute component={ReverseBits} title="Reverse Bits" category="bitmanipulation" />} />
        <Route path={`${bitmanipulation.path}/SingleNumber`} element={<VisualizerRoute component={SingleNumber} title="Single Number" category="bitmanipulation" />} />

        {/* GREEDY */}
        <Route path={greedy.path} element={
          <CategoryPage {...greedy} basePath={greedy.path} categoryKey={greedy.key} />
        } />
        <Route path={`${greedy.path}/AssignCookies`} element={<VisualizerRoute component={AssignCookies} title="Assign Cookies" category="greedy" />} />
        <Route path={`${greedy.path}/BestTimeStockII`} element={<VisualizerRoute component={BestTimeStockII} title="Best Time to Buy and Sell Stock II" category="greedy" />} />
        <Route path={`${greedy.path}/JobScheduling`} element={<VisualizerRoute component={JobScheduling} title="Job Scheduling" category="greedy" />} />
        <Route path={`${greedy.path}/TwoCityScheduling`} element={<VisualizerRoute component={TwoCityScheduling} title="Two City Scheduling" category="greedy" />} />

        {/* MATHS */}
        <Route path={maths.path} element={
          <CategoryPage {...maths} basePath={maths.path} categoryKey={maths.key} />
        } />
        <Route path={`${maths.path}/CountPrimes`} element={<VisualizerRoute component={CountPrimes} title="Count Primes" category="maths" />} />
        <Route path={`${maths.path}/ExcelSheetColumnTitle`} element={<VisualizerRoute component={ExcelSheetColumnTitle} title="Excel Sheet Column Title" category="maths" />} />
        <Route path={`${maths.path}/FactorialZeroes`} element={<VisualizerRoute component={FactorialZeroes} title="Factorial Zeroes" category="maths" />} />
        <Route path={`${maths.path}/Power`} element={<VisualizerRoute component={Power} title="Power" category="maths" />} />
        <Route path={`${maths.path}/PrimePalindrome`} element={<VisualizerRoute component={PrimePalindrome} title="Prime Palindrome" category="maths" />} />

        {/* SEARCHING */}
        <Route path={searching.path} element={
          <CategoryPage {...searching} basePath={searching.path} categoryKey={searching.key} />
        } />
        <Route path={`${searching.path}/ExponentialSearch`} element={<VisualizerRoute component={ExponentialSearch} title="Exponential Search" category="searching" />} />
        <Route path={`${searching.path}/KthMissingNumber`} element={<VisualizerRoute component={KthMissingNumber} title="Kth Missing Number" category="searching" />} />
        <Route path={`${searching.path}/LinearSearch`} element={<VisualizerRoute component={LinearSearch} title="Linear Search" category="searching" />} />
        <Route path={`${searching.path}/SmallestLetter`} element={<VisualizerRoute component={SmallestLetter} title="Smallest Letter" category="searching" />} />
        <Route path={`${searching.path}/SpecialArray`} element={<VisualizerRoute component={SpecialArray} title="Special Array" category="searching" />} />
        <Route path={`${searching.path}/UnknownSizeSearch`} element={<VisualizerRoute component={UnknownSizeSearch} title="Unknown Size Search" category="searching" />} />

        {/* DESIGN */}
        <Route path={design.path} element={
          <CategoryPage {...design} basePath={design.path} categoryKey={design.key} />
        } />
        <Route path={`${design.path}/DesignHashMap`} element={<VisualizerRoute component={DesignHashMap} title="Design HashMap" category="design" />} />
        <Route path={`${design.path}/DesignLinkedList`} element={<VisualizerRoute component={DesignLinkedList} title="Design Linked List" category="design" />} />
        <Route path={`${design.path}/ImplementTrie`} element={<VisualizerRoute component={ImplementTrie} title="Implement Trie" category="design" />} />
        <Route path={`${design.path}/LFUCache`} element={<VisualizerRoute component={LFUCache} title="LFU Cache" category="design" />} />
        <Route path={`${design.path}/LRUCache`} element={<VisualizerRoute component={LRUCache} title="LRU Cache" category="design" />} />
        <Route path={`${design.path}/MinStack`} element={<VisualizerRoute component={MinStack} title="Min Stack" category="design" />} />

        {/* PATHFINDING */}
        <Route path={pathfinding.path} element={
          <CategoryPage {...pathfinding} basePath={pathfinding.path} categoryKey={pathfinding.key} />
        } />
        <Route path={`${pathfinding.path}/AStar`} element={<VisualizerRoute component={AStarPathfinding} title="A* Algorithm" category="pathfinding" />} />
        <Route path={`${pathfinding.path}/BFS`} element={<VisualizerRoute component={BFSPathfinding} title="Breadth-First Search" category="pathfinding" />} />
        <Route path={`${pathfinding.path}/ColorIslands`} element={<VisualizerRoute component={ColorIslands} title="Color Islands" category="pathfinding" />} />
        <Route path={`${pathfinding.path}/FloodFill`} element={<VisualizerRoute component={FloodFill} title="Flood Fill" category="pathfinding" />} />
        <Route path={`${pathfinding.path}/RatInMaze`} element={<VisualizerRoute component={RatInMaze} title="Rat in Maze" category="pathfinding" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
