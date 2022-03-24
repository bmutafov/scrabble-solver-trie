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
  ["", "", "", "", "", "", "х", "а", "", "а", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
];
const hand = ["с", "а", "т", "е", "я", "л", "о"];

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

async function finishWith(word: string, hand: string[]): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI(
      "http://localhost:5100/finish?str=" + word + "&hand=" + hand.join(",")
    )
  );
  const { data } = response;
  return data.res;
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

const spinner = ora("Calculating move...");

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
          // TODO: Search by pattern
        }
      });
    })
    .flat();

  spinner.start();
  await Promise.all(calculating);

  // After we have gone and calculated all horizontal fillers
  // we go second time column by column this time
  for (let i_c = 0; i_c < 14; i_c++) {
    for (let i_r = 0; i_r < 14; i_r++) {
      // get the current cell
      const cell = guess_board[i_r][i_c];
      // if the cell starts with $ - it means this cell is an anchor
      // and word can start from here
      // a cell containing only "$" is an anchor, but nothing can be placed there to make a word
      if (cell.startsWith("$") && cell.length > 1) {
        let top: string = "";
        let bottom: string = "";

        // Iterate through the row forwards and backwards in the same array
        for (
          // b -> backwards, starting previous row
          // f -> forwards, starting next row
          let b = i_r - 1, f = i_r + 1;
          // iterate while backwards is >= 1 (so we can do b - 1 and get index 0)
          // and similarly with f < 14 so we can do f + 1 and get 14 (last board index)
          b >= 1 || f < 14;
          //change the values each iteration respectively
          b--, f++
        ) {
          // if we have not yet terminated backwards search
          // and the iterated column is not empty (has a letter)
          if (b > 0 && guess_board[b][i_c] !== "") {
            // add it to the "left" string
            top = guess_board[b][i_c] + top;
          } else {
            // if we have terminated OR the column is empty, it means no more information
            // can be extracted for this row, so terminate backwards search
            b = -1;
          }

          // similarly, iterate forwards at the same time with the same conditions
          if (f < 14 && guess_board[f][i_c] !== "") {
            bottom += guess_board[f][i_c];
          } else {
            // here 21 is chosen randomly, as it can be any number bigger 14
            // we just need to terminate the if and enter the else
            f = 21;
          }
        }

        // top and bottom are build and now we can find words
        // if we have top we can find all words starting with the top word
        // and finishing with letters from our hand
        if (top && !bottom) {
          const finish = await finishWith(top, hand);

          const cellLetters = cell.replace("$", "").split("");

          const valid = finish.filter((word) => {
            return cellLetters.includes(word.charAt(top.length));
          });
          const longest = valid.sort((a, b) => b.length - a.length)[0];
          for (
            let f = i_r, i = top.length;
            f < i_r + longest.length - 1;
            f++, i++
          ) {
            guess_board[f][i_c] = "@" + longest.charAt(i);
          }
          end();
          return;
        }

        // if we have only bottom we can find words
        // starting with letters from our hand
        // and finishing with the ones on the bottom
        if (!top && bottom) {
          // TODO: endsWith(bottom), hasLettersFromHand
        }
      }
    }
  }
}

function end() {
  exportToVis(guess_board);
  spinner.succeed("Move calculated");
}

run();
