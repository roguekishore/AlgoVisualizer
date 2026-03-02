/**
 * Quadratic Sorting — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'quadratic-sorting',
  conquestId: 'stage6-01',
  title: 'Quadratic Sorting Algorithms',
  difficulty: 'Easy',
  category: 'Sorting',
  tags: ['Sorting', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'],

  description: `Welcome to **Stage 6: Sorting Algorithms**! Sorting is the bedrock of computer science. It turns messy data into a structure that allows for $O(\log n)$ searching and efficient processing.

In this challenge, you will implement the three "Elementary" sorting algorithms. All three have a **Time Complexity of $O(n^2)$**, making them suitable for small datasets but inefficient for large ones.

### 1. Bubble Sort
- **Concept**: Repeatedly swap adjacent elements if they are in the wrong order.
- **Visual**: The largest element "bubbles up" to the end of the array in each pass.
- **Best Case**: $O(n)$ if the array is already sorted (with an early exit flag).

### 2. Selection Sort
- **Concept**: Find the minimum element in the unsorted part and swap it with the first element of the unsorted part.
- **Visual**: It builds the sorted array one "minimum" at a time from left to right.
- **Fact**: It always performs $O(n^2)$ comparisons, even if the array is sorted.

### 3. Insertion Sort
- **Concept**: Take one element at a time and "insert" it into its correct position relative to the already sorted part.
- **Visual**: Similar to how you sort a hand of playing cards.
- **Fact**: Very efficient for arrays that are "nearly sorted."

### Task
Implement one (or all!) of these algorithms to sort the input array in non-decreasing order.

### Example
**Input:**
\`\`\`
5
5 1 4 2 8
\`\`\`

**Output:**
\`\`\`
1 2 4 5 8
\`\`\``,

  examples: [
    {
      input: '5\n5 1 4 2 8',
      output: '1 2 4 5 8',
      explanation: 'The unsorted array is returned in ascending order.'
    },
    {
      input: '3\n10 -1 0',
      output: '-1 0 10',
      explanation: 'Handles negative numbers correctly.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 1000',
    '-10⁵ ≤ arr[i] ≤ 10⁵'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void bubbleSort(vector<int>& arr) {
    // Your code here
}

void selectionSort(vector<int>& arr) {
    // Your code here
}

void insertionSort(vector<int>& arr) {
    // Your code here
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    // Pick one to implement!
    bubbleSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void bubbleSort(int[] arr) {
        // Your code here
    }

    public static void selectionSort(int[] arr) {
        // Your code here
    }

    public static void insertionSort(int[] arr) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        bubbleSort(arr);

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '5\n5 1 4 2 8', expected: '1 2 4 5 8' },
    { input: '1\n42', expected: '42' },
    { input: '6\n10 9 8 7 6 5', expected: '5 6 7 8 9 10' },
    { input: '4\n1 2 3 4', expected: '1 2 3 4' },
    { input: '5\n2 2 1 1 0', expected: '0 1 1 2 2' }
  ]
};