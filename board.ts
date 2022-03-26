import { patternToArray } from "./utils/pattern-to-array";
import axios from "axios";
import ora from "ora";
import { exportToVis } from "./utils/export-to-vis";
import { rotate90, rotate270 } from "2d-array-rotation";
import { Direction, iterateBoard, PerRowCallback } from "./utils/iterate-board";

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

/**
 * For each anchor, find the words that are attached to it so we can search the dictionary
 */
function findAnchoredWords() {
  for (const anchor of anchorPositions) {
    const [row, col, anchorPosition] = anchor;
    let word: string = ANCHOR_SIGN;

    if (
      anchorPosition === AnchorPosition.LEFT ||
      anchorPosition === AnchorPosition.BOTH
    ) {
      // iterate columns forwards until we reach another anchor or empty cell
      for (let c = col + 1; c < 14; c++) {
        if (BOARD[row][c] && !BOARD[row][c].startsWith(ANCHOR_SIGN)) {
          word += BOARD[row][c];
        } else break;
      }
    }

    // iterate columns backwards until we reach another anchor or empty cell
    if (
      anchorPosition === AnchorPosition.RIGHT ||
      anchorPosition === AnchorPosition.BOTH
    ) {
      for (let c = col - 1; c >= 0; c--) {
        if (BOARD[row][c] && !BOARD[row][c].startsWith(ANCHOR_SIGN)) {
          word = BOARD[row][c] + word;
        } else break;
      }
    }

    if (word) {
      console.log(word);
    }
  }
}

function run() {
  iterateBoard(BOARD, Direction.Rows, findAnchors);
  findAnchoredWords();
}

function end(board: Board) {
  exportToVis(board);
}

run();
end(BOARD);
