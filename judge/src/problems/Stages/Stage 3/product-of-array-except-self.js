/**
 * Product of Array Except Self — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * n space-separated integers representing the product of all elements except the one at each index.
 */

module.exports = {
  id: 'product-of-array-except-self',
  conquestId: 'stage3-3',
  title: 'Product of Array Except Self',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Prefix Sum', 'Suffix Sum', 'Array'],

  description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a **32-bit** integer.

### Task
You must write an algorithm that runs in $O(n)$ time and **without using the division operation**.

### Example
**Input:**
\`\`\`
4
1 2 3 4
\`\`\`

**Output:**
\`\`\`
24 12 8 6
\`\`\`

**Explanation:**
- At index 0: 2 * 3 * 4 = 24
- At index 1: 1 * 3 * 4 = 12
- At index 2: 1 * 2 * 4 = 8
- At index 3: 1 * 2 * 3 = 6`,

  examples: [
    {
      input: '4\n1 2 3 4',
      output: '24 12 8 6',
      explanation: 'Each element is the product of all other elements.'
    },
    {
      input: '5\n-1 1 0 -3 3',
      output: '0 0 9 0 0',
      explanation: 'Because there is a zero at index 2, only the product at index 2 is non-zero ((-1)*1*(-3)*3 = 9).'
    }
  ],

  constraints: [
    '2 ≤ n ≤ 10⁵',
    '-30 ≤ nums[i] ≤ 30',
    'The product fits in a 32-bit integer.',
    'Time Complexity: O(n)',
    'Constraint: Do not use division.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns an array where result[i] is the product of all elements except nums[i].
 */
vector<int> solve(int n, vector<int>& nums) {
    vector<int> result(n, 1);
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
    
    vector<int> result = solve(n, nums);
    
    for (int i = 0; i < n; i++) {
        cout << result[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns an array where result[i] is the product of all elements except nums[i].
     */
    public static int[] solve(int n, int[] nums) {
        int[] result = new int[n];
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        int[] result = solve(n, nums);
        
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
    { input: '4\n1 2 3 4', expected: '24 12 8 6' },
    { input: '5\n-1 1 0 -3 3', expected: '0 0 9 0 0' },
    { input: '2\n10 20', expected: '20 10' },
    { input: '3\n1 1 1', expected: '1 1 1' },
    { input: '4\n0 0 1 2', expected: '0 0 0 0' },
    { input: '5\n1 -1 1 -1 1', expected: '1 -1 1 -1 1' },
    { input: '3\n5 10 2', expected: '20 10 50' },
    { input: '6\n1 2 3 0 5 6', expected: '0 0 0 180 0 0' },
    { input: '4\n-2 -1 -3 -4', expected: '-12 -24 -8 -6' },
    { input: '2\n-5 5', expected: '5 -5' }
  ]
};