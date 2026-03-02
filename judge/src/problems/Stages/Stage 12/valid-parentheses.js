/**
 * Valid Parentheses — Problem Definition
 *
 * Input format (stdin):
 * A single string s containing just the characters '(', ')', '{', '}', '[' and ']'.
 *
 * Output format (stdout):
 * "true" if the input string is valid, otherwise "false".
 */

module.exports = {
  id: 'valid-parentheses',
  conquestId: 'stage5-02',
  title: 'Valid Parentheses',
  difficulty: 'Easy',
  category: 'Stacks',
  tags: ['Stack', 'String', 'Validation'],

  description: `The "Valid Parentheses" problem is the perfect real-world example of why we need Stacks. Compilers use this logic to ensure your code's brackets are balanced.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### The Stack Strategy
1.  Initialize an empty stack.
2.  Traverse the string character by character:
    - If it's an **opening bracket** (\`(\`, \`{\`, \`[\`), **push** it onto the stack.
    - If it's a **closing bracket** (\`)\`, \`}\`, \`]\`):
        - If the stack is empty, it's invalid (no opening bracket to match).
        - **Pop** the top element from the stack.
        - If the popped element doesn't match the closing bracket (e.g., \`(\` vs \`]\`), it's invalid.
3.  After the loop, if the stack is **empty**, the string is valid. If elements remain, some brackets weren't closed.

### Example
**Input:** \`()[]{}\`
**Output:** \`true\`

**Input:** \`(]\`
**Output:** \`false\`

**Input:** \`([)]\`
**Output:** \`false\``,

  examples: [
    {
      input: '()[]{}',
      output: 'true',
      explanation: 'All brackets are closed correctly in order.'
    },
    {
      input: '(]',
      output: 'false',
      explanation: 'The closing bracket ] does not match the opening bracket (.'
    },
    {
      input: '([{}])',
      output: 'true',
      explanation: 'Nested brackets are closed in the correct Last-In-First-Out order.'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 10⁴',
    "s consists of parentheses only: '()[]{}'"
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        System.out.println(isValid(s));
    }
}`
  },

  testCases: [
    { input: '()', expected: 'true' },
    { input: '()[]{}', expected: 'true' },
    { input: '(]', expected: 'false' },
    { input: '([)]', expected: 'false' },
    { input: '{[]}', expected: 'true' },
    { input: '(', expected: 'false' },
    { input: ']', expected: 'false' },
    { input: '((((()))))', expected: 'true' }
  ]
};