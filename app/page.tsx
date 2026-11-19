import type { Metadata } from "next";
import Desktop from "./Desktop";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Afandi — software engineer and IoT/embedded developer.",
};

export default function Home() {
  return <Desktop />;
}
