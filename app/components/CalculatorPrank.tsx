"use client";

import { useEffect, useState } from "react";
import { WindowControls } from "./WindowControls";

type CalculatorPrankProps = {
  expression: string;
  onClose: () => void;
};

const KEYPAD_ROWS = [
  ["C", "(", ")", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", ""],
];

const OPERATORS = new Set(["÷", "×", "−", "+", "(", ")", "."]);

export function CalculatorPrank({ expression, onClose }: CalculatorPrankProps) {
  const [display, setDisplay] = useState(expression || "0");
  const [isComingSoon, setIsComingSoon] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isComingSoon) {
        setIsComingSoon(false);
        return;
      }

      onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isComingSoon, onClose]);

  function handleKey(key: string) {
    if (!key) {
      return;
    }

    if (key === "C") {
      setDisplay("0");
      return;
    }

    if (key === "=") {
      setIsComingSoon(true);
      return;
    }

    setDisplay((current) => {
      const shouldReplaceZero = current === "0" && !OPERATORS.has(key);

      if (shouldReplaceZero) {
        return key;
      }

      return current + key;
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calculator"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]/90 p-3"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xs rounded-lg border border-term-line bg-term-panel p-3"
      >
        <div className="flex items-center justify-between px-1 pb-2">
          <WindowControls onClose={onClose} />
          <span className="font-mono text-[11px] text-term-dim">calculator</span>
        </div>

        <div className="mb-2 overflow-x-auto rounded-md border border-term-line bg-term-bg px-3 py-3 text-right font-mono text-2xl text-term-bright">
          <span className="whitespace-nowrap">{display}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {KEYPAD_ROWS.flatMap((row, rowIndex) =>
            row.map((key, keyIndex) => {
              if (!key) {
                return <span key={`${rowIndex}-${keyIndex}`} aria-hidden="true" />;
              }

              const isEquals = key === "=";
              const isAction = key === "C" || isEquals;

              return (
                <button
                  key={`${rowIndex}-${keyIndex}`}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={`rounded-md border py-3 font-mono text-sm transition-colors ${
                    isEquals
                      ? "border-term-brass/50 bg-term-brass/10 text-term-brass hover:bg-term-brass/20"
                      : isAction
                        ? "border-term-line bg-term-bg text-term-dim hover:text-term-bright"
                        : OPERATORS.has(key)
                          ? "border-term-line bg-term-bg text-term-brass hover:bg-term-line"
                          : "border-term-line bg-term-bg text-term-ink hover:bg-term-line"
                  }`}
                >
                  {key}
                </button>
              );
            })
          )}
        </div>
      </div>

      {isComingSoon ? (
        <div
          className="fixed inset-0 flex items-center justify-center bg-[#0b0b0b]/70 p-3"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <div className="w-full max-w-[240px] rounded-lg border border-term-line bg-term-panel p-4 text-center">
            <p className="font-mono text-sm text-term-bright">Feature coming soon :)</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-md border border-term-brass/50 bg-term-brass/10 py-2 font-mono text-xs text-term-brass transition-colors hover:bg-term-brass/20"
            >
              ok
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
