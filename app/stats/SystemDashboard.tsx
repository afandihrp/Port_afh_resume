"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const MAX_HISTORY = 60;
const RAM_TOTAL_GB = 16;
const SAMPLE_INTERVAL_MS = 1000;
const ANIMATION_DURATION_MS = 600;
const CPU_COLOR = "#2f6f4e";
const RAM_COLOR = "#9a6b2f";
const COLLECTOR_URL = "http://localhost:5000/stats";
const COLLECTOR_TIMEOUT_MS = 800;

type CollectorResponse = {
  cpu_percent?: number;
  ram_percent?: number;
};

type StatsSource = "checking" | "live" | "dummy";

const STATUS_LABELS: Record<StatsSource, string> = {
  checking: "Checking · localhost:5000",
  live: "Live · localhost:5000",
  dummy: "Simulated · collector offline",
};

const SOURCE_DESCRIPTIONS: Record<StatsSource, string> = {
  checking: "Sampling CPU and RAM every second while checking the local collector.",
  live: "Live CPU and RAM sampled from the local collector at localhost:5000.",
  dummy: "A dummy 16 GB machine, sampled every second. Nothing here reads from your system.",
};

const FOOTER_LABELS: Record<StatsSource, string> = {
  checking: "Checking the local collector.",
  live: "Live data from the local collector.",
  dummy: "Simulated data. No real system metrics.",
};

const SOURCE_DOT_COLORS: Record<StatsSource, string | null> = {
  checking: null,
  live: CPU_COLOR,
  dummy: RAM_COLOR,
};

type ChartPoint = {
  x: number;
  y: number;
};

type ChartGeometry = {
  area: string;
  line: string;
  points: ChartPoint[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drift(current: number, step: number, min: number, max: number) {
  const change = (Math.random() - 0.5) * step;
  return clamp(current + change, min, max);
}

function appendSample(history: number[], sample: number) {
  return [...history.slice(-(MAX_HISTORY - 1)), sample];
}

// Deterministic seed keeps server and client markup identical during hydration.
function seedHistory(base: number, amplitude: number) {
  const history: number[] = [];

  for (let index = 0; index < MAX_HISTORY; index += 1) {
    const primaryWave = Math.sin(index / 5) * amplitude;
    const secondaryWave = Math.sin(index / 11) * amplitude * 0.5;
    history.push(clamp(base + primaryWave + secondaryWave, 5, 95));
  }

  return history;
}

function summarize(history: number[]) {
  const total = history.reduce((sum, value) => sum + value, 0);

  return {
    average: total / history.length,
    peak: Math.max(...history),
  };
}

function buildChartGeometry(history: number[], width: number, height: number): ChartGeometry {
  const padding = 6;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = history.map((value, index) => {
    const x = padding + (index / (history.length - 1)) * chartWidth;
    const y = padding + (1 - value / 100) * chartHeight;
    return { x, y };
  });

  const line = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const pathPoints = points.map((point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" L ");
  const baseline = height - padding;
  const area = `M ${firstPoint.x.toFixed(1)} ${baseline} L ${pathPoints} L ${lastPoint.x.toFixed(1)} ${baseline} Z`;

  return { area, line, points };
}

function isPercent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

async function fetchCollectorStats() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), COLLECTOR_TIMEOUT_MS);

  try {
    const response = await fetch(COLLECTOR_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as CollectorResponse;

    if (!isPercent(data.cpu_percent) || !isPercent(data.ram_percent)) {
      return null;
    }

    return { cpuPercent: data.cpu_percent, ramPercent: data.ram_percent };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function useSystemStats() {
  const [cpuHistory, setCpuHistory] = useState(() => seedHistory(34, 16));
  const [ramHistory, setRamHistory] = useState(() => seedHistory(58, 8));
  const [source, setSource] = useState<StatsSource>("checking");

  useEffect(() => {
    let cancelled = false;

    async function sample() {
      const liveStats = await fetchCollectorStats();
      if (cancelled) {
        return;
      }

      if (liveStats) {
        setSource("live");
        setCpuHistory((previous) => appendSample(previous, liveStats.cpuPercent));
        setRamHistory((previous) => appendSample(previous, liveStats.ramPercent));
        return;
      }

      setSource("dummy");
      setCpuHistory((previous) =>
        appendSample(previous, drift(previous[previous.length - 1], 16, 6, 94))
      );
      setRamHistory((previous) =>
        appendSample(previous, drift(previous[previous.length - 1], 5, 32, 90))
      );
    }

    sample();
    const timer = window.setInterval(sample, SAMPLE_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return { cpuHistory, ramHistory, source };
}

function useAnimatedNumber(target: number) {
  const [displayedValue, setDisplayedValue] = useState(target);
  const displayedRef = useRef(target);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const frameId = requestAnimationFrame(() => {
        displayedRef.current = target;
        setDisplayedValue(target);
      });

      return () => cancelAnimationFrame(frameId);
    }

    const startValue = displayedRef.current;
    const startTime = performance.now();
    let frameId = 0;

    function animateFrame(now: number) {
      const progress = Math.min((now - startTime) / ANIMATION_DURATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (target - startValue) * easedProgress;

      displayedRef.current = nextValue;
      setDisplayedValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animateFrame);
      }
    }

    frameId = requestAnimationFrame(animateFrame);

    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return displayedValue;
}

function Metric({
  label,
  percent,
  color,
  children,
}: {
  label: string;
  percent: number;
  color: string;
  children: ReactNode;
}) {
  const animatedPercent = useAnimatedNumber(percent);

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{label}</h2>

      <p className="mt-4 font-mono text-5xl font-medium tracking-tight tabular-nums text-ink">
        {animatedPercent.toFixed(1)}
        <span className="ml-1 text-xl text-muted">%</span>
      </p>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-rule">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${animatedPercent}%`, backgroundColor: color }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">{children}</div>
    </div>
  );
}

function HistoryChart({ cpuHistory, ramHistory }: { cpuHistory: number[]; ramHistory: number[] }) {
  const width = 720;
  const height = 200;
  const padding = 6;
  const chartHeight = height - padding * 2;
  const cpuGeometry = buildChartGeometry(cpuHistory, width, height);
  const ramGeometry = buildChartGeometry(ramHistory, width, height);
  const cpuLatest = cpuGeometry.points[cpuGeometry.points.length - 1];
  const ramLatest = ramGeometry.points[ramGeometry.points.length - 1];
  const gridLevels = [25, 50, 75];

  return (
    <section className="border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Last 60 seconds</h2>

        <div className="flex items-center gap-5 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CPU_COLOR }} />
            CPU
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RAM_COLOR }} />
            RAM
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-48 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="CPU and RAM usage over the last 60 seconds"
      >
        {gridLevels.map((level) => {
          const y = padding + (1 - level / 100) * chartHeight;
          return (
            <line
              key={level}
              x1="0"
              x2={width}
              y1={y}
              y2={y}
              stroke="var(--rule)"
              strokeDasharray="3 6"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <path d={ramGeometry.area} fill={RAM_COLOR} fillOpacity="0.08" />
        <path d={cpuGeometry.area} fill={CPU_COLOR} fillOpacity="0.08" />

        <polyline
          points={ramGeometry.line}
          fill="none"
          stroke={RAM_COLOR}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          className="chart-line"
        />
        <polyline
          points={cpuGeometry.line}
          fill="none"
          stroke={CPU_COLOR}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          className="chart-line"
        />

        <circle cx={ramLatest.x} cy={ramLatest.y} r="3" fill={RAM_COLOR} />
        <circle cx={cpuLatest.x} cy={cpuLatest.y} r="3" fill={CPU_COLOR} />
      </svg>
    </section>
  );
}

export default function SystemDashboard() {
  const { cpuHistory, ramHistory, source } = useSystemStats();

  const cpuPercent = cpuHistory[cpuHistory.length - 1];
  const ramPercent = ramHistory[ramHistory.length - 1];
  const cpuSummary = summarize(cpuHistory);
  const ramSummary = summarize(ramHistory);

  const ramUsedGB = (ramPercent / 100) * RAM_TOTAL_GB;
  const ramAvailableGB = RAM_TOTAL_GB - ramUsedGB;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-6 sm:py-8">
        <Link href="/" className="text-sm font-medium transition-colors hover:text-muted">
          ← Afandi
        </Link>
        <span className="flex items-center gap-2 font-mono text-xs text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-rule"
            style={
              SOURCE_DOT_COLORS[source] ? { backgroundColor: SOURCE_DOT_COLORS[source] } : undefined
            }
          />
          {STATUS_LABELS[source]}
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-20">
        <div className="border-b border-rule pb-8">
          <p className="text-sm text-muted">System monitor</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">CPU and RAM</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-strong">
            {SOURCE_DESCRIPTIONS[source]}
          </p>
        </div>

        {source === "dummy" ? (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-md border border-rule px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: RAM_COLOR }}
            />
            <div className="text-sm leading-6">
              <p className="font-medium text-ink">Go backend offline</p>
              <p className="mt-0.5 text-muted">
                Showing dummy data. Start the collector at{" "}
                <span className="font-mono text-xs">localhost:5000</span> to switch to live metrics.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-10 py-10 sm:grid-cols-2 sm:gap-0">
          <div className="sm:pr-10">
            <Metric label="CPU usage" percent={cpuPercent} color={CPU_COLOR}>
              <span>
                60s avg <span className="font-mono text-ink">{cpuSummary.average.toFixed(1)}%</span>
              </span>
              <span>
                Peak <span className="font-mono text-ink">{cpuSummary.peak.toFixed(1)}%</span>
              </span>
            </Metric>
          </div>

          <div className="sm:border-l sm:border-rule sm:pl-10">
            <Metric label="Memory usage" percent={ramPercent} color={RAM_COLOR}>
              <span>
                <span className="font-mono text-ink">{ramUsedGB.toFixed(1)} GB</span> used
              </span>
              <span>
                <span className="font-mono text-ink">{ramAvailableGB.toFixed(1)} GB</span> free
              </span>
              <span>
                60s avg <span className="font-mono text-ink">{ramSummary.average.toFixed(1)}%</span>
              </span>
            </Metric>
          </div>
        </div>

        <HistoryChart cpuHistory={cpuHistory} ramHistory={ramHistory} />

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6 text-xs text-muted">
          <span>{FOOTER_LABELS[source]}</span>
          <Link href="/" className="transition-colors hover:text-ink">
            Portfolio →
          </Link>
        </footer>
      </main>
    </div>
  );
}
