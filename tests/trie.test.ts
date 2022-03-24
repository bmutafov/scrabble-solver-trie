import { expect } from "chai";
import { TrieV2 } from "../trieV2/trie.v2";
import { Gaddag } from "../utils/read-words";

describe("Gaddag", function () {
  describe("generate gaddag from word", function () {
    it("should find a word after its added", function () {
      const gaddags = Gaddag.generateFromWord("explain");
      expect(gaddags).deep.equal([
        "nialpxe",
        "e+xplain",
        "xe+plain",
        "pxe+lain",
        "lpxe+ain",
        "alpxe+in",
        "ialpxe+n",
      ]);
    });
  });
});

describe("Trie", () => {
  const getTestTrie = (): TrieV2 => {
    const trie = new TrieV2();
    const testWords = Gaddag.generateFromWord("test");
    testWords.forEach((word) => trie.addWord(word));
    return trie;
  };

  it("should be empty before initialization", () => {
    const trie = new TrieV2();
    expect(trie._ROOT.edges).length(0);
  });

  it("should add and read a word successfully", () => {
    const trie = getTestTrie();
    expect(trie.searchWord("test")).equals(true);
    expect(trie.searchWord("testa")).equals(false);
    expect(trie.searchWord("tesst")).equals(false);
    expect(trie.searchWord("tset")).equals(false);
  });

  it("should return all words starting with a given prefix", () => {
    const trie = getTestTrie();
    expect(trie.startsWith("te")).length(1);
    expect(trie.startsWith("te")).deep.equal(["test"]);
    Gaddag.generateFromWord("tesseract").forEach((word) => trie.addWord(word));
    expect(trie.startsWith("te")).deep.equal(["test", "tesseract"]);
    expect(trie.startsWith("te")).length(2);
  });

  it("should return all words ending with a given suffix", () => {
    const trie = getTestTrie();
    expect(trie.endsWith("st")).length(1);
    expect(trie.endsWith("st")).deep.equal(["test"]);
    Gaddag.generateFromWord("pedest").forEach((word) => trie.addWord(word));
    expect(trie.endsWith("st")).length(2);
  });

  it("should return all words containing a string", () => {
    const trie = getTestTrie();
    Gaddag.generateFromWord("tesseract").forEach((word) => trie.addWord(word));
    expect(trie.contains("es")).length(2);
    expect(trie.contains("es")).deep.eq(["test", "tesseract"]);
  });
});
