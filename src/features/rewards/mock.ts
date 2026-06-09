// Shared helpers for the MVP mock reward paths.

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// A throwaway, well-formed-looking tx hash for the demo. Not an on-chain hash.
export function mockTxHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
