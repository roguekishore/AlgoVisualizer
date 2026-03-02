/**
 * Palindrome Check — Problem Definition
 *
 * Input format (stdin):
 * Line 1: A string s.
 *
 * Output format (stdout):
 * "true" if the string is a palindrome, "false" otherwise.
 */

module.exports = {
  id: 'palindrome-check',
  conquestId: 'stage4-11',
  title: 'Palindrome Check',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Two Pointers'],

  description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Task
Implement an $O(n)$ solution using **Two Pointers**.
1. Initialize one pointer at the start and one at the end of the string.
2. Skip non-alphanumeric characters.
3. Compare characters at both pointers (case-insensitive).
4. If they differ, it's not a palindrome. If the pointers meet, it is.

### Example
**Input:**
\`\`\`
A man, a plan, a canal: Panama
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

**Explanation:**
"amanaplanacanalpanama" is a palindrome.`,

  examples: [
    {
      input: 'A man, a plan, a canal: Panama',
      output: 'true',
      explanation: 'After cleaning: "amanaplanacanalpanama" reads the same both ways.'
    },
    {
      input: 'race a car',
      output: 'false',
      explanation: 'After cleaning: "raceacar" is not a palindrome.'
    },
    {
      input: ' ',
      output: 'true',
      explanation: 'An empty string is a palindrome.'
    }
  ],

  constraints: [
    '1 ≤ s.length ≤ 2 × 10⁵',
    's consists only of printable ASCII characters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

/**
 * Returns true if the string is a palindrome after cleaning.
 */
bool solve(string s) {
    // Your code here
    
    return true;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s;
    getline(cin, s);
    
    cout << (solve(s) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns true if the string is a palindrome after cleaning.
     */
    public static boolean solve(String s) {
        // Your code here
        
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        
        System.out.println(solve(s));
    }
}`
  },

  testCases: [
    { input: 'A man, a plan, a canal: Panama', expected: 'true' },
    { input: 'race a car', expected: 'false' },
    { input: ' ', expected: 'true' },
    { input: '0P', expected: 'false' },
    { input: 'No "x" in Nixon', expected: 'true' },
    { input: 'Was it a car or a cat I saw?', expected: 'true' },
    { input: '12321', expected: 'true' },
    { input: '123421', expected: 'false' },
    { input: '.,', expected: 'true' },
    { input: 'Tab a cat.', expected: 'true' }
  ]
};