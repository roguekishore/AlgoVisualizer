/**
 * Print Binary Tree — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * A 2D formatted matrix (grid) representing the visual layout of the tree.
 */

module.exports = {
  id: 'print-binary-tree',
  conquestId: 'stage7-12',
  title: 'Print Binary Tree',
  difficulty: 'Hard',
  category: 'Binary Trees',
  tags: ['Tree', 'Recursion', 'Matrix', 'DFS'],

  description: `Visualizing a tree in a 2D grid is a unique challenge. You need to place the root in the exact middle of the top row and position its children such that they never overlap, regardless of how deep the tree goes.

### The Grid Rules
1.  **Height**: If the tree height is $h$, the grid will have $m = h + 1$ rows.
2.  **Width**: The number of columns $n$ is always $2^{h+1} - 1$.
3.  **Root Placement**: The root is placed at \`grid[(n-1)/2]\`.
4.  **Child Placement**: If a parent is at \`grid[r][c]\`:
    - The left child goes to \`grid[r+1][c - 2^{h-r-1}]\`.
    - The right child goes to \`grid[r+1][c + 2^{h-r-1}]\`.

### The Logic
This is a coordinate geometry problem applied to trees. By calculating the height first, we can pre-determine the exact "leap" distance for each level. As we go deeper into the tree, the horizontal distance between parent and child shrinks by half.

---

### Example
**Input:** \`[1, 2, 3, null, 4]\`
**Height ($h$):** 2
**Matrix ($3 \times 7$):**
\`\`\`
["", "", "", "1", "", "", ""]
["", "2", "", "", "", "3", ""]
["", "", "4", "", "", "", ""]
\`\`\``,

  examples: [
    {
      input: '1 2',
      output: '[["", "1", ""], ["2", "", ""]]',
      explanation: 'Root 1 in middle, 2 is left child.'
    }
  ],

  constraints: [
    'The height of the tree is in the range.',
    'The number of nodes is in the range.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <cmath>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

int getHeight(TreeNode* root) {
    if (!root) return -1;
    return 1 + max(getHeight(root->left), getHeight(root->right));
}

void fill(vector<vector<string>>& res, TreeNode* root, int r, int c, int h) {
    if (!root) return;
    res[r][c] = to_string(root->val);
    if (root->left) fill(res, root->left, r + 1, c - pow(2, h - r - 1), h);
    if (root->right) fill(res, root->right, r + 1, c + pow(2, h - r - 1), h);
}

vector<vector<string>> printTree(TreeNode* root) {
    int h = getHeight(root);
    int m = h + 1;
    int n = pow(2, h + 1) - 1;
    vector<vector<string>> res(m, vector<string>(n, ""));
    fill(res, root, 0, (n - 1) / 2, h);
    return res;
}

int main() {
    // Standard Tree Building and Matrix Printing logic...
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public List<List<String>> printTree(TreeNode root) {
        int height = getHeight(root);
        int rows = height + 1;
        int cols = (int)Math.pow(2, height + 1) - 1;
        List<List<String>> res = new ArrayList<>();
        
        for(int i = 0; i < rows; i++) {
            List<String> row = new ArrayList<>();
            for(int j = 0; j < cols; j++) row.add("");
            res.add(row);
        }
        
        fill(res, root, 0, (cols - 1) / 2, height);
        return res;
    }

    private int getHeight(TreeNode node) {
        if (node == null) return -1;
        return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    }

    private void fill(List<List<String>> res, TreeNode node, int r, int c, int h) {
        if (node == null) return;
        res.get(r).set(c, String.valueOf(node.val));
        if (node.left != null) fill(res, node.left, r + 1, c - (int)Math.pow(2, h - r - 1), h);
        if (node.right != null) fill(res, node.right, r + 1, c + (int)Math.pow(2, h - r - 1), h);
    }
}`
  },

  testCases: [
    { input: '1 2 3 null 4', expected: 'Matrix 3x7 with 1 at, 2 at, 3 at, 4 at' }
  ]
};