import { memoryUsage } from "./utils/memory-usage";
import { TrieV2 } from "./trieV2/trie.v2";
import { Gaddag } from "./utils/read-words";

let trie: TrieV2 = new TrieV2();

async function run() {
  if (!trie) return;
  await Gaddag.readWordsLineByLine(trie);
  console.time("suggest");
  const res = trie.suggest(
    "ах",
    [],
    ["аеим", "дзйрстх"],
    ["иадахвяойодйаовндоандлвиахдуиахдуи9а"]
  );
  console.log(res);
  console.timeEnd("suggest");

  memoryUsage();
}

run();
