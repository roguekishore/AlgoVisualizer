/**
 * Pancake Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'pancake-sort',
  conquestId: 'stage6-08',
  title: 'Pancake Sort',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Sorting', 'Array', 'Greedy'],

  description: `Unlike other sorting algorithms that swap individual elements, **Pancake Sort** has one very specific restriction: the only allowed operation is a **"flip"**.

Imagine a stack of pancakes of different sizes. To sort them, you can insert a spatula anywhere in the stack and flip all the pancakes above it.

### The Goal
Sort the array in non-decreasing order using the minimum number of flips (though in this task, any sequence that results in a sorted array is acceptable).

### The Greedy Strategy
1.  Find the index of the **largest** unsorted element.
2.  **Flip 1**: Flip the sub-array from the start to that index. This brings the largest element to the **front** (index 0).
3.  **Flip 2**: Flip the entire unsorted sub-array. This moves the largest element to its **correct final position** at the back.
4.  Repeat the process for the remaining $n-1$ elements.

### Why use it?
- It's a classic logic puzzle that teaches you how to work within strict operational constraints.
- It’s surprisingly similar to how genomic researchers study "reversals" in DNA sequences!

---

### Example
**Input:** \`\`
1. Max is 4 at index 2. Flip indices 0-2: \`\`.
2. Flip indices 0-3: \`\`. (4 is now at the back).
3. Max is 3 at index 1. Flip indices 0-1: \`\`.
4. Flip indices 0-2: \`\`. (3 is now in place).
5. Max is 2 at index 0. Flip indices 0-1: \`\`. (Sorted!)`,

  examples: [
    {
      input: '4\n3 2 4 1',
      output: '1 2 3 4',
      explanation: 'The array is sorted by repeatedly flipping the largest element to the back.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 500',
    '1 ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Reverses the array from 0 to k
void flip(vector<int>& arr, int k) {
    int start = 0;
    while (start < k) {
        swap(arr[start], arr[k]);
        start++;
        k--;
    }
}

void pancakeSort(vector<int>& arr) {
    int n = arr.size();
    for (int curr_size = n; curr_size > 1; curr_size--) {
        // Find the index of the maximum element in arr[0...curr_size-1]
        int max_idx = 0;
        for (int i = 1; i < curr_size; i++) {
            if (arr[i] > arr[max_idx]) max_idx = i;
        }

        // Move the maximum element to the end if it's not already there
        if (max_idx != curr_size - 1) {
            // To move at the end, first move it to the beginning
            if (max_idx != 0) flip(arr, max_idx);
            
            // Now move it to the end by reversing the whole sub-array
            flip(arr, curr_size - 1);
        }
    }
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    pancakeSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    static void flip(int[] arr, int k) {
        int start = 0;
        while (start < k) {
            int temp = arr[start];
            arr[start] = arr[k];
            arr[k] = temp;
            start++;
            k--;
        }
    }

    public static void pancakeSort(int[] arr) {
        int n = arr.length;
        for (int curr_size = n; curr_size > 1; curr_size--) {
            int max_idx = 0;
            for (int i = 1; i < curr_size; i++) {
                if (arr[i] > arr[max_idx]) max_idx = i;
            }

            if (max_idx != curr_size - 1) {
                if (max_idx != 0) flip(arr, max_idx);
                flip(arr, curr_size - 1);
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        pancakeSort(arr);

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '4\n3 2 4 1', expected: '1 2 3 4' },
    { input: '5\n1 2 3 4 5', expected: '1 2 3 4 5' },
    { input: '6\n10 5 8 2 9 1', expected: '1 2 5 8 9 10' }
  ]
};