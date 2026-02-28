/**
 * Split Array Largest Sum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array nums.
 * Line 2: n space-separated integers representing the array nums.
 * Line 3: An integer k, the number of non-empty continuous subarrays to split nums into.
 *
 * Output format (stdout):
 * A single integer representing the minimized largest sum of the split.
 */

module.exports = {
  id: 'split-array-largest-sum',
  conquestId: 'stage3-6',
  title: 'Split Array Largest Sum',
  difficulty: 'Hard',
  category: 'Arrays',
  tags: ['Array', 'Binary Search', 'Dynamic Programming', 'Greedy'],

  description: `Given an integer array \`nums\` and an integer \`k\`, split \`nums\` into \`k\` non-empty continuous subarrays such that the **largest sum** of any of these subarrays is **minimized**.

Return the minimized largest sum of the split.

### Task
Implement an efficient solution using **Binary Search on Answer**. 
1. The possible range for the answer is between \`max(nums)\` (at least one element must be in a subarray) and \`sum(nums)\` (all elements in one subarray).
2. For a mid-value in this range, check if it's possible to split the array into \`k\` or fewer subarrays such that no subarray sum exceeds \`mid\`.
3. Adjust the binary search range based on the possibility.

### Example
**Input:**
\`\`\`
5
7 2 5 10 8
2
\`\`\`

**Output:**
\`\`\`
18
\`\`\`

**Explanation:**
There are four ways to split \`nums\` into two subarrays.
The best way is to split it into \`\` and \`\`, where the largest sum among the two subarrays is only 18.`,

  examples: [
    {
      input: '5\n7 2 5 10 8\n2',
      output: '18',
      explanation: 'Optimal split: and. Max sum is 18.'
    },
    {
      input: '5\n1 2 3 4 5\n2',
      output: '9',
      explanation: 'Optimal split: and. Max sum is 9.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '0 ≤ nums[i] ≤ 10⁶',
    '1 ≤ k ≤ min(50, n)'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

/**
 * Returns the minimized largest sum of splitting nums into k subarrays.
 */
int solve(int n, vector<int>& nums, int k) {
    // Your code here
    
    return 0;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int k;
    cin >> k;
    
    cout << solve(n, nums, k) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the minimized largest sum of splitting nums into k subarrays.
     */
    public static int solve(int n, int[] nums, int k) {
        // Your code here
        
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int k = sc.nextInt();
        
        System.out.println(solve(n, nums, k));
    }
}`
  },

  testCases: [
    { input: '5\n7 2 5 10 8\n2', expected: '18' },
    { input: '5\n1 2 3 4 5\n2', expected: '9' },
    { input: '3\n1 4 4\n3', expected: '4' },
    { input: '1\n100\n1', expected: '100' },
    { input: '4\n10 20 30 40\n1', expected: '100' },
    { input: '4\n10 20 30 40\n4', expected: '40' },
    { input: '6\n1 1 1 1 1 1\n3', expected: '2' },
    { input: '2\n10 10\n1', expected: '20' },
    { input: '5\n10 2 3 4 10\n2', expected: '19' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n5', expected: '15' }
  ]
};