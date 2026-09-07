// Tic tac toe, as a set of rules with no screen attached, so the board can be tested
// without a browser. Nothing here knows about the order, the cart or the database: the
// game is a distraction while a guest waits and it touches none of them.
export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = readonly Cell[];

export const EMPTY_BOARD: Board = Object.freeze(Array<Cell>(9).fill(null));

export const LINES: readonly (readonly number[])[] = Object.freeze([
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]);

export function winnerOf(board: Board): { mark: Mark; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line as [number, number, number];
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) return { mark, line };
  }
  return null;
}

export function freeCells(board: Board): number[] {
  return board.flatMap((cell, i) => (cell === null ? [i] : []));
}

export function isDraw(board: Board): boolean {
  return !winnerOf(board) && freeCells(board).length === 0;
}

export function place(board: Board, index: number, mark: Mark): Board {
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    throw new RangeError(`cell must be 0 to 8, received ${index}`);
  }
  if (board[index] !== null) return board;
  const next = [...board];
  next[index] = mark;
  return next;
}

// The opponent takes a win, blocks a loss, and otherwise plays anywhere.
//
// It is deliberately no cleverer than that. This is a distraction at a dinner table, not
// a challenge, so it has to be beatable: because it never looks two moves ahead, a guest
// who sets up two threats at once wins. Anything stronger draws every game, which is not
// a game.
export function opponentMove(board: Board, mark: Mark, pick: (count: number) => number = (n) => Math.floor(Math.random() * n)): number | null {
  const free = freeCells(board);
  if (free.length === 0 || winnerOf(board)) return null;
  const other: Mark = mark === "X" ? "O" : "X";
  const finisher = (who: Mark) => free.find((i) => winnerOf(place(board, i, who))?.mark === who);
  const win = finisher(mark);
  if (win !== undefined) return win;
  const block = finisher(other);
  if (block !== undefined) return block;
  // A pick that is out of range, or not whole, still has to land on a real cell.
  const chosen = free[Math.min(free.length - 1, Math.max(0, Math.floor(pick(free.length)) || 0))];
  return chosen ?? null;
}
