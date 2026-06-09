import type { Badge, Lesson } from "../../lib/types";
import { Confetti } from "../../components/Confetti";

type Props = {
  lesson: Lesson;
  badge?: Badge;
  correctCount: number;
  total: number;
  perfect: boolean;
  onContinue: () => void;
};

export function LessonCompleteScreen({
  lesson,
  badge,
  correctCount,
  total,
  perfect,
  onContinue,
}: Props) {
  const earnedXp = lesson.xpReward + (perfect ? 25 : 0);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <Confetti />
      <div className="animate-pop-in flex h-32 w-32 items-center justify-center rounded-full bg-amber-100 text-7xl shadow-inner">
        {badge?.emoji ?? "🏅"}
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">Lesson complete!</h2>
        <p className="mt-1 text-slate-500">{lesson.title}</p>
      </div>

      {badge && (
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-slate-500">New badge unlocked</p>
          <p className="text-lg font-bold text-amber-600">{badge.name}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Stat label="Correct" value={`${correctCount}/${total}`} />
        <Stat label="XP earned" value={`+${earnedXp}`} />
        {perfect && <Stat label="Bonus" value="Perfect!" />}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700"
      >
        Continue
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3">
      <p className="text-xl font-extrabold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
