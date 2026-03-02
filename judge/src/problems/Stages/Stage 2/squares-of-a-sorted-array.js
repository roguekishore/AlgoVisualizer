/**
 * Squares of a Sorted Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers, sorted in non-decreasing order.
 *
 * Output format (stdout):
 * n space-separated integers, representing the squares of the input elements 
 * sorted in non-decreasing order.
 */

module.exports = {
  id: 'squares-of-a-sorted-array',
  conquestId: 'stage2-5',
  title: 'Squares of a Sorted Array',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'Sorting'],

  description: `Given an integer array \`nums\` sorted in **non-decreasing** order, return *an array of the **squares of each number** sorted in non-decreasing order*.

### Task
Implement an efficient $O(n)$ solution. Since the input array is already sorted, the largest squares will come from either the very small (negative) or very large (positive) numbers. You can use a **two-pointer** approach to compare squares from both ends and build the result.

### Example
**Input:**
\`\`\`
5
-4 -1 0 3 10
\`\`\`

**Output:**
\`\`\`
0 1 9 16 100
\`\`\`

**Explanation:**
After squaring, the array becomes.
After sorting, it becomes.`,

  examples: [
    {
      input: '5\n-4 -1 0 3 10',
      output: '0 1 9 16 100',
      explanation: 'Squares are, which sorted is.'
    },
    {
      input: '5\n-7 -3 2 3 11',
      output: '4 9 9 49 121',
      explanation: 'Squares are, which sorted is.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁴',
    '-10⁴ ≤ nums[i] ≤ 10⁴',
    'nums is sorted in non-decreasing order.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns an array of the squares of each number sorted in non-decreasing order.
 */
vector<int> solve(int n, vector<int>& nums) {
    vector<int> result(n);
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
    
    vector<int> result = solve(n, nums);
    
    for (int i = 0; i < n; i++) {
        cout << result[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns an array of the squares of each number sorted in non-decreasing order.
     */
    public static int[] solve(int n, int[] nums) {
        int[] result = new int[n];
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        int[] result = solve(n, nums);
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(result[i]);
            if (i < n - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '5\n-4 -1 0 3 10', expected: '0 1 9 16 100' },
    { input: '5\n-7 -3 2 3 11', expected: '4 9 9 49 121' },
    { input: '1\n-5', expected: '25' },
    { input: '1\n0', expected: '0' },
    { input: '4\n1 2 3 4', expected: '1 4 9 16' },
    { input: '4\n-4 -3 -2 -1', expected: '1 4 9 16' },
    { input: '3\n-2 -2 2', expected: '4 4 4' },
    { input: '6\n-10 -5 0 0 5 10', expected: '0 0 25 25 100 100' },
    { input: '2\n-1 1', expected: '1 1' },
    { input: '5\n-100 0 1 2 100', expected: '0 1 4 10000 10000' }
  ]
};