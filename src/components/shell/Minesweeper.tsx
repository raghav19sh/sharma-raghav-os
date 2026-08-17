"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Bomb, Flag, RotateCcw, X } from "lucide-react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type GameStatus = "playing" | "won" | "lost";

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function createBoard(): Cell[][] {
  const board = createEmptyBoard();

  let minesPlaced = 0;

  while (minesPlaced < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);

    if (board[row]![col]!.mine) continue;

    board[row]![col]!.mine = true;
    minesPlaced++;
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row]![col]!.mine) continue;

      let count = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;

          const nr = row + dr;
          const nc = col + dc;

          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr]![nc]!.mine
          ) {
            count++;
          }
        }
      }

      board[row]![col]!.adjacent = count;
    }
  }

  return board;
}

export function Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(() =>
    createBoard()
  );

  const [status, setStatus] =
    useState<GameStatus>("playing");

  const [isOpen, setIsOpen] = useState(false);

  const [miniPosition, setMiniPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const hasDragged = useRef(false);

  useEffect(() => {
    setMiniPosition({
      x: window.innerWidth - 145,
      y: window.innerHeight - 100,
    });
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setStatus("playing");
  }, []);

  function revealCell(row: number, col: number) {
    if (status !== "playing") return;

    if (
      board[row]![col]!.revealed ||
      board[row]![col]!.flagged
    ) {
      return;
    }

    const nextBoard = board.map((line) =>
      line.map((cell) => ({ ...cell }))
    );

    if (nextBoard[row]![col]!.mine) {
      for (const line of nextBoard) {
        for (const cell of line) {
          if (cell.mine) {
            cell.revealed = true;
          }
        }
      }

      setBoard(nextBoard);
      setStatus("lost");
      return;
    }

    const queue: [number, number][] = [[row, col]];
    const visited = new Set<string>();

    while (queue.length) {
      const [currentRow, currentCol] =
        queue.shift()!;

      const key = `${currentRow}-${currentCol}`;

      if (visited.has(key)) continue;

      visited.add(key);

      const cell =
        nextBoard[currentRow]![currentCol]!;

      if (cell.flagged || cell.mine) continue;

      cell.revealed = true;

      if (cell.adjacent !== 0) continue;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = currentRow + dr;
          const nc = currentCol + dc;

          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS
          ) {
            const neighbor =
              nextBoard[nr]![nc]!;

            if (
              !neighbor.mine &&
              !neighbor.flagged &&
              !neighbor.revealed
            ) {
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    const safeCells = nextBoard
      .flat()
      .filter((cell) => !cell.mine);

    const revealedSafeCells =
      safeCells.filter(
        (cell) => cell.revealed
      );

    setBoard(nextBoard);

    if (
      revealedSafeCells.length ===
      safeCells.length
    ) {
      setStatus("won");
    }
  }

  function toggleFlag(
    event: React.MouseEvent,
    row: number,
    col: number
  ) {
    event.preventDefault();

    if (status !== "playing") return;

    const cell = board[row]![col]!;

    if (cell.revealed) return;

    const nextBoard = board.map((line) =>
      line.map((item) => ({ ...item }))
    );

    nextBoard[row]![col]!.flagged =
      !nextBoard[row]![col]!.flagged;

    setBoard(nextBoard);
  }

  function handleMiniPointerDown(
    event: PointerEvent<HTMLButtonElement>
  ) {
    event.preventDefault();

    const rect =
      event.currentTarget.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    hasDragged.current = false;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleMiniPointerMove(
    event: PointerEvent<HTMLButtonElement>
  ) {
    if (!isDragging) return;

    const distance = Math.sqrt(
      Math.pow(
        event.clientX - dragStart.current.x,
        2
      ) +
        Math.pow(
          event.clientY - dragStart.current.y,
          2
        )
    );

    if (distance > 6) {
      hasDragged.current = true;
    }

    const size = 52;

    setMiniPosition({
      x: Math.max(
        8,
        Math.min(
          event.clientX - dragOffset.current.x,
          window.innerWidth - size - 8
        )
      ),
      y: Math.max(
        8,
        Math.min(
          event.clientY - dragOffset.current.y,
          window.innerHeight - size - 8
        )
      ),
    });
  }

  function handleMiniPointerUp(
    event: PointerEvent<HTMLButtonElement>
  ) {
    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture may already be released.
    }
  }

  /*
   * MINI BUTTON
   */
  if (!isOpen) {
    return (
      <button
        type="button"
        onPointerDown={handleMiniPointerDown}
        onPointerMove={handleMiniPointerMove}
        onPointerUp={handleMiniPointerUp}
        onClick={() => setIsOpen(true)}
        aria-label="Open Minesweeper"
        className="
          fixed
          z-[9999]
          flex
          h-[52px]
          w-[52px]
          items-center
          justify-center
          rounded-full
          border
          border-[var(--border)]
          bg-[var(--surface)]
          text-[var(--text-1)]
          shadow-[var(--shadow-lg)]
          backdrop-blur-xl
          select-none
          touch-none
          transition
          hover:scale-110
          active:scale-95
        "
        style={{
          left: `${miniPosition.x}px`,
          top: `${miniPosition.y}px`,
          cursor: isDragging
            ? "grabbing"
            : "grab",
        }}
      >
        <Bomb size={20} />
      </button>
    );
  }

  /*
   * FULL GAME
   */
  return (
    <div
      className="
        fixed
        bottom-5
        right-5
        z-[9999]
        w-[330px]
        max-w-[calc(100vw-24px)]
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface)]/95
        p-4
        text-[var(--text-1)]
        shadow-[var(--shadow-lg)]
        backdrop-blur-xl
      "
    >
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-[var(--lavender-tint)]
              text-[var(--lavender-text)]
            "
          >
            <Bomb size={17} />
          </div>

          <div>
            <div
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[var(--text-2)]
              "
            >
              Minesweeper
            </div>

            <div className="text-xs text-[var(--text-2)]">
              {MINES} mines · 9×9
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Minimize Minesweeper"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-[var(--text-2)]
            transition
            hover:bg-[var(--lavender-tint)]
            hover:text-[var(--text-1)]
          "
        >
          <X size={18} />
        </button>
      </div>

      {/* STATUS */}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          rounded-lg
          border
          border-[var(--border)]
          px-3
          py-2
          text-xs
        "
      >
        <span>
          {status === "playing"
            ? "Find all mines"
            : status === "won"
              ? "You won!"
              : "Game over"}
        </span>

        <button
          type="button"
          onClick={resetGame}
          aria-label="Restart Minesweeper"
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-md
            text-[var(--text-2)]
            transition
            hover:bg-[var(--lavender-tint)]
            hover:text-[var(--text-1)]
          "
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* BOARD */}

      <div
        className="
          mt-4
          grid
          grid-cols-9
          overflow-hidden
          rounded-lg
          border
          border-[var(--border-strong)]
        "
        onContextMenu={(event) =>
          event.preventDefault()
        }
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const numberClasses: Record<
              number,
              string
            > = {
              1: "text-blue-600",
              2: "text-green-600",
              3: "text-red-600",
              4: "text-indigo-700",
              5: "text-amber-700",
              6: "text-cyan-700",
              7: "text-black",
              8: "text-gray-500",
            };

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() =>
                  revealCell(
                    rowIndex,
                    colIndex
                  )
                }
                onContextMenu={(event) =>
                  toggleFlag(
                    event,
                    rowIndex,
                    colIndex
                  )
                }
                className={`
                  aspect-square
                  border-r
                  border-b
                  border-[var(--border)]
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-bold
                  transition
                  ${
                    cell.revealed
                      ? "bg-[var(--bg)]"
                      : "bg-[var(--surface)] hover:bg-[var(--lavender-tint)]"
                  }
                `}
              >
                {cell.revealed &&
                  cell.mine && (
                    <Bomb
                      size={13}
                      className="text-[var(--red)]"
                    />
                  )}

                {!cell.revealed &&
                  cell.flagged && (
                    <Flag
                      size={13}
                      className="text-[var(--lavender)]"
                    />
                  )}

                {cell.revealed &&
                  !cell.mine &&
                  cell.adjacent > 0 && (
                    <span
                      className={
                        numberClasses[
                          cell.adjacent
                        ] ??
                        "text-[var(--text-1)]"
                      }
                    >
                      {cell.adjacent}
                    </span>
                  )}
              </button>
            );
          })
        )}
      </div>

      {/* HELP */}

      <div
        className="
          mt-3
          text-center
          text-[10px]
          text-[var(--text-2)]
        "
      >
        Left click to reveal · Right click to flag
      </div>
    </div>
  );
}