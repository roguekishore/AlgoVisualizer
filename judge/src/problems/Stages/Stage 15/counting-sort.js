/**
 * Counting Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Next n lines: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'counting-sort',
  conquestId: 'stage6-03',
  title: 'Counting Sort',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Sorting', 'Non-Comparison Sort', 'Array'],

  description: `Can we sort faster than $O(n \log n)$? Yes, if we stop comparing elements!

**Counting Sort** is a non-comparison-based sorting algorithm that works by counting the number of objects having distinct key values. It then uses arithmetic to calculate the positions of each object in the output sequence.

### The Trade-off
To achieve **$O(n + k)$** time complexity (where $n$ is the number of elements and $k$ is the range of input), we must know the range of the input in advance. It uses extra space proportional to that range.

### The Algorithm
1.  **Find the Range**: Identify the maximum value ($max$) and minimum value ($min$) in the array.
2.  **Count**: Create a "count array" of size $max - min + 1$. Iterate through the input and increment the corresponding index in the count array.
3.  **Accumulate**: (Optional for stability) Modify the count array so that each element at index $i$ stores the sum of previous counts. This tells you the actual position of the element.
4.  **Build**: Iterate through the input (backwards for stability) and place elements into the output array based on the count array.

### Example
**Input:** \`\`
**Range:** 1 to 8.
**Counts:** 1 occurs once, 2 occurs twice, 3 occurs twice, 4 occurs once, 8 occurs once.
**Output:** \`\`

### When to use?
- When the range of potential values ($k$) is not significantly larger than the number of elements ($n$).
- When you need a stable sort in linear time.`,

  examples: [
    {
      input: '7\n4 2 2 8 3 3 1',
      output: '1 2 2 3 3 4 8',
      explanation: 'Sorted in linear time based on frequency counts.'
    },
    {
      input: '5\n0 5 0 2 1',
      output: '0 0 1 2 5',
      explanation: 'Handles duplicate values and zero.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁶',
    '0 ≤ arr[i] ≤ 10⁵ (Range is limited to maintain efficiency)'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Performs Counting Sort on the input vector.
 */
void countingSort(vector<int>& arr) {
    if (arr.empty()) return;

    int maxVal = *max_element(arr.begin(), arr.end());
    int minVal = *min_element(arr.begin(), arr.end());
    int range = maxVal - minVal + 1;

    vector<int> count(range, 0);
    vector<int> output(arr.size());

    // 1. Fill count array
    // 2. Cumulative count (for stability)
    // 3. Build output array

    arr = output;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    countingSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    /**
     * Performs Counting Sort on the input array.
     */
    public static void countingSort(int[] arr) {
        int n = arr.length;
        if (n == 0) return;

        int max = arr, min = arr;
        for (int i : arr) {
            if (i > max) max = i;
            if (i < min) min = i;
        }

        int range = max - min + 1;
        int[] count = new int[range];
        int[] output = new int[n];

        // 1. Count occurrences
        // 2. Cumulative count
        // 3. Place elements in output array

        System.arraycopy(output, 0, arr, 0, n);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        countingSort(arr);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '7\n4 2 2 8 3 3 1', expected: '1 2 2 3 3 4 8' },
    { input: '5\n10 10 10 10 10', expected: '10 10 10 10 10' },
    { input: '6\n5 4 3 2 1 0', expected: '0 1 2 3 4 5' },
    { input: '4\n1 4 1 2', expected: '1 1 2 4' }
  ]
};