/**
 * Find Minimum in Rotated Sorted Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers (the rotated sorted array).
 *
 * Output format (stdout):
 * A single integer representing the minimum element in the array.
 */

module.exports = {
  id: 'find-minimum-in-rotated-sorted-array',
  conquestId: 'stage4-28',
  title: 'Find Minimum in Rotated Sorted Array',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `Suppose an array of length \`n\` sorted in ascending order is **rotated** between 1 and \`n\` times.

For example, the array \`nums =\` might become:
* \`\` if it was rotated 4 times.
* \`\` if it was rotated 7 times.

Given the sorted rotated array \`nums\` of **unique** elements, return the **minimum element** of this array.

### Task
You must write an algorithm that runs in $O(\log n)$ time.
1. Use **Binary Search**.
2. Compare \`nums[mid]\` with the rightmost element \`nums[right]\`.
3. If \`nums[mid] > nums[right]\`, the minimum must be in the right half (the inflection point is there).
4. If \`nums[mid] < nums[right]\`, the minimum is either \`mid\` or to the left.
5. Unlike standard binary search, you don't return immediately on a match; you narrow the range until \`left == right\`.

### Example
**Input:**
\`\`\`
5
3 4 5 1 2
\`\`\`

**Output:**
\`\`\`
1
\`\`\`

**Explanation:**
The original array was rotated 3 times.`,

  examples: [
    {
      input: '5\n3 4 5 1 2',
      output: '1',
      explanation: 'The minimum element is 1.'
    },
    {
      input: '7\n4 5 6 7 0 1 2',
      output: '0',
      explanation: 'The minimum element is 0.'
    },
    {
      input: '4\n11 13 15 17',
      output: '11',
      explanation: 'The array is not rotated (or rotated n times).'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 5000',
    '-5000 ≤ nums[i] ≤ 5000',
    'All the integers of nums are unique.',
    'nums is sorted and rotated between 1 and n times.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Finds the minimum element in a rotated sorted array.
 */
int solve(int n, vector<int>& nums) {
    int left = 0, right = n - 1;
    // Your code here
    
    return nums[left];
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
     * Finds the minimum element in a rotated sorted array.
     */
    public static int solve(int n, int[] nums) {
        int left = 0, right = n - 1;
        // Your code here
        
        return nums[left];
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
    { input: '5\n3 4 5 1 2', expected: '1' },
    { input: '7\n4 5 6 7 0 1 2', expected: '0' },
    { input: '4\n11 13 15 17', expected: '11' },
    { input: '2\n2 1', expected: '1' },
    { input: '1\n10', expected: '10' },
    { input: '3\n2 3 1', expected: '1' },
    { input: '3\n3 1 2', expected: '1' },
    { input: '5\n2 3 4 5 1', expected: '1' },
    { input: '6\n10 20 30 1 2 3', expected: '1' },
    { input: '8\n5 6 7 8 9 10 3 4', expected: '3' }
  ]
};