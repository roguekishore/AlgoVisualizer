/**
 * Delete Element at Index — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the current number of elements in the array.
 * Line 2: n space-separated integers.
 * Line 3: An integer index, the position from which the element should be deleted (0-indexed).
 *
 * Output format (stdout):
 * n-1 space-separated integers representing the array after deletion.
 */

module.exports = {
  id: 'delete-element-at-index',
  conquestId: 'stage1-7',
  title: 'Delete Element at Index',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Basics', 'Shifting'],

  description: `Given an array of $n$ integers and a target index, delete the element located at that index.

All elements originally after the target index must be shifted one position to the left to fill the gap.

### Task
Implement a function that removes the value at the given index and returns or prints the resulting array of size $n-1$.

### Example
**Input:**
\`\`\`
5
10 20 30 40 50
2
\`\`\`

**Output:**
\`\`\`
10 20 40 50
\`\`\``,

  examples: [
    {
      input: '5\n10 20 30 40 50\n2',
      output: '10 20 40 50',
      explanation: 'Element 30 at index 2 is removed. 40 and 50 shift left.'
    },
    {
      input: '3\n1 2 3\n0',
      output: '2 3',
      explanation: 'Element 1 at index 0 is removed. 2 and 3 shift left.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '0 ≤ index < n',
    '-10⁹ ≤ array[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Deletes the element at the specified index and returns the new array.
 */
vector<int> solve(int n, vector<int>& arr, int index) {
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
    int index;
    cin >> index;
    
    vector<int> result = solve(n, arr, index);
    
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
     * Deletes the element at the specified index and returns the new array.
     */
    public static List<Integer> solve(int n, int[] arr, int index) {
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
        int index = sc.nextInt();
        
        List<Integer> result = solve(n, arr, index);
        
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
    { input: '5\n10 20 30 40 50\n2', expected: '10 20 40 50' },
    { input: '3\n1 2 3\n0', expected: '2 3' },
    { input: '3\n1 2 3\n2', expected: '1 2' },
    { input: '1\n100\n0', expected: '' },
    { input: '2\n-1 -2\n0', expected: '-2' },
    { input: '2\n-1 -2\n1', expected: '-1' },
    { input: '4\n0 0 0 0\n1', expected: '0 0 0' },
    { input: '5\n100 200 300 400 500\n4', expected: '100 200 300 400' },
    { input: '6\n1 2 1 2 1 2\n3', expected: '1 2 1 1 2' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n5', expected: '1 2 3 4 5 7 8 9 10' }
  ]
};