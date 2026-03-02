/**
 * Bucket Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated floating-point numbers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated numbers (formatted to 2 decimal places).
 */

module.exports = {
  id: 'bucket-sort',
  conquestId: 'stage6-05',
  title: 'Bucket Sort',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Sorting', 'Distribution Sort', 'Array'],

  description: `**Bucket Sort** is a distribution-based sorting algorithm that is particularly effective when the input is **uniformly distributed** over a range (commonly $[0, 1)$).

### The Logic
It works by partitioning the input into several "buckets." Each bucket is then sorted individually, either using a different sorting algorithm or by recursively applying Bucket Sort.

### How it works:
1.  **Create Buckets**: Create $n$ empty buckets (usually lists).
2.  **Distribute**: For each element \`arr[i]\`, calculate the bucket index using a formula like \`index = n * arr[i]\` and put the element into that bucket.
3.  **Sort Buckets**: Sort each non-empty bucket (Insertion Sort is commonly used here for small bucket sizes).
4.  **Concatenate**: Visit the buckets in order and gather the elements back into the original array.

### Complexity
- **Average Time**: $O(n + k)$ where $k$ is the number of buckets.
- **Worst Case**: $O(n^2)$ if all elements fall into a single bucket and we use a quadratic sort like Insertion Sort.
- **Space**: $O(n + k)$.

### Example
**Input:** \`[0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]\`
1. Buckets are created (e.g., 10 buckets for ranges 0.0-0.1, 0.1-0.2, etc.).
2. 0.17 and 0.12 go into Bucket 1.
3. 0.26, 0.21, and 0.23 go into Bucket 2.
4. Each bucket is sorted and concatenated.`,

  examples: [
    {
      input: '5\n0.897 0.565 0.656 0.123 0.665',
      output: '0.12 0.57 0.66 0.67 0.90',
      explanation: 'Values are distributed into buckets and sorted.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '0.0 ≤ arr[i] < 1.0 (Standard Bucket Sort range)'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

void bucketSort(vector<float>& arr) {
    int n = arr.size();
    if (n <= 0) return;

    // 1) Create n empty buckets
    vector<vector<float>> b(n);

    // 2) Put array elements in different buckets
    for (int i = 0; i < n; i++) {
        int bi = n * arr[i]; // Index in bucket
        b[bi].push_back(arr[i]);
    }

    // 3) Sort individual buckets
    for (int i = 0; i < n; i++) {
        sort(b[i].begin(), b[i].end());
    }

    // 4) Concatenate all buckets into arr[]
    int index = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < b[i].size(); j++) {
            arr[index++] = b[i][j];
        }
    }
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<float> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    bucketSort(arr);

    for (int i = 0; i < n; i++) {
        cout << fixed << setprecision(2) << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void bucketSort(float[] arr, int n) {
        if (n <= 0) return;

        // 1) Create buckets
        List<Float>[] buckets = new ArrayList[n];
        for (int i = 0; i < n; i++) {
            buckets[i] = new ArrayList<Float>();
        }

        // 2) Add elements to buckets
        for (int i = 0; i < n; i++) {
            int bucketIndex = (int) (arr[i] * n);
            buckets[bucketIndex].add(arr[i]);
        }

        // 3) Sort individual buckets
        for (int i = 0; i < n; i++) {
            Collections.sort(buckets[i]);
        }

        // 4) Concatenate
        int index = 0;
        for (int i = 0; i < n; i++) {
            for (float val : buckets[i]) {
                arr[index++] = val;
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        float[] arr = new float[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextFloat();

        bucketSort(arr, n);

        for (int i = 0; i < n; i++) {
            System.out.printf("%.2f%s", arr[i], (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '5\n0.89 0.56 0.65 0.12 0.66', expected: '0.12 0.56 0.65 0.66 0.89' },
    { input: '3\n0.1 0.1 0.1', expected: '0.10 0.10 0.10' },
    { input: '4\n0.9 0.7 0.5 0.3', expected: '0.30 0.50 0.70 0.90' }
  ]
};