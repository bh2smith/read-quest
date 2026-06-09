import { onAppData } from "@aboutcircles/miniapp-sdk";
import { track } from "../../lib/analytics";

// Who referred this device, persisted once so attribution survives reloads.
const REF_KEY = "readquest.referredBy.v1";

function readRefFromUrl(): string | null {
  try {
    return new URL(window.location.href).searchParams.get("ref");
  } catch {
    return null;
  }
}

let hostData: string | null = null;

function captureInbound() {
  const incoming = readRefFromUrl() ?? hostData;
  if (incoming && !localStorage.getItem(REF_KEY)) {
    try {
      localStorage.setItem(REF_KEY, incoming);
    } catch {
      // ignore unavailable storage
    }
  }
}

// The host can also deliver a referral code via its ?data= channel.
onAppData((data) => {
  hostData = data;
  captureInbound();
});
captureInbound();

export function getReferredBy(): string | null {
  try {
    return localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

export function buildInviteLink(address: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?ref=${encodeURIComponent(address)}`;
}

export async function copyInviteLink(address: string): Promise<boolean> {
  const link = buildInviteLink(address);
  try {
    await navigator.clipboard.writeText(link);
    track("referral_link_copied", { link });
    return true;
  } catch {
    return false;
  }
}

// Fire once when a wallet connects via someone else's invite link.
export function notifyReferredWalletConnected(address: string) {
  const referredBy = getReferredBy();
  if (referredBy && referredBy.toLowerCase() !== address.toLowerCase()) {
    track("referred_wallet_connected", { address, referredBy });
  }
}
