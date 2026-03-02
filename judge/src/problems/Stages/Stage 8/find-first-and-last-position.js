/**
 * Find First and Last Position of Element in Sorted Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated sorted integers (may contain duplicates).
 * Line 3: An integer target.
 *
 * Output format (stdout):
 * Two space-separated integers representing the starting and ending index 
 * of the target. If target is not found, return "-1 -1".
 */

module.exports = {
  id: 'find-first-and-last-position',
  conquestId: 'stage4-24',
  title: 'Find First and Last Position of Element in Sorted Array',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `Given an array of integers \`nums\` sorted in non-decreasing order, find the starting and ending position of a given \`target\` value.

If \`target\` is not found in the array, return \`[-1, -1]\`.

### Task
You must write an algorithm with $O(\log n)$ runtime complexity.
1. Use **Binary Search** to find the first occurrence of the target. 
   - When you find \`nums[mid] == target\`, don't stop; move your \`right\` pointer to \`mid - 1\` to see if there's an earlier occurrence.
2. Use a second **Binary Search** to find the last occurrence.
   - When you find \`nums[mid] == target\`, move your \`left\` pointer to \`mid + 1\` to see if there's a later occurrence.

### Example
**Input:**
\`\`\`
6
5 7 7 8 8 10
8
\`\`\`

**Output:**
\`\`\`
3 4
\`\`\`

**Explanation:**
The number 8 first appears at index 3 and last appears at index 4.`,

  examples: [
    {
      input: '6\n5 7 7 8 8 10\n8',
      output: '3 4',
      explanation: 'Target 8 is found at indices 3 and 4.'
    },
    {
      input: '6\n5 7 7 8 8 10\n6',
      output: '-1 -1',
      explanation: 'Target 6 is not in the array.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 10⁵',
    '-10⁹ ≤ nums[i], target ≤ 10⁹',
    'nums is a non-decreasing array.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns a pair containing the first and last position of target.
 */
pair<int, int> solve(int n, vector<int>& nums, int target) {
    // Your code here
    return {-1, -1};
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
    
    pair<int, int> res = solve(n, nums, target);
    cout << res.first << " " << res.second << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns an array containing the first and last position of target.
     */
    public static int[] solve(int n, int[] nums, int target) {
        // Your code here
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        int[] res = solve(n, nums, target);
        System.out.println(res + " " + res);
    }
}`
  },

  testCases: [
    { input: '6\n5 7 7 8 8 10\n8', expected: '3 4' },
    { input: '6\n5 7 7 8 8 10\n6', expected: '-1 -1' },
    { input: '0\n\n0', expected: '-1 -1' },
    { input: '1\n5\n5', expected: '0 0' },
    { input: '2\n2 2\n2', expected: '0 1' },
    { input: '5\n1 2 3 4 5\n3', expected: '2 2' },
    { input: '10\n1 1 1 2 2 2 2 3 3 3\n2', expected: '3 6' },
    { input: '4\n1 2 2 3\n2', expected: '1 2' },
    { input: '3\n1 1 1\n1', expected: '0 2' },
    { input: '5\n10 20 30 40 50\n10', expected: '0 0' }
  ]
};