import type { Metadata } from "next";
import TerminalPortfolio from "./components/TerminalPortfolio";

export const metadata: Metadata = {
  title: "Afandi — Software Engineer",
  description: "Terminal portfolio of Afandi, a software engineer building web products and small Linux tools.",
};

export default function Home() {
  return <TerminalPortfolio />;
}
