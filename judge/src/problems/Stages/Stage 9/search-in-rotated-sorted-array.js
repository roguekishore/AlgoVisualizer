/**
 * Search in Rotated Sorted Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers (the rotated sorted array).
 * Line 3: An integer target.
 *
 * Output format (stdout):
 * A single integer representing the 0-based index of the target.
 * If target is not found, return -1.
 */

module.exports = {
  id: 'search-in-rotated-sorted-array',
  conquestId: 'stage4-27',
  title: 'Search in Rotated Sorted Array',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` ($1 \le k < nums.length$) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums, nums, ..., nums[k-1]]\`.

For example, \`\` might be rotated at pivot index 3 and become \`\`.

Given the array \`nums\` **after** the rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

### Task
You must write an algorithm with $O(\log n)$ runtime complexity.
1. Use **Binary Search**. 
2. In every step, one half (either \`left\` to \`mid\` or \`mid\` to \`right\`) **must** be sorted.
3. Identify which half is sorted:
   - If \`nums[left] <= nums[mid]\`, the left side is sorted.
   - Otherwise, the right side is sorted.
4. Check if the \`target\` lies within the sorted half's range. If it does, drop the other half. If not, the target must be in the "unsorted" (rotated) half.

### Example
**Input:**
\`\`\`
7
4 5 6 7 0 1 2
0
\`\`\`

**Output:**
\`\`\`
4
\`\`\`

**Explanation:**
The target 0 is found at index 4.`,

  examples: [
    {
      input: '7\n4 5 6 7 0 1 2\n0',
      output: '4',
      explanation: 'Target 0 is at index 4.'
    },
    {
      input: '7\n4 5 6 7 0 1 2\n3',
      output: '-1',
      explanation: 'Target 3 is not in the array.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 5000',
    '-10⁴ ≤ nums[i], target ≤ 10⁴',
    'All values of nums are unique.',
    'nums is an ascending array that has been possibly rotated.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Searches for target in a rotated sorted array.
 */
int solve(int n, vector<int>& nums, int target) {
    int left = 0, right = n - 1;
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
     * Searches for target in a rotated sorted array.
     */
    public static int solve(int n, int[] nums, int target) {
        int left = 0, right = n - 1;
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
    { input: '7\n4 5 6 7 0 1 2\n0', expected: '4' },
    { input: '7\n4 5 6 7 0 1 2\n3', expected: '-1' },
    { input: '1\n1\n0', expected: '-1' },
    { input: '1\n1\n1', expected: '0' },
    { input: '2\n3 1\n1', expected: '1' },
    { input: '2\n3 1\n3', expected: '0' },
    { input: '5\n1 3 5 7 9\n3', expected: '1' },
    { input: '6\n5 6 7 8 1 2\n8', expected: '3' },
    { input: '4\n2 4 5 6\n4', expected: '1' },
    { input: '8\n4 5 6 7 8 1 2 3\n1', expected: '5' }
  ]
};