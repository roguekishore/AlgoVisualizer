/**
 * Basic Queue — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - enqueue(val): Add an integer to the rear of the queue.
 * - dequeue(): Remove the front element. If empty, output "Underflow".
 * - peek(): Output the front element. If empty, output "Empty".
 * - isEmpty(): Output "true" or "false".
 *
 * Output format (stdout):
 * The result of each peek, dequeue (on error), and isEmpty operation on a new line.
 */

module.exports = {
  id: 'basic-queue-ops',
  conquestId: 'stage5-08',
  title: 'Basic Queue',
  difficulty: 'Easy',
  category: 'Queues',
  tags: ['Queue', 'Data Structure', 'FIFO'],

  description: `A **Queue** is a linear data structure that follows the **FIFO (First In, First Out)** principle. It is essentially the "fair" version of a Stack. The first element added to the queue will be the first one to be removed.

### Core Concepts
1.  **Enqueue**: Inserting an element at the back (rear).
2.  **Dequeue**: Removing an element from the front.
3.  **Peek/Front**: Looking at the front element without removing it.

### Task
Implement a basic Queue using an array or a list. 

> **Pro Tip:** In a real-world scenario, shifting all elements in an array after a dequeue takes $O(n)$ time. To make it $O(1)$, try using a pointer (index) for the "front" of the queue and only move the pointer forward!

---

### Example
**Input:**
\`\`\`
5
enqueue 1
enqueue 2
peek
dequeue
peek
\`\`\`

**Output:**
\`\`\`
1
2
\`\`\`

**Explanation:**
- Enqueue 1:
- Enqueue 2:
- Peek: Front is 1.
- Dequeue: Removes 1. List is now.
- Peek: Front is 2.`,

  examples: [
    {
      input: '4\nenqueue 100\npeek\ndequeue\nisEmpty',
      output: '100\ntrue',
      explanation: 'After 100 is enqueued and dequeued, the queue is empty.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 1000',
    '-10⁵ ≤ val ≤ 10⁵',
    'Operations are: enqueue, dequeue, peek, isEmpty.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class MyQueue {
    vector<int> data;
    int head = 0; // Pointer to the front
public:
    void enqueue(int val) {
        // Your code here
    }
    
    void dequeue() {
        if (isEmpty()) {
            cout << "Underflow" << endl;
            return;
        }
        // Your code here
    }
    
    void peek() {
        if (isEmpty()) {
            cout << "Empty" << endl;
            return;
        }
        // Your code here
    }
    
    bool isEmpty() {
        return head >= data.size();
    }
};

int main() {
    MyQueue q;
    int n;
    cin >> n;
    while (n--) {
        string op;
        cin >> op;
        if (op == "enqueue") {
            int val; cin >> val; q.enqueue(val);
        } else if (op == "dequeue") {
            q.dequeue();
        } else if (op == "peek") {
            q.peek();
        } else if (op == "isEmpty") {
            cout << (q.isEmpty() ? "true" : "false") << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyQueue {
    private List<Integer> data = new ArrayList<>();
    private int head = 0;

    public void enqueue(int val) {
        // Your code here
    }

    public void dequeue() {
        if (isEmpty()) {
            System.out.println("Underflow");
            return;
        }
        // Your code here
    }

    public void peek() {
        if (isEmpty()) {
            System.out.println("Empty");
            return;
        }
        // Your code here
    }

    public boolean isEmpty() {
        return head >= data.size();
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
            if (op.equals("enqueue")) {
                q.enqueue(sc.nextInt());
            } else if (op.equals("dequeue")) {
                q.dequeue();
            } else if (op.equals("peek")) {
                q.peek();
            } else if (op.equals("isEmpty")) {
                System.out.println(q.isEmpty());
            }
        }
    }
}`
  },

  testCases: [
    { input: '5\nenqueue 1\nenqueue 2\npeek\ndequeue\npeek', expected: '1\n2' },
    { input: '3\ndequeue\npeek\nisEmpty', expected: 'Underflow\nEmpty\ntrue' },
    { input: '4\nenqueue 10\npeek\nisEmpty\ndequeue', expected: '10\nfalse' }
  ]
};