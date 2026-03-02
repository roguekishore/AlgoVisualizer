/**
 * Count Vowels — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * A single integer representing the number of vowels in the string.
 */

module.exports = {
  id: 'count-vowels',
  conquestId: 'stage4-13',
  title: 'Count Vowels',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Iteration'],

  description: `Given a string \`s\`, count and return the total number of vowels present in it.

Vowels are the characters \`a\`, \`e\`, \`i\`, \`o\`, and \`u\`. The check should be **case-insensitive**, meaning both lowercase and uppercase vowels should be counted.

### Task
Implement a simple linear scan $O(n)$ solution.
1. Initialize a counter to zero.
2. Iterate through each character of the string.
3. Check if the character (converted to lowercase) is one of 'a', 'e', 'i', 'o', or 'u'.
4. Increment the counter for every match.

### Example
**Input:**
\`\`\`
Hello World
\`\`\`

**Output:**
\`\`\`
3
\`\`\`

**Explanation:**
The vowels are 'e', 'o', and 'o'.`,

  examples: [
    {
      input: 'Hello World',
      output: '3',
      explanation: 'e, o, o are the vowels.'
    },
    {
      input: 'AEIOU',
      output: '5',
      explanation: 'All characters are uppercase vowels.'
    },
    {
      input: 'bcdfg',
      output: '0',
      explanation: 'No vowels present.'
    }
  ],

  constraints: [
    '0 ≤ s.length ≤ 10⁵',
    's consists of English letters, spaces, and punctuation.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

/**
 * Returns the count of vowels in the string.
 */
int solve(string s) {
    int count = 0;
    // Your code here
    
    return count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s;
    getline(cin, s);
    
    cout << solve(s) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the count of vowels in the string.
     */
    public static int solve(String s) {
        int count = 0;
        // Your code here
        
        return count;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        
        System.out.println(solve(s));
    }
}`
  },

  testCases: [
    { input: 'Hello World', expected: '3' },
    { input: 'AEIOU', expected: '5' },
    { input: 'bcdfg', expected: '0' },
    { input: 'Education', expected: '5' },
    { input: 'Why?', expected: '0' },
    { input: 'The quick brown fox jumps over the lazy dog', expected: '11' },
    { input: '1234567890', expected: '0' },
    { input: 'a e i o u', expected: '5' },
    { input: 'AaaaA', expected: '5' },
    { input: '', expected: '0' }
  ]
};