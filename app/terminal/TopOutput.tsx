"use client";

import { useEffect, useState } from "react";

type HardwareInfo = {
  cores: number | null;
  memoryGb: number | null;
  architecture: string | null;
  platform: string | null;
  display: string;
  storageUsedGb: number | null;
  storageQuotaGb: number | null;
};

type UserAgentData = {
  getHighEntropyValues: (keys: string[]) => Promise<{ architecture?: string; bitness?: string }>;
};

const GIGABYTE = 1024 ** 3;

function formatArchitecture(values: { architecture?: string; bitness?: string } | null) {
  if (!values?.architecture) {
    return null;
  }

  if (values.architecture === "x86" && values.bitness === "64") {
    return "x86_64";
  }

  if (values.architecture === "arm" && values.bitness === "64") {
    return "arm64";
  }

  return values.architecture;
}

function buildStorageBar(percent: number, width = 20) {
  const filled = Math.round((percent / 100) * width);

  return "|".repeat(filled) + " ".repeat(width - filled);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-term-dim">{label}</span>
      <span className="min-w-0 text-term-bright">{value}</span>
    </div>
  );
}

export function TopOutput() {
  const [info, setInfo] = useState<HardwareInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function collect() {
      const browserNavigator = navigator as Navigator & {
        deviceMemory?: number;
        userAgentData?: UserAgentData;
      };

      let architecture: string | null = null;
      try {
        if (browserNavigator.userAgentData) {
          const values = await browserNavigator.userAgentData.getHighEntropyValues([
            "architecture",
            "bitness",
          ]);
          architecture = formatArchitecture(values);
        }
      } catch {
        // High-entropy values are optional and may be blocked.
      }

      let storageUsedGb: number | null = null;
      let storageQuotaGb: number | null = null;
      try {
        const estimate = await navigator.storage.estimate();

        if (
          typeof estimate.usage === "number" &&
          typeof estimate.quota === "number" &&
          estimate.quota > 0
        ) {
          storageUsedGb = estimate.usage / GIGABYTE;
          storageQuotaGb = estimate.quota / GIGABYTE;
        }
      } catch {
        // Storage estimates are optional; the row falls back to n/a.
      }

      if (cancelled) {
        return;
      }

      setInfo({
        cores: navigator.hardwareConcurrency || null,
        memoryGb: browserNavigator.deviceMemory ?? null,
        architecture,
        platform: navigator.platform || null,
        display: `${window.screen.width}×${window.screen.height} @${window.devicePixelRatio || 1}x`,
        storageUsedGb,
        storageQuotaGb,
      });
    }

    collect();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) {
    return <p className="my-2 text-term-dim">Collecting hardware info...</p>;
  }

  const storageUsedGb = info.storageUsedGb;
  const storageQuotaGb = info.storageQuotaGb;
  const hasStorage = storageUsedGb !== null && storageQuotaGb !== null && storageQuotaGb > 0;

  let storageLine = "n/a";
  if (storageUsedGb !== null && storageQuotaGb !== null && storageQuotaGb > 0) {
    const percent = Math.round((storageUsedGb / storageQuotaGb) * 100);
    storageLine = `[${buildStorageBar(percent)}] ${String(percent).padStart(3)}%`;
  }

  return (
    <div className="my-2 space-y-0.5">
      <p className="text-term-dim">
        snapshot - {new Date().toLocaleTimeString([], { hour12: false })}
      </p>

      <Row label="Cores" value={info.cores ? String(info.cores) : "n/a"} />
      <Row label="Arch" value={info.architecture ?? "n/a"} />
      <Row label="Memory" value={info.memoryGb ? `${info.memoryGb} GB (approx)` : "n/a"} />
      <Row label="Platform" value={info.platform ?? "n/a"} />
      <Row label="Display" value={info.display} />

      <div className="pt-1">
        <Row label="Storage" value={storageLine} />

        {hasStorage && storageUsedGb !== null && storageQuotaGb !== null ? (
          <div className="flex gap-2">
            <span className="w-16 shrink-0" />
            <span className="text-term-dim">
              {storageUsedGb.toFixed(1)} / {storageQuotaGb.toFixed(0)} GB used
            </span>
          </div>
        ) : null}
      </div>

      <p className="pt-1 text-term-dim">
        Values reported by the browser; unavailable fields show n/a.
      </p>
    </div>
  );
}
