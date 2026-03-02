/**
 * Binary Search Basic — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the sorted array.
 * Line 2: n space-separated sorted integers.
 * Line 3: An integer target to search for.
 *
 * Output format (stdout):
 * A single integer representing the 0-based index of the target.
 * If the target is not found, return -1.
 */

module.exports = {
  id: 'binary-search-basic',
  conquestId: 'stage4-22',
  title: 'Binary Search Basic',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. 

If \`target\` exists, then return its index. Otherwise, return \`-1\`.

### Task
Implement a solution with $O(\log n)$ runtime complexity.
1. Initialize two pointers: \`left = 0\` and \`right = n - 1\`.
2. While \`left <= right\`:
    - Calculate the middle index: $mid = left + \lfloor \frac{right - left}{2} \rfloor$.
    - If \`nums[mid] == target\`, return \`mid\`.
    - If \`nums[mid] < target\`, the target must be in the right half, so set \`left = mid + 1\`.
    - If \`nums[mid] > target\`, the target must be in the left half, so set \`right = mid - 1\`.
3. If the loop ends without finding the target, return \`-1\`.

### Example
**Input:**
\`\`\`
6
-1 0 3 5 9 12
9
\`\`\`

**Output:**
\`\`\`
4
\`\`\`

**Explanation:**
9 exists in \`nums\` and its index is 4.`,

  examples: [
    {
      input: '6\n-1 0 3 5 9 12\n9',
      output: '4',
      explanation: '9 is at index 4.'
    },
    {
      input: '6\n-1 0 3 5 9 12\n2',
      output: '-1',
      explanation: '2 does not exist in the array.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁴',
    '-10⁴ < nums[i], target < 10⁴',
    'All the integers in nums are unique.',
    'nums is sorted in ascending order.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Performs binary search to find target in a sorted array.
 */
int solve(int n, vector<int>& nums, int target) {
    // Your code here
    
    return -1;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    cout << solve(n, nums, target) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Performs binary search to find target in a sorted array.
     */
    public static int solve(int n, int[] nums, int target) {
        // Your code here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        System.out.println(solve(n, nums, target));
    }
}`
  },

  testCases: [
    { input: '6\n-1 0 3 5 9 12\n9', expected: '4' },
    { input: '6\n-1 0 3 5 9 12\n2', expected: '-1' },
    { input: '1\n5\n5', expected: '0' },
    { input: '1\n5\n-5', expected: '-1' },
    { input: '2\n1 3\n3', expected: '1' },
    { input: '5\n1 2 3 4 5\n1', expected: '0' },
    { input: '5\n1 2 3 4 5\n5', expected: '4' },
    { input: '10\n10 20 30 40 50 60 70 80 90 100\n70', expected: '6' },
    { input: '4\n-10 -5 0 5\n0', expected: '2' },
    { input: '3\n2 5 8\n10', expected: '-1' }
  ]
};