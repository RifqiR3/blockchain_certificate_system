const { ethers } = require("hardhat");

describe("Plain NFT Gas Test", function () {
  it("Should measure gas for plain _mint", async () => {
    const [owner, user] = await ethers.getSigners();

    const PlainNFT = await ethers.getContractFactory("PlainNFT");
    const contract = await PlainNFT.deploy();
    await contract.waitForDeployment();

    const tx = await contract.mint(user.address);
    const receipt = await tx.wait();

    console.log("Gas used for plain mint:", receipt.gasUsed.toString());
  });
});
