/**
 * Subarray Sum Equals K — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers representing the array nums.
 * Line 3: An integer k, the target sum.
 *
 * Output format (stdout):
 * A single integer representing the total number of subarrays whose sum equals to k.
 */

module.exports = {
  id: 'subarray-sum-equals-k',
  conquestId: 'stage3-5',
  title: 'Subarray Sum Equals K',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Hash Table', 'Prefix Sum'],

  description: `Given an array of integers \`nums\` and an integer \`k\`, return *the total number of subarrays whose sum equals to* \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array.

### Task
Implement an efficient solution using a **Hash Map** and **Prefix Sums**. The goal is to find the number of subarrays ending at the current index whose sum is \`k\`. This is equivalent to finding how many times the prefix sum \`currentSum - k\` has occurred before.

### Example
**Input:**
\`\`\`
3
1 1 1
2
\`\`\`

**Output:**
\`\`\`
2
\`\`\`

**Explanation:**
The subarrays with sum 2 are \`\` (indices 0 to 1) and \`\` (indices 1 to 2).`,

  examples: [
    {
      input: '3\n1 1 1\n2',
      output: '2',
      explanation: 'Subarrays at index (0,1) and (1,2) sum to 2.'
    },
    {
      input: '3\n1 2 3\n3',
      output: '2',
      explanation: 'Subarrays and sum to 3.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 2 × 10⁴',
    '-1000 ≤ nums[i] ≤ 1000',
    '-10⁷ ≤ k ≤ 10⁷'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

/**
 * Returns the number of subarrays with sum equal to k.
 */
int solve(int n, vector<int>& nums, int k) {
    int count = 0;
    // Your code here
    
    return count;
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
import java.util.HashMap;
import java.util.Map;

public class Main {
    /**
     * Returns the number of subarrays with sum equal to k.
     */
    public static int solve(int n, int[] nums, int k) {
        int count = 0;
        // Your code here
        
        return count;
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
    { input: '3\n1 1 1\n2', expected: '2' },
    { input: '3\n1 2 3\n3', expected: '2' },
    { input: '1\n1\n0', expected: '0' },
    { input: '1\n5\n5', expected: '1' },
    { input: '4\n0 0 0 0\n0', expected: '10' },
    { input: '5\n1 -1 1 -1 1\n0', expected: '4' },
    { input: '6\n10 2 -2 -20 10 1\n-10', expected: '3' },
    { input: '2\n-1 -1\n-2', expected: '1' },
    { input: '5\n3 4 7 2 -3\n7', expected: '4' },
    { input: '8\n1 2 3 4 5 6 7 8\n10', expected: '1' }
  ]
};