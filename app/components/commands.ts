export type CommandInfo = {
  name: string;
  description: string;
};

export const commands: CommandInfo[] = [
  { name: "fetch", description: "profile and university logo" },
  { name: "about", description: "a short introduction" },
  { name: "name", description: "print my name" },
  { name: "projects", description: "list selected work" },
  { name: "experience", description: "work history" },
  { name: "contact", description: "email and GitHub" },
  { name: "resume", description: "view or download my CV" },
  { name: "top", description: "real hardware snapshot from the browser" },
  { name: "stats", description: "open the system monitor" },
  { name: "whoami", description: "print the current user" },
  { name: "clear", description: "clear the terminal" },
];
