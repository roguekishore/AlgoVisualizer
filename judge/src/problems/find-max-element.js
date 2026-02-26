/**
 * Find Maximum Element — Problem Definition
 *
 * Input format (stdin):
 *   Line 1: n (number of elements)
 *   Line 2: n space-separated integers (the array)
 *
 * Output format (stdout):
 *   A single integer: the maximum element in the array
 */

module.exports = {
  id: "find-max-element",
  title: "Find Maximum Element",
  difficulty: "Easy",
  category: "Arrays",
  tags: ["Array", "Traversal"],

  description: `Given an array of integers \`arr\` of size \`n\`, find and return the **maximum** element in the array.

Traverse through all elements and keep track of the largest value seen so far.`,

  examples: [
    {
      input: "arr = [3, 1, 4, 1, 5, 9, 2, 6]",
      output: "9",
      explanation: "9 is the largest element in the array.",
    },
    {
      input: "arr = [7, 3, 9, 2, 8]",
      output: "9",
      explanation: "9 is the largest element in the array.",
    },
    {
      input: "arr = [1]",
      output: "1",
      explanation: "Only one element, so it is the maximum.",
    },
  ],

  constraints: [
    "1 ≤ n ≤ 10⁵",
    "-10⁹ ≤ arr[i] ≤ 10⁹",
  ],

  boilerplate: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

// Return the maximum element in the array
int findMax(vector<int>& arr) {
    // TODO: write your solution here
    
    return 0;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    cout << findMax(arr) << endl;
    
    return 0;
}
`,

    java: `import java.util.*;

public class Solution {

    // Return the maximum element in the array
    public static int findMax(int[] arr) {
        // TODO: write your solution here
        
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        System.out.println(findMax(arr));
    }
}
`,
  },

  // Sample test cases shown to the user (input/output format for the testcases tab)
  sampleTestCases: [
    {
      input: "8\n3 1 4 1 5 9 2 6",
      output: "9",
    },
    {
      input: "5\n7 3 9 2 8",
      output: "9",
    },
    {
      input: "1\n42",
      output: "42",
    },
  ],

  /**
   * Test cases: input string fed to stdin, expected stdout
   */
  testCases: [
    {
      input: "8\n3 1 4 1 5 9 2 6",
      expected: "9",
    },
    {
      input: "5\n7 3 9 2 8",
      expected: "9",
    },
    {
      input: "1\n42",
      expected: "42",
    },
    {
      input: "6\n-5 -2 -8 -1 -9 -3",
      expected: "-1",
    },
    {
      input: "3\n0 0 0",
      expected: "0",
    },
    {
      input: "5\n1000000000 -1000000000 999999999 500000000 -500000000",
      expected: "1000000000",
    },
    {
      input: "4\n5 5 5 5",
      expected: "5",
    },
    {
      input: "10\n10 20 30 40 50 60 70 80 90 100",
      expected: "100",
    },
  ],
};
