/**
 * Reverse String — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * The string s reversed.
 */

module.exports = {
  id: 'reverse-string',
  conquestId: 'stage4-12',
  title: 'Reverse String',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Two Pointers'],

  description: `Write a function that reverses a string. 

### Task
Implement an $O(n)$ solution. While many languages have built-in reverse functions, the goal here is to understand the **Two Pointer** swap logic:
1. Initialize \`left = 0\` and \`right = n - 1\`.
2. Swap the characters at \`left\` and \`right\`.
3. Increment \`left\` and decrement \`right\` until they meet in the middle.

### Example
**Input:**
\`\`\`
hello
\`\`\`

**Output:**
\`\`\`
olleh
\`\`\`

**Explanation:**
The characters are reversed in order.`,

  examples: [
    {
      input: 'hello',
      output: 'olleh',
      explanation: 'h-e-l-l-o becomes o-l-l-e-h.'
    },
    {
      input: 'Hannah',
      output: 'hannaH',
      explanation: 'Capitalization is preserved in its new position.'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 10⁵',
    's consists of printable ASCII characters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

/**
 * Returns the reversed string.
 */
string solve(string s) {
    // Your code here
    
    return s;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s;
    if (!(cin >> s)) return 0;
    
    cout << solve(s) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the reversed string.
     */
    public static String solve(String s) {
        char[] chars = s.toCharArray();
        // Your code here
        
        return new String(chars);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        System.out.println(solve(s));
    }
}`
  },

  testCases: [
    { input: 'hello', expected: 'olleh' },
    { input: 'Hannah', expected: 'hannaH' },
    { input: 'a', expected: 'a' },
    { input: 'abcd', expected: 'dcba' },
    { input: '12345', expected: '54321' },
    { input: '!@#$', expected: '$#@!' },
    { input: 'racecar', expected: 'racecar' },
    { input: 'Google', expected: 'elgooG' },
    { input: 'A', expected: 'A' },
    { input: 'Space ', expected: ' ecapS' }
  ]
};