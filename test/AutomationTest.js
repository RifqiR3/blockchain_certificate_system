const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateNFT - Chainlink Automation Test", function () {
  this.timeout(80000); // just in case

  let contract, owner, user;
  const testMetadata = "ipfs://testhash";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    contract = await CertificateNFT.deploy();
  });

  it("Should expire only the certificate that passed its expiration", async function () {
    const now = Math.floor(Date.now() / 1000);

    // Cert A: expires in 1 minute
    const certA = await contract.mintCertificate(
      user.address,
      `${testMetadata}-a`,
      now + 60
    );
    await certA.wait();

    // Cert B: expires in 24 hours
    const certB = await contract.mintCertificate(
      user.address,
      `${testMetadata}-b`,
      now + 86400
    );
    await certB.wait();

    const tokenA = 1;
    const tokenB = 2;

    // ⏩ Fast-forward 65 seconds
    console.log("⏩ Advancing time by 65 seconds...");
    await ethers.provider.send("evm_increaseTime", [65]);
    await ethers.provider.send("evm_mine");

    // 🔍 CheckUpkeep
    const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");
    expect(upkeepNeeded).to.equal(true);

    // Decode performData to see what tokens are being expired
    const [expiredTokens, count] = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256[]", "uint256"],
      performData
    );

    expect(count).to.be.equal(1);
    expect(expiredTokens[0]).to.be.equal(tokenA);

    // PerformUpkeep
    const tx = await contract.performUpkeep(performData);
    await tx.wait();

    // Assertions
    expect(await contract.isExpiredOfficial(tokenA)).to.equal(true);
    expect(await contract.isExpiredOfficial(tokenB)).to.equal(false);
  });
});
