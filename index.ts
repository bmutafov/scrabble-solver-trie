import { memoryUsage } from "./utils/memory-usage";
import { OptionWord, Solver, SolverUtil } from "./solver";
import { exportToVis } from "./utils/export-to-vis";

export type Board<T = string> = T[][];
const BOARD: Board = [
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "t", "r", "a", "i", "n", "", "", ""],
  ["", "", "", "", "", "", "", "r", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "u", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "c", "a", "r", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "k", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
];
const hand = "шит".split("");

const transpose = (m) => m[0].map((x, i) => m.map((x) => x[i]));

async function run() {
  const moveSolver = new Solver(BOARD, hand);
  const optionWords = await moveSolver.solveForBoard();
  const word = moveSolver.decideWord(optionWords);
  console.log("🚩 ~ word", word);

  if (word) {
    moveSolver.playWord(moveSolver.guessBoard, word);
  }

  exportToVis(moveSolver.guessBoard);
  memoryUsage();
}

run();
