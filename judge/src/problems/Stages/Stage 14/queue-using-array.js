/**
 * Queue Implementation using Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - enqueue(val): Add an integer to the end of the queue.
 * - dequeue(): Remove and return the front element. If empty, return -1.
 * - front(): Return the front element without removing it. If empty, return -1.
 * - size(): Return the current number of elements in the queue.
 *
 * Output format (stdout):
 * The result of each dequeue, front, and size operation on a new line.
 */

module.exports = {
  id: 'queue-using-array',
  conquestId: 'stage5-08',
  title: 'Queue Implementation (Array)',
  difficulty: 'Easy',
  category: 'Queues',
  tags: ['Queue', 'Data Structure', 'FIFO', 'Array'],

  description: `A **Queue** is a linear data structure that follows the **FIFO (First In, First Out)** principle. Think of a line at a grocery store: the first person to join the line is the first one to be served.

While a Stack is about the "Last," a Queue is all about the "First."

### Core Operations
1.  **Enqueue**: Add an element to the "rear" (end) of the queue. $O(1)$
2.  **Dequeue**: Remove the element from the "front" (start) of the queue. $O(1)$ 
    *Note: In a simple array, shifting elements after a dequeue is $O(n)$. A professional implementation uses a "head" pointer to keep it $O(1)$.*
3.  **Front**: View the first element without removing it. $O(1)$
4.  **Size**: Return the number of elements currently waiting. $O(1)$

### Task
Implement a Queue class. To ensure $O(1)$ dequeues, maintain a \`front\` index pointer rather than shifting the entire array every time.

### Example
**Input:**
\`\`\`
6
enqueue 10
enqueue 20
front
dequeue
front
size
\`\`\`

**Output:**
\`\`\`
10
10
20
1
\`\`\`

**Explanation:**
- Enqueue 10: Queue =
- Enqueue 20: Queue =
- Front: 10 is at the start.
- Dequeue: 10 is removed (returns 10). Queue =
- Front: 20 is now at the start.
- Size: 1 element remains.`,

  examples: [
    {
      input: '4\nenqueue 5\ndequeue\nfront\nsize',
      output: '5\n-1\n0',
      explanation: 'After dequeuing the only element, front returns -1.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 5000',
    '-10⁹ ≤ val ≤ 10⁹',
    'Operations: enqueue, dequeue, front, size.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class MyQueue {
private:
    vector<int> data;
    int head = 0; // Pointer to the front element
public:
    void enqueue(int x) {
        // Your code here
    }

    int dequeue() {
        if (size() == 0) return -1;
        // Your code here (return element and move head)
        return -1;
    }

    int front() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    int size() {
        // Size is the distance between the end of the vector and the head
        return data.size() - head;
    }
};

int main() {
    MyQueue q;
    int queries;
    cin >> queries;
    while (queries--) {
        string op;
        cin >> op;
        if (op == "enqueue") {
            int x; cin >> x; q.enqueue(x);
        } else if (op == "dequeue") {
            cout << q.dequeue() << endl;
        } else if (op == "front") {
            cout << q.front() << endl;
        } else if (op == "size") {
            cout << q.size() << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyQueue {
    private List<Integer> data = new ArrayList<>();
    private int head = 0;

    public void enqueue(int x) {
        // Your code here
    }

    public int dequeue() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    public int front() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    public int size() {
        return data.size() - head;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        MyQueue q = new MyQueue();
        if (!sc.hasNextInt()) return;
        int queries = sc.nextInt();
        while (queries-- > 0) {
            String op = sc.next();
            if (op.equals("enqueue")) {
                q.enqueue(sc.nextInt());
            } else if (op.equals("dequeue")) {
                System.out.println(q.dequeue());
            } else if (op.equals("front")) {
                System.out.println(q.front());
            } else if (op.equals("size")) {
                System.out.println(q.size());
            }
        }
    }
}`
  },

  testCases: [
    { input: '6\nenqueue 10\nenqueue 20\nfront\ndequeue\nfront\nsize', expected: '10\n10\n20\n1' },
    { input: '3\ndequeue\nfront\nsize', expected: '-1\n-1\n0' },
    { input: '5\nenqueue 1\nenqueue 2\nenqueue 3\ndequeue\ndequeue', expected: '1\n2' },
    { input: '4\nenqueue 100\nsize\ndequeue\nsize', expected: '1\n100\n0' }
  ]
};