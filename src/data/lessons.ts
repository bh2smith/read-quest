import type { Lesson } from "../lib/types";
import { exercises } from "./exercises";

const exerciseIdsFor = (lessonId: string) =>
  exercises.filter((e) => e.lessonId === lessonId).map((e) => e.id);

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "Everyday English",
    description: "Core A1 vocabulary for daily life.",
    exerciseIds: exerciseIdsFor("lesson-1"),
    badgeId: "badge-1",
    xpReward: 50,
  },
  {
    id: "lesson-2",
    title: "Dining Out",
    description: "Order, ask, and describe food at a restaurant.",
    exerciseIds: exerciseIdsFor("lesson-2"),
    badgeId: "badge-2",
    xpReward: 50,
  },
  {
    id: "lesson-3",
    title: "On the Move",
    description: "Travel words: tickets, platforms, and directions.",
    exerciseIds: exerciseIdsFor("lesson-3"),
    badgeId: "badge-3",
    xpReward: 50,
  },
  {
    id: "lesson-4",
    title: "Working Life",
    description: "Vocabulary for the workplace and daily routine.",
    exerciseIds: exerciseIdsFor("lesson-4"),
    badgeId: "badge-4",
    xpReward: 50,
  },
  {
    id: "lesson-5",
    title: "Phrasal Verbs",
    description: "B1 phrasal verbs in everyday context.",
    exerciseIds: exerciseIdsFor("lesson-5"),
    badgeId: "badge-5",
    xpReward: 50,
  },
];

export const lessonsById = Object.fromEntries(
  lessons.map((l) => [l.id, l]),
) as Record<string, Lesson>;
