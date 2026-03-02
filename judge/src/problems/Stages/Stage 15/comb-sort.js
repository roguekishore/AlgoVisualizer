/**
 * Comb Sort — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The sorted array as n space-separated integers.
 */

module.exports = {
  id: 'comb-sort',
  conquestId: 'stage6-07',
  title: 'Comb Sort',
  difficulty: 'Medium',
  category: 'Sorting',
  tags: ['Sorting', 'Bubble Sort', 'Optimization'],

  description: `If **Shell Sort** is the "supercharged" version of Insertion Sort, **Comb Sort** is the supercharged version of **Bubble Sort**.

Standard Bubble Sort only compares adjacent elements (gap = 1). This means small values at the end of the array (called "turtles") move to the beginning very slowly, killing performance.

### The Logic: Eliminating Turtles
Comb Sort improves Bubble Sort by using a gap larger than 1. By swapping elements far apart, "turtles" are moved to the front much faster.

1.  **Shrink Factor**: The gap starts at $n$ and is divided by a "shrink factor" (historically $1.3$) in every pass.
2.  **Passes**: In each pass, we iterate through the array and swap \`arr[i]\` and \`arr[i + gap]\` if they are out of order.
3.  **Final Pass**: The process continues until the gap becomes 1. At that point, it behaves like a standard Bubble Sort to finish the job.

### Why use it?
- It is significantly faster than Bubble Sort ($O(n^2)$), often approaching **$O(n \log n)$** for many datasets.
- Like Bubble Sort, it is extremely easy to implement and uses **$O(1)$** extra space.
- It is not stable, unlike the original Bubble Sort.

---

### Example
**Input:** \`[8, 4, 1, 56, 3, -44, 23, -6, 28, 0]\`
1. Initial Gap: $10 / 1.3 \approx 7$.
2. Compare and swap \`arr\` with \`arr\`, \`arr\` with \`arr\`, etc.
3. Reduce gap and repeat.`,

  examples: [
    {
      input: '5\n5 1 4 2 8',
      output: '1 2 4 5 8',
      explanation: 'The gap starts large and shrinks to 1, sorting the array efficiently.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 5000',
    '-10⁹ ≤ arr[i] ≤ 10⁹'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void combSort(vector<int>& arr) {
    int n = arr.size();
    int gap = n;
    float shrink = 1.3;
    bool swapped = true;

    while (gap != 1 || swapped) {
        // Update the gap
        gap = (int)(gap / shrink);
        if (gap < 1) gap = 1;

        swapped = false;

        // Compare elements with current gap
        for (int i = 0; i < n - gap; i++) {
            if (arr[i] > arr[i + gap]) {
                swap(arr[i], arr[i + gap]);
                swapped = true;
            }
        }
    }
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    combSort(arr);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void combSort(int[] arr) {
        int n = arr.length;
        int gap = n;
        double shrink = 1.3;
        boolean swapped = true;

        while (gap != 1 || swapped) {
            gap = (int)(gap / shrink);
            if (gap < 1) gap = 1;

            swapped = false;

            for (int i = 0; i < n - gap; i++) {
                if (arr[i] > arr[i + gap]) {
                    int temp = arr[i];
                    arr[i] = arr[i + gap];
                    arr[i + gap] = temp;
                    swapped = true;
                }
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        combSort(arr);

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`
  },

  testCases: [
    { input: '10\n8 4 1 56 3 -44 23 -6 28 0', expected: '-44 -6 0 1 3 4 8 23 28 56' },
    { input: '4\n4 3 2 1', expected: '1 2 3 4' },
    { input: '2\n100 -100', expected: '-100 100' }
  ]
};