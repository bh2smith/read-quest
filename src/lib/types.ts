export type Skill =
  | "noun"
  | "verb"
  | "adjective"
  | "sentence-context"
  | "comprehension";

export type Exercise = {
  id: string;
  lessonId: string;
  emoji: string; // stand-in for an illustration in the MVP
  altText: string;
  sentenceTemplate: string; // e.g. "The dog is chasing a ____."
  choices: string[];
  correctAnswer: string;
  skill: Skill;
  difficulty: 1 | 2 | 3;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  exerciseIds: string[];
  badgeId: string;
  xpReward: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  lessonId: string;
  tokenId?: number;
};

export type LearnerProgress = {
  completedExerciseIds: string[];
  completedLessonIds: string[];
  earnedBadgeIds: string[];
  xp: number;
  lastPlayedAt?: string;
};
