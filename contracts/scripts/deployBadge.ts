/**
 * Deploy Badge1155 to Gnosis Chain with viem.
 *
 * Compile first (Foundry):  forge build --root contracts
 *   produces contracts/out/Badge1155.sol/Badge1155.json
 *
 * Then run:
 *   DEPLOYER_PRIVATE_KEY=0x... bun contracts/scripts/deployBadge.ts
 *
 * Env:
 *   DEPLOYER_PRIVATE_KEY  required — a funded Gnosis (xDAI) key
 *   GNOSIS_RPC_URL        optional — defaults to https://rpc.gnosischain.com
 *   BADGE_URI             optional — ERC-1155 metadata URI (may contain {id})
 *   BADGE_ARTIFACT        optional — path to the compiled artifact JSON
 *
 * Prints the deployed address to set as VITE_BADGE_1155_ADDRESS.
 */
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosis } from "viem/chains";

const PK = process.env.DEPLOYER_PRIVATE_KEY;
const RPC = process.env.GNOSIS_RPC_URL ?? "https://rpc.gnosischain.com";
const BADGE_URI =
  process.env.BADGE_URI ??
  "https://read-quest-liard.vercel.app/badge-metadata/{id}.json";
const ARTIFACT =
  process.env.BADGE_ARTIFACT ?? "contracts/out/Badge1155.sol/Badge1155.json";

if (!PK) throw new Error("Set DEPLOYER_PRIVATE_KEY (a funded Gnosis key).");

const artifact = JSON.parse(readFileSync(ARTIFACT, "utf8"));
const abi = artifact.abi;
const bytecode = (artifact.bytecode?.object ?? artifact.bytecode) as `0x${string}`;

const account = privateKeyToAccount(
  (PK.startsWith("0x") ? PK : `0x${PK}`) as `0x${string}`,
);
const wallet = createWalletClient({ account, chain: gnosis, transport: http(RPC) });
const pub = createPublicClient({ chain: gnosis, transport: http(RPC) });

const hash = await wallet.deployContract({ abi, bytecode, args: [BADGE_URI] });
console.log("deploy tx:", hash);

const receipt = await pub.waitForTransactionReceipt({ hash });
console.log("Badge1155 deployed at:", receipt.contractAddress);
console.log(`Set VITE_BADGE_1155_ADDRESS=${receipt.contractAddress}`);
