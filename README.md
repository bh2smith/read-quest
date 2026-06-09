# ReadQuest

A free, kid-friendly reading game: children fill in the missing word for a pictured
sentence, earn XP, and unlock achievement badges. Built as a Circles mini-app
(see [plan.md](./plan.md) for the full product plan and roadmap).

## Status

Day 1–2 of the plan is implemented: the full learning loop runs locally.

- 5 lessons × 6 exercises (30 prebuilt, static JSON-style data)
- Multiple-choice answers with instant feedback
- XP (+10/correct, +50/lesson, +25 perfect bonus) and badge unlocks
- Progress persisted to `localStorage` (with a reset button)
- Analytics events stubbed in `src/lib/analytics.ts` (currently `console.debug`)

Not yet wired (later milestones): Circles wallet connect, CRC rewards,
on-chain ERC-1155 badge minting, referrals.

## Run

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production build to dist/
```

## Stack

Vite + React + TypeScript, Tailwind CSS v4, Zustand for progress state.

## Layout

```
src/
  app/App.tsx                       view router (home → exercise → complete)
  components/                       AnswerChoice, BadgeCard, LessonCard, ProgressBar
  data/                             exercises, lessons, badges (static)
  features/learning/                ExerciseScreen, LessonCompleteScreen, useLessonProgress
  lib/                              types, storage (localStorage), analytics
  styles/globals.css                Tailwind entry + animations
```
