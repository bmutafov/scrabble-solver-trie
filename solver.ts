import { Board } from "./board";
import { Direction, iterateBoard } from "./utils/iterate-board";
import AxiosCalls from "./utils/axios-calls";

enum AnchorPosition {
  LEFT = 1,
  RIGHT = -1,
  BOTH = 0,
}

export type OptionWord = {
  word: string;
  anchorPos: [number, number];
  startPos: [number, number];
};

type AnchoredWord = { word: string; position: [number, number] };

export class SolverUtil {
  static isLetter = (stringOnBoard: string) =>
    stringOnBoard !== "" &&
    !stringOnBoard.startsWith("$") &&
    stringOnBoard !== "!";

  static isAnchor = (stringOnBoard: string) => stringOnBoard.startsWith("$");

  static constructPatternQuery = async (
    board: Board,
    r: number,
    c: number,
    hand: string[]
  ): Promise<{ root: string; options: string[] }> => {
    let word: string = "";
    let b: string[] = [];
    let a: string[] = [];
    let h: string[] = [];

    const isTopAdjacent = r > 0 && SolverUtil.isLetter(board[r - 1][c]);
    const isBottomAdjacent = r < 14 && SolverUtil.isLetter(board[r + 1][c]);

    if (isTopAdjacent) {
      for (let i = r - 1; i > 0; i--) {
        if (SolverUtil.isLetter(board[i][c])) {
          word = board[i][c] + word;
        } else if (SolverUtil.isAnchor(board[i][c])) {
          b.push(board[i][c].replace("$", ""));
        } else break;
      }
      a = [board[r][c].replace("$", "")];
      return {
        root: word,
        options: await AxiosCalls.byPattern(word, b, a, hand),
      };
    } else if (isBottomAdjacent) {
      for (let i = r + 1; i < 14; i++) {
        if (SolverUtil.isLetter(board[i][c])) {
          word += board[i][c];
        } else if (SolverUtil.isAnchor(board[i][c])) {
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
  };

  static getColumnAsString(board: Board, c: number) {
    let result = "";
    for (let i = 0; i < 14; i++) {
      result += board[i][c].charAt(0) || ".";
    }

    return result;
  }
}

export class Solver {
  public readonly ANCHOR_SIGN = "$";
  private readonly hand: string[] = ["б", "к", "х", "о", "о", "с", "ъ"];
  private originalBoard: Board;
  private _guessBoard: Board;

  get guessBoard() {
    return this._guessBoard;
  }

  constructor(board: Board, hand: string[]) {
    this.originalBoard = board;
    this._guessBoard = [...board.map((r) => r.slice())];
    this.hand = hand;
  }

  private anchorPositions: [number, number, AnchorPosition][] = [];

  *wordsGenerator(optionWords: OptionWord[]) {
    for (const optionWord of optionWords) {
      yield optionWord;
    }
  }

  async solveForBoard(): Promise<OptionWord[]> {
    const guessBoard = this._guessBoard;
    this.findAnchorPositions(guessBoard);
    const anchoredWords = this.findWordsNextToAnchor(guessBoard);
    await this.addPossibleLettersOnBoard(guessBoard, anchoredWords);
    const possibleWords = await this.findPossibleWordsForAnchors(
      guessBoard,
      anchoredWords
    );
    const sorted = possibleWords.sort((a, b) => b.word.length - a.word.length);
    return sorted;
  }

  decideWord(optionWords: OptionWord[]) {
    const wordsGenerator = this.wordsGenerator(optionWords);

    let nextLongest = wordsGenerator.next();
    while (!nextLongest.done && !this.canPlay(nextLongest.value)) {
      nextLongest = wordsGenerator.next();
    }

    if (nextLongest.value) {
      return nextLongest.value;
    }

    return null;
  }

  /**
   * Find all spaces on the boards, which are anchors
   * @param board The board
   */
  findAnchorPositions = (board: Board) => {
    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < board.length; c += 1) {
        const value = board[r][c];
        // If we are iterating currently on a spot which has a set letter
        if (value && value !== this.ANCHOR_SIGN) {
          // if the previous is empty
          if (board[r][c - 1] === "") {
            // set it to the anchor sign and add it to the anchors array
            board[r][c - 1] = this.ANCHOR_SIGN;
            this.anchorPositions.push([r, c - 1, AnchorPosition.LEFT]);
          }
          // if the previous is NOT empty but has ANCHOR_SIGN
          // it means we already tagged it for right anchor
          // and now it is left as well, so we change it to BOTH
          else if (board[r][c - 1] === this.ANCHOR_SIGN) {
            const existingAnchorOnPosition = this.anchorPositions.find(
              (a) => a[0] === r && a[1] === c - 1
            );
            existingAnchorOnPosition![2] = AnchorPosition.BOTH;
          }

          // if the next is empty
          if (board[r][c + 1] === "") {
            // set it to the anchor sign and add it to the anchors array
            board[r][c + 1] = this.ANCHOR_SIGN;
            this.anchorPositions.push([r, c + 1, AnchorPosition.RIGHT]);
          }
        }
      }
    }
  };

  /**
   * For each anchor, find the words that are attached to it so we can search the dictionary
   */
  findWordsNextToAnchor = (board: Board): AnchoredWord[] => {
    const anchoredWords: AnchoredWord[] = [];

    for (const anchor of this.anchorPositions) {
      const [row, col, anchorPosition] = anchor;
      let word: string = this.ANCHOR_SIGN;

      if (
        anchorPosition === AnchorPosition.LEFT ||
        anchorPosition === AnchorPosition.BOTH
      ) {
        // iterate columns forwards until we reach another anchor or empty cell
        for (let c = col + 1; c < 14; c++) {
          if (SolverUtil.isLetter(board[row][c])) {
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
          if (SolverUtil.isLetter(board[row][c])) {
            word = board[row][c] + word;
          } else break;
        }
      }

      if (word) {
        anchoredWords.push({ word, position: [row, col] });
      }
    }

    return anchoredWords;
  };

  addPossibleLettersOnBoard = async (
    board: Board,
    anchoredWords: AnchoredWord[]
  ) => {
    for (const anchoredWord of anchoredWords) {
      const letters = await this.findPossibleLettersOnAnchors(anchoredWord);
      const [row, col] = anchoredWord.position;

      if (letters.length === 0) {
        board[row][col] = "!";
      } else {
        board[row][col] += letters.join("");
      }
    }
  };

  findPossibleLettersOnAnchors = async (
    anchoredWord: AnchoredWord
  ): Promise<string[]> => {
    const { word: anchorWord } = anchoredWord;

    const wordWithoutAnchorSign = anchorWord.replace("$", "");
    let words: string[] = [];
    // if it starts with $ we search all words ending in the word
    if (anchorWord.startsWith(this.ANCHOR_SIGN)) {
      words = await AxiosCalls.endsWith(
        wordWithoutAnchorSign,
        anchorWord.length
      );
    }
    // else if it ends with $ we search all words staring with the prefix word
    else if (anchorWord.endsWith(this.ANCHOR_SIGN)) {
      words = await AxiosCalls.startsWith(
        wordWithoutAnchorSign,
        anchorWord.length
      );
    }
    // else, it is between two tiles, it means we have to do a word on both sides, so we search between
    else {
      const [prefix, suffix] = anchorWord.split(this.ANCHOR_SIGN);
      words = await AxiosCalls.between(prefix, suffix);
    }

    const indexOfAnchorSign = anchorWord.indexOf(this.ANCHOR_SIGN);

    return (
      words
        // remove the same word
        .filter((word) => word !== wordWithoutAnchorSign)
        // get the letter in the position of the $
        .map((word) => {
          return word.charAt(indexOfAnchorSign);
        })
    );
  };

  findPossibleWordsForAnchors = async (
    board: Board,
    anchoredWords: AnchoredWord[]
  ): Promise<OptionWord[]> => {
    const optionWords: OptionWord[] = [];

    for (const anchor of anchoredWords) {
      const [r, c] = anchor.position;
      // Nothing can be placed on this anchor
      if (board[r][c] === "!") continue;

      const { root, options: wordsForAnchor } =
        await SolverUtil.constructPatternQuery(board, r, c, this.hand);

      console.log("🚩 ~ wordsForAnchor", wordsForAnchor);
      const columnAsString = SolverUtil.getColumnAsString(board, c);
      console.log("🚩 ~ columnAsString", columnAsString);
      const indexOfRootOnColumn = columnAsString.indexOf(root);

      wordsForAnchor
        .filter((word) => word !== root)
        .forEach((word) => {
          const indexOfRootWord = word.indexOf(root);
          optionWords.push({
            word,
            anchorPos: [r, c],
            startPos: [indexOfRootOnColumn - indexOfRootWord, c],
          });
        });
    }

    return optionWords;
  };

  canPlay(optionWord: OptionWord): boolean {
    const {
      word,
      startPos: [r, c],
    } = optionWord;

    if (r < 0 || r + word.length > 14) {
      return false;
    }

    for (let i = r; i - r < word.length; i++) {
      const currentCellValue = this._guessBoard[i][c];

      if (SolverUtil.isLetter(currentCellValue)) {
        if (currentCellValue !== word.charAt(i - r)) {
          return false;
        }
      } else if (SolverUtil.isAnchor(currentCellValue)) {
        if (
          !currentCellValue.includes(word.charAt(i - r)) &&
          !currentCellValue.includes("*")
        )
          return false;
      }
    }
    if (SolverUtil.isLetter(this._guessBoard[r + word.length][c])) {
      return false;
    }

    return true;
  }

  playWord(board: Board, optionWord: OptionWord): Board {
    const {
      word,
      startPos: [r, c],
    } = optionWord;

    for (let i = r; i - r < word.length; i++) {
      if (!SolverUtil.isLetter(board[i][c])) {
        board[i][c] = "@" + word.charAt(i - r);
      }
    }

    return board;
  }
}
