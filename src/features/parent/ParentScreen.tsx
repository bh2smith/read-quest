import { useState } from "react";
import { lessons } from "../../data/lessons";
import { badges } from "../../data/badges";
import { BadgeCard } from "../../components/BadgeCard";
import { WalletConnectButton } from "../../components/WalletConnectButton";
import { useProgress } from "../learning/useLessonProgress";
import { useWallet } from "../circles/wallet";
import { buildInviteLink, copyInviteLink } from "../referrals/referral";
import { RewardClaim } from "../rewards/RewardClaim";

type Props = {
  onBack: () => void;
};

export function ParentScreen({ onBack }: Props) {
  const progress = useProgress((s) => s.progress);
  const address = useWallet((s) => s.address);
  const [copied, setCopied] = useState(false);

  const earnedBadges = badges.filter((b) =>
    progress.earnedBadgeIds.includes(b.id),
  );

  async function onCopy() {
    if (!address) return;
    const ok = await copyInviteLink(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Back to lessons"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">For grown-ups</h1>
          <p className="text-sm text-slate-500">Parent, teacher & sponsor tools</p>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-700">Circles account</h2>
        <WalletConnectButton />
        <p className="mt-3 text-xs text-slate-400">
          Connect a parent, teacher, or sponsor wallet. Children never need a
          wallet — rewards always go to a grown-up account.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-700">Progress</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat value={progress.xp} label="XP" />
          <Stat
            value={`${progress.completedLessonIds.length}/${lessons.length}`}
            label="Lessons"
          />
          <Stat
            value={`${progress.earnedBadgeIds.length}/${badges.length}`}
            label="Badges"
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-700">Rewards</h2>
        <RewardClaim />
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-slate-700">
          Invite another family or class
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          Share your link to grow the reading circle.
        </p>
        {address ? (
          <div className="flex flex-col gap-2">
            <code className="block truncate rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
              {buildInviteLink(address)}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700"
            >
              {copied ? "Copied!" : "Copy invite link"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Connect a wallet to get your invite link.
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-700">Badges earned</h2>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-slate-400">
            No badges yet — finish a lesson to earn the first one.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-3 py-3">
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
