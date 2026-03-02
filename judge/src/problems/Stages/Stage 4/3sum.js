/**
 * 3Sum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array nums.
 * Line 2: n space-separated integers representing the array nums.
 *
 * Output format (stdout):
 * Each unique triplet that sums to zero on a new line. 
 * The numbers within each triplet should be sorted in non-decreasing order.
 * The triplets themselves should be sorted lexicographically.
 */

module.exports = {
  id: '3sum',
  conquestId: 'stage4-2',
  title: '3Sum',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'Sorting'],

  description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must **not contain duplicate triplets**.

### Task
Implement an efficient $O(n^2)$ solution. A common approach is:
1. Sort the array.
2. Iterate through the array with a fixed element \`nums[i]\`.
3. Use a **Two Pointer** approach (\`left\` and \`right\`) on the remainder of the array to find pairs that sum to \`-nums[i]\`.
4. Skip duplicate values for \`i\`, \`left\`, and \`right\` to ensure unique triplets.

### Example
**Input:**
\`\`\`
6
-1 0 1 2 -1 -4
\`\`\`

**Output:**
\`\`\`
-1 -1 2
-1 0 1
\`\`\`

**Explanation:**
The unique triplets are [-1,-1,2] and [-1,0,1].`,

  examples: [
    {
      input: '6\n-1 0 1 2 -1 -4',
      output: '-1 -1 2\n-1 0 1',
      explanation: 'The two unique sets of 3 numbers that sum to 0.'
    },
    {
      input: '3\n0 1 1',
      output: '',
      explanation: 'No triplets sum to 0.'
    },
    {
      input: '3\n0 0 0',
      output: '0 0 0',
      explanation: 'One unique triplet found.'
    }
  ],

  constraints: [
    '3 ≤ n ≤ 3000',
    '-10⁵ ≤ nums[i] ≤ 10⁵'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Finds all unique triplets that sum to zero.
 */
vector<vector<int>> solve(int n, vector<int>& nums) {
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
    
    vector<vector<int>> result = solve(n, nums);
    for (const auto& triplet : result) {
        cout << triplet << " " << triplet << " " << triplet << "\\n";
    }
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    /**
     * Finds all unique triplets that sum to zero.
     */
    public static List<List<Integer>> solve(int n, int[] nums) {
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
        
        List<List<Integer>> result = solve(n, nums);
        for (List<Integer> triplet : result) {
            System.out.println(triplet.get(0) + " " + triplet.get(1) + " " + triplet.get(2));
        }
    }
}`
  },

  testCases: [
    { input: '6\n-1 0 1 2 -1 -4', expected: '-1 -1 2\n-1 0 1' },
    { input: '3\n0 0 0', expected: '0 0 0' },
    { input: '3\n0 1 1', expected: '' },
    { input: '4\n-2 0 1 1', expected: '-2 0 1' },
    { input: '5\n-1 -1 0 1 2', expected: '-1 -1 2\n-1 0 1' },
    { input: '10\n-4 -2 -2 -2 0 1 2 2 2 3', expected: '-4 1 3\n-4 2 2\n-2 0 2' },
    { input: '5\n0 0 0 0 0', expected: '0 0 0' },
    { input: '8\n-5 2 3 -2 0 1 -1 4', expected: '-5 1 4\n-5 2 3\n-2 -1 3\n-2 1 1\n-1 0 1' },
    { input: '4\n1 2 -2 -1', expected: '' },
    { input: '6\n-1 0 1 2 -1 -4', expected: '-1 -1 2\n-1 0 1' }
  ]
};