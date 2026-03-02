/**
 * Find Maximum Element — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the maximum value found in the array.
 */

module.exports = {
  id: 'find-max-element',
  conquestId: 'stage1-1',
  title: 'Find Maximum Element',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Traversal'],

  description: `Given an array of $n$ integers, find and return the **maximum** element present in the array.

### Task
Implement a function that traverses the array once and keeps track of the largest value encountered.

### Example
**Input:**
\`\`\`
5
1 5 3 9 2
\`\`\`

**Output:**
\`\`\`
9
\`\`\``,

  examples: [
    {
      input: '5\n1 5 3 9 2',
      output: '9',
      explanation: 'The largest number in the set {1, 5, 3, 9, 2} is 9.'
    },
    {
      input: '3\n-10 -5 -20',
      output: '-5',
      explanation: 'Among negative numbers, -5 is the greatest value.'
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
 * Returns the maximum element in the array.
 */
int solve(int n, const vector<int>& arr) {
    int maxVal = arr;
    // Your code here
    
    return maxVal;
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
     * Returns the maximum element in the array.
     */
    public static int solve(int n, int[] arr) {
        int maxVal = arr;
        // Your code here
        
        return maxVal;
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
    { input: '5\n1 5 3 9 2', expected: '9' },
    { input: '1\n42', expected: '42' },
    { input: '4\n-1 -2 -3 -4', expected: '-1' },
    { input: '3\n100 100 100', expected: '100' },
    { input: '6\n10 20 30 5 2 1', expected: '30' },
    { input: '5\n0 0 0 0 0', expected: '0' },
    { input: '2\n-1000000000 1000000000', expected: '1000000000' },
    { input: '4\n5 4 3 2', expected: '5' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10', expected: '10' },
    { input: '8\n-50 0 -100 25 30 -10 40 5', expected: '40' }
  ]
};