/**
 * Sum of Subarray Ranges (O(n) Stack) — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single long long integer representing the sum of all subarray ranges.
 */

module.exports = {
  id: 'sum-of-subarray-ranges-stack',
  conquestId: 'stage5-07',
  title: 'Sum of Subarray Ranges',
  difficulty: 'Hard',
  category: 'Stacks',
  tags: ['Stack', 'Monotonic Stack', 'Array', 'Math'],

  description: `The range of a subarray is the difference between its largest and smallest element. Given an array \`nums\`, return the sum of all subarray ranges.

While an $O(n^2)$ solution is possible for small inputs, we want the optimal **$O(n)$** solution using **Monotonic Stacks**.

### The Mathematical Insight
The sum of all ranges can be rewritten as:
$$\sum (\text{max} - \text{min}) = \sum \text{max} - \sum \text{min}$$

This means the problem boils down to two sub-problems:
1. Find the sum of the **minimum** of every subarray.
2. Find the sum of the **maximum** of every subarray.

### The Stack Strategy (Contribution Technique)
For each element \`nums[i]\`, we calculate how many subarrays it acts as the "Minimum." 
- Let \`L\` be the number of consecutive elements to the left greater than \`nums[i]\`.
- Let \`R\` be the number of consecutive elements to the right greater than or equal to \`nums[i]\`.
- The total subarrays where \`nums[i]\` is the minimum is $(L+1) \times (R+1)$.
- Its total contribution to $\sum \text{min}$ is $nums[i] \times (L+1) \times (R+1)$.

We use a **Monotonic Stack** to find the "Next Smaller" and "Previous Smaller" elements for every index in $O(n)$. We repeat the logic for "Next Greater" and "Previous Greater" to find the sum of maximums.

### Example
**Input:** \`\`
**Subarrays:** \`,,,,,\`
**Ranges:** \`0, 0, 0, 1, 1, 2\`
**Output:** \`4\``,

  examples: [
    {
      input: '3\n1 2 3',
      output: '4',
      explanation: 'Ranges: (2-1) + (3-2) + (3-1) = 1 + 1 + 2 = 4.'
    },
    {
      input: '4\n4 -2 -3 4',
      output: '59',
      explanation: 'Sum of (max - min) for all 10 subarrays.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ nums[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <stack>

using namespace std;

/**
 * Calculates the sum of all subarray ranges in O(n).
 */
long long solve(int n, vector<int>& nums) {
    auto getSum = [&](bool findMax) {
        vector<int> left(n), right(n);
        stack<int> st;
        long long total = 0;

        for (int i = 0; i < n; i++) {
            // Your logic here: find prev smaller/greater
        }
        
        while(!st.empty()) st.pop();

        for (int i = n - 1; i >= 0; i--) {
            // Your logic here: find next smaller/greater
        }

        for (int i = 0; i < n; i++) {
            total += (long long)nums[i] * (i - left[i]) * (right[i] - i);
        }
        return total;
    };

    return getSum(true) - getSum(false);
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << solve(n, nums) << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    /**
     * Calculates the sum of all subarray ranges in O(n).
     */
    public static long solve(int n, int[] nums) {
        return getSum(n, nums, true) - getSum(n, nums, false);
    }

    private static long getSum(int n, int[] nums, boolean findMax) {
        int[] left = new int[n];
        int[] right = new int[n];
        Stack<Integer> stack = new Stack<>();
        
        // Find boundaries using Monotonic Stack
        
        long total = 0;
        for (int i = 0; i < n; i++) {
            total += (long) nums[i] * (i - left[i]) * (right[i] - i);
        }
        return total;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(solve(n, nums));
    }
}`
  },

  testCases: [
    { input: '3\n1 2 3', expected: '4' },
    { input: '4\n4 -2 -3 4', expected: '59' },
    { input: '1\n10', expected: '0' },
    { input: '5\n1 3 3 1 5', expected: '42' }
  ]
};