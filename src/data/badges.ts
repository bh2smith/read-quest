import type { Badge } from "../lib/types";

export const badges: Badge[] = [
  {
    id: "badge-1",
    name: "Everyday English",
    description: "Completed the Everyday English lesson.",
    emoji: "🗣️",
    lessonId: "lesson-1",
    tokenId: 1,
  },
  {
    id: "badge-2",
    name: "Table Talk",
    description: "Completed the Dining Out lesson.",
    emoji: "🍽️",
    lessonId: "lesson-2",
    tokenId: 2,
  },
  {
    id: "badge-3",
    name: "Way Finder",
    description: "Completed the On the Move lesson.",
    emoji: "🧭",
    lessonId: "lesson-3",
    tokenId: 3,
  },
  {
    id: "badge-4",
    name: "Office Ready",
    description: "Completed the Working Life lesson.",
    emoji: "💼",
    lessonId: "lesson-4",
    tokenId: 4,
  },
  {
    id: "badge-5",
    name: "Phrasal Pro",
    description: "Completed the Phrasal Verbs lesson.",
    emoji: "🎓",
    lessonId: "lesson-5",
    tokenId: 5,
  },
];

export const badgesById = Object.fromEntries(
  badges.map((b) => [b.id, b]),
) as Record<string, Badge>;
