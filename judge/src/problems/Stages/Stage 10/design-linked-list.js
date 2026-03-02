/**
 * Design Linked List — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer q, the number of operations.
 * Next q lines: The operation name followed by its arguments.
 * * Operations:
 * - addAtHead(val): Add a node of value val before the first element.
 * - addAtTail(val): Append a node of value val as the last element.
 * - addAtIndex(index, val): Add a node of value val before the index-th node.
 * - deleteAtIndex(index): Delete the index-th node if the index is valid.
 * - get(index): Get the value of the index-th node. If invalid, return -1.
 */

module.exports = {
  id: 'design-linked-list',
  conquestId: 'stage4-42',
  title: 'Design Linked List',
  difficulty: 'Medium',
  category: 'Linked Lists',
  tags: ['Linked List', 'Design', 'Data Structure'],

  description: `Design your implementation of a singly linked list. This challenge combines everything you've learned about nodes, pointers, and traversal into a single class design.

### Requirements
Implement the \`MyLinkedList\` class:
1. **get(index)**: Get the value of the \`index\`-th node. If the index is invalid, return \`-1\`.
2. **addAtHead(val)**: Add a node of value \`val\` before the first element. After insertion, the new node will be the first node.
3. **addAtTail(val)**: Append a node of value \`val\` as the last element.
4. **addAtIndex(index, val)**: Add a node of value \`val\` before the \`index\`-th node. 
   - If \`index\` equals the length, the node will be appended to the end.
   - If \`index\` is greater than the length, the node will not be inserted.
   - If \`index\` is less than 0, the node will be inserted at the head.
5. **deleteAtIndex(index)**: Delete the \`index\`-th node, if the index is valid.

### Efficiency Tip
Keep track of a \`size\` variable within your class to make index validation $O(1)$ instead of $O(n)$.

---

### Example
**Input:**
\`\`\`
7
addAtHead 1
addAtTail 3
addAtIndex 1 2
get 1
deleteAtIndex 1
get 1
\`\`\`

**Output:**
\`\`\`
2
3
\`\`\`

**Explanation:**
The list becomes 1 -> 3, then 1 -> 2 -> 3. \`get(1)\` returns 2. After deleting index 1, list is 1 -> 3. \`get(1)\` returns 3.`,

  examples: [
    {
      input: '6\naddAtHead 1\naddAtTail 3\naddAtIndex 1 2\nget 1\ndeleteAtIndex 1\nget 1',
      output: '2\n3',
      explanation: 'Sequential operations on the list.'
    }
  ],

  constraints: [
    '0 ≤ index, val ≤ 1000',
    'At most 2000 calls will be made to the operations.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <string>

using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};

class MyLinkedList {
    // Your data members here (head, size, etc.)
public:
    MyLinkedList() {
        // Constructor
    }
    
    int get(int index) {
        // Your code
        return -1;
    }
    
    void addAtHead(int val) {
        // Your code
    }
    
    void addAtTail(int val) {
        // Your code
    }
    
    void addAtIndex(int index, int val) {
        // Your code
    }
    
    void deleteAtIndex(int index) {
        // Your code
    }
};

int main() {
    MyLinkedList* obj = new MyLinkedList();
    int q;
    cin >> q;
    while(q--) {
        string op;
        cin >> op;
        if(op == "addAtHead") {
            int val; cin >> val; obj->addAtHead(val);
        } else if(op == "addAtTail") {
            int val; cin >> val; obj->addAtTail(val);
        } else if(op == "addAtIndex") {
            int idx, val; cin >> idx >> val; obj->addAtIndex(idx, val);
        } else if(op == "deleteAtIndex") {
            int idx; cin >> idx; obj->deleteAtIndex(idx);
        } else if(op == "get") {
            int idx; cin >> idx; cout << obj->get(idx) << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.Scanner;

class MyLinkedList {
    // Your Node class and data members here
    
    public MyLinkedList() { }
    
    public int get(int index) {
        return -1;
    }
    
    public void addAtHead(int val) { }
    
    public void addAtTail(int val) { }
    
    public void addAtIndex(int index, int val) { }
    
    public void deleteAtIndex(int index) { }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        MyLinkedList obj = new MyLinkedList();
        if(!sc.hasNextInt()) return;
        int q = sc.nextInt();
        while(q-- > 0) {
            String op = sc.next();
            if(op.equals("addAtHead")) obj.addAtHead(sc.nextInt());
            else if(op.equals("addAtTail")) obj.addAtTail(sc.nextInt());
            else if(op.equals("addAtIndex")) obj.addAtIndex(sc.nextInt(), sc.nextInt());
            else if(op.equals("deleteAtIndex")) obj.deleteAtIndex(sc.nextInt());
            else if(op.equals("get")) System.out.println(obj.get(sc.nextInt()));
        }
    }
}`
  },

  testCases: [
    { input: '6\naddAtHead 1\naddAtTail 3\naddAtIndex 1 2\nget 1\ndeleteAtIndex 1\nget 1', expected: '2\n3' },
    { input: '4\naddAtHead 1\nget 0\ndeleteAtIndex 0\nget 0', expected: '1\n-1' },
    { input: '5\naddAtHead 7\naddAtHead 2\naddAtHead 1\naddAtIndex 3 0\ndeleteAtIndex 2\nget 2', expected: '0' },
    { input: '2\naddAtTail 1\nget 0', expected: '1' }
  ]
};