/**
 * Reverse Words in a String — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s containing words separated by at least one space.
 *
 * Output format (stdout):
 * A single string representing the words in reverse order, joined by a single space.
 */

module.exports = {
  id: 'reverse-words-in-a-string',
  conquestId: 'stage4-18',
  title: 'Reverse Words in a String',
  difficulty: 'Medium',
  category: 'Strings',
  tags: ['String', 'Two Pointers'],

  description: `Given an input string \`s\`, reverse the order of the **words**.

A word is defined as a sequence of non-space characters. The words in \`s\` will be separated by at least one space.

Return a string of the words in reverse order concatenated by a single space.

**Note** that \`s\` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.

### Task
Implement an efficient solution. While many languages offer \`split()\` and \`reverse()\` methods, try to think about how you would do this using **Two Pointers**:
1. Clean the string (remove extra spaces).
2. Reverse the entire string.
3. Iterate through the string and reverse each individual word.

### Example
**Input:**
\`\`\`
  the sky is blue  
\`\`\`

**Output:**
\`\`\`
blue is sky the
\`\`\`

**Explanation:**
The words are reversed, and the leading/trailing spaces are removed.`,

  examples: [
    {
      input: 'the sky is blue',
      output: 'blue is sky the',
      explanation: 'Standard reversal of words.'
    },
    {
      input: '  hello world  ',
      output: 'world hello',
      explanation: 'Leading and trailing spaces are removed.'
    },
    {
      input: 'a good   example',
      output: 'example good a',
      explanation: 'Multiple spaces between words are reduced to a single space.'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 10⁴',
    's contains English letters (upper and lower), digits, and spaces.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <sstream>

using namespace std;

/**
 * Returns the string with words reversed and extra spaces removed.
 */
string solve(string s) {
    // Your code here
    
    return "";
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
import java.util.Collections;
import java.util.Arrays;
import java.util.List;

public class Main {
    /**
     * Returns the string with words reversed and extra spaces removed.
     */
    public static String solve(String s) {
        // Your code here
        
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        
        System.out.println(solve(s));
    }
}`
  },

  testCases: [
    { input: 'the sky is blue', expected: 'blue is sky the' },
    { input: '  hello world  ', expected: 'world hello' },
    { input: 'a good   example', expected: 'example good a' },
    { input: '  Bob    Loves  Alice   ', expected: 'Alice Loves Bob' },
    { input: 'Alice', expected: 'Alice' },
    { input: '123 456', expected: '456 123' },
    { input: '   one   ', expected: 'one' },
    { input: 'EPIC', expected: 'EPIC' },
    { input: '  multiple    spaces  between    words ', expected: 'words between spaces multiple' },
    { input: '! ? .', expected: '. ? !' }
  ]
};