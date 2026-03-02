/**
 * Linear Search — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 * Line 3: An integer target, the value to search for.
 *
 * Output format (stdout):
 * The 0-based index of the target if found. 
 * If the target is not found, output -1.
 */

module.exports = {
  id: 'linear-search',
  conquestId: 'stage2-2',
  title: 'Linear Search',
  difficulty: 'Easy',
  category: 'Searching',
  tags: ['Array', 'Searching', 'Basics'],

  description: `Given an array of $n$ integers and a target value, perform a linear search to find the index of the target.

Linear search works by checking every element in the array sequentially until the target is found or the end of the array is reached.

### Task
Implement a function that iterates through the array and returns the 0-based index of the target. If the target is not present, return -1.

### Example
**Input:**
\`\`\`
5
10 50 30 70 80
70
\`\`\`

**Output:**
\`\`\`
3
\`\`\``,

  examples: [
    {
      input: '5\n10 50 30 70 80\n70',
      output: '3',
      explanation: '70 is located at index 3.'
    },
    {
      input: '4\n1 2 3 4\n5',
      output: '-1',
      explanation: '5 is not in the array.'
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
 * Performs linear search and returns the index of the target.
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
     * Performs linear search and returns the index of the target.
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
    { input: '5\n10 50 30 70 80\n70', expected: '3' },
    { input: '4\n1 2 3 4\n5', expected: '-1' },
    { input: '1\n100\n100', expected: '0' },
    { input: '6\n-5 0 10 -15 20 5\n-15', expected: '3' },
    { input: '5\n1 1 1 1 1\n1', expected: '0' },
    { input: '3\n10 20 30\n10', expected: '0' },
    { input: '3\n10 20 30\n30', expected: '2' },
    { input: '2\n-1000000000 1000000000\n1000000000', expected: '1' },
    { input: '4\n0 0 0 0\n1', expected: '-1' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n6', expected: '5' }
  ]
};