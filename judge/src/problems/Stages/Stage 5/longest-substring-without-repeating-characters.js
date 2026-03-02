/**
 * Longest Substring Without Repeating Characters — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * A single integer representing the length of the longest substring 
 * without repeating characters.
 */

module.exports = {
  id: 'longest-substring-without-repeating-characters',
  conquestId: 'stage4-7',
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'Medium',
  category: 'Strings/Arrays',
  tags: ['String', 'Sliding Window', 'Hash Table'],

  description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Task
Implement an $O(n)$ solution using the **Sliding Window** technique with a hash map (or an array for ASCII).
1. Use two pointers, \`left\` and \`right\`, to define the current window.
2. As you move \`right\`, store the index of each character in a map.
3. If a character is repeated, move \`left\` to \`max(left, map[char] + 1)\` to ensure the window remains unique.
4. Keep track of the maximum window size (\`right - left + 1\`).

### Example
**Input:**
\`\`\`
abcabcbb
\`\`\`

**Output:**
\`\`\`
3
\`\`\`

**Explanation:**
The answer is "abc", with the length of 3.`,

  examples: [
    {
      input: 'abcabcbb',
      output: '3',
      explanation: 'The longest unique substrings are "abc", "bca", "cab".'
    },
    {
      input: 'bbbbb',
      output: '1',
      explanation: 'The longest unique substring is "b".'
    },
    {
      input: 'pwwkew',
      output: '3',
      explanation: 'The longest unique substring is "wke". Note that "pwke" is a subsequence, not a substring.'
    }
  ],

  constraints: [
    '0 ≤ s.length ≤ 5 × 10⁴',
    's consists of English letters, digits, symbols and spaces.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

/**
 * Returns the length of the longest substring without repeating characters.
 */
int solve(string s) {
    int maxLen = 0;
    // Your code here
    
    return maxLen;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s;
    getline(cin, s); // Use getline to handle spaces
    
    cout << solve(s) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;

public class Main {
    /**
     * Returns the length of the longest substring without repeating characters.
     */
    public static int solve(String s) {
        int maxLen = 0;
        // Your code here
        
        return maxLen;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        
        System.out.println(solve(s));
    }
}`
  },

  testCases: [
    { input: 'abcabcbb', expected: '3' },
    { input: 'bbbbb', expected: '1' },
    { input: 'pwwkew', expected: '3' },
    { input: '', expected: '0' },
    { input: ' ', expected: '1' },
    { input: 'au', expected: '2' },
    { input: 'dvdf', expected: '3' },
    { input: 'abba', expected: '2' },
    { input: 'tmmzuxt', expected: '5' },
    { input: 'abcdefg', expected: '7' }
  ]
};