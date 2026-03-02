/**
 * Fruit Into Baskets — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of fruit trees.
 * Line 2: n space-separated integers representing the type of fruit at each tree.
 *
 * Output format (stdout):
 * A single integer representing the maximum total number of fruits you can collect.
 */

module.exports = {
  id: 'fruit-into-baskets',
  conquestId: 'stage4-8',
  title: 'Fruit Into Baskets',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Sliding Window', 'Hash Table'],

  description: `You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array \`fruits\` where \`fruits[i]\` is the **type** of fruit the $i^{th}$ tree produces.

You want to collect as much fruit as possible. However, the owner has some strict rules:
1. You only have **two baskets**, and each basket can only hold a **single type** of fruit. There is no limit on the amount of fruit each basket can hold.
2. Starting from any tree of your choice, you must pick **exactly one fruit** from every tree (including the start tree) while moving to the right. The picking stops when you reach a tree with a fruit type that cannot fit in your baskets.

Return *the maximum number of fruits you can pick*.

### Task
Implement an $O(n)$ solution using the **Sliding Window** technique.
1. Maintain a window \`[left, right]\` that contains at most **two distinct** fruit types.
2. Use a hash map or frequency array to track the count of each fruit type in the current window.
3. If the number of distinct types exceeds 2, shrink the window from the \`left\` until you are back down to 2 types.
4. The maximum window size \`(right - left + 1)\` encountered is the answer.

### Example
**Input:**
\`\`\`
4
1 2 3 2
\`\`\`

**Output:**
\`\`\`
3
\`\`\`

**Explanation:**
We can pick from trees. If we started at the first tree, we would stop at the third tree (type 3).`,

  examples: [
    {
      input: '3\n1 2 1',
      output: '3',
      explanation: 'We can pick from all three trees.'
    },
    {
      input: '4\n0 1 2 2',
      output: '3',
      explanation: 'We can pick from trees.'
    },
    {
      input: '5\n1 2 3 2 2',
      output: '4',
      explanation: 'We can pick from trees.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '0 ≤ fruits[i] < n'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

/**
 * Returns the maximum number of fruits that can be collected in two baskets.
 */
int solve(int n, vector<int>& fruits) {
    int maxFruits = 0;
    // Your code here
    
    return maxFruits;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> fruits(n);
    for (int i = 0; i < n; i++) cin >> fruits[i];
    
    cout << solve(n, fruits) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;

public class Main {
    /**
     * Returns the maximum number of fruits that can be collected in two baskets.
     */
    public static int solve(int n, int[] fruits) {
        int maxFruits = 0;
        // Your code here
        
        return maxFruits;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] fruits = new int[n];
        for (int i = 0; i < n; i++) fruits[i] = sc.nextInt();
        
        System.out.println(solve(n, fruits));
    }
}`
  },

  testCases: [
    { input: '3\n1 2 1', expected: '3' },
    { input: '4\n0 1 2 2', expected: '3' },
    { input: '5\n1 2 3 2 2', expected: '4' },
    { input: '6\n3 3 3 1 2 1', expected: '5' },
    { input: '1\n5', expected: '1' },
    { input: '2\n1 2', expected: '2' },
    { input: '5\n1 1 1 1 1', expected: '5' },
    { input: '4\n1 2 3 4', expected: '2' },
    { input: '8\n0 1 6 6 4 4 6 0', expected: '5' },
    { input: '10\n1 0 1 4 1 4 1 2 3 2', expected: '5' }
  ]
};