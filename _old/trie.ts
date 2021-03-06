type TrieSize = {
  validWords: number;
  nodes: number;
};

class WordNotFoundException extends Error {}

export function reverse(s: string): string {
  return [...s].reverse().join("");
}

class TrieNode {
  public letter: string;
  public children: Map<string, TrieNode> = new Map();
  public isFinal = false;

  constructor(letter: string) {
    this.letter = letter;
  }
}

class Trie {
  public readonly root: TrieNode = new TrieNode("");
  private readonly _size: TrieSize = { validWords: 0, nodes: 0 };

  get size() {
    return this._size;
  }

  /**
   * Adds a new word to the dictionary
   * @param word A word to be added
   */
  addWord(word: string) {
    let node = this.root;
    const letters = word.split("");
    this._size.validWords += 1;

    for (const letter of letters) {
      if (node.children.has(letter)) {
        node = node.children.get(letter)!;
      } else {
        const newNode = new TrieNode(letter);
        this._size.nodes += 1;
        node.children.set(letter, newNode);
        node = newNode;
      }
    }
    node.isFinal = true;
  }

  /**
   * Checks the dictionary if a word is valid or not
   * @param word The word to be checked
   * @returns If the word is valid or not
   */
  searchWord(word: string): boolean {
    let node = this.root;
    const letters = word.split("");

    for (const letter of letters) {
      const letterNode = node.children.get(letter);
      if (letterNode) node = letterNode;
      else return false;
    }

    return node.isFinal;
  }

  /**
   * Returns all the words that start with a set prefix
   * @param prefix The prefix to be matched
   * @param maxDepth Maximum search depth
   * @param existingLetters An array of existing letters on certain positions
   * @returns List of possible words
   */
  startsWith(
    prefix: string,
    maxDepth?: number | null,
    existingLetters?: string[][]
  ) {
    let node = this.root;
    const prefixLetters = prefix.split("");

    for (const letter of prefixLetters) {
      if (node.children.has(letter)) {
        node = node.children.get(letter)!;
      } else {
        return [];
      }
    }

    const initialDepth = prefix.length;
    return this.getNodesUntilFinal(
      prefix.substring(0, prefix.length - 1),
      node,
      initialDepth,
      maxDepth ? maxDepth + 1 : 15,
      existingLetters
    ).flat();
  }

  /**
   * Returns all the words that start with a set prefix
   * @param prefix The prefix to be matched
   * @param maxDepth Maximum search depth
   * @param existingLetters An array of existing letters on certain positions
   * @returns List of possible words
   */
  endsWith(
    _prefix: string,
    maxDepth?: number | null,
    existingLetters?: string[][]
  ) {
    let node = this.root;
    const prefix = ">" + _prefix;
    const prefixLetters = prefix.split("");

    for (const letter of prefixLetters) {
      if (node.children.has(letter)) {
        node = node.children.get(letter)!;
      } else {
        return [];
      }
    }

    const initialDepth = prefix.length;
    return this.getNodesUntilFinal(
      prefix.substring(0, prefix.length - 1),
      node,
      initialDepth,
      maxDepth ? maxDepth + 1 : 15,
      existingLetters
    ).flat();
  }

  pattern(pattern: string) {
    const existingLetters = pattern
      .split("")
      .map((l) => (l === "*" ? [] : [l]));

    return this.startsWith("", pattern.length, existingLetters).filter(
      (w) => w.length === pattern.length
    );
  }

  singleLetterSearch(pattern: string) {
    const patternLetters = pattern.split("");

    if (patternLetters.filter((l) => l === "*").length !== 1)
      throw new Error("Only one asterix(*) per pattern!");

    const asterixIndex = pattern.indexOf("*");

    const existingLetters = patternLetters.map((l) => (l === "*" ? [] : [l]));
    return this.startsWith("", pattern.length, existingLetters)
      .filter((w) => w.length === pattern.length)
      .map((w) => w.charAt(asterixIndex));
  }

  /**
   * Iterates through all nodes and builds all valid words, until a termination is reached
   * @param prefix Prefix which we have so far in the iterations
   * @param node The current node we are checking
   * @param currentDepth The current depth of the node
   * @param maxDepth The maximum depth of the search
   * @param existingLetters Array of letters on specific places
   * @returns
   */
  private getNodesUntilFinal(
    prefix: string,
    node: TrieNode,
    currentDepth: number,
    maxDepth: number,
    existingLetters?: string[][]
  ): string[] {
    /**
     * Returns recursively all words that can be made from the children of the current node
     */
    const getChildrenWords = () => {
      /** Get the current letter which MUST be matched, or null */
      const currentLetters =
        existingLetters && existingLetters[currentDepth]?.length > 0
          ? existingLetters[currentDepth]
          : null;
      /** Create iteratable array of the children values */
      let searchableNodes = [...node.children.values()];
      /** If we MUST match a letter in this position, filter the nodes to match only this letter */
      if (currentLetters) {
        searchableNodes = searchableNodes.filter((node) =>
          currentLetters.includes(node.letter)
        );
      }

      /** Call the function recursively to find all children words */
      return searchableNodes.flatMap((value) => {
        return this.getNodesUntilFinal(
          prefix + node.letter,
          value,
          currentDepth + 1,
          maxDepth,
          existingLetters
        );
      });
    };

    /** If we have reached maximum depth return an empty array (no more words on this path) */
    if (currentDepth === maxDepth) return [];

    /**
     * If the word is marked as a valid word and has no more children, return the word
     * (prefix - previous letters, node.letter - current letter)
     * */
    if (node.isFinal && node.children.size === 0) return [prefix + node.letter];
    /** If the word is marked as valid, but has more children, return the word
     * plus all the children words
     */
    if (node.isFinal) {
      return [prefix + node.letter, ...getChildrenWords()];
    }

    /** If we are on a non-valid word which has more children, continue recursively */
    return getChildrenWords();
  }
}

export class TwoWayTrie {
  private readonly forwardTrie = new Trie();
  private readonly backwardTrie = new Trie();

  addWord(word: string): void {
    this.forwardTrie.addWord(word);
    this.backwardTrie.addWord(reverse(word));
  }

  searchWord(word: string): boolean {
    return this.forwardTrie.searchWord(word);
  }

  startsWith(
    prefix: string,
    maxDepth?: number | null,
    existingLetters?: string[][]
  ) {
    return this.forwardTrie.startsWith(prefix, maxDepth, existingLetters);
  }

  endsWith(
    prefix: string,
    maxDepth?: number | null,
    existingLetters?: string[][]
  ) {
    const fullExistingLetters = existingLetters?.length
      ? Array.from({ length: maxDepth || 15 })
          .fill([])
          .map((_, i) => existingLetters?.[i] || _)
          .reverse()
      : undefined;

    return this.backwardTrie
      .startsWith(reverse(prefix), maxDepth, fullExistingLetters)
      .map(reverse);
  }
}
