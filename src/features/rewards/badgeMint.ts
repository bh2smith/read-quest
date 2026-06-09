import type { Badge } from "../../lib/types";
import { delay, mockTxHash } from "./mock";

export type MintResult = { txHash: string; mode: "mock" | "onchain" };

/**
 * Mint an achievement badge to the parent/teacher wallet.
 *
 * MVP: simulated so the full flow is demoable without a deployed contract.
 *
 * Real path (plan.md §8 "Best for demo" → ERC-1155 on Gnosis Chain, id 100):
 *   1. Deploy contracts/Badge1155.sol; put its address in VITE_BADGE_1155_ADDRESS.
 *   2. Encode the call, e.g. with viem:
 *        const data = encodeFunctionData({
 *          abi: badge1155Abi,
 *          functionName: "mint",
 *          args: [to, BigInt(badge.tokenId ?? 0), 1n, "0x"],
 *        });
 *   3. Have the host sign + broadcast it:
 *        import { sendTransactions } from "@aboutcircles/miniapp-sdk";
 *        const [txHash] = await sendTransactions([{ to: CONTRACT, data }]);
 *        return { txHash, mode: "onchain" };
 */
export async function mintBadge(_badge: Badge, _to: string): Promise<MintResult> {
  await delay(800);
  return { txHash: mockTxHash(), mode: "mock" };
}
