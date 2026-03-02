/**
 * Special Array With X Elements Greater Than or Equal X — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated non-negative integers.
 *
 * Output format (stdout):
 * A single integer x if the array is special, otherwise -1.
 */

module.exports = {
  id: 'special-array-with-x-elements',
  conquestId: 'stage4-33',
  title: 'Special Array With X Elements Greater Than or Equal X',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Binary Search', 'Sorting'],

  description: `You are given an array \`nums\` of non-negative integers. \`nums\` is considered **special** if there exists a number \`x\` such that there are **exactly** \`x\` numbers in \`nums\` that are **greater than or equal to** \`x\`.

Notice that \`x\` **does not** have to be an element in \`nums\`.

Return \`x\` if the array is special, otherwise, return \`-1\`. It can be proven that if \`nums\` is special, the value \`x\` is unique.

### Task
Implement a solution using **Binary Search on the Answer**:
1. The possible range for \`x\` is between \`0\` and \`n\` (the length of the array).
2. For a candidate \`mid\`, count how many elements in \`nums\` are $\ge mid$.
3. If the count equals \`mid\`, you found the answer!
4. If the count is greater than \`mid\`, you need a larger \`x\`.
5. If the count is smaller than \`mid\`, you need a smaller \`x\`.

### Example
**Input:**
\`\`\`
2
3 5
\`\`\`

**Output:**
\`\`\`
2
\`\`\`

**Explanation:**
There are 2 values (3 and 5) that are greater than or equal to 2.`,

  examples: [
    {
      input: '2\n3 5',
      output: '2',
      explanation: 'Two values are >= 2.'
    },
    {
      input: '2\n0 0',
      output: '-1',
      explanation: 'No value x exists such that x numbers are >= x.'
    },
    {
      input: '5\n0 4 3 0 4',
      output: '3',
      explanation: 'Three values (4, 3, 4) are >= 3.'
    }
  ],

  constraints: [
    '1 ≤ nums.length ≤ 100',
    '0 ≤ nums[i] ≤ 1000'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Returns x if the array is special, else -1.
 */
int solve(int n, vector<int>& nums) {
    int left = 0, right = n;
    // Your binary search logic here
    
    return -1;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    cout << solve(n, nums) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.Arrays;

public class Main {
    /**
     * Returns x if the array is special, else -1.
     */
    public static int solve(int n, int[] nums) {
        int left = 0, right = n;
        // Your binary search logic here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        System.out.println(solve(n, nums));
    }
}`
  },

  testCases: [
    { input: '2\n3 5', expected: '2' },
    { input: '2\n0 0', expected: '-1' },
    { input: '5\n0 4 3 0 4', expected: '3' },
    { input: '3\n3 6 7', expected: '3' },
    { input: '1\n10', expected: '1' },
    { input: '1\n0', expected: '-1' },
    { input: '4\n0 0 3 4', expected: '2' },
    { input: '6\n1 2 3 4 5 6', expected: '3' },
    { input: '2\n1 1', expected: '-1' },
    { input: '10\n10 10 10 10 10 10 10 10 10 10', expected: '10' }
  ]
};