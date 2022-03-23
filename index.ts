import * as fs from "fs";
import { Trie } from "./trie";

const trie = new Trie();

async function readWords() {
  const allWordsTxt = await fs.promises.readFile("./parser/output.txt");
  const _rawWords = allWordsTxt.toString().split("\r\n");

  _rawWords.forEach((word) => {
    if (word.length > 1) {
      trie.addWord(word);
    }
  });
  trie.addWord("ван");
}

function checkWord(word: string) {
  console.log(word + ": " + trie.searchWord(word));
}

async function saveTree() {
  console.log("reading words...");
  await readWords();
  console.log("✔ done reading words");
  console.time("trie");

  // const word1 = "а*ален";
  // const words1 = trie.pattern(word1);
  // const existing = word1
  //   .split("")
  //   .map((l, i) => (l === "*" ? words1.map((_w) => _w[i]) : [l]));

  // const words2 = trie.startsWith("", null, existing);
  // console.log(words2);
  console.log(trie.pattern("**шка"));

  console.timeEnd("trie");
}
saveTree();

function opt1() {
  const word1 = "а*ален";
  const word2 = "ва*";

  const wordsX = trie.pattern(word1);
  const wordsY = trie.pattern(word2);
  console.log(wordsX);
  console.log(wordsY);

  const word1wildcard = word1.indexOf("*");
  const word2wildcard = word2.indexOf("*");

  const letters: string[] = [];
  for (const wordX of wordsX) {
    for (const wordY of wordsY) {
      if (wordX[word1wildcard] === wordY[word2wildcard])
        letters.push(wordX[word1wildcard]);
    }
  }
  console.log(letters);
}
