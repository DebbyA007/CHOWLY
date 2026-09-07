"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, utils } from "animejs";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { drawSitting, type Asked } from "@/lib/quiz";
import { EMPTY_BOARD, isDraw, opponentMove, place, winnerOf, type Board, type Mark } from "@/lib/tic-tac-toe";

// Something to do while the kitchen works. It is an offer on the order screen, it opens
// over that screen rather than replacing it, and it closes on one tap with nothing asked.
//
// Three rules shape all of it. The countdown is this app's subject, so the panel is short
// enough to leave the ring and its numerals in full view and there is no scrim over them.
// Nothing here touches the order, the cart, the payment or the database: it is state in
// this component and not one request leaves the phone to play. And nothing is kept: a
// refresh closes the game and the next one starts clean, because a half-finished board
// restored next to an order that has since been served is a worse thing than a lost game.

export type OrderState = "waiting" | "late" | "served" | "paid" | "cancelled";
type Mode = "alone" | "two";
type Which = "tictactoe" | "quiz";

const ROUND = 6;

export function GameOverlay({ state, onClose }: { state: OrderState; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const reduce = usePrefersReducedMotion();
  const [picked, setPicked] = useState<{ which: Which; mode: Mode } | null>(null);
  const opened = useRef(state);

  // What the guest must hear about even while playing. It only speaks when the order
  // changes under the game, so opening one on an order that is already late says nothing.
  const changed = state !== opened.current ? state : null;
  const alert =
    changed === "served" ? "Your order has been served." :
    changed === "late" ? "Your order is running late." :
    changed === "cancelled" ? "This order was cancelled." : null;

  useEffect(() => {
    // The ring has to be in view behind the panel, whatever the guest had scrolled to.
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const soft = self?.matches.reduceMotion === true;
      animate(".game-panel", soft ? { opacity: [0, 1], duration: 180 } : { opacity: [0, 1], y: ["100%", "0%"], duration: 300, ease: "outQuad" });
    });
    return () => scope.current?.revert();
  }, [reduce]);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center">
      <section
        aria-label="Something to do while you wait"
        data-game-panel
        className="game-panel pointer-events-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[16px] border-t border-[color:var(--hairline)] bg-surface fibre"
        // Capped against the ring rather than at a percentage: the panel never rises above
        // the countdown, whatever the screen height. On a short phone it scrolls instead.
        style={{ opacity: 0, maxHeight: "calc(100dvh - 415px)" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-[22px] pt-[14px]">
          <h2 className="serif text-[21px] leading-[1.1]">{picked ? (picked.which === "quiz" ? "Quiz" : "Tic tac toe") : "While you wait"}</h2>
          <div className="flex items-center gap-[6px]">
            {picked ? (
              <button type="button" data-game-back onClick={() => setPicked(null)} className="press -my-[11px] min-h-[44px] px-[10px] py-[11px] text-[12.5px] text-fg-muted">Games</button>
            ) : null}
            <button type="button" data-game-close onClick={onClose} className="press -my-[11px] -mr-[10px] min-h-[44px] px-[10px] py-[11px] text-[12.5px] font-semibold text-accent">Close</button>
          </div>
        </div>

        {alert ? (
          <p role="alert" data-game-alert className="mx-[22px] mt-[10px] shrink-0 rounded-[10px] border border-[color:var(--accent-pill-border)] px-[13px] py-[10px] text-[12.5px] leading-[1.4] text-accent">
            {alert}{" "}
            <button type="button" data-game-see onClick={onClose} className="underline">See your order</button>
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-[18px] pt-3">
          {picked === null ? <Picker onPick={(which, mode) => setPicked({ which, mode })} /> : null}
          {picked?.which === "tictactoe" ? <TicTacToe mode={picked.mode} reduce={reduce} /> : null}
          {picked?.which === "quiz" ? <Quiz mode={picked.mode} reduce={reduce} /> : null}
        </div>
      </section>
    </div>
  );
}

function Picker({ onPick }: { onPick: (which: Which, mode: Mode) => void }) {
  const games: { which: Which; name: string; blurb: string }[] = [
    { which: "tictactoe", name: "Tic tac toe", blurb: "Three in a row." },
    { which: "quiz", name: "Quiz", blurb: "Lagos, food and a bit of everything." },
  ];
  return (
    <div className="flex flex-col gap-[14px]">
      {games.map((game) => (
        <div key={game.which}>
          <p className="serif text-[19px] leading-[1.15]">{game.name}</p>
          <p className="mt-[2px] text-[12px] text-fg-muted">{game.blurb}</p>
          <div className="mt-[9px] flex gap-[9px]">
            <button type="button" data-pick={`${game.which}-alone`} onClick={() => onPick(game.which, "alone")} className="chip press !px-[15px] !py-[12px] !text-[13px] !font-semibold">Alone</button>
            <button type="button" data-pick={`${game.which}-two`} onClick={() => onPick(game.which, "two")} className="chip press !px-[15px] !py-[12px] !text-[13px] !font-semibold">Two players</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const CELL_LABEL = ["top left", "top middle", "top right", "middle left", "centre", "middle right", "bottom left", "bottom middle", "bottom right"];

function TicTacToe({ mode, reduce }: { mode: Mode; reduce: boolean }) {
  const [board, setBoard] = useState<Board>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Mark>("X");
  const [thinking, setThinking] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const done = winnerOf(board);
  const drawn = isDraw(board);
  const over = !!done || drawn;

  const say = over
    ? done
      ? mode === "alone"
        ? done.mark === "X" ? "You win." : "The app wins."
        : `${done.mark} wins.`
      : "A draw."
    : mode === "alone"
      ? thinking ? "The app is playing." : "Your turn."
      : `${turn} to play.`;

  // A mark lands where it was put; the winning line is drawn through it once.
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const last = el.querySelector<HTMLElement>("[data-just]");
    if (last) animate(last, reduce ? { opacity: [0, 1], duration: 160 } : { opacity: [0, 1], scale: [0.5, 1], duration: 240, ease: "outQuad" });
  }, [board, reduce]);

  // Keyed on the line itself rather than on the winner object, which is rebuilt on every
  // render: depending on the object redrew the line over and over.
  const wonLine = done ? done.line.join("") : "";
  useEffect(() => {
    const line = grid.current?.querySelector<SVGLineElement>("[data-win-line]");
    if (!line) return;
    const length = line.getTotalLength();
    utils.set(line, { strokeDasharray: length, strokeDashoffset: length });
    animate(line, reduce ? { opacity: [0, 1], strokeDashoffset: 0, duration: 200 } : { strokeDashoffset: [length, 0], duration: 380, ease: "outQuad" });
  }, [wonLine, reduce]);

  function play(index: number) {
    if (over || board[index] !== null || thinking) return;
    const next = place(board, index, turn);
    setBoard(next);
    if (mode === "two") {
      setTurn(turn === "X" ? "O" : "X");
      return;
    }
    if (winnerOf(next) || isDraw(next)) return;
    setThinking(true);
    window.setTimeout(() => {
      const reply = opponentMove(next, "O");
      setBoard(reply === null ? next : place(next, reply, "O"));
      setThinking(false);
    }, 420);
  }

  function again() {
    setBoard(EMPTY_BOARD);
    setTurn("X");
    setThinking(false);
  }

  return (
    <div>
      <p role="status" aria-live="polite" data-game-say className="text-[13px] text-fg-muted">{say}</p>
      <div ref={grid} className="relative mx-auto mt-3" style={{ width: 240, height: 240 }}>
        <div role="group" aria-label="Board" className="grid h-full w-full grid-cols-3 gap-[8px]">
          {board.map((cell, i) => (
            <button
              key={i}
              type="button"
              data-cell={i}
              disabled={over || cell !== null || thinking}
              aria-label={`${CELL_LABEL[i]}, ${cell ?? "empty"}`}
              onClick={() => play(i)}
              className="serif flex items-center justify-center rounded-[12px] border text-[30px] leading-none disabled:opacity-100"
              style={{ borderColor: "var(--chip-border)", color: cell ? "var(--accent)" : "transparent", minHeight: 44 }}
            >
              <span data-just={cell ? "" : undefined}>{cell ?? ""}</span>
            </button>
          ))}
        </div>
        {done ? (
          <svg className="pointer-events-none absolute inset-0" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
            <line
              data-win-line
              x1={41 + (done.line[0]! % 3) * 82} y1={41 + Math.floor(done.line[0]! / 3) * 82}
              x2={41 + (done.line[2]! % 3) * 82} y2={41 + Math.floor(done.line[2]! / 3) * 82}
              stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
            />
          </svg>
        ) : null}
      </div>
      {over ? (
        <button type="button" data-game-again onClick={again} className="btn-outline press mt-4 !py-[13px] !text-[13.5px]">Play again</button>
      ) : null}
    </div>
  );
}

function Quiz({ mode, reduce }: { mode: Mode; reduce: boolean }) {
  // Drawn once for the whole sitting, so a question never comes round twice however many
  // rounds are played.
  const sitting = useMemo<Asked[]>(() => drawSitting(), []);
  const [index, setIndex] = useState(0);
  const [inRound, setInRound] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [player, setPlayer] = useState<0 | 1>(0);
  const card = useRef<HTMLDivElement>(null);
  const asked = sitting[index];
  const roundOver = inRound >= ROUND || !asked;

  useEffect(() => {
    const el = card.current;
    if (!el || roundOver) return;
    animate(el, reduce ? { opacity: [0, 1], duration: 180 } : { opacity: [0, 1], rotateX: [-70, 0], duration: 320, ease: "outQuad" });
  }, [index, roundOver, reduce]);

  function answer(i: number) {
    if (chosen !== null || !asked) return;
    setChosen(i);
    if (i === asked.answer) {
      setScore((s) => (mode === "alone" ? [s[0] + 1, s[1]] : player === 0 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1]));
    }
  }

  function next() {
    setChosen(null);
    setIndex((n) => n + 1);
    setInRound((n) => n + 1);
    if (mode === "two") setPlayer((p) => (p === 0 ? 1 : 0));
  }

  function again() {
    setInRound(0);
    setChosen(null);
    setScore([0, 0]);
    setPlayer(0);
  }

  if (roundOver) {
    const out = !asked
      ? "That is every question. Well played."
      : mode === "alone"
        ? `${score[0]} out of ${ROUND}.`
        : score[0] === score[1] ? `A draw, ${score[0]} each.` : `Player ${score[0] > score[1] ? "one" : "two"} wins, ${Math.max(...score)} to ${Math.min(...score)}.`;
    return (
      <div>
        <p role="status" aria-live="polite" data-game-say className="text-[15px]">{out}</p>
        {asked ? <button type="button" data-game-again onClick={again} className="btn-outline press mt-4 !py-[13px] !text-[13.5px]">Another round</button> : null}
      </div>
    );
  }

  const right = chosen !== null && chosen === asked.answer;
  return (
    <div>
      <p className="flex items-center justify-between text-[12px] text-fg-muted">
        <span>{asked.question.topic}</span>
        <span className="tabular">{mode === "alone" ? `${score[0]} right` : `You ${score[0]} · Them ${score[1]}`}</span>
      </p>
      {mode === "two" ? <p role="status" aria-live="polite" className="mt-[2px] text-[12.5px] font-semibold text-accent" data-game-turn>{`Player ${player === 0 ? "one" : "two"}, your turn.`}</p> : null}
      <div ref={card} style={{ opacity: 0 }}>
        <p className="pretty mt-[8px] text-[15px] leading-[1.35]" data-question>{asked.question.ask}</p>
        <div className="mt-[10px] flex flex-col gap-[7px]" role="group" aria-label="Answers">
          {asked.options.map((option, i) => {
            const isAnswer = i === asked.answer;
            const show = chosen !== null && (isAnswer || i === chosen);
            return (
              <button
                key={option}
                type="button"
                data-answer={i}
                disabled={chosen !== null}
                onClick={() => answer(i)}
                aria-label={chosen !== null && isAnswer ? `${option}, the right answer` : option}
                className="press flex min-h-[44px] items-center rounded-[12px] border px-[14px] py-[11px] text-left text-[13.5px] leading-[1.3] disabled:opacity-100"
                style={{
                  borderColor: show ? (isAnswer ? "var(--accent)" : "var(--late-border)") : "var(--chip-border)",
                  color: show ? (isAnswer ? "var(--accent)" : "var(--late)") : "var(--fg)",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" aria-live="polite" data-game-say className="mt-[10px] min-h-[17px] text-[12.5px] text-fg-muted">
        {chosen === null ? "" : right ? "Right." : `Not that one. The answer is ${asked.options[asked.answer]}.`}
      </p>
      {chosen !== null ? (
        <button type="button" data-game-next onClick={next} className="btn-outline press mt-[6px] !py-[12px] !text-[13.5px]">Next question</button>
      ) : null}
    </div>
  );
}
