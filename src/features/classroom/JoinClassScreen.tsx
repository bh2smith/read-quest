import { shortAddress, useWallet } from "../circles/wallet";
import { WalletConnectButton } from "../../components/WalletConnectButton";
import { useClassroom } from "./useClassroom";
import type { ClassInvite } from "./classInvite";

type Props = {
  invite: ClassInvite;
  onDone: () => void;
};

export function JoinClassScreen({ invite, onDone }: Props) {
  const address = useWallet((s) => s.address);
  const { joinClass, busy, error, classes } = useClassroom();

  const isOwner = !!address && address.toLowerCase() === invite.inviter.toLowerCase();
  const alreadyJoined =
    !!address &&
    classes.some(
      (c) =>
        c.id === invite.classId &&
        c.members.some((m) => m.address.toLowerCase() === address.toLowerCase()),
    );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="text-7xl">🎓</div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
          Study circle invite
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-800">{invite.name}</h1>
        <p className="mt-2 text-slate-500">
          You've been invited to a ReadQuest study circle. Connect your Circles
          account to join — your lessons and badges stay yours.
        </p>
      </div>

      {!address ? (
        <WalletConnectButton />
      ) : isOwner ? (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          This is your own study circle ({shortAddress(invite.inviter)}).
        </p>
      ) : alreadyJoined ? (
        <p className="rounded-2xl bg-emerald-100 px-4 py-3 font-semibold text-emerald-700">
          ✓ You're in this circle.
        </p>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => joinClass(invite, address).then(onDone)}
          className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Joining…" : "Join study circle"}
        </button>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <button
        type="button"
        onClick={onDone}
        className="text-sm text-slate-400 underline hover:text-slate-600"
      >
        {address && (isOwner || alreadyJoined) ? "Continue" : "Maybe later"}
      </button>
    </div>
  );
}
