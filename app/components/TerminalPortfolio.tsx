"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { SuggestionList, useCommandSuggestions } from "./CommandSuggestions";
import { commands } from "./commands";
import { CalculatorPrank } from "./CalculatorPrank";
import { ResumeViewer } from "./ResumeViewer";
import { TopOutput } from "./TopOutput";
import { downloadResume } from "./resume";

const profile = {
  name: "Afandi",
  user: "afandi",
  host: "telkom",
  role: "Software Engineer",
  university: "Telkom University",
  major: "Computer Engineering",
  graduation: "August 2026",
  gpa: "3.52",
  email: "mafandiharahap@gmail.com",
  phone: "0851-6320-0490",
  whatsapp: "https://wa.me/6285163200490",
  github: "https://github.com/afandihrp",
  githubLabel: "github.com/afandihrp",
  stack: "TypeScript, React, Next.js, Go",
};

const TELKOM_LOGO_LINES = [
  "                                                     ",
  "                 **************        *#############",
  "                 *****************  #################",
  "                 ******************##################",
  "                 ******************##################",
  "                 ******************##################",
  "                 ******************##################",
  "                                ***###",
  "                                  *#",
  "",
  "",
  "",
  "                 ==========                ==========",
  "                 ===========              ===========",
  "                 ============             ===========",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============            ============",
  "                 ============**        +*============",
  "                  ===========*****+=*****===========",
  "                   ==========************==========",
  "                    =========************=========",
  "                     ========************========",
  "                       ======************======",
  "                         ====************====",
  "                             +***********",
];

// Trim the shared left padding so the art starts at the terminal edge.
function dedentLines(lines: string[]) {
  const visibleLines = lines.filter((line) => line.trim() !== "");
  const leftPaddings = visibleLines.map((line) => line.length - line.trimStart().length);
  const smallestPadding = Math.min(...leftPaddings);

  const dedentedLines = lines.map((line) => line.slice(smallestPadding));

  return dedentedLines.join("\n").trim();
}

const TELKOM_LOGO = dedentLines(TELKOM_LOGO_LINES);

const NAME_ART_LINES = [
  "                  ______  ____    ______  __  __  ____    ______     ",
  " /'\\_/`\\         /\\  _  \\/\\  _`\\ /\\  _  \\/\\ \\/\\ \\/\\  _`\\ /\\__  _\\    ",
  "/\\      \\        \\ \\ \\L\\ \\ \\ \\L\\_\\ \\ \\L\\ \\ \\ `\\\\ \\ \\ \\/\\ \\/_/\\ \\/    ",
  "\\ \\ \\__\\ \\        \\ \\  __ \\ \\  _\\/\\ \\  __ \\ \\ , ` \\ \\ \\ \\ \\ \\ \\ \\    ",
  " \\ \\ \\_/\\ \\  __    \\ \\ \\/\\ \\ \\ \\/  \\ \\ \\/\\ \\ \\ \\`\\ \\ \\ \\_\\ \\ \\_\\ \\__ ",
  "  \\ \\_\\\\ \\_\\/\\_\\    \\ \\_\\ \\_\\ \\_\\   \\ \\_\\ \\_\\ \\_\\ \\_\\ \\____/ /\\_____\\",
  "   \\/_/ \\/_/\\/_/     \\/_/\\/_/\\/_/    \\/_/\\/_/\\/_/\\/_/\\/___/  \\/_____/",
  "                                                                     ",
  "                                                                     ",
  " __  __  ______  ____    ______  __  __  ______  ____                ",
  "/\\ \\/\\ \\/\\  _  \\/\\  _`\\ /\\  _  \\/\\ \\/\\ \\/\\  _  \\/\\  _`\\              ",
  "\\ \\ \\_\\ \\ \\ \\L\\ \\ \\ \\L\\ \\ \\ \\L\\ \\ \\ \\_\\ \\ \\ \\L\\ \\ \\ \\L\\ \\            ",
  " \\ \\  _  \\ \\  __ \\ \\ ,  /\\ \\  __ \\ \\  _  \\ \\  __ \\ \\ ,__/            ",
  "  \\ \\ \\ \\ \\ \\ \\/\\ \\ \\ \\\\ \\\\ \\ \\/\\ \\ \\ \\ \\ \\ \\ \\/\\ \\ \\ \\/             ",
  "   \\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\             ",
  "    \\/_/\\/_/\\/_/\\/_/\\/ /\\/_/\\/_/\\/_/\\/_/\\/_/\\/_/\\/_/\\/_/  ",
];

const NAME_ART = NAME_ART_LINES.join("\n");

