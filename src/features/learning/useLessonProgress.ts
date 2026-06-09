import { create } from "zustand";
import type { LearnerProgress } from "../../lib/types";
import {
  clearProgress,
  loadProgress,
  saveProgress,
} from "../../lib/storage";
import { lessonsById } from "../../data/lessons";
import { track } from "../../lib/analytics";

type ProgressStore = {
  progress: LearnerProgress;
  addXp: (amount: number) => void;
  recordExercise: (exerciseId: string, correct: boolean) => void;
  completeLesson: (lessonId: string, perfect: boolean) => void;
  reset: () => void;
};

function persist(progress: LearnerProgress): LearnerProgress {
  const next = { ...progress, lastPlayedAt: new Date().toISOString() };
  saveProgress(next);
  return next;
}

export const useProgress = create<ProgressStore>((set, get) => ({
  progress: loadProgress(),

  addXp: (amount) =>
    set((s) => ({ progress: persist({ ...s.progress, xp: s.progress.xp + amount }) })),

  recordExercise: (exerciseId, correct) => {
    track("exercise_answered", { exerciseId, correct });
    if (!correct) return;
    set((s) => {
      const completedExerciseIds = s.progress.completedExerciseIds.includes(exerciseId)
        ? s.progress.completedExerciseIds
        : [...s.progress.completedExerciseIds, exerciseId];
      return {
        progress: persist({
          ...s.progress,
          completedExerciseIds,
          xp: s.progress.xp + 10, // +10 XP per correct answer
        }),
      };
    });
  },

  completeLesson: (lessonId, perfect) => {
    const lesson = lessonsById[lessonId];
    if (!lesson) return;
    const already = get().progress.completedLessonIds.includes(lessonId);
    track("lesson_completed", { lessonId, perfect });

    set((s) => {
      const completedLessonIds = already
        ? s.progress.completedLessonIds
        : [...s.progress.completedLessonIds, lessonId];
      const earnedBadgeIds = s.progress.earnedBadgeIds.includes(lesson.badgeId)
        ? s.progress.earnedBadgeIds
        : [...s.progress.earnedBadgeIds, lesson.badgeId];

      // Only award lesson/perfect XP the first time the lesson is completed.
      const bonusXp = already ? 0 : lesson.xpReward + (perfect ? 25 : 0);

      if (!already) track("badge_unlocked", { badgeId: lesson.badgeId });

      return {
        progress: persist({
          ...s.progress,
          completedLessonIds,
          earnedBadgeIds,
          xp: s.progress.xp + bonusXp,
        }),
      };
    });
  },

  reset: () => {
    clearProgress();
    set({ progress: loadProgress() });
  },
}));
