/**
 * Sort List — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of nodes.
 * Line 2: n space-separated integers (the unsorted list).
 *
 * Output format (stdout):
 * The values of the sorted linked list nodes separated by " -> " and ending with "NULL".
 */

module.exports = {
  id: 'sort-list',
  conquestId: 'stage4-46',
  title: 'Sort List',
  difficulty: 'Medium',
  category: 'Linked Lists',
  tags: ['Linked List', 'Divide and Conquer', 'Merge Sort', 'Two Pointers'],

  description: `Given the head of a linked list, return the list after sorting it in **ascending order**.

To solve this efficiently in $O(n \log n)$ time and $O(1)$ extra space (excluding recursion stack), we use the **Merge Sort** algorithm adapted for linked lists.

### Task
1. **Split**: Use the "Tortoise and Hare" (slow and fast pointers) approach to find the middle of the list.
2. **Recursion**: Recursively split the left and right halves until you have single-node lists.
3. **Merge**: Reuse your logic from the "Merge Two Sorted Lists" challenge to combine the sorted halves.

### Why Merge Sort for Linked Lists?
Unlike arrays, where **Quick Sort** is often preferred due to cache locality, **Merge Sort** is ideal for linked lists because:
- We don't need extra space for merging (we just re-link pointers).
- We can't perform random access (required for efficient Quick Sort partitioning).

### Example
**Input:**
\`\`\`
4
4 2 1 3
\`\`\`

**Output:**
\`\`\`
1 -> 2 -> 3 -> 4 -> NULL
\`\`\`

**Explanation:**
The list is split into and, sorted into and, then merged into.`,

  examples: [
    {
      input: '4\n4 2 1 3',
      output: '1 -> 2 -> 3 -> 4 -> NULL',
      explanation: 'The unsorted list is sorted in ascending order.'
    },
    {
      input: '5\n-1 5 3 4 0',
      output: '-1 -> 0 -> 3 -> 4 -> 5 -> NULL',
      explanation: 'Works with negative numbers and zero.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 5 * 10⁴',
    '-10⁵ ≤ Node.val ≤ 10⁵'
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
 * Merges two sorted lists (helper function).
 */
Node* merge(Node* l1, Node* l2) {
    // Re-use your Merge Two Sorted Lists logic here
    return nullptr;
}

/**
 * Finds the middle of the list and splits it.
 */
Node* getMid(Node* head) {
    Node* midPrev = nullptr;
    while (head && head->next) {
        midPrev = (midPrev == nullptr) ? head : midPrev->next;
        head = head->next->next;
    }
    Node* mid = midPrev->next;
    midPrev->next = nullptr;
    return mid;
}

/**
 * Sorts the linked list using Merge Sort.
 */
Node* solve(Node* head) {
    if (!head || !head->next) return head;
    
    Node* mid = getMid(head);
    Node* left = solve(head);
    Node* right = solve(mid);
    
    return merge(left, right);
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
     * Sorts the linked list using Merge Sort.
     */
    public static Node solve(Node head) {
        if (head == null || head.next == null) return head;
        
        // 1. Split the list
        Node mid = getMid(head);
        Node left = solve(head);
        Node right = solve(mid);
        
        // 2. Merge sorted halves
        return merge(left, right);
    }

    private static Node getMid(Node head) {
        Node midPrev = null;
        while (head != null && head.next != null) {
            midPrev = (midPrev == null) ? head : midPrev.next;
            head = head.next.next;
        }
        Node mid = midPrev.next;
        midPrev.next = null;
        return mid;
    }

    private static Node merge(Node list1, Node list2) {
        Node dummy = new Node(0);
        Node tail = dummy;
        // Your merge logic here
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
    { input: '4\n4 2 1 3', expected: '1 -> 2 -> 3 -> 4 -> NULL' },
    { input: '5\n-1 5 3 4 0', expected: '-1 -> 0 -> 3 -> 4 -> 5 -> NULL' },
    { input: '0\n', expected: 'NULL' },
    { input: '1\n10', expected: '10 -> NULL' },
    { input: '6\n10 10 10 10 10 10', expected: '10 -> 10 -> 10 -> 10 -> 10 -> 10 -> NULL' },
    { input: '3\n3 2 1', expected: '1 -> 2 -> 3 -> NULL' }
  ]
};