import { expect } from "chai";
import { Trie } from "../trie";

describe("Trie", function () {
  describe("dictionary", function () {
    it("should find a word after its added", function () {
      const trie = new Trie();
      expect(trie.searchWord("test")).equal(false);
      trie.addWord("test");
      expect(trie.searchWord("test")).equal(true);
    });

    it("should not find a non-existant word", () => {
      const trie = new Trie();
      trie.addWord("test");
      trie.addWord("random");
      expect(trie.searchWord("randomized")).equal(false);
      expect(trie.searchWord("rando")).equal(false);
      expect(trie.searchWord("tesut")).equal(false);
      expect(trie.searchWord("testt")).equal(false);
    });
  });

  describe("startsWith", function () {
    it("should suggest words starting with prefix", function () {
      const trie = new Trie();
      trie.addWord("test");
      expect(trie.startsWith("te")).includes("test");
    });

    it("should return empty array if no words are found", function () {
      const trie = new Trie();
      trie.addWord("test");
      expect(trie.startsWith("pe")).length(0);
    });

    it("should take maxDepth into account", () => {
      const trie = new Trie();
      ["test", "test1", "test12", "test123", "test1234", "test12345"].forEach(
        (word) => trie.addWord(word)
      );
      expect(trie.startsWith("test", 5)).length(2);
      expect(trie.startsWith("test", 6)).length(3);
      trie.addWord("tester");
      expect(trie.startsWith("test", 6)).length(4);
    });

    it("should take existing array of letters into account", () => {
      const trie = new Trie();
      ["test", "test1", "test12", "test21", "test213", "test312"].forEach(
        (word) => trie.addWord(word)
      );
      const emptyArrays = Array.from({ length: 4 }).fill([]) as string[][];
      const existingLetters = [...emptyArrays, ["1"]];

      expect(trie.startsWith("test", null, existingLetters)).length(3);
    });
  });
});
