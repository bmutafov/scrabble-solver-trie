import * as fs from "fs";
import { join } from "path";
import { reverse, Trie } from "../_old/trie";
import { TrieV2 } from "../trieV2/trie.v2";

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

export function readWords_Gaddag(trie: TrieV2) {
  const filePath = join(__dirname, "..", "parser", "output.txt");
  const allWordsTxt = fs.readFileSync(filePath);
  const _rawWords = allWordsTxt.toString().split("\r\n");

  console.log("reading words file...");
  _rawWords.forEach((word) => {
    if (word.length > 1) {
      generateGaddagWords(word).forEach((w) => trie.addWord(w));
    }
  });
}

export function generateGaddagWords(word: string): string[] {
  const letters = word.split("");

  const gaddagWords: string[] = [reverse(word)];
  for (let i = 1; i <= letters.length; i++) {
    const prefix = reverse(word.substring(0, i));
    const suffix = word.substring(i, word.length);
    if (i < letters.length) {
      gaddagWords.push(`${prefix}+${suffix}`);
    }
  }

  return gaddagWords;
}
