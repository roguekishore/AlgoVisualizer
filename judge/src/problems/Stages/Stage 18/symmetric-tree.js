/**
 * Symmetric Tree — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * "true" if the tree is a mirror of itself, "false" otherwise.
 */

module.exports = {
  id: 'symmetric-tree',
  conquestId: 'stage7-08',
  title: 'Symmetric Tree',
  difficulty: 'Easy',
  category: 'Binary Trees',
  tags: ['Tree', 'Recursion', 'Mirror', 'DFS'],

  description: `A tree is **symmetric** if it is a mirror image of itself. In other words, if you "folded" the tree down the middle, the left and right halves would match perfectly.

### The Mirror Condition
Two trees (or subtrees) are mirrors of each other if:
1.  Their roots have the same value.
2.  The **left** subtree of the left tree is a mirror of the **right** subtree of the right tree.
3.  The **right** subtree of the left tree is a mirror of the **left** subtree of the right tree.

### The Recursive Approach
We create a helper function \`isMirror(node1, node2)\`:
- **Base Case**: If both are \`null\`, return \`true\`.
- **Base Case**: If only one is \`null\`, return \`false\`.
- **Logic**: Check if \`node1.val == node2.val\` AND recursively check the mirrored children.

### Example
**Symmetric Tree:** \`\`
\`\`\`
      1
    /   \\
   2     2
  / \\   / \\
 3   4 4   3
\`\`\`
**Non-Symmetric Tree:** \`[1, 2, 2, null, 3, null, 3]\`
\`\`\`
      1
    /   \\
   2     2
    \\     \\
     3     3
\`\`\`
(This is not symmetric because both 3s are right children; one should be left and the other right.)`,

  examples: [
    {
      input: '1 2 2 3 4 4 3',
      output: 'true',
      explanation: 'The left and right subtrees are perfect mirrors.'
    },
    {
      input: '1 2 2 null 3 null 3',
      output: 'false',
      explanation: 'The structure is not mirrored.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 1000',
    '-100 ≤ node.val ≤ 100'
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

bool isMirror(TreeNode* t1, TreeNode* t2) {
    if (t1 == NULL && t2 == NULL) return true;
    if (t1 == NULL || t2 == NULL) return false;
    
    return (t1->val == t2->val) && 
           isMirror(t1->left, t2->right) && 
           isMirror(t1->right, t2->left);
}

bool isSymmetric(TreeNode* root) {
    return isMirror(root, root);
}

TreeNode* buildTree(string input) {
    if (input.empty() || input == "null") return NULL;
    stringstream ss(input); string item; ss >> item;
    TreeNode* root = new TreeNode(stoi(item));
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (!(ss >> item)) break;
        if (item != "null") { curr->left = new TreeNode(stoi(item)); q.push(curr->left); }
        if (!(ss >> item)) break;
        if (item != "null") { curr->right = new TreeNode(stoi(item)); q.push(curr->right); }
    }
    return root;
}

int main() {
    string line; getline(cin, line);
    TreeNode* root = buildTree(line);
    cout << (isSymmetric(root) ? "true" : "false") << endl;
    return 0;
}`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) return true;
        if (t1 == null || t2 == null) return false;
        return (t1.val == t2.val)
            && isMirror(t1.right, t2.left)
            && isMirror(t1.left, t2.right);
    }

    public boolean isSymmetric(TreeNode root) {
        return isMirror(root, root);
    }

    public static void main(String[] args) {
        // Build logic and call isSymmetric...
    }
}`
  },

  testCases: [
    { input: '1 2 2 3 4 4 3', expected: 'true' },
    { input: '1 2 2 null 3 null 3', expected: 'false' },
    { input: '1 2 2 2 null 2', expected: 'false' }
  ]
};