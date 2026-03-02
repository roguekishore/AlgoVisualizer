/**
 * AVL Tree Visualizer — Implementation
 * * An AVL tree maintains a "Balance Factor" for every node.
 * Balance Factor = Height(Left Subtree) - Height(Right Subtree)
 * If |Balance Factor| > 1, a rotation is triggered.
 */

module.exports = {
  id: 'avl-tree-visualizer',
  conquestId: 'stage7-10',
  title: 'AVL Tree Visualizer',
  difficulty: 'Hard',
  category: 'Advanced Trees',
  tags: ['Tree', 'AVL', 'Self-Balancing', 'Recursion'],

  description: `Standard BSTs can become "skewed" (like a linked list) if we insert numbers in order (1, 2, 3, 4). This ruins our $O(\log n)$ performance. 

**AVL Trees** fix this by ensuring the height difference between left and right subtrees is never more than 1.

### The Four Rotations
1. **Left-Left (LL)**: Right Rotation
2. **Right-Right (RR)**: Left Rotation
3. **Left-Right (LR)**: Left Rotate child, then Right Rotate parent.
4. **Right-Left (RL)**: Right Rotate child, then Left Rotate parent.`,

  boilerplate: {
    cpp: `#include <iostream>
#include <algorithm>
#include <vector>

using namespace std;

struct Node {
    int key;
    Node *left, *right;
    int height;
    Node(int k) : key(k), left(nullptr), right(nullptr), height(1) {}
};

int getHeight(Node* n) { return n ? n->height : 0; }
int getBalance(Node* n) { return n ? getHeight(n->left) - getHeight(n->right) : 0; }

Node* rightRotate(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
    return x;
}

Node* leftRotate(Node* x) {
    Node* y = x->right;
    Node* T2 = y->left;
    y->left = x;
    x->right = T2;
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    return y;
}

Node* insert(Node* node, int key) {
    if (!node) return new Node(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    else return node;

    node->height = 1 + max(getHeight(node->left), getHeight(node->right));
    int balance = getBalance(node);

    // Left Left Case
    if (balance > 1 && key < node->left->key) return rightRotate(node);
    // Right Right Case
    if (balance < -1 && key > node->right->key) return leftRotate(node);
    // Left Right Case
    if (balance > 1 && key > node->left->key) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    // Right Left Case
    if (balance < -1 && key < node->right->key) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    return node;
}

// The Visualizer Logic
void visualize(Node* root, string indent, bool last) {
    if (root != nullptr) {
        cout << indent;
        if (last) {
            cout << "R----";
            indent += "     ";
        } else {
            cout << "L----";
            indent += "|    ";
        }
        cout << root->key << " (h:" << root->height << ")" << endl;
        visualize(root->left, indent, false);
        visualize(root->right, indent, true);
    }
}

int main() {
    Node* root = nullptr;
    vector<int> keys = {10, 20, 30, 40, 50, 25};
    
    for (int k : keys) {
        cout << "\\nInserting " << k << "..." << endl;
        root = insert(root, k);
        visualize(root, "", true);
    }
    return 0;
}`
  }
};