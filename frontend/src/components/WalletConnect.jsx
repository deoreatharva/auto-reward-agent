import { useState } from "react";
import { ethers } from "ethers";

// Lets user connect their MetaMask wallet
// Returns the signer (wallet) and address up to the parent component
export default function WalletConnect({ onConnected, buttonClassName }) {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function connect() {
    setLoading(true);
    setError(null);

    try {
      // check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask not found. Please install it.");
      }

      // ask MetaMask to connect
      
      
      
      const provider = new ethers.BrowserProvider(window.ethereum, {
  chainId: 84532,
  name: "base-sepolia",
  ensAddress: null
});
      await provider.send("eth_requestAccounts", []);

      // switch to Base Sepolia if not already on it
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x14a34" }], // 84532 in hex = Base Sepolia
        });
      } catch (switchError) {
        // if chain doesn't exist in MetaMask, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x14a34",
              chainName: "Base Sepolia",
              rpcUrls: ["https://sepolia.base.org"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            }],
          });
        }
      }

      // get the signer (the actual wallet object we use for signing)
      const signer = await provider.getSigner();
      const addr = signer.address;

      setAddress(addr);
      onConnected(signer, addr); // pass signer up to parent App
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // shorten address for display: 0x1234...5678
  function shortAddr(addr) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  return (
    <div className="wallet-connect">
      {address ? (
        <div className="connected">
          <span className="dot green" />
          <span>Connected: {shortAddr(address)}</span>
        </div>
      ) : (
        <button onClick={connect} disabled={loading} className={buttonClassName || "btn-primary"}>
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
