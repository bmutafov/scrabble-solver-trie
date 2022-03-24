import { memoryUsage } from "./memory-usage";
import * as fs from "fs";
import { join } from "path";
import { reverse } from "../_old/trie";
import { TrieV2 } from "../trieV2/trie.v2";
import ora from "ora";
import readline from "readline";
import events from "events";

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
  readWordsLineByLine: async (trie: TrieV2) => {
    const filePath = join(__dirname, "..", "parser", "output.txt");
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    rl.on("line", (word) => {
      if (word.length < 15 && word.length > 1) {
        // trie.addWord(word);
        Gaddag.generateFromWord(word).forEach((w) => trie.addWord(w));
      }
    });
    await events.once(rl, "close");
  },
  checkDictionaryFromFile: async (trie: TrieV2) => {
    const filePath = join(__dirname, "..", "parser", "output.txt");
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    rl.on("line", (word) => {
      if (word.length < 15 && word.length > 1) {
        const hasWord = trie.searchWord(word);
        if (!hasWord) console.log("Word not found: " + word);
      }
    });
    await events.once(rl, "close");
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
