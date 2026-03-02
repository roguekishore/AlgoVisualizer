/**
 * Container With Most Water — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of vertical lines.
 * Line 2: n space-separated integers representing the height of each line.
 *
 * Output format (stdout):
 * A single integer representing the maximum amount of water a container can store.
 */

module.exports = {
  id: 'container-with-most-water',
  conquestId: 'stage4-4',
  title: 'Container With Most Water',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'Greedy'],

  description: `You are given an integer array \`height\` of length $n$. There are $n$ vertical lines drawn such that the two endpoints of the $i^{th}$ line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.

### Task
Implement an $O(n)$ solution using the **Two Pointer** approach. 
1. Place one pointer at the beginning (\`left\`) and one at the end (\`right\`).
2. Calculate the area: \`(right - left) * min(height[left], height[right])\`.
3. Move the pointer pointing to the shorter line inward, as moving the pointer of the taller line would never increase the area (the height is limited by the shorter side).

### Example
**Input:**
\`\`\`
9
1 8 6 2 5 4 8 3 7
\`\`\`

**Output:**
\`\`\`
49
\`\`\`

**Explanation:**
The vertical lines are represented by the array. In this case, the max area of water the container can contain is 49 (between index 1 and 8).`,

  examples: [
    {
      input: '9\n1 8 6 2 5 4 8 3 7',
      output: '49',
      explanation: 'The distance between indices 1 and 8 is 7, and the height is min(8, 7) = 7. Area = 7 * 7 = 49.'
    },
    {
      input: '2\n1 1',
      output: '1',
      explanation: 'Distance is 1, height is 1. Area = 1 * 1 = 1.'
    }
  ],

  constraints: [
    '2 ≤ n ≤ 10⁵',
    '0 ≤ height[i] ≤ 10⁴'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns the maximum amount of water a container can store.
 */
int solve(int n, vector<int>& height) {
    int maxWater = 0;
    // Your code here
    
    return maxWater;
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
     * Returns the maximum amount of water a container can store.
     */
    public static int solve(int n, int[] height) {
        int maxWater = 0;
        // Your code here
        
        return maxWater;
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
    { input: '9\n1 8 6 2 5 4 8 3 7', expected: '49' },
    { input: '2\n1 1', expected: '1' },
    { input: '5\n4 3 2 1 4', expected: '16' },
    { input: '4\n1 2 4 3', expected: '4' },
    { input: '6\n10 1 1 1 1 10', expected: '50' },
    { input: '3\n1 2 1', expected: '2' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10', expected: '25' },
    { input: '2\n100 1', expected: '1' },
    { input: '5\n0 2 0 2 0', expected: '4' },
    { input: '8\n5 10 2 3 4 10 5 1', expected: '40' }
  ]
};