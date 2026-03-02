/**
 * Kth Missing Positive Number — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated positive integers (sorted).
 * Line 3: An integer k.
 *
 * Output format (stdout):
 * A single integer representing the k-th missing positive integer.
 */

module.exports = {
  id: 'kth-missing-positive-number',
  conquestId: 'stage4-25',
  title: 'Kth Missing Positive Number',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `Given an array \`arr\` of positive integers sorted in a **strictly increasing order**, and an integer \`k\`.

Return the \`k^{th}\` **positive** integer that is missing from this array.

### Task
While a linear scan $O(n)$ is possible, the goal is to implement a **Binary Search** $O(\log n)$ solution.
1. At any index \`mid\`, the number of missing integers before \`arr[mid]\` is calculated as: \`missing = arr[mid] - (mid + 1)\`.
2. If \`missing < k\`, the $k^{th}$ missing number is further to the right (\`left = mid + 1\`).
3. If \`missing >= k\`, it is to the left (\`right = mid - 1\`).
4. After the search, the answer can be derived as \`left + k\`.

### Example
**Input:**
\`\`\`
5
2 3 4 7 11
5
\`\`\`

**Output:**
\`\`\`
9
\`\`\`

**Explanation:**
The missing positive integers are [1, 5, 6, 8, 9, 10, 12, ...]. The $5^{th}$ missing integer is 9.`,

  examples: [
    {
      input: '5\n2 3 4 7 11\n5',
      output: '9',
      explanation: 'Missing: 1, 5, 6, 8, 9... The 5th is 9.'
    },
    {
      input: '4\n1 2 3 4\n2',
      output: '6',
      explanation: 'Missing: 5, 6... The 2nd is 6.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '1 ≤ arr[i] ≤ 1000',
    '1 ≤ k ≤ 1000',
    'arr is sorted in strictly increasing order.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the k-th missing positive integer.
 */
int solve(int n, vector<int>& arr, int k) {
    int left = 0, right = n - 1;
    // Your code here
    
    return left + k;
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
    
    cout << solve(n, arr, k) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the k-th missing positive integer.
     */
    public static int solve(int n, int[] arr, int k) {
        int left = 0, right = n - 1;
        // Your code here
        
        return left + k;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int k = sc.nextInt();
        
        System.out.println(solve(n, arr, k));
    }
}`
  },

  testCases: [
    { input: '5\n2 3 4 7 11\n5', expected: '9' },
    { input: '4\n1 2 3 4\n2', expected: '6' },
    { input: '3\n5 6 7\n2', expected: '2' },
    { input: '1\n1\n1', expected: '2' },
    { input: '1\n2\n1', expected: '1' },
    { input: '6\n2 4 6 8 10 12\n3', expected: '5' },
    { input: '5\n1 10 20 30 40\n2', expected: '3' },
    { input: '2\n10 20\n5', expected: '5' },
    { input: '4\n4 5 6 7\n2', expected: '2' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n10', expected: '20' }
  ]
};