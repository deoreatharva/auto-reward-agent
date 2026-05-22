const { ethers } = require("hardhat");

const BADGE_ABI = [
  "function setMinterAgent(address _agent) external",
  "function minterAgent() view returns (address)",
];

async function main() {
  const [deployer] = await ethers.getSigners();

  const badgeAddress = process.env.BADGE_ADDRESS;
  const agentAddress = process.env.AGENT_WALLET_ADDRESS;

  if (!badgeAddress) throw new Error("BADGE_ADDRESS not set in .env");
  if (!agentAddress) throw new Error("AGENT_WALLET_ADDRESS not set in .env");

  console.log("Deployer wallet:", deployer.address);
  console.log("Badge contract :", badgeAddress);
  console.log("Agent wallet   :", agentAddress);

  const badge = new ethers.Contract(badgeAddress, BADGE_ABI, deployer);

  const current = await badge.minterAgent();
  console.log("\nCurrent minterAgent:", current);

  console.log("Setting new minterAgent...");
  const tx = await badge.setMinterAgent(agentAddress);
  await tx.wait();

  const updated = await badge.minterAgent();
  console.log("✅ Done! minterAgent is now:", updated);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});