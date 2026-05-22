import { useState } from "react";
import { ethers } from "ethers";
import { executeGaslessly } from "../ugf";

// ABI = the "menu" of functions this contract has
// We only need the donate() function
const DONATION_VAULT_ABI = [
  "function donate(string cause) external",
  "event DonationReceived(address indexed donor, string cause, uint256 timestamp)",
];

const CAUSES = [
  { id: "trees", label: "🌳 Plant Trees", description: "Reforest degraded land" },
  { id: "water", label: "💧 Clean Water", description: "Fund water purification" },
  { id: "education", label: "📚 Education", description: "Support underprivileged kids" },
  { id: "food", label: "🍱 Food Relief", description: "Fight hunger globally" },
];

export default function DonationForm({ signer, onDonated }) {
  const [selectedCause, setSelectedCause] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function handleDonate() {
    if (!selectedCause) return;
    setStatus("loading");
    setError(null);

    try {
      // encode the donate("trees") function call into hex data
      const iface = new ethers.Interface(DONATION_VAULT_ABI);
      const encodedData = iface.encodeFunctionData("donate", [selectedCause]);

      // call UGF — this handles auth, quote, settle, execute
      // user never touches ETH!
     const signerAddress = signer.address;
const hash = await executeGaslessly(
  signer,
  import.meta.env.VITE_DONATION_VAULT_ADDRESS,
  encodedData,
  signerAddress
);

      setTxHash(hash);
      setStatus("success");
      onDonated(selectedCause); // tell parent: donation done, show badge coming soon
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="success-box">
        <h2>🎉 Donation Successful!</h2>
        <p>Your donation to <strong>{selectedCause}</strong> is on-chain.</p>
        <p className="small">Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank">{txHash?.slice(0, 20)}...</a></p>
        <p className="badge-hint">🤖 Agent detected your donation. Minting your badge...</p>
      </div>
    );
  }

  return (
    <div className="donation-form">
      <h2>Choose a Cause</h2>
      <p className="subtitle">No ETH needed — UGF handles gas for you</p>

      <div className="causes-grid">
        {CAUSES.map((cause) => (
          <div
            key={cause.id}
            className={`cause-card ${selectedCause === cause.id ? "selected" : ""}`}
            onClick={() => setSelectedCause(cause.id)}
          >
            <div className="cause-label">{cause.label}</div>
            <div className="cause-desc">{cause.description}</div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary donate-btn"
        onClick={handleDonate}
        disabled={!selectedCause || status === "loading"}
      >
        {status === "loading" ? (
          <span>Processing via UGF... <span className="spinner" /></span>
        ) : (
          "Donate (No ETH Required)"
        )}
      </button>

      {status === "loading" && (
        <div className="steps-display">
          <p>🔐 Authenticating → 💬 Getting quote → ✍️ Signing → 🚀 Executing</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
