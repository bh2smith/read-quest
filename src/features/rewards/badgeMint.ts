import { encodeFunctionData } from "viem";
import { sendTransactions } from "@aboutcircles/miniapp-sdk";
import type { Badge } from "../../lib/types";
import { isLiveCircles } from "../circles/circlesClient";
import { badge1155Abi } from "./badge1155Abi";
import { delay, mockTxHash } from "./mock";

export type MintResult = { txHash: string; mode: "mock" | "onchain" };

const BADGE_CONTRACT = import.meta.env.VITE_BADGE_1155_ADDRESS as string | undefined;

function tokenIdFor(badge: Badge): bigint {
  if (badge.tokenId !== undefined) return BigInt(badge.tokenId);
  // Fallback: derive from lessonId like "lesson-3" -> 3.
  const n = Number(badge.lessonId.replace(/\D/g, ""));
  return BigInt(Number.isFinite(n) && n > 0 ? n : 1);
}

/**
 * Mint a soulbound achievement badge to the learner's (or instructor's) wallet.
 *
 * On-chain path is taken when a Badge1155 address is configured AND we're live
 * inside the Circles host: the host signs `mint(to, tokenId)`. Otherwise the
 * MVP simulates the mint so the flow is demoable.
 *
 * Deploy the contract (contracts/Badge1155.sol) and set VITE_BADGE_1155_ADDRESS
 * to enable the on-chain path. See contracts/README.md.
 */
export async function mintBadge(badge: Badge, to: string): Promise<MintResult> {
  if (BADGE_CONTRACT && isLiveCircles(to)) {
    const data = encodeFunctionData({
      abi: badge1155Abi,
      functionName: "mint",
      args: [to as `0x${string}`, tokenIdFor(badge)],
    });
    const [txHash] = await sendTransactions([{ to: BADGE_CONTRACT, data }]);
    return { txHash, mode: "onchain" };
  }

  await delay(800);
  return { txHash: mockTxHash(), mode: "mock" };
}
