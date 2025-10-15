
class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let currentNode = this.root;
    for (const char of word.toLowerCase()) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode());
      }
      currentNode = currentNode.children.get(char)!;
    }
    currentNode.isEndOfWord = true;
  }
  
  clear(): void {
    this.root = new TrieNode();
  }

  private findNode(prefix: string): TrieNode | null {
    let currentNode = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!currentNode.children.has(char)) {
        return null;
      }
      currentNode = currentNode.children.get(char)!;
    }
    return currentNode;
  }

  private findAllWords(node: TrieNode, prefix: string): string[] {
    const suggestions: string[] = [];
    if (node.isEndOfWord) {
      suggestions.push(prefix);
    }

    for (const [char, childNode] of node.children.entries()) {
      suggestions.push(...this.findAllWords(childNode, prefix + char));
    }
    return suggestions;
  }

  findSuggestions(prefix: string): string[] {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }
    return this.findAllWords(node, prefix);
  }
}
