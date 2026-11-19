import type { Metadata } from "next";
import TerminalPortfolio from "../components/TerminalPortfolio";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Interactive terminal portfolio.",
};

export default function TerminalPage() {
  return <TerminalPortfolio />;
}
