/**
 * Shell Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'shell-sort',
  conquestId: 'stage6-06',
  title: 'Shell Sort',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Sorting', 'Insertion Sort', 'Optimization'],

  description: `**Shell Sort** is essentially an optimized version of **Insertion Sort**. 

In standard Insertion Sort, we only move elements one position at a time. If the smallest element is at the very end of the array, it takes $n$ steps to move it to the front. Shell Sort allows the exchange of items that are far apart.

### The Logic: "Gap" Sorting
The idea is to arrange the list of elements so that, starting anywhere, taking every $h$-th element yields a sorted list. Such a list is said to be $h$-sorted.
1.  **Choose a Gap Sequence**: Start with a large gap $h$. (Commonly starting with $n/2$).
2.  **Gap-Sort**: Sort all sub-lists of elements separated by distance $h$.
3.  **Reduce Gap**: Shrink the gap (e.g., $h = h/2$) and repeat the process.
4.  **Final Pass**: The final pass is a standard Insertion Sort (gap = 1), but because the array is already "nearly sorted," this last pass is extremely fast.

### Why use it?
- It is much faster than $O(n^2)$ sorts but simpler than $O(n \log n)$ sorts.
- It sorts **in-place** ($O(1)$ extra space).
- Complexity depends on the gap sequence, typically around **$O(n^{1.5})$** or **$O(n \log^2 n)$**.

### Example
**Input**: \`\`
1. Gap = 2: Sort pairs (12, 54, 3) and (34, 2).
2. Gap = 1: Final insertion sort on the nearly sorted result.`,

  examples: [
    {
      input: '5\n12 34 54 2 3',
      output: '2 3 12 34 54',
      explanation: 'The array is sorted by gradually reducing the gap.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 5000',
    '-10⁹ ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

void shellSort(vector<int>& arr) {
    int n = arr.size();
    // Start with a big gap, then reduce the gap
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // Do a gapped insertion sort for this gap size.
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            // Shift earlier gap-sorted elements up until the correct location for arr[i] is found
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                arr[j] = arr[j - gap];
            }
            arr[j] = temp;
        }
    }
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    shellSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j;
                for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                    arr[j] = arr[j - gap];
                }
                arr[j] = temp;
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        shellSort(arr);

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '5\n12 34 54 2 3', expected: '2 3 12 34 54' },
    { input: '4\n10 9 8 7', expected: '7 8 9 10' },
    { input: '6\n3 1 4 1 5 9', expected: '1 1 3 4 5 9' }
  ]
};