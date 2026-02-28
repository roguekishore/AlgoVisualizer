/**
 * Sum of Subarray Ranges — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the sum of all subarray ranges.
 */

module.exports = {
  id: 'sum-of-subarray-ranges',
  conquestId: 'stage3-4',
  title: 'Sum of Subarray Ranges',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Stack', 'Monotonic Stack'],

  description: `You are given an integer array \`nums\`. The **range** of a subarray of \`nums\` is the difference between the largest and smallest element in the subarray.

Return *the **sum of all** subarray ranges of* \`nums\`.

A subarray is a contiguous **non-empty** sequence of elements within an array.

### Task
Implement a solution to find the total sum of (max - min) for every possible subarray. While an $O(n^2)$ solution works for smaller constraints, an $O(n)$ approach using **Monotonic Stacks** is the optimized way to solve this by calculating how many subarrays each element acts as a minimum and a maximum.

### Example
**Input:**
\`\`\`
3
1 2 3
\`\`\`

**Output:**
\`\`\`
4
\`\`\`

**Explanation:**
The 6 subarrays of are:
-, range = 1-1 = 0
-, range = 2-2 = 0
-, range = 3-3 = 0
-, range = 2-1 = 1
-, range = 3-2 = 1
-, range = 3-1 = 2
Sum of ranges = 0 + 0 + 0 + 1 + 1 + 2 = 4.`,

  examples: [
    {
      input: '3\n1 2 3',
      output: '4',
      explanation: 'Subarrays:,,,,,. Ranges: 0,0,0,1,1,2. Total = 4.'
    },
    {
      input: '4\n1 3 3',
      output: '4',
      explanation: 'Subarrays:,,,,,. Ranges: 0,0,0,2,0,2. Total = 4.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000 (For judge version)',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    'The final answer fits in a 64-bit integer.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns the sum of all subarray ranges.
 */
long long solve(int n, vector<int>& nums) {
    long long totalSum = 0;
    // Your code here
    
    return totalSum;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    cout << solve(n, nums) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the sum of all subarray ranges.
     */
    public static long solve(int n, int[] nums) {
        long totalSum = 0;
        // Your code here
        
        return totalSum;
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
    { input: '3\n4 -2 -3', expected: '10' },
    { input: '1\n10', expected: '0' },
    { input: '2\n1 5', expected: '4' },
    { input: '4\n1 1 1 1', expected: '0' },
    { input: '5\n1 2 3 4 5', expected: '20' },
    { input: '3\n10 5 10', expected: '10' },
    { input: '4\n-1 0 1 2', expected: '10' },
    { input: '6\n1 3 5 2 4 6', expected: '56' },
    { input: '5\n10 1 10 1 10', expected: '72' }
  ]
};