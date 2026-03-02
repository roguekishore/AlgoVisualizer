/**
 * Search in a Binary Search Tree — Problem Definition
 *
 * Input format (stdin):
 * Line 1: Space-separated values representing the BST in level-order.
 * Line 2: An integer target, the value to search for.
 *
 * Output format (stdout):
 * The Level-order traversal of the subtree rooted at the target node.
 * If target is not found, output "null".
 */

module.exports = {
  id: 'search-in-bst',
  conquestId: 'stage7-04',
  title: 'Search in Binary Search Tree',
  difficulty: 'Easy',
  category: 'Binary Search Trees',
  tags: ['BST', 'Recursion', 'Binary Tree', 'Optimization'],

  description: `In a standard Binary Tree, searching takes $O(n)$ because you have to look everywhere. In a **Binary Search Tree (BST)**, we can use the "Directional Property" to find values in **$O(\log n)$** time.

### The BST Search Logic
Because every left child is smaller and every right child is larger, we never have to search both sides of the tree:
1.  **Match**: If \`root.val == target\`, we found it! Return the current node.
2.  **Too Small**: If \`target < root.val\`, the value *must* be in the **left** subtree.
3.  **Too Big**: If \`target > root.val\`, the value *must* be in the **right** subtree.
4.  **Null**: If we hit a \`null\` node, the value doesn't exist in the tree.

### Efficiency
This is effectively **Binary Search** but on a tree structure. Instead of splitting an array in half, we choose a branch, discarding half of the remaining search space with every step.

---

### Example
**Input Tree:** \`\`, **Target:** \`2\`
1. Compare 2 with root (4). $2 < 4$, move **left**.
2. Compare 2 with node (2). $2 == 2$, **Match found!**
3. Return the subtree starting at 2: \`\`.`,

  examples: [
    {
      input: '4 2 7 1 3\n2',
      output: '2 1 3',
      explanation: 'The node with value 2 is found, and its subtree is returned.'
    },
    {
      input: '4 2 7 1 3\n5',
      output: 'null',
      explanation: '5 does not exist in the BST.'
    }
  ],

  constraints: [
    'The number of nodes is in the range.',
    '1 ≤ node.val ≤ 10⁷',
    'BST contains unique values.'
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
TreeNode* searchBST(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    
    // Use the BST property: if val < root->val, go left. Else, go right.
    return NULL;
}

void printLevelOrder(TreeNode* root) {
    if (!root) { cout << "null"; return; }
    queue<TreeNode*> q;
    q.push(root);
    vector<string> res;
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            res.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        }
    }
    // Clean up trailing nulls for standard output
    while (!res.empty() && res.back() == "null") res.pop_back();
    for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");
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
    int target; cin >> target;
    TreeNode* res = searchBST(root, target);
    printLevelOrder(res);
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
    public static TreeNode searchBST(TreeNode root, int val) {
        if (root == null || root.val == val) return root;
        // Your logic here
        return null;
    }

    public static void printLevelOrder(TreeNode root) {
        if (root == null) { System.out.print("null"); return; }
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        List<String> result = new ArrayList<>();
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node != null) {
                result.add(String.valueOf(node.val));
                q.add(node.left);
                q.add(node.right);
            }
        }
        System.out.print(String.join(" ", result));
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
        int target = sc.nextInt();
        TreeNode root = buildTree(line.split("\\\\s+"));
        TreeNode res = searchBST(root, target);
        printLevelOrder(res);
    }
}`
  },

  testCases: [
    { input: '4 2 7 1 3\n2', expected: '2 1 3' },
    { input: '18 2 22 null null null 63\n22', expected: '22 63' },
    { input: '4 2 7 1 3\n5', expected: 'null' }
  ]
};