/**
 * Construct Binary Tree from Preorder and Inorder Traversal — Problem Definition
 *
 * Input format (stdin):
 * Line 1: n space-separated integers (Pre-order traversal).
 * Line 2: n space-separated integers (In-order traversal).
 *
 * Output format (stdout):
 * The Level-order traversal of the reconstructed tree.
 */

module.exports = {
  id: 'construct-tree-pre-in',
  conquestId: 'stage7-05',
  title: 'Construct Tree from Preorder and Inorder',
  difficulty: 'Hard',
  category: 'Binary Trees',
  tags: ['Tree', 'Recursion', 'DFS', 'Hash Map'],

  description: `Can you recreate a tree if you only have the lists of how it was visited? 

To uniquely reconstruct a binary tree, a single traversal isn't enough. However, the combination of **Pre-order** and **In-order** gives us everything we need.

### The Logic
1.  **Pre-order** ($Root \rightarrow Left \rightarrow Right$): The first element is **always the root** of the current (sub)tree.
2.  **In-order** ($Left \rightarrow Root \rightarrow Right$): Once we know the root from the Pre-order list, we find it in the In-order list.
    - Everything to the **left** of the root in the In-order list belongs to the **Left Subtree**.
    - Everything to the **right** belongs to the **Right Subtree**.

### The Recursive Recipe
- **Step 1**: Pick the first element from Pre-order as the root.
- **Step 2**: Find its index in the In-order array (using a Hash Map for $O(1)$ lookup).
- **Step 3**: Split the In-order array into left and right parts.
- **Step 4**: Recursively repeat for the left and right subtrees.

### Complexity
- **Time**: $O(n)$ with a Hash Map lookup.
- **Space**: $O(n)$ to store the tree and the map.

---

### Example
**Pre-order:** \`\`
**In-order:** \`\`

1. **3** is the root.
2. In In-order, **9** is left of 3; **15, 20, 7** are right of 3.
3. Left child of 3 is a tree made from Pre: \`\` and In: \`\`.
4. Right child of 3 is a tree made from Pre: \`\` and In: \`\`.`,

  examples: [
    {
      input: '3 9 20 15 7\n9 3 15 20 7',
      output: '3 9 20 null null 15 7',
      explanation: 'Reconstructs the tree where 3 is root, 9 is left, and 20 is right (with children 15, 7).'
    }
  ],

  constraints: [
    '1 ≤ n ≤ 3000',
    '-3000 ≤ val ≤ 3000',
    'All values are unique.'
  ],

  boilerplate: {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>
#include <string>
#include <sstream>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

unordered_map<int, int> inMap;
int preIdx = 0;

TreeNode* build(vector<int>& preorder, int left, int right) {
    if (left > right) return NULL;

    int rootVal = preorder[preIdx++];
    TreeNode* root = new TreeNode(rootVal);

    int mid = inMap[rootVal];
    root->left = build(preorder, left, mid - 1);
    root->right = build(preorder, mid + 1, right);

    return root;
}

void printLevelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    vector<string> out;
    while(!q.empty()){
        TreeNode* curr = q.front(); q.pop();
        if(curr){
            out.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            out.push_back("null");
        }
    }
    while(!out.empty() && out.back() == "null") out.pop_back();
    for(int i=0; i<out.size(); ++i) cout << out[i] << (i == out.size()-1 ? "" : " ");
}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    
    stringstream ss1(line1), ss2(line2);
    vector<int> preorder, inorder;
    int val;
    while(ss1 >> val) preorder.push_back(val);
    while(ss2 >> val) inorder.push_back(val);

    for(int i=0; i<inorder.size(); ++i) inMap[inorder[i]] = i;
    
    TreeNode* root = build(preorder, 0, inorder.size() - 1);
    printLevelOrder(root);
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
    int preIdx = 0;
    Map<Integer, Integer> inMap = new HashMap<>();

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);
        return helper(preorder, 0, inorder.length - 1);
    }

    private TreeNode helper(int[] preorder, int left, int right) {
        if (left > right) return null;
        int rootVal = preorder[preIdx++];
        TreeNode root = new TreeNode(rootVal);
        int mid = inMap.get(rootVal);
        root.left = helper(preorder, left, mid - 1);
        root.right = helper(preorder, mid + 1, right);
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] preStr = sc.nextLine().split("\\\\s+");
        String[] inStr = sc.nextLine().split("\\\\s+");
        
        int[] preorder = Arrays.stream(preStr).mapToInt(Integer::parseInt).toArray();
        int[] inorder = Arrays.stream(inStr).mapToInt(Integer::parseInt).toArray();

        Main solver = new Main();
        TreeNode root = solver.buildTree(preorder, inorder);
        // Level order print logic...
    }
}`
  },

  testCases: [
    { input: '3 9 20 15 7\n9 3 15 20 7', expected: '3 9 20 null null 15 7' },
    { input: '-1\n-1', expected: '-1' }
  ]
};