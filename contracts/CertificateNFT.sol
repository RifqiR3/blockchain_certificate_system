// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

contract CertificateNFT is ERC721URIStorage, Ownable, AutomationCompatibleInterface {
    // Store active certificates (Simple Token List for now)
    uint256[] private _activeCertificates;

    // Store scan index for automation
    // This index is used to track the next certificate to be scanned for expiration
    uint256 private _scanIndex;

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

        _mint(recipient, newTokenId); // Mint the NFT to the recipient
        _setTokenURI(newTokenId, metadataURI); // Set metadata URI for the certificate
        _expirationTimestamps[newTokenId] = expirationTimestamps; // Set expiration timestamp for the certificate
        _activeCertificates.push(newTokenId); // Add to active certificates to track them

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

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 tokensToScan = 10; // Number of tokens to scan in one upkeep
        uint256 end = _scanIndex + tokensToScan; // Calculate the end index for scanning

        // Ensure end index does not exceed the length of active certificates
        if (end > _activeCertificates.length) {
            end = _activeCertificates.length; // Adjust end index if it exceeds the length of active certificates
        }

        uint256[] memory expiredTokens = new uint256[](tokensToScan); // Array to store expired tokens
        uint256 count = 0; // Counter for expired tokens

        // Loop through the active certificates starting from the scan index
        // and check for expiration
        for (uint256 i = _scanIndex; i < end; i++) {
            uint256 tokenId = _activeCertificates[i];
            if (!_expired[tokenId] && isExpired(tokenId)) {
                expiredTokens[count] = tokenId; // Store expired token ID
                count++;
            }
        }

        upkeepNeeded = count > 0; // Set upkeepNeeded to true if there are expired tokens
        performData = abi.encode(expiredTokens, count); // Encode expired tokens and count for performUpkeep
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory expiredTokens, uint256 count) = abi.decode(performData, (uint256[], uint256)); // Decode the expired tokens and count from performData

        // Update the scan index for the next upkeep
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = expiredTokens[i]; // Get the token ID of the expired token
            if (!_expired[tokenId] && isExpired(tokenId)) {
                expireCertificate(tokenId); // Expire the certificate if it is not already expired
            }
        }

        // Move scan index forward
        _scanIndex += count;
        if (_scanIndex >= _activeCertificates.length) {
            _scanIndex = 0; // Reset scan index if it exceeds the length of active certificates
        }
    }
}

