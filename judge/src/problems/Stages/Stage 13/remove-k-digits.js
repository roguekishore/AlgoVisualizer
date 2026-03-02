/**
 * Remove K Digits — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string representing a non-negative integer 'num'.
 * Line 2: An integer 'k'.
 *
 * Output format (stdout):
 * The smallest possible integer after removing k digits, as a string.
 */

module.exports = {
  id: 'remove-k-digits',
  conquestId: 'stage5-05',
  title: 'Remove K Digits',
  difficulty: 'Medium',
  category: 'Stacks',
  tags: ['Stack', 'Greedy', 'Monotonic Stack', 'String'],

  description: `Given a string \`num\` representing a non-negative integer and an integer \`k\`, return the smallest possible integer after removing \`k\` digits from \`num\`.

This is a classic **Greedy** problem that is best solved using a **Monotonic Stack**.

### The Logic
To make a number smaller, we want the digits at the "left" (the most significant positions) to be as small as possible. 
- If we see a digit that is **smaller** than the one before it, the number would be smaller if we removed the previous (larger) digit.
- Example: In "143", if we must remove 1 digit, "13" is smaller than "14". We removed '4' because $4 > 3$.

### Strategy
1.  Iterate through the digits.
2.  While the current digit is **smaller** than the top of the stack and we still have \`k\` removals left:
    - **Pop** from the stack and decrement \`k\`.
3.  **Push** the current digit.
4.  After the loop, if \`k > 0\`, remove the remaining digits from the **end** (top of stack).
5.  **Edge Case**: Remove leading zeros from the final result. If the result is empty, return "0".

### Example
**Input:** \`num = "1432219", k = 3\`

**Output:** \`"1219"\`

**Explanation:** Remove 4, 3, and one 2 to form the smallest number 1219.`,

  examples: [
    {
      input: '1432219\n3',
      output: '1219',
      explanation: 'Removing 4, 3, and 2 results in 1219.'
    },
    {
      input: '10200\n1',
      output: '200',
      explanation: 'Removing the 1 leaves 0200, which simplifies to 200.'
    },
    {
      input: '10\n2',
      output: '0',
      explanation: 'Removing both digits leaves nothing, which is 0.'
    }
  ],

  constraints: [
    '1 ≤ num.length ≤ 10⁵',
    'num consists of only digits.',
    '0 ≤ k ≤ num.length'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

string removeKdigits(string num, int k) {
    if (k >= num.length()) return "0";
    string res = "";
    
    // Your monotonic stack logic here (you can use string as a stack)
    
    return res.empty() ? "0" : res;
}

int main() {
    string num;
    int k;
    if (!(cin >> num >> k)) return 0;
    cout << removeKdigits(num, k) << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static String removeKdigits(String num, int k) {
        if (k >= num.length()) return "0";
        
        Stack<Character> stack = new Stack<>();
        // Your monotonic stack logic here
        
        // Build string, remove leading zeros, handle empty result
        return "0";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String num = sc.next();
        int k = sc.nextInt();
        System.out.println(removeKdigits(num, k));
    }
}`
  },

  testCases: [
    { input: '1432219\n3', expected: '1219' },
    { input: '10200\n1', expected: '200' },
    { input: '10\n2', expected: '0' },
    { input: '112\n1', expected: '11' },
    { input: '54321\n2', expected: '321' },
    { input: '12345\n2', expected: '123' }
  ]
};