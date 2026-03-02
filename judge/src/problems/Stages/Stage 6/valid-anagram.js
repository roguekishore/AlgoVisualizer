/**
 * Valid Anagram — Problem Definition
 *
 * Input format (stdin):
 * Line 1: String s.
 * Line 2: String t.
 *
 * Output format (stdout):
 * "true" if t is an anagram of s, and "false" otherwise.
 */

module.exports = {
  id: 'valid-anagram',
  conquestId: 'stage4-14',
  title: 'Valid Anagram',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Hash Table', 'Sorting'],

  description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Task
Implement an efficient solution. There are two common approaches:
1. **Sorting ($O(n \\log n)$):** Sort both strings and compare them. If they are identical, they are anagrams.
2. **Frequency Counter ($O(n)$):** Use a hash map or an array of size 26 (for lowercase English letters) to count the occurrences of each character in \`s\` and subtract the counts based on \`t\`. If all counts return to zero, they are anagrams.

### Example
**Input:**
\`\`\`
anagram
nagaram
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

**Explanation:**
Both strings contain the same characters with the same frequencies.`,

  examples: [
    {
      input: 'anagram\nnagaram',
      output: 'true',
      explanation: 'Both strings contain the same characters with the same frequencies.'
    },
    {
      input: 'rat\ncar',
      output: 'false',
      explanation: 'The strings have different characters.'
    },
    {
      input: 'listen\nsilent',
      output: 'true',
      explanation: 'The strings are anagrams of each other.'
    }
  ],

  constraints: [
    '1 ≤ s.length, t.length ≤ 5 × 10⁴',
    's and t consist of lowercase English letters'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

/**
 * Returns "true" if t is an anagram of s, "false" otherwise.
 */
string solve(string s, string t) {
    // Your code here
    
    return "false";
}

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;
    
    cout << solve(s, t) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns "true" if t is an anagram of s, "false" otherwise.
     */
    public static String solve(String s, String t) {
        // Your code here
        
        return "false";
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
    { input: 'anagram\nnagaram', expected: 'true' },
    { input: 'rat\ncar', expected: 'false' },
    { input: 'listen\nsilent', expected: 'true' },
    { input: 'a\na', expected: 'true' },
    { input: 'ab\na', expected: 'false' },
    { input: 'abc\ncba', expected: 'true' },
    { input: 'aabbcc\nccbbaa', expected: 'true' },
    { input: 'hello\nworld', expected: 'false' }
  ]
};
