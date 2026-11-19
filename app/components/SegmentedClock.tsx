type SegmentKey = "a" | "b" | "c" | "d" | "e" | "f" | "g";

const SEGMENTS: Record<SegmentKey, { x: number; y: number; width: number; height: number }> = {
  a: { x: 6, y: 3, width: 28, height: 5 },
  b: { x: 33, y: 7, width: 5, height: 25 },
  c: { x: 33, y: 39, width: 5, height: 25 },
  d: { x: 6, y: 64, width: 28, height: 5 },
  e: { x: 2, y: 39, width: 5, height: 25 },
  f: { x: 2, y: 7, width: 5, height: 25 },
  g: { x: 6, y: 33, width: 28, height: 5 },
};

const SEGMENT_KEYS: SegmentKey[] = ["a", "b", "c", "d", "e", "f", "g"];

const DIGIT_SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgecd",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

function Digit({ value }: { value: string }) {
  const activeSegments = DIGIT_SEGMENTS[value] ?? "";

  return (
    <svg viewBox="0 0 40 72" aria-hidden="true" className="h-14 w-auto sm:h-24">
      {SEGMENT_KEYS.map((key) => {
        const segment = SEGMENTS[key];
        const fillClassName = activeSegments.includes(key) ? "fill-term-brass" : "fill-term-line";

        return (
          <rect
            key={key}
            x={segment.x}
            y={segment.y}
            width={segment.width}
            height={segment.height}
            rx={2.5}
            className={fillClassName}
          />
        );
      })}
    </svg>
  );
}

function Colon() {
  return (
    <svg viewBox="0 0 16 72" aria-hidden="true" className="h-14 w-auto sm:h-24">
      <circle cx="8" cy="24" r="3.5" className="terminal-cursor fill-term-brass" />
      <circle cx="8" cy="52" r="3.5" className="terminal-cursor fill-term-brass" />
    </svg>
  );
}

export function SegmentedClock({ time }: { time: string }) {
  return (
    <div
      role="img"
      aria-label={time}
      className="mt-3 flex items-center justify-center gap-1 sm:gap-1.5"
    >
      {time.split("").map((character, index) => {
        if (character === ":") {
          return <Colon key={index} />;
        }

        return <Digit key={index} value={character} />;
      })}
    </div>
  );
}
