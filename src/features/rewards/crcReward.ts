import { delay, mockTxHash } from "./mock";

// Small symbolic reward per completed lesson (plan.md §13).
export const CRC_REWARD_PER_LESSON = "0.5";

export type ClaimResult = {
  txHash: string;
  mode: "mock" | "onchain";
  amount: string;
};

/**
 * Send a small CRC reward to the parent/teacher/class wallet.
 *
 * MVP: simulated transfer so claim limits and UX can be demoed end-to-end.
 *
 * Real path (Circles personal/group currency over the trust graph):
 *   - Resolve a transfer path with the Circles SDK pathfinder from the funding
 *     wallet (parent/teacher, or a sponsor-funded group) to `to`.
 *   - Encode the hub transfer (operateFlowMatrix / groupMint as appropriate).
 *   - Broadcast via the host:
 *       import { sendTransactions } from "@aboutcircles/miniapp-sdk";
 *       const [txHash] = await sendTransactions(pathTxs);
 *       return { txHash, mode: "onchain", amount: CRC_REWARD_PER_LESSON };
 *   - Server-side: record the claim id and check sponsor-pool depletion before
 *     funding (plan.md §14).
 */
export async function sendCrcReward(_to: string): Promise<ClaimResult> {
  await delay(800);
  return { txHash: mockTxHash(), mode: "mock", amount: CRC_REWARD_PER_LESSON };
}
