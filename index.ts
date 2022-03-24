import { memoryUsage } from "./utils/memory-usage";
import { TrieV2 } from "./trieV2/trie.v2";
import { Gaddag } from "./utils/read-words";

const trie = new TrieV2();

async function run() {
  await Gaddag.readWords(trie);
  const starts = trie.startsWith("а", 2);
  const ends = trie.endsWith("р", 2);
  console.log(starts);
  console.log(ends);
  memoryUsage();
}

run();
