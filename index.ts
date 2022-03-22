import * as fs from "fs";
import { reverse, Trie } from "./trie";

const trie = new Trie();
const backwardsTrie = new Trie();

async function readWords() {
  const allWordsTxt = await fs.promises.readFile("./parser/output.txt");
  const _rawWords = allWordsTxt.toString().split("\r\n");

  _rawWords.forEach((word) => {
    if (word.length > 1) {
      trie.addWord(word);
      backwardsTrie.addWord(reverse(word));
    }
  });
}

function checkWord(word: string) {
  console.log(word + ": " + trie.searchWord(word));
}

async function run() {
  console.log("reading words!");
  await readWords();
  console.time("time");

  // const hand = ["к", "л", "о", "р", "с", "е", "я"];

  // const boardRow = ["п", "е", "н", "и", "с"];
  // const boardRowAfterOne = ["с", "е", "в", "е", "в"];

  // const possibilities = boardRow.map((letter, i) =>
  //   trie
  //     .startsWith(letter, 3, [[], [], [boardRowAfterOne[i]]])
  //     .filter((word) => word.length === 3)
  //     .map((word) => word.charAt(2))
  // );

  // console.log(possibilities);

  // const possibleWords = trie.startsWith("", 6, possibilities);
  // console.log(possibleWords);
  // const possibleWordsWithMyLetters = possibleWords.filter((word) => {
  //   return word.split("").every((l) => hand.includes(l));
  // });
  // console.log(possibleWordsWithMyLetters);
  const res = trie.startsWith("миш", null, [[], [], [], [], ["е"]]);
  console.log(res);

  console.timeEnd("time");
}

run();
