# ReadQuest — Project Plan

> **History:** ReadQuest began as an early-reading game for children (~8–11) with
> a deliberate no-wallet-for-kids stance. It has since **pivoted to 16+ ESL /
> language learning** so learners can self-custody their own Circles accounts.
> Raising the age floor clears COPPA/GDPR-K and makes the Circles study-circle
> (group + trust graph) model honest rather than a workaround. This document
> describes the **current** product.

## 1. One-line pitch

ReadQuest is a free vocabulary / language-learning (ESL) game where learners
(16+) fill in the missing word for a pictured sentence, earn XP, and unlock
**on-chain achievement badges** — organised into Circles **study circles** where
classmates trust each other and an instructor (or sponsor) can reward progress.

## 2. Product goals

- Help teen and adult learners build English vocabulary through visual context.
- Stay simple enough that a non-crypto user can start in one tap.
- Use Circles primitives natively (groups, trust, invitations, on-chain badges).
- Let learners own their own accounts and credentials (self-custody).
- Ship a polished, narrow loop suitable for a Circles Garage submission.

## 3. Target users

### Learner (16+)
- Teen or adult learning English (ESL), or building vocabulary.
- Benefits from image context, repetition, and quick rewards.
- Self-custodies a Circles passkey account; owns their badges.

### Instructor (teacher / tutor / cohort organiser)
- Creates a **study circle** (a Circles group) per class.
- Invites learners; trusts them into the group.
- Sees cohort progress and badges.

### Sponsor (optional)
- Funds invitations and/or gas for a study circle.
- Circles-sponsored invite quotas may cover this, so a dedicated sponsor pool is
  optional, not required.

## 4. Core learning loop

1. Show an image (emoji stand-in in the MVP).
2. Show a sentence with one missing word.
3. Offer 3–4 answer choices.
4. Learner selects; instant feedback (+ "+10 XP" on correct, shake on wrong).
5. After a 6-question lesson: completion screen, badge unlock, confetti.
6. In a study circle, the badge mints on-chain to the learner's own wallet.

Example:

```text
Image: An empty milk carton in the fridge.
Sentence: We ran ____ of milk, so I'll buy some.
Choices: out, into, up, over
Correct: out
Skill: phrasal verb / comprehension · CEFR B1
```

## 5. Content (ESL, CEFR A1 → B1)

5 lessons × 6 exercises = 30, in `src/data/exercises.ts`:

1. **Everyday English** (A1) — daily-life nouns.
2. **Dining Out** (A1–A2) — order/ask/describe food.
3. **On the Move** (A2) — travel: tickets, platforms, directions.
4. **Working Life** (A2–B1) — workplace + routine vocabulary.
5. **Phrasal Verbs** (B1) — phrasal verbs in context.

Badges: Everyday English 🗣️ · Table Talk 🍽️ · Way Finder 🧭 · Office Ready 💼 ·
Phrasal Pro 🎓 (token ids 1–5).

## 6. Circles integration

The Circles study circle is the heart of the app, not a bolt-on.

- **Mini App environment** — runs inside the Circles host iframe; connection via
  `@aboutcircles/miniapp-sdk` (`onWalletChange` is the source of truth,
  `requestCreateAccount` for passkey onboarding).
- **Groups** — an instructor creates a class as a Circles **base group** via
  `@aboutcircles/sdk` `register.asGroup`. Each group = one class.
- **Trust** — learners trust the group (membership becomes on-chain); the
  instructor/group trusts members (`avatar.trust.add`). Classmates form a closed
  trust circle.
- **Invitations** — per-class invite links (`?class=…&by=…`); a learner opens the
  link in the host and self-onboards. Circles charges 96 CRC per invite (invitee
  gets 48 back) — fundable by the instructor or a sponsor; Circles-sponsored
  quotas may cover it.
- **On-chain badges** — soulbound ERC-1155 (`contracts/Badge1155.sol`), one token
  id per lesson, minted to the learner's own wallet on completion.
- **Reads** — cohort roster via `sdk.groups.getMembers`.

## 7. Safety & ethics (16+)

- Age floor **16+** clears COPPA (US) and GDPR-K (EU) everywhere.
- Learners self-custody (passkey); the app **never stores learner keys** — it
  only records addresses.
