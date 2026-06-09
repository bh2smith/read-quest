import { useEffect, useState } from "react";
import { lessons } from "../../data/lessons";
import { badgesById } from "../../data/badges";
import { useProgress } from "../learning/useLessonProgress";
import { useWallet } from "../circles/wallet";
import { CRC_REWARD_PER_LESSON } from "./crcReward";
import { CRC_COOLDOWN_MS, useRewards } from "./useRewards";

export function RewardClaim() {
  const address = useWallet((s) => s.address);
  const completedLessonIds = useProgress((s) => s.progress.completedLessonIds);
  const { walletOf, isPending, mintBadge, claimCrc, error } = useRewards();

  // Tick once a second so the cooldown countdown stays live.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!address) {
    return (
      <p className="text-sm text-slate-400">
        Connect a wallet above to mint badges and send rewards.
      </p>
    );
  }

  const completed = lessons.filter((l) => completedLessonIds.includes(l.id));
  if (completed.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Finish a lesson to unlock badge minting and CRC rewards.
      </p>
    );
  }

  const wallet = walletOf(address);
  const cooldownLeft = Math.max(
    0,
    Math.ceil((CRC_COOLDOWN_MS - (Date.now() - wallet.lastClaimAt)) / 1000),
  );

  return (
    <div className="flex flex-col gap-3">
      {completed.map((lesson) => {
        const badge = badgesById[lesson.badgeId];
        const minted = wallet.mintedLessonIds.includes(lesson.id);
        const claimed = wallet.claimedLessonIds.includes(lesson.id);
        const minting = isPending(address, "mint", lesson.id);
        const claiming = isPending(address, "crc", lesson.id);
        const blocked = cooldownLeft > 0;

        return (
          <div key={lesson.id} className="rounded-2xl border border-slate-100 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-sm font-bold text-slate-700">{lesson.title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {minted ? (
                <Pill tone="amber">✓ Badge minted</Pill>
              ) : (
                <button
                  type="button"
                  disabled={minting}
                  onClick={() => mintBadge(address, lesson.id)}
                  className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {minting ? "Minting…" : "Mint badge"}
                </button>
              )}

              {claimed ? (
                <Pill tone="emerald">✓ {CRC_REWARD_PER_LESSON} CRC sent</Pill>
              ) : (
                <button
                  type="button"
                  disabled={claiming || blocked}
                  onClick={() => claimCrc(address, lesson.id)}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {claiming
                    ? "Sending…"
                    : blocked
                      ? `Wait ${cooldownLeft}s`
                      : `Send ${CRC_REWARD_PER_LESSON} CRC`}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <p className="text-xs text-slate-400">
        One badge and one CRC reward per lesson, per wallet. Mock transfers in
        this build — rewards always go to the connected grown-up wallet.
      </p>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "amber" | "emerald";
  children: React.ReactNode;
}) {
  const styles =
    tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";
  return (
    <span className={`rounded-full px-3 py-2 text-sm font-semibold ${styles}`}>
      {children}
    </span>
  );
}
