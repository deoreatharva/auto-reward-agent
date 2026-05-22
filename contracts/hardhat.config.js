require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 84532,
    },
  },
};