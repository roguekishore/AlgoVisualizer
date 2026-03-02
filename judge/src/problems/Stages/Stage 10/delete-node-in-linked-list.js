/**
 * Delete Node in a Linked List — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of existing nodes.
 * Line 2: n space-separated integers (the initial list).
 * Line 3: An integer target, the value of the node to delete.
 *
 * Output format (stdout):
 * The values of the linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'delete-node-in-linked-list',
  conquestId: 'stage4-40',
  title: 'Delete Node in a Linked List',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Pointers', 'Traversal'],

  description: `Deletion in a linked list involves re-routing the pointers to bypass the node you want to remove. Once bypassed, the node is effectively disconnected from the sequence.

### Task
Given the head of a singly linked list and a value \`target\`, delete the **first occurrence** of a node with that value.
1. **Case 1: Empty List** — Return \`null\`.
2. **Case 2: Head deletion** — If the head node contains the target, the second node becomes the new head.
3. **Case 3: General deletion** — Traverse the list while keeping track of the \`current\` node and its \`previous\` node.
   - When \`current->data == target\`, set \`previous->next = current->next\`.
4. Return the head of the modified list.

### Example
**Input:**
\`\`\`
4
10 20 30 40
30
\`\`\`

**Output:**
\`\`\`
10 -> 20 -> 40 -> NULL
\`\`\`

**Explanation:**
The node with value 30 is removed, and 20 now points directly to 40.`,

  examples: [
    {
      input: '4\n10 20 30 40\n30',
      output: '10 -> 20 -> 40 -> NULL',
      explanation: '30 is removed from the middle.'
    },
    {
      input: '3\n1 2 3\n1',
      output: '2 -> 3 -> NULL',
      explanation: 'The head (1) is removed; 2 becomes the new head.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 1000',
    '-10⁵ ≤ data, target ≤ 10⁵',
    'Assume the target value exists at most once in the list for this exercise.'
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
 * Deletes the first occurrence of a node with the given target value.
 */
Node* solve(Node* head, int target) {
    if (head == nullptr) return nullptr;
    
    // Your code here
    
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
    int n, target, temp_val;
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
    cin >> target;
    
    head = solve(head, target);
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
     * Deletes the first occurrence of a node with the given target value.
     */
    public static Node solve(Node head, int target) {
        if (head == null) return null;
        
        // Your code here
        
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
        int target = sc.nextInt();
        
        head = solve(head, target);
        printList(head);
    }
}`
  },

  testCases: [
    { input: '4\n10 20 30 40\n30', expected: '10 -> 20 -> 40 -> NULL' },
    { input: '3\n1 2 3\n1', expected: '2 -> 3 -> NULL' },
    { input: '3\n1 2 3\n3', expected: '1 -> 2 -> NULL' },
    { input: '1\n100\n100', expected: 'NULL' },
    { input: '5\n1 2 3 4 5\n99', expected: '1 -> 2 -> 3 -> 4 -> 5 -> NULL' }
  ]
};