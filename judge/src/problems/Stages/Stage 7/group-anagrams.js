/**
 * Group Anagrams — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of strings.
 * Next n lines: Each line contains one string.
 *
 * Output format (stdout):
 * Groups of anagrams. Each group should be on a new line.
 * Words within a group should be sorted alphabetically.
 * Groups should be sorted by their first word alphabetically.
 */

module.exports = {
  id: 'group-anagrams',
  conquestId: 'stage4-20',
  title: 'Group Anagrams',
  difficulty: 'Medium',
  category: 'Strings',
  tags: ['String', 'Hash Table', 'Sorting'],

  description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in any order, but for this exercise, please follow the sorting rules in the output format.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Task
Implement an efficient solution using a **Hash Map**:
1. Iterate through each string in the array.
2. For each string, create a "key" that is the same for all anagrams. 
   - Option A: Sort the characters of the string (e.g., "eat" -> "aet").
   - Option B: Create a frequency count array of size 26 converted to a string.
3. Use this key to store the original string in a list within a hash map.
4. Finally, collect all lists from the map and format them for output.

### Example
**Input:**
\`\`\`
6
eat
tea
tan
ate
nat
bat
\`\`\`

**Output:**
\`\`\`
ate eat tea
bat
nat tan
\`\`\`

**Explanation:**
- "ate", "eat", and "tea" are anagrams.
- "nat" and "tan" are anagrams.
- "bat" is in its own group.`,

  examples: [
    {
      input: '6\neat\ntea\ntan\nate\nnat\nbat',
      output: 'ate eat tea\nbat\nnat tan',
      explanation: 'Strings with the same characters are grouped together.'
    },
    {
      input: '1\n\n',
      output: '',
      explanation: 'An empty string is its own group.'
    },
    {
      input: '2\na\nb',
      output: 'a\nb',
      explanation: 'No anagrams exist.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁴',
    '0 ≤ strs[i].length ≤ 100',
    'strs[i] consists of lowercase English letters.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <map>

using namespace std;

/**
 * Groups anagrams and returns them in a sorted fashion.
 */
vector<vector<string>> solve(int n, vector<string>& strs) {
    // Your code here
    
    return {};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<string> strs(n);
    for (int i = 0; i < n; i++) cin >> strs[i];
    
    vector<vector<string>> result = solve(n, strs);
    for (auto& group : result) {
        for (int i = 0; i < group.size(); i++) {
            cout << group[i] << (i == group.size() - 1 ? "" : " ");
        }
        cout << "\\n";
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    /**
     * Groups anagrams and returns them in a sorted fashion.
     */
    public static List<List<String>> solve(int n, String[] strs) {
        // Your code here
        
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = sc.next();
        
        List<List<String>> result = solve(n, strs);
        for (List<String> group : result) {
            System.out.println(String.join(" ", group));
        }
    }
}`
  },

  testCases: [
    { input: '6\neat\ntea\ntan\nate\nnat\nbat', expected: 'ate eat tea\nbat\nnat tan' },
    { input: '1\na', expected: 'a' },
    { input: '3\na\nb\nc', expected: 'a\nb\nc' },
    { input: '4\nabba\nbaba\nbaab\naabb', expected: 'aabb abba baab baba' },
    { input: '2\nlisten\nsilent', expected: 'listen silent' },
    { input: '3\napple\npapel\napply', expected: 'apple papel\napply' },
    { input: '5\naaa\naa\na\naaa\naa', expected: 'a\naa aa\naaa aaa' },
    { input: '2\nab\nba', expected: 'ab ba' },
    { input: '4\nstop\npots\nopts\nspot', expected: 'opts pots spot stop' },
    { input: '3\ncat\ndog\ntac', expected: 'cat tac\ndog' }
  ]
};