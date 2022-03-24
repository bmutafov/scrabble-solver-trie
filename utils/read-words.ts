import * as fs from "fs";
import { join } from "path";
import { reverse } from "../_old/trie";
import { TrieV2 } from "../trieV2/trie.v2";
import ora from "ora";

export const Gaddag = {
  readWords: async (trie: TrieV2) => {
    const loader = ora("Reading file...").start();
    const filePath = join(__dirname, "..", "parser", "output.txt");
    const allWordsTxt = await fs.promises.readFile(filePath);
    const _rawWords = allWordsTxt.toString().split("\r\n");

    loader.text = "Importing into trie...";

    _rawWords.forEach((word) => {
      if (word.length > 1) {
        Gaddag.generateFromWord(word).forEach((w) => trie.addWord(w));
      }
    });

    loader.succeed("Tree generated");
  },
  generateFromWord: (word: string): string[] => {
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
  },
};