- Badges are **soulbound** (non-transferable) — credentials, not tradeable assets.
- Zero PII on-chain (address + badge only); progress/PII stays local/off-chain so
  deletion is possible despite on-chain permanence.
- No public profiles or rankings; local progress is resettable.

## 8. Tech stack

- Vite + React + TypeScript, Tailwind CSS v4, Zustand.
- `@aboutcircles/miniapp-sdk` (host connect) + `@aboutcircles/sdk` (groups, trust,
  registration, reads) + viem (encoding, reads, contract deploy).
- Gnosis Chain (id 100). Static JSON content; `localStorage` for progress,
  classroom, and reward state.
- The Circles SDK + viem are code-split into a lazy chunk (learner's first load
  stays ~55 kB gzip).

## 9. Architecture / repository

```text
src/
  app/App.tsx                 router: home → exercise → complete; join; instructor (lazy)
  components/                 AnswerChoice, BadgeCard, LessonCard, ProgressBar,
                              WalletConnectButton, Confetti, ErrorBoundary
  data/                       exercises, lessons, badges (static, ESL)
  features/learning/          ExerciseScreen, LessonCompleteScreen, useLessonProgress
  features/circles/           wallet (miniapp-sdk) + circlesClient (full SDK + host runner)
  features/classroom/         useClassroom, StudyCircle, JoinClassScreen, classInvite
  features/referrals/         invite links + referral attribution
  features/rewards/           badgeMint (mock + on-chain), crcReward (mock), useRewards
  features/parent/            ParentScreen (instructor mode)
  lib/                        types, storage, analytics
contracts/                    Badge1155.sol (soulbound ERC-1155) + deploy script + README
```

Key seam: `features/circles/circlesClient.ts` builds `new Sdk()` with a
`HostContractRunner` that routes writes through the host's `sendTransactions` and
reads via viem over Gnosis. `isLiveCircles(address)` (in-host + connected wallet)
gates real on-chain calls; everywhere else the app runs a local **demo**
simulation.

## 10. Data model

```ts
type Exercise = { id; lessonId; emoji; altText; sentenceTemplate; choices;
  correctAnswer; skill; difficulty };
type Lesson  = { id; title; description; exerciseIds; badgeId; xpReward };
type Badge   = { id; name; description; emoji; lessonId; tokenId? };
type LearnerProgress = { completedExerciseIds; completedLessonIds;
  earnedBadgeIds; xp; lastPlayedAt? };
type Classroom = { id; name; symbol; ownerAddress; createdAt; live; members[] };
```

## 11. Reward mechanics

- XP: +10/correct, +50/lesson, +25 perfect bonus.
- Badges: soulbound ERC-1155 minted to the learner per completed lesson (on-chain
  in-host; mock otherwise). One per lesson per wallet.
- CRC: optional symbolic reward per lesson (currently mock); rate-limited with a
  cooldown. Real transfer would route over the trust graph via the SDK.

## 12. Status

- **Done & live (demo mode verified):** full learning loop, ESL content, animations,
  instructor mode, study-circle create/invite/join/trust UI, cohort roster,
  on-chain badge + group code paths, code-split SDK. Live at
  https://learn-circles.vercel.app.
- **Implemented but unverified against mainnet:** group registration, trust, and
  badge minting. These need the Circles host, a funded Gnosis wallet, and a
  deployed `Badge1155`. `VITE_BADGE_1155_ADDRESS` unset → mock minting.

## 13. Remaining work

- Deploy `Badge1155.sol` to Gnosis and set `VITE_BADGE_1155_ADDRESS`.
- Verify the live on-chain flow **inside the Circles host** (create group, invite,
  join, trust, mint) with a funded wallet.
- Decide invitation funding (instructor vs sponsor vs Circles-sponsored quota).
- Optional: server-side claim/membership records; per-member on-chain badge readout
  in the dashboard; richer trust-graph visualisation.
- Submit / iterate at https://garage.aboutcircles.com (weekly Sunday deadline).

## 14. References

- Circles Garage: https://garage.aboutcircles.com (rules: /rules, register: /register)
- Circles Mini Apps: https://docs.aboutcircles.com/miniapps
- Circles SDK: https://docs.aboutcircles.com/circles-sdk/getting-started-with-the-sdk
- Circles protocol (groups, trust, invitations, demurrage): https://docs.aboutcircles.com/
- Builder chat: https://t.me/about_circles/499
