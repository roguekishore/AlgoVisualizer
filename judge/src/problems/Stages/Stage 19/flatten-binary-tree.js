/**
 * Flatten Binary Tree to Linked List — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * The level-order traversal of the flattened tree (which will look like a right-skewed list).
 */

module.exports = {
  id: 'flatten-binary-tree',
  conquestId: 'stage7-14',
  title: 'Flatten Binary Tree to Linked List',
  difficulty: 'Medium',
  category: 'Binary Trees',
  tags: ['Tree', 'DFS', 'Linked List', 'Recursion'],

  description: `The challenge: Flatten a binary tree into a "linked list" in-place. 

### The Rules
1. The "linked list" should use the same \`TreeNode\` class.
2. The left child pointer of all nodes must be \`null\`.
3. The right child pointer should point to the next node in a **Pre-order Traversal** ($Root \rightarrow Left \rightarrow Right$).

### The "Right-to-Left" Post-order Trick
The most elegant way to solve this is to perform a **reversed** pre-order traversal ($Right \rightarrow Left \rightarrow Root$). 
- We keep a global variable \`prev\` to track the node we just processed.
- For each node:
    1. Flatten the **right** subtree.
    2. Flatten the **left** subtree.
    3. Set the current node's **right** to \`prev\`.
    4. Set the current node's **left** to \`null\`.
    5. Update \`prev\` to the current node.

### Complexity
- **Time**: $O(n)$ because we visit every node once.
- **Space**: $O(h)$ for the recursion stack.

---

### Example
**Input:** \`[1, 2, 5, 3, 4, null, 6]\`
**Visual Transformation:**
\`\`\`
    1               1
   / \\               \\
  2   5      ->       2
 / \\   \\               \\
3   4   6               3
                         \\
                          4
                           \\
                            5
                             \\
                              6
\`\`\``,

  examples: [
    {
      input: '1 2 5 3 4 null 6',
      output: '1 null 2 null 3 null 4 null 5 null 6',
      explanation: 'The tree is unrolled into a single right-leaning path following pre-order.'
    }
  ],

  constraints: [
    'The number of nodes is in the range.',
    '-100 ≤ Node.val ≤ 100'
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

class Solution {
    TreeNode* prev = NULL;
public:
    void flatten(TreeNode* root) {
        if (!root) return;
        
        // Flatten right, then left (Reversed Pre-order)
        flatten(root->right);
        flatten(root->left);
        
        root->right = prev;
        root->left = NULL;
        prev = root;
    }
};

// Helper to print level order for verification
void printLevelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            cout << curr->val << " ";
            q.push(curr->left);
            q.push(curr->right);
        } else {
            cout << "null ";
        }
    }
}

int main() {
    // buildTree logic and Solution().flatten(root)
    return 0;
}`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Main {
    private TreeNode prev = null;

    public void flatten(TreeNode root) {
        if (root == null) return;
        
        flatten(root.right);
        flatten(root.left);
        
        root.right = prev;
        root.left = null;
        prev = root;
    }

    public static void main(String[] args) {
        // Scanner and buildTree...
    }
}`
  },

  testCases: [
    { input: '1 2 5 3 4 null 6', expected: '1 null 2 null 3 null 4 null 5 null 6' },
    { input: '0', expected: '0' },
    { input: 'null', expected: '' }
  ]
};