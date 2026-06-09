import type { Lesson } from "../lib/types";
import { exercises } from "./exercises";

const exerciseIdsFor = (lessonId: string) =>
  exercises.filter((e) => e.lessonId === lessonId).map((e) => e.id);

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "Animals and Objects",
    description: "Spot the right noun in each sentence.",
    exerciseIds: exerciseIdsFor("lesson-1"),
    badgeId: "badge-1",
    xpReward: 50,
  },
  {
    id: "lesson-2",
    title: "Actions",
    description: "Pick the action word that fits.",
    exerciseIds: exerciseIdsFor("lesson-2"),
    badgeId: "badge-2",
    xpReward: 50,
  },
  {
    id: "lesson-3",
    title: "Describing Words",
    description: "Choose the word that describes it best.",
    exerciseIds: exerciseIdsFor("lesson-3"),
    badgeId: "badge-3",
    xpReward: 50,
  },
  {
    id: "lesson-4",
    title: "Everyday Context",
    description: "Use clues to find the everyday object.",
    exerciseIds: exerciseIdsFor("lesson-4"),
    badgeId: "badge-4",
    xpReward: 50,
  },
  {
    id: "lesson-5",
    title: "Simple Comprehension",
    description: "Read the clue and explain why.",
    exerciseIds: exerciseIdsFor("lesson-5"),
    badgeId: "badge-5",
    xpReward: 50,
  },
];

export const lessonsById = Object.fromEntries(
  lessons.map((l) => [l.id, l]),
) as Record<string, Lesson>;
