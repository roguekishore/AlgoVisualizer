/**
 * Longest Common Prefix — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of strings.
 * Next n lines: Each line contains one string.
 *
 * Output format (stdout):
 * A single string representing the longest common prefix. 
 * If no common prefix exists, return an empty string "".
 */

module.exports = {
  id: 'longest-common-prefix',
  conquestId: 'stage4-16',
  title: 'Longest Common Prefix',
  difficulty: 'Easy',
  category: 'Strings',
  tags: ['String', 'Iteration'],

  description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string \`""\`.

### Task
There are several ways to solve this efficiently:
1. **Horizontal Scanning:** Start with the first string as the prefix. Compare it with the second, update the prefix, then compare with the third, and so on.
2. **Vertical Scanning:** Compare characters at index 0 for all strings, then index 1, etc., until a mismatch is found or a string ends.
3. **Sorting:** Sort the array of strings. The longest common prefix must be common to the first and last strings in the sorted list.

### Example
**Input:**
\`\`\`
3
flower
flow
flight
\`\`\`

**Output:**
\`\`\`
fl
\`\`\`

**Explanation:**
All three strings start with "fl".`,

  examples: [
    {
      input: '3\nflower\nflow\nflight',
      output: 'fl',
      explanation: 'The common part at the start is "fl".'
    },
    {
      input: '3\ndog\nracecar\ncar',
      output: '',
      explanation: 'There is no common prefix among the input strings.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 200',
    '0 ≤ strs[i].length ≤ 200',
    'strs[i] consists of only lowercase English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

/**
 * Returns the longest common prefix among a vector of strings.
 */
string solve(int n, vector<string>& strs) {
    if (n == 0) return "";
    // Your code here
    
    return "";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<string> strs(n);
    for (int i = 0; i < n; i++) cin >> strs[i];
    
    cout << solve(n, strs) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the longest common prefix among an array of strings.
     */
    public static String solve(int n, String[] strs) {
        if (n == 0) return "";
        // Your code here
        
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = sc.next();
        
        System.out.println(solve(n, strs));
    }
}`
  },

  testCases: [
    { input: '3\nflower\nflow\nflight', expected: 'fl' },
    { input: '3\ndog\nracecar\ncar', expected: '' },
    { input: '2\nab\na', expected: 'a' },
    { input: '1\nonlyone', expected: 'onlyone' },
    { input: '4\napple\napply\napplied\napp', expected: 'app' },
    { input: '3\naaaaa\naaaa\naa', expected: 'aa' },
    { input: '2\ninterstellar\ninterstate', expected: 'interst' },
    { input: '2\ncat\ndog', expected: '' },
    { input: '3\nprefix\nprefix\nprefix', expected: 'prefix' },
    { input: '2\n\n', expected: '' }
  ]
};