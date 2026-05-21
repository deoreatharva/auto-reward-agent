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
      const hash = await executeGaslessly(
        signer,
        import.meta.env.VITE_DONATION_VAULT_ADDRESS,
        encodedData
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
      <div className="text-center space-y-4">
        <h2 className="font-headline-lg text-headline-md text-secondary-container font-bold">🎉 Donation Successful!</h2>
        <p className="text-on-surface">Your donation to <strong className="text-primary">{selectedCause}</strong> is on-chain.</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
          Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" className="text-primary hover:underline">{txHash?.slice(0, 20)}...</a>
        </p>
        <p className="text-primary text-lg mt-4">🤖 Agent detected your donation. Minting your badge...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-headline-lg text-headline-md font-bold mb-2">Choose a Cause</h2>
      <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 tracking-wider mb-6">No ETH needed — UGF handles gas for you</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {CAUSES.map((cause) => (
          <div
            key={cause.id}
            className={`cause-card ${selectedCause === cause.id ? "selected" : ""}`}
            onClick={() => setSelectedCause(cause.id)}
          >
            <div className="font-headline-md font-semibold text-base mb-1">{cause.label}</div>
            <div className="text-sm text-on-surface-variant opacity-70">{cause.description}</div>
          </div>
        ))}
      </div>

      <button
        className="w-full bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold py-4 px-8 text-lg rounded-2xl hover:shadow-[0_0_50px_rgba(202,190,255,0.5)] transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="text-center mt-4">
          <p className="text-on-surface-variant text-sm opacity-70">🔐 Authenticating → 💬 Getting quote → ✍️ Signing → 🚀 Executing</p>
        </div>
      )}

      {error && <p className="text-error text-sm mt-3 font-label-sm">{error}</p>}
    </div>
  );
}
