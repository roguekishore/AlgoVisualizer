/**
 * Insert at Tail — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of existing nodes.
 * Line 2: n space-separated integers (the initial list).
 * Line 3: An integer value to be inserted at the tail.
 *
 * Output format (stdout):
 * The values of the linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'insert-at-tail',
  conquestId: 'stage4-38',
  title: 'Insert at Tail',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Pointers', 'Traversal'],

  description: `While inserting at the head is a simple $O(1)$ operation, inserting at the **tail** (the end) of a singly linked list usually requires traversing the entire list unless you maintain a tail pointer.

### Task
Given the head of a singly linked list and an integer \`val\`, insert a new node with value \`val\` at the **end** of the list and return the head.
1. Create a new node with the given \`val\`.
2. If the list is empty (\`head == null\`), the new node becomes the head.
3. Otherwise, traverse the list starting from the head until you reach the last node (the node where \`next\` is \`null\`).
4. Set the \`next\` pointer of that last node to your new node.
5. Return the original head.

### Example
**Input:**
\`\`\`
3
1 2 3
4
\`\`\`

**Output:**
\`\`\`
1 -> 2 -> 3 -> 4 -> NULL
\`\`\`

**Explanation:**
We travel from 1 to 2 to 3, then attach 4 to the end of 3.`,

  examples: [
    {
      input: '3\n1 2 3\n4',
      output: '1 -> 2 -> 3 -> 4 -> NULL',
      explanation: '4 is appended to the end.'
    },
    {
      input: '0\n\n10',
      output: '10 -> NULL',
      explanation: 'In an empty list, the new node becomes the head.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 1000',
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
 * Inserts a new value at the tail of the linked list.
 */
Node* solve(Node* head, int val) {
    Node* newNode = new Node(val);
    if (head == nullptr) return newNode;
    
    // Your code here: Traverse to the end and link newNode
    
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
    int n, val, temp_val;
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
    cin >> val;
    
    head = solve(head, val);
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
     * Inserts a new value at the tail of the linked list.
     */
    public static Node solve(Node head, int val) {
        Node newNode = new Node(val);
        if (head == null) return newNode;
        
        // Your code here: Traverse to the end and link newNode
        
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
        
        head = solve(head, val);
        printList(head);
    }
}`
  },

  testCases: [
    { input: '3\n1 2 3\n4', expected: '1 -> 2 -> 3 -> 4 -> NULL' },
    { input: '0\n\n10', expected: '10 -> NULL' },
    { input: '1\n5\n6', expected: '5 -> 6 -> NULL' },
    { input: '2\n-1 -2\n-3', expected: '-1 -> -2 -> -3 -> NULL' },
    { input: '5\n1 1 1 1 1\n2', expected: '1 -> 1 -> 1 -> 1 -> 1 -> 2 -> NULL' }
  ]
};