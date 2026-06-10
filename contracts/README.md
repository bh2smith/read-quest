# ReadQuest contracts

## Badge1155.sol

A soulbound ERC-1155 for ESL achievement badges — one token id per lesson
(1–5). Badges are **non-transferable** (transfers/approvals revert), which keeps
them non-speculative credentials rather than tradeable assets.

- `mint(to, id)` — mints one badge `id` to `to`; one per `(address, id)`.
  **Open mint in this MVP.** Production should gate it behind an attestation /
  verifier so badges can't be self-granted arbitrarily.
- `balanceOf`, `balanceOfBatch`, `uri`, `earned(address,id)` — reads.
- `setURI` — owner only.

## Deploy (Gnosis Chain, id 100)

Compile with Foundry:

```bash
forge build --root contracts
# -> contracts/out/Badge1155.sol/Badge1155.json
```

Deploy with the viem script (needs a funded Gnosis/xDAI key):

```bash
DEPLOYER_PRIVATE_KEY=0x... bun contracts/scripts/deployBadge.ts
```

It prints the deployed address. Set it in the app env to enable on-chain minting:

```
VITE_BADGE_1155_ADDRESS=0x...
```

With that set, completing a lesson inside the Circles host mints the badge to
the learner's own wallet via the host's `sendTransactions` (see
`src/features/rewards/badgeMint.ts`). Without it, the app simulates the mint.

## Status

The contract and deploy tooling are written but **not yet deployed**. No address
is configured, so the app runs the mock mint path by default.
