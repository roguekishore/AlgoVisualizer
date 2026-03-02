/**
 * Find Smallest Letter Greater Than Target — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of characters in the array.
 * Line 2: n space-separated lowercase letters (sorted).
 * Line 3: A single character target.
 *
 * Output format (stdout):
 * A single character representing the smallest letter in letters 
 * that is lexicographically greater than target.
 */

module.exports = {
  id: 'find-smallest-letter-greater-than-target',
  conquestId: 'stage4-26',
  title: 'Find Smallest Letter Greater Than Target',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `You are given an array of characters \`letters\` that is sorted in **non-decreasing order**, and a character \`target\`. There are at least two unique characters in \`letters\`.

Return the smallest character in \`letters\` that is lexicographically **greater than** \`target\`. If such a character does not exist, return the first character in \`letters\`.

### Task
Implement an $O(\log n)$ solution using **Binary Search**.
1. This is a variation of the "ceiling" problem.
2. Even if the target is found, you need to continue searching to the right to find something strictly greater.
3. If the \`left\` pointer exceeds the bounds of the array, the answer "wraps around" to the first element (\`letters\`).

### Example
**Input:**
\`\`\`
3
c f j
a
\`\`\`

**Output:**
\`\`\`
c
\`\`\`

**Explanation:**
The smallest character that is lexicographically greater than 'a' in letters is 'c'.`,

  examples: [
    {
      input: '3\nc f j\na',
      output: 'c',
      explanation: "'c' is the first letter greater than 'a'."
    },
    {
      input: '3\nc f j\nc',
      output: 'f',
      explanation: "'f' is the first letter strictly greater than 'c'."
    },
    {
      input: '3\nc f j\nz',
      output: 'c',
      explanation: "No letter is greater than 'z', so we wrap around to the first letter."
    }
  ],

  constraints: [
    '2 ≤ letters.length ≤ 10⁴',
    'letters[i] is a lowercase English letter.',
    'letters is sorted in non-decreasing order.',
    'target is a lowercase English letter.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Returns the smallest letter strictly greater than target.
 */
char solve(int n, vector<char>& letters, char target) {
    int left = 0, right = n - 1;
    // Your code here
    
    return letters;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<char> letters(n);
    for (int i = 0; i < n; i++) cin >> letters[i];
    char target;
    cin >> target;
    
    cout << solve(n, letters, target) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the smallest letter strictly greater than target.
     */
    public static char solve(int n, char[] letters, char target) {
        int left = 0, right = n - 1;
        // Your code here
        
        return letters;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util.Scanner(System.in));
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        char[] letters = new char[n];
        for (int i = 0; i < n; i++) letters[i] = sc.next().charAt(0);
        char target = sc.next().charAt(0);
        
        System.out.println(solve(n, letters, target));
    }
}`
  },

  testCases: [
    { input: '3\nc f j\na', expected: 'c' },
    { input: '3\nc f j\nc', expected: 'f' },
    { input: '3\nc f j\nd', expected: 'f' },
    { input: '3\nc f j\nz', expected: 'c' },
    { input: '2\na b\nz', expected: 'a' },
    { input: '4\ne e e n\ne', expected: 'n' },
    { input: '5\na b c d e\nc', expected: 'd' },
    { input: '2\nx y\ny', expected: 'x' },
    { input: '3\na b c\nd', expected: 'a' },
    { input: '6\na b c d e f\na', expected: 'b' }
  ]
};