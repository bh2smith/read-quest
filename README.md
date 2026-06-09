# ReadQuest

A free, kid-friendly reading game: children fill in the missing word for a pictured
sentence, earn XP, and unlock achievement badges. Built as a Circles mini-app
(see [plan.md](./plan.md) for the full product plan and roadmap).

## Status

Days 1–5 of the plan are implemented.

**Learning loop (Days 1–2)**
- 5 lessons × 6 exercises (30 prebuilt, static JSON-style data)
- Multiple-choice answers with instant feedback
- XP (+10/correct, +50/lesson, +25 perfect bonus) and badge unlocks
- Progress persisted to `localStorage` (with a reset button)

**Circles connection (Day 3)**
- Parent/teacher/sponsor "For grown-ups" mode
- Wallet connect via `@aboutcircles/miniapp-sdk` (`requestCreateAccount`,
  `onWalletChange` as the source of truth). Outside the Circles host it falls
  back to a clearly-labeled **demo wallet** so the flow is viewable locally.
- Invite/referral links (`?ref=<address>`), copy-to-clipboard, and inbound
  referral attribution (URL or host `?data=` channel)
- Analytics events stubbed in `src/lib/analytics.ts` (currently `console.debug`)

**Rewards (Day 4)**
- Badge mint + CRC reward claim per completed lesson, from the grown-up wallet
- Claim limits: one badge mint and one CRC claim per lesson, per wallet
- Cooldown between CRC claims (anti-farming); persisted per wallet
- Mock transaction paths today, with documented seams for a real ERC-1155
  mint and Circles CRC transfer via the SDK's `sendTransactions`
  (see `features/rewards/badgeMint.ts` and `crcReward.ts`)

**Polish (Day 5)**
- Mobile-first layout with safe-area padding and no iOS tap-highlight/zoom
- Friendly animations: per-question fade, correct-answer pop + floating "+10 XP",
  wrong-answer shake, animated XP counter, and a confetti burst on completion
- `ErrorBoundary` so a render crash shows a friendly reload screen, not a blank one
- Respects `prefers-reduced-motion`

Not yet wired (later milestones): real on-chain contract + CRC path,
deploy & submit (Day 6).

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
  components/                       AnswerChoice, BadgeCard, LessonCard, ProgressBar,
                                    WalletConnectButton, Confetti, ErrorBoundary
  data/                             exercises, lessons, badges (static)
  features/learning/                ExerciseScreen, LessonCompleteScreen, useLessonProgress
  features/circles/                 wallet store (miniapp-sdk: connect + onWalletChange)
  features/referrals/               invite link build/copy + referral attribution
  features/rewards/                 badge mint + CRC claim (mock), limits, RewardClaim UI
  features/parent/                  ParentScreen (grown-up mode: wallet, progress, invites)
  lib/                              types, storage (localStorage), analytics
  styles/globals.css                Tailwind entry + animations
```
