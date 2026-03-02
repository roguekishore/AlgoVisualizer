/**
 * Build Heap (Heapify) — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements in the array.
 * Line 2: n space-separated integers representing an unsorted array.
 *
 * Output format (stdout):
 * n space-separated integers representing the array in Max-Heap order.
 */

module.exports = {
  id: 'build-heap-heapify',
  conquestId: 'stage6-09',
  title: 'Build Heap (Heapify)',
  difficulty: 'Medium',
  category: 'Heaps',
  tags: ['Heap', 'Data Structure', 'Array', 'Sorting'],

  description: `Before you can use a Heap to sort or manage priorities, you must first convert a raw, unsorted array into a **Heap-ordered** array. This process is called **Heapify**.

### The Max-Heap Property
For any given node at index $i$:
* Its value must be **greater than or equal** to the values of its children.
* Left Child Index: $2i + 1$
* Right Child Index: $2i + 2$
* Parent Index: $(i - 1) / 2$

### The Optimal Strategy: Bottom-Up
While you could insert elements one by one ($O(n \log n)$), the most efficient way to build a heap is to start from the last non-leaf node and work backwards to the root.
1.  **Find the last non-leaf node**: This is at index $n/2 - 1$.
2.  **Sift Down**: For each node, check if it's smaller than its children. If it is, swap it with the larger child and continue "sifting" it down until the Max-Heap property is restored for that subtree.

### Time Complexity
Surprisingly, this bottom-up approach takes only **$O(n)$** time, not $O(n \log n)$. This is because most nodes are near the bottom of the tree and don't have far to sift.

### Example
**Input:** \`\`
**Visual Representation:**
\`\`\`
      4
    /   \\
   10    3
  /  \\
 5    1
\`\`\`
1. Start at index 1 (value 10). It's already greater than 5 and 1.
2. Move to index 0 (value 4). 4 is smaller than 10. **Swap**.
3. After sifting: \`\` (A valid Max-Heap!)`,

  examples: [
    {
      input: '5\n4 10 3 5 1',
      output: '10 5 3 4 1',
      explanation: 'The array is reorganized to satisfy the Max-Heap property.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    '-10⁹ ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// To heapify a subtree rooted with node i which is an index in arr[]. 
// n is size of heap
void heapify(vector<int>& arr, int n, int i) {
    int largest = i; // Initialize largest as root
    int l = 2 * i + 1; // left = 2*i + 1
    int r = 2 * i + 2; // right = 2*i + 2

    // If left child is larger than root
    // Your code here

    // If right child is larger than largest so far
    // Your code here

    // If largest is not root
    if (largest != i) {
        swap(arr[i], arr[largest]);
        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest);
    }
}

void buildHeap(vector<int>& arr) {
    int n = arr.size();
    // Index of last non-leaf node
    int startIdx = (n / 2) - 1;

    // Perform reverse level order traversal from last non-leaf node
    // and heapify each node
    for (int i = startIdx; i >= 0; i--) {
        heapify(arr, n, i);
    }
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    buildHeap(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;

        // If left child is larger than root
        // Your code here

        // If right child is larger than largest so far
        // Your code here

        if (largest != i) {
            int swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;

            heapify(arr, n, largest);
        }
    }

    static void buildHeap(int[] arr, int n) {
        int startIdx = (n / 2) - 1;
        for (int i = startIdx; i >= 0; i--) {
            heapify(arr, n, i);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        buildHeap(arr, n);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`
  },

  testCases: [
    { input: '5\n4 10 3 5 1', expected: '10 5 3 4 1' },
    { input: '6\n1 3 5 4 6 13', expected: '13 6 5 4 3 1' },
    { input: '1\n7', expected: '7' },
    { input: '4\n1 2 3 4', expected: '4 2 3 1' }
  ]
};