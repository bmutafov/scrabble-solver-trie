import * as fs from "fs";

function startsWithCapital(word: string): boolean {
  return word.charAt(0) === word.charAt(0).toUpperCase();
}

async function parseFile() {
  console.log("reading...");
  const REGEX = /\'(.*?)\'/gim;
  const dictionaryTxt = await fs.promises.readFile("./bg_dictionary.txt");
  const wordMatches = dictionaryTxt.toString().match(REGEX);
  const uniqueWords = [...new Set(wordMatches)];

  await fs.promises.rename(
    "./output.txt",
    `./output_old_${Math.random().toFixed(5)}.txt`
  );

  console.log("sorting...");
  console.log("🚩 ~ uniqueWords", uniqueWords);
  const sortedWords = uniqueWords
    .map((word) => word.replace(/'/g, ""))
    .filter((word) => /^[а-я]+$/.test(word))
    .sort((a, b) => a.localeCompare(b));
  console.log("writing...");

  const writeStream = fs.createWriteStream("./output.txt");

  if (wordMatches?.length) {
    console.log("writing to output file...");
    for (const word of sortedWords) {
      const escapedWord = word.replace(/'/g, "");
      if (!startsWithCapital(escapedWord) && escapedWord.length <= 15) {
        writeStream.write(escapedWord + "\r\n");
      }
    }
    console.log("✔ done.");
    writeStream.end();
  } else {
    console.log("No words.");
  }
}

parseFile();
