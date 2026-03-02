/**
 * Two Sum — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array nums.
 * Line 2: n space-separated integers representing the array nums.
 * Line 3: An integer target.
 *
 * Output format (stdout):
 * Two space-separated integers representing the 0-based indices of the two 
 * numbers such that they add up to the target.
 */

module.exports = {
  id: 'two-sum',
  conquestId: 'stage4-1',
  title: 'Two Sum',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Hash Table'],

  description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

### Task
Implement a solution that finds the indices in $O(n)$ time using a **Hash Map**. As you iterate through the array, check if the complement (\`target - nums[i]\`) already exists in the map. If it does, you've found the pair.

### Example
**Input:**
\`\`\`
4
2 7 11 15
9
\`\`\`

**Output:**
\`\`\`
0 1
\`\`\`

**Explanation:**
Because \`nums + nums == 9\`, we return \`0 1\`.`,

  examples: [
    {
      input: '4\n2 7 11 15\n9',
      output: '0 1',
      explanation: 'nums + nums = 2 + 7 = 9.'
    },
    {
      input: '3\n3 2 4\n6',
      output: '1 2',
      explanation: 'nums + nums = 2 + 4 = 6.'
    },
    {
      input: '2\n3 3\n6',
      output: '0 1',
      explanation: 'nums + nums = 3 + 3 = 6.'
    }
  ],

  constraints: [
    '2 ≤ n ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

/**
 * Returns the indices of the two numbers that add up to target.
 */
vector<int> solve(int n, vector<int>& nums, int target) {
    // Your code here
    
    return {};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    vector<int> result = solve(n, nums, target);
    if (result.size() == 2) {
        cout << result << " " << result << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;

public class Main {
    /**
     * Returns the indices of the two numbers that add up to target.
     */
    public static int[] solve(int n, int[] nums, int target) {
        // Your code here
        
        return new int;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        int[] result = solve(n, nums, target);
        if (result.length == 2) {
            System.out.println(result + " " + result);
        }
    }
}`
  },

  testCases: [
    { input: '4\n2 7 11 15\n9', expected: '0 1' },
    { input: '3\n3 2 4\n6', expected: '1 2' },
    { input: '2\n3 3\n6', expected: '0 1' },
    { input: '4\n1 5 8 3\n11', expected: '2 3' },
    { input: '5\n10 20 30 40 50\n90', expected: '3 4' },
    { input: '6\n-1 -2 -3 -4 -5 0\n-8', expected: '2 4' },
    { input: '2\n0 0\n0', expected: '0 1' },
    { input: '3\n1000000000 500 1000000000\n2000000000', expected: '0 2' },
    { input: '4\n5 2 5 11\n10', expected: '0 2' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10\n19', expected: '8 9' }
  ]
};