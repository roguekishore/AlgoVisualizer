/**
 * Rotate Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 * Line 3: An integer k, the number of steps to rotate the array to the right.
 *
 * Output format (stdout):
 * n space-separated integers representing the array after rotation.
 */

module.exports = {
  id: 'rotate-array',
  conquestId: 'stage2-4',
  title: 'Rotate Array',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Math', 'Two Pointers'],

  description: `Given an integer array, rotate the array to the right by $k$ steps, where $k$ is non-negative.

### Task
Implement a solution that rotates the array. Note that $k$ can be larger than the array size $n$, so you should handle that using the modulo operator ($k = k \\pmod n$).

### Example
**Input:**
\`\`\`
7
1 2 3 4 5 6 7
3
\`\`\`

**Output:**
\`\`\`
5 6 7 1 2 3 4
\`\`\`

**Explanation:**
- Rotate 1 step to the right: \`7 1 2 3 4 5 6\`
- Rotate 2 steps to the right: \`6 7 1 2 3 4 5\`
- Rotate 3 steps to the right: \`5 6 7 1 2 3 4\``,

  examples: [
    {
      input: '7\n1 2 3 4 5 6 7\n3',
      output: '5 6 7 1 2 3 4',
      explanation: 'The array is rotated 3 steps to the right.'
    },
    {
      input: '4\n-1 -100 3 99\n2',
      output: '3 99 -1 -100',
      explanation: 'The array is rotated 2 steps to the right.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-2³¹ ≤ array[i] ≤ 2³¹ - 1',
    '0 ≤ k ≤ 10⁵'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Rotates the array to the right by k steps.
 */
void solve(int n, vector<int>& arr, int k) {
    // Your code here
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int k;
    cin >> k;
    
    solve(n, arr, k);
    
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Rotates the array to the right by k steps.
     */
    public static void solve(int n, int[] arr, int k) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int k = sc.nextInt();
        
        solve(n, arr, k);
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]);
            if (i < n - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '7\n1 2 3 4 5 6 7\n3', expected: '5 6 7 1 2 3 4' },
    { input: '4\n-1 -100 3 99\n2', expected: '3 99 -1 -100' },
    { input: '5\n1 2 3 4 5\n0', expected: '1 2 3 4 5' },
    { input: '5\n1 2 3 4 5\n5', expected: '1 2 3 4 5' },
    { input: '5\n1 2 3 4 5\n10', expected: '1 2 3 4 5' },
    { input: '3\n10 20 30\n1', expected: '30 10 20' },
    { input: '3\n10 20 30\n4', expected: '30 10 20' },
    { input: '1\n42\n100', expected: '42' },
    { input: '6\n1 2 3 4 5 6\n2', expected: '5 6 1 2 3 4' },
    { input: '2\n1 2\n3', expected: '2 1' }
  ]
};