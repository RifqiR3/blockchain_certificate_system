require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      saveDeployments: true,
    },
    hardhat: {
      saveDeployments: true,
      chainId: 31337,
    },
  },
  paths: {
    deployments: "./deployments",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
