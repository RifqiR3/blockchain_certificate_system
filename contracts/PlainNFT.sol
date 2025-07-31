// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PlainNFT is ERC721 {
    uint256 public tokenId;

    constructor() ERC721("PlainNFT", "PNFT") {}

    function mint(address to) external {
        _mint(to, tokenId);
        tokenId++;
    }
}
