/**
 * Merge Two Sorted Lists — Problem Definition
 *
 * Input format (stdin):
 * Line 1: n1 (size of list1) and n2 (size of list2).
 * Line 2: n1 space-separated sorted integers (list1).
 * Line 3: n2 space-separated sorted integers (list2).
 *
 * Output format (stdout):
 * The values of the merged sorted linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'merge-two-sorted-lists',
  conquestId: 'stage4-45',
  title: 'Merge Two Sorted Lists',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Recursion', 'Two Pointers'],

  description: `Merging two sorted lists into one single sorted list is a fundamental operation, often used as a sub-step in more complex algorithms like **Merge Sort**.

The goal is to create a new list by splicing together the nodes of the first two lists in increasing order.

### Task
Given the heads of two sorted linked lists, \`list1\` and \`list2\`, merge them into one **sorted** linked list.
1. Create a **Dummy Node** to act as the starting point of your new list.
2. Maintain a \`current\` pointer starting at the dummy node.
3. Compare the values at the heads of \`list1\` and \`list2\`.
4. Attach the smaller node to \`current->next\` and move that list's pointer forward.
5. Repeat until one list is exhausted.
6. Attach the remainder of the non-empty list to the end.
7. Return \`dummy->next\`.

### Time & Space Complexity
- **Time**: $O(n + m)$ where $n$ and $m$ are the lengths of the two lists.
- **Space**: $O(1)$ if you merge in-place (re-using existing nodes).

### Example
**Input:**
\`\`\`
3 3
1 2 4
1 3 4
\`\`\`

**Output:**
\`\`\`
1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL
\`\`\`

**Explanation:**
The nodes are compared and linked in non-decreasing order.`,

  examples: [
    {
      input: '3 3\n1 2 4\n1 3 4',
      output: '1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL',
      explanation: 'The sorted lists are merged into one.'
    },
    {
      input: '0 1\n\n0',
      output: '0 -> NULL',
      explanation: 'Merging an empty list with a list containing 0.'
    }
  ],

  constraints: [
    'The number of nodes in both lists is in the range.',
    '-100 ≤ Node.val ≤ 100',
    'Both list1 and list2 are sorted in non-decreasing order.'
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
 * Merges two sorted linked lists.
 */
Node* solve(Node* list1, Node* list2) {
    Node dummy(0);
    Node* tail = &dummy;
    
    // Your merging logic here
    
    return dummy.next;
}

void printList(Node* head) {
    while (head != nullptr) {
        cout << head->data << " -> ";
        head = head->next;
    }
    cout << "NULL" << endl;
}

Node* buildList(int n) {
    if (n == 0) return nullptr;
    int val;
    cin >> val;
    Node* head = new Node(val);
    Node* curr = head;
    for (int i = 1; i < n; i++) {
        cin >> val;
        curr->next = new Node(val);
        curr = curr->next;
    }
    return head;
}

int main() {
    int n1, n2;
    if (!(cin >> n1 >> n2)) return 0;
    Node* l1 = buildList(n1);
    Node* l2 = buildList(n2);
    
    Node* result = solve(l1, l2);
    printList(result);
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
     * Merges two sorted linked lists.
     */
    public static Node solve(Node list1, Node list2) {
        Node dummy = new Node(0);
        Node tail = dummy;
        
        // Your merging logic here
        
        return dummy.next;
    }

    public static void printList(Node head) {
        Node temp = head;
        while (temp != null) {
            System.out.print(temp.data + " -> ");
            temp = temp.next;
        }
        System.out.println("NULL");
    }

    public static Node buildList(Scanner sc, int n) {
        if (n == 0) return null;
        Node head = new Node(sc.nextInt());
        Node curr = head;
        for (int i = 1; i < n; i++) {
            curr.next = new Node(sc.nextInt());
            curr = curr.next;
        }
        return head;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n1 = sc.nextInt();
        int n2 = sc.nextInt();
        Node l1 = buildList(sc, n1);
        Node l2 = buildList(sc, n2);
        
        Node result = solve(l1, l2);
        printList(result);
    }
}`
  },

  testCases: [
    { input: '3 3\n1 2 4\n1 3 4', expected: '1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL' },
    { input: '0 0\n\n', expected: 'NULL' },
    { input: '0 1\n\n0', expected: '0 -> NULL' },
    { input: '2 2\n5 10\n1 15', expected: '1 -> 5 -> 10 -> 15 -> NULL' },
    { input: '1 3\n2\n1 3 4', expected: '1 -> 2 -> 3 -> 4 -> NULL' },
    { input: '4 4\n1 1 1 1\n1 1 1 1', expected: '1 -> 1 -> 1 -> 1 -> 1 -> 1 -> 1 -> 1 -> NULL' }
  ]
};