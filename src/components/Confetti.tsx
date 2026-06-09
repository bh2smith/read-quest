import { useMemo } from "react";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#f43f5e"];

type Props = { pieces?: number };

// Lightweight, dependency-free celebration burst.
export function Confetti({ pieces = 40 }: Props) {
  const bits = useMemo(() => {
    const rnd = new Uint16Array(pieces * 3);
    crypto.getRandomValues(rnd);
    return Array.from({ length: pieces }, (_, i) => ({
      left: (rnd[i * 3] / 65535) * 100,
      delay: (rnd[i * 3 + 1] / 65535) * 0.6,
      duration: 1.6 + (rnd[i * 3 + 2] / 65535) * 1.4,
      color: COLORS[i % COLORS.length],
    }));
  }, [pieces]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${b.left}%`,
            backgroundColor: b.color,
            animation: `confetti-fall ${b.duration}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
