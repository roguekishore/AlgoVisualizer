/**
 * Efficient Sorting — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'efficient-sorting',
  conquestId: 'stage6-02',
  title: 'Efficient Sorting Algorithms',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Divide and Conquer'],

  description: `Quadratic sorts ($O(n^2)$) are too slow for large datasets. To handle millions of items, we need algorithms that operate in **$O(n \log n)$** time. 

In this challenge, you will explore the "Big Three" of efficient sorting.

### 1. Merge Sort (Divide & Conquer)
- **Concept**: Recursively split the array into halves until you have single elements, then **merge** them back together in sorted order.
- **Pros**: Guaranteed $O(n \log n)$ performance and **stable**.
- **Cons**: Requires $O(n)$ extra space for the temporary merging arrays.

### 2. Quick Sort (Partitioning)
- **Concept**: Pick a "pivot" element and partition the array so that everything smaller than the pivot is on the left, and everything larger is on the right. Recursively sort the sub-arrays.
- **Pros**: Very fast in practice (low constant factors) and sorts **in-place** ($O(\log n)$ space).
- **Cons**: Worst-case is $O(n^2)$ if the pivot is poorly chosen (e.g., already sorted array).

### 3. Heap Sort (Priority-based)
- **Concept**: Build a **Max-Heap** from the data. Repeatedly extract the maximum element and move it to the end of the array.
- **Pros**: Guaranteed $O(n \log n)$ and sorts **in-place** ($O(1)$ space).
- **Cons**: Generally slower than Quick Sort in practice and **not stable**.

### Task
Implement one of these $O(n \log n)$ algorithms. For Quick Sort, try using a random pivot to avoid the worst-case scenario!

### Example
**Input:**
\`\`\`
6
12 11 13 5 6 7
\`\`\`

**Output:**
\`\`\`
5 6 7 11 12 13
\`\`\``,

  examples: [
    {
      input: '6\n12 11 13 5 6 7',
      output: '5 6 7 11 12 13',
      explanation: 'The array is sorted using an efficient O(n log n) algorithm.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

// Implement Merge Sort
void mergeSort(vector<int>& arr, int l, int r) {
    // Your code here
}

// Implement Quick Sort
void quickSort(vector<int>& arr, int low, int high) {
    // Your code here
}

// Implement Heap Sort
void heapSort(vector<int>& arr) {
    // Your code here
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    // Call your chosen sort
    mergeSort(arr, 0, n - 1);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void mergeSort(int[] arr, int l, int r) {
        // Your code here
    }

    public static void quickSort(int[] arr, int low, int high) {
        // Your code here
    }

    public static void heapSort(int[] arr) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        mergeSort(arr, 0, n - 1);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '6\n12 11 13 5 6 7', expected: '5 6 7 11 12 13' },
    { input: '5\n5 4 3 2 1', expected: '1 2 3 4 5' },
    { input: '1\n100', expected: '100' },
    { input: '8\n3 1 4 1 5 9 2 6', expected: '1 1 2 3 4 5 6 9' }
  ]
};