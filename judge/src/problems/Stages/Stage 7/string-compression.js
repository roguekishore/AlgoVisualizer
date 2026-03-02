/**
 * String Compression — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of characters.
 * Line 2: n space-separated characters representing the array chars.
 *
 * Output format (stdout):
 * A single integer representing the new length of the array after compression.
 * (Note: The actual logic requires modifying the array in-place, 
 * but for this challenge, we return the compressed length).
 */

module.exports = {
  id: 'string-compression',
  conquestId: 'stage4-17',
  title: 'String Compression',
  difficulty: 'Medium',
  category: 'Strings',
  tags: ['String', 'Two Pointers'],

  description: `Given an array of characters \`chars\`, compress it using the following algorithm:

Begin with an empty string \`s\`. For each group of **consecutive repeating characters** in \`chars\`:
1. If the group's length is 1, append the character to \`s\`.
2. Otherwise, append the character followed by the group's length.

The compressed string \`s\` **should not be returned separately**, but instead, be stored **in the input character array \`chars\`**. Note that group lengths that are 10 or longer will be split into multiple characters in \`chars\`.

After you are done modifying the input array, return the new length of the array.

### Task
Implement an $O(n)$ in-place solution using **Two Pointers**:
1. Use one pointer (\`read\`) to iterate through the source array and another (\`write\`) to modify it.
2. For each new character, count how many times it repeats.
3. Write the character to \`chars[write]\`.
4. If the count > 1, convert the count to a string and write each digit to the following indices.

### Example
**Input:**
\`\`\`
7
a a b b c c c
\`\`\`

**Output:**
\`\`\`
6
\`\`\`

**Explanation:**
The groups are "aa", "bb", and "ccc". This compresses to "a2b2c3". The length is 6.`,

  examples: [
    {
      input: '7\na a b b c c c',
      output: '6',
      explanation: 'Compressed: ["a","2","b","2","c","3"]'
    },
    {
      input: '1\na',
      output: '1',
      explanation: 'Compressed: ["a"]'
    },
    {
      input: '13\na b b b b b b b b b b b b',
      output: '4',
      explanation: 'Compressed: ["a","b","1","2"]'
    }
  ],

  constraints: [
    '1 ≤ chars.length ≤ 2000',
    'chars[i] is a lowercase English letter, uppercase letter, digit, or symbol.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

/**
 * Modifies the array in-place and returns the new length.
 */
int solve(int n, vector<char>& chars) {
    if (n == 0) return 0;
    // Your code here
    
    return 0;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<char> chars(n);
    for (int i = 0; i < n; i++) cin >> chars[i];
    
    cout << solve(n, chars) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Modifies the array in-place and returns the new length.
     */
    public static int solve(int n, char[] chars) {
        if (n == 0) return 0;
        // Your code here
        
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        char[] chars = new char[n];
        for (int i = 0; i < n; i++) chars[i] = sc.next().charAt(0);
        
        System.out.println(solve(n, chars));
    }
}`
  },

  testCases: [
    { input: '7\na a b b c c c', expected: '6' },
    { input: '1\na', expected: '1' },
    { input: '13\na b b b b b b b b b b b b', expected: '4' },
    { input: '6\na a a a a a', expected: '2' },
    { input: '4\na b c d', expected: '4' },
    { input: '2\na a', expected: '2' },
    { input: '10\nz z z z z z z z z z', expected: '3' },
    { input: '3\n# # #', expected: '2' },
    { input: '5\n1 1 2 2 2', expected: '4' },
    { input: '11\na a b b b c c c c d d', expected: '8' }
  ]
};