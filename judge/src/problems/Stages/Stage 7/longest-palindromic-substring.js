/**
 * Longest Palindromic Substring — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * A single string representing the longest palindromic substring.
 */

module.exports = {
  id: 'longest-palindromic-substring',
  conquestId: 'stage4-21',
  title: 'Longest Palindromic Substring',
  difficulty: 'Medium',
  category: 'Strings',
  tags: ['String', 'Dynamic Programming', 'Two Pointers'],

  description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

A string is a **palindrome** if it reads the same forward and backward.

### Task
Implement an $O(n^2)$ solution. A common efficient approach is the **Expand Around Center** method:
1. A palindrome can be centered at a single character (odd length, e.g., "aba") or between two characters (even length, e.g., "abba").
2. For each index \`i\` from 0 to \`n-1\`:
   - Expand outwards as long as the characters match for both odd and even centers.
3. Keep track of the maximum length found and its starting/ending indices.

### Example
**Input:**
\`\`\`
babad
\`\`\`

**Output:**
\`\`\`
bab
\`\`\`

**Explanation:**
"aba" is also a valid answer. For the purpose of testing, any valid longest palindrome will be accepted (the test cases here expect the first one encountered).`,

  examples: [
    {
      input: 'babad',
      output: 'bab',
      explanation: '"aba" is also valid.'
    },
    {
      input: 'cbbd',
      output: 'bb',
      explanation: 'The longest palindrome is "bb".'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 1000',
    's consists of digits and English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

/**
 * Returns the longest palindromic substring.
 */
string solve(string s) {
    if (s.length() < 1) return "";
    // Your code here
    
    return "";
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
     * Returns the longest palindromic substring.
     */
    public static String solve(String s) {
        if (s == null || s.length() < 1) return "";
        // Your code here
        
        return "";
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
    { input: 'babad', expected: 'bab' },
    { input: 'cbbd', expected: 'bb' },
    { input: 'a', expected: 'a' },
    { input: 'ac', expected: 'a' },
    { input: 'racecar', expected: 'racecar' },
    { input: 'noon', expected: 'noon' },
    { input: 'abacaba', expected: 'abacaba' },
    { input: 'aacabdkalgas', expected: 'aca' },
    { input: 'abbcccbbb', expected: 'bbb' },
    { input: 'forgeeksskeegfor', expected: 'geeksskeeg' }
  ]
};