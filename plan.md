# ReadQuest Circles Mini App — Project Plan

## 1. One-line pitch

ReadQuest is a free, kid-friendly reading game where children learn vocabulary and reading comprehension from images, complete short fill-in-the-blank exercises, and earn non-speculative NFT achievement badges while parents, teachers, or sponsors can reward progress with Circles CRC.

## 2. Product goals

- Help children around age 10 practice reading through visual context.
- Make the app simple enough for a non-crypto user to open twice.
- Use Circles primitives natively rather than bolting on token rewards.
- Keep child rewards safe: badges first, CRC only through parent, guardian, classroom, or sponsor-controlled wallets.
- Ship a working Circles Garage submission quickly with a narrow, polished loop.

## 3. Target users

### Primary learner

- Age: roughly 8-11.
- Can read simple sentences.
- Benefits from image context, repetition, and quick rewards.
- Should not need to understand crypto, wallets, keys, gas, or trading.

### Parent or teacher

- Wants visible learning progress.
- Wants a free app.
- May sponsor lessons, run a classroom group, or distribute rewards.

### Circles community sponsor

- Wants to fund useful learning activity.
- Can contribute CRC to a class/group pool or reward verified completions.

## 4. Core learning loop

1. Show an image.
2. Show a sentence with one missing word.
3. Offer 3-4 answer choices.
4. Learner selects an answer.
5. Give instant feedback.
6. Award XP for correct answers.
7. After a short lesson, unlock an achievement badge.
8. Optionally trigger a sponsor-funded CRC reward to a parent/classroom wallet.

Example exercise:

```text
Image: A dog chasing a ball in a park.
Sentence: The dog is chasing a ____.
Choices: ball, cloud, chair, spoon
Correct answer: ball
Skill: noun recognition
Difficulty: 1
```

## 5. MVP scope

Build only what is needed to demo the complete loop.

### Include

- Landing screen: title, short explanation, start button.
- Parent/teacher wallet connection through the Circles Mini App flow.
- 30 prebuilt exercises.
- 5 lessons with 6 exercises each.
- Multiple-choice answers.
- XP and lesson completion state.
- NFT badge metadata for each completed lesson.
- Basic badge mint/unlock flow.
- Optional CRC reward claim button for parent/teacher wallet.
- Invite/referral link for Circles Garage scoring.
- Simple analytics events for opens, lesson starts, completions, and wallet connection.

### Exclude from MVP

- AI-generated content at runtime.
- Open text input grading.
- Child accounts.
- Public leaderboards for children.
- Chat, comments, or social features.
- Marketplace or NFT trading UX.
- Complex teacher dashboards.

## 6. Circles integration strategy

Circles Garage judging values Circles integration quality, usefulness, UX, referrals, activity, and continued shipping for repeat winners. Design the app so Circles is central to the experience, not an afterthought.

### Circles-native primitives to use

1. **Mini App environment**
   - Build as a focused web app that works inside the Circles app iframe/host environment.
   - Keep the UX task-specific: complete a reading lesson, earn a badge, optionally claim a reward.

2. **Wallet/account connection**
   - Use the Circles Mini App SDK account flow for parent/teacher/sponsor connection.
   - Treat `onWalletChange` as the source of truth for authentication state.
   - Do not require a child to manage a wallet.

3. **CRC rewards**
   - Do not pay CRC directly to a child by default.
   - Send CRC rewards to a parent, teacher, class group, or sponsor-controlled wallet.
   - Consider requiring a parent/teacher confirmation before claiming rewards.

4. **Groups**
   - Create an optional classroom or learning-circle group.
   - Sponsors fund the group.
   - Group CRC can be used to reward completed lessons or class milestones.

5. **Referrals**
   - Each parent/teacher gets an invite link.
   - Track whether new wallets connect through the link inside the app.
   - Make referrals natural: “Invite another family/class to join the reading circle.”

6. **Activity**
   - Optimize for repeated weekly use.
   - Add daily lesson cards, streak-like progress, and badge collection.

## 7. Child safety and ethics

This app targets children, so keep the reward design educational and non-speculative.

### Product rules

- No direct financial prompts to children.
- No trading language: avoid “profit,” “value,” “floor price,” or “investment.”
- NFT badges should be achievement credentials or collectibles, not speculative assets.
- Parent/teacher wallet owns or receives on-chain assets.
- Child-facing UI should say “badge,” “sticker,” or “achievement,” not “NFT,” unless a parent mode is active.
- No public child profiles.
- No public ranking of children.
- Store minimal learner data.
- Allow reset/delete of local progress.

## 8. Suggested tech stack

### Frontend

- Vite + React + TypeScript
- Tailwind CSS
- Zustand or simple React state for local progress
- React Router if needed, but a single-page app is enough for MVP

### Circles

- `@aboutcircles/sdk`
- Mini App account/connect SDK functions
- Gnosis Chain, chain ID 100
- Viem for wallet/contract interactions if needed

### Storage

MVP:

- Static JSON for exercises
- LocalStorage for learner progress
- Optional Supabase/Postgres for analytics and referral attribution

Later:

- Server database for classrooms, assignments, guardian accounts, sponsor pools, and badge history

### NFT badges

MVP options:

1. Fastest: off-chain badge state with on-chain claim planned.
2. Better: simple ERC-1155 badge contract on Gnosis Chain.
3. Best for demo: mint parent/teacher-owned ERC-1155 badges when lessons are completed.

## 9. Repository scaffold

```text
readquest-circles/
  README.md
  plan.md
  package.json
  .env.example
  public/
    images/
      lessons/
    badge-metadata/
  src/
    app/
      App.tsx
      routes.tsx
    components/
      AnswerChoice.tsx
      BadgeCard.tsx
      LessonCard.tsx
      ProgressBar.tsx
      WalletConnectButton.tsx
    data/
      exercises.ts
      lessons.ts
      badges.ts
    features/
      learning/
        ExerciseScreen.tsx
        LessonCompleteScreen.tsx
        useLessonProgress.ts
      rewards/
        RewardClaim.tsx
        badgeMint.ts
        crcReward.ts
      referrals/
        referral.ts
      circles/
        circlesClient.ts
        wallet.ts
        miniApp.ts
    lib/
      analytics.ts
      storage.ts
      types.ts
    styles/
      globals.css
  contracts/
    Badge1155.sol
    scripts/
      deployBadge.ts
  docs/
    content-guidelines.md
    safety.md
    submission.md
```

## 10. Data model

### Exercise

```ts
export type Exercise = {
  id: string;
  lessonId: string;
  imageSrc: string;
  altText: string;
  sentenceTemplate: string; // e.g. "The dog is chasing a ____."
  choices: string[];
  correctAnswer: string;
  skill: "noun" | "verb" | "adjective" | "sentence-context" | "comprehension";
  difficulty: 1 | 2 | 3;
};
```

### Lesson

```ts
export type Lesson = {
  id: string;
  title: string;
  description: string;
  exerciseIds: string[];
  badgeId: string;
  xpReward: number;
};
```

### Badge

```ts
export type Badge = {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  lessonId: string;
  tokenId?: number;
};
```

### Progress

```ts
export type LearnerProgress = {
  completedExerciseIds: string[];
  completedLessonIds: string[];
  earnedBadgeIds: string[];
  xp: number;
  lastPlayedAt?: string;
};
```

## 11. First 30 exercises

Create 5 lessons with 6 exercises each.

### Lesson 1: Animals and Objects

- The dog is chasing a ____.
- The cat is sleeping on the ____.
- The bird is flying in the ____.
- The fish is swimming in the ____.
- The rabbit is eating a ____.
- The horse is running in the ____.

### Lesson 2: Actions

- The boy is ____ a book.
- The girl is ____ a bike.
- The chef is ____ dinner.
- The baby is ____.
- The children are ____ soccer.
- The teacher is ____ on the board.

### Lesson 3: Describing Words

- The lemon tastes ____.
- The snow is ____.
- The elephant is ____.
- The feather is ____.
- The fire is ____.
- The turtle is ____.

### Lesson 4: Everyday Context

- It is raining, so she uses an ____.
- He brushes his teeth with a ____.
- She cuts paper with ____.
- They sleep in a ____.
- He drinks water from a ____.
- She writes with a ____.

### Lesson 5: Simple Comprehension

- Emma wears boots because the ground is ____.
- The dog looks at its empty bowl because it is ____.
- The boy holds a map because he is ____.
- The girl smiles after opening the gift because she is ____.
- The plant is drooping because it needs ____.
- The team cheers because they ____ the game.

## 12. UX flow

### Child mode

1. Start lesson.
2. See image and sentence.
3. Tap answer.
4. See friendly feedback.
5. Continue to next question.
6. Earn badge animation.

### Parent/teacher mode

1. Connect wallet.
2. See child/class progress.
3. Claim or sponsor rewards.
4. Copy invite link.
5. View badges earned.

### Sponsor mode

1. Connect wallet.
2. Choose a class/group or general reward pool.
3. Send CRC sponsorship.
4. See how many lesson completions the sponsorship can fund.

## 13. Reward mechanics

### XP

- Correct answer: +10 XP
- Complete lesson: +50 XP
- Perfect lesson: +25 bonus XP

### Badges

- Badge 1: Animal Reader
- Badge 2: Action Explorer
- Badge 3: Description Detective
- Badge 4: Everyday Word Hero
- Badge 5: Story Clue Solver

### CRC

- CRC rewards are optional.
- Default reward recipient is parent/teacher/class wallet.
- Suggested MVP amount: very small symbolic reward per completed lesson.
- Add rate limits to prevent farming.
- Add sponsor pool depletion checks.

## 14. Anti-abuse considerations

- Require wallet connection for reward claims.
- Only allow one reward claim per lesson per connected parent/teacher wallet.
- Store completed lesson claim IDs server-side if CRC is enabled.
- Use simple cooldowns.
- Keep badge minting low-cost and limited.
- Do not reward every single answer on-chain; only completed lessons.

## 15. Analytics events

Track only product and Garage-relevant events.

```ts
type AnalyticsEvent =
  | "app_opened"
  | "wallet_connected"
  | "lesson_started"
  | "exercise_answered"
  | "lesson_completed"
  | "badge_unlocked"
  | "badge_minted"
  | "crc_reward_claimed"
  | "referral_link_copied"
  | "referred_wallet_connected";
```

Do not collect unnecessary child personal information.

## 16. Circles Garage submission checklist

- Working deployed HTTPS URL.
- App works inside iframe/Mini App environment.
- Clear one-sentence description.
- Logo.
- GitHub repo.
- Mini App manifest entry if submitting through the Mini Apps repo.
- Referral flow implemented.
- Activity events implemented.
- Short demo video or GIF.
- 200-word progress note if resubmitting after a prior top-3 placement.

## 17. Milestones

### Day 1: Scaffold

- Create Vite React TypeScript app.
- Add Tailwind.
- Add static lesson data.
- Build exercise screen.
- Add local progress.

### Day 2: Learning loop

- Add lesson selection.
- Add answer feedback.
- Add XP and badges.
- Add completion screen.

### Day 3: Circles connection

- Add wallet connect/create flow.
- Display connected parent/teacher wallet.
- Add parent/teacher mode.
- Add referral link generation.

### Day 4: Rewards

- Add badge mint mock or ERC-1155 contract.
- Add CRC reward claim mock or real transfer path.
- Add claim limits.

### Day 5: Polish

- Improve mobile layout.
- Add friendly animations.
- Add error states.
- Add empty/loading states.
- Add basic analytics.

### Day 6: Deploy and submit

- Deploy to Vercel/Netlify.
- Test iframe behavior.
- Prepare logo and screenshots.
- Submit to Circles Garage.

## 18. Open questions

- Should the MVP use real ERC-1155 minting or off-chain badges first?
- Should CRC rewards be funded by a sponsor pool or manually sent by parent/teacher?
- Should the first version target parents, teachers, or Circles community sponsors?
- Should images be custom illustrations, stock-style public assets, or generated ahead of time?
- What is the minimum acceptable child-safety/privacy posture for launch?

## 19. References

- Circles Garage rewards working Mini Apps and judges based on Circles integration, usefulness, UX, referrals, and activity: https://garage.aboutcircles.com/register
- Circles Garage rules describe Monday-to-Sunday cycles, weekly CRC prizes, and snapshot timing: https://garage.aboutcircles.com/rules
- Circles Mini Apps are focused web apps built around a narrow Circles-powered workflow: https://docs.aboutcircles.com/miniapps
- Circles Mini App account flow supports creating or connecting a Circles account from a Mini App: https://docs.aboutcircles.com/miniapps/create-or-connect-a-circles-account-from-a-mini-app
- Circles SDK quickstart covers browser dApp setup and SDK packages: https://docs.aboutcircles.com/circles-sdk/getting-started-with-the-sdk
- Circles protocol documentation explains personal currencies, 1 CRC/hour issuance, trust graph routing, demurrage, groups, and invites: https://docs.aboutcircles.com/
- Mini App contribution docs describe Garage vs Embedded Mini Apps, external hosting, HTTPS URL, and manifest requirements: https://docs.aboutcircles.com/miniapps/contribute-mini-apps

