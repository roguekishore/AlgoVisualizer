/**
 * Exponential Search — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the sorted array.
 * Line 2: n space-separated sorted integers.
 * Line 3: An integer target to search for.
 *
 * Output format (stdout):
 * A single integer representing the 0-based index of the target.
 * If the target is not found, return -1.
 */

module.exports = {
  id: 'exponential-search',
  conquestId: 'stage4-35',
  title: 'Exponential Search',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `Exponential Search is particularly useful for searching in **unbounded** or **infinite** arrays, or when the target is likely to be near the beginning of the array.

It works in two distinct phases:
1. **Range Finding:** Start with a range of size 1 ($i = 1$). While the element at index $i$ is less than the target, double the index ($i = i \times 2$).
2. **Binary Search:** Once you find an index $i$ where \`arr[i] >= target\`, you know the target must lie between the previous power of 2 ($i/2$) and the current index ($i$). Perform a standard Binary Search within the range $[i/2, \min(i, n-1)]$.

### Task
Implement an $O(\log i)$ solution where $i$ is the position of the target.
- Handle the edge case where the target is at the first index separately.
- Use a while loop to find the upper bound by doubling the index.
- Use the discovered bounds to execute a Binary Search.

### Example
**Input:**
\`\`\`
10
10 20 30 40 50 60 70 80 90 100
80
\`\`\`

**Output:**
\`\`\`
7
\`\`\`

**Explanation:**
1. Check index 0 (10). Not target.
2. Check index 1 (20), then 2 (30), then 4 (50), then 8 (90).
3. Since 90 > 80, the target must be between index 4 and index 8.
4. Binary Search in range finds 80 at index 7.`,

  examples: [
    {
      input: '10\n10 20 30 40 50 60 70 80 90 100\n80',
      output: '7',
      explanation: 'Target 80 is at index 7.'
    },
    {
      input: '5\n1 2 3 4 5\n10',
      output: '-1',
      explanation: 'Target 10 is out of bounds.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ arr[i], target ≤ 10⁹',
    'The array is sorted in ascending order.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int binarySearch(const vector<int>& arr, int left, int right, int target) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int solve(int n, vector<int>& arr, int target) {
    if (n == 0) return -1;
    if (arr == target) return 0;

    int i = 1;
    // Your Exponential Range Finding logic here
    
    // Your Binary Search call here
    
    return -1;
}

int main() {
    int n, target;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cin >> target;
    
    cout << solve(n, arr, target) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static int binarySearch(int[] arr, int left, int right, int target) {
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static int solve(int n, int[] arr, int target) {
        if (n == 0) return -1;
        if (arr == target) return 0;

        int i = 1;
        // Your Exponential Range Finding logic here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();
        
        System.out.println(solve(n, arr, target));
    }
}`
  },

  testCases: [
    { input: '10\n10 20 30 40 50 60 70 80 90 100\n80', expected: '7' },
    { input: '5\n1 2 3 4 5\n1', expected: '0' },
    { input: '5\n1 2 3 4 5\n5', expected: '4' },
    { input: '5\n1 2 3 4 5\n6', expected: '-1' },
    { input: '2\n-10 -5\n-5', expected: '1' },
    { input: '1\n100\n100', expected: '0' },
    { input: '15\n1 3 5 7 9 11 13 15 17 19 21 23 25 27 29\n25', expected: '12' },
    { input: '8\n2 4 6 8 10 12 14 16\n3', expected: '-1' },
    { input: '4\n10 20 30 40\n25', expected: '-1' },
    { input: '3\n-1 0 1\n0', expected: '1' }
  ]
};