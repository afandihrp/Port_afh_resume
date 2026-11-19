"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CalculatorPrank } from "../components/CalculatorPrank";
import { WindowControls } from "../components/WindowControls";
import { ResumeViewer } from "../components/ResumeViewer";
import { downloadResume } from "../components/resume";
import { profile } from "../data/profile";
import { SuggestionList, useCommandSuggestions } from "./CommandSuggestions";
import { TopOutput } from "./TopOutput";
import { aboutLines, finalEntries, helpLines } from "./terminal-data";
import type { TerminalEntry } from "./terminal-data";
import {
  ContactOutput,
  ExperienceOutput,
  FetchOutput,
  NameArt,
  ProjectsOutput,
  Prompt,
} from "./terminal-outputs";

// Module state keeps the intro from replaying on internal navigation.
let hasPlayedIntro = false;

function sleep(durationMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function isCalculation(input: string) {
  const hasOnlyMathCharacters = /^[\d\s.+\-*/%()]+$/.test(input);
  const hasOperator = /[+\-*/%]/.test(input);
  const hasDigit = /\d/.test(input);

  return hasOnlyMathCharacters && hasOperator && hasDigit;
}

function getLineClassName(entry: TerminalEntry) {
  if (entry.type === "error") {
    return "text-term-error";
  }

  if (entry.type === "muted") {
    return "text-term-dim";
  }

  return "text-term-ink";
}

export default function TerminalPortfolio() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<TerminalEntry[]>(() => (hasPlayedIntro ? finalEntries : []));
  const [typedCommand, setTypedCommand] = useState("");
  const [phase, setPhase] = useState<"intro" | "ready">(hasPlayedIntro ? "ready" : "intro");
  const [input, setInput] = useState("");
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [calculatorExpression, setCalculatorExpression] = useState<string | null>(null);

  const { suggestions, highlightedIndex, handleKeyDown } = useCommandSuggestions(input, (commandName) =>
    setInput(`${commandName} `)
  );

  useEffect(() => {
    if (hasPlayedIntro) {
      return;
    }

    let cancelled = false;

    async function typeCommand(command: string) {
      for (let index = 1; index <= command.length; index += 1) {
        if (cancelled) {
          return false;
        }

        setTypedCommand(command.slice(0, index));
        await sleep(100);
      }

      return true;
    }

    async function runIntro() {
      await sleep(400);
      if (cancelled) {
        return;
      }

      const typedName = await typeCommand("name");
      if (!typedName) {
        return;
      }

      setTypedCommand("");
      setEntries((previous) => [...previous, { type: "command", text: "name" }, { type: "nameArt" }]);
      await sleep(900);
      if (cancelled) {
        return;
      }

      const typedFetch = await typeCommand("fetch");
      if (!typedFetch) {
        return;
      }

      setTypedCommand("");
      setEntries((previous) => [...previous, { type: "command", text: "fetch" }, { type: "fetch" }]);
      await sleep(600);
      if (cancelled) {
        return;
      }

      const typedAbout = await typeCommand("about");
      if (!typedAbout) {
        return;
      }

      setTypedCommand("");
      setEntries((previous) => [...previous, { type: "command", text: "about" }, ...aboutLines]);
      await sleep(600);
      if (cancelled) {
        return;
      }

      const typedProjects = await typeCommand("projects");
      if (!typedProjects) {
        return;
      }

      setTypedCommand("");
      setEntries((previous) => [...previous, { type: "command", text: "projects" }, { type: "projects" }]);
      await sleep(350);
      if (cancelled) {
        return;
      }

      setEntries((previous) => [...previous, { type: "muted", text: "Type `help` for available commands." }]);
      hasPlayedIntro = true;
      setPhase("ready");
    }

    runIntro();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready") {
      return;
    }

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (hasFinePointer) {
      inputRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [entries, typedCommand, phase]);

  function addEntries(newEntries: TerminalEntry[]) {
    setEntries((previous) => [...previous, ...newEntries]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const command = input.trim();
    if (!command) {
      return;
    }

    setInput("");
    setEntries((previous) => [...previous, { type: "command", text: command }]);

    if (isCalculation(command)) {
      setCalculatorExpression(command);
      return;
    }

    const [name, argument] = command.toLowerCase().split(/\s+/);

    switch (name) {
      case "help":
        addEntries(helpLines);
        return;
      case "fetch":
        addEntries([{ type: "fetch" }]);
        return;
      case "projects":
        addEntries([{ type: "projects" }]);
        return;
      case "experience":
        addEntries([{ type: "experience" }]);
        return;
      case "ls":
        if (argument === "projects") {
          addEntries([{ type: "projects" }]);
          return;
        }
        addEntries([{ type: "output", text: "about  contact  experience  projects  stats" }]);
        return;
      case "about":
      case "cat":
        if (name === "cat" && argument !== "about.txt") {
          addEntries([{ type: "error", text: `cat: ${argument ?? ""}: No such file or directory` }]);
          return;
        }
        addEntries(aboutLines);
        return;
      case "name":
        addEntries([{ type: "nameArt" }]);
        return;
      case "contact":
        addEntries([{ type: "contact" }]);
        return;
      case "calc":
      case "calculator":
        setCalculatorExpression("0");
        return;
      case "resume":
        if (argument === "-download") {
          downloadResume();
          return;
        }

        if (argument) {
          addEntries([
            { type: "error", text: `resume: unknown option "${argument}"` },
            { type: "muted", text: "Usage: resume [-download]" },
          ]);
          return;
        }

        addEntries([{ type: "muted", text: "Opening resume..." }]);
        setIsResumeOpen(true);
        return;
      case "whoami":
        addEntries([{ type: "output", text: `${profile.name} — ${profile.role}` }]);
        return;
      case "top":
        addEntries([{ type: "top" }]);
        return;
      case "stats":
        addEntries([{ type: "muted", text: "Opening system monitor..." }]);
        window.setTimeout(() => router.push("/stats"), 350);
        return;
      case "email":
        addEntries([{ type: "muted", text: `Opening mail to ${profile.email}...` }]);
        window.location.href = `mailto:${profile.email}`;
        return;
      case "github":
        addEntries([{ type: "muted", text: `Opening ${profile.githubLabel}...` }]);
        window.open(profile.github, "_blank", "noreferrer");
        return;
      case "clear":
        setEntries([]);
        return;
      default:
        addEntries([
          { type: "error", text: `command not found: ${command}` },
          { type: "muted", text: "Type `help` for available commands." },
        ]);
    }
  }

  return (
    <div className="terminal-page flex min-h-screen items-center justify-center bg-term-bg p-3 sm:p-6">
      <div className="flex h-[calc(100dvh-1.5rem)] max-h-[900px] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-term-line bg-term-panel shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9)] sm:h-[calc(100dvh-3rem)]">
        <header className="relative flex items-center gap-2 border-b border-term-line px-4 py-2.5">
          <WindowControls onClose={() => router.push("/")} />

          <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-term-dim">
            Terminal
          </span>
        </header>

        <div
          ref={scrollRef}
          className="terminal-scroll flex-1 overflow-y-auto px-4 py-4 font-mono text-[12px] leading-6 text-term-ink sm:px-6 sm:py-5 sm:text-[13px]"
        >
          <div role="log" aria-live={phase === "ready" ? "polite" : "off"}>
            {entries.map((entry, index) => {
              if (entry.type === "fetch") {
                return <FetchOutput key={index} />;
              }

              if (entry.type === "projects") {
                return <ProjectsOutput key={index} />;
              }

              if (entry.type === "experience") {
                return <ExperienceOutput key={index} />;
              }

              if (entry.type === "contact") {
                return <ContactOutput key={index} />;
              }

              if (entry.type === "nameArt") {
                return <NameArt key={index} />;
              }

              if (entry.type === "top") {
                return <TopOutput key={index} />;
              }

              if (entry.type === "command") {
                return (
                  <p key={index} className="mt-3 break-words">
                    <Prompt /> <span className="text-term-bright">{entry.text}</span>
                  </p>
                );
              }

              const lineClassName = getLineClassName(entry);

              return (
                <p key={index} className={`whitespace-pre-wrap break-words ${lineClassName}`}>
                  {entry.text}
                </p>
              );
            })}

            {phase === "intro" ? (
              <p className="mt-3 break-words">
                <Prompt /> <span className="text-term-bright">{typedCommand}</span>
                <span
                  aria-hidden="true"
                  className="terminal-cursor ml-0.5 inline-block h-4 w-2 bg-term-brass"
                />
              </p>
            ) : null}
          </div>

          {phase === "ready" ? (
            <div className="relative mt-3">
              <SuggestionList
                suggestions={suggestions}
                highlightedIndex={highlightedIndex}
                onSelect={(commandName) => setInput(`${commandName} `)}
              />
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Prompt />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Terminal command"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="type help"
                  className="min-w-0 flex-1 bg-transparent text-term-bright caret-term-brass outline-none placeholder:text-term-dim"
                />
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <ResumeViewer isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />

      {calculatorExpression === null ? null : (
        <CalculatorPrank
          key={calculatorExpression}
          expression={calculatorExpression}
          onClose={() => setCalculatorExpression(null)}
        />
      )}
    </div>
  );
}
