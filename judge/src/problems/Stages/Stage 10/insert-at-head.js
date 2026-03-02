/**
 * Insert at Head — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of existing nodes.
 * Line 2: n space-separated integers (the initial list).
 * Line 3: An integer value to be inserted at the head.
 *
 * Output format (stdout):
 * The values of the linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'insert-at-head',
  conquestId: 'stage4-37',
  title: 'Insert at Head',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Pointers'],

  description: `One of the primary advantages of a linked list over an array is that inserting an element at the beginning (the "head") is an $O(1)$ operation. 

In an array, inserting at index 0 requires shifting every other element. In a linked list, you simply create a new node and point it to the current head.

### Task
Given the head of a singly linked list and an integer \`val\`, insert a new node with value \`val\` at the **front** of the list and return the new head.
1. Create a new node with the given \`val\`.
2. Set the \`next\` pointer of the new node to the current \`head\`.
3. Update the \`head\` to be this new node.

### Example
**Input:**
\`\`\`
3
1 2 3
0
\`\`\`

**Output:**
\`\`\`
0 -> 1 -> 2 -> 3 -> NULL
\`\`\`

**Explanation:**
The new node (0) is placed before the existing head (1).`,

  examples: [
    {
      input: '3\n1 2 3\n0',
      output: '0 -> 1 -> 2 -> 3 -> NULL',
      explanation: '0 becomes the new head.'
    },
    {
      input: '0\n\n5',
      output: '5 -> NULL',
      explanation: 'Inserting into an empty list makes the new node the head.'
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
 * Inserts a new value at the head of the linked list.
 */
Node* solve(Node* head, int val) {
    // Your code here
    
    return nullptr; 
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
     * Inserts a new value at the head of the linked list.
     */
    public static Node solve(Node head, int val) {
        // Your code here
        
        return null;
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
    { input: '3\n1 2 3\n0', expected: '0 -> 1 -> 2 -> 3 -> NULL' },
    { input: '0\n\n5', expected: '5 -> NULL' },
    { input: '2\n10 20\n5', expected: '5 -> 10 -> 20 -> NULL' },
    { input: '4\n1 1 1 1\n2', expected: '2 -> 1 -> 1 -> 1 -> 1 -> NULL' },
    { input: '1\n100\n-1', expected: '-1 -> 100 -> NULL' }
  ]
};