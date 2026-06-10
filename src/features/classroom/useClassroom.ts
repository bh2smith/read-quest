import { create } from "zustand";
import type { Address } from "@aboutcircles/sdk-types";
import { track } from "../../lib/analytics";
import { getCirclesSdk, isLiveCircles } from "../circles/circlesClient";

const KEY = "readquest.classroom.v1";

export type Member = {
  address: string;
  name?: string;
  joinedAt: number;
  trusted: boolean; // trusted into the group (group ↔ member edge established)
};

export type Classroom = {
  id: string; // group address (live) or a demo id
  name: string;
  symbol: string;
  ownerAddress: string; // instructor
  createdAt: number;
  live: boolean; // backed by a real on-chain group
  members: Member[];
};

type ClassroomStore = {
  classes: Classroom[];
  busy: boolean;
  error: string | null;
  createClass: (name: string, ownerAddress: string) => Promise<Classroom | null>;
  addMember: (classId: string, address: string, name?: string) => void;
  setMemberTrusted: (classId: string, address: string, trusted: boolean) => void;
  joinClass: (
    invite: { classId: string; inviter: string; name: string },
    learnerAddress: string,
    learnerName?: string,
  ) => Promise<void>;
  trustMember: (classId: string, memberAddress: string, ownerAddress: string) => Promise<void>;
  refreshMembers: (classId: string, ownerAddress: string) => Promise<void>;
  removeClass: (classId: string) => void;
};

function load(): Classroom[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Classroom[]) : [];
  } catch {
    return [];
  }
}

function persist(classes: Classroom[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(classes));
  } catch {
    // ignore
  }
}

// Circles group names must be <= 19 chars; symbols are short uppercase tickers.
function groupSymbol(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  return base.length >= 3 ? base : `RQ${base}`;
}

function demoGroupId(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export const useClassroom = create<ClassroomStore>((set, get) => ({
  classes: load(),
  busy: false,
  error: null,

  createClass: async (rawName, ownerAddress) => {
    const name = rawName.trim().slice(0, 19);
    if (!name) {
      set({ error: "Give the class a name." });
      return null;
    }
    set({ busy: true, error: null });

    try {
      let classroom: Classroom;

      if (isLiveCircles(ownerAddress)) {
        // Real on-chain study circle: register a Circles base group owned by
        // the instructor. owner/service/feeCollection all point at the
        // instructor for a simple, single-owner class.
        const sdk = getCirclesSdk(ownerAddress as Address);
        const owner = ownerAddress as Address;
        const symbol = groupSymbol(name);
        const group = await sdk.register.asGroup(owner, owner, owner, [], name, symbol, {
          name,
          description: `ReadQuest study circle: ${name}`,
        });
        classroom = {
          id: group.address,
          name,
          symbol,
          ownerAddress,
          createdAt: Date.now(),
          live: true,
          members: [],
        };
      } else {
        // Demo: simulate a group so the flow is runnable without the host.
        classroom = {
          id: demoGroupId(),
          name,
          symbol: groupSymbol(name),
          ownerAddress,
          createdAt: Date.now(),
          live: false,
          members: [],
        };
      }

      const classes = [...get().classes, classroom];
      persist(classes);
      set({ classes, busy: false });
      track("class_created", { id: classroom.id, live: classroom.live });
      return classroom;
    } catch (e) {
      set({ busy: false, error: e instanceof Error ? e.message : "Could not create class" });
      return null;
    }
  },

  addMember: (classId, address, name) => {
    set((s) => {
      const classes = s.classes.map((c) => {
        if (c.id !== classId) return c;
        if (c.members.some((m) => m.address.toLowerCase() === address.toLowerCase())) {
          return c;
        }
        return {
          ...c,
          members: [...c.members, { address, name, joinedAt: Date.now(), trusted: false }],
        };
      });
      persist(classes);
      return { classes };
    });
  },

  setMemberTrusted: (classId, address, trusted) => {
    set((s) => {
      const classes = s.classes.map((c) =>
        c.id !== classId
          ? c
          : {
              ...c,
              members: c.members.map((m) =>
                m.address.toLowerCase() === address.toLowerCase() ? { ...m, trusted } : m,
              ),
            },
      );
      persist(classes);
      return { classes };
    });
  },

  joinClass: async (invite, learnerAddress, learnerName) => {
    const { classId, inviter, name } = invite;
    set({ busy: true, error: null });
    try {
      // Record the class on the learner's own device if it's not there yet.
      set((s) => {
        if (s.classes.some((c) => c.id === classId)) return s;
        const joined: Classroom = {
          id: classId,
          name,
          symbol: "",
          ownerAddress: inviter,
          createdAt: Date.now(),
          live: isLiveCircles(learnerAddress),
          members: [],
        };
        const classes = [...s.classes, joined];
        persist(classes);
        return { classes };
      });

      // Live: the learner trusts the group, making membership visible on-chain
      // (the instructor reads it back via sdk.groups.getMembers).
      if (isLiveCircles(learnerAddress)) {
        const sdk = getCirclesSdk(learnerAddress as Address);
        const me = await sdk.getAvatar(learnerAddress as Address);
        await me.trust.add(classId as Address);
      }

      get().addMember(classId, learnerAddress, learnerName);
      track("member_joined", {
        classId,
        member: learnerAddress,
        live: isLiveCircles(learnerAddress),
      });
      set({ busy: false });
    } catch (e) {
      set({ busy: false, error: e instanceof Error ? e.message : "Could not join class" });
    }
  },

  trustMember: async (classId, memberAddress, ownerAddress) => {
    set({ busy: true, error: null });
    try {
      // Live: the group trusts the member (accepts their tokens as collateral).
      if (isLiveCircles(ownerAddress)) {
        const sdk = getCirclesSdk(ownerAddress as Address);
        const group = await sdk.getAvatar(classId as Address);
        await group.trust.add(memberAddress as Address);
      }
      get().setMemberTrusted(classId, memberAddress, true);
      track("member_trusted", {
        classId,
        member: memberAddress,
        live: isLiveCircles(ownerAddress),
      });
      set({ busy: false });
    } catch (e) {
      set({ busy: false, error: e instanceof Error ? e.message : "Could not trust member" });
    }
  },

  refreshMembers: async (classId, ownerAddress) => {
    if (!isLiveCircles(ownerAddress)) return; // demo roster is already local
    set({ busy: true, error: null });
    try {
      const sdk = getCirclesSdk(ownerAddress as Address);
      const page = await sdk.groups.getMembers(classId as Address);
      const onchain = page.results.map((r) => r.member as string);

      set((s) => {
        const classes = s.classes.map((c) => {
          if (c.id !== classId) return c;
          const known = new Set(c.members.map((m) => m.address.toLowerCase()));
          const added = onchain
            .filter((addr) => !known.has(addr.toLowerCase()))
            .map((addr) => ({ address: addr, joinedAt: Date.now(), trusted: true }));
          // On-chain group members are, by definition, trusted into the group.
          const members = [...c.members, ...added].map((m) =>
            onchain.some((a) => a.toLowerCase() === m.address.toLowerCase())
              ? { ...m, trusted: true }
              : m,
          );
          return { ...c, members };
        });
        persist(classes);
        return { classes };
      });
      set({ busy: false });
    } catch (e) {
      set({ busy: false, error: e instanceof Error ? e.message : "Could not load members" });
    }
  },

  removeClass: (classId) => {
    set((s) => {
      const classes = s.classes.filter((c) => c.id !== classId);
      persist(classes);
      return { classes };
    });
  },
}));
