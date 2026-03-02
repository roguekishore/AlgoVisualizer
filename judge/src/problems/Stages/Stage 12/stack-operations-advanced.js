/**
 * Stack Operations: Advanced Features — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - push(val): Push an integer onto the stack.
 * - pop(): Remove and return the top element. If empty, return -1.
 * - top(): Return the top element without removing it. If empty, return -1.
 * - size(): Return the current number of elements in the stack.
 * - clear(): Remove all elements from the stack.
 *
 * Output format (stdout):
 * The result of each top, pop, and size operation on a new line.
 */

module.exports = {
  id: 'stack-operations-advanced',
  conquestId: 'stage5-01',
  title: 'Stack Operations',
  difficulty: 'Easy',
  category: 'Stacks',
  tags: ['Stack', 'Data Structure', 'LIFO', 'Array'],

  description: `A **Stack** is a linear data structure that follows the **LIFO (Last In, First Out)** principle. Imagine a stack of cafeteria trays: the last tray placed on the pile is the first one someone picks up.

In this challenge, you will implement a robust stack from scratch. This is the foundation for understanding recursion, expression parsing, and backtracking.

### Core Principles
1.  **LIFO**: The element added most recently is the first to be removed.
2.  **Access**: You can only see or remove the "Top" element. Accessing the bottom requires popping everything above it.

### Task
Implement a stack that supports the following operations efficiently:
- **push(x)**: $O(1)$
- **pop()**: $O(1)$
- **top()**: $O(1)$
- **size()**: $O(1)$
- **clear()**: $O(n)$ or $O(1)$ depending on implementation.

### Example
**Input:**
\`\`\`
7
push 5
push 10
size
top
pop
top
clear
\`\`\`

**Output:**
\`\`\`
2
10
10
5
\`\`\`

**Explanation:**
- push 5:
- push 10:
- size: 2 elements.
- top: 10 is at the top.
- pop: 10 is removed, output 10.
- top: 5 is now at the top.
- clear: stack becomes [].`,

  examples: [
    {
      input: '5\npush 42\ntop\npop\ntop\nsize',
      output: '42\n42\n-1\n0',
      explanation: 'Returning -1 when the stack is empty.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 5000',
    '-10⁹ ≤ val ≤ 10⁹',
    'Operations: push, pop, top, size, clear.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class MyStack {
private:
    vector<int> data;
public:
    void push(int x) {
        // Your code here
    }

    int pop() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    int top() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    int size() {
        return data.size();
    }

    void clear() {
        // Your code here
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
            int x; cin >> x; st.push(x);
        } else if (op == "pop") {
            cout << st.pop() << endl;
        } else if (op == "top") {
            cout << st.top() << endl;
        } else if (op == "size") {
            cout << st.size() << endl;
        } else if (op == "clear") {
            st.clear();
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MyStack {
    private List<Integer> stack = new ArrayList<>();

    public void push(int x) {
        // Your code here
    }

    public int pop() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    public int top() {
        if (size() == 0) return -1;
        // Your code here
        return -1;
    }

    public int size() {
        return stack.size();
    }

    public void clear() {
        // Your code here
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
            switch (op) {
                case "push": st.push(sc.nextInt()); break;
                case "pop": System.out.println(st.pop()); break;
                case "top": System.out.println(st.top()); break;
                case "size": System.out.println(st.size()); break;
                case "clear": st.clear(); break;
            }
        }
    }
}`
  },

  testCases: [
    { input: '7\npush 5\npush 10\nsize\ntop\npop\ntop\nclear', expected: '2\n10\n10\n5' },
    { input: '4\npop\ntop\nsize\nclear', expected: '-1\n-1\n0' },
    { input: '5\npush 1\npush 2\npush 3\npop\npop', expected: '3\n2' },
    { input: '6\npush 100\nsize\nclear\nsize\ntop\npop', expected: '1\n0\n-1\n-1' }
  ]
};