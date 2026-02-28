/**
 * Insert Element at Index — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the current number of elements in the array.
 * Line 2: n space-separated integers.
 * Line 3: An integer element, the value to be inserted.
 * Line 4: An integer index, the position where the element should be inserted (0-indexed).
 *
 * Output format (stdout):
 * n+1 space-separated integers representing the array after insertion.
 */

module.exports = {
  id: 'insert-element-at-index',
  conquestId: 'stage1-6',
  title: 'Insert Element at Index',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Shifting'],

  description: `Given an array of $n$ integers, an element, and a target index, insert the element at the specified index. 

All elements originally at or after the target index must be shifted one position to the right to make room.

### Task
Implement a function that inserts the value at the given index and returns or prints the resulting array of size $n+1$.

### Example
**Input:**
\`\`\`
4
10 20 30 40
99
1
\`\`\`

**Output:**
\`\`\`
10 99 20 30 40
\`\`\``,

  examples: [
    {
      input: '4\n10 20 30 40\n99\n1',
      output: '10 99 20 30 40',
      explanation: '99 is inserted at index 1. 20, 30, and 40 shift right.'
    },
    {
      input: '3\n1 2 3\n5\n3',
      output: '1 2 3 5',
      explanation: '5 is inserted at the very end (index 3).'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '0 ≤ index ≤ n',
    '-10⁹ ≤ array[i], element ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Inserts the element at the specified index and returns the new array.
 */
vector<int> solve(int n, vector<int>& arr, int element, int index) {
    vector<int> result;
    // Your code here
    
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int element, index;
    cin >> element >> index;
    
    vector<int> result = solve(n, arr, element, index);
    
    for (int i = 0; i < result.size(); i++) {
        cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.ArrayList;
import java.util.List;

public class Main {
    /**
     * Inserts the element at the specified index and returns the new array.
     */
    public static List<Integer> solve(int n, int[] arr, int element, int index) {
        List<Integer> result = new ArrayList<>();
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int element = sc.nextInt();
        int index = sc.nextInt();
        
        List<Integer> result = solve(n, arr, element, index);
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            sb.append(result.get(i));
            if (i < result.size() - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '4\n10 20 30 40\n99\n1', expected: '10 99 20 30 40' },
    { input: '3\n1 2 3\n5\n3', expected: '1 2 3 5' },
    { input: '3\n1 2 3\n0\n0', expected: '0 1 2 3' },
    { input: '1\n100\n50\n0', expected: '50 100' },
    { input: '1\n100\n150\n1', expected: '100 150' },
    { input: '5\n1 1 1 1 1\n2\n2', expected: '1 1 2 1 1 1' },
    { input: '2\n-1 -3\n-2\n1', expected: '-1 -2 -3' },
    { input: '4\n0 0 0 0\n1\n2', expected: '0 0 1 0 0' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n11\n5', expected: '1 2 3 4 5 11 6 7 8 9 10' }
  ]
};