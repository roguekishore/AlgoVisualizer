/**
 * Binary Tree Right Side View — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * The values of the nodes you can see from the right side, ordered from top to bottom.
 */

module.exports = {
  id: 'binary-tree-right-side-view',
  conquestId: 'stage7-11',
  title: 'Binary Tree Right Side View',
  difficulty: 'Medium',
  category: 'Binary Trees',
  tags: ['Tree', 'BFS', 'Level Order', 'DFS'],

  description: `Imagine you are standing on the **right side** of a binary tree. Your task is to return the values of the nodes you can see, ordered from top to bottom.

### The Strategy: Level-by-Level
The most intuitive way to solve this is using **Level-Order Traversal (BFS)**:
1.  **Traverse**: Visit the tree level by level.
2.  **Identify**: For each level, the **last node** you visit is the one visible from the right side.
3.  **Collect**: Add that last node of every level to your result list.

### Alternative: Recursive DFS
You can also use **Depth-First Search**, but with a twist:
- Visit the **Right child before the Left child**.
- Keep track of the current \`depth\`.
- If the current \`depth\` equals the size of your result list, it means this is the first time you've reached this level from the right. Add the node!

---

### Example
**Input:** \`[1, 2, 3, null, 5, null, 4]\`
**Visual:**
\`\`\`
      1   <-- Visible
    /   \\
   2     3  <-- Visible
    \\     \\
     5     4 <-- Visible
\`\`\`
**Output:** \`\``,

  examples: [
    {
      input: '1 2 3 null 5 null 4',
      output: '1 3 4',
      explanation: 'From the right, 1 is visible on level 0, 3 on level 1, and 4 on level 2.'
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

vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    if (!root) return res;

    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int levelSize = q.size();
        for (int i = 0; i < levelSize; i++) {
            TreeNode* curr = q.front();
            q.pop();

            // If it's the last element of the current level
            if (i == levelSize - 1) {
                res.push_back(curr->val);
            }

            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
    }
    return res;
}

// buildTree logic here...

int main() {
    string line;
    getline(cin, line);
    // Parse and build tree...
    // vector<int> result = rightSideView(root);
    // Print result...
    return 0;
}`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode current = queue.poll();
                // Last element in current level
                if (i == size - 1) {
                    result.add(current.val);
                }
                if (current.left != null) queue.add(current.left);
                if (current.right != null) queue.add(current.right);
            }
        }
        return result;
    }
}`
  },

  testCases: [
    { input: '1 2 3 null 5 null 4', expected: '1 3 4' },
    { input: '1 null 3', expected: '1 3' },
    { input: 'null', expected: '' }
  ]
};