/**
 * Morris Inorder Traversal — Problem Definition
 *
 * Input format (stdin):
 * A single line of space-separated values representing the level-order traversal.
 *
 * Output format (stdout):
 * The In-order traversal of the tree using O(1) extra space.
 */

module.exports = {
  id: 'morris-traversal-inorder',
  conquestId: 'stage7-06',
  title: 'Morris Inorder Traversal',
  difficulty: 'Hard',
  category: 'Binary Trees',
  tags: ['Tree', 'Traversal', 'Threaded Binary Tree', 'O(1) Space'],

  description: `Standard tree traversals (Recursive or Iterative with a Stack) use **$O(h)$** space, where $h$ is the height of the tree. If the tree is skewed, this becomes $O(n)$.

**Morris Traversal** is a brilliant algorithm that achieves a traversal in **$O(n)$ time** and **$O(1)$ extra space** (no recursion, no stack!).

### The Secret: Threaded Binary Trees
Morris Traversal uses the "null" pointers of leaf nodes to point back to their inorder successors. These temporary links are called **threads**.

### The Algorithm
While the current node is not \`null\`:
1.  **Case 1**: If the current node has **no left child**:
    - Print the current node's value.
    - Move to the right child.
2.  **Case 2**: If the current node **has a left child**:
    - Find the **Inorder Predecessor** (the rightmost node in the left subtree).
    - **If the predecessor's right pointer is \`null\`**:
        - Make it point to the current node (create a thread).
        - Move to the left child.
    - **If the predecessor's right pointer points to the current node**:
        - Reset it to \`null\` (remove the thread).
        - Print the current node's value.
        - Move to the right child.

### Why use it?
It is the ultimate space-optimized traversal. It modifies the tree temporarily during execution but leaves it in its original state upon completion.`,

  examples: [
    {
      input: '1 null 2 3',
      output: '1 3 2',
      explanation: 'Standard Inorder: Left -> Root -> Right. Morris achieves this without a stack.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 10⁵',
    '-10⁹ ≤ node.val ≤ 10⁹'
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

void morrisInorder(TreeNode* root) {
    TreeNode* curr = root;
    while (curr != NULL) {
        if (curr->left == NULL) {
            cout << curr->val << " ";
            curr = curr->right;
        } else {
            // Find the inorder predecessor
            TreeNode* pre = curr->left;
            while (pre->right != NULL && pre->right != curr) {
                pre = pre->right;
            }

            if (pre->right == NULL) {
                pre->right = curr; // Create thread
                curr = curr->left;
            } else {
                pre->right = NULL; // Remove thread
                cout << curr->val << " ";
                curr = curr->right;
            }
        }
    }
}

// Level-order builder provided
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
    morrisInorder(root);
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
    public static void morrisInorder(TreeNode root) {
        TreeNode curr = root;
        while (curr != null) {
            if (curr.left == null) {
                System.out.print(curr.val + " ");
                curr = curr.right;
            } else {
                TreeNode pre = curr.left;
                while (pre.right != null && pre.right != curr) {
                    pre = pre.right;
                }

                if (pre.right == null) {
                    pre.right = curr;
                    curr = curr.left;
                } else {
                    pre.right = null;
                    System.out.print(curr.val + " ");
                    curr = curr.right;
                }
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        // buildTree and call morrisInorder...
    }
}`
  },

  testCases: [
    { input: '1 2 3 4 5', expected: '4 2 5 1 3' },
    { input: '1 null 2 3', expected: '1 3 2' },
    { input: '10 5 15', expected: '5 10 15' }
  ]
};