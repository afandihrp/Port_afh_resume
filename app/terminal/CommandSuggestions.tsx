"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { commands } from "./commands";
import type { CommandInfo } from "./commands";

type SuggestionListProps = {
  suggestions: CommandInfo[];
  highlightedIndex: number;
  onSelect: (commandName: string) => void;
};

export function useCommandSuggestions(input: string, onComplete: (commandName: string) => void) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const query = input.trim().toLowerCase();
  const suggestions = query
    ? commands.filter((command) => command.name.startsWith(query)).slice(0, 5)
    : [];

  // Modulo keeps the highlight valid when the input narrows the list.
  const activeIndex = suggestions.length === 0 ? 0 : highlightedIndex % suggestions.length;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      onComplete(suggestions[activeIndex].name);
    }
  }

  return { suggestions, highlightedIndex: activeIndex, handleKeyDown };
}

export function SuggestionList({ suggestions, highlightedIndex, onSelect }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      role="listbox"
      className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-md border border-term-line bg-term-panel"
    >
      {suggestions.map((command, index) => (
        <li key={command.name} role="option" aria-selected={index === highlightedIndex}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(command.name)}
            className={`flex w-full gap-4 px-3 py-1 text-left font-mono text-[11px] ${
              index === highlightedIndex ? "bg-term-line text-term-bright" : "text-term-ink"
            }`}
          >
            <span>{command.name}</span>
            <span className="text-term-dim">{command.description}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
