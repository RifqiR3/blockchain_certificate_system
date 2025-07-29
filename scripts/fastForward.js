const { ethers, network } = require("hardhat");

async function main() {
  console.log("Current block timestamp before:");
  let block = await ethers.provider.getBlock("latest");
  console.log(new Date(block.timestamp * 1000));

  const timeToAdd = 7 * 24 * 60 * 60;
  await network.provider.send("evm_increaseTime", [timeToAdd]);
  await network.provider.send("evm_mine");

  console.log("Current block timestamp after:");
  block = await ethers.provider.getBlock("latest");
  console.log(new Date(block.timestamp * 1000));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
