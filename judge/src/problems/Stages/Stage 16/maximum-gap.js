/**
 * Maximum Gap — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of elements.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * A single integer representing the maximum gap.
 */

module.exports = {
  id: 'maximum-gap',
  conquestId: 'stage6-12',
  title: 'Maximum Gap',
  difficulty: 'Hard',
  category: 'Sorting',
  tags: ['Bucket Sort', 'Pigeonhole Principle', 'Array'],

  description: `The challenge: Find the maximum difference between two successive elements in an array's sorted form, but you **must** do it in $O(n)$ time and $O(n)$ space.

Standard sorting takes $O(n \log n)$, which is too slow. To achieve linear time, we use a clever application of **Bucket Sort** and the **Pigeonhole Principle**.

### The Logic: Pigeonhole Principle
1.  **Find Range**: Let the minimum value be $min$ and maximum be $max$.
2.  **Calculate Gap**: The smallest possible "maximum gap" occurs if all $n$ numbers are evenly spaced. This average gap is $G = \lceil (max - min) / (n - 1) \rceil$.
3.  **Bucketing**: We create buckets of size $G$. 
4.  **The "Magic" Insight**: Because the bucket size is $G$, the maximum gap **cannot** exist between two numbers in the same bucket. It *must* exist between the maximum of one bucket and the minimum of the next non-empty bucket.
5.  **Implementation**: We only need to store the \`min\` and \`max\` of each bucket. We then iterate through the buckets to find the largest jump from one bucket's top to the next bucket's bottom.

### Complexity
- **Time**: $O(n)$ to find min/max and fill buckets.
- **Space**: $O(n)$ for the buckets.

### Example
**Input**: \`\`
- $min=1, max=9, n=4$.
- $Gap = (9-1)/(4-1) = 2.66 \rightarrow$ Bucket size is $2$.
- Buckets: \`,,,,\`.
- Sorted-ish: \`Bucket 0:, Bucket 1:, Bucket 2:, Bucket 4:\`.
- Gaps between buckets: \`3-1=2\`, \`6-3=3\`, \`9-6=3\`. Max gap is **3**.`,

  examples: [
    {
      input: '4\n3 6 9 1',
      output: '3',
      explanation: 'Sorted form is. Gaps are 2, 3, 3. Max is 3.'
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
#include <cmath>

using namespace std;

int maximumGap(vector<int>& nums) {
    int n = nums.size();
    if (n < 2) return 0;

    int minVal = nums, maxVal = nums;
    for (int x : nums) {
        minVal = min(minVal, x);
        maxVal = max(maxVal, x);
    }

    if (minVal == maxVal) return 0;

    int bucketSize = max(1, (maxVal - minVal) / (n - 1));
    int bucketCount = (maxVal - minVal) / bucketSize + 1;

    vector<int> bMin(bucketCount, INT_MAX);
    vector<int> bMax(bucketCount, INT_MIN);

    for (int x : nums) {
        int idx = (x - minVal) / bucketSize;
        bMin[idx] = min(bMin[idx], x);
        bMax[idx] = max(bMax[idx], x);
    }

    int maxGap = 0;
    int prevMax = minVal;
    for (int i = 0; i < bucketCount; i++) {
        if (bMin[i] == INT_MAX) continue;
        maxGap = max(maxGap, bMin[i] - prevMax);
        prevMax = bMax[i];
    }

    return maxGap;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << maximumGap(arr) << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int maximumGap(int[] nums) {
        if (nums == null || nums.length < 2) return 0;

        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        for (int i : nums) {
            min = Math.min(min, i);
            max = Math.max(max, i);
        }

        if (min == max) return 0;

        int n = nums.length;
        int bucketSize = Math.max(1, (max - min) / (n - 1));
        int bucketCount = (max - min) / bucketSize + 1;

        int[] bMin = new int[bucketCount];
        int[] bMax = new int[bucketCount];
        Arrays.fill(bMin, Integer.MAX_VALUE);
        Arrays.fill(bMax, Integer.MIN_VALUE);

        for (int i : nums) {
            int idx = (i - min) / bucketSize;
            bMin[idx] = Math.min(bMin[idx], i);
            bMax[idx] = Math.max(bMax[idx], i);
        }

        int maxGap = 0;
        int prevMax = min;
        for (int i = 0; i < bucketCount; i++) {
            if (bMin[i] == Integer.MAX_VALUE) continue;
            maxGap = Math.max(maxGap, bMin[i] - prevMax);
            prevMax = bMax[i];
        }

        return maxGap;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(maximumGap(nums));
    }
}`
  },

  testCases: [
    { input: '4\n3 6 9 1', expected: '3' },
    { input: '2\n1 10', expected: '9' },
    { input: '1\n10', expected: '0' }
  ]
};