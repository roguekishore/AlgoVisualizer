/**
 * Array Sum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the sum of all elements in the array.
 */

module.exports = {
  id: 'array-sum',
  conquestId: 'stage1-3',
  title: 'Array Sum',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Sequential Access'],

  description: `Given an array of $n$ integers, calculate the **sum** of all its elements.

### Task
Implement a function that iterates through the array and returns the total cumulative sum.

### Example
**Input:**
\`\`\`
5
1 2 3 4 5
\`\`\`

**Output:**
\`\`\`
15
\`\`\``,

  examples: [
    {
      input: '5\n1 2 3 4 5',
      output: '15',
      explanation: '1 + 2 + 3 + 4 + 5 = 15'
    },
    {
      input: '3\n-1 5 -2',
      output: '2',
      explanation: '-1 + 5 + (-2) = 2'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ array[i] ≤ 10⁹',
    'The total sum will fit within a 64-bit integer (long long in C++, long in Java).'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the sum of all elements in the array.
 */
long long solve(int n, const vector<int>& arr) {
    long long totalSum = 0;
    // Your code here
    
    return totalSum;
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
     * Returns the sum of all elements in the array.
     */
    public static long solve(int n, int[] arr) {
        long totalSum = 0;
        // Your code here
        
        return totalSum;
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
    { input: '5\n1 2 3 4 5', expected: '15' },
    { input: '1\n100', expected: '100' },
    { input: '4\n-1 -2 -3 -4', expected: '-10' },
    { input: '3\n0 0 0', expected: '0' },
    { input: '2\n1000000000 1000000000', expected: '2000000000' },
    { input: '5\n10 -10 20 -20 30', expected: '30' },
    { input: '6\n1 1 1 1 1 1', expected: '6' },
    { input: '2\n-1000000000 -1000000000', expected: '-2000000000' },
    { input: '1\n0', expected: '0' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10', expected: '55' }
  ]
};