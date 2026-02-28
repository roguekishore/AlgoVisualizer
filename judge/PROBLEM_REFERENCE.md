# Judge Problem File Reference

## How to Create a Problem File

### Step 1 — The AI generates this for you (see the prompts at the bottom)

The file format looks like this (for reference only — the AI writes it):

```js
/**
 * Problem Title — Problem Definition
 *
 * Input format (stdin):
 *   Line 1: n (number of elements)
 *   Line 2: n space-separated integers
 *
 * Output format (stdout):
 *   A single integer
 */

module.exports = {
  id: 'find-max-element',       // ← from the table
  conquestId: 'stage1-1',       // ← from the table
  title: 'Find Maximum Element',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Traversal'],

  description: `Given an array of integers, find the maximum element.`,

  examples: [
    { input: 'arr = [3,1,4,1,5,9]', output: '9', explanation: '9 is the largest.' },
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ arr[i] ≤ 10⁹',
  ],

  boilerplate: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int findMax(vector<int>& arr) {
    // TODO: write your solution here
    return 0;
}

int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << findMax(arr) << endl;
}
`,
    java: `import java.util.*;
public class Solution {
    public static int findMax(int[] arr) {
        // TODO: write your solution here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(findMax(arr));
    }
}
`,
  },

  // input = what goes into stdin, expected = what stdout should print
  testCases: [
    { input: '8\n3 1 4 1 5 9 2 6', expected: '9' },
    { input: '1\n42',              expected: '42' },
    { input: '6\n-5 -2 -8 -1 -9 -3', expected: '-1' },
    // 5–10 cases covering: normal, single element, all negative, all same, large numbers
  ],
};
```

---

### Step 2 — Name the file

**Filename = the `id` value + `.js`**

Example: if `id` is `move-zeroes`, the file is named `move-zeroes.js`

---

### Step 3 — Drop the file into this folder

```
judge/src/problems/
```

---

### Step 4 — Tell me you're done

After dropping the file in, I'll run one command that automatically wires it to the map. You don't need to touch any other files.

---

## Full Problem List

> **Status legend:** ✅ = already done &nbsp; ⬜ = needs a file

| Status | Stage | # | Problem Title | LeetCode | `id` (→ filename) | `conquestId` |
|--------|-------|---|---------------|----------|-------------------|--------------|
| ✅ | 1 | 1 | Find Maximum Element | — | `find-max-element` | `stage1-1` |
| ✅ | 1 | 2 | Find Minimum Element | — | `find-min-element` | `stage1-2` |
| ⬜ | 1 | 3 | Array Sum | — | `array-sum` | `stage1-3` |
| ⬜ | 1 | 4 | Reverse Array | — | `reverse-array` | `stage1-4` |
| ⬜ | 1 | 5 | Count Zeros in Array | — | `count-zeros` | `stage1-5` |
| ⬜ | 1 | 6 | Insert Element at Index | — | `insert-element` | `stage1-6` |
| ⬜ | 1 | 7 | Delete Element at Index | — | `delete-element` | `stage1-7` |
| ⬜ | 2 | 1 | Linear Search in Array | — | `linear-search-basic` | `stage2-1` |
| ⬜ | 2 | 2 | Linear Search | — | `linear-search` | `stage2-2` |
| ⬜ | 2 | 3 | Move Zeros | [LC 283](https://leetcode.com/problems/move-zeroes) | `move-zeroes` | `stage2-3` |
| ⬜ | 2 | 4 | Rotate Array | [LC 189](https://leetcode.com/problems/rotate-array) | `rotate-array` | `stage2-4` |
| ⬜ | 2 | 5 | Squares of a Sorted Array | [LC 977](https://leetcode.com/problems/squares-of-a-sorted-array) | `squares-of-a-sorted-array` | `stage2-5` |
| ⬜ | 3 | 1 | Prefix Sum Construction | — | `prefix-sum` | `stage3-1` |
| ⬜ | 3 | 2 | Maximum Subarray | [LC 53](https://leetcode.com/problems/maximum-subarray) | `maximum-subarray` | `stage3-2` |
| ⬜ | 3 | 3 | Product of Array Except Self | [LC 238](https://leetcode.com/problems/product-of-array-except-self) | `product-of-array-except-self` | `stage3-3` |
| ⬜ | 3 | 4 | Sum of Subarray Ranges | [LC 2104](https://leetcode.com/problems/sum-of-subarray-ranges) | `sum-of-subarray-ranges` | `stage3-4` |
| ⬜ | 3 | 5 | Subarray Sum Equals K | [LC 560](https://leetcode.com/problems/subarray-sum-equals-k) | `subarray-sum-equals-k` | `stage3-5` |
| ⬜ | 3 | 6 | Split Array Largest Sum | [LC 410](https://leetcode.com/problems/split-array-largest-sum) | `split-array-largest-sum` | `stage3-6` |
| ✅ | 4 | 1 | Two Sum | [LC 1](https://leetcode.com/problems/two-sum) | `two-sum` | `stage4-1` |
| ⬜ | 4 | 2 | 3Sum | [LC 15](https://leetcode.com/problems/3sum) | `3sum` | `stage4-2` |
| ⬜ | 4 | 3 | 4Sum | [LC 18](https://leetcode.com/problems/4sum) | `4sum` | `stage4-3` |
| ⬜ | 4 | 4 | Container With Most Water | [LC 11](https://leetcode.com/problems/container-with-most-water) | `container-with-most-water` | `stage4-4` |
| ⬜ | 4 | 5 | Trapping Rain Water | [LC 42](https://leetcode.com/problems/trapping-rain-water) | `trapping-rain-water` | `stage4-5` |
| ⬜ | 5 | 1 | Max Consecutive Ones III | [LC 1004](https://leetcode.com/problems/max-consecutive-ones-iii) | `max-consecutive-ones-iii` | `stage5-1` |
| ⬜ | 5 | 2 | Longest Substring Without Repeating Characters | [LC 3](https://leetcode.com/problems/longest-substring-without-repeating-characters) | `longest-substring-without-repeating-characters` | `stage5-2` |
| ⬜ | 5 | 3 | Fruit Into Baskets | [LC 904](https://leetcode.com/problems/fruit-into-baskets) | `fruit-into-baskets` | `stage5-3` |
| ⬜ | 5 | 4 | Minimum Window Substring | [LC 76](https://leetcode.com/problems/minimum-window-substring) | `minimum-window-substring` | `stage5-4` |
| ⬜ | 5 | 5 | Sliding Window Maximum | [LC 239](https://leetcode.com/problems/sliding-window-maximum) | `sliding-window-maximum` | `stage5-5` |
| ⬜ | 6 | 1 | Palindrome Check | [LC 125](https://leetcode.com/problems/valid-palindrome) | `valid-palindrome` | `stage6-1` |
| ⬜ | 6 | 2 | Reverse String | [LC 344](https://leetcode.com/problems/reverse-string) | `reverse-string` | `stage6-2` |
| ⬜ | 6 | 3 | Count Vowels | — | `count-vowels` | `stage6-3` |
| ⬜ | 6 | 4 | Valid Anagram | [LC 242](https://leetcode.com/problems/valid-anagram) | `valid-anagram` | `stage6-4` |
| ⬜ | 6 | 5 | First Unique Character | [LC 387](https://leetcode.com/problems/first-unique-character-in-a-string) | `first-unique-character` | `stage6-5` |
| ⬜ | 7 | 1 | Longest Common Prefix | [LC 14](https://leetcode.com/problems/longest-common-prefix) | `longest-common-prefix` | `stage7-1` |
| ⬜ | 7 | 2 | String Compression | [LC 443](https://leetcode.com/problems/string-compression) | `string-compression` | `stage7-2` |
| ⬜ | 7 | 3 | Reverse Words in a String | [LC 151](https://leetcode.com/problems/reverse-words-in-a-string) | `reverse-words-in-a-string` | `stage7-3` |
| ⬜ | 7 | 4 | Is Subsequence | [LC 392](https://leetcode.com/problems/is-subsequence) | `is-subsequence` | `stage7-4` |
| ⬜ | 7 | 5 | Group Anagrams | [LC 49](https://leetcode.com/problems/group-anagrams) | `group-anagrams` | `stage7-5` |
| ⬜ | 7 | 6 | Longest Palindromic Substring | [LC 5](https://leetcode.com/problems/longest-palindromic-substring) | `longest-palindromic-substring` | `stage7-6` |
| ⬜ | 8 | 1 | Binary Search | [LC 704](https://leetcode.com/problems/binary-search) | `binary-search` | `stage8-1` |
| ⬜ | 8 | 2 | Peak Index in Mountain Array | [LC 852](https://leetcode.com/problems/peak-index-in-a-mountain-array) | `peak-index-in-mountain-array` | `stage8-2` |
| ⬜ | 8 | 3 | Find First and Last Position | [LC 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array) | `find-first-and-last-position` | `stage8-3` |
| ⬜ | 8 | 4 | Kth Missing Positive Number | [LC 1539](https://leetcode.com/problems/kth-missing-positive-number) | `kth-missing-positive-number` | `stage8-4` |
| ⬜ | 8 | 5 | Find Smallest Letter Greater Than Target | [LC 744](https://leetcode.com/problems/find-smallest-letter-greater-than-target) | `find-smallest-letter` | `stage8-5` |
| ⬜ | 9 | 1 | Search in Rotated Sorted Array | [LC 33](https://leetcode.com/problems/search-in-rotated-sorted-array) | `search-in-rotated-sorted-array` | `stage9-1` |
| ⬜ | 9 | 2 | Find Minimum in Rotated Sorted Array | [LC 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array) | `find-minimum-rotated` | `stage9-2` |
| ⬜ | 9 | 3 | Find Peak Element | [LC 162](https://leetcode.com/problems/find-peak-element) | `find-peak-element` | `stage9-3` |
| ⬜ | 9 | 4 | Search a 2D Matrix | [LC 74](https://leetcode.com/problems/search-a-2d-matrix) | `search-a-2d-matrix` | `stage9-4` |
| ⬜ | 9 | 5 | Min Speed to Arrive on Time | [LC 1870](https://leetcode.com/problems/minimum-speed-to-arrive-on-time) | `minimum-speed-to-arrive-on-time` | `stage9-5` |
| ⬜ | 9 | 6 | Median of Two Sorted Arrays | [LC 4](https://leetcode.com/problems/median-of-two-sorted-arrays) | `median-of-two-sorted-arrays` | `stage9-6` |
| ⬜ | 9 | 7 | Special Array With X Elements | [LC 1608](https://leetcode.com/problems/special-array-with-x-elements-greater-than-or-equal-x) | `special-array` | `stage9-7` |
| ⬜ | 9 | 8 | Search in Sorted Array of Unknown Size | [LC 702](https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size) | `search-unknown-size` | `stage9-8` |
| ⬜ | 9 | 9 | Exponential Search | — | `exponential-search` | `stage9-9` |
| ⬜ | 10 | 1 | Build Linked List from Array | — | `build-linked-list` | `stage10-1` |
| ⬜ | 10 | 2 | Insert at Head | — | `insert-at-head` | `stage10-2` |
| ⬜ | 10 | 3 | Insert at Tail | — | `insert-at-tail` | `stage10-3` |
| ⬜ | 10 | 4 | Insert at Position | — | `insert-at-position` | `stage10-4` |
| ⬜ | 10 | 5 | Delete Node in Linked List | — | `delete-node` | `stage10-5` |
| ⬜ | 10 | 6 | Search in Linked List | — | `search-linked-list` | `stage10-6` |
| ⬜ | 10 | 7 | Design Linked List | [LC 707](https://leetcode.com/problems/design-linked-list) | `design-linked-list` | `stage10-7` |
| ⬜ | 11 | 1 | Reverse Linked List | [LC 206](https://leetcode.com/problems/reverse-linked-list) | `reverse-linked-list` | `stage11-1` |
| ⬜ | 11 | 2 | Linked List Cycle | [LC 141](https://leetcode.com/problems/linked-list-cycle) | `linked-list-cycle` | `stage11-2` |
| ⬜ | 11 | 3 | Merge Two Sorted Lists | [LC 21](https://leetcode.com/problems/merge-two-sorted-lists) | `merge-two-sorted-lists` | `stage11-3` |
| ⬜ | 11 | 4 | Sort List | [LC 148](https://leetcode.com/problems/sort-list) | `sort-list` | `stage11-4` |
| ⬜ | 11 | 5 | Swap Nodes in Pairs | [LC 24](https://leetcode.com/problems/swap-nodes-in-pairs) | `swap-nodes-in-pairs` | `stage11-5` |
| ⬜ | 12 | 1 | Stack Push / Pop / Peek | — | `stack-basics` | `stage12-1` |
| ⬜ | 12 | 2 | Stack Operations | — | `stack-operations` | `stage12-2` |
| ⬜ | 12 | 3 | Valid Parentheses | [LC 20](https://leetcode.com/problems/valid-parentheses) | `valid-parentheses` | `stage12-3` |
| ⬜ | 12 | 4 | Min Stack | [LC 155](https://leetcode.com/problems/min-stack) | `min-stack` | `stage12-4` |
| ⬜ | 13 | 1 | Next Greater Element | [LC 496](https://leetcode.com/problems/next-greater-element-i) | `next-greater-element` | `stage13-1` |
| ⬜ | 13 | 2 | Remove K Digits | [LC 402](https://leetcode.com/problems/remove-k-digits) | `remove-k-digits` | `stage13-2` |
| ⬜ | 13 | 3 | Largest Rectangle in Histogram | [LC 84](https://leetcode.com/problems/largest-rectangle-in-histogram) | `largest-rectangle-histogram` | `stage13-3` |
| ⬜ | 13 | 4 | Sum of Subarray Ranges (Stack) | [LC 2104](https://leetcode.com/problems/sum-of-subarray-ranges) | `sum-of-subarray-ranges-stack` | `stage13-4` |
| ⬜ | 14 | 1 | Queue using Array | — | `queue-basics` | `stage14-1` |
| ⬜ | 14 | 2 | Basic Queue | — | `basic-queue` | `stage14-2` |
| ⬜ | 14 | 3 | Circular Queue | [LC 622](https://leetcode.com/problems/design-circular-queue) | `design-circular-queue` | `stage14-3` |
| ⬜ | 14 | 4 | Implement Queue using Stacks | [LC 232](https://leetcode.com/problems/implement-queue-using-stacks) | `implement-queue-using-stacks` | `stage14-4` |
| ⬜ | 15 | 1 | Quadratic Sorting | — | `quadratic-sorting` | `stage15-1` |
| ⬜ | 15 | 2 | Efficient Sorting | [LC 912](https://leetcode.com/problems/sort-an-array) | `sort-an-array` | `stage15-2` |
| ⬜ | 15 | 3 | Counting Sort | — | `counting-sort` | `stage15-3` |
| ⬜ | 15 | 4 | Radix Sort | — | `radix-sort` | `stage15-4` |
| ⬜ | 15 | 5 | Bucket Sort | — | `bucket-sort` | `stage15-5` |
| ⬜ | 15 | 6 | Shell Sort | — | `shell-sort` | `stage15-6` |
| ⬜ | 15 | 7 | Comb Sort | — | `comb-sort` | `stage15-7` |
| ⬜ | 15 | 8 | Pancake Sort | [LC 969](https://leetcode.com/problems/pancake-sorting) | `pancake-sorting` | `stage15-8` |
| ⬜ | 16 | 1 | Heapify (Build Heap) | — | `heapify` | `stage16-1` |
| ⬜ | 16 | 2 | Top K Frequent Elements | [LC 347](https://leetcode.com/problems/top-k-frequent-elements) | `top-k-frequent-elements` | `stage16-2` |
| ⬜ | 16 | 3 | Task Scheduler | [LC 621](https://leetcode.com/problems/task-scheduler) | `task-scheduler` | `stage16-3` |
| ⬜ | 16 | 4 | Maximum Gap | [LC 164](https://leetcode.com/problems/maximum-gap) | `maximum-gap` | `stage16-4` |
| ⬜ | 17 | 1 | Build Binary Tree (Level Order) | — | `build-binary-tree` | `stage17-1` |
| ⬜ | 17 | 2 | Search in Binary Tree | — | `search-binary-tree` | `stage17-2` |
| ⬜ | 17 | 3 | Insert in Binary Search Tree | — | `insert-bst` | `stage17-3` |
| ⬜ | 17 | 4 | Search in Binary Search Tree | — | `search-bst` | `stage17-4` |
| ⬜ | 17 | 5 | Construct Binary Tree from Preorder and Inorder | [LC 105](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal) | `construct-binary-tree` | `stage17-5` |
| ⬜ | 18 | 1 | Morris Traversal (Inorder) | [LC 94](https://leetcode.com/problems/binary-tree-inorder-traversal) | `morris-traversal` | `stage18-1` |
| ⬜ | 18 | 2 | Validate Binary Search Tree | [LC 98](https://leetcode.com/problems/validate-binary-search-tree) | `validate-bst` | `stage18-2` |
| ⬜ | 18 | 3 | AVL Tree | [LC 110](https://leetcode.com/problems/balanced-binary-tree) | `avl-tree` | `stage18-3` |
| ⬜ | 18 | 4 | Symmetric Tree | [LC 101](https://leetcode.com/problems/symmetric-tree) | `symmetric-tree` | `stage18-4` |
| ⬜ | 18 | 5 | Implement Trie (Prefix Tree) | [LC 208](https://leetcode.com/problems/implement-trie-prefix-tree) | `implement-trie` | `stage18-5` |
| ⬜ | 19 | 1 | Binary Tree Right Side View | [LC 199](https://leetcode.com/problems/binary-tree-right-side-view) | `binary-tree-right-side-view` | `stage19-1` |
| ⬜ | 19 | 2 | Print Binary Tree | [LC 655](https://leetcode.com/problems/print-binary-tree) | `print-binary-tree` | `stage19-2` |
| ⬜ | 19 | 3 | LCA of Deepest Leaves | [LC 1123](https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves) | `lca-deepest-leaves` | `stage19-3` |
| ⬜ | 19 | 4 | Flatten Binary Tree to Linked List | [LC 114](https://leetcode.com/problems/flatten-binary-tree-to-linked-list) | `flatten-binary-tree` | `stage19-4` |
| ⬜ | 20 | 1 | DFS (Graph) | — | `graph-dfs` | `stage20-1` |
| ⬜ | 20 | 2 | BFS (Graph) | — | `graph-bfs` | `stage20-2` |
| ⬜ | 20 | 3 | Number of Islands | [LC 200](https://leetcode.com/problems/number-of-islands) | `number-of-islands` | `stage20-3` |
| ⬜ | 20 | 4 | Flood Fill | [LC 733](https://leetcode.com/problems/flood-fill) | `flood-fill` | `stage20-4` |
| ⬜ | 20 | 5 | Dijkstra's Algorithm | — | `dijkstra` | `stage20-5` |
| ⬜ | 20 | 6 | Topological Sort | [LC 207](https://leetcode.com/problems/course-schedule) | `topological-sort` | `stage20-6` |
| ⬜ | 20 | 7 | Kruskal's MST | — | `kruskal-mst` | `stage20-7` |
| ⬜ | 20 | 8 | A* Pathfinding | — | `a-star` | `stage20-8` |
| ⬜ | 20 | 9 | Network Flow | — | `network-flow` | `stage20-9` |
| ⬜ | 21 | 1 | Recursion Call Stack Visualization | — | `recursion-callstack` | `stage21-1` |
| ⬜ | 21 | 2 | Fibonacci | [LC 509](https://leetcode.com/problems/fibonacci-number) | `fibonacci` | `stage21-2` |
| ⬜ | 21 | 3 | Factorial | — | `factorial` | `stage21-3` |
| ⬜ | 21 | 4 | Binary Search (Recursive) | [LC 704](https://leetcode.com/problems/binary-search) | `binary-search-recursive` | `stage21-4` |
| ⬜ | 21 | 5 | Tower of Hanoi | — | `tower-of-hanoi` | `stage21-5` |
| ⬜ | 21 | 6 | Subset Sum | — | `subset-sum` | `stage21-6` |
| ⬜ | 21 | 7 | Permutations | [LC 46](https://leetcode.com/problems/permutations) | `permutations` | `stage21-7` |
| ⬜ | 21 | 8 | N-Queens | [LC 51](https://leetcode.com/problems/n-queens) | `n-queens` | `stage21-8` |
| ⬜ | 21 | 9 | Rat in a Maze | — | `rat-in-maze` | `stage21-9` |
| ⬜ | 21 | 10 | Word Search | [LC 79](https://leetcode.com/problems/word-search) | `word-search` | `stage21-10` |
| ⬜ | 21 | 11 | Sudoku Solver | [LC 37](https://leetcode.com/problems/sudoku-solver) | `sudoku-solver` | `stage21-11` |
| ⬜ | 21 | 12 | Expression Add Operators | [LC 282](https://leetcode.com/problems/expression-add-operators) | `expression-add-operators` | `stage21-12` |
| ⬜ | 21 | 13 | Knight's Tour | — | `knights-tour` | `stage21-13` |
| ⬜ | 22 | 1 | Unique Paths | [LC 62](https://leetcode.com/problems/unique-paths) | `unique-paths` | `stage22-1` |
| ⬜ | 22 | 2 | 0/1 Knapsack | [LC 416](https://leetcode.com/problems/partition-equal-subset-sum) | `knapsack` | `stage22-2` |
| ⬜ | 22 | 3 | Coin Change | [LC 322](https://leetcode.com/problems/coin-change) | `coin-change` | `stage22-3` |
| ⬜ | 22 | 4 | Longest Increasing Subsequence | [LC 300](https://leetcode.com/problems/longest-increasing-subsequence) | `longest-increasing-subsequence` | `stage22-4` |
| ⬜ | 22 | 5 | Longest Common Subsequence | [LC 1143](https://leetcode.com/problems/longest-common-subsequence) | `longest-common-subsequence` | `stage22-5` |
| ⬜ | 22 | 6 | Edit Distance | [LC 72](https://leetcode.com/problems/edit-distance) | `edit-distance` | `stage22-6` |
| ⬜ | 22 | 7 | Burst Balloons | [LC 312](https://leetcode.com/problems/burst-balloons) | `burst-balloons` | `stage22-7` |
| ⬜ | 22 | 8 | Burst Balloons (Top Down) | [LC 312](https://leetcode.com/problems/burst-balloons) | `burst-balloons-top-down` | `stage22-8` |
| ⬜ | 22 | 9 | Best Time to Buy and Sell Stock IV | [LC 188](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv) | `best-time-to-buy-and-sell-stock-iv` | `stage22-9` |
| ⬜ | 23 | 1 | Best Time to Buy and Sell Stock | [LC 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock) | `best-time-to-buy-and-sell-stock` | `stage23-1` |
| ⬜ | 23 | 2 | Best Time to Buy and Sell Stock II | [LC 122](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii) | `best-time-to-buy-and-sell-stock-ii` | `stage23-2` |
| ⬜ | 23 | 3 | Assign Cookies | [LC 455](https://leetcode.com/problems/assign-cookies) | `assign-cookies` | `stage23-3` |
| ⬜ | 23 | 4 | Two City Scheduling | [LC 1029](https://leetcode.com/problems/two-city-scheduling) | `two-city-scheduling` | `stage23-4` |
| ⬜ | 23 | 5 | Maximum Profit in Job Scheduling | [LC 1235](https://leetcode.com/problems/maximum-profit-in-job-scheduling) | `maximum-profit-job-scheduling` | `stage23-5` |
| ⬜ | 23 | 6 | Merge Intervals | [LC 56](https://leetcode.com/problems/merge-intervals) | `merge-intervals` | `stage23-6` |
| ⬜ | 23 | 7 | Jump Game II | [LC 45](https://leetcode.com/problems/jump-game-ii) | `jump-game-ii` | `stage23-7` |
| ⬜ | 23 | 8 | Gas Station | [LC 134](https://leetcode.com/problems/gas-station) | `gas-station` | `stage23-8` |
| ⬜ | 24 | 1 | Design HashMap | [LC 706](https://leetcode.com/problems/design-hashmap) | `design-hashmap` | `stage24-1` |
| ⬜ | 24 | 2 | Design Linked List | [LC 707](https://leetcode.com/problems/design-linked-list) | `design-linked-list-2` | `stage24-2` |
| ⬜ | 24 | 3 | LRU Cache | [LC 146](https://leetcode.com/problems/lru-cache) | `lru-cache` | `stage24-3` |
| ⬜ | 24 | 4 | LFU Cache | [LC 460](https://leetcode.com/problems/lfu-cache) | `lfu-cache` | `stage24-4` |
| ⬜ | A | 1 | Single Number | [LC 136](https://leetcode.com/problems/single-number) | `single-number` | `bonusA-1` |
| ⬜ | A | 2 | Number of 1 Bits | [LC 191](https://leetcode.com/problems/number-of-1-bits) | `number-of-1-bits` | `bonusA-2` |
| ⬜ | A | 3 | Counting Bits | [LC 338](https://leetcode.com/problems/counting-bits) | `counting-bits` | `bonusA-3` |
| ⬜ | A | 4 | Reverse Bits | [LC 190](https://leetcode.com/problems/reverse-bits) | `reverse-bits` | `bonusA-4` |
| ⬜ | A | 5 | Power of Two | [LC 231](https://leetcode.com/problems/power-of-two) | `power-of-two` | `bonusA-5` |
| ⬜ | B | 1 | Count Primes | [LC 204](https://leetcode.com/problems/count-primes) | `count-primes` | `bonusB-1` |
| ⬜ | B | 2 | Excel Sheet Column Title | [LC 168](https://leetcode.com/problems/excel-sheet-column-title) | `excel-sheet-column-title` | `bonusB-2` |
| ⬜ | B | 3 | Factorial Trailing Zeroes | [LC 172](https://leetcode.com/problems/factorial-trailing-zeroes) | `factorial-trailing-zeroes` | `bonusB-3` |
| ⬜ | B | 4 | Pow(x, n) | [LC 50](https://leetcode.com/problems/powx-n) | `powx-n` | `bonusB-4` |
| ⬜ | B | 5 | Prime Palindrome | [LC 866](https://leetcode.com/problems/prime-palindrome) | `prime-palindrome` | `bonusB-5` |
| ⬜ | C | 1 | Longest Consecutive Sequence | [LC 128](https://leetcode.com/problems/longest-consecutive-sequence) | `longest-consecutive-sequence` | `bonusC-1` |
| ⬜ | C | 2 | Equal Row and Column Pairs | [LC 2352](https://leetcode.com/problems/equal-row-and-column-pairs) | `equal-row-and-column-pairs` | `bonusC-2` |

---

## What you never need to touch

- `reactapp/src/data/dsa-conquest-map.js` — **do not edit this**
- `judge/src/problemStore.js` — **do not edit this**
- Any other file in the project

Just drop the `.js` file in `judge/src/problems/` and tell me. I'll run the sync script.

---

## AI Prompts

### Prompt 1 — Send this ONCE at the start of the conversation (attach `dsa-conquest-map.js`)

> You are generating judge problem definition files for a DSA learning platform called Vantage.
> 
> I am attaching `dsa-conquest-map.js` — this is the single source of truth for all problems. Each entry has:
> - `id` — the conquest map ID (e.g. `stage1-3`)
> - `title` — the problem title
> - `difficulty` — Easy / Medium / Hard
> - `lcNumber` / `lcSlug` — LeetCode reference if it exists
> - `stage` and `order` — which stage and position
> 
> When I ask you to generate a problem, look it up in the map by title to find its `id` and stage.
> 
> Each file you generate must follow this exact structure:
> 
> ```js
> /**
>  * {Title} — Problem Definition
>  *
>  * Input format (stdin):
>  *   (describe the stdin line-by-line format you chose)
>  *
>  * Output format (stdout):
>  *   (describe what to print)
>  */
> 
> module.exports = {
>   id: '{judge-id}',           // kebab-case slug, e.g. 'array-sum'
>   conquestId: '{stage-id}',   // from the conquest map, e.g. 'stage1-3'
>   title: '{Problem Title}',
>   difficulty: 'Easy',         // Easy | Medium | Hard
>   category: '{Category}',     // e.g. Arrays, Strings, Binary Search
>   tags: ['Array'],
> 
>   description: `markdown description with **bold**, \`code\`, etc.`,
> 
>   examples: [
>     { input: '...', output: '...', explanation: '...' },
>   ],
> 
>   constraints: [
>     '1 ≤ n ≤ 10⁵',
>   ],
> 
>   boilerplate: {
>     cpp: `...`,   // full C++ file with main() that reads stdin and prints stdout
>     java: `...`,  // full Java file with main() that reads stdin and prints stdout
>   },
> 
>   // CRITICAL: input = exact stdin string (\n for newlines), expected = exact stdout string
>   testCases: [
>     { input: '3\n1 2 3', expected: '3' },
>     // 8–10 cases: normal, edge cases, negatives, large values, single element
>   ],
> };
> ```
> 
> Rules:
> - `id` = kebab-case version of the title (you decide a sensible slug)
> - `conquestId` = the `id` field from the conquest map entry (e.g. `stage1-3`)
> - `boilerplate.cpp` and `boilerplate.java` must include a full `main()` that handles stdin/stdout — the user only fills in the solve function
> - `testCases[].input` is the raw stdin string with `\n` between lines
> - `testCases[].expected` is the exact stdout the program should print (trim trailing whitespace)
> - Generate 8–10 test cases covering: normal cases, single element, all same, negatives, large numbers, edge cases specific to the problem
> - If the problem is on LeetCode, use the official problem statement as reference
> - Output ONLY the `.js` file content, nothing else

---

### Prompt 2 — Send this for EVERY problem (change only the last word)

> Generate: **Array Sum**

That's it. Change `Array Sum` to whatever problem title you want from the table above.
