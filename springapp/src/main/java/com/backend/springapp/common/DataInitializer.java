package com.backend.springapp.common;

import com.backend.springapp.problem.Problem;
import com.backend.springapp.problem.ProblemStage;
import com.backend.springapp.problem.Stage;
import com.backend.springapp.problem.Tag;
import com.backend.springapp.problem.ProblemRepository;
import com.backend.springapp.problem.ProblemStageRepository;
import com.backend.springapp.problem.StageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds the database with stages (from DSA Conquest Map) and
 * all 164 problems with their stage associations on application startup.
 * Only runs if the database is empty (no existing stages).
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StageRepository stageRepository;
    private final ProblemRepository problemRepository;
    private final ProblemStageRepository problemStageRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (stageRepository.count() > 0) {
            log.info("Database already seeded. Skipping data initialization.");
            return;
        }

        log.info("Starting database seeding...");

        // 1. Seed all 27 stages
        Map<String, Stage> stageMap = seedStages();

        // 2. Seed all 164 problems with stage associations
        seedProblems(stageMap);

        log.info("Database seeding completed successfully.");
    }

    /**
     * Seeds the 27 stages.
     * Returns a map of stageKey -> Stage entity for association.
     */
    private Map<String, Stage> seedStages() {
        // LinkedHashMap preserves insertion order
        Map<String, String> stages = new LinkedHashMap<>();
        stages.put("1", "Absolute Programming Basics");
        stages.put("2", "Array Index Manipulation");
        stages.put("3", "Prefix & Subarray Thinking");
        stages.put("4", "Two Pointers");
        stages.put("5", "Sliding Window");
        stages.put("6", "String Fundamentals");
        stages.put("7", "Advanced Strings");
        stages.put("8", "Binary Search – Core");
        stages.put("9", "Binary Search – Advanced");
        stages.put("10", "Linked List – Construction");
        stages.put("11", "Linked List – LC Problems");
        stages.put("12", "Stack – Fundamentals");
        stages.put("13", "Stack – Applications");
        stages.put("14", "Queue");
        stages.put("15", "Sorting");
        stages.put("16", "Heaps & Priority Queues");
        stages.put("17", "Trees – Construction");
        stages.put("18", "Trees – Traversals & Properties");
        stages.put("19", "Trees – Views & Transformations");
        stages.put("20", "Graphs & Grids");
        stages.put("21", "Recursion & Backtracking");
        stages.put("22", "Dynamic Programming");
        stages.put("23", "Greedy Algorithms");
        stages.put("24", "Design & Systems");
        stages.put("A", "Bit Manipulation");
        stages.put("B", "Mathematical & Miscellaneous");
        stages.put("C", "Hashing Patterns");

        Map<String, Stage> stageMap = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : stages.entrySet()) {
            Stage stage = new Stage();
            stage.setName(entry.getValue());
            stage = stageRepository.save(stage);
            stageMap.put(entry.getKey(), stage);
            log.debug("Seeded stage: {} - {}", entry.getKey(), entry.getValue());
        }

        log.info("Seeded {} stages.", stageMap.size());
        return stageMap;
    }

    /**
     * Seeds all 164 problems and creates ProblemStage associations.
     */
    private void seedProblems(Map<String, Stage> stageMap) {
        List<ProblemSeed> seeds = buildProblemSeeds();
        int count = 0;

        for (ProblemSeed seed : seeds) {
            Problem problem = new Problem();
            problem.setTitle(seed.title);
            problem.setLcslug(seed.lcSlug);
            problem.setTag(seed.tag);
            problem.setHasVisualizer(seed.hasVisualizer);
            problem.setDescription(null);

            problem = problemRepository.save(problem);

            // Create ProblemStage association
            Stage stage = stageMap.get(seed.stageKey);
            if (stage != null) {
                ProblemStage ps = new ProblemStage();
                ps.setProblem(problem);
                ps.setStage(stage);
                problemStageRepository.save(ps);
            }

            count++;
        }

        log.info("Seeded {} problems with stage associations.", count);
    }

    /**
     * Builds the complete list of 164 problems in learning path order.
     * Mirrors the exact data from dsa-conquest-map.js ALL_PROBLEMS array.
     */
    private List<ProblemSeed> buildProblemSeeds() {
        return List.of(
            // =====================================================================
            // STAGE 1: Absolute Programming Basics (7 problems)
            // =====================================================================
            p("Find Maximum Element", null, Tag.EASY, true, "1"),
            p("Find Minimum Element", null, Tag.EASY, true, "1"),
            p("Array Sum", null, Tag.EASY, true, "1"),
            p("Reverse Array", null, Tag.EASY, true, "1"),
            p("Count Zeros in Array", null, Tag.EASY, true, "1"),
            p("Insert Element at Index", null, Tag.EASY, false, "1"),
            p("Delete Element at Index", null, Tag.EASY, false, "1"),

            // =====================================================================
            // STAGE 2: Array Index Manipulation (5 problems)
            // =====================================================================
            p("Linear Search in Array", null, Tag.EASY, false, "2"),
            p("Linear Search", null, Tag.EASY, true, "2"),
            p("Move Zeros", "move-zeroes", Tag.EASY, true, "2"),
            p("Rotate Array", "rotate-array", Tag.MEDIUM, true, "2"),
            p("Squares of a Sorted Array", "squares-of-a-sorted-array", Tag.EASY, true, "2"),

            // =====================================================================
            // STAGE 3: Prefix & Subarray Thinking (6 problems)
            // =====================================================================
            p("Prefix Sum Construction", null, Tag.EASY, false, "3"),
            p("Maximum Subarray", "maximum-subarray", Tag.MEDIUM, true, "3"),
            p("Product of Array Except Self", "product-of-array-except-self", Tag.MEDIUM, true, "3"),
            p("Sum of Subarray Ranges", "sum-of-subarray-ranges", Tag.MEDIUM, true, "3"),
            p("Subarray Sum Equals K", "subarray-sum-equals-k", Tag.MEDIUM, true, "3"),
            p("Split Array Largest Sum", "split-array-largest-sum", Tag.HARD, true, "3"),

            // =====================================================================
            // STAGE 4: Two Pointers (5 problems)
            // =====================================================================
            p("Two Sum", "two-sum", Tag.EASY, true, "4"),
            p("3Sum", "3sum", Tag.MEDIUM, true, "4"),
            p("4Sum", "4sum", Tag.MEDIUM, true, "4"),
            p("Container With Most Water", "container-with-most-water", Tag.MEDIUM, true, "4"),
            p("Trapping Rain Water", "trapping-rain-water", Tag.HARD, true, "4"),

            // =====================================================================
            // STAGE 5: Sliding Window (5 problems)
            // =====================================================================
            p("Max Consecutive Ones III", "max-consecutive-ones-iii", Tag.MEDIUM, true, "5"),
            p("Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", Tag.MEDIUM, true, "5"),
            p("Fruit Into Baskets", "fruit-into-baskets", Tag.MEDIUM, true, "5"),
            p("Minimum Window Substring", "minimum-window-substring", Tag.HARD, true, "5"),
            p("Sliding Window Maximum", "sliding-window-maximum", Tag.HARD, true, "5"),

            // =====================================================================
            // STAGE 6: String Fundamentals (5 problems)
            // =====================================================================
            p("Palindrome Check", "valid-palindrome", Tag.EASY, true, "6"),
            p("Reverse String", "reverse-string", Tag.EASY, true, "6"),
            p("Count Vowels", null, Tag.EASY, true, "6"),
            p("Valid Anagram", "valid-anagram", Tag.EASY, true, "6"),
            p("First Unique Character", "first-unique-character-in-a-string", Tag.EASY, true, "6"),

            // =====================================================================
            // STAGE 7: Advanced Strings (6 problems)
            // =====================================================================
            p("Longest Common Prefix", "longest-common-prefix", Tag.EASY, true, "7"),
            p("String Compression", "string-compression", Tag.MEDIUM, true, "7"),
            p("Reverse Words in a String", "reverse-words-in-a-string", Tag.MEDIUM, true, "7"),
            p("Is Subsequence", "is-subsequence", Tag.EASY, true, "7"),
            p("Group Anagrams", "group-anagrams", Tag.MEDIUM, true, "7"),
            p("Longest Palindromic Substring", "longest-palindromic-substring", Tag.MEDIUM, true, "7"),

            // =====================================================================
            // STAGE 8: Binary Search – Core (5 problems)
            // =====================================================================
            p("Binary Search Basic", "binary-search", Tag.EASY, true, "8"),
            p("Peak Index in Mountain Array", "peak-index-in-a-mountain-array", Tag.MEDIUM, true, "8"),
            p("Find First and Last Position", "find-first-and-last-position-of-element-in-sorted-array", Tag.MEDIUM, true, "8"),
            p("Kth Missing Positive Number", "kth-missing-positive-number", Tag.EASY, true, "8"),
            p("Find Smallest Letter Greater Than Target", "find-smallest-letter-greater-than-target", Tag.EASY, true, "8"),

            // =====================================================================
            // STAGE 9: Binary Search – Advanced (9 problems)
            // =====================================================================
            p("Search in Rotated Sorted Array", "search-in-rotated-sorted-array", Tag.MEDIUM, true, "9"),
            p("Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", Tag.MEDIUM, true, "9"),
            p("Find Peak Element", "find-peak-element", Tag.MEDIUM, true, "9"),
            p("Search a 2D Matrix", "search-a-2d-matrix", Tag.MEDIUM, true, "9"),
            p("Min Speed to Arrive on Time", "minimum-speed-to-arrive-on-time", Tag.MEDIUM, true, "9"),
            p("Median of Two Sorted Arrays", "median-of-two-sorted-arrays", Tag.HARD, true, "9"),
            p("Special Array With X Elements", "special-array-with-x-elements-greater-than-or-equal-x", Tag.EASY, true, "9"),
            p("Search in Sorted Array of Unknown Size", "search-in-a-sorted-array-of-unknown-size", Tag.MEDIUM, true, "9"),
            p("Exponential Search", null, Tag.MEDIUM, true, "9"),

            // =====================================================================
            // STAGE 10: Linked List – Construction (7 problems)
            // =====================================================================
            p("Build Linked List from Array", null, Tag.EASY, false, "10"),
            p("Insert at Head", null, Tag.EASY, false, "10"),
            p("Insert at Tail", null, Tag.EASY, false, "10"),
            p("Insert at Position", null, Tag.EASY, false, "10"),
            p("Delete Node in Linked List", null, Tag.EASY, false, "10"),
            p("Search in Linked List", null, Tag.EASY, false, "10"),
            p("Design Linked List", "design-linked-list", Tag.MEDIUM, true, "10"),

            // =====================================================================
            // STAGE 11: Linked List – LC Problems (5 problems)
            // =====================================================================
            p("Reverse Linked List", "reverse-linked-list", Tag.EASY, true, "11"),
            p("Linked List Cycle", "linked-list-cycle", Tag.EASY, true, "11"),
            p("Merge Two Sorted Lists", "merge-two-sorted-lists", Tag.EASY, true, "11"),
            p("Sort List", "sort-list", Tag.MEDIUM, true, "11"),
            p("Swap Nodes in Pairs", "swap-nodes-in-pairs", Tag.MEDIUM, true, "11"),

            // =====================================================================
            // STAGE 12: Stack – Fundamentals (4 problems)
            // =====================================================================
            p("Stack Push / Pop / Peek", null, Tag.EASY, false, "12"),
            p("Stack Operations", null, Tag.EASY, true, "12"),
            p("Valid Parentheses", "valid-parentheses", Tag.EASY, false, "12"),
            p("Min Stack", "min-stack", Tag.MEDIUM, true, "12"),

            // =====================================================================
            // STAGE 13: Stack – Applications (4 problems)
            // =====================================================================
            p("Next Greater Element", "next-greater-element-i", Tag.EASY, true, "13"),
            p("Remove K Digits", "remove-k-digits", Tag.MEDIUM, true, "13"),
            p("Largest Rectangle in Histogram", "largest-rectangle-in-histogram", Tag.HARD, true, "13"),
            p("Sum of Subarray Ranges (Stack)", "sum-of-subarray-ranges", Tag.MEDIUM, true, "13"),

            // =====================================================================
            // STAGE 14: Queue (4 problems)
            // =====================================================================
            p("Queue using Array (Enqueue/Dequeue)", null, Tag.EASY, false, "14"),
            p("Basic Queue", null, Tag.EASY, true, "14"),
            p("Circular Queue", "design-circular-queue", Tag.MEDIUM, true, "14"),
            p("Implement Queue using Stacks", "implement-queue-using-stacks", Tag.EASY, true, "14"),

            // =====================================================================
            // STAGE 15: Sorting (8 problems)
            // =====================================================================
            p("Quadratic Sorting (Bubble, Selection, Insertion)", null, Tag.EASY, true, "15"),
            p("Efficient Sorting (Merge, Quick, Heap)", "sort-an-array", Tag.MEDIUM, true, "15"),
            p("Counting Sort", null, Tag.EASY, true, "15"),
            p("Radix Sort", null, Tag.MEDIUM, true, "15"),
            p("Bucket Sort", null, Tag.MEDIUM, true, "15"),
            p("Shell Sort", null, Tag.MEDIUM, true, "15"),
            p("Comb Sort", null, Tag.MEDIUM, true, "15"),
            p("Pancake Sort", "pancake-sorting", Tag.MEDIUM, true, "15"),

            // =====================================================================
            // STAGE 16: Heaps & Priority Queues (4 problems)
            // =====================================================================
            p("Heapify (Build Heap)", null, Tag.MEDIUM, true, "16"),
            p("Top K Frequent Elements", "top-k-frequent-elements", Tag.MEDIUM, true, "16"),
            p("Task Scheduler", "task-scheduler", Tag.MEDIUM, true, "16"),
            p("Maximum Gap", "maximum-gap", Tag.MEDIUM, true, "16"),

            // =====================================================================
            // STAGE 17: Trees – Construction (5 problems)
            // =====================================================================
            p("Build Binary Tree (Level Order)", null, Tag.EASY, false, "17"),
            p("Search in Binary Tree", null, Tag.EASY, false, "17"),
            p("Insert in Binary Search Tree", null, Tag.EASY, false, "17"),
            p("Search in Binary Search Tree", null, Tag.EASY, false, "17"),
            p("Construct Binary Tree from Preorder and Inorder", "construct-binary-tree-from-preorder-and-inorder-traversal", Tag.MEDIUM, true, "17"),

            // =====================================================================
            // STAGE 18: Trees – Traversals & Properties (5 problems)
            // =====================================================================
            p("Morris Traversal (Inorder)", "binary-tree-inorder-traversal", Tag.MEDIUM, true, "18"),
            p("Validate Binary Search Tree", "validate-binary-search-tree", Tag.MEDIUM, true, "18"),
            p("AVL Tree Visualizer", "balanced-binary-tree", Tag.MEDIUM, true, "18"),
            p("Symmetric Tree", "symmetric-tree", Tag.EASY, true, "18"),
            p("Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", Tag.MEDIUM, true, "18"),

            // =====================================================================
            // STAGE 19: Trees – Views & Transformations (4 problems)
            // =====================================================================
            p("Binary Tree Right Side View", "binary-tree-right-side-view", Tag.MEDIUM, true, "19"),
            p("Print Binary Tree", "print-binary-tree", Tag.MEDIUM, true, "19"),
            p("LCA of Deepest Leaves", "lowest-common-ancestor-of-deepest-leaves", Tag.MEDIUM, true, "19"),
            p("Flatten Binary Tree to Linked List", "flatten-binary-tree-to-linked-list", Tag.MEDIUM, true, "19"),

            // =====================================================================
            // STAGE 20: Graphs & Grids (9 problems)
            // =====================================================================
            p("DFS (Graph)", null, Tag.MEDIUM, true, "20"),
            p("BFS (Graph)", null, Tag.MEDIUM, true, "20"),
            p("Number of Islands", "number-of-islands", Tag.MEDIUM, true, "20"),
            p("Flood Fill", "flood-fill", Tag.EASY, true, "20"),
            p("Dijkstra's Algorithm", null, Tag.MEDIUM, true, "20"),
            p("Topological Sort", "course-schedule", Tag.MEDIUM, true, "20"),
            p("Kruskal's MST", null, Tag.MEDIUM, true, "20"),
            p("A* Pathfinding", null, Tag.HARD, true, "20"),
            p("Network Flow (Edmonds-Karp/Dinic)", null, Tag.HARD, true, "20"),

            // =====================================================================
            // STAGE 21: Recursion & Backtracking (13 problems)
            // =====================================================================
            p("Recursion Call Stack Visualization", null, Tag.EASY, false, "21"),
            p("Fibonacci", "fibonacci-number", Tag.EASY, true, "21"),
            p("Factorial", null, Tag.EASY, true, "21"),
            p("Binary Search (Recursive)", "binary-search", Tag.EASY, true, "21"),
            p("Tower of Hanoi", null, Tag.MEDIUM, true, "21"),
            p("Subset Sum", null, Tag.MEDIUM, true, "21"),
            p("Permutations", "permutations", Tag.MEDIUM, true, "21"),
            p("N-Queens", "n-queens", Tag.HARD, true, "21"),
            p("Rat in a Maze", null, Tag.MEDIUM, true, "21"),
            p("Word Search", "word-search", Tag.MEDIUM, true, "21"),
            p("Sudoku Solver", "sudoku-solver", Tag.HARD, true, "21"),
            p("Expression Add Operators", "expression-add-operators", Tag.HARD, true, "21"),
            p("Knight's Tour", null, Tag.HARD, true, "21"),

            // =====================================================================
            // STAGE 22: Dynamic Programming (9 problems)
            // =====================================================================
            p("Unique Paths", "unique-paths", Tag.MEDIUM, true, "22"),
            p("0/1 Knapsack", "partition-equal-subset-sum", Tag.MEDIUM, true, "22"),
            p("Coin Change", "coin-change", Tag.MEDIUM, true, "22"),
            p("Longest Increasing Subsequence", "longest-increasing-subsequence", Tag.MEDIUM, true, "22"),
            p("Longest Common Subsequence", "longest-common-subsequence", Tag.MEDIUM, true, "22"),
            p("Edit Distance", "edit-distance", Tag.MEDIUM, true, "22"),
            p("Burst Balloons", "burst-balloons", Tag.HARD, true, "22"),
            p("Burst Balloons (Top Down)", "burst-balloons", Tag.HARD, true, "22"),
            p("Best Time to Buy and Sell Stock IV", "best-time-to-buy-and-sell-stock-iv", Tag.HARD, true, "22"),

            // =====================================================================
            // STAGE 23: Greedy Algorithms (8 problems)
            // =====================================================================
            p("Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", Tag.EASY, true, "23"),
            p("Best Time to Buy and Sell Stock II", "best-time-to-buy-and-sell-stock-ii", Tag.MEDIUM, true, "23"),
            p("Assign Cookies", "assign-cookies", Tag.EASY, true, "23"),
            p("Two City Scheduling", "two-city-scheduling", Tag.MEDIUM, true, "23"),
            p("Maximum Profit in Job Scheduling", "maximum-profit-in-job-scheduling", Tag.HARD, true, "23"),
            p("Merge Intervals", "merge-intervals", Tag.MEDIUM, true, "23"),
            p("Jump Game II", "jump-game-ii", Tag.MEDIUM, true, "23"),
            p("Gas Station", "gas-station", Tag.MEDIUM, true, "23"),

            // =====================================================================
            // STAGE 24: Design & Systems (4 problems)
            // =====================================================================
            p("Design HashMap", "design-hashmap", Tag.EASY, true, "24"),
            p("Design Linked List", "design-linked-list", Tag.MEDIUM, true, "24"),
            p("LRU Cache", "lru-cache", Tag.MEDIUM, true, "24"),
            p("LFU Cache", "lfu-cache", Tag.HARD, true, "24"),

            // =====================================================================
            // BONUS STAGE A: Bit Manipulation (5 problems)
            // =====================================================================
            p("Single Number", "single-number", Tag.EASY, true, "A"),
            p("Number of 1 Bits", "number-of-1-bits", Tag.EASY, true, "A"),
            p("Counting Bits", "counting-bits", Tag.EASY, true, "A"),
            p("Reverse Bits", "reverse-bits", Tag.EASY, true, "A"),
            p("Power of Two", "power-of-two", Tag.EASY, true, "A"),

            // =====================================================================
            // BONUS STAGE B: Mathematical & Miscellaneous (5 problems)
            // =====================================================================
            p("Count Primes", "count-primes", Tag.MEDIUM, true, "B"),
            p("Excel Sheet Column Title", "excel-sheet-column-title", Tag.EASY, true, "B"),
            p("Factorial Trailing Zeroes", "factorial-trailing-zeroes", Tag.MEDIUM, true, "B"),
            p("Pow(x, n)", "powx-n", Tag.MEDIUM, true, "B"),
            p("Prime Palindrome", "prime-palindrome", Tag.MEDIUM, true, "B"),

            // =====================================================================
            // BONUS STAGE C: Hashing Patterns (2 problems)
            // =====================================================================
            p("Longest Consecutive Sequence", "longest-consecutive-sequence", Tag.MEDIUM, true, "C"),
            p("Equal Row and Column Pairs", "equal-row-and-column-pairs", Tag.MEDIUM, true, "C")
        );
    }

    /**
     * Helper to create a ProblemSeed record.
     */
    private static ProblemSeed p(String title, String lcSlug, Tag tag, boolean hasVisualizer, String stageKey) {
        return new ProblemSeed(title, lcSlug, tag, hasVisualizer, stageKey);
    }

    /**
     * Internal record for holding seed data before persistence.
     */
    private record ProblemSeed(
        String title,
        String lcSlug,
        Tag tag,
        boolean hasVisualizer,
        String stageKey
    ) {}
}
