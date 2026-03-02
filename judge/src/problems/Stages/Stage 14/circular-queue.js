/**
 * Circular Queue — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer k (capacity of the queue) and q (number of operations).
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - enqueue(val): Add an integer to the rear. Return true if successful, false if full.
 * - dequeue(): Remove the front element. Return true if successful, false if empty.
 * - Front(): Return the front element. If empty, return -1.
 * - Rear(): Return the last element. If empty, return -1.
 * - isEmpty(): Return true or false.
 * - isFull(): Return true or false.
 *
 * Output format (stdout):
 * The boolean result or the value returned by each operation on a new line.
 */

module.exports = {
  id: 'circular-queue',
  conquestId: 'stage5-09',
  title: 'Circular Queue',
  difficulty: 'Medium',
  category: 'Queues',
  tags: ['Queue', 'Design', 'Array', 'Modulo'],

  description: `In a standard array-based queue, once the "rear" pointer reaches the end of the array, we can't add more elements even if there is empty space at the front (left over from dequeues).

A **Circular Queue** solves this by "wrapping around" to the beginning of the array using the **Modulo operator (%)**.

### Key Logic
1.  **Fixed Size**: The queue has a maximum capacity $k$.
2.  **Modulo Arithmetic**: 
    - To move a pointer forward: \`index = (index + 1) % k\`
3.  **Front & Rear**:
    - \`front\`: Index of the first element.
    - \`rear\`: Index of the last element.
4.  **Full vs. Empty**: 
    - A common way to track this is by maintaining a \`size\` variable, or by checking if \`(rear + 1) % k == front\`.

### Task
Implement the \`MyCircularQueue\` class. All operations should be **$O(1)$**.

### Example
**Input:**
\`\`\`
3 6
enqueue 1
enqueue 2
enqueue 3
enqueue 4
Rear
isFull
\`\`\`

**Output:**
\`\`\`
true
true
true
false
3
true
\`\`\`

**Explanation:**
- Enqueue 1, 2, 3: Queue is full.
- Enqueue 4: Returns \`false\` (queue full).
- Rear: Returns 3.
- isFull: Returns \`true\`.`,

  examples: [
    {
      input: '3 3\nenqueue 1\nenqueue 2\nFront',
      output: 'true\ntrue\n1',
      explanation: 'Basic enqueues and checking the front.'
    }
  ],

  constraints: [
    '1 ≤ k ≤ 1000',
    '0 ≤ val ≤ 1000',
    'At most 3000 calls will be made to the operations.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class MyCircularQueue {
    vector<int> queue;
    int head, tail, size, capacity;
public:
    MyCircularQueue(int k) {
        capacity = k;
        queue.resize(k);
        head = 0;
        tail = -1;
        size = 0;
    }
    
    bool enQueue(int value) {
        if (isFull()) return false;
        // Your code: update tail using modulo and increment size
        return true;
    }
    
    bool deQueue() {
        if (isEmpty()) return false;
        // Your code: update head using modulo and decrement size
        return true;
    }
    
    int Front() {
        return isEmpty() ? -1 : queue[head];
    }
    
    int Rear() {
        return isEmpty() ? -1 : queue[tail];
    }
    
    bool isEmpty() {
        return size == 0;
    }
    
    bool isFull() {
        return size == capacity;
    }
};

int main() {
    int k, q;
    cin >> k >> q;
    MyCircularQueue obj(k);
    while(q--) {
        string op; cin >> op;
        if(op == "enqueue") {
            int val; cin >> val; cout << (obj.enQueue(val) ? "true" : "false") << endl;
        } else if(op == "dequeue") {
            cout << (obj.deQueue() ? "true" : "false") << endl;
        } else if(op == "Front") {
            cout << obj.Front() << endl;
        } else if(op == "Rear") {
            cout << obj.Rear() << endl;
        } else if(op == "isEmpty") {
            cout << (obj.isEmpty() ? "true" : "false") << endl;
        } else if(op == "isFull") {
            cout << (obj.isFull() ? "true" : "false") << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyCircularQueue {
    private int[] queue;
    private int head, tail, size, capacity;

    public MyCircularQueue(int k) {
        capacity = k;
        queue = new int[k];
        head = 0;
        tail = -1;
        size = 0;
    }
    
    public boolean enQueue(int value) {
        if (isFull()) return false;
        // Your code
        return true;
    }
    
    public boolean deQueue() {
        if (isEmpty()) return false;
        // Your code
        return true;
    }
    
    public int Front() {
        return isEmpty() ? -1 : queue[head];
    }
    
    public int Rear() {
        return isEmpty() ? -1 : queue[tail];
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public boolean isFull() {
        return size == capacity;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextInt()) return;
        int k = sc.nextInt();
        int q = sc.nextInt();
        MyCircularQueue obj = new MyCircularQueue(k);
        while(q-- > 0) {
            String op = sc.next();
            if(op.equals("enqueue")) System.out.println(obj.enQueue(sc.nextInt()));
            else if(op.equals("dequeue")) System.out.println(obj.deQueue());
            else if(op.equals("Front")) System.out.println(obj.Front());
            else if(op.equals("Rear")) System.out.println(obj.Rear());
            else if(op.equals("isEmpty")) System.out.println(obj.isEmpty());
            else if(op.equals("isFull")) System.out.println(obj.isFull());
        }
    }
}`
  },

  testCases: [
    { input: '3 6\nenqueue 1\nenqueue 2\nenqueue 3\nenqueue 4\nRear\nisFull', expected: 'true\ntrue\ntrue\nfalse\n3\ntrue' },
    { input: '2 4\nenqueue 1\ndequeue\nenqueue 2\nFront', expected: 'true\ntrue\ntrue\n2' },
    { input: '1 3\nenqueue 5\nisFull\ndequeue', expected: 'true\ntrue\ntrue' }
  ]
};