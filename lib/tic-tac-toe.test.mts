import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_BOARD, freeCells, isDraw, opponentMove, place, winnerOf, type Board, type Cell } from "./tic-tac-toe.ts";

const of = (s: string): Board => [...s].map((c) => (c === "." ? null : (c as Cell)));

test("a full line wins, and the line comes back so it can be drawn", () => {
  const w = winnerOf(of("XXX...OO."));
  assert.equal(w?.mark, "X");
  assert.deepEqual([...(w?.line ?? [])], [0, 1, 2]);
  assert.equal(winnerOf(of("X.O.X.O.X"))?.mark, "X");
  assert.equal(winnerOf(of("..X.X.X..")) ?.mark, "X");
  assert.equal(winnerOf(EMPTY_BOARD), null);
});

test("a full board with no line is a draw", () => {
  assert.equal(isDraw(of("XXOOOXXOX")), true);
  assert.equal(isDraw(of("XXX.....　".slice(0, 9))), false);
  assert.equal(isDraw(EMPTY_BOARD), false);
});

test("placing never overwrites and never mutates", () => {
  const board = of("X........");
  assert.equal(place(board, 0, "O")[0], "X");
  assert.equal(place(board, 1, "O")[1], "O");
  assert.equal(board[1], null, "the original board changed");
  assert.throws(() => place(board, 9, "O"), /cell must be 0 to 8/);
});

test("the opponent takes a win when it has one", () => {
  assert.equal(opponentMove(of("OO.XX...."), "O"), 2);
});

test("the opponent blocks when it is about to lose", () => {
  assert.equal(opponentMove(of("XX.O....."), "O"), 2);
});

test("a win comes before a block", () => {
  // O can finish the top row; X threatens the left column. Winning is the move.
  assert.equal(opponentMove(of("OO.X..X.."), "O"), 2);
});

// The point of the opponent: a guest has to be able to win.
test("the opponent loses to two threats at once, which is what makes it beatable", () => {
  // X on two corners and the centre threatens both diagonals; O can only block one.
  const board = of("X...X...X".replace(/X$/, "."));
  const reply = opponentMove(of("X...X...."), "O", () => 0);
  assert.notEqual(reply, null);
  void board;
  // Play it out: X takes the free corner and has two lines, O can stop only one.
  const afterO = place(of("X...X...."), reply!, "O");
  const forks = freeCells(afterO).filter((i) => {
    const afterX = place(afterO, i, "X");
    return freeCells(afterX).filter((j) => winnerOf(place(afterX, j, "X"))).length >= 2;
  });
  assert.ok(forks.length > 0, "no fork available, the opponent is unbeatable");
});

test("the opponent returns nothing when there is nothing to play", () => {
  assert.equal(opponentMove(of("XXOOOXXOX"), "O"), null);
  assert.equal(opponentMove(of("XXX......"), "O"), null);
});

test("a bad pick is clamped rather than crashing", () => {
  const board = of("X........");
  for (const pick of [() => -5, () => 99, () => 1.7]) {
    const move = opponentMove(board, "O", pick);
    assert.ok(move !== null && freeCells(board).includes(move), String(move));
  }
});
