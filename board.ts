import axios from "axios";
import ora from "ora";
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

async function startsWith(word: string, depth?: number): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI("http://localhost:5100/starts?str=" + word + "&l=" + depth)
  );
  const { data } = response;
  return data.res;
}

async function endsWith(word: string, depth?: number): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI("http://localhost:5100/ends?str=" + word + "&l=" + depth)
  );
  const { data } = response;
  return data.res;
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

async function run() {
  // Iterate board each row
  const calculating = global_board
    .map((row, i_r) => {
      // For each row iterate columns
      return row.map(async (col, i_c) => {
        // If the space we are checking is not empty, disregard the check
        if (col !== "") return;
        // Initialize empty values for the strings before and after the space we are checking
        let left: string = "";
        let right: string = "";

        // Iterate through the row forwards and backwards in the same array
        for (
          // b -> backwards, starting previous column
          // f -> forwards, starting next column
          let b = i_c - 1, f = i_c + 1;
          // iterate while backwards is >= 1 (so we can do b - 1 and get index 0)
          // and similarly with f < 14 so we can do f + 1 and get 14 (last board index)
          b >= 1 || f < 14;
          //change the values each iteration respectively
          b--, f++
        ) {
          // if we have not yet terminated backwards search
          // and the iterated column is not empty (has a letter)
          if (b > 0 && row[b] !== "") {
            // add it to the "left" string
            left = row[b] + left;
          } else {
            // if we have terminated OR the column is empty, it means no more information
            // can be extracted for this row, so terminate backwards search
            b = -1;
          }

          // similarly, iterate forwards at the same time with the same conditions
          if (f < 14 && row[f] !== "") {
            right += row[f];
          } else {
            // here 21 is chosen randomly, as it can be any number bigger 14
            // we just need to terminate the if and enter the else
            f = 21;
          }
        }

        // when iteration is finished check for
        if (left && !right) {
          // only left letters, it means 1 or more letters are to the left, none to the right
          // so we got to come up with valid word that is one letter longer than the left word
          const words = await startsWith(left, left.length + 1);
          // when we have those words, get the character only at the position after the left word
          // and add it to the guess_board. $ here is to know which spaces are suggestive spaces and which are already on the board
          guess_board[i_r][i_c] =
            "$" +
            unique(words.map((word) => word.charAt(left.length))).join("");
        }

        if (!left && right) {
          // similarly, if only right, it means we have to append 1 letter on the left
          // so we search for words ending in "right" word
          const words = await endsWith(right, right.length + 1);
          // when we have those, get the character before the "right" word and add it to the guess_board
          guess_board[i_r][i_c] =
            "$" +
            unique(
              words.map((word) => word.charAt(word.length - right.length - 1))
            ).join("");
        }

        if (left && right) {
          // if we have left and right, it means we have to fit into a specific spot
          // so we got to search by pattern
          const words = await startsWith(left, left.length + 1);
          // Search by pattern
        }
      });
    })
    .flat();

  const spinner = ora("Calculating move...").start();
  await Promise.all(calculating);
  exportToVis(guess_board);
  spinner.succeed("Move calculated");
}

run();
