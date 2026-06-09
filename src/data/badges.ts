import type { Badge } from "../lib/types";

export const badges: Badge[] = [
  {
    id: "badge-1",
    name: "Animal Reader",
    description: "Finished the Animals and Objects lesson.",
    emoji: "🦁",
    lessonId: "lesson-1",
  },
  {
    id: "badge-2",
    name: "Action Explorer",
    description: "Finished the Actions lesson.",
    emoji: "🏃",
    lessonId: "lesson-2",
  },
  {
    id: "badge-3",
    name: "Description Detective",
    description: "Finished the Describing Words lesson.",
    emoji: "🔎",
    lessonId: "lesson-3",
  },
  {
    id: "badge-4",
    name: "Everyday Word Hero",
    description: "Finished the Everyday Context lesson.",
    emoji: "🦸",
    lessonId: "lesson-4",
  },
  {
    id: "badge-5",
    name: "Story Clue Solver",
    description: "Finished the Simple Comprehension lesson.",
    emoji: "🧩",
    lessonId: "lesson-5",
  },
];

export const badgesById = Object.fromEntries(
  badges.map((b) => [b.id, b]),
) as Record<string, Badge>;
