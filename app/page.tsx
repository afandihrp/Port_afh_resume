import type { Metadata } from "next";
import TerminalPortfolio from "./components/TerminalPortfolio";

export const metadata: Metadata = {
  title: "Afandi Web Developer - IoT/Embedded Engineer",
  description: "Terminal portfolio.",
};

export default function Home() {
  return <TerminalPortfolio />;
}
