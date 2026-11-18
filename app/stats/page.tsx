import type { Metadata } from "next";
import SystemDashboard from "./SystemDashboard";

export const metadata: Metadata = {
  title: "System Monitor",
  description: "Animated CPU and RAM dashboard with simulated telemetry",
};

export default function StatsPage() {
  return <SystemDashboard />;
}
