import { reverse } from "../utils/reverse";

class TrieNode {
  public data: string;
  public edges: Map<string, TrieNode> = new Map();
  public isTerminator = false;

  constructor(data: string) {
    this.data = data;
  }
}

export class TrieV2 {
  public readonly _ROOT: TrieNode = new TrieNode("");

  /**
   * Adds a new word to the dictionary
   * @param word A word to be added
   */
  addWord(word: string): void {
    let node = this._ROOT;
    const letters = this.getLetters(word);

    for (const letter of letters) {
      // Search for existing next node with the given letter
      const nextNode = node.edges.get(letter);
      if (nextNode) {
        node = nextNode;
      } else {
        const newNode = new TrieNode(letter);
        node.edges.set(letter, newNode);
        node = newNode;
      }
    }

    // Mark the last node as terminator
    node.isTerminator = true;
  }

  /**
   * Checks the dictionary if a word is valid or not
   * @param word The word to be checked
   * @returns If the word is valid or not
   */
  searchWord(word: string): boolean {
    let node = this._ROOT;
    const letters = this.getLetters(reverse(word));

    for (const letter of letters) {
      const letterNode = node.edges.get(letter);
      if (letterNode) node = letterNode;
      else return false;
    }

    return node.isTerminator;
  }

  startsWith(prefix: string, depth?: number): string[] {
    if (depth && prefix.length >= depth)
      throw new Error("depth must be higher than the prefix length");

    const wordsArray: string[] = [];

    const plusNode = this.getStartsWithPlusNode(prefix);
    if (!plusNode) return [];

    this.startsWithIterator(prefix, plusNode, wordsArray, depth);
    return wordsArray;
  }

  private getStartsWithPlusNode(prefix: string): TrieNode | null {
    const prefixLetters = this.getLetters(reverse(prefix));
    let node = this._ROOT;
    for (const letter of prefixLetters) {
      if (node.edges.has(letter)) {
        node = node.edges.get(letter)!;
      } else {
        return null;
      }
    }

    const plusNode = node.edges.get("+");
    if (!plusNode) return null;

    return plusNode;
  }

  private startsWithIterator(
    path: string,
    node: TrieNode,
    wordsArray: string[],
    depth?: number
  ): void {
    if (depth && path.length === depth) return;
    const nextPath = path + (node.data !== "+" ? node.data : "");

    if (node.isTerminator) {
      wordsArray.push(nextPath);
    }

    node.edges.forEach((value) => {
      this.startsWithIterator(nextPath, value, wordsArray, depth);
    });
  }

  endsWith(suffix: string, depth?: number): string[] {
    if (depth && suffix.length >= depth)
      throw new Error("depth must be higher than the suffix length");

    const wordsArray: string[] = [];
    const prefixLetters = this.getLetters(reverse(suffix));

    let node = this._ROOT;
    for (const letter of prefixLetters) {
      if (node.edges.has(letter)) {
        node = node.edges.get(letter)!;
      } else {
        return [];
      }
    }

    this.endsWithIterator(
      suffix.substring(1, suffix.length),
      node,
      wordsArray,
      depth
    );
    return wordsArray;
  }

  private endsWithIterator(
    path: string,
    node: TrieNode,
    wordsArray: string[],
    depth?: number
  ): void {
    if (node.data === "+") return;
    if (depth && path.length >= depth) return;

    const nextPath = node.data + path;
    if (node.isTerminator) {
      wordsArray.push(nextPath);
    }

    node.edges.forEach((value) => {
      this.endsWithIterator(nextPath, value, wordsArray, depth);
    });
  }

  contains(word: string): string[] {
    const wordsArray: string[] = [];
    const prefixLetters = this.getLetters(reverse(word));

    let node = this._ROOT;
    for (const letter of prefixLetters) {
      if (node.edges.has(letter)) {
        node = node.edges.get(letter)!;
      } else {
        return [];
      }
    }

    this.containsIterator(
      reverse(word.substring(1, word.length)),
      node,
      wordsArray
    );
    return wordsArray;
  }

  private containsIterator(path: string, node: TrieNode, wordsArray: string[]) {
    const nextPath = path + node.data;

    if (node.isTerminator) {
      wordsArray.push(this.ungaddagWord(nextPath));
    }

    node.edges.forEach((value) => {
      this.containsIterator(nextPath, value, wordsArray);
    });
  }

  finishWithHand(prefix: string, letters: string[]): string[] {
    const wordsArray: Set<string> = new Set();
    const plusNode = this.getStartsWithPlusNode(prefix);
    if (!plusNode) return [];
    this.finishWithHandIterator(reverse(prefix), plusNode, letters, wordsArray);
    return [...wordsArray];
  }

  private finishWithHandIterator(
    path: string,
    node: TrieNode,
    letters: string[],
    wordsArray: Set<string>
  ): void {
    if (node.isTerminator) {
      const word = this.ungaddagWord(path + node.data);
      wordsArray.add(word);
    }

    if (letters.length === 0 || node.edges.size === 0) return;

    const nodesOfLetters = letters.reduce((acc, curr) => {
      if (node.edges.has(curr)) {
        acc.push(node.edges.get(curr)!);
      }
      return acc;
    }, [] as TrieNode[]);

    nodesOfLetters.forEach((childNode) => {
      const letterIndex = letters.indexOf(childNode.data);
      const lettersWithoutUsed = letters.filter((_, i) => i !== letterIndex);

      this.finishWithHandIterator(
        path + node.data,
        childNode,
        lettersWithoutUsed,
        wordsArray
      );
    });
  }

  size() {
    return this.sizeIterator(this._ROOT);
  }

  private sizeIterator(node: TrieNode): number {
    if (node.edges.size === 0) return 1;
    const values = [...node.edges.values()];

    return 1 + values.reduce((sum, curr) => sum + this.sizeIterator(curr), 0);
  }

  dictionarySize() {
    return this.dictionarySizeIterator(this._ROOT);
  }

  private dictionarySizeIterator(node: TrieNode) {
    const values = [...node.edges.values()];
    if (node.isTerminator) {
      return (
        1 +
        values.reduce((sum, curr) => sum + this.dictionarySizeIterator(curr), 0)
      );
    }

    return values.reduce(
      (sum, curr) => sum + this.dictionarySizeIterator(curr),
      0
    );
  }

  //#region private-helpers
  private getLetters(word: string): string[] {
    return word.split("");
  }

  private ungaddagWord(word: string): string {
    const [prefix, suffix] = word.split("+");
    return `${reverse(prefix)}${suffix || ""}`;
  }
  //#endregion
}
