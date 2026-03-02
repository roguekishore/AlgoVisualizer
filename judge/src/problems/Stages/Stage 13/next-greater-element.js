/**
 * Next Greater Element I — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers representing the array.
 *
 * Output format (stdout):
 * n space-separated integers where each element is the next greater element 
 * of the input at that position. If no greater element exists, output -1.
 */

module.exports = {
  id: 'next-greater-element',
  conquestId: 'stage5-04',
  title: 'Next Greater Element',
  difficulty: 'Medium',
  category: 'Stacks',
  tags: ['Stack', 'Monotonic Stack', 'Array'],

  description: `The "Next Greater Element" (NGE) for an element $x$ is the first greater element that is to the right of $x$ in the array.

If we use a nested loop ($O(n^2)$), we check every element to the right. But with a **Monotonic Stack**, we can solve this in **$O(n)$** time.

### The Monotonic Stack Strategy
1.  Initialize an empty stack and an answer array filled with -1.
2.  Traverse the array from **left to right**.
3.  While the stack is not empty AND the current element is greater than the element represented by the stack's top:
    - We found the "Next Greater Element" for the index at the top of the stack.
    - **Pop** the index from the stack and update \`ans[index] = current_element\`.
4.  **Push** the current index onto the stack.
5.  Repeat until the end of the array.

### Why this works
The stack maintains indices of elements for which we haven't found a "greater neighbor" yet. The elements in the stack (if looked up in the array) are always in **decreasing order**—this is why we call it a "Monotonic Stack."

### Example
**Input:** \`\`
**Output:** \`[5, 25, 25, -1]\`

**Explanation:**
- For 4, the next greater is 5.
- For 5, the next greater is 25.
- For 2, the next greater is 25.
- For 25, there is no next greater, so -1.`,

  examples: [
    {
      input: '4\n4 5 2 25',
      output: '5 25 25 -1',
      explanation: 'Standard next greater element lookup.'
    },
    {
      input: '3\n13 7 6',
      output: '-1 -1 -1',
      explanation: 'In a strictly decreasing array, no element has a next greater.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '0 ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <stack>

using namespace std;

/**
 * Returns a vector containing the next greater element for each index.
 */
vector<int> solve(int n, vector<int>& arr) {
    vector<int> res(n, -1);
    stack<int> st; // Stores indices
    
    // Your code here
    
    return res;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    vector<int> result = solve(n, arr);
    for (int i = 0; i < n; i++) {
        cout << result[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    /**
     * Returns an array containing the next greater element for each index.
     */
    public static int[] solve(int n, int[] arr) {
        int[] res = new int[n];
        Arrays.fill(res, -1);
        Stack<Integer> st = new Stack<>(); // Stores indices
        
        // Your code here
        
        return res;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        int[] result = solve(n, arr);
        for (int i = 0; i < n; i++) {
            System.out.print(result[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '4\n4 5 2 25', expected: '5 25 25 -1' },
    { input: '3\n13 7 6', expected: '-1 -1 -1' },
    { input: '5\n1 2 3 4 5', expected: '2 3 4 5 -1' },
    { input: '2\n10 5', expected: '-1 -1' },
    { input: '6\n3 10 4 2 1 20', expected: '10 20 20 20 20 -1' }
  ]
};