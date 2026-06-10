// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReadQuest Badge1155 — soulbound ESL achievement badges
/// @notice One token id per lesson. Badges are non-transferable credentials
///         (soulbound), which keeps them non-speculative achievements rather
///         than tradeable assets.
/// @dev Minimal ERC-1155 (balance + metadata views, no transfers/approvals).
///      `mint` is open for the MVP demo; production should gate it behind an
///      attestation / verifier so badges can't be self-granted arbitrarily.
contract Badge1155 {
    string public name = "ReadQuest Badges";
    string public symbol = "RQB";

    address public owner;
    string private _uri;

    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(address => mapping(uint256 => bool)) public earned;

    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );
    event URI(string value, uint256 indexed id);

    error NotOwner();
    error AlreadyEarned();
    error Soulbound();

    constructor(string memory uri_) {
        owner = msg.sender;
        _uri = uri_;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Mint one badge `id` to `to`. One per (address, id).
    function mint(address to, uint256 id) external {
        if (earned[to][id]) revert AlreadyEarned();
        earned[to][id] = true;
        _balances[id][to] = 1;
        emit TransferSingle(msg.sender, address(0), to, id, 1);
    }

    function balanceOf(address account, uint256 id) external view returns (uint256) {
        return _balances[id][account];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory out = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            out[i] = _balances[ids[i]][accounts[i]];
        }
        return out;
    }

    /// @dev ERC-1155 metadata URI; may contain the `{id}` placeholder.
    function uri(uint256) external view returns (string memory) {
        return _uri;
    }

    function setURI(string calldata uri_) external onlyOwner {
        _uri = uri_;
    }

    // --- Soulbound: transfers and approvals are disabled ---
    function setApprovalForAll(address, bool) external pure {
        revert Soulbound();
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    function safeTransferFrom(address, address, uint256, uint256, bytes calldata) external pure {
        revert Soulbound();
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure {
        revert Soulbound();
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165
            interfaceId == 0xd9b67a26 || // ERC1155
            interfaceId == 0x0e89341c; // ERC1155MetadataURI
    }
}
