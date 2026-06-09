import type { LearnerProgress } from "./types";

const KEY = "readquest.progress.v1";

export const emptyProgress: LearnerProgress = {
  completedExerciseIds: [],
  completedLessonIds: [],
  earnedBadgeIds: [],
  xp: 0,
};

export function loadProgress(): LearnerProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress;
    return { ...emptyProgress, ...(JSON.parse(raw) as LearnerProgress) };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: LearnerProgress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // ignore quota / unavailable storage
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
