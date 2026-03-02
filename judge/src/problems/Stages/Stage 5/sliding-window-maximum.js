/**
 * Sliding Window Maximum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers representing the array nums.
 * Line 3: An integer k, the size of the sliding window.
 *
 * Output format (stdout):
 * n - k + 1 space-separated integers representing the max element in each window.
 */

module.exports = {
  id: 'sliding-window-maximum',
  conquestId: 'stage4-10',
  title: 'Sliding Window Maximum',
  difficulty: 'Hard',
  category: 'Arrays',
  tags: ['Array', 'Queue', 'Sliding Window', 'Monotonic Queue'],

  description: `You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.

Return *the max sliding window*.

### Task
Implement an efficient $O(n)$ solution. A naive $O(n \times k)$ approach will be too slow for large constraints. Instead, use a **Monotonic Deque** (double-ended queue):
1. The deque will store **indices** of elements.
2. Maintain the deque such that the elements at these indices are in **decreasing order**.
3. For each new element:
    - Remove indices from the back of the deque if \`nums[index] <= current_element\`.
    - Remove the index from the front if it's no longer within the window (\`index <= i - k\`).
4. The front of the deque always points to the maximum element of the current window.

### Example
**Input:**
\`\`\`
8
1 3 -1 -3 5 3 6 7
3
\`\`\`

**Output:**
\`\`\`
3 3 5 5 6 7
\`\`\`

**Explanation:**
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7`,

  examples: [
    {
      input: '8\n1 3 -1 -3 5 3 6 7\n3',
      output: '3 3 5 5 6 7',
      explanation: 'Maximums for each window of size 3.'
    },
    {
      input: '1\n1\n1',
      output: '1',
      explanation: 'Only one window exists.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁴ ≤ nums[i] ≤ 10⁴',
    '1 ≤ k ≤ n'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <deque>

using namespace std;

/**
 * Returns the maximum element in each sliding window of size k.
 */
vector<int> solve(int n, vector<int>& nums, int k) {
    vector<int> result;
    // Your code here
    
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int k;
    cin >> k;
    
    vector<int> result = solve(n, nums, k);
    for (int i = 0; i < result.size(); i++) {
        cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.Deque;
import java.util.LinkedList;

public class Main {
    /**
     * Returns the maximum element in each sliding window of size k.
     */
    public static int[] solve(int n, int[] nums, int k) {
        int[] result = new int[n - k + 1];
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int k = sc.nextInt();
        
        int[] result = solve(n, nums, k);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            sb.append(result[i]);
            if (i < result.length - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '8\n1 3 -1 -3 5 3 6 7\n3', expected: '3 3 5 5 6 7' },
    { input: '1\n1\n1', expected: '1' },
    { input: '2\n1 -1\n1', expected: '1 -1' },
    { input: '4\n9 11 8 9\n2', expected: '11 11 9' },
    { input: '4\n7 2 4 1\n2', expected: '7 4 4' },
    { input: '5\n1 2 3 4 5\n3', expected: '3 4 5' },
    { input: '5\n5 4 3 2 1\n3', expected: '5 4 3' },
    { input: '6\n1 3 1 2 0 5\n3', expected: '3 3 2 5' },
    { input: '7\n10 10 10 10 10 10 10\n4', expected: '10 10 10 10' },
    { input: '4\n-7 -8 7 5\n2', expected: '-7 7 7' }
  ]
};