/**
 * Search a 2D Matrix — Problem Definition
 *
 * Input format (stdin):
 * Line 1: Two integers m and n (rows and columns).
 * Next m lines: n space-separated integers representing the matrix.
 * Last line: An integer target.
 *
 * Output format (stdout):
 * "true" if the target is in the matrix, "false" otherwise.
 */

module.exports = {
  id: 'search-a-2d-matrix',
  conquestId: 'stage4-30',
  title: 'Search a 2D Matrix',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search', 'Matrix'],

  description: `You are given an \`m x n\` integer matrix \`matrix\` with the following two properties:
1. Each row is sorted in non-decreasing order.
2. The first integer of each row is greater than the last integer of the previous row.

Given an integer \`target\`, return \`true\` if \`target\` is in \`matrix\` or \`false\` otherwise.

### Task
You must write a solution in $O(\log(m \times n))$ time complexity.
1. Treat the entire 2D matrix as a single sorted 1D array of length $m \times n$.
2. Use standard **Binary Search**.
3. To map a 1D index \`mid\` back to 2D coordinates:
   - \`row = mid / n\`
   - \`col = mid % n\`
4. Compare \`matrix[row][col]\` with the target and adjust your pointers accordingly.

### Example
**Input:**
\`\`\`
3 4
1 3 5 7
10 11 16 20
23 30 34 60
3
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

**Explanation:**
The target 3 exists in the first row.`,

  examples: [
    {
      input: '3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3',
      output: 'true',
      explanation: '3 is present at index.'
    },
    {
      input: '3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13',
      output: 'false',
      explanation: '13 is not in the matrix.'
    }
  ],

  constraints: [
    '1 ≤ m, n ≤ 100',
    '-10⁴ ≤ matrix[i][j], target ≤ 10⁴'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Searches for target in a 2D matrix using Binary Search.
 */
bool solve(int m, int n, vector<vector<int>>& matrix, int target) {
    int left = 0, right = m * n - 1;
    // Your code here
    
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> matrix[i][j];
    }
    int target;
    cin >> target;
    
    cout << (solve(m, n, matrix, target) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Searches for target in a 2D matrix using Binary Search.
     */
    public static boolean solve(int m, int n, int[][] matrix, int target) {
        int left = 0, right = m * n - 1;
        // Your code here
        
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] matrix = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) matrix[i][j] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        System.out.println(solve(m, n, matrix, target));
    }
}`
  },

  testCases: [
    { input: '3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3', expected: 'true' },
    { input: '3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13', expected: 'false' },
    { input: '1 1\n5\n5', expected: 'true' },
    { input: '1 2\n1 3\n2', expected: 'false' },
    { input: '2 2\n1 2\n3 4\n4', expected: 'true' },
    { input: '3 3\n1 2 3\n4 5 6\n7 8 9\n1', expected: 'true' },
    { input: '2 3\n1 5 9\n10 15 20\n15', expected: 'true' },
    { input: '1 1\n10\n1', expected: 'false' },
    { input: '2 3\n1 2 3\n4 5 6\n0', expected: 'false' },
    { input: '3 1\n1\n3\n5\n3', expected: 'true' }
  ]
};