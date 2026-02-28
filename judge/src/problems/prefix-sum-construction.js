/**
 * Prefix Sum Construction — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * n space-separated integers representing the prefix sum array.
 */

module.exports = {
  id: 'prefix-sum-construction',
  conquestId: 'stage3-1',
  title: 'Prefix Sum Construction',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Prefix Sum', 'Array', 'Basics'],

  description: `Given an array of $n$ integers, construct its **prefix sum array**.

A prefix sum array \`P\` is an array where each element at index \`i\` is the sum of all elements from the original array from index \`0\` to \`i\`.

Formally: \`P[i] = arr + arr + ... + arr[i]\`.

### Task
Implement a function that transforms the input array into its prefix sum representation. This is usually done in $O(n)$ time by using the property:
\`P[i] = P[i-1] + arr[i]\`.

### Example
**Input:**
\`\`\`
5
1 2 3 4 5
\`\`\`

**Output:**
\`\`\`
1 3 6 10 15
\`\`\``,

  examples: [
    {
      input: '5\n1 2 3 4 5',
      output: '1 3 6 10 15',
      explanation: 'P=1, P=1+2=3, P=3+3=6, P=6+4=10, P=10+5=15.'
    },
    {
      input: '4\n10 -2 5 1',
      output: '10 8 13 14',
      explanation: 'P=10, P=10-2=8, P=8+5=13, P=13+1=14.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁴ ≤ arr[i] ≤ 10⁴',
    'The prefix sums will fit within a 64-bit integer.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the prefix sum array of the input array.
 */
vector<long long> solve(int n, const vector<int>& arr) {
    vector<long long> prefixSum(n);
    // Your code here
    
    return prefixSum;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    vector<long long> result = solve(n, arr);
    
    for (int i = 0; i < n; i++) {
        cout << result[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the prefix sum array of the input array.
     */
    public static long[] solve(int n, int[] arr) {
        long[] prefixSum = new long[n];
        // Your code here
        
        return prefixSum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        long[] result = solve(n, arr);
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(result[i]);
            if (i < n - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '5\n1 2 3 4 5', expected: '1 3 6 10 15' },
    { input: '4\n10 -2 5 1', expected: '10 8 13 14' },
    { input: '1\n100', expected: '100' },
    { input: '3\n0 0 0', expected: '0 0 0' },
    { input: '5\n-1 -1 -1 -1 -1', expected: '-1 -2 -3 -4 -5' },
    { input: '6\n1 1 1 1 1 1', expected: '1 2 3 4 5 6' },
    { input: '4\n10000 10000 10000 10000', expected: '10000 20000 30000 40000' },
    { input: '2\n-5 5', expected: '-5 0' },
    { input: '10\n1 2 1 2 1 2 1 2 1 2', expected: '1 3 4 6 7 9 10 12 13 15' },
    { input: '5\n2 4 6 8 10', expected: '2 6 12 20 30' }
  ]
};