/**
 * Minimum Window Substring — Problem Definition
 *
 * Input format (stdin):
 * Line 1: String s.
 * Line 2: String t.
 *
 * Output format (stdout):
 * A single string representing the minimum window substring of s such that 
 * every character in t (including duplicates) is included in the window. 
 * If there is no such substring, return an empty string "".
 */

module.exports = {
  id: 'minimum-window-substring',
  conquestId: 'stage4-9',
  title: 'Minimum Window Substring',
  difficulty: 'Hard',
  category: 'Strings/Arrays',
  tags: ['String', 'Sliding Window', 'Hash Table'],

  description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (**including duplicates**) is included in the window. If there is no such substring, return the empty string \`""\`.

The test cases will be generated such that the answer is **unique**.

### Task
Implement an $O(m + n)$ solution using the **Sliding Window** technique with two pointers and frequency maps.
1. Create a frequency map for string \`t\`.
2. Expand the \`right\` pointer until the current window contains all characters from \`t\` with the required frequencies.
3. Once a valid window is found, contract the \`left\` pointer to minimize the window size while keeping it valid.
4. Keep track of the smallest valid window found during the process.

### Example
**Input:**
\`\`\`
ADOBECODEBANC
ABC
\`\`\`

**Output:**
\`\`\`
BANC
\`\`\`

**Explanation:**
The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.`,

  examples: [
    {
      input: 'ADOBECODEBANC\nABC',
      output: 'BANC',
      explanation: 'The substring "BANC" contains all characters from "ABC" and is the shortest.'
    },
    {
      input: 'a\na',
      output: 'a',
      explanation: 'The entire string is the minimum window.'
    },
    {
      input: 'a\naa',
      output: '',
      explanation: 'Both characters from "aa" must be in the window, but "a" only has one.'
    }
  ],

  constraints: [
    '1 ≤ s.length, t.length ≤ 10⁵',
    's and t consist of uppercase and lowercase English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <climits>

using namespace std;

/**
 * Returns the minimum window substring of s that contains all characters of t.
 */
string solve(string s, string t) {
    if (s.empty() || t.empty()) return "";
    // Your code here
    
    return "";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s, t;
    if (!(cin >> s >> t)) return 0;
    
    cout << solve(s, t) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;

public class Main {
    /**
     * Returns the minimum window substring of s that contains all characters of t.
     */
    public static String solve(String s, String t) {
        if (s == null || t == null || s.length() < t.length()) return "";
        // Your code here
        
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();
        
        System.out.println(solve(s, t));
    }
}`
  },

  testCases: [
    { input: 'ADOBECODEBANC\nABC', expected: 'BANC' },
    { input: 'a\na', expected: 'a' },
    { input: 'a\naa', expected: '' },
    { input: 'ab\nb', expected: 'b' },
    { input: 'aa\naa', expected: 'aa' },
    { input: 'DONOTPANIC\nANT', expected: 'NOTPA' },
    { input: 'BANC\nABC', expected: 'BANC' },
    { input: 'xyz\ny', expected: 'y' },
    { input: 'aaaaabbbbbc\nabc', expected: 'abbbbbc' },
    { input: 'ADOBECODEBANC\nXYZ', expected: '' }
  ]
};