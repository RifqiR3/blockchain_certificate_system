const hre = require("hardhat");

async function main() {
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const contract = await CertificateNFT.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
