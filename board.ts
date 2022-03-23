import { reverse, Trie } from "./_old/trie";
import * as fs from "fs";
import { readWords } from "./utils/read-words";
import { exportToVis } from "./utils/export-to-vis";

type Board<T = string> = T[][];
const global_board: Board = [
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "н", "", "", "", "", "", ""],
  ["", "", "", "", "", "б", "а", "н", "а", "н", "а", "", "", "", ""],
  ["", "", "", "", "", "", "", "а", "", "а", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
];

const guess_board: Board = [...global_board.map((w) => w.slice())];

const trie = new Trie();

async function run(board: Board) {
  await readWords(trie);

  console.log("suggesting move...");

  for (let r = 0; r < board.length; r++) {
    const currentRow = board[r];
    for (let c = 0; c < currentRow.length; c++) {
      const currentCell = currentRow[c];
      if (!currentCell) {
        const pattern = findHorizontal(currentRow, c);
        if (pattern) {
          const letters = trie.singleLetterSearch(pattern);
          guess_board[r][c] = "$" + letters.join("");
          // console.log("🚩 ~ pattern", pattern, letters);
        } else {
          guess_board[r][c] = "?";
        }
      }
    }
  }

  for (let c = 0; c < board.length; c++) {
    for (let r = 0; r < board.length; r++) {
      const currentCell = board[r][c];
      if (!currentCell) {
        const pattern = findVertical(board, r, c);
        if (pattern) {
          const letters = trie.singleLetterSearch(pattern);
          guess_board[r][c] =
            "$" +
            (guess_board[r][c] === "?"
              ? letters.join("")
              : guess_board[r][c]
                  .split("")
                  .filter((l) => letters.includes(l))
                  .join(""));
          // console.log("🚩 ~ pattern", pattern);
        }
      }
    }
  }

  suggestMove();
  exportToVis(guess_board);
  console.log("✔ move suggested");
}

const hand = ["х", "в", "я", "я", "я", "я", "я"];
function suggestMove() {
  for (let r = 0; r < guess_board.length; r++) {
    const currentRow = guess_board[r];
    for (let c = 0; c < currentRow.length; c++) {
      const currentCell = currentRow[c];
      if (currentCell.startsWith("$")) {
        const letterToPlay = currentCell
          .split("")
          .find((l) => hand.includes(l));
        if (letterToPlay) {
          guess_board[r][c] += "#" + letterToPlay;
          return;
        }
      }
    }
  }
}

function findHorizontal(currentRow: string[], c: number) {
  let pattern = "*";
  for (let f = c + 1, b = c - 1; b >= 0 || f <= 14; f++, b--) {
    if (f < 14 && currentRow[f]) {
      pattern += currentRow[f];
    } else {
      f = 15;
    }

    if (b >= 0 && currentRow[b]) {
      pattern = currentRow[b] + pattern;
    } else {
      b = -1;
    }
  }

  return pattern === "*" ? null : pattern;
}

function findVertical(board: Board, r: number, c: number) {
  let pattern = "*";
  const getCell = (_r: number) => board[_r][c];

  for (let f = r + 1, b = r - 1; b >= 0 || f <= 14; f++, b--) {
    if (f < 14 && getCell(f)) {
      pattern += getCell(f);
    } else {
      f = 15;
    }

    if (b >= 0 && getCell(b)) {
      pattern = getCell(b) + pattern;
    } else {
      b = -1;
    }
  }

  return pattern === "*" ? null : pattern;
}

run(global_board);
