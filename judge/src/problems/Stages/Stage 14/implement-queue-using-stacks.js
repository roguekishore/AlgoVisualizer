/**
 * Implement Queue using Stacks — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - push(val): Push element x to the back of the queue.
 * - pop(): Removes the element from the front of the queue and returns it.
 * - peek(): Returns the element at the front of the queue.
 * - empty(): Returns true if the queue is empty, false otherwise.
 *
 * Output format (stdout):
 * The result of each pop, peek, and empty operation on a new line.
 */

module.exports = {
  id: 'implement-queue-using-stacks',
  conquestId: 'stage5-10',
  title: 'Implement Queue using Stacks',
  difficulty: 'Medium',
  category: 'Queues',
  tags: ['Stack', 'Queue', 'Design'],

  description: `How do you turn a "Last-In, First-Out" (LIFO) structure into a "First-In, First-Out" (FIFO) one? By using two of them! 

This classic interview problem tests your ability to manipulate data flow. You must implement a FIFO queue using only two stacks.

### The Two-Stack Strategy
1.  **inputStack**: Every time you \`push(val)\`, simply push it here.
2.  **outputStack**: This stack is used for \`pop()\` and \`peek()\`.
    - If the **outputStack** is empty, move *everything* from the **inputStack** to the **outputStack**.
    - Moving elements from one stack to another reverses their order—perfect for converting LIFO to FIFO!
    - Once moved, the top of the **outputStack** is the front of the queue.

### Amortized Complexity
While one \`pop()\` might take $O(n)$ time to move elements, most will take $O(1)$. On average, each element is pushed twice and popped twice, leading to an **amortized $O(1)$** time complexity.

### Example
**Input:**
\`\`\`
5
push 1
push 2
peek
pop
empty
\`\`\`

**Output:**
\`\`\`
1
1
false
\`\`\`

**Explanation:**
- push 1: input=
- push 2: input=
- peek: move to output. output=. Returns 1.
- pop: removes 1 from output. output=.
- empty: output has, so false.`,

  examples: [
    {
      input: '4\npush 10\npush 20\npop\npeek',
      output: '10\n20',
      explanation: 'First element in (10) is the first element out.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 1000',
    '1 ≤ val ≤ 100',
    'All calls to pop and peek are valid (queue is not empty).'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

class MyQueue {
    stack<int> input;
    stack<int> output;

    void move() {
        // Move elements from input to output only if output is empty
    }

public:
    void push(int x) {
        // Your code
    }
    
    int pop() {
        // Your code
        return 0;
    }
    
    int peek() {
        // Your code
        return 0;
    }
    
    bool empty() {
        // Your code
        return false;
    }
};

int main() {
    MyQueue q;
    int n;
    cin >> n;
    while (n--) {
        string op;
        cin >> op;
        if (op == "push") {
            int x; cin >> x; q.push(x);
        } else if (op == "pop") {
            cout << q.pop() << endl;
        } else if (op == "peek") {
            cout << q.peek() << endl;
        } else if (op == "empty") {
            cout << (q.empty() ? "true" : "false") << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyQueue {
    private Stack<Integer> input = new Stack<>();
    private Stack<Integer> output = new Stack<>();

    public void push(int x) {
        // Your code
    }

    public int pop() {
        // Your code
        return 0;
    }

    public int peek() {
        // Your code
        return 0;
    }

    public boolean empty() {
        // Your code
        return false;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        MyQueue q = new MyQueue();
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        while (n-- > 0) {
            String op = sc.next();
            if (op.equals("push")) {
                q.push(sc.nextInt());
            } else if (op.equals("pop")) {
                System.out.println(q.pop());
            } else if (op.equals("peek")) {
                System.out.println(q.peek());
            } else if (op.equals("empty")) {
                System.out.println(q.empty());
            }
        }
    }
}`
  },

  testCases: [
    { input: '5\npush 1\npush 2\npeek\npop\nempty', expected: '1\n1\nfalse' },
    { input: '3\npush 5\npop\nempty', expected: '5\ntrue' },
    { input: '6\npush 1\npush 2\npush 3\npop\npop\npop', expected: '1\n2\n3' }
  ]
};