/**
 * Radix Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated non-negative integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'radix-sort',
  conquestId: 'stage6-04',
  title: 'Radix Sort',
  difficulty: 'Hard',
  category: 'Sorting',
  tags: ['Sorting', 'Non-Comparison Sort', 'Radix Sort', 'Counting Sort'],

  description: `Counting Sort is great, but what if the range of numbers is massive (like sorting IDs up to 1 billion)? Creating a count array of size 1 billion would crash your memory.

**Radix Sort** solves this by sorting numbers **digit by digit**, starting from the Least Significant Digit (LSD) to the Most Significant Digit (MSD).

### The Secret Sauce: Stability
For Radix Sort to work, the underlying sort used for each digit **must be stable**. We typically use **Counting Sort** as the helper because the range for a single digit is always small ($0-9$).

### How it works:
1.  Find the maximum number to know how many digits we need to process.
2.  Perform Counting Sort for the units place ($10^0$).
3.  Perform Counting Sort for the tens place ($10^1$), then hundreds ($10^2$), and so on.
4.  Because the sort is stable, the relative order established by the previous digit is preserved.

### Complexity
- **Time**: $O(d \times (n + k))$, where $d$ is the number of digits and $k$ is the base (usually 10).
- **Space**: $O(n + k)$ for the counting sort buckets.

### Example
Input: \`\`
1. Sort by units: \`\`
2. Sort by tens: \`\`
3. Sort by hundreds: \`\` (Done!)`,

  examples: [
    {
      input: '8\n170 45 75 90 802 24 2 66',
      output: '2 24 45 66 75 90 170 802',
      explanation: 'Digits are processed from right to left.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '0 ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// A utility function to do counting sort of arr[] according to
// the digit represented by exp (10^i).
void countSort(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n);
    int count = {0};

    // Store count of occurrences in count[]
    for (int i = 0; i < n; i++)
        count[(arr[i] / exp) % 10]++;

    // Change count[i] so that count[i] now contains actual
    // position of this digit in output[]
    for (int i = 1; i < 10; i++)
        count[i] += count[i - 1];

    // Build the output array (Go backwards for stability!)
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }

    for (int i = 0; i < n; i++)
        arr[i] = output[i];
}

void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    int m = *max_element(arr.begin(), arr.end());

    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, exp);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    radixSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    static void countSort(int[] arr, int n, int exp) {
        int[] output = new int[n];
        int[] count = new int;
        Arrays.fill(count, 0);

        for (int i = 0; i < n; i++)
            count[(arr[i] / exp) % 10]++;

        for (int i = 1; i < 10; i++)
            count[i] += count[i - 1];

        for (int i = n - 1; i >= 0; i--) {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }

        System.arraycopy(output, 0, arr, 0, n);
    }

    static void radixSort(int[] arr, int n) {
        if (n == 0) return;
        int m = Arrays.stream(arr).max().getAsInt();

        for (int exp = 1; m / exp > 0; exp *= 10)
            countSort(arr, n, exp);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        radixSort(arr, n);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '8\n170 45 75 90 802 24 2 66', expected: '2 24 45 66 75 90 170 802' },
    { input: '3\n1000 100 10', expected: '10 100 1000' },
    { input: '5\n55 44 33 22 11', expected: '11 22 33 44 55' },
    { input: '4\n0 0 1 0', expected: '0 0 0 1' }
  ]
};