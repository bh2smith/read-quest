import { shortAddress, useWallet } from "../features/circles/wallet";

export function WalletConnectButton() {
  const { address, demo, connecting, error, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          {demo ? "Demo wallet" : "Connected"} · {shortAddress(address)}
        </span>
        {demo && (
          <button
            type="button"
            onClick={disconnect}
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={connecting}
        onClick={connect}
        className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {connecting ? "Connecting…" : "Connect Circles wallet"}
      </button>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
