/**
 * Search in a Binary Tree — Problem Definition
 *
 * Input format (stdin):
 * Line 1: Space-separated values representing the level-order traversal of the tree.
 * Line 2: An integer target, the value to search for.
 *
 * Output format (stdout):
 * "true" if the target exists in the tree, "false" otherwise.
 */

module.exports = {
  id: 'search-binary-tree',
  conquestId: 'stage7-02',
  title: 'Search in Binary Tree',
  difficulty: 'Easy',
  category: 'Binary Trees',
  tags: ['Tree', 'Recursion', 'DFS', 'BFS'],

  description: `Searching is one of the most fundamental operations in a tree. Unlike a **Binary Search Tree (BST)**, where we know which branch to take based on the value, a standard **Binary Tree** is unsorted.

To find a value in an unsorted Binary Tree, we must visit the nodes until we find a match or exhaust the tree.

### The Recursive Approach (DFS)
The logic is elegantly simple:
1.  **Base Case 1**: If the current node is \`null\`, the value isn't here. Return \`false\`.
2.  **Base Case 2**: If the current node's value equals the target, return \`true\`.
3.  **Recursive Step**: Search the **left** subtree OR search the **right** subtree. If either returns \`true\`, the value exists in the tree.

### Time & Space Complexity
- **Time**: $O(n)$ in the worst case, as we might need to visit every node.
- **Space**: $O(h)$, where $h$ is the height of the tree, due to the recursion stack.

### Task
Implement a function to determine if a target value exists within the provided binary tree.`,

  examples: [
    {
      input: '1 2 3 null null 4 5\n4',
      output: 'true',
      explanation: '4 is the left child of 3.'
    },
    {
      input: '1 2 3\n10',
      output: 'false',
      explanation: '10 is not present in the tree.'
    }
  ],

  constraints: [
    'Number of nodes ≤ 5000',
    '-10⁹ ≤ node.val, target ≤ 10⁹'
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
bool search(TreeNode* root, int target) {
    if (!root) return false;
    // Your code here
    return false;
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
    int target;
    cin >> target;
    cout << (search(root, target) ? "true" : "false") << endl;
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
    public static boolean search(TreeNode root, int target) {
        if (root == null) return false;
        // Your code here
        return false;
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
        System.out.println(search(root, target));
    }
}`
  },

  testCases: [
    { input: '1 2 3 null null 4 5\n4', expected: 'true' },
    { input: '1 2 3\n5', expected: 'false' },
    { input: '10 20 30 40 50\n50', expected: 'true' },
    { input: '5\n5', expected: 'true' }
  ]
};