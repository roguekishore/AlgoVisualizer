/**
 * Top K Frequent Elements — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n (number of elements) and k (the number of top frequent elements to find).
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * k space-separated integers (the most frequent elements), in any order.
 */

module.exports = {
  id: 'top-k-frequent',
  conquestId: 'stage6-10',
  title: 'Top K Frequent Elements',
  difficulty: 'Medium',
  category: 'Heaps / Hashing',
  tags: ['Heap', 'Priority Queue', 'Hash Map', 'Bucket Sort'],

  description: `You are given an integer array \`nums\` and an integer \`k\`. Your task is to return the \`k\` most frequent elements.

This problem is a classic bridge between **Hashing** (to count occurrences) and **Selection** (to find the top performers). 

### The Strategy: Min-Heap
While you could sort the entire frequency map ($O(N \log N)$), a more efficient way for large datasets is to use a **Min-Heap of size $k$**:
1.  **Count**: Create a Hash Map to store the frequency of each number.
2.  **Maintain Top K**: Iterate through the map and add pairs of \`(frequency, element)\` to a Min-Heap.
3.  **Evict**: If the heap size exceeds $k$, pop the smallest element (the one with the lowest frequency).
4.  **Result**: After processing all unique elements, the heap will contain exactly the $k$ most frequent items.

### Complexity
- **Time**: $O(N \log k)$, where $N$ is the number of elements. This is significantly faster than $O(N \log N)$ when $k$ is small.
- **Space**: $O(N)$ to store the frequency map.

> **Pro Tip**: If you want to achieve pure **$O(N)$** linear time, you can use **Bucket Sort**! Instead of a heap, create an array of lists where the index represents the frequency.`,

  examples: [
    {
      input: '6 2\n1 1 1 2 2 3',
      output: '1 2',
      explanation: '1 appears 3 times, 2 appears 2 times. These are the top 2.'
    },
    {
      input: '1 1\n1',
      output: '1',
      explanation: 'The only element is naturally the most frequent.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁵',
    'k is in range [1, unique elements]',
    'Answer is guaranteed to be unique'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>

using namespace std;

vector<int> topKFrequent(vector<int>& nums, int k) {
    // 1. Count frequencies
    unordered_map<int, int> counts;
    for (int n : nums) counts[n]++;

    // 2. Use a min-heap to keep track of top k elements
    // pair<frequency, value>
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    for (auto const& [val, freq] : counts) {
        pq.push({freq, val});
        if (pq.size() > k) pq.pop();
    }

    // 3. Extract from heap
    vector<int> result;
    while (!pq.empty()) {
        result.push_back(pq.top().second);
        pq.pop();
    }
    return result;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    vector<int> res = topKFrequent(nums, k);
    for (int i = 0; i < k; i++) {
        cout << res[i] << (i == k - 1 ? "" : " ");
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);

        // Min-heap based on frequency
        PriorityQueue<Integer> heap = new PriorityQueue<>((n1, n2) -> count.get(n1) - count.get(n2));

        for (int n : count.keySet()) {
            heap.add(n);
            if (heap.size() > k) heap.poll();
        }

        int[] top = new int[k];
        for(int i = k - 1; i >= 0; --i) {
            top[i] = heap.poll();
        }
        return top;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        int[] result = topKFrequent(nums, k);
        for (int i = 0; i < k; i++) {
            System.out.print(result[i] + (i == k - 1 ? "" : " "));
        }
    }
}`
  },

  testCases: [
    { input: '6 2\n1 1 1 2 2 3', expected: '1 2' },
    { input: '1 1\n7', expected: '7' },
    { input: '10 3\n1 2 1 2 1 2 3 3 4 5', expected: '1 2 3' }
  ]
};