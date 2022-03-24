import { memoryUsage } from "./utils/memory-usage";
import { TrieV2 } from "./trieV2/trie.v2";
import { Gaddag } from "./utils/read-words";

let trie: TrieV2 = new TrieV2();

async function run() {
  if (!trie) return;
  await Gaddag.readWordsLineByLine(trie);
  // Gaddag.generateFromWord("пенис").forEach((word) => trie?.addWord(word));
  // const starts = trie.startsWith("а", 2);
  // const ends = trie.endsWith("р", 2);
  console.log("search1:", trie.searchWord("пенис"));
  console.log("search2:", trie.searchWord("тиква"));
  console.log("search3:", trie.searchWord("охлюв"));
  console.log("search4:", trie.searchWord("лвовмост"));
  console.log("check1:", trie.endsWith("енис"));
  console.log("size: " + trie.size());
  console.log("dictionary size: " + trie.dictionarySize());
  // await Gaddag.checkDictionaryFromFile(trie);
  memoryUsage();
}

run();

setTimeout(() => {
  trie.searchWord("устат");
  memoryUsage();
}, 25000);
