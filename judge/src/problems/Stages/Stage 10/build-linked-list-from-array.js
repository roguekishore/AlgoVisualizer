/**
 * Build Linked List from Array — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the size of the array.
 * Line 2: n space-separated integers.
 *
 * Output format (stdout):
 * The values of the linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'build-linked-list-from-array',
  conquestId: 'stage4-36',
  title: 'Build Linked List from Array',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Array', 'Data Structure'],

  description: `Welcome to the first step into **Linked Lists**! Unlike arrays, linked lists are not stored in contiguous memory. Each "Node" contains a piece of data and a pointer (or reference) to the next node in the sequence.

### Task
Given an array of integers, convert it into a **Singly Linked List**.
1. Create a \`Node\` class or struct.
2. Iterate through the array.
3. For each element, create a new node.
4. Link the previous node's \`next\` pointer to the current node.
5. Return the \`head\` (the first node) of the list.

### Node Structure
- **Value**: The integer data.
- **Next**: A pointer to the next \`Node\` (or \`null\`/\`nullptr\`).

### Example
**Input:**
\`\`\`
4
1 2 3 4
\`\`\`

**Output:**
\`\`\`
1 -> 2 -> 3 -> 4 -> NULL
\`\`\`

**Explanation:**
The array is transformed into a chain of nodes starting at 1 and ending at 4.`,

  examples: [
    {
      input: '4\n1 2 3 4',
      output: '1 -> 2 -> 3 -> 4 -> NULL',
      explanation: 'A simple list with 4 elements.'
    },
    {
      input: '1\n10',
      output: '10 -> NULL',
      explanation: 'A list with only one node.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 1000',
    '-10⁵ ≤ arr[i] ≤ 10⁵'
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
 * Builds a linked list from a vector and returns the head.
 */
Node* solve(int n, vector<int>& arr) {
    if (n == 0) return nullptr;
    // Your code here
    
    return nullptr;
}

void printList(Node* head) {
    Node* temp = head;
    while (temp != nullptr) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "NULL" << endl;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n == 0) {
        cout << "NULL" << endl;
        return 0;
    }
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    Node* head = solve(n, arr);
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
     * Builds a linked list from an array and returns the head.
     */
    public static Node solve(int n, int[] arr) {
        if (n == 0) return null;
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
        if (n == 0) {
            System.out.println("NULL");
            return;
        }
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        Node head = solve(n, arr);
        printList(head);
    }
}`
  },

  testCases: [
    { input: '4\n1 2 3 4', expected: '1 -> 2 -> 3 -> 4 -> NULL' },
    { input: '3\n10 20 30', expected: '10 -> 20 -> 30 -> NULL' },
    { input: '1\n5', expected: '5 -> NULL' },
    { input: '5\n1 1 1 1 1', expected: '1 -> 1 -> 1 -> 1 -> 1 -> NULL' },
    { input: '2\n-1 -2', expected: '-1 -> -2 -> NULL' },
    { input: '6\n0 5 10 15 20 25', expected: '0 -> 5 -> 10 -> 15 -> 20 -> 25 -> NULL' }
  ]
};