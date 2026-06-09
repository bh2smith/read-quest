import { create } from "zustand";
import {
  isMiniappMode,
  onWalletChange,
  requestCreateAccount,
} from "@aboutcircles/miniapp-sdk";
import { track } from "../../lib/analytics";
import { notifyReferredWalletConnected } from "../referrals/referral";

// Used only outside the Circles host (local dev / preview) so the parent/teacher
// view is demoable in a plain browser. Obviously fake; never used in miniapp mode.
const DEMO_ADDRESS = "0xdddddddddddddddddddddddddddddddddddddddd";

type WalletStore = {
  address: string | null;
  isMiniapp: boolean;
  demo: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export const useWallet = create<WalletStore>((set, get) => ({
  address: null,
  isMiniapp: isMiniappMode(),
  demo: false,
  connecting: false,
  error: null,

  connect: async () => {
    if (get().address || get().connecting) return;
    set({ connecting: true, error: null });

    // Standalone: the host isn't there to create an account. Fall back to a
    // clearly-labeled demo wallet so the grown-up flow stays viewable.
    if (!isMiniappMode()) {
      set({ address: DEMO_ADDRESS, demo: true, connecting: false });
      track("wallet_connected", { mode: "demo", address: DEMO_ADDRESS });
      notifyReferredWalletConnected(DEMO_ADDRESS);
      return;
    }

    try {
      // Resolves after the host's auth_success, which onWalletChange already
      // handles (sets address, tracks, attributes referral) — so just clear state.
      await requestCreateAccount();
      set({ connecting: false });
    } catch (e) {
      set({
        connecting: false,
        error: e instanceof Error ? e.message : "Could not connect",
      });
    }
  },

  disconnect: () => {
    // The host owns real connection state; this only clears the local demo wallet.
    if (get().demo) set({ address: null, demo: false });
  },
}));

// Host is the source of truth for real connection state.
onWalletChange((address) => {
  if (address) {
    useWallet.setState({ address, demo: false, connecting: false, error: null });
    track("wallet_connected", { mode: "miniapp", address });
    notifyReferredWalletConnected(address);
  } else if (!useWallet.getState().demo) {
    useWallet.setState({ address: null });
  }
});

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
