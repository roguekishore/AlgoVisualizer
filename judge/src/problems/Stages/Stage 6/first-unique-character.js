/**
 * First Unique Character — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * A single integer representing the 0-based index of the first 
 * non-repeating character. If it does not exist, return -1.
 */

module.exports = {
  id: 'first-unique-character',
  conquestId: 'stage4-15',
  title: 'First Unique Character',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Hash Table', 'Frequency Array'],

  description: `Given a string \`s\`, find the **first non-repeating character** in it and return its index. If it does not exist, return \`-1\`.

### Task
Implement an $O(n)$ solution using a **Frequency Map** or a fixed-size array (since the input consists of lowercase English letters).
1. Traverse the string once to count the occurrences of each character.
2. Traverse the string a second time and check the count of each character in the map.
3. The first character with a count of \`1\` is your answer. Return its index.
4. If the loop finishes without finding such a character, return \`-1\`.

### Example
**Input:**
\`\`\`
leetcode
\`\`\`

**Output:**
\`\`\`
0
\`\`\`

**Explanation:**
The character 'l' at index 0 is the first character that does not repeat.`,

  examples: [
    {
      input: 'leetcode',
      output: '0',
      explanation: "'l' is unique and appears first."
    },
    {
      input: 'loveleetcode',
      output: '2',
      explanation: "'v' is the first unique character at index 2."
    },
    {
      input: 'aabb',
      output: '-1',
      explanation: 'All characters repeat.'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 10⁵',
    's consists of only lowercase English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

/**
 * Returns the index of the first unique character in s.
 */
int solve(string s) {
    // Your code here
    
    return -1;
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
     * Returns the index of the first unique character in s.
     */
    public static int solve(String s) {
        // Your code here
        
        return -1;
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
    { input: 'leetcode', expected: '0' },
    { input: 'loveleetcode', expected: '2' },
    { input: 'aabb', expected: '-1' },
    { input: 'dddccdbba', expected: '8' },
    { input: 'abcabc', expected: '-1' },
    { input: 'z', expected: '0' },
    { input: 'aadadaad', expected: '-1' },
    { input: 'racecar', expected: '3' },
    { input: 'abacaba', expected: '3' },
    { input: 'pwwkew', expected: '0' }
  ]
};