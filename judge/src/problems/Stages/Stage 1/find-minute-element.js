/**
 * Find Minimum Element — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the minimum value found in the array.
 */

module.exports = {
  id: 'find-min-element',
  conquestId: 'stage1-2',
  title: 'Find Minimum Element',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Traversal'],

  description: `Given an array of $n$ integers, find and return the **minimum** element present in the array.

### Task
Implement a function that traverses the array once and keeps track of the smallest value encountered.

### Example
**Input:**
\`\`\`
5
10 5 8 2 15
\`\`\`

**Output:**
\`\`\`
2
\`\`\``,

  examples: [
    {
      input: '5\n10 5 8 2 15',
      output: '2',
      explanation: 'The smallest number in the set {10, 5, 8, 2, 15} is 2.'
    },
    {
      input: '3\n-10 -5 -20',
      output: '-20',
      explanation: 'Among negative numbers, -20 is the smallest value.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ array[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

/**
 * Returns the minimum element in the array.
 */
int solve(int n, const vector<int>& arr) {
    int minVal = arr;
    // Your code here
    
    return minVal;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << solve(n, arr) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the minimum element in the array.
     */
    public static int solve(int n, int[] arr) {
        int minVal = arr;
        // Your code here
        
        return minVal;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        System.out.println(solve(n, arr));
    }
}`
  },

  testCases: [
    { input: '5\n10 5 8 2 15', expected: '2' },
    { input: '1\n100', expected: '100' },
    { input: '4\n-1 -2 -3 -4', expected: '-4' },
    { input: '3\n50 50 50', expected: '50' },
    { input: '6\n10 20 30 5 2 1', expected: '1' },
    { input: '5\n0 0 0 0 0', expected: '0' },
    { input: '2\n1000000000 -1000000000', expected: '-1000000000' },
    { input: '4\n2 3 4 5', expected: '2' },
    { input: '10\n10 9 8 7 6 5 4 3 2 1', expected: '1' },
    { input: '8\n50 0 100 -25 -30 10 -40 -5', expected: '-40' }
  ]
};