/**
 * Stack Operations: Push, Pop, Peek — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - push(val): Push an integer onto the stack. No output.
 * - pop(): Remove the top element. If empty, output "Underflow".
 * - peek(): Output the top element. If empty, output "Empty".
 * - isEmpty(): Output "true" or "false".
 *
 * Output format (stdout):
 * The result of each peek, pop (on error), and isEmpty operation on a new line.
 */

module.exports = {
  id: 'stack-operations-push-pop-peek',
  conquestId: 'stage5-01',
  title: 'Stack Operations: Push, Pop, Peek',
  difficulty: 'Easy',
  category: 'Stacks',
  tags: ['Stack', 'Data Structure', 'LIFO'],

  description: `A **Stack** is a linear data structure that follows the **LIFO (Last In, First Out)** principle. Think of a stack of plates: the last one you put on top is the first one you take off.

In this challenge, you will implement a stack from scratch using an array (or list).

### Core Operations
1.  **Push**: Add an element to the top. $O(1)$
2.  **Pop**: Remove the element from the top. $O(1)$
3.  **Peek (or Top)**: View the element at the top without removing it. $O(1)$
4.  **isEmpty**: Check if the stack has any elements. $O(1)$

### Task
Implement a stack class that handles these operations correctly, including edge cases like popping from an empty stack.

### Example
**Input:**
\`\`\`
6
push 10
push 20
peek
pop
peek
isEmpty
\`\`\`

**Output:**
\`\`\`
20
10
false
\`\`\`

**Explanation:**
- Push 10: Stack =
- Push 20: Stack =
- Peek: Top is 20.
- Pop: Removes 20. Stack =
- Peek: Top is 10.
- isEmpty: Stack has 10, so false.`,

  examples: [
    {
      input: '5\npush 5\npeek\npop\npeek\nisEmpty',
      output: '5\nEmpty\ntrue',
      explanation: 'After popping the only element, the stack is empty.'
    },
    {
      input: '2\npop\npeek',
      output: 'Underflow\nEmpty',
      explanation: 'Handling operations on an empty stack.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 1000',
    '-10⁵ ≤ val ≤ 10⁵',
    'All operations are valid strings: push, pop, peek, isEmpty.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class MyStack {
    vector<int> data;
public:
    void push(int val) {
        // Your code here
    }
    
    void pop() {
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
        return data.empty();
    }
};

int main() {
    MyStack st;
    int q;
    cin >> q;
    while (q--) {
        string op;
        cin >> op;
        if (op == "push") {
            int val; cin >> val; st.push(val);
        } else if (op == "pop") {
            st.pop();
        } else if (op == "peek") {
            st.peek();
        } else if (op == "isEmpty") {
            cout << (st.isEmpty() ? "true" : "false") << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyStack {
    private List<Integer> data = new ArrayList<>();

    public void push(int val) {
        // Your code here
    }

    public void pop() {
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
        return data.isEmpty();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        MyStack st = new MyStack();
        if (!sc.hasNextInt()) return;
        int q = sc.nextInt();
        while (q-- > 0) {
            String op = sc.next();
            if (op.equals("push")) {
                st.push(sc.nextInt());
            } else if (op.equals("pop")) {
                st.pop();
            } else if (op.equals("peek")) {
                st.peek();
            } else if (op.equals("isEmpty")) {
                System.out.println(st.isEmpty());
            }
        }
    }
}`
  },

  testCases: [
    { input: '6\npush 10\npush 20\npeek\npop\npeek\nisEmpty', expected: '20\n10\nfalse' },
    { input: '3\npop\npeek\nisEmpty', expected: 'Underflow\nEmpty\ntrue' },
    { input: '4\npush 1\npush 2\npush 3\npeek', expected: '3' },
    { input: '5\npush 100\npop\npop\npeek\nisEmpty', expected: 'Underflow\nEmpty\ntrue' }
  ]
};