/**
 * Minimum Speed to Arrive on Time — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of train segments.
 * Line 2: n space-separated integers representing the distance of each segment.
 * Line 3: A double representing the total hour limit.
 *
 * Output format (stdout):
 * A single integer representing the minimum positive integer speed (km/h) 
 * needed to reach the office on time. If it's impossible, return -1.
 */

module.exports = {
  id: 'min-speed-to-arrive-on-time',
  conquestId: 'stage4-31',
  title: 'Minimum Speed to Arrive on Time',
  difficulty: 'Medium',
  category: 'Binary Search',
  tags: ['Array', 'Binary Search', 'Binary Search on Answer'],

  description: `You are given a floating-point number \`hour\`, representing the amount of time you have to reach the office. To get to the office, you must take \`n\` trains in sequential order. Each train travels a specific distance given in the integer array \`dist\`.

Each train can only depart at an **integer hour**, so you may need to wait at the station.
- For example, if the first train takes 1.5 hours, you must wait an additional 0.5 hours before the second train can depart at the 2-hour mark.
- The **last train** does not require you to wait for an integer hour; you arrive exactly when the journey ends.

Return the **minimum positive integer speed** (km/h) that all trains must travel at for you to reach the office on time, or \`-1\` if it is impossible.

### Task
This is a "Binary Search on Answer" problem.
1. The possible range for speed is \`1\` to \`10^7\`.
2. For a chosen speed \`v\`, calculate the total time:
   - For all trains except the last: $time = \lceil dist[i] / v \rceil$
   - For the last train: $time = dist[i] / v$ (no rounding)
3. If the total time $\le hour$, try a slower speed (\`right = mid\`).
4. If the total time $> hour$, you need a faster speed (\`left = mid + 1\`).

### Example
**Input:**
\`\`\`
3
1 3 2
6.0
\`\`\`

**Output:**
\`\`\`
1
\`\`\`

**Explanation:**
At speed 1:
- Train 1: 1/1 = 1 hour.
- Train 2: 3/1 = 3 hours.
- Train 3: 2/1 = 2 hours.
Total = 1 + 3 + 2 = 6.0 hours. You arrive exactly on time.`,

  examples: [
    {
      input: '3\n1 3 2\n6.0',
      output: '1',
      explanation: 'Speed 1 is sufficient.'
    },
    {
      input: '3\n1 3 2\n2.7',
      output: '3',
      explanation: 'Speed 3: ceil(1/3) + ceil(3/3) + (2/3) = 1 + 1 + 0.67 = 2.67 <= 2.7.'
    },
    {
      input: '3\n1 3 2\n1.9',
      output: '-1',
      explanation: 'Even with infinite speed, you need at least 2 trains to start (1+1 hours), which is > 1.9.'
    }
  ],

  constraints: [
    'n == dist.length',
    '1 ≤ n ≤ 10⁵',
    '1 ≤ dist[i] ≤ 10⁵',
    '1 ≤ hour ≤ 10⁹',
    'There will be at most two digits after the decimal point in hour.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

using namespace std;

/**
 * Calculates if it is possible to arrive on time with a given speed.
 */
bool canReach(const vector<int>& dist, double hour, int speed) {
    double total = 0;
    // Your logic here
    return false;
}

int solve(int n, vector<int>& dist, double hour) {
    if (hour <= n - 1) return -1;
    int left = 1, right = 1e7;
    int ans = -1;
    
    // Binary Search on Answer
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (canReach(dist, hour, mid)) {
            ans = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return ans;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> dist(n);
    for (int i = 0; i < n; i++) cin >> dist[i];
    double hour;
    cin >> hour;
    
    cout << solve(n, dist, hour) << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static boolean canReach(int[] dist, double hour, int speed) {
        double total = 0;
        // Your logic here
        return false;
    }

    public static int solve(int n, int[] dist, double hour) {
        if (hour <= n - 1) return -1;
        int left = 1, right = 10000000;
        int ans = -1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (canReach(dist, hour, mid)) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] dist = new int[n];
        for (int i = 0; i < n; i++) dist[i] = sc.nextInt();
        double hour = sc.nextDouble();
        
        System.out.println(solve(n, dist, hour));
    }
}`
  },

  testCases: [
    { input: '3\n1 3 2\n6.0', expected: '1' },
    { input: '3\n1 3 2\n2.7', expected: '3' },
    { input: '3\n1 3 2\n1.9', expected: '-1' },
    { input: '1\n5\n0.1', expected: '50' },
    { input: '2\n10 10\n2.0', expected: '10' },
    { input: '2\n10 10\n1.5', expected: '20' },
    { input: '4\n1 1 1 1\n3.5', expected: '2' },
    { input: '3\n100 100 100\n2.01', expected: '10000' }
  ]
};