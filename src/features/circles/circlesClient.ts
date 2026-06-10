import { Sdk, type ContractRunner } from "@aboutcircles/sdk";
import type { Address, TransactionRequest } from "@aboutcircles/sdk-types";
import { createPublicClient, http, type PublicClient } from "viem";
import { gnosis } from "viem/chains";
import { isMiniappMode, sendTransactions } from "@aboutcircles/miniapp-sdk";

/**
 * Real Circles SDK wiring for live (in-host) mode.
 *
 * VERIFICATION STATUS: the read paths and the runner are exercised only against
 * a live Circles host + funded Gnosis wallet. They are correctly typed against
 * @aboutcircles/sdk but have NOT been executed end-to-end from this repo. Outside
 * the host, the app uses demo mode (see useClassroom) — never this module's writes.
 */

// Shared viem public client for on-chain reads (eth_call, receipts).
const publicClient: PublicClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});

/**
 * Adapts the Circles SDK's ContractRunner to the mini-app host: the host owns
 * the connected wallet (a Safe) and signs, so writes go through sendTransactions.
 * The host returns tx hashes; we wait for the receipt the SDK expects.
 */
function makeHostRunner(address: Address): ContractRunner {
  return {
    address,
    publicClient,
    async init() {},
    async call(tx: TransactionRequest) {
      const res = await publicClient.call({ to: tx.to, data: tx.data });
      return res.data ?? "0x";
    },
    async estimateGas(tx: TransactionRequest) {
      return publicClient.estimateGas({ account: address, to: tx.to, data: tx.data });
    },
    async sendTransaction(txs: TransactionRequest[]) {
      // The host batches multiple txs atomically (Safe) and returns hashes.
      const hashes = await sendTransactions(
        txs.map((t) => ({
          to: t.to,
          data: t.data,
          value: t.value !== undefined ? t.value.toString() : undefined,
        })),
      );
      const last = hashes[hashes.length - 1] as `0x${string}`;
      return publicClient.waitForTransactionReceipt({ hash: last });
    },
  };
}

let _sdk: Sdk | null = null;
let _sdkAddress: Address | null = null;

/** SDK bound to the connected wallet, able to send transactions via the host. */
export function getCirclesSdk(address: Address): Sdk {
  if (_sdk && _sdkAddress === address) return _sdk;
  _sdk = new Sdk(undefined, makeHostRunner(address));
  _sdkAddress = address;
  return _sdk;
}

let _readSdk: Sdk | null = null;
/** Read-only SDK (no runner) for queries that don't need a signer. */
export function getReadSdk(): Sdk {
  if (!_readSdk) _readSdk = new Sdk();
  return _readSdk;
}

export function getPublicClient(): PublicClient {
  return publicClient;
}

/**
 * True only when real Circles operations are possible: inside the host with a
 * connected wallet. Everywhere else the app stays in demo mode.
 */
export function isLiveCircles(address: string | null): address is string {
  return isMiniappMode() && !!address;
}
