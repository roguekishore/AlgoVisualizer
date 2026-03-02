/**
 * Swap Nodes in Pairs — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of nodes.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The values of the modified linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'swap-nodes-in-pairs',
  conquestId: 'stage4-47',
  title: 'Swap Nodes in Pairs',
  difficulty: 'Medium',
  category: 'Linked Lists',
  tags: ['Linked List', 'Recursion', 'Pointer Manipulation'],

  description: `Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed).

### Task
This is a test of your ability to maintain links while reordering.
1. Use a **Dummy Node** to simplify the head swap.
2. Maintain a pointer \`prev\` (initially the dummy).
3. While there are at least two nodes to swap (\`first\` and \`second\`):
   - Point \`first->next\` to \`second->next\`.
   - Point \`second->next\` to \`first\`.
   - Point \`prev->next\` to \`second\`.
   - Move \`prev\` forward two spots to the now-second node (the original \`first\`).

### Example
**Input:**
\`\`\`
4
1 2 3 4
\`\`\`

**Output:**
\`\`\`
2 -> 1 -> 4 -> 3 -> NULL
\`\`\`

**Explanation:**
Nodes 1 and 2 swap, then nodes 3 and 4 swap.`,

  examples: [
    {
      input: '4\n1 2 3 4',
      output: '2 -> 1 -> 4 -> 3 -> NULL',
      explanation: 'Pairs (1,2) and (3,4) are swapped.'
    },
    {
      input: '1\n1',
      output: '1 -> NULL',
      explanation: 'Only one node, nothing to swap.'
    },
    {
      input: '3\n1 2 3',
      output: '2 -> 1 -> 3 -> NULL',
      explanation: 'The last node (3) remains in place as it has no pair.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 100',
    '0 ≤ Node.val ≤ 100'
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
 * Swaps every two adjacent nodes and returns the new head.
 */
Node* solve(Node* head) {
    if (!head || !head->next) return head;
    
    Node dummy(0);
    dummy.next = head;
    Node* prev = &dummy;
    
    // Your swap logic here
    
    return dummy.next;
}

void printList(Node* head) {
    while (head) {
        cout << head->data << " -> ";
        head = head->next;
    }
    cout << "NULL" << endl;
}

int main() {
    int n, val;
    if (!(cin >> n)) return 0;
    if (n == 0) { cout << "NULL" << endl; return 0; }
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
     * Swaps every two adjacent nodes and returns the new head.
     */
    public static Node solve(Node head) {
        if (head == null || head.next == null) return head;
        
        Node dummy = new Node(0);
        dummy.next = head;
        Node prev = dummy;
        
        // Your swap logic here
        
        return dummy.next;
    }

    public static void printList(Node head) {
        while (head != null) {
            System.out.print(head.data + " -> ");
            head = head.next;
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
    { input: '4\n1 2 3 4', expected: '2 -> 1 -> 4 -> 3 -> NULL' },
    { input: '0\n', expected: 'NULL' },
    { input: '1\n10', expected: '10 -> NULL' },
    { input: '3\n1 2 3', expected: '2 -> 1 -> 3 -> NULL' },
    { input: '2\n100 200', expected: '200 -> 100 -> NULL' },
    { input: '6\n1 2 3 4 5 6', expected: '2 -> 1 -> 4 -> 3 -> 6 -> 5 -> NULL' }
  ]
};