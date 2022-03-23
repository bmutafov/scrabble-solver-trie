import * as fs from "fs";
import { reverse, Trie } from "./_old/trie";
import { TrieV2 } from "./trieV2/trie.v2";
import { readWords, readWords_Gaddag } from "./utils/read-words";

const trie = new TrieV2();

const snooze = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(0), ms));

async function run() {
  readWords_Gaddag(trie);
  const starts = trie.endsWith("енис");
  console.log(starts);
}

run();
