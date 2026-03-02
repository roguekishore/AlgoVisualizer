/**
 * Search in Sorted Array of Unknown Size — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer target.
 * Line 2: n space-separated sorted integers (representing the hidden array).
 *
 * Output format (stdout):
 * A single integer representing the 0-based index of the target.
 * If target is not found, return -1.
 */

module.exports = {
  id: 'search-in-sorted-array-of-unknown-size',
  conquestId: 'stage4-34',
  title: 'Search in Sorted Array of Unknown Size',
  difficulty: 'Medium',
  category: 'Arrays',
  tags: ['Array', 'Binary Search'],

  description: `This is an interactive-style problem. You have a sorted array of unique integers, but you **do not know its size**. 

You are provided with an interface \`ArrayReader\` that has a method \`get(index)\`. 
- \`get(index)\` returns the value at the specified index.
- If the index is out of bounds, it returns \`2147483647\` (the maximum value for a 32-bit signed integer).

Given a \`target\` value, return the index where \`target\` is located. If it does not exist, return \`-1\`.

### Task
Implement a solution in $O(\log T)$ where $T$ is the index of the target.
1. **Find the Range:** Since you don't know the upper bound, start with a range of size 2 (\`left = 0, right = 1\`).
2. While \`reader.get(right) < target\`, double the range: \`left = right\` and \`right = right * 2\`.
3. **Binary Search:** Once the target is within the range \`[left, right]\`, perform a standard binary search.

### Example
**Input:**
\`\`\`
9
-1 0 3 5 9 12
\`\`\`

**Output:**
\`\`\`
4
\`\`\`

**Explanation:**
The target 9 is at index 4. If we called \`reader.get(10)\`, it would return \`2147483647\`.`,

  examples: [
    {
      input: '9\n-1 0 3 5 9 12',
      output: '4',
      explanation: '9 is found at index 4.'
    },
    {
      input: '2\n-1 0 3 5 9 12',
      output: '-1',
      explanation: '2 is not in the array.'
    }
  ],

  constraints: [
    'The number of elements in the array is in the range [1, 10^4].',
    '-10^4 ≤ value, target ≤ 10^4',
    'All integers in the array are unique and sorted.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

// Mocking the ArrayReader interface
class ArrayReader {
    vector<int> data;
public:
    ArrayReader(vector<int> arr) : data(arr) {}
    int get(int index) {
        if (index >= data.size()) return 2147483647;
        return data[index];
    }
};

/**
 * Finds target index in an array of unknown size.
 */
int solve(ArrayReader& reader, int target) {
    int left = 0, right = 1;
    
    // 1. Find the bounds
    // Your code here
    
    // 2. Binary Search
    // Your code here
    
    return -1;
}

int main() {
    int target, val;
    cin >> target;
    vector<int> arr;
    while (cin >> val) arr.push_back(val);
    
    ArrayReader reader(arr);
    cout << solve(reader, target) << endl;
    return 0;
}`,
    java: `import java.util.*;

class ArrayReader {
    private int[] data;
    public ArrayReader(int[] arr) { this.data = arr; }
    public int get(int index) {
        if (index >= data.length) return Integer.MAX_VALUE;
        return data[index];
    }
}

public class Main {
    /**
     * Finds target index in an array of unknown size.
     */
    public static int solve(ArrayReader reader, int target) {
        int left = 0, right = 1;
        
        // 1. Find the bounds
        // Your code here
        
        // 2. Binary Search
        // Your code here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int target = sc.nextInt();
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(i -> i).toArray();
        
        ArrayReader reader = new ArrayReader(arr);
        System.out.println(solve(reader, target));
    }
}`
  },

  testCases: [
    { input: '9\n-1 0 3 5 9 12', expected: '4' },
    { input: '2\n-1 0 3 5 9 12', expected: '-1' },
    { input: '5\n5', expected: '0' },
    { input: '10\n1 2 3 4 5', expected: '-1' },
    { input: '1\n1 2 3 4 5 6 7 8 9 10', expected: '0' },
    { input: '10\n1 2 3 4 5 6 7 8 9 10', expected: '9' },
    { input: '0\n-5 -4 -3 -2 -1 0 1 2 3', expected: '5' },
    { input: '100\n10 20 30 100 200', expected: '3' },
    { input: '7\n1 3 5 7 9', expected: '3' },
    { input: '25\n10 20 30 40 50', expected: '-1' }
  ]
};