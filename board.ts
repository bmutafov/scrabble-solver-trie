import { patternToArray } from "./utils/pattern-to-array";
import axios from "axios";
import ora from "ora";
import { exportToVis } from "./utils/export-to-vis";
import { rotate90, rotate270 } from "2d-array-rotation";
import { Direction, iterateBoard, PerRowCallback } from "./utils/iterate-board";
import AxiosCalls from "./utils/axios-calls";

const hand = ["б", "к", "х", "о", "о", "с", "ъ"];

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

async function addPossibleLettersForAnchors(
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

//TODO: EXTRACT TO UTIL
function getColumnAsString(board: Board, c: number) {
  let result = "";
  for (let i = 0; i < 14; i++) {
    result += board[i][c].charAt(0) || ".";
  }

  return result;
}

type OptionWord = {
  word: string;
  anchorPos: [number, number];
  startPos: [number, number];
};
async function findPossibleWordsForAnchors(
  board: Board,
  anchoredWords: AnchoredWord[]
): Promise<OptionWord[]> {
  const optionWords: OptionWord[] = [];

  for (const anchor of anchoredWords) {
    const [r, c] = anchor.position;
    // Nothing can be placed on this anchor
    if (board[r][c] === "!") continue;

    const { root, options: wordsForAnchor } = await constructPatternQuery(
      board,
      r,
      c
    );

    const columnAsString = getColumnAsString(board, c);
    const indexOfRootOnColumn = columnAsString.indexOf(root);

    wordsForAnchor.forEach((word) => {
      const indexOfRootWord = word.indexOf(root);
      optionWords.push({
        word,
        anchorPos: [r, c],
        startPos: [indexOfRootOnColumn - indexOfRootWord, c],
      });
    });
  }

  return optionWords;
}

const isLetter = (stringOnBoard: string) =>
  stringOnBoard !== "" &&
  !stringOnBoard.startsWith("$") &&
  stringOnBoard !== "!";
const isAnchor = (stringOnBoard: string) => stringOnBoard.startsWith("$");

async function constructPatternQuery(
  board: Board,
  r: number,
  c: number
): Promise<{ root: string; options: string[] }> {
  let word: string = "";
  let b: string[] = [];
  let a: string[] = [];
  let h: string[] = [];

  const isTopAdjacent = isLetter(board[r - 1][c]);
  const isBottomAdjacent = isLetter(board[r + 1][c]);

  if (isTopAdjacent) {
    for (let i = r - 1; i > 0; i--) {
      if (isLetter(board[i][c])) {
        word = board[i][c] + word;
      } else if (isAnchor(board[i][c])) {
        b.push(board[i][c].replace("$", ""));
      } else break;
    }
    a = [board[r][c].replace("$", "")];
    return {
      root: word,
      options: await AxiosCalls.byPattern(word, b, a, hand),
    };
  }
  if (isBottomAdjacent) {
    for (let i = r + 1; i < 14; i++) {
      if (isLetter(board[i][c])) {
        word += board[i][c];
      } else if (isAnchor(board[i][c])) {
        a.push(board[i][c].replace("$", ""));
      } else break;
    }
    b = [board[r][c].replace("$", "")];
    return {
      root: word,
      options: await AxiosCalls.byPattern(word, b, a, hand),
    };
  }

  return { root: "", options: [] };
}

function playWord(board: Board, optionWord: OptionWord) {
  const {
    word,
    startPos: [r, c],
  } = optionWord;
  console.log("🚩 ~ word", word);
  for (let i = r; i - r < word.length; i++) {
    if (!isLetter(board[i][c])) {
      board[i][c] = "@" + word.charAt(i - r);
    }
  }
}

async function run() {
  const guessBoard = [...BOARD.map((r) => r.slice())];

  iterateBoard(BOARD, Direction.Rows, findAnchors);
  const anchoredWords = findAnchoredWords(guessBoard);
  await addPossibleLettersForAnchors(guessBoard, anchoredWords);
  const possibleWords = await findPossibleWordsForAnchors(
    guessBoard,
    anchoredWords
  );
  const [longest] = possibleWords.sort((a, b) => b.word.length - a.word.length);
  playWord(guessBoard, longest);

  end(guessBoard);
}

function end(board: Board) {
  exportToVis(board);
}

run();
// end(BOARD);
