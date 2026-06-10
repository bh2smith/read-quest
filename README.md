# ReadQuest

A free vocabulary / language-learning (ESL) game for learners 16+ and study
circles: fill in the missing word for a pictured sentence, earn XP, and unlock
on-chain achievement badges. Built as a Circles mini-app, with a Circles
"study circle" (group) where classmates trust each other.
(See [plan.md](./plan.md) for the full product plan and roadmap.)

> **Direction note:** ReadQuest began as an early-reading game for children and
> has pivoted to **16+ ESL / language learning**. Raising the age floor clears
> COPPA/GDPR-K and lets learners self-custody their own Circles accounts, which
> makes the study-circle (group + trust graph) model honest rather than a
> workaround. Content and copy now target older learners; the on-chain
> classroom layer (groups, self-onboarding, ERC-1155 badges) is the next phase.

## Status

The original 6-day plan (learning loop → polish) plus the **Circles
study-circle** rework (Phases A–D) are implemented.

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

**Circles study circle (Phases A–D)**
- **A — group:** an instructor creates a class as a real Circles **group** via
  `sdk.register.asGroup` (`@aboutcircles/sdk`), or a simulated group in demo mode.
- **B — onboarding + trust:** per-class invite links (`?class=…`); a learner
  opens it in the Circles host, connects their **own** passkey account, and
  trusts the group so membership is on-chain. The app never stores learner keys.
  The instructor trusts members into the group (`avatar.trust.add`).
- **C — on-chain badges:** soulbound ERC-1155 (`contracts/Badge1155.sol`) — one
  token id per lesson. Completing a lesson mints to the learner's own wallet via
  the host's `sendTransactions` when `VITE_BADGE_1155_ADDRESS` is set; mock
  otherwise. Deploy tooling in `contracts/`.
- **D — cohort dashboard:** roster with per-member trust status, invite sharing,
  and a live "Refresh from chain" read via `sdk.groups.getMembers`.

The Circles SDK + viem are **code-split** into a lazy chunk, so a learner's
first load stays light (~55 kB gzip); the SDK (~171 kB gzip) loads only when
entering instructor/join screens.

> **Verification status:** demo mode is fully runnable and verified locally
> (typecheck + build + dev). The **live on-chain paths** (group registration,
> trust, badge mint) are correctly typed against the real SDK/contract but have
> **not been executed against Gnosis mainnet** from here — they need a funded
> wallet, the Circles host, and a deployed `Badge1155`. Treat them as
> implemented-but-unverified until run in-host.

## Run

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production build to dist/
```

## Stack

Vite + React + TypeScript, Tailwind CSS v4, Zustand for state,
`@aboutcircles/miniapp-sdk` + `@aboutcircles/sdk` + viem for Circles/Gnosis.

## Layout

```
src/
  app/App.tsx                       view router (home → exercise → complete)
  components/                       AnswerChoice, BadgeCard, LessonCard, ProgressBar,
                                    WalletConnectButton, Confetti, ErrorBoundary
  data/                             exercises, lessons, badges (static)
  features/learning/                ExerciseScreen, LessonCompleteScreen, useLessonProgress
  features/circles/                 wallet store (miniapp-sdk) + circlesClient (full SDK)
  features/classroom/               study-circle groups, invites, join, trust, roster
  features/referrals/               invite link build/copy + referral attribution
  features/rewards/                 badge mint (mock + on-chain ERC-1155), CRC claim, limits
  features/parent/                  ParentScreen (instructor mode: wallet, circle, rewards)
  lib/                              types, storage (localStorage), analytics
contracts/                          Badge1155.sol (soulbound ERC-1155) + deploy script
  styles/globals.css                Tailwind entry + animations
```
