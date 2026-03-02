/**
 * 4Sum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array nums.
 * Line 2: n space-separated integers representing the array nums.
 * Line 3: An integer target.
 *
 * Output format (stdout):
 * Each unique quadruplet that sums to target on a new line.
 * The numbers within each quadruplet should be sorted in non-decreasing order.
 * The quadruplets themselves should be sorted lexicographically.
 */

module.exports = {
  id: '4sum',
  conquestId: 'stage4-3',
  title: '4Sum',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'Sorting'],

  description: `Given an array \`nums\` of $n$ integers, return an array of all the **unique** quadruplets \`[nums[a], nums[b], nums[c], nums[d]]\` such that:
1. \`0 <= a, b, c, d < n\`
2. \`a, b, c, and d\` are **distinct**.
3. \`nums[a] + nums[b] + nums[c] + nums[d] == target\`.

### Task
Implement an $O(n^3)$ solution. Similar to 3Sum:
1. Sort the array.
2. Use two nested loops to fix the first two elements (\`i\` and \`j\`).
3. Use a **Two Pointer** approach for the remaining two elements to find the sum \`target - nums[i] - nums[j]\`.
4. Skip duplicates at every level (loops and pointers) to ensure the result set contains only unique quadruplets.

### Example
**Input:**
\`\`\`
6
1 0 -1 0 -2 2
0
\`\`\`

**Output:**
\`\`\`
-2 -1 1 2
-2 0 0 2
-1 0 0 1
\`\`\``,

  examples: [
    {
      input: '6\n1 0 -1 0 -2 2\n0',
      output: '-2 -1 1 2\n-2 0 0 2\n-1 0 0 1',
      explanation: 'Three unique quadruplets sum up to 0.'
    },
    {
      input: '5\n2 2 2 2 2\n8',
      output: '2 2 2 2',
      explanation: 'Only one unique quadruplet exists.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 200',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Finds all unique quadruplets that sum to target.
 */
vector<vector<int>> solve(int n, vector<int>& nums, int target) {
    vector<vector<int>> result;
    // Your code here
    
    return result;
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
    
    vector<vector<int>> result = solve(n, nums, target);
    for (const auto& quad : result) {
        for (int i = 0; i < 4; i++) {
            cout << quad[i] << (i == 3 ? "" : " ");
        }
        cout << "\\n";
    }
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    /**
     * Finds all unique quadruplets that sum to target.
     */
    public static List<List<Integer>> solve(int n, int[] nums, int target) {
        List<List<Integer>> result = new ArrayList<>();
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        List<List<Integer>> result = solve(n, nums, target);
        for (List<Integer> quad : result) {
            System.out.println(quad.get(0) + " " + quad.get(1) + " " + quad.get(2) + " " + quad.get(3));
        }
    }
}`
  },

  testCases: [
    { input: '6\n1 0 -1 0 -2 2\n0', expected: '-2 -1 1 2\n-2 0 0 2\n-1 0 0 1' },
    { input: '5\n2 2 2 2 2\n8', expected: '2 2 2 2' },
    { input: '4\n1 1 1 1\n4', expected: '1 1 1 1' },
    { input: '4\n1 1 1 1\n3', expected: '' },
    { input: '7\n-3 -2 -1 0 0 1 2\n0', expected: '-3 -2 3 2\n-3 -1 1 3\n-3 0 0 3\n-2 -1 0 3\n-2 0 1 1\n-1 0 0 1' },
    { input: '6\n-5 -4 -3 -2 -1 0\n-10', expected: '-5 -4 -1 0\n-5 -3 -2 0\n-4 -3 -2 -1' },
    { input: '4\n0 0 0 0\n0', expected: '0 0 0 0' },
    { input: '5\n1 10 100 1000 10000\n1111', expected: '1 10 100 1000' },
    { input: '6\n1 2 3 4 5 6\n10', expected: '1 2 3 4' },
    { input: '8\n-2 -1 0 0 1 2 3 4\n3', expected: '-2 -1 2 4\n-2 0 1 4\n-2 0 2 3\n-2 1 1 3\n-1 0 0 4\n-1 0 1 3\n0 0 1 2' }
  ]
};