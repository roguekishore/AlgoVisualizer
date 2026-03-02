/**
 * Lowest Common Ancestor of Deepest Leaves — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * The Level-order traversal of the subtree rooted at the LCA of the deepest leaves.
 */

module.exports = {
  id: 'lca-deepest-leaves',
  conquestId: 'stage7-13',
  title: 'LCA of Deepest Leaves',
  difficulty: 'Medium',
  category: 'Binary Trees',
  tags: ['Tree', 'DFS', 'Recursion', 'Height'],

  description: `This problem combines two tree concepts: **Finding the Maximum Depth** and finding the **Lowest Common Ancestor (LCA)**.

The task is to find the smallest subtree that contains all the deepest nodes of the original tree.

### The Recursive Insight
We can solve this in a single pass by returning two pieces of information from every node:
1.  **The Depth**: How deep the deepest leaf is in this subtree.
2.  **The LCA**: The current candidate for the LCA of those deepest leaves.

### The Logic
For a given node:
- If **Left Depth > Right Depth**: The deepest leaves are only in the left subtree. Return \`(leftDepth + 1, leftLCA)\`.
- If **Right Depth > Left Depth**: The deepest leaves are only in the right subtree. Return \`(rightDepth + 1, rightLCA)\`.
- If **Left Depth == Right Depth**: Deepest leaves exist in both subtrees. This means the **current node** is the LCA for all deepest leaves found so far! Return \`(leftDepth + 1, currentNode)\`.

---

### Example
**Input:** \`[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]\`
**Visual:**
\`\`\`
          3
       /     \\
      5       1
     / \\     / \\
    6   2   0   8
       / \\
      7   4  <-- Deepest leaves
\`\`\`
- Deepest leaves are **7** and **4**.
- Their Lowest Common Ancestor is **2**.
- **Output:** Subtree rooted at 2: \`\`.`,

  examples: [
    {
      input: '3 5 1 6 2 0 8 null null 7 4',
      output: '2 7 4',
      explanation: '7 and 4 are at depth 3. Their closest common parent is 2.'
    },
    {
      input: '1',
      output: '1',
      explanation: 'The root itself is the deepest leaf.'
    }
  ],

  constraints: [
    'The number of nodes in the tree will be in the range.',
    '0 ≤ Node.val ≤ 1000',
    'The values of the nodes in the tree are unique.'
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

pair<int, TreeNode*> helper(TreeNode* root) {
    if (!root) return {0, NULL};

    auto left = helper(root->left);
    auto right = helper(root->right);

    if (left.first > right.first) {
        return {left.first + 1, left.second};
    } else if (right.first > left.first) {
        return {right.first + 1, right.second};
    } else {
        return {left.first + 1, root};
    }
}

TreeNode* lcaDeepestLeaves(TreeNode* root) {
    return helper(root).second;
}

// buildTree and level-order print logic...
`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

class Result {
    int dist;
    TreeNode node;
    Result(int d, TreeNode n) { dist = d; node = n; }
}

public class Main {
    public TreeNode lcaDeepestLeaves(TreeNode root) {
        return dfs(root).node;
    }

    private Result dfs(TreeNode node) {
        if (node == null) return new Result(0, null);
        
        Result left = dfs(node.left);
        Result right = dfs(node.right);
        
        if (left.dist > right.dist) return new Result(left.dist + 1, left.node);
        if (right.dist > left.dist) return new Result(right.dist + 1, right.node);
        return new Result(left.dist + 1, node);
    }
}`
  },

  testCases: [
    { input: '3 5 1 6 2 0 8 null null 7 4', expected: '2 7 4' },
    { input: '1 2 null 3', expected: '3' },
    { input: '0 1 3 null 2', expected: '2' }
  ]
};