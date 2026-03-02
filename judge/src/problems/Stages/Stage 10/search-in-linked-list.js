/**
 * Search in Linked List — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of nodes.
 * Line 2: n space-separated integers (the list).
 * Line 3: An integer target to search for.
 *
 * Output format (stdout):
 * The index (0-based) of the first occurrence of target, or -1 if not found.
 */

module.exports = {
  id: 'search-in-linked-list',
  conquestId: 'stage4-41',
  title: 'Search in Linked List',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Traversal', 'Searching'],

  description: `Searching in a linked list is a linear operation. Because nodes are not stored in contiguous memory like an array, we cannot perform a Binary Search. We must start at the head and follow the pointers one by one.

### Task
Given the head of a singly linked list and a value \`target\`, find the index of the first node that contains that value.
1. Initialize an \`index\` counter at 0.
2. Start a \`current\` pointer at the \`head\`.
3. While \`current\` is not \`NULL\`:
   - If \`current->data\` matches the \`target\`, return the \`index\`.
   - Otherwise, move \`current\` to the next node and increment \`index\`.
4. If you reach the end of the list without finding the target, return \`-1\`.

### Time Complexity
- **$O(n)$**: In the worst case, you must visit every node.

### Example
**Input:**
\`\`\`
4
10 20 30 40
30
\`\`\`

**Output:**
\`\`\`
2
\`\`\`

**Explanation:**
The value 30 is at index 2 (10 is 0, 20 is 1).`,

  examples: [
    {
      input: '4\n10 20 30 40\n30',
      output: '2',
      explanation: '30 is found at the third node (index 2).'
    },
    {
      input: '3\n5 10 15\n20',
      output: '-1',
      explanation: '20 does not exist in the list.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 1000',
    '-10⁵ ≤ data, target ≤ 10⁵'
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
 * Returns the 0-based index of target, or -1 if not found.
 */
int solve(Node* head, int target) {
    // Your code here
    
    return -1; 
}

int main() {
    int n, target, val;
    if (!(cin >> n)) return 0;
    Node *head = nullptr, *tail = nullptr;
    for (int i = 0; i < n; i++) {
        cin >> val;
        Node* newNode = new Node(val);
        if (!head) head = newNode;
        else tail->next = newNode;
        tail = newNode;
    }
    cin >> target;
    
    cout << solve(head, target) << endl;
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
     * Returns the 0-based index of target, or -1 if not found.
     */
    public static int solve(Node head, int target) {
        // Your code here
        
        return -1;
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
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        
        System.out.println(solve(head, target));
    }
}`
  },

  testCases: [
    { input: '4\n10 20 30 40\n30', expected: '2' },
    { input: '3\n5 10 15\n20', expected: '-1' },
    { input: '1\n100\n100', expected: '0' },
    { input: '0\n\n50', expected: '-1' },
    { input: '5\n1 2 3 2 1\n2', expected: '1' },
    { input: '4\n1 2 3 4\n4', expected: '3' }
  ]
};