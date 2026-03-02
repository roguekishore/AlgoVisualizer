/**
 * Median of Two Sorted Arrays — Problem Definition
 *
 * Input format (stdin):
 * Line 1: Two integers m and n (sizes of the two arrays).
 * Line 2: m space-separated sorted integers (nums1).
 * Line 3: n space-separated sorted integers (nums2).
 *
 * Output format (stdout):
 * A double representing the median of the two sorted arrays.
 */

module.exports = {
  id: 'median-of-two-sorted-arrays',
  conquestId: 'stage4-32',
  title: 'Median of Two Sorted Arrays',
  difficulty: 'Hard',
  category: 'Arrays',
  tags: ['Array', 'Binary Search', 'Divide and Conquer'],

  description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be $O(\log(m+n))$.

### Task
To achieve the logarithmic time complexity, we cannot simply merge the arrays. Instead, we use **Binary Search** to partition the smaller array:
1. Ensure \`nums1\` is the smaller array to minimize the search range.
2. Partition \`nums1\` at index \`i\` and \`nums2\` at index \`j\` such that the total number of elements on the left equals the total on the right.
3. The condition for a correct partition is:
   - $nums1[i-1] \le nums2[j]$
   - $nums2[j-1] \le nums1[i]$
4. Once partitioned, the median is calculated based on the maximum of the left side and the minimum of the right side.

### Example
**Input:**
\`\`\`
2 1
1 3
2
\`\`\`

**Output:**
\`\`\`
2.0
\`\`\`

**Explanation:**
Merged array =, median is 2.0.`,

  examples: [
    {
      input: '2 1\n1 3\n2',
      output: '2.0',
      explanation: 'Merged array:'
    },
    {
      input: '2 2\n1 2\n3 4',
      output: '2.5',
      explanation: 'Merged array:. Median is (2+3)/2 = 2.5.'
    }
  ],

  constraints: [
    'nums1.length == m',
    'nums2.length == n',
    '0 ≤ m, n ≤ 1000',
    '1 ≤ m + n ≤ 2000',
    '-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

/**
 * Returns the median of two sorted arrays in O(log(m+n)).
 */
double solve(vector<int>& nums1, vector<int>& nums2) {
    // Ensure nums1 is the smaller array
    if (nums1.size() > nums2.size()) return solve(nums2, nums1);
    
    int m = nums1.size();
    int n = nums2.size();
    int left = 0, right = m;
    
    // Your binary search logic here
    
    return 0.0;
}

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<int> nums1(m), nums2(n);
    for (int i = 0; i < m; i++) cin >> nums1[i];
    for (int i = 0; i < n; i++) cin >> nums2[i];
    
    cout << fixed << setprecision(1) << solve(nums1, nums2) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    /**
     * Returns the median of two sorted arrays in O(log(m+n)).
     */
    public static double solve(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return solve(nums2, nums1);
        
        int m = nums1.length;
        int n = nums2.length;
        int left = 0, right = m;
        
        // Your binary search logic here
        
        return 0.0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[] nums1 = new int[m];
        int[] nums2 = new int[n];
        for (int i = 0; i < m; i++) nums1[i] = sc.nextInt();
        for (int i = 0; i < n; i++) nums2[i] = sc.nextInt();
        
        System.out.printf("%.1f\\n", solve(nums1, nums2));
    }
}`
  },

  testCases: [
    { input: '2 1\n1 3\n2', expected: '2.0' },
    { input: '2 2\n1 2\n3 4', expected: '2.5' },
    { input: '0 1\n\n1', expected: '1.0' },
    { input: '2 0\n2 4\n', expected: '3.0' },
    { input: '1 1\n1\n2', expected: '1.5' },
    { input: '4 6\n1 2 3 4\n5 6 7 8 9 10', expected: '5.5' },
    { input: '5 5\n1 2 3 4 5\n6 7 8 9 10', expected: '5.5' },
    { input: '3 2\n1 5 9\n2 3', expected: '3.0' },
    { input: '1 2\n10\n1 2', expected: '2.0' },
    { input: '2 4\n1 10\n2 3 4 5', expected: '3.5' }
  ]
};