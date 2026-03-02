/**
 * Insert into a Binary Search Tree — Problem Definition
 *
 * Input format (stdin):
 * Line 1: Space-separated values representing the initial BST in level-order.
 * Line 2: An integer val, the value to insert.
 *
 * Output format (stdout):
 * The In-order traversal of the BST after insertion.
 */

module.exports = {
  id: 'insert-into-bst',
  conquestId: 'stage7-03',
  title: 'Insert in Binary Search Tree',
  difficulty: 'Medium',
  category: 'Binary Search Trees',
  tags: ['BST', 'Recursion', 'Binary Tree'],

  description: `In a **Binary Search Tree (BST)**, every node follows a strict ordering rule:
1. The **left** subtree contains only values **less than** the node's value.
2. The **right** subtree contains only values **greater than** the node's value.

This property makes searching, insertion, and deletion highly efficient ($O(\log n)$ on average).

### The Insertion Algorithm
To insert a value while maintaining the BST property, we follow the "search path":
1.  **Base Case**: If we reach a \`null\` spot, we've found the correct location. Create and return a new \`TreeNode(val)\`.
2.  **Go Left**: If \`val < root.val\`, recursively call insert on the **left** child.
3.  **Go Right**: If \`val > root.val\`, recursively call insert on the **right** child.
4.  **Return**: Always return the (potentially updated) \`root\`.

### Time Complexity
- **Average Case**: $O(\log n)$ if the tree is balanced.
- **Worst Case**: $O(h)$ where $h$ is height. If the tree is a "skewed" line, this becomes $O(n)$.

---

### Example
**Input Tree:** \`4 2 7 1 3\`
**Insert:** \`5\`

**Logic:**
- 5 is > 4, go right to node 7.
- 5 is < 7, go left to \`null\`.
- Insert 5 as the left child of 7.

**Final Tree (In-order):** \`1 2 3 4 5 7\``,

  examples: [
    {
      input: '4 2 7 1 3\n5',
      output: '1 2 3 4 5 7',
      explanation: '5 is placed as the left child of 7.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 10⁴',
    '-10⁸ ≤ node.val, val ≤ 10⁸',
    'All values in the original BST are unique.',
    'val does not exist in the original BST.'
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

// --- Implement this function ---
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    
    // Your logic here
    
    return root;
}

void inOrder(TreeNode* root) {
    if (!root) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}

TreeNode* buildTree(string input) {
    if (input.empty() || input == "null") return NULL;
    stringstream ss(input);
    string item;
    ss >> item;
    TreeNode* root = new TreeNode(stoi(item));
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (!(ss >> item)) break;
        if (item != "null") {
            curr->left = new TreeNode(stoi(item));
            q.push(curr->left);
        }
        if (!(ss >> item)) break;
        if (item != "null") {
            curr->right = new TreeNode(stoi(item));
            q.push(curr->right);
        }
    }
    return root;
}

int main() {
    string line;
    getline(cin, line);
    TreeNode* root = buildTree(line);
    int val;
    cin >> val;
    root = insertIntoBST(root, val);
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
    // --- Implement this method ---
    public static TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        
        // Your logic here
        
        return root;
    }

    public static void inOrder(TreeNode root) {
        if (root == null) return;
        inOrder(root.left);
        System.out.print(root.val + " ");
        inOrder(root.right);
    }

    public static TreeNode buildTree(String[] nodes) {
        if (nodes.length == 0 || nodes.equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(nodes));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < nodes.length) {
            TreeNode curr = q.poll();
            if (i < nodes.length && !nodes[i].equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.left);
            }
            i++;
            if (i < nodes.length && !nodes[i].equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine();
        int val = sc.nextInt();
        TreeNode root = buildTree(line.split("\\\\s+"));
        root = insertIntoBST(root, val);
        inOrder(root);
    }
}`
  },

  testCases: [
    { input: '4 2 7 1 3\n5', expected: '1 2 3 4 5 7' },
    { input: '40 20 60 10 30 50 70\n25', expected: '10 20 25 30 40 50 60 70' },
    { input: 'null\n5', expected: '5' }
  ]
};