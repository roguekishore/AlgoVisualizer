/**
 * Peak Index in a Mountain Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers representing the mountain array.
 *
 * Output format (stdout):
 * A single integer representing the index i such that 
 * arr < arr < ... < arr[i - 1] < arr[i] > arr[i + 1] > ... > arr[arr.length - 1].
 */

module.exports = {
  id: 'peak-index-in-mountain-array',
  conquestId: 'stage4-23',
  title: 'Peak Index in a Mountain Array',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `An array \`arr\` is a **mountain** if the following properties hold:
1. \`arr.length >= 3\`
2. There exists some \`i\` with \`0 < i < arr.length - 1\` such that:
   - \`arr < arr < ... < arr[i - 1] < arr[i]\`
   - \`arr[i] > arr[i + 1] > ... > arr[arr.length - 1]\`

Given a mountain array \`arr\`, return the index \`i\` such that the conditions above are satisfied.

### Task
Implement an $O(\log n)$ solution using **Binary Search**.
1. We are looking for the "peak" of the array.
2. In a mountain array, for any index \`mid\`:
   - If \`arr[mid] < arr[mid + 1]\`, we are in the rising part of the mountain. The peak must be to the right (\`left = mid + 1\`).
   - If \`arr[mid] > arr[mid + 1]\`, we are in the falling part (or at the peak). The peak is at or to the left of \`mid\` (\`right = mid\`).
3. The search terminates when \`left == right\`.

### Example
**Input:**
\`\`\`
4
0 10 5 2
\`\`\`

**Output:**
\`\`\`
1
\`\`\`

**Explanation:**
The element at index 1 (10) is greater than both 0 and 5.`,

  examples: [
    {
      input: '3\n0 1 0',
      output: '1',
      explanation: 'Index 1 is the peak.'
    },
    {
      input: '4\n0 10 5 2',
      output: '1',
      explanation: 'Index 1 is the peak.'
    },
    {
      input: '3\n0 2 1 0',
      output: '1',
      explanation: 'Index 1 is the peak.'
    }
  ],

  constraints: [
    '3 ≤ n ≤ 10⁵',
    '0 ≤ arr[i] ≤ 10⁶',
    'arr is guaranteed to be a mountain array.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the index of the peak in the mountain array.
 */
int solve(int n, vector<int>& arr) {
    int left = 0, right = n - 1;
    // Your code here
    
    return left;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    cout << solve(n, arr) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the index of the peak in the mountain array.
     */
    public static int solve(int n, int[] arr) {
        int left = 0, right = n - 1;
        // Your code here
        
        return left;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        System.out.println(solve(n, arr));
    }
}`
  },

  testCases: [
    { input: '3\n0 1 0', expected: '1' },
    { input: '4\n0 2 1 0', expected: '1' },
    { input: '4\n0 10 5 2', expected: '1' },
    { input: '5\n3 4 5 1 0', expected: '2' },
    { input: '6\n0 1 2 3 4 0', expected: '4' },
    { input: '7\n24 69 100 99 79 78 67', expected: '2' },
    { input: '10\n1 2 3 4 5 6 7 8 9 0', expected: '8' },
    { input: '5\n10 20 30 20 10', expected: '2' },
    { input: '3\n10 50 10', expected: '1' },
    { input: '6\n3 5 3 2 1 0', expected: '1' }
  ]
};