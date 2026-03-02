/**
 * Validate Binary Search Tree — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal of the tree.
 * Use "null" to represent missing nodes.
 *
 * Output format (stdout):
 * "true" if the tree is a valid BST, "false" otherwise.
 */

module.exports = {
  id: 'validate-bst',
  conquestId: 'stage7-07',
  title: 'Validate Binary Search Tree',
  difficulty: 'Medium',
  category: 'Binary Search Trees',
  tags: ['Tree', 'Recursion', 'BST', 'DFS'],

  description: `A common mistake is thinking that a Binary Search Tree (BST) is valid if every node is simply greater than its left child and smaller than its right child. 

**That is not enough.**

In a valid BST, **all** nodes in the left subtree must be smaller than the root, and **all** nodes in the right subtree must be larger. 

### The Recursive Boundary Strategy
To validate this correctly, we must pass down a **range** (minimum and maximum allowed values) for each node:
1.  **Root**: Can be any value ($-\infty$ to $+\infty$).
2.  **Left Child**: Must be within the range \`[min, root.val - 1]\`.
3.  **Right Child**: Must be within the range \`[root.val + 1, max]\`.

If any node falls outside its inherited boundaries, the entire tree is invalid.

### Time & Space Complexity
- **Time**: $O(n)$ since we visit every node exactly once.
- **Space**: $O(h)$ for the recursion stack, where $h$ is the height of the tree.

---

### Example
**Input:** \`5 1 4 null null 3 6\`
**Visual:**
\`\`\`
      5
    /   \\
   1     4
        / \\
       3   6
\`\`\`
**Result:** \`false\`
**Explanation:** The node \`4\` is the right child of \`5\`. However, its left child is \`3\`, which is fine for \`4\`, but it also resides in the right subtree of \`5\`. Since $3 < 5$, this violates the BST property for the root.`,

  examples: [
    {
      input: '2 1 3',
      output: 'true',
      explanation: 'Root 2 is > 1 and < 3. Valid.'
    },
    {
      input: '5 1 4 null null 3 6',
      output: 'false',
      explanation: 'Node 3 is in the right subtree of 5 but is smaller than 5.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 10⁴',
    '-2³¹ ≤ node.val ≤ 2³¹ - 1'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>
#include <climits>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

/**
 * We use long long to handle INT_MIN and INT_MAX boundaries.
 */
bool isValidBST(TreeNode* root, long long minVal, long long maxVal) {
    if (!root) return true;
    
    // Check current node against boundaries
    if (root->val <= minVal || root->val >= maxVal) return false;
    
    // Check subtrees with updated boundaries
    return isValidBST(root->left, minVal, root->val) && 
           isValidBST(root->right, root->val, maxVal);
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
    // Initial boundaries: -Infinity to +Infinity
    if (isValidBST(root, LLONG_MIN, LLONG_MAX)) cout << "true" << endl;
    else cout << "false" << endl;
    return 0;
}`,
    java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public static boolean isValidBST(TreeNode root, Long min, Long max) {
        if (root == null) return true;
        if (root.val <= min || root.val >= max) return false;
        
        return isValidBST(root.left, min, (long)root.val) && 
               isValidBST(root.right, (long)root.val, max);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        // Build logic and call: isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE)
    }
}`
  },

  testCases: [
    { input: '2 1 3', expected: 'true' },
    { input: '5 1 4 null null 3 6', expected: 'false' },
    { input: '10 5 15 null null 6 20', expected: 'false' },
    { input: '2147483647', expected: 'true' }
  ]
};