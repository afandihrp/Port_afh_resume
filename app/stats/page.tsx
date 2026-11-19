import type { Metadata } from "next";
import SystemDashboard from "./SystemDashboard";

export const metadata: Metadata = {
  title: "System Monitor",
  description: "Live CPU and RAM dashboard with a simulated fallback when the collector is offline.",
};

export default function StatsPage() {
  return <SystemDashboard />;
}
