/**
 * Reverse Linked List — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of nodes.
 * Line 2: n space-separated integers (the list).
 *
 * Output format (stdout):
 * The values of the reversed linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'reverse-linked-list',
  conquestId: 'stage4-43',
  title: 'Reverse Linked List',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Pointers', 'Recursion'],

  description: `Reversing a linked list is the quintessential "pointer manipulation" interview question. It tests your ability to visualize how nodes are connected and how to reorient those connections without losing the rest of the list.

### Task
Given the head of a singly linked list, reverse the list and return the new head.
1. Use three pointers: \`prev\` (initially NULL), \`curr\` (initially head), and \`next\` (temporary).
2. While \`curr\` is not NULL:
   - Save the next node: \`next = curr->next\`.
   - Reverse the link: \`curr->next = prev\`.
   - Move \`prev\` and \`curr\` forward: \`prev = curr\`, \`curr = next\`.
3. At the end, \`prev\` will be the new head of the reversed list.

### Time & Space Complexity
- **Time**: $O(n)$ — We visit each node exactly once.
- **Space**: $O(1)$ — We only use a few extra pointers.

### Example
**Input:**
\`\`\`
5
1 2 3 4 5
\`\`\`

**Output:**
\`\`\`
5 -> 4 -> 3 -> 2 -> 1 -> NULL
\`\`\`

**Explanation:**
The head moves from 1 to 5, and all internal arrows are flipped.`,

  examples: [
    {
      input: '5\n1 2 3 4 5',
      output: '5 -> 4 -> 3 -> 2 -> 1 -> NULL',
      explanation: 'The entire list is reversed.'
    },
    {
      input: '2\n1 2',
      output: '2 -> 1 -> NULL',
      explanation: 'A simple two-node swap.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 5000',
    '-5000 ≤ Node.val ≤ 5000'
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
 * Reverses the linked list in-place and returns the new head.
 */
Node* solve(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    // Your code here
    
    return prev; 
}

void printList(Node* head) {
    while (head != nullptr) {
        cout << head->data << " -> ";
        head = head->next;
    }
    cout << "NULL" << endl;
}

int main() {
    int n, val;
    if (!(cin >> n)) return 0;
    Node *head = nullptr, *tail = nullptr;
    for (int i = 0; i < n; i++) {
        cin >> val;
        Node* newNode = new Node(val);
        if (!head) head = newNode;
        else tail->next = newNode;
        tail = newNode;
    }
    
    head = solve(head);
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
     * Reverses the linked list in-place and returns the new head.
     */
    public static Node solve(Node head) {
        Node prev = null;
        Node curr = head;
        // Your code here
        
        return prev;
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
        
        head = solve(head);
        printList(head);
    }
}`
  },

  testCases: [
    { input: '5\n1 2 3 4 5', expected: '5 -> 4 -> 3 -> 2 -> 1 -> NULL' },
    { input: '2\n1 2', expected: '2 -> 1 -> NULL' },
    { input: '1\n100', expected: '100 -> NULL' },
    { input: '0\n\n', expected: 'NULL' },
    { input: '3\n-1 0 1', expected: '1 -> 0 -> -1 -> NULL' },
    { input: '4\n10 20 30 40', expected: '40 -> 30 -> 20 -> 10 -> NULL' }
  ]
};