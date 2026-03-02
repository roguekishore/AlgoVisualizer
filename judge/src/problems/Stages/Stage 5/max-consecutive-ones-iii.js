/**
 * Max Consecutive Ones III — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers (0s and 1s).
 * Line 3: An integer k, the maximum number of 0s you can flip.
 *
 * Output format (stdout):
 * A single integer representing the maximum number of consecutive 1s.
 */

module.exports = {
  id: 'max-consecutive-ones-iii',
  conquestId: 'stage4-6',
  title: 'Max Consecutive Ones III',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Sliding Window', 'Two Pointers'],

  description: `Given a binary array \`nums\` and an integer \`k\`, return the maximum number of consecutive \`1\`'s in the array if you can flip at most \`k\` \`0\`'s.

### Task
Implement an $O(n)$ solution using the **Sliding Window** technique. 
1. Maintain a window \`[left, right]\` and count the number of zeros inside it.
2. Expand the window by moving \`right\`.
3. If the number of zeros exceeds \`k\`, shrink the window from the \`left\` until the zero count is $\le k$.
4. The maximum window size found during the process is the answer.

### Example
**Input:**
\`\`\`
11
1 1 1 0 0 0 1 1 1 1 0
2
\`\`\`

**Output:**
\`\`\`
6
\`\`\`

**Explanation:**
[1, 1, 1, 0, 0, **1, 1, 1, 1, 1, 1**]
Numbers were flipped from index 5 to 10. The longest subarray is 6 units long.`,

  examples: [
    {
      input: '11\n1 1 1 0 0 0 1 1 1 1 0\n2',
      output: '6',
      explanation: 'By flipping two 0s, the longest consecutive 1s subsegment has length 6.'
    },
    {
      input: '19\n0 0 1 1 0 0 1 1 1 0 1 1 0 0 0 1 1 1 1\n3',
      output: '10',
      explanation: 'By flipping three 0s, the longest consecutive 1s subsegment has length 10.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    'nums[i] is either 0 or 1',
    '0 ≤ k ≤ n'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns the maximum consecutive ones after flipping at most k zeros.
 */
int solve(int n, vector<int>& nums, int k) {
    int maxLen = 0;
    // Your code here
    
    return maxLen;
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
    
    cout << solve(n, nums, k) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the maximum consecutive ones after flipping at most k zeros.
     */
    public static int solve(int n, int[] nums, int k) {
        int maxLen = 0;
        // Your code here
        
        return maxLen;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int k = sc.nextInt();
        
        System.out.println(solve(n, nums, k));
    }
}`
  },

  testCases: [
    { input: '11\n1 1 1 0 0 0 1 1 1 1 0\n2', expected: '6' },
    { input: '19\n0 0 1 1 0 0 1 1 1 0 1 1 0 0 0 1 1 1 1\n3', expected: '10' },
    { input: '5\n0 0 0 0 0\n2', expected: '2' },
    { input: '5\n1 1 1 1 1\n0', expected: '5' },
    { input: '6\n1 0 1 0 1 0\n1', expected: '3' },
    { input: '1\n0\n1', expected: '1' },
    { input: '1\n0\n0', expected: '0' },
    { input: '8\n1 0 0 1 1 0 1 1\n1', expected: '5' },
    { input: '10\n0 0 0 1 1 1 0 0 0 1\n5', expected: '8' },
    { input: '4\n1 0 0 1\n2', expected: '4' }
  ]
};