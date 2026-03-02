/**
 * Build Binary Tree (Level Order) — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 * Use "null" or "-1" to represent a missing node.
 *
 * Output format (stdout):
 * The In-order traversal of the built tree to verify structure.
 */

module.exports = {
  id: 'build-tree-level-order',
  conquestId: 'stage7-01',
  title: 'Build Binary Tree (Level Order)',
  difficulty: 'Medium',
  category: 'Binary Trees',
  tags: ['Tree', 'Queue', 'BFS'],

  description: `Welcome to **Stage 7: Binary Trees**! We are moving from linear structures (Arrays, Linked Lists) to hierarchical ones.

A common way to represent a tree in a single line is **Level Order Traversal** (also known as Breadth-First). This is how platforms like LeetCode represent trees.

### The Algorithm
To convert a level-order array back into a pointer-based tree, we use a **Queue**:
1.  **Start**: Create the root node from the first element of the array and push it into a queue.
2.  **Iterate**: While the queue is not empty and you still have elements in the array:
    - Pop a parent node from the queue.
    - The next element in the array is its **left child**. If it's not "null", create the node, link it, and push it to the queue.
    - The element after that is its **right child**. If it's not "null", create the node, link it, and push it to the queue.

### Example
**Input:** \`1 2 3 null null 4 5\`
**Visual Structure:**
\`\`\`
      1
    /   \\
   2     3
        / \\
       4   5
\`\`\`
**In-order Output:** \`2 1 4 3 5\`

### Task
Implement the logic to construct the tree. To verify your tree is correct, the boilerplate includes an In-order traversal function.`,

  examples: [
    {
      input: '1 2 3',
      output: '2 1 3',
      explanation: 'Root 1 has left child 2 and right child 3.'
    },
    {
      input: '1 null 2 3',
      output: '1 3 2',
      explanation: '1 has no left child. 2 is the right child of 1. 3 is the left child of 2.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 10⁴',
    '-1000 ≤ node.val ≤ 1000'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

TreeNode* buildTree() {
    string val;
    if (!(cin >> val) || val == "null") return NULL;

    TreeNode* root = new TreeNode(stoi(val));
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();

        // Read left child
        if (!(cin >> val)) break;
        if (val != "null") {
            curr->left = new TreeNode(stoi(val));
            q.push(curr->left);
        }

        // Read right child
        if (!(cin >> val)) break;
        if (val != "null") {
            curr->right = new TreeNode(stoi(val));
            q.push(curr->right);
        }
    }
    return root;
}

void inOrder(TreeNode* root) {
    if (!root) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}

int main() {
    TreeNode* root = buildTree();
    inOrder(root);
    cout << endl;
    return 0;
}`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public static TreeNode buildTree(String[] nodes) {
        if (nodes.length == 0 || nodes.equals("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(nodes));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);

        int i = 1;
        while (!q.isEmpty() && i < nodes.length) {
            TreeNode curr = q.poll();

            // Left child
            if (i < nodes.length && !nodes[i].equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.left);
            }
            i++;

            // Right child
            if (i < nodes.length && !nodes[i].equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    public static void inOrder(TreeNode root) {
        if (root == null) return;
        inOrder(root.left);
        System.out.print(root.val + " ");
        inOrder(root.right);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] nodes = sc.nextLine().split("\\\\s+");
        TreeNode root = buildTree(nodes);
        inOrder(root);
    }
}`
  },

  testCases: [
    { input: '1 2 3 null null 4 5', expected: '2 1 4 3 5' },
    { input: '10 20 30 40 50', expected: '40 20 50 10 30' },
    { input: '1 null 2 null 3', expected: '1 2 3' }
  ]
};