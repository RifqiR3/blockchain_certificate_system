// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    // Track latest minted token ID
    uint256 private _tokenIds;

    // Store certificate revocation status
    mapping(uint256 => bool) private _revoked;

    // Store expiration timestamps and status
    mapping(uint256 => uint256) private _expirationTimestamps;

    // Store expired status
    mapping(uint256 => bool) private _expired;

    constructor() ERC721("CertificateNFT", "CERT") Ownable() {}

    function mintCertificate(address recipient, string memory metadataURI, uint256 expirationTimestamps) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        _expirationTimestamps[newTokenId] = expirationTimestamps;

        return newTokenId;
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "CertificateNFT: Token does not exist");
        _revoked[tokenId] = true;
    }

    function isExpired(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) return false;
        return block.timestamp >= _expirationTimestamps[tokenId];
    }

    function isRevoked(uint256 tokenId) public view returns (bool) {
        return _revoked[tokenId];
    }

    function expireCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        require(isExpired(tokenId), "Certificate not yet expired");
        _expired[tokenId] = true;
    }

    function isExpiredOfficial(uint256 tokenId) public view returns (bool) {
        return _expired[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}

