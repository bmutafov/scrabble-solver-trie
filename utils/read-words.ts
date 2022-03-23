import * as fs from "fs";
import { join } from "path";
import { Trie } from "../trie";

export async function readWords(trie: Trie) {
  const filePath = join(__dirname, "..", "parser", "output.txt");
  const allWordsTxt = await fs.promises.readFile(filePath);
  const _rawWords = allWordsTxt.toString().split("\r\n");

  console.log("reading words file...");
  _rawWords.forEach((word) => {
    if (word.length > 1) {
      trie.addWord(word);
    }
  });
}
