/**
 * Move Zeros — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * n space-separated integers where all zeros are moved to the end while maintaining 
 * the relative order of the non-zero elements.
 */

module.exports = {
  id: 'move-zeros',
  conquestId: 'stage2-3',
  title: 'Move Zeros',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Two Pointers', 'In-place'],

  description: `Given an integer array, move all $0$'s to the end of it while maintaining the relative order of the non-zero elements.

**Note:** You must do this **in-place** without making a copy of the array.

### Task
Implement an algorithm that traverses the array and shifts non-zero elements to the front, then fills the remaining positions with zeros.

### Example
**Input:**
\`\`\`
5
0 1 0 3 12
\`\`\`

**Output:**
\`\`\`
1 3 12 0 0
\`\`\``,

  examples: [
    {
      input: '5\n0 1 0 3 12',
      output: '1 3 12 0 0',
      explanation: 'Non-zero elements 1, 3, 12 are moved to the front, and the two zeros are moved to the end.'
    },
    {
      input: '1\n0',
      output: '0',
      explanation: 'A single zero remains as is.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-2³¹ ≤ array[i] ≤ 2³¹ - 1'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Moves all zeros to the end of the array in-place.
 */
void solve(int n, vector<int>& arr) {
    // Your code here
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    solve(n, arr);
    
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Moves all zeros to the end of the array in-place.
     */
    public static void solve(int n, int[] arr) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        solve(n, arr);
        
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
    { input: '5\n0 1 0 3 12', expected: '1 3 12 0 0' },
    { input: '1\n0', expected: '0' },
    { input: '2\n1 0', expected: '1 0' },
    { input: '2\n0 1', expected: '1 0' },
    { input: '4\n4 5 0 0', expected: '4 5 0 0' },
    { input: '4\n0 0 4 5', expected: '4 5 0 0' },
    { input: '5\n0 0 0 0 0', expected: '0 0 0 0 0' },
    { input: '3\n1 2 3', expected: '1 2 3' },
    { input: '6\n0 1 0 2 0 3', expected: '1 2 3 0 0 0' },
    { input: '10\n1 0 2 3 0 4 0 0 5 6', expected: '1 2 3 4 5 6 0 0 0 0' }
  ]
};