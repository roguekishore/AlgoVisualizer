/**
 * Linked List Cycle — Problem Definition
 *
 * Input format (stdin):
 * Line 1: An integer n, the number of nodes.
 * Line 2: n space-separated integers (the list values).
 * Line 3: An integer pos, the index (0-based) that the tail points back to. 
 * If pos is -1, there is no cycle.
 *
 * Output format (stdout):
 * "true" if there is a cycle, "false" otherwise.
 */

module.exports = {
  id: 'linked-list-cycle',
  conquestId: 'stage4-44',
  title: 'Linked List Cycle',
  difficulty: 'Easy',
  category: 'Linked Lists',
  tags: ['Linked List', 'Two Pointers', 'Floyd\'s Cycle-Finding'],

  description: `Detecting a cycle in a linked list is a classic problem that introduces **Floyd's Cycle-Finding Algorithm**, also known as the "Tortoise and the Hare."

If a list has no cycle, the "Hare" (fast pointer) will eventually reach the end (\`NULL\`). If there is a cycle, the "Hare" will eventually lap the "Tortoise" (slow pointer) inside the loop.

### Task
Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.
1. Initialize two pointers, \`slow\` and \`fast\`, both at the \`head\`.
2. Move \`slow\` one step at a time: \`slow = slow->next\`.
3. Move \`fast\` two steps at a time: \`fast = fast->next->next\`.
4. If at any point \`slow == fast\`, a cycle exists.
5. If \`fast\` or \`fast->next\` becomes \`NULL\`, there is no cycle.

### Time & Space Complexity
- **Time**: $O(n)$ — We traverse the list once.
- **Space**: $O(1)$ — We only use two pointers, regardless of list size.

### Example
**Input:**
\`\`\`
4
3 2 0 -4
1
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

**Explanation:**
The tail (-4) points back to the node at index 1 (value 2). The pointers will eventually meet.`,

  examples: [
    {
      input: '4\n3 2 0 -4\n1',
      output: 'true',
      explanation: 'There is a cycle where the tail connects to the second node.'
    },
    {
      input: '2\n1 2\n-1',
      output: 'false',
      explanation: 'The list ends at 2 -> NULL.'
    }
  ],

  constraints: [
    '0 ≤ n ≤ 10⁴',
    '-10⁵ ≤ Node.val ≤ 10⁵',
    'pos is -1 or a valid index in the linked-list.'
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
 * Detects if a cycle exists in the linked list.
 */
bool solve(Node* head) {
    if (!head || !head->next) return false;
    
    // Your code here: Initialize slow and fast pointers
    
    return false; 
}

int main() {
    int n, pos, val;
    if (!(cin >> n)) return 0;
    vector<Node*> nodes;
    Node *head = nullptr, *tail = nullptr;
    for (int i = 0; i < n; i++) {
        cin >> val;
        Node* newNode = new Node(val);
        nodes.push_back(newNode);
        if (!head) head = newNode;
        else tail->next = newNode;
        tail = newNode;
    }
    cin >> pos;
    if (pos != -1 && tail) {
        tail->next = nodes[pos];
    }
    
    cout << (solve(head) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.*;

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
     * Detects if a cycle exists in the linked list.
     */
    public static boolean solve(Node head) {
        if (head == null || head.next == null) return false;
        
        // Your code here: Initialize slow and fast pointers
        
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<Node> nodes = new ArrayList<>();
        Node head = null, tail = null;
        for (int i = 0; i < n; i++) {
            int data = sc.nextInt();
            Node newNode = new Node(data);
            nodes.add(newNode);
            if (head == null) head = newNode;
            else tail.next = newNode;
            tail = newNode;
        }
        int pos = sc.nextInt();
        if (pos != -1 && tail != null) {
            tail.next = nodes.get(pos);
        }
        
        System.out.println(solve(head) ? "true" : "false");
    }
}`
  },

  testCases: [
    { input: '4\n3 2 0 -4\n1', expected: 'true' },
    { input: '2\n1 2\n0', expected: 'true' },
    { input: '1\n1\n-1', expected: 'false' },
    { input: '0\n\n-1', expected: 'false' },
    { input: '3\n1 2 3\n-1', expected: 'false' },
    { input: '5\n1 2 3 4 5\n2', expected: 'true' },
    { input: '2\n1 1\n1', expected: 'true' }
  ]
};