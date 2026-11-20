"use client";

import { useEffect, useMemo, useState } from "react";
import { WindowControls } from "./WindowControls";

const COLUMNS = 64;
const ROWS = 64;
const TICK_MS = 125;

const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const GLIDER = [
  [0, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
];

const GLIDER_STARTS = [
  [2, 2],
  [8, 26],
  [20, 50],
];

const BUTTON_CLASS_NAME =
  "rounded-md border border-term-line bg-term-bg px-3 py-1.5 text-term-dim transition-colors hover:border-term-brass/60 hover:text-term-brass";

const PRIMARY_BUTTON_CLASS_NAME =
  "rounded-md border border-term-brass/50 bg-term-brass/10 px-3 py-1.5 text-term-brass transition-colors hover:bg-term-brass/20";

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array<boolean>(COLUMNS).fill(false));
}

function createRandomGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLUMNS }, () => Math.random() > 0.72)
  );
}

function createInitialGrid() {
  const grid = createRandomGrid();

  for (const [startRow, startColumn] of GLIDER_STARTS) {
    for (const [rowOffset, columnOffset] of GLIDER) {
      grid[startRow + rowOffset][startColumn + columnOffset] = true;
    }
  }

  return grid;
}

function countNeighbors(grid: boolean[][], row: number, column: number) {
  let neighbors = 0;

  for (const [rowOffset, columnOffset] of NEIGHBOR_OFFSETS) {
    const neighborRow = row + rowOffset;
    const neighborColumn = column + columnOffset;
    const isInsideGrid =
      neighborRow >= 0 && neighborRow < ROWS && neighborColumn >= 0 && neighborColumn < COLUMNS;

    if (isInsideGrid && grid[neighborRow][neighborColumn]) {
      neighbors += 1;
    }
  }

  return neighbors;
}

function getNextCellState(isAlive: boolean, neighbors: number) {
  if (isAlive) {
    return neighbors === 2 || neighbors === 3;
  }

  return neighbors === 3;
}

function nextGeneration(grid: boolean[][]) {
  const nextGrid = createEmptyGrid();

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const neighbors = countNeighbors(grid, row, column);
      nextGrid[row][column] = getNextCellState(grid[row][column], neighbors);
    }
  }

  return nextGrid;
}

type GameOfLifeProps = {
  onClose: () => void;
};

export function GameOfLife({ onClose }: GameOfLifeProps) {
  const [grid, setGrid] = useState(createInitialGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);

  const population = useMemo(() => grid.flat().filter(Boolean).length, [grid]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setGrid((current) => nextGeneration(current));
      setGeneration((current) => current + 1);
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function advanceOneStep() {
    setGrid((current) => nextGeneration(current));
    setGeneration((current) => current + 1);
  }

  function randomize() {
    setGrid(createRandomGrid());
    setGeneration(0);
  }

  function clear() {
    setGrid(createEmptyGrid());
    setGeneration(0);
    setIsRunning(false);
  }

  const status = isRunning ? "running" : "paused";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game of Life"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]/90 p-3 sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-term-line bg-term-panel"
      >
        <header className="relative flex items-center gap-2 border-b border-term-line px-4 py-2.5">
          <WindowControls onClose={onClose} />

          <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-term-dim">
            Game of Life
          </span>
        </header>

        <div className="p-3 sm:p-4">
          <svg
            viewBox={`0 0 ${COLUMNS} ${ROWS}`}
            role="img"
            aria-label="Conway's Game of Life grid"
            shapeRendering="crispEdges"
            style={{ maxWidth: "min(100%, 60dvh)" }}
            className="mx-auto block w-full rounded-md border border-term-line"
          >
            <rect x={0} y={0} width={COLUMNS} height={ROWS} className="fill-term-panel" />

            {grid.map((row, rowIndex) =>
              row.map((isAlive, columnIndex) => (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={columnIndex + 0.06}
                  y={rowIndex + 0.06}
                  width={0.88}
                  height={0.88}
                  className={isAlive ? "fill-term-brass" : "fill-term-bg"}
                />
              ))
            )}
          </svg>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-term-dim">
            <span>
              generation {generation} · population {population} · {status}
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsRunning((current) => !current)}
                className={PRIMARY_BUTTON_CLASS_NAME}
              >
                {isRunning ? "pause" : "play"}
              </button>
              <button type="button" onClick={advanceOneStep} className={BUTTON_CLASS_NAME}>
                step
              </button>
              <button type="button" onClick={randomize} className={BUTTON_CLASS_NAME}>
                randomize
              </button>
              <button type="button" onClick={clear} className={BUTTON_CLASS_NAME}>
                clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
