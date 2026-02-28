/**
 * Reverse Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * n space-separated integers representing the array in reversed order.
 */

module.exports = {
  id: 'reverse-array',
  conquestId: 'stage1-4',
  title: 'Reverse Array',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Two Pointers'],

  description: `Given an array of $n$ integers, reverse the order of the elements in-place or by creating a new array.

The first element should become the last, the second should become the second-to-last, and so on.

### Task
Implement a function that reverses the given array and returns or prints the result.

### Example
**Input:**
\`\`\`
4
10 20 30 40
\`\`\`

**Output:**
\`\`\`
40 30 20 10
\`\`\``,

  examples: [
    {
      input: '4\n10 20 30 40',
      output: '40 30 20 10',
      explanation: 'The array reversed is.'
    },
    {
      input: '3\n1 5 9',
      output: '9 5 1',
      explanation: 'The array reversed is.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ array[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Reverses the array elements.
 */
void solve(int n, vector<int>& arr) {
    // Your code here
    int left = 0, right = n - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
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
     * Reverses the array elements.
     */
    public static void solve(int n, int[] arr) {
        // Your code here
        int left = 0, right = n - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
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
    { input: '4\n1 2 3 4', expected: '4 3 2 1' },
    { input: '1\n99', expected: '99' },
    { input: '5\n5 4 3 2 1', expected: '1 2 3 4 5' },
    { input: '2\n-1 -2', expected: '-2 -1' },
    { input: '3\n0 0 0', expected: '0 0 0' },
    { input: '6\n10 20 30 30 20 10', expected: '10 20 30 30 20 10' },
    { input: '4\n-100 50 0 -25', expected: '-25 0 50 -100' },
    { input: '5\n1000000 0 0 0 1000000', expected: '1000000 0 0 0 1000000' },
    { input: '2\n1 2', expected: '2 1' },
    { input: '8\n8 7 6 5 4 3 2 1', expected: '1 2 3 4 5 6 7 8' }
  ]
};