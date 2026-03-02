/**
 * Task Scheduler — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n (number of tasks) and k (the cooling time).
 * Line 2: n space-separated characters representing the task types (A-Z).
 *
 * Output format (stdout):
 * A single integer representing the minimum number of units of time 
 * to complete all given tasks.
 */

module.exports = {
  id: 'task-scheduler',
  conquestId: 'stage6-11',
  title: 'Task Scheduler',
  difficulty: 'Medium',
  category: 'Heaps / Greedy',
  tags: ['Heap', 'Priority Queue', 'Greedy', 'Hash Map'],

  description: `You are given a list of tasks represented by characters and a non-negative integer \`k\`. Each task takes one unit of time to complete. For each unit of time, the CPU can either complete one task or stay idle.

However, there is a **cooling period** \`k\`: the same task type cannot be executed again until \`k\` units of time have passed.

### The Greedy + Heap Strategy
To minimize the total time, we should always prioritize the task that has the **highest remaining frequency**.

1.  **Count**: Store the frequency of each task in a Hash Map (or a 26-size array).
2.  **Max-Heap**: Push all frequencies into a Max-Heap.
3.  **Process in Cycles**:
    - Each cycle has a length of \`k + 1\` (the time it takes to run a task and wait for its cooldown).
    - In each cycle, try to pull the most frequent tasks from the Heap.
    - Store the tasks you've used in a temporary list.
    - After the cycle, if those tasks still have remaining instances, push them back into the Heap.
4.  **Count Time**: Add the number of tasks processed in the cycle to your total time. If the Heap is empty after a cycle, you only count the tasks; if it's not empty, you count the full \`k + 1\` units (because of the idle time).

### Alternative: The Math Approach
The minimum time is often determined by the most frequent task. 
If 'A' appears \`f_max\` times:
- We have \`f_max - 1\` groups of intervals.
- Each group has size \`k + 1\`.
- The final tasks are added at the end.
Formula: $Total = (f_{max} - 1) \times (k + 1) + (\text{number of tasks with frequency } f_{max})$
The answer is $\max(\text{Total}, \text{tasks.length})$.

### Example
**Input:** \`tasks = ["A","A","A","B","B","B"], k = 2\`
**Output:** \`8\`
**Explanation:** A -> B -> idle -> A -> B -> idle -> A -> B`,

  examples: [
    {
      input: '6 2\nA A A B B B',
      output: '8',
      explanation: 'Optimal: A -> B -> idle -> A -> B -> idle -> A -> B.'
    },
    {
      input: '6 0\nA A A B B B',
      output: '6',
      explanation: 'With k=0, no cooling is needed. Total time is just the number of tasks.'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 10⁴',
    '0 ≤ k ≤ 100',
    'Tasks are uppercase English letters A-Z.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>

using namespace std;

int leastInterval(vector<char>& tasks, int k) {
    unordered_map<char, int> counts;
    for (char c : tasks) counts[c]++;
    
    priority_queue<int> pq;
    for (auto const& [task, freq] : counts) pq.push(freq);
    
    int totalTime = 0;
    // Your Greedy/Heap logic here
    
    return totalTime;
}

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<char> tasks(n);
    for (int i = 0; i < n; i++) cin >> tasks[i];
    
    cout << leastInterval(tasks, k) << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int leastInterval(char[] tasks, int k) {
        int[] freq = new int;
        for (char t : tasks) freq[t - 'A']++;
        
        Arrays.sort(freq);
        int maxFreq = freq;
        int idleTime = (maxFreq - 1) * k;
        
        for (int i = 24; i >= 0 && freq[i] > 0; i--) {
            idleTime -= Math.min(maxFreq - 1, freq[i]);
        }
        
        return idleTime > 0 ? idleTime + tasks.length : tasks.length;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        char[] tasks = new char[n];
        for (int i = 0; i < n; i++) tasks[i] = sc.next().charAt(0);
        
        System.out.println(leastInterval(tasks, k));
    }
}`
  },

  testCases: [
    { input: '6 2\nA A A B B B', expected: '8' },
    { input: '6 0\nA A A B B B', expected: '6' },
    { input: '12 2\nA A A A A A B C D E F G', expected: '16' }
  ]
};