import { useState } from "react";
import { shortAddress, useWallet } from "../circles/wallet";
import { useClassroom, type Classroom } from "./useClassroom";
import { buildClassInvite } from "./classInvite";

function randomAddress(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function StudyCircle() {
  const address = useWallet((s) => s.address);
  const { classes, busy, error, createClass } = useClassroom();
  const [name, setName] = useState("");

  if (!address) {
    return (
      <p className="text-sm text-slate-400">
        Connect a wallet above to create a study circle.
      </p>
    );
  }

  const myClasses = classes.filter(
    (c) => c.ownerAddress.toLowerCase() === address.toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-3">
      {myClasses.map((c) => (
        <ClassCard key={c.id} classroom={c} ownerAddress={address} />
      ))}

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={19}
          placeholder="Class name (e.g. ESL B1 Tue)"
          className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={async () => {
            const created = await createClass(name, address);
            if (created) setName("");
          }}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create"}
        </button>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <p className="text-xs text-slate-400">
        A study circle is a Circles group — members trust each other and earn
        on-chain badges. Inside the Circles app this creates a real group;
        elsewhere it's a local demo.
      </p>
    </div>
  );
}

function ClassCard({
  classroom: c,
  ownerAddress,
}: {
  classroom: Classroom;
  ownerAddress: string;
}) {
  const { addMember, trustMember, busy } = useClassroom();
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(buildClassInvite(c));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-slate-700">{c.name}</span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            c.live ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {c.live ? "On-chain group" : "Demo group"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {shortAddress(c.id)} · {c.members.length}{" "}
        {c.members.length === 1 ? "member" : "members"}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyInvite}
          className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          {copied ? "Invite copied!" : "Copy invite link"}
        </button>
        {!c.live && (
          <button
            type="button"
            onClick={() =>
              addMember(c.id, randomAddress(), `Learner ${c.members.length + 1}`)
            }
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-200"
          >
            + Add demo learner
          </button>
        )}
      </div>

      {c.members.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {c.members.map((m) => (
            <li
              key={m.address}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-slate-600">
                {m.name ?? "Learner"}{" "}
                <span className="text-slate-400">{shortAddress(m.address)}</span>
              </span>
              {m.trusted ? (
                <span className="shrink-0 text-xs font-semibold text-emerald-600">
                  ✓ Trusted
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => trustMember(c.id, m.address, ownerAddress)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  Trust
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
