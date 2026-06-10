import { useEffect, useState } from "react";
import { lessons, lessonsById } from "../data/lessons";
import { badges, badgesById } from "../data/badges";
import { LessonCard } from "../components/LessonCard";
import { BadgeCard } from "../components/BadgeCard";
import { ExerciseScreen } from "../features/learning/ExerciseScreen";
import { LessonCompleteScreen } from "../features/learning/LessonCompleteScreen";
import { useProgress } from "../features/learning/useLessonProgress";
import { ParentScreen } from "../features/parent/ParentScreen";
import { track } from "../lib/analytics";

type View =
  | { name: "home" }
  | { name: "parent" }
  | { name: "exercise"; lessonId: string }
  | {
      name: "complete";
      lessonId: string;
      correctCount: number;
      total: number;
    };

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const progress = useProgress((s) => s.progress);
  const completeLesson = useProgress((s) => s.completeLesson);
  const reset = useProgress((s) => s.reset);

  useEffect(() => {
    track("app_opened");
  }, []);

  if (view.name === "parent") {
    return (
      <Shell>
        <ParentScreen onBack={() => setView({ name: "home" })} />
      </Shell>
    );
  }

  if (view.name === "exercise") {
    const lesson = lessonsById[view.lessonId];
    return (
      <Shell>
        <ExerciseScreen
          lesson={lesson}
          onExit={() => setView({ name: "home" })}
          onComplete={(correctCount, total) => {
            completeLesson(lesson.id, correctCount === total);
            setView({ name: "complete", lessonId: lesson.id, correctCount, total });
          }}
        />
      </Shell>
    );
  }

  if (view.name === "complete") {
    const lesson = lessonsById[view.lessonId];
    return (
      <Shell>
        <LessonCompleteScreen
          lesson={lesson}
          badge={badgesById[lesson.badgeId]}
          correctCount={view.correctCount}
          total={view.total}
          perfect={view.correctCount === view.total}
          onContinue={() => setView({ name: "home" })}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="animate-fade-in mx-auto flex w-full max-w-md flex-col gap-6 p-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700">ReadQuest</h1>
            <p className="text-sm text-slate-500">Learn words, earn badges.</p>
          </div>
          <div className="rounded-2xl bg-amber-100 px-4 py-2 text-center">
            <p key={progress.xp} className="animate-pop-in text-xl font-extrabold text-amber-600">
              {progress.xp}
            </p>
            <p className="text-xs text-amber-700">XP</p>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-700">Lessons</h2>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              badge={badgesById[lesson.badgeId]}
              completed={progress.completedLessonIds.includes(lesson.id)}
              onStart={() => {
                track("lesson_started", { lessonId: lesson.id });
                setView({ name: "exercise", lessonId: lesson.id });
              }}
            />
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-700">Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={progress.earnedBadgeIds.includes(badge.id)}
              />
            ))}
          </div>
        </section>

        <footer className="flex items-center justify-center gap-4 pt-2 text-center">
          <button
            type="button"
            onClick={() => setView({ name: "parent" })}
            className="text-sm font-semibold text-indigo-500 hover:text-indigo-700"
          >
            Instructor mode →
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all progress on this device?")) reset();
            }}
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            Reset progress
          </button>
        </footer>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 pb-[env(safe-area-inset-bottom)] text-slate-900">
      {children}
    </div>
  );
}
