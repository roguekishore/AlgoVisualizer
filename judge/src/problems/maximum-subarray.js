/**
 * Maximum Subarray — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the maximum sum of a contiguous subarray.
 */

module.exports = {
  id: 'maximum-subarray',
  conquestId: 'stage3-2',
  title: 'Maximum Subarray',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Dynamic Programming', 'Kadane\'s Algorithm'],

  description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.

A **subarray** is a contiguous part of an array.

### Task
Implement **Kadane's Algorithm** to solve this in $O(n)$ time. The idea is to iterate through the array, keeping track of the current maximum sum ending at each position and the overall maximum sum found so far.

### Example
**Input:**
\`\`\`
9
-2 1 -3 4 -1 2 1 -5 4
\`\`\`

**Output:**
\`\`\`
6
\`\`\`

**Explanation:**
The contiguous subarray \`[4, -1, 2, 1]\` has the largest sum = 6.`,

  examples: [
    {
      input: '9\n-2 1 -3 4 -1 2 1 -5 4',
      output: '6',
      explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.'
    },
    {
      input: '1\n1',
      output: '1',
      explanation: 'The only subarray is.'
    },
    {
      input: '5\n5 4 -1 7 8',
      output: '23',
      explanation: 'The entire array [5, 4, -1, 7, 8] has the largest sum 23.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁴ ≤ nums[i] ≤ 10⁴'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns the maximum subarray sum using Kadane's algorithm.
 */
int solve(int n, const vector<int>& nums) {
    int maxSoFar = nums;
    int currentMax = nums;
    
    // Your code here
    
    return maxSoFar;
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
     * Returns the maximum subarray sum using Kadane's algorithm.
     */
    public static int solve(int n, int[] nums) {
        int maxSoFar = nums;
        int currentMax = nums;
        
        // Your code here
        
        return maxSoFar;
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
    { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expected: '6' },
    { input: '1\n1', expected: '1' },
    { input: '5\n5 4 -1 7 8', expected: '23' },
    { input: '5\n-1 -2 -3 -4 -5', expected: '-1' },
    { input: '4\n-10 2 3 -1', expected: '5' },
    { input: '6\n-2 -1 -3 -4 -1 -2', expected: '-1' },
    { input: '3\n10 -20 15', expected: '15' },
    { input: '2\n-2 1', expected: '1' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10', expected: '55' },
    { input: '8\n-2 1 -3 4 -1 2 1 -5', expected: '6' }
  ]
};