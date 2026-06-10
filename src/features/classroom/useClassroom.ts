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

  removeClass: (classId) => {
    set((s) => {
      const classes = s.classes.filter((c) => c.id !== classId);
      persist(classes);
      return { classes };
    });
  },
}));
