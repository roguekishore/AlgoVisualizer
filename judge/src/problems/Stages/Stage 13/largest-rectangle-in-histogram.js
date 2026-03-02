/**
 * Largest Rectangle in Histogram — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of bars in the histogram.
 * Line 2: n space-separated integers representing the height of each bar.
 *
 * Output format (stdout):
 * A single integer representing the area of the largest rectangle.
 */

module.exports = {
  id: 'largest-rectangle-in-histogram',
  conquestId: 'stage5-06',
  title: 'Largest Rectangle in Histogram',
  difficulty: 'Hard',
  category: 'Stacks',
  tags: ['Stack', 'Monotonic Stack', 'Array'],

  description: `This is the "Final Boss" of Monotonic Stack problems. Given an array of integers representing the heights of bars in a histogram where the width of each bar is 1, find the area of the largest rectangle that can be formed.

### The Challenge
A rectangle's area is determined by its **height** and **width**. 
- The height is limited by the **shortest bar** within the chosen range.
- To find the maximum area for a bar at index $i$ with height $h$, we need to find the first bar to the **left** and **right** that is **shorter** than $h$. These bars define the boundaries of the rectangle.

### The Monotonic Stack Solution
We can solve this in a single pass $O(n)$ using a stack that maintains indices of bars in **increasing order** of height.

1.  Traverse each bar.
2.  If the current bar is **shorter** than the bar at the stack's top, it means we have found the **right boundary** for the bar at the top.
3.  **Pop** the top index. The height of the rectangle is the height of the popped bar.
4.  The **left boundary** is the new top of the stack (or -1 if empty).
5.  Calculate area: $Area = Height \times (RightIndex - LeftIndex - 1)$.
6.  Keep track of the maximum area found.

### Example
**Input:** \`\`
**Output:** \`10\`

**Explanation:**
The largest rectangle is formed by bars with heights 5 and 6. The height is 5, and the width is 2 (from index 2 to 3). $Area = 5 \times 2 = 10$.`,

  examples: [
    {
      input: '6\n2 1 5 6 2 3',
      output: '10',
      explanation: 'The rectangle formed by heights 5 and 6 has the largest area.'
    },
    {
      input: '2\n2 4',
      output: '4',
      explanation: 'The bar of height 4 alone is the largest (area 4).'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '0 ≤ heights[i] ≤ 10⁴'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

using namespace std;

/**
 * Calculates the area of the largest rectangle in the histogram.
 */
long long largestRectangleArea(vector<int>& heights) {
    stack<int> st;
    long long maxArea = 0;
    int n = heights.size();
    
    for (int i = 0; i <= n; i++) {
        // Use 0 height at the end to flush the stack
        int h = (i == n) ? 0 : heights[i];
        
        while (!st.empty() && h < heights[st.top()]) {
            // Your logic here: Pop and calculate area
        }
        st.push(i);
    }
    
    return maxArea;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> heights(n);
    for (int i = 0; i < n; i++) cin >> heights[i];
    
    cout << largestRectangleArea(heights) << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    /**
     * Calculates the area of the largest rectangle in the histogram.
     */
    public static long largestRectangleArea(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        long maxArea = 0;
        int n = heights.length;
        
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            
            while (!stack.isEmpty() && h < heights[stack.peek()]) {
                // Your logic here: Pop and calculate area
            }
            stack.push(i);
        }
        
        return maxArea;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] heights = new int[n];
        for (int i = 0; i < n; i++) heights[i] = sc.nextInt();
        
        System.out.println(largestRectangleArea(heights));
    }
}`
  },

  testCases: [
    { input: '6\n2 1 5 6 2 3', expected: '10' },
    { input: '2\n2 4', expected: '4' },
    { input: '5\n1 1 1 1 1', expected: '5' },
    { input: '4\n10 20 30 40', expected: '60' },
    { input: '4\n40 30 20 10', expected: '60' }
  ]
};