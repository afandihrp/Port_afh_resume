"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalculatorPrank } from "./CalculatorPrank";
import { ResumeViewer } from "./ResumeViewer";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type AppTileProps = {
  label: string;
  description: string;
  glyph: string;
  href?: string;
  onClick?: () => void;
};

function AppTile({ label, description, glyph, href, onClick }: AppTileProps) {
  const className =
    "flex min-h-28 flex-col items-start gap-2 rounded-lg border border-term-line bg-term-bg p-3 text-left transition-colors hover:border-term-brass/60 hover:bg-term-line/40 focus-visible:border-term-brass focus-visible:outline-none";

  const content = (
    <>
      <span aria-hidden="true" className="font-mono text-xl text-term-brass">
        {glyph}
      </span>
      <span className="font-mono text-sm text-term-bright">{label}</span>
      <span className="font-mono text-[11px] leading-4 text-term-dim">{description}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function Desktop() {
  const [now, setNow] = useState<Date | null>(null);
  const [calculatorExpression, setCalculatorExpression] = useState<string | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setNow(new Date()), 0);
    const interval = window.setInterval(() => setNow(new Date()), 1000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, []);

  const time = now ? timeFormatter.format(now) : "--:--:--";
  const date = now ? dateFormatter.format(now) : "—";

  return (
    <div className="desktop-page flex min-h-screen flex-col bg-term-bg text-term-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div>
          <p className="font-mono text-sm text-term-brass">afandi@portfolio</p>
          <p className="mt-1 font-mono text-[11px] text-term-dim">
            Software Engineer · IoT/Embedded
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-term-dim">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-term-brass" />
          <span>open to work</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-2xl">
          <section aria-label="Clock" className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-term-dim">
              local time
            </p>
            <p className="mt-3 font-mono text-5xl font-light tabular-nums text-term-bright sm:text-7xl">
              {time}
            </p>
            <p className="mt-3 font-mono text-sm text-term-brass">{date}</p>
          </section>

          <section
            aria-label="Applications"
            className="mt-12 rounded-xl border border-term-line bg-term-panel p-4 sm:p-5"
          >
            <div className="flex items-center justify-between font-mono text-[11px] text-term-dim">
              <span>applications</span>
              <span>4 apps</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AppTile
                label="Terminal"
                description="commands and projects"
                glyph=">_"
                href="/terminal"
              />
              <AppTile
                label="Calculator"
                description="a little surprise"
                glyph="[=]"
                onClick={() => setCalculatorExpression("0")}
              />
              <AppTile
                label="Resume"
                description="view or download CV"
                glyph="pdf"
                onClick={() => setIsResumeOpen(true)}
              />
              <AppTile
                label="System Monitor"
                description="live CPU and RAM"
                glyph="~%"
                href="/stats"
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6">
        <div className="flex justify-end border-t border-term-line pt-4 font-mono text-[11px] text-term-dim">
          <div className="flex gap-4">
            <a
              href="mailto:mafandiharahap@gmail.com"
              className="text-term-brass transition-colors hover:text-term-bright"
            >
              email
            </a>
            <a
              href="https://github.com/afandihrp"
              target="_blank"
              rel="noreferrer"
              className="text-term-brass transition-colors hover:text-term-bright"
            >
              github
            </a>
            <a
              href="https://wa.me/6285163200490"
              target="_blank"
              rel="noreferrer"
              className="text-term-brass transition-colors hover:text-term-bright"
            >
              whatsapp
            </a>
          </div>
        </div>
      </footer>

      <ResumeViewer isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />

      {calculatorExpression === null ? null : (
        <CalculatorPrank
          key={calculatorExpression}
          expression={calculatorExpression}
          onClose={() => setCalculatorExpression(null)}
        />
      )}
    </div>
  );
}
