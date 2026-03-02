/**
 * Find Peak Element — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the index of any peak element found.
 */

module.exports = {
  id: 'find-peak-element',
  conquestId: 'stage4-29',
  title: 'Find Peak Element',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `A peak element is an element that is strictly greater than its neighbors.

Given an integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to **any of the peaks**.

You may imagine that \`nums[-1] = nums[n] = -∞\`. In other words, an element is always considered to be strictly greater than a neighbor that is outside the array.

### Task
You must write an algorithm that runs in $O(\log n)$ time.
1. Use **Binary Search**.
2. Compare \`nums[mid]\` with its right neighbor \`nums[mid + 1]\`.
3. If \`nums[mid] < nums[mid + 1]\`, you are currently on an upward slope. A peak must exist to the right, so move \`left = mid + 1\`.
4. If \`nums[mid] > nums[mid + 1]\`, you are on a downward slope. A peak exists at \`mid\` or to its left, so move \`right = mid\`.
5. The loop converges when \`left == right\`.

### Example
**Input:**
\`\`\`
4
1 2 3 1
\`\`\`

**Output:**
\`\`\`
2
\`\`\`

**Explanation:**
3 is a peak element and your function should return the index number 2.`,

  examples: [
    {
      input: '4\n1 2 3 1',
      output: '2',
      explanation: 'Index 2 is a peak because 3 > 2 and 3 > 1.'
    },
    {
      input: '7\n1 2 1 3 5 6 4',
      output: '5',
      explanation: 'Your function can return index 1 (where element is 2) or index 5 (where element is 6).'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '-2³¹ ≤ nums[i] ≤ 2³¹ - 1',
    'nums[i] ≠ nums[i + 1] for all valid i.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the index of any peak element.
 */
int solve(int n, vector<int>& nums) {
    int left = 0, right = n - 1;
    // Your code here
    
    return left;
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
     * Returns the index of any peak element.
     */
    public static int solve(int n, int[] nums) {
        int left = 0, right = n - 1;
        // Your code here
        
        return left;
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
    { input: '4\n1 2 3 1', expected: '2' },
    { input: '7\n1 2 1 3 5 6 4', expected: '5' },
    { input: '1\n10', expected: '0' },
    { input: '2\n1 2', expected: '1' },
    { input: '2\n2 1', expected: '0' },
    { input: '3\n1 2 3', expected: '2' },
    { input: '3\n3 2 1', expected: '0' },
    { input: '5\n1 2 3 4 5', expected: '4' },
    { input: '5\n5 4 3 2 1', expected: '0' },
    { input: '6\n1 5 2 4 3 6', expected: '1' }
  ]
};