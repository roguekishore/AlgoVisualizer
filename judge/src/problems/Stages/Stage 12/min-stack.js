/**
 * Min Stack — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its argument (if any).
 * * Operations:
 * - push(val): Push an integer onto the stack.
 * - pop(): Remove the element on the top of the stack.
 * - top(): Get the top element.
 * - getMin(): Retrieve the minimum element in the stack.
 *
 * Output format (stdout):
 * The result of each top and getMin operation on a new line.
 */

module.exports = {
  id: 'min-stack',
  conquestId: 'stage5-03',
  title: 'Min Stack',
  difficulty: 'Medium',
  category: 'Stacks',
  tags: ['Stack', 'Design', 'Data Structure'],

  description: `Design a stack that supports push, pop, top, and retrieving the minimum element in **constant time**.

Standard stacks don't track the minimum; to find it, you'd normally have to iterate through all elements ($O(n)$). To achieve $O(1)$, we need to trade a little bit of space for a lot of speed.

### The Two-Stack Strategy
1.  **Main Stack**: Behaves like a normal stack, storing all values.
2.  **Min Stack**: Stores the "minimum so far." 
    - When you push a value, push it onto the Main Stack. 
    - Also, push the *new minimum* onto the Min Stack (the smaller of the current value and the current top of the Min Stack).
    - When you pop, pop from both stacks to keep them synchronized.

### Task
Implement the \`MinStack\` class such that \`push\`, \`pop\`, \`top\`, and \`getMin\` all operate in **$O(1)$** time.

### Example
**Input:**
\`\`\`
6
push -2
push 0
push -3
getMin
pop
top
getMin
\`\`\`

**Output:**
\`\`\`
-3
0
-2
\`\`\`

**Explanation:**
- push -2: Main=[-2], Min=[-2]
- push 0: Main=[-2, 0], Min=[-2, -2]
- push -3: Main=[-2, 0, -3], Min=[-2, -2, -3]
- getMin: returns -3.
- pop: Main=[-2, 0], Min=[-2, -2]
- top: returns 0.
- getMin: returns -2.`,

  examples: [
    {
      input: '5\npush 10\npush 20\ngetMin\npush 5\ngetMin',
      output: '10\n5',
      explanation: 'The minimum is updated when 5 is pushed.'
    }
  ],

  constraints: [
    '1 ≤ q ≤ 10⁴',
    '-2³¹ ≤ val ≤ 2³¹ - 1',
    'Methods pop, top and getMin will always be called on non-empty stacks.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

class MinStack {
    stack<int> s;
    stack<int> minS;
public:
    void push(int val) {
        // Your code here
    }
    
    void pop() {
        // Your code here
    }
    
    int top() {
        // Your code here
        return 0;
    }
    
    int getMin() {
        // Your code here
        return 0;
    }
};

int main() {
    MinStack* obj = new MinStack();
    int q;
    cin >> q;
    while(q--) {
        string op;
        cin >> op;
        if(op == "push") {
            int val; cin >> val; obj->push(val);
        } else if(op == "pop") {
            obj->pop();
        } else if(op == "top") {
            cout << obj->top() << endl;
        } else if(op == "getMin") {
            cout << obj->getMin() << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

class MinStack {
    private Stack<Integer> s = new Stack<>();
    private Stack<Integer> minS = new Stack<>();

    public void push(int val) {
        // Your code here
    }

    public void pop() {
        // Your code here
    }

    public int top() {
        // Your code here
        return 0;
    }

    public int getMin() {
        // Your code here
        return 0;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        MinStack obj = new MinStack();
        if(!sc.hasNextInt()) return;
        int q = sc.nextInt();
        while(q-- > 0) {
            String op = sc.next();
            if(op.equals("push")) obj.push(sc.nextInt());
            else if(op.equals("pop")) obj.pop();
            else if(op.equals("top")) System.out.println(obj.top());
            else if(op.equals("getMin")) System.out.println(obj.getMin());
        }
    }
}`
  },

  testCases: [
    { input: '6\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', expected: '-3\n0\n-2' },
    { input: '4\npush 1\npush 2\ngetMin\ntop', expected: '1\n2' },
    { input: '5\npush 5\npush 5\npop\ngetMin\ntop', expected: '5\n5' }
  ]
};