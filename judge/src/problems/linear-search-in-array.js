/**
 * Linear Search in Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 * Line 3: An integer target, the value to search for.
 *
 * Output format (stdout):
 * The 0-based index of the first occurrence of the target. 
 * If the target is not found, output -1.
 */

module.exports = {
  id: 'linear-search-basic',
  conquestId: 'stage2-1',
  title: 'Linear Search in Array',
  difficulty: 'Easy',
  category: 'Searching',
  tags: ['Array', 'Searching', 'Basics'],

  description: `Given an array of $n$ integers and a target value, find the index of the first occurrence of the target in the array.

If the target exists in the array, return its 0-based index. If the target does not exist, return -1.

### Task
Implement a function that iterates through the array and compares each element with the target value.

### Example
**Input:**
\`\`\`
5
10 20 30 40 50
30
\`\`\`

**Output:**
\`\`\`
2
\`\`\``,

  examples: [
    {
      input: '5\n10 20 30 40 50\n30',
      output: '2',
      explanation: 'The value 30 is found at index 2.'
    },
    {
      input: '4\n1 2 3 4\n10',
      output: '-1',
      explanation: 'The value 10 is not present in the array.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ array[i], target ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the index of the target in the array, or -1 if not found.
 */
int solve(int n, const vector<int>& arr, int target) {
    // Your code here
    
    return -1;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target;
    cin >> target;
    cout << solve(n, arr, target) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the index of the target in the array, or -1 if not found.
     */
    public static int solve(int n, int[] arr, int target) {
        // Your code here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        System.out.println(solve(n, arr, target));
    }
}`
  },

  testCases: [
    { input: '5\n10 20 30 40 50\n30', expected: '2' },
    { input: '4\n1 2 3 4\n10', expected: '-1' },
    { input: '6\n5 8 2 8 4 1\n8', expected: '1' },
    { input: '1\n100\n100', expected: '0' },
    { input: '1\n100\n50', expected: '-1' },
    { input: '5\n0 0 0 0 0\n0', expected: '0' },
    { input: '3\n-1 -5 -10\n-5', expected: '1' },
    { input: '7\n1 2 3 4 5 6 7\n7', expected: '6' },
    { input: '2\n1000000000 0\n1000000000', expected: '0' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n5', expected: '4' }
  ]
};