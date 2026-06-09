import { useMemo, useState } from "react";
import type { Lesson } from "../../lib/types";
import { exercisesById } from "../../data/exercises";
import { AnswerChoice } from "../../components/AnswerChoice";
import { ProgressBar } from "../../components/ProgressBar";
import { useProgress } from "./useLessonProgress";

type Props = {
  lesson: Lesson;
  onComplete: (correctCount: number, total: number) => void;
  onExit: () => void;
};

const PRAISE = ["Nice!", "Great job!", "You got it!", "Awesome!", "Well done!"];

export function ExerciseScreen({ lesson, onComplete, onExit }: Props) {
  const recordExercise = useProgress((s) => s.recordExercise);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const exercise = useMemo(
    () => exercisesById[lesson.exerciseIds[index]],
    [lesson, index],
  );

  const total = lesson.exerciseIds.length;
  const answered = selected !== null;
  const isCorrect = answered && selected === exercise.correctAnswer;

  const [before, after] = exercise.sentenceTemplate.split("____");

  function choose(choice: string) {
    if (answered) return;
    setSelected(choice);
    const correct = choice === exercise.correctAnswer;
    recordExercise(exercise.id, correct);
    if (correct) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= total) {
      onComplete(correctCount, total);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md select-none flex-col gap-5 p-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Exit lesson"
        >
          ←
        </button>
        <div className="flex-1">
          <ProgressBar current={index + (answered ? 1 : 0)} total={total} />
        </div>
      </div>

      <div
        key={index}
        className="animate-fade-in relative flex flex-col items-center rounded-3xl bg-white p-8 shadow-sm"
      >
        <div
          className="text-7xl"
          role="img"
          aria-label={exercise.altText}
          title={exercise.altText}
        >
          {exercise.emoji}
        </div>
        {isCorrect && (
          <span className="animate-float-up pointer-events-none absolute right-6 top-6 text-xl font-extrabold text-emerald-500">
            +10 XP
          </span>
        )}
      </div>

      <p className="text-center text-2xl font-bold leading-snug text-slate-800">
        {before}
        <span className="mx-1 inline-block min-w-16 border-b-4 border-dashed border-indigo-300 text-indigo-500">
          {answered ? selected : " "}
        </span>
        {after}
      </p>

      <div className="flex flex-col gap-3">
        {exercise.choices.map((choice) => {
          let state: "idle" | "correct" | "wrong" = "idle";
          if (answered) {
            if (choice === exercise.correctAnswer) state = "correct";
            else if (choice === selected) state = "wrong";
          }
          return (
            <AnswerChoice
              key={choice}
              label={choice}
              state={state}
              disabled={answered}
              onClick={() => choose(choice)}
            />
          );
        })}
      </div>

      {answered && (
        <div className="animate-pop-in mt-auto flex flex-col gap-3">
          <p
            className={`text-center text-lg font-bold ${
              isCorrect ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isCorrect
              ? PRAISE[index % PRAISE.length]
              : `The answer is "${exercise.correctAnswer}".`}
          </p>
          <button
            type="button"
            onClick={next}
            className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            {index + 1 >= total ? "Finish lesson" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
