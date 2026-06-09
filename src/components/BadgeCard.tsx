import type { Badge } from "../lib/types";

type Props = {
  badge: Badge;
  earned: boolean;
};

export function BadgeCard({ badge, earned }: Props) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border-2 p-4 text-center transition ${
        earned
          ? "border-amber-300 bg-amber-50"
          : "border-slate-100 bg-slate-50 opacity-50 grayscale"
      }`}
    >
      <div className="text-4xl">{badge.emoji}</div>
      <p className="mt-2 text-sm font-bold text-slate-700">{badge.name}</p>
    </div>
  );
}
