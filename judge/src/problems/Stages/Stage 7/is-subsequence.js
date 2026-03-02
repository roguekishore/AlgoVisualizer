/**
 * Is Subsequence — Problem Definition
 *
 * Input format (stdin):
 * Line 1: String s (the potential subsequence).
 * Line 2: String t (the target string).
 *
 * Output format (stdout):
 * "true" if s is a subsequence of t, "false" otherwise.
 */

module.exports = {
  id: 'is-subsequence',
  conquestId: 'stage4-19',
  title: 'Is Subsequence',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Two Pointers', 'Dynamic Programming'],

  description: `Given two strings \`s\` and \`t\`, return \`true\` if \`s\` is a **subsequence** of \`t\`, or \`false\` otherwise.

A **subsequence** of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters. (i.e., \`"ace"\` is a subsequence of \`"abcde"\` while \`"aec"\` is not).

### Task
Implement an $O(n)$ solution using **Two Pointers**:
1. Initialize two pointers: \`i\` for string \`s\` and \`j\` for string \`t\`.
2. Iterate through string \`t\`.
3. If \`s[i]\` matches \`t[j]\`, move the pointer \`i\` to the next character in \`s\`.
4. The pointer \`j\` always moves forward.
5. If \`i\` reaches the end of \`s\`, then \`s\` is a subsequence of \`t\`.

### Example
**Input:**
\`\`\`
abc
ahbgdc
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

**Explanation:**
'a', 'b', and 'c' appear in order within "ahbgdc".`,

  examples: [
    {
      input: 'abc\nahbgdc',
      output: 'true',
      explanation: '"abc" can be formed by deleting "h", "g", and "d" from "ahbgdc".'
    },
    {
      input: 'axc\nahbgdc',
      output: 'false',
      explanation: 'The character "x" does not exist in "ahbgdc".'
    }
  ],

  constraints: [
    '0 ≤ s.length ≤ 100',
    '0 ≤ t.length ≤ 10⁴',
    's and t consist only of lowercase English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>

using namespace std;

/**
 * Returns true if s is a subsequence of t.
 */
bool solve(string s, string t) {
    // Your code here
    
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s, t;
    // Handle cases where s might be empty
    if (!(cin >> s)) s = "";
    if (!(cin >> t)) t = "";
    
    cout << (solve(s, t) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns true if s is a subsequence of t.
     */
    public static boolean solve(String s, String t) {
        // Your code here
        
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        String t = sc.hasNextLine() ? sc.nextLine() : "";
        
        System.out.println(solve(s, t));
    }
}`
  },

  testCases: [
    { input: 'abc\nahbgdc', expected: 'true' },
    { input: 'axc\nahbgdc', expected: 'false' },
    { input: '\nahbgdc', expected: 'true' },
    { input: 'aaaaaa\nbbaaaa', expected: 'false' },
    { input: 'ace\nabcde', expected: 'true' },
    { input: 'aec\nabcde', expected: 'false' },
    { input: 'bit\nbitset', expected: 'true' },
    { input: 'set\nbitset', expected: 'true' },
    { input: 'abc\nacb', expected: 'false' },
    { input: 'g\ng', expected: 'true' }
  ]
};