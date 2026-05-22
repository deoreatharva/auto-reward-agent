import "dotenv/config";
import { ethers } from "ethers";
import {
  UGFClient,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_TYPE,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";

// ─────────────────────────────────────────────────────────────────────
// THE AGENT
// Watches DonationVault for DonationReceived events.
// When a donation lands, agent gaslessly mints a Badge NFT to the donor.
// Agent pays gas in TYI Mock USD — never touches ETH.
// ─────────────────────────────────────────────────────────────────────

// only need the functions/events we use
const DONATION_VAULT_ABI = [
  "event DonationReceived(address indexed donor, string cause, uint256 timestamp)",
];

const BADGE_ABI = [
  "function mint(address to, string cause) external returns (uint256)",
];

// ── Setup ─────────────────────────────────────────────────────────────

// provider connects to Base Sepolia (read-only, for listening to events)
const provider = new ethers.WebSocketProvider("https://base-sepolia.g.alchemy.com/v2/ypGpKXbHaD2XqQtVnCWCx");

// CRITICAL: agent wallet MUST have provider attached — UGF throws NO_PROVIDER otherwise
const agentWallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);

// contract instances for reading events and building calldata
const donationVault = new ethers.Contract(
  process.env.DONATION_VAULT_ADDRESS,
  DONATION_VAULT_ABI,
  provider // read-only provider for listening
);

const badgeContract = new ethers.Contract(
  process.env.BADGE_ADDRESS,
  BADGE_ABI,
  agentWallet // agent wallet for encoding calldata
);

// ── Main agent loop ───────────────────────────────────────────────────

async function startAgent() {
  console.log("🤖 AutoReward Agent started");
  console.log("   Wallet:", agentWallet.address);
  console.log("   Watching DonationVault:", process.env.DONATION_VAULT_ADDRESS);
  console.log("   Will mint from Badge:", process.env.BADGE_ADDRESS);
  console.log("   Waiting for donations...\n");

  // Listen for DonationReceived events on Base Sepolia
  donationVault.on("DonationReceived", async (donor, cause, timestamp) => {
    console.log(`\n💰 Donation detected!`);
    console.log(`   Donor : ${donor}`);
    console.log(`   Cause : ${cause}`);
    console.log(`   Time  : ${new Date(Number(timestamp) * 1000).toLocaleString()}`);

    // mint badge to the donor gaslessly
    await mintBadgeGaslessly(donor, cause);
  });
}

// ── Gasless mint via UGF ──────────────────────────────────────────────

async function mintBadgeGaslessly(donorAddress, cause) {
  console.log(`\n🎨 Minting badge for ${donorAddress}...`);

  try {
    const client = new UGFClient({
      baseUrl: "https://gateway.universalgasframework.com",
    });

    // encode mint(donorAddress, cause) as hex calldata
    // NEVER pass a raw object — must be encoded hex string
    const encodedData = badgeContract.interface.encodeFunctionData("mint", [
      donorAddress,
      cause,
    ]);

    // ── Step 1: Authenticate ──────────────────────────────────────
    console.log("🔐 Step 1: Authenticating agent with UGF...");
    await client.auth.login(agentWallet);

    // ── Step 2: Quote ─────────────────────────────────────────────
    // CRITICAL: tx_object must be JSON.stringify'd — not a raw object
    console.log("💬 Step 2: Getting quote...");
    const quote = await client.quote.get({
      payment_coin: TYI_USD_PAYMENT_COIN,
      payer_address: agentWallet.address,
      payment_chain: BASE_SEPOLIA_CHAIN_ID,
      payment_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
      tx_object: JSON.stringify({
        from: agentWallet.address,
        to: process.env.BADGE_ADDRESS,
        data: encodedData,
        value: "0",
      }),
      dest_chain_id: BASE_SEPOLIA_CHAIN_ID,
      dest_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
    });
    console.log(`✅ Quote: costs ${quote.payment_amount} TYI`);
    // quote.digest is the session key — ties all steps together

    // ── Step 3: Settle (pay in TYI Mock USD) ─────────────────────
    // this is a signature only — no on-chain tx from the agent
    console.log("✍️  Step 3: Authorizing TYI payment...");
    await client.payment.x402.execute({ quote, signer: agentWallet });

    // ── Step 4: Execute (UGF pays ETH gas, mint happens on-chain) ─
    // DO NOT set gasLimit, gasPrice, or type in the returned object
    console.log("🚀 Step 4: Executing mint...");
    const { userTxHash } = await client.chains.evm.sponsorAndExecute(
      quote.digest,
      agentWallet,
      async () => ({
        to: process.env.BADGE_ADDRESS,
        data: encodedData,
        value: 0n,
        // no gas params — SDK computes from sponsored ETH budget
      }),
      {
        maxAttempts: 40,
        intervalMs: 3000,
        onTick: (status, attempt) =>
          console.log(`  ⏳ attempt ${attempt} | ${status.status}`),
      }
    );

    console.log(`\n🎖️  Badge minted successfully!`);
    console.log(`   Donor : ${donorAddress}`);
    console.log(`   Cause : ${cause}`);
    console.log(`   Tx    : https://sepolia.basescan.org/tx/${userTxHash}\n`);

  } catch (err) {
    console.error("❌ Minting failed:", err.message || err);
    // agent continues running — next donation will retry
  }
}

// ── Start ─────────────────────────────────────────────────────────────
startAgent().catch(console.error);