type Project = {
  name: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

const projects: Project[] = [
  {
    name: "system-monitor",
    description: "Linux telemetry dashboard backed by a small Go collector.",
    href: "/stats",
    linkLabel: "Open",
  },
  {
    name: "esp32cam-monitoring",
    description: "Final year project: low-cost poultry surveillance and security system.",
    href: "https://github.com/afandihrp/Sistem-Monitoring-Lahan-berbasis-ESP32CAM-relatif-murah",
    linkLabel: "GitHub",
  },
  {
    name: "e-LMS",
    description: "Internship at ProCodeCG: full-stack LMS with role-based auth, a terminal playground, and LeetCode-style exercises.",
    linkLabel: "n/a",
  },
];

type TerminalEntry =
  | { type: "command"; text: string }
  | { type: "output"; text: string }
  | { type: "muted"; text: string }
  | { type: "error"; text: string }
  | { type: "fetch" }
  | { type: "projects" }
  | { type: "experience" }
  | { type: "nameArt" }
  | { type: "top" }
  | { type: "contact" };

const helpLines: TerminalEntry[] = [
  { type: "muted", text: "Available commands:" },
  ...commands.map((command) => ({
    type: "output" as const,
    text: `  ${command.name.padEnd(10)} ${command.description}`,
  })),
];

const aboutLines: TerminalEntry[] = [
  {
    type: "output",
    text: "Bachelor's graduate in Computer Engineering from Telkom University (2026) with expertise in Full Stack Web Development and IoT Embedded Systems.",
  },
  {
    type: "output",
    text: "Experienced in designing microcontroller and single-board computer hardware architectures (ESP32, STM32, Raspberry Pi) integrated with modern web applications (React.js, Node.js, PostgreSQL).",
  },
];

type Experience = {
  title: string;
  organization?: string;
  period?: string;
  bullets?: string[];
};

const experiences: Experience[] = [
  {
    title: "Capstone Design Project — Low-Cost ESP32-Based Poultry Farm Security System",
    period: "Jan 2026 – Jun 2026",
    bullets: [
      "Designed and manufactured a 3D-printed camera enclosure in FreeCAD.",
      "Built a 24/7 low-latency surveillance dashboard with Vue.js and Express.js, deployed on a local mini PC at the partner's site for a fully free hosting solution with zero ongoing operational costs.",
      "Integrated a Telegram bot for instant security alerts and visual evidence, delivering real-time notifications to the farm owner's phone.",
      "Conducted user acceptance testing and unit tests across all APIs and WebSocket connections to keep security alerts reliable.",
      "Built a YOLO-based camera vision detection system to identify possible intruders.",
    ],
  },
  {
    title: "Full Stack Developer — Internship at ProCodeCG",
    period: "Jul 2025 – Aug 2025",
    bullets: [
      "Helped develop an interactive E-Learning Management System with ReactJS and ExpressJS, focusing on authentication and role-based authorization.",
      "Built an interactive terminal playground and LeetCode-style objective exercises for students.",
    ],
  },
  {
    title: "Lab Assistant – Robotics and Embedded Systems Technology (RnEST) Lab",
    organization: "Telkom University",
    period: "Jan 2025 – Dec 2025",
    bullets: [
      "Assisted students during lab sessions and provided technical guidance.",
      "Supported lab operations, tool preparation, and equipment maintenance.",
      "Participated in research projects and technical development activities.",
      "Community Service Initiative — Development and Implementation of an Integrated ESP32 Alarm System for SDN Cihanjaro.",
    ],
  },
];

const finalEntries: TerminalEntry[] = [
  { type: "command", text: "name" },
  { type: "nameArt" },
  { type: "command", text: "fetch" },
  { type: "fetch" },
  { type: "command", text: "about" },
  ...aboutLines,
  { type: "command", text: "projects" },
  { type: "projects" },
  { type: "muted", text: "Type `help` for available commands." },
];

// Module state keeps the intro from replaying on internal navigation.
let hasPlayedIntro = false;

function sleep(durationMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function Prompt() {
  return (
    <>
      <span className="text-term-red">{profile.user}</span>
      <span className="text-term-dim">@</span>
      <span className="text-term-bright">{profile.host}</span>
      <span className="text-term-dim">:~$</span>
    </>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const isExternalLink = href?.startsWith("http") ?? false;

  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-term-dim">{label}</dt>
      <dd className="min-w-0 text-term-ink">
        {href ? (
          <a
            href={href}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noreferrer" : undefined}
            className="text-term-brass underline decoration-term-brass/30 underline-offset-4 transition-colors hover:decoration-term-brass"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function FetchOutput() {
  return (
    <div className="my-3 flex flex-col gap-5 sm:flex-row sm:gap-8">
      <pre
        aria-hidden="true"
        className="select-none overflow-hidden text-[6px] leading-none text-term-brand/90 sm:text-[9px]"
      >
        {TELKOM_LOGO}
      </pre>

      <div className="min-w-0">
        <p>
          <span className="text-term-red">{profile.user}</span>
          <span className="text-term-dim">@</span>
          <span className="text-term-bright">{profile.host}</span>
        </p>
        <p className="text-term-line">-------------------</p>

        <dl className="mt-1 space-y-0.5 text-[12px] leading-6 sm:text-[13px]">
          <InfoRow label="University" value={profile.university} />
          <InfoRow label="Major" value={profile.major} />
          <InfoRow label="Graduation" value={profile.graduation} />
          <InfoRow label="GPA" value={profile.gpa} />
          <InfoRow label="Focus" value="Web, IoT/Embedded" />
          <InfoRow label="Stack" value={profile.stack} />
          <InfoRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
          <InfoRow label="WhatsApp" value={profile.phone} href={profile.whatsapp} />
          <InfoRow label="GitHub" value={profile.githubLabel} href={profile.github} />
        </dl>
      </div>
    </div>
  );
}

function ProjectLink({ project }: { project: Project }) {
  if (!project.href) {
    return <span className="text-term-dim">{project.linkLabel ?? "soon"}</span>;
  }

  const isExternalLink = project.href.startsWith("http");
  const linkClassName =
    "text-term-brass underline decoration-term-brass/30 underline-offset-4 transition-colors hover:decoration-term-brass";

  if (isExternalLink) {
    return (
      <a href={project.href} target="_blank" rel="noreferrer" className={linkClassName}>
        {project.linkLabel} ↗
      </a>
    );
  }

  return (
    <Link href={project.href} className={linkClassName}>
      {project.linkLabel} →
    </Link>
  );
}

function ProjectsOutput() {
  return (
    <div className="my-2 space-y-2">
      {projects.map((project) => (
        <div
          key={project.name}
          className="grid gap-0.5 sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-4"
        >
          <span className="text-term-bright">{project.name}</span>
          <span className="text-term-dim">{project.description}</span>
          <ProjectLink project={project} />
        </div>
      ))}
    </div>
  );
}

function ExperienceOutput() {
  return (
    <div className="my-3 space-y-8">
      {experiences.map((experience) => {
        const hasDetails = Boolean(experience.organization || experience.period);

        return (
          <div key={experience.title}>
            <p className="text-term-bright">{experience.title}</p>

            {hasDetails ? (
              <p className="text-term-dim">
                {[experience.organization, experience.period].filter(Boolean).join(" | ")}
              </p>
            ) : null}

            {experience.bullets ? (
              <ul className="mt-1 space-y-1 pl-3">
                {experience.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span aria-hidden="true" className="text-term-dim">
                      •
                    </span>
                    <span className="min-w-0 flex-1">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function NameArt() {
  return (
    <pre
      aria-label="M. AFANDI HARAHAP"
      className="my-2 select-none overflow-hidden font-mono text-[6px] leading-[1.15] text-term-brass sm:text-[10px]"
    >
      {NAME_ART}
    </pre>
  );
}

function ContactOutput() {
  return (
    <dl className="my-2 space-y-0.5">
      <InfoRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
      <InfoRow label="WhatsApp" value={profile.phone} href={profile.whatsapp} />
      <InfoRow label="GitHub" value={profile.githubLabel} href={profile.github} />
    </dl>
  );
}

function isCalculation(input: string) {
  const hasOnlyMathCharacters = /^[\d\s.+\-*/%()]+$/.test(input);
  const hasOperator = /[+\-*/%]/.test(input);
  const hasDigit = /\d/.test(input);

  return hasOnlyMathCharacters && hasOperator && hasDigit;
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
          <div aria-hidden="true" className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

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

              const lineClassName =
                entry.type === "error" ? "text-term-error" : entry.type === "muted" ? "text-term-dim" : "text-term-ink";

              return (
                <p key={index} className={`whitespace-pre-wrap break-words ${lineClassName}`}>
                  {entry.text}
                </p>
              );
            })}

            {phase === "intro" ? (
              <p className="mt-3 break-words">
                <Prompt /> <span className="text-term-bright">{typedCommand}</span>
                <span aria-hidden="true" className="terminal-cursor ml-0.5 inline-block h-4 w-2 bg-term-brass" />
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
