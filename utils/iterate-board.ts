import { Board } from "../board";

export enum Direction {
  Columns,
  Rows,
}

export type PerRowCallback = (
  r: number,
  c: number,
  value: string,
  board: Board
) => void;
export function iterateBoard(
  board: Board,
  direction: Direction,
  perRowCallback: PerRowCallback,
  start?: [number, number, number]
) {
  const [fromR, fromC, moveDirection] = start || [0, 0, 1];

  if (direction === Direction.Rows) {
    for (let r = fromR; r < board.length; r += moveDirection) {
      for (let c = fromC; c < board.length; c += moveDirection) {
        perRowCallback(r, c, board[r][c], board);
      }
    }
  }
  if (direction === Direction.Columns) {
    for (let c = fromC; c < board.length; c += moveDirection) {
      for (let r = fromR; r < board.length; r += moveDirection) {
        perRowCallback(r, c, board[r][c], board);
      }
    }
  }
}
