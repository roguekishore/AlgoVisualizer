/**
 * Insert at Position — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of existing nodes.
 * Line 2: n space-separated integers (the initial list).
 * Line 3: Two space-separated integers: val (to insert) and pos (0-based index).
 *
 * Output format (stdout):
 * The values of the linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'insert-at-position',
  conquestId: 'stage4-39',
  title: 'Insert at Position',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Pointers', 'Traversal'],

  description: `Inserting an element at a specific index in a linked list requires traversing to the $(pos-1)^{th}$ node. Unlike an array where we can access index \`i\` in $O(1)$, a linked list requires $O(pos)$ time to find the spot.

### Task
Given the head of a singly linked list, an integer \`val\`, and a 0-based position \`pos\`, insert a new node with value \`val\` at that position.
1. If \`pos == 0\`, the new node becomes the new head (same as Insert at Head).
2. Otherwise, use a pointer to skip \`pos - 1\` nodes.
3. Once you are at the node **before** the desired position:
   - Point the \`next\` of the new node to the current node's \`next\`.
   - Update the current node's \`next\` to point to the new node.
4. If \`pos\` is equal to the length of the list, the node is appended to the tail.

### Example
**Input:**
\`\`\`
3
10 20 30
15 1
\`\`\`

**Output:**
\`\`\`
10 -> 15 -> 20 -> 30 -> NULL
\`\`\`

**Explanation:**
The value 15 is inserted at index 1, pushing 20 and 30 to the right.`,

  examples: [
    {
      input: '3\n10 20 30\n15 1',
      output: '10 -> 15 -> 20 -> 30 -> NULL',
      explanation: '15 is placed between 10 and 20.'
    },
    {
      input: '2\n1 2\n0 0',
      output: '0 -> 1 -> 2 -> NULL',
      explanation: 'Inserting at position 0 is an "Insert at Head".'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 1000',
    '0 ≤ pos ≤ n',
    '-10⁵ ≤ val ≤ 10⁵'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>

using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

/**
 * Inserts val at the specified 0-based position.
 */
Node* solve(Node* head, int val, int pos) {
    Node* newNode = new Node(val);
    if (pos == 0) {
        newNode->next = head;
        return newNode;
    }
    
    // Your code here: Traverse to (pos - 1) and link newNode
    
    return head; 
}

void printList(Node* head) {
    while (head != nullptr) {
        cout << head->data << " -> ";
        head = head->next;
    }
    cout << "NULL" << endl;
}

int main() {
    int n, val, pos, temp_val;
    if (!(cin >> n)) return 0;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        cin >> temp_val;
        Node* newNode = new Node(temp_val);
        if (!head) head = newNode;
        else tail->next = newNode;
        tail = newNode;
    }
    cin >> val >> pos;
    
    head = solve(head, val, pos);
    printList(head);
    return 0;
}`,
    java: `import java.util.Scanner;

class Node {
    int data;
    Node next;
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

public class Main {
    /**
     * Inserts val at the specified 0-based position.
     */
    public static Node solve(Node head, int val, int pos) {
        Node newNode = new Node(val);
        if (pos == 0) {
            newNode.next = head;
            return newNode;
        }
        
        // Your code here: Traverse to (pos - 1) and link newNode
        
        return head;
    }

    public static void printList(Node head) {
        Node temp = head;
        while (temp != null) {
            System.out.print(temp.data + " -> ");
            temp = temp.next;
        }
        System.out.println("NULL");
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Node head = null, tail = null;
        for (int i = 0; i < n; i++) {
            int data = sc.nextInt();
            Node newNode = new Node(data);
            if (head == null) head = newNode;
            else tail.next = newNode;
            tail = newNode;
        }
        int val = sc.nextInt();
        int pos = sc.nextInt();
        
        head = solve(head, val, pos);
        printList(head);
    }
}`
  },

  testCases: [
    { input: '3\n10 20 30\n15 1', expected: '10 -> 15 -> 20 -> 30 -> NULL' },
    { input: '2\n1 2\n0 0', expected: '0 -> 1 -> 2 -> NULL' },
    { input: '2\n1 2\n3 2', expected: '1 -> 2 -> 3 -> NULL' },
    { input: '0\n\n100 0', expected: '100 -> NULL' },
    { input: '5\n1 2 3 4 5\n99 3', expected: '1 -> 2 -> 3 -> 99 -> 4 -> 5 -> NULL' }
  ]
};