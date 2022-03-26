import { patternToArray } from "./utils/pattern-to-array";
import axios from "axios";
import ora from "ora";
import { exportToVis } from "./utils/export-to-vis";
import { rotate90, rotate270 } from "2d-array-rotation";
import { Direction, iterateBoard, PerRowCallback } from "./utils/iterate-board";
import AxiosCalls from "./utils/axios-calls";

const hand = ["б", "н", "я", "х", "о", "о"];

export type Board<T = string> = T[][];
const BOARD: Board = [
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "м", "", "", "", "", "", ""],
  ["", "", "", "", "", "б", "а", "н", "а", "н", "а", "", "", "", ""],
  ["", "", "", "", "", "я", "х", "а", "", "а", "", "", "", "", ""],
  ["", "", "", "", "", "х", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "а", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
];

enum AnchorPosition {
  LEFT = 1,
  RIGHT = -1,
  BOTH = 0,
}
const anchorPositions: [number, number, AnchorPosition][] = [];
const ANCHOR_SIGN = "$";

/**
 * Find all spaces on the boards, which are anchors
 * @param r Row
 * @param c Column
 * @param value Value of the iterated cell
 * @param board The board
 */
const findAnchors: PerRowCallback = (r, c, value, board) => {
  // If we are iterating currently on a spot which has a set letter
  if (value && value !== ANCHOR_SIGN) {
    // if the previous is empty
    if (board[r][c - 1] === "") {
      // set it to the anchor sign and add it to the anchors array
      board[r][c - 1] = ANCHOR_SIGN;
      anchorPositions.push([r, c - 1, AnchorPosition.LEFT]);
    }
    // if the previous is NOT empty but has ANCHOR_SIGN
    // it means we already tagged it for right anchor
    // and now it is left as well, so we change it to BOTH
    else if (board[r][c - 1] === ANCHOR_SIGN) {
      const existingAnchorOnPosition = anchorPositions.find(
        (a) => a[0] === r && a[1] === c - 1
      );
      existingAnchorOnPosition![2] = AnchorPosition.BOTH;
    }

    // if the next is empty
    if (board[r][c + 1] === "") {
      // set it to the anchor sign and add it to the anchors array
      board[r][c + 1] = ANCHOR_SIGN;
      anchorPositions.push([r, c + 1, AnchorPosition.RIGHT]);
    }
  }
};

type AnchoredWord = { word: string; position: [number, number] };
/**
 * For each anchor, find the words that are attached to it so we can search the dictionary
 */
function findAnchoredWords(board: Board): AnchoredWord[] {
  const anchoredWords: AnchoredWord[] = [];

  for (const anchor of anchorPositions) {
    const [row, col, anchorPosition] = anchor;
    let word: string = ANCHOR_SIGN;

    if (
      anchorPosition === AnchorPosition.LEFT ||
      anchorPosition === AnchorPosition.BOTH
    ) {
      // iterate columns forwards until we reach another anchor or empty cell
      for (let c = col + 1; c < 14; c++) {
        if (board[row][c] && !board[row][c].startsWith(ANCHOR_SIGN)) {
          word += board[row][c];
        } else break;
      }
    }

    // iterate columns backwards until we reach another anchor or empty cell
    if (
      anchorPosition === AnchorPosition.RIGHT ||
      anchorPosition === AnchorPosition.BOTH
    ) {
      for (let c = col - 1; c >= 0; c--) {
        if (board[row][c] && !board[row][c].startsWith(ANCHOR_SIGN)) {
          word = board[row][c] + word;
        } else break;
      }
    }

    if (word) {
      anchoredWords.push({ word, position: [row, col] });
    }
  }

  return anchoredWords;
}

async function findPossibleLettersOnAnchors(
  anchoredWord: AnchoredWord
): Promise<string[]> {
  const { word: anchorWord } = anchoredWord;

  const wordWithoutAnchorSign = anchorWord.replace("$", "");
  let words: string[] = [];
  // if it starts with $ we search all words ending in the word
  if (anchorWord.startsWith(ANCHOR_SIGN)) {
    words = await AxiosCalls.endsWith(wordWithoutAnchorSign, anchorWord.length);
  }
  // else if it ends with $ we search all words staring with the prefix word
  else if (anchorWord.endsWith(ANCHOR_SIGN)) {
    words = await AxiosCalls.startsWith(
      wordWithoutAnchorSign,
      anchorWord.length
    );
  }
  // else, it is between two tiles, it means we have to do a word on both sides, so we search between
  else {
    const [prefix, suffix] = anchorWord.split(ANCHOR_SIGN);
    words = await AxiosCalls.between(prefix, suffix);
  }

  const indexOfAnchorSign = anchorWord.indexOf(ANCHOR_SIGN);
  return (
    words
      // remove the same word
      .filter((word) => word !== wordWithoutAnchorSign)
      // get the letter in the position of the $
      .map((word) => {
        return word.charAt(indexOfAnchorSign);
      })
  );
}

async function addPossibleLettersToBoard(
  board: Board,
  anchoredWords: AnchoredWord[]
) {
  for (const anchoredWord of anchoredWords) {
    const letters = await findPossibleLettersOnAnchors(anchoredWord);
    const [row, col] = anchoredWord.position;
    if (letters.length === 0) {
      board[row][col] = "!";
    } else {
      board[row][col] += "$" + letters.join("");
    }
  }
}

async function run() {
  const guessBoard = [...BOARD.map((r) => r.slice())];

  iterateBoard(BOARD, Direction.Rows, findAnchors);
  const anchoredWords = findAnchoredWords(guessBoard);
  addPossibleLettersToBoard(guessBoard, anchoredWords);

  end(guessBoard);
}

function end(board: Board) {
  exportToVis(board);
}

run();
// end(BOARD);
