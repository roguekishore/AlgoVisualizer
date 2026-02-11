/**
 * Two Sum — Problem Definition
 *
 * Input format (stdin):
 *   Line 1: n (number of elements)
 *   Line 2: n space-separated integers (the array)
 *   Line 3: target integer
 *
 * Output format (stdout):
 *   Two space-separated integers: indices i j (0-indexed, i < j)
 */

module.exports = {
  id: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  category: "Arrays",
  tags: ["Array", "Hash Table"],

  description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Return the answer with the smaller index first.`,

  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "0 1",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "1 2",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "0 1",
      explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
    },
  ],

  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],

  /**
   * Boilerplate code for each language.
   * The user fills in the solve logic; the I/O wrapper is provided.
   */
  boilerplate: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

// Return the two indices (0-indexed) whose values add up to target
pair<int,int> twoSum(vector<int>& nums, int target) {
    // TODO: write your solution here
    
    return {-1, -1};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    auto [i, j] = twoSum(nums, target);
    cout << i << " " << j << endl;
    
    return 0;
}
`,

    java: `import java.util.*;

public class Solution {

    // Return the two indices (0-indexed) whose values add up to target
    public static int[] twoSum(int[] nums, int target) {
        // TODO: write your solution here
        
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}
`,
  },

  /**
   * Test cases: input string fed to stdin, expected stdout
   */
  testCases: [
    {
      input: "4\n2 7 11 15\n9",
      expected: "0 1",
    },
    {
      input: "3\n3 2 4\n6",
      expected: "1 2",
    },
    {
      input: "2\n3 3\n6",
      expected: "0 1",
    },
    {
      input: "5\n1 5 3 7 2\n8",
      expected: "1 2",
    },
    {
      input: "4\n-1 -2 -3 -4\n-6",
      expected: "1 3",
    },
    {
      input: "6\n0 4 3 0 1 2\n0",
      expected: "0 3",
    },
    {
      input: "3\n1000000000 -1000000000 2\n2",
      expected: "0 1",  // 1000000000 + (-1000000000) is not 2, let's fix
    },
    {
      input: "4\n1 2 3 4\n7",
      expected: "2 3",
    },
  ],
};

// Fix test case 7: 1000000000 + (-1000000000) = 0, not 2
// We want a case that tests large numbers
module.exports.testCases[6] = {
  input: "3\n1000000000 500000000 -500000000\n0",
  expected: "1 2",
};
