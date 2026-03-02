/**
 * Trapping Rain Water — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of bars.
 * Line 2: n space-separated integers representing the height of each bar.
 *
 * Output format (stdout):
 * A single integer representing the total units of water trapped between the bars.
 */

module.exports = {
  id: 'trapping-rain-water',
  conquestId: 'stage4-5',
  title: 'Trapping Rain Water',
  difficulty: 'Hard',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],

  description: `Given $n$ non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Task
Implement an $O(n)$ solution. While you can use dynamic programming (precomputing left and right max heights) or a monotonic stack, the **Two Pointer** approach is most space-efficient ($O(1)$ extra space).
1. Initialize \`left = 0\`, \`right = n-1\`.
2. Maintain \`leftMax\` and \`rightMax\`.
3. At each step, process the side with the smaller max height, as the water level is constrained by the "shorter" wall.

### Example
**Input:**
\`\`\`
12
0 1 0 2 1 0 1 3 2 1 2 1
\`\`\`

**Output:**
\`\`\`
6
\`\`\`

**Explanation:**
The elevation map is. In this case, 6 units of rain water are being trapped.`,

  examples: [
    {
      input: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
      output: '6',
      explanation: 'Water is trapped at indices 2, 4, 5, 6, 9, and 10.'
    },
    {
      input: '6\n4 2 0 3 2 5',
      output: '9',
      explanation: 'Water is trapped between heights 4 and 5.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 2 × 10⁴',
    '0 ≤ height[i] ≤ 10⁵'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns the total units of trapped rain water.
 */
int solve(int n, vector<int>& height) {
    if (n == 0) return 0;
    int trappedWater = 0;
    // Your code here
    
    return trappedWater;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> height(n);
    for (int i = 0; i < n; i++) cin >> height[i];
    
    cout << solve(n, height) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the total units of trapped rain water.
     */
    public static int solve(int n, int[] height) {
        if (n == 0) return 0;
        int trappedWater = 0;
        // Your code here
        
        return trappedWater;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] height = new int[n];
        for (int i = 0; i < n; i++) height[i] = sc.nextInt();
        
        System.out.println(solve(n, height));
    }
}`
  },

  testCases: [
    { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expected: '6' },
    { input: '6\n4 2 0 3 2 5', expected: '9' },
    { input: '3\n3 0 3', expected: '3' },
    { input: '3\n1 2 3', expected: '0' },
    { input: '3\n3 2 1', expected: '0' },
    { input: '5\n1 0 1 0 1', expected: '2' },
    { input: '6\n5 0 0 0 0 5', expected: '20' },
    { input: '1\n10', expected: '0' },
    { input: '4\n0 0 0 0', expected: '0' },
    { input: '10\n2 0 2 0 2 0 2 0 2 0', expected: '8' }
  ]
};