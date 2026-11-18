"use client";

import { useEffect, useRef, useState } from "react";
import { downloadResume, RESUME_PATH } from "./resume";

type ResumeViewerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ResumeViewer({ isOpen, onClose }: ResumeViewerProps) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = pagesRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    container.replaceChildren();
    setStatus("loading");

    async function renderPages(target: HTMLDivElement) {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const pdf = await pdfjs.getDocument({ url: RESUME_PATH }).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) {
          return;
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.className = "w-full rounded-sm bg-white";

        await page.render({
          canvas,
          viewport,
          transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
        }).promise;
        target.append(canvas);
      }

      if (!cancelled) {
        setStatus("ready");
      }
    }

    renderPages(container).catch(() => {
      if (!cancelled) {
        setStatus("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]/90 p-3 sm:p-6"
    >
      <div className="flex h-full max-h-[900px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-term-line bg-term-panel">
        <header className="flex items-center justify-between gap-4 border-b border-term-line px-4 py-2.5">
          <span className="font-mono text-[11px] text-term-dim">resume_cv.pdf</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={downloadResume}
              className="font-mono text-[11px] text-term-brass transition-colors hover:text-term-bright"
            >
              download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[11px] text-term-dim transition-colors hover:text-term-bright"
            >
              close
            </button>
          </div>
        </header>

        <div className="terminal-scroll flex-1 overflow-y-auto bg-[#0b0b0b] p-3 sm:p-4">
          {status === "loading" ? (
            <p className="font-mono text-[12px] text-term-dim">Loading resume...</p>
          ) : null}

          {status === "error" ? (
            <p className="font-mono text-[12px] text-term-error">
              Could not load the CV. Use download instead.
            </p>
          ) : null}

          <div ref={pagesRef} className="space-y-3" />
        </div>
      </div>
    </div>
  );
}
