import type { Badge, Lesson } from "../lib/types";

type Props = {
  lesson: Lesson;
  badge?: Badge;
  completed: boolean;
  onStart: () => void;
};

export function LessonCard({ lesson, badge, completed, onStart }: Props) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex w-full items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
        {badge?.emoji ?? "📚"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-lg font-bold text-slate-800">{lesson.title}</h3>
          {completed && <span className="text-emerald-500">✓</span>}
        </div>
        <p className="truncate text-sm text-slate-500">{lesson.description}</p>
        <p className="mt-1 text-xs font-medium text-indigo-500">
          {lesson.exerciseIds.length} questions · {lesson.xpReward} XP
        </p>
      </div>
    </button>
  );
}
