import { commands } from "./commands";

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

export const TELKOM_LOGO = dedentLines(TELKOM_LOGO_LINES);

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

export const NAME_ART = NAME_ART_LINES.join("\n");

export type Project = {
  name: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
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
    description:
      "Internship at ProCodeCG: full-stack LMS with role-based auth, a terminal playground, and LeetCode-style exercises.",
    linkLabel: "n/a",
  },
];

export type TerminalEntry =
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

export const helpLines: TerminalEntry[] = [
  { type: "muted", text: "Available commands:" },
  ...commands.map((command) => ({
    type: "output" as const,
    text: `  ${command.name.padEnd(10)} ${command.description}`,
  })),
];

export const aboutLines: TerminalEntry[] = [
  {
    type: "output",
    text: "Bachelor's graduate in Computer Engineering from Telkom University (2026) with expertise in Full Stack Web Development and IoT Embedded Systems.",
  },
  {
    type: "output",
    text: "Experienced in designing microcontroller and single-board computer hardware architectures (ESP32, STM32, Raspberry Pi) integrated with modern web applications (React.js, Node.js, PostgreSQL).",
  },
];

export type Experience = {
  title: string;
  organization?: string;
  period?: string;
  bullets?: string[];
};

export const experiences: Experience[] = [
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

export const finalEntries: TerminalEntry[] = [
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
