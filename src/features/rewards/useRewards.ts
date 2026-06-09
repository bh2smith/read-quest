import { create } from "zustand";
import { track } from "../../lib/analytics";
import { lessonsById } from "../../data/lessons";
import { badgesById } from "../../data/badges";
import { mintBadge } from "./badgeMint";
import { sendCrcReward } from "./crcReward";

const KEY = "readquest.rewards.v1";

// Simple cooldown between CRC claims per wallet (anti-farming, plan.md §14).
export const CRC_COOLDOWN_MS = 30_000;

type WalletRewards = {
  mintedLessonIds: string[];
  claimedLessonIds: string[];
  lastClaimAt: number;
};

type RewardsData = Record<string, WalletRewards>;

const emptyWallet = (): WalletRewards => ({
  mintedLessonIds: [],
  claimedLessonIds: [],
  lastClaimAt: 0,
});

const key = (address: string) => address.toLowerCase();

function load(): RewardsData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RewardsData) : {};
  } catch {
    return {};
  }
}

function persist(data: RewardsData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore unavailable storage
  }
}

type RewardsStore = {
  data: RewardsData;
  pending: Record<string, boolean>; // `${addr}:${kind}:${lessonId}`
  error: string | null;
  walletOf: (address: string) => WalletRewards;
  isPending: (address: string, kind: "mint" | "crc", lessonId: string) => boolean;
  mintBadge: (address: string, lessonId: string) => Promise<void>;
  claimCrc: (address: string, lessonId: string) => Promise<void>;
};

export const useRewards = create<RewardsStore>((set, get) => ({
  data: load(),
  pending: {},
  error: null,

  walletOf: (address) => get().data[key(address)] ?? emptyWallet(),

  isPending: (address, kind, lessonId) =>
    !!get().pending[`${key(address)}:${kind}:${lessonId}`],

  mintBadge: async (address, lessonId) => {
    const k = key(address);
    const wallet = get().data[k] ?? emptyWallet();
    if (wallet.mintedLessonIds.includes(lessonId)) return; // one per lesson per wallet

    const pk = `${k}:mint:${lessonId}`;
    if (get().pending[pk]) return;
    set((s) => ({ pending: { ...s.pending, [pk]: true }, error: null }));

    try {
      const lesson = lessonsById[lessonId];
      const badge = badgesById[lesson.badgeId];
      const result = await mintBadge(badge, address);

      set((s) => {
        const w = s.data[k] ?? emptyWallet();
        const data = {
          ...s.data,
          [k]: { ...w, mintedLessonIds: [...w.mintedLessonIds, lessonId] },
        };
        persist(data);
        return { data };
      });
      track("badge_minted", {
        lessonId,
        badgeId: badge.id,
        to: address,
        txHash: result.txHash,
        mode: result.mode,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Mint failed" });
    } finally {
      set((s) => {
        const { [pk]: _, ...rest } = s.pending;
        return { pending: rest };
      });
    }
  },

  claimCrc: async (address, lessonId) => {
    const k = key(address);
    const wallet = get().data[k] ?? emptyWallet();
    if (wallet.claimedLessonIds.includes(lessonId)) return; // one claim per lesson per wallet

    const sinceLast = Date.now() - wallet.lastClaimAt;
    if (sinceLast < CRC_COOLDOWN_MS) {
      const secs = Math.ceil((CRC_COOLDOWN_MS - sinceLast) / 1000);
      set({ error: `Please wait ${secs}s before the next reward.` });
      return;
    }

    const pk = `${k}:crc:${lessonId}`;
    if (get().pending[pk]) return;
    set((s) => ({ pending: { ...s.pending, [pk]: true }, error: null }));

    try {
      const result = await sendCrcReward(address);
      set((s) => {
        const w = s.data[k] ?? emptyWallet();
        const data = {
          ...s.data,
          [k]: {
            ...w,
            claimedLessonIds: [...w.claimedLessonIds, lessonId],
            lastClaimAt: Date.now(),
          },
        };
        persist(data);
        return { data };
      });
      track("crc_reward_claimed", {
        lessonId,
        to: address,
        amount: result.amount,
        txHash: result.txHash,
        mode: result.mode,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Claim failed" });
    } finally {
      set((s) => {
        const { [pk]: _, ...rest } = s.pending;
        return { pending: rest };
      });
    }
  },
}));
