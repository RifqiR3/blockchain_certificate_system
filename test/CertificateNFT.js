const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateNFT - Expiration Test", function () {
  this.timeout(80000); // Increase timeout for long-running tests

  let contract, owner, user;
  const testMetadata = "ipfs://testhash";

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    contract = await CertificateNFT.deploy();
  });

  it("Should mint with expiration and update status after it expires", async function () {
    // 1 minute from now
    const expirationTimestamp = Math.floor(Date.now() / 1000) + 60;

    const tx = await contract.mintCertificate(
      user.address,
      testMetadata,
      expirationTimestamp
    );
    await tx.wait();

    const tokenId = 1;

    // Should not be expired initially
    expect(await contract.isExpired(tokenId)).to.equal(false);
    expect(await contract.isExpiredOfficial(tokenId)).to.equal(false);

    console.log("⏳ Waiting 65 seconds for certificate to expire...");
    console.log("⏩ Fast-forwarding 65 seconds in Hardhat...");
    await ethers.provider.send("evm_increaseTime", [65]);
    await ethers.provider.send("evm_mine");

    // After 65 seconds, it should be expired
    expect(await contract.isExpired(tokenId)).to.equal(true);

    // Admin expires it manually
    await contract.expireCertificate(tokenId);
    expect(await contract.isExpiredOfficial(tokenId)).to.equal(true);
  });
});
