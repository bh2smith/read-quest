import type { Classroom } from "./useClassroom";

// A class invite encodes the group, its owner (the inviter), and a display name
// so a learner opening the link knows which study circle they're joining.
export type ClassInvite = {
  classId: string;
  inviter: string;
  name: string;
};

export function buildClassInvite(c: Classroom): string {
  const base = window.location.origin + window.location.pathname;
  const q = new URLSearchParams({ class: c.id, by: c.ownerAddress, n: c.name });
  return `${base}?${q.toString()}`;
}

export function parseClassInvite(): ClassInvite | null {
  try {
    const p = new URL(window.location.href).searchParams;
    const classId = p.get("class");
    const inviter = p.get("by");
    if (!classId || !inviter) return null;
    return { classId, inviter, name: p.get("n") ?? "Study circle" };
  } catch {
    return null;
  }
}
