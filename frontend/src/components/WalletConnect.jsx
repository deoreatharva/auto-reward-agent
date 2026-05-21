import { useState } from "react";
import { ethers } from "ethers";

// Lets user connect their MetaMask wallet
// Returns the signer (wallet) and address up to the parent component
export default function WalletConnect({ onConnected, variant = "default" }) {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
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
      const addr = await signer.getAddress();

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

  let btnClasses = "";
  if (variant === "hero-ghost") {
    btnClasses = "w-full sm:w-auto bg-white/5 border border-white/10 text-on-surface font-bold py-4 px-12 md:py-5 md:px-14 text-lg md:text-xl rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (variant === "nav") {
    btnClasses = "bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold py-2 px-6 rounded-xl hover:shadow-[0_0_30px_rgba(202,190,255,0.4)] transition-all duration-500 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  } else {
    // default (e.g. earlier usages if any)
    btnClasses = "w-full sm:w-auto bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold py-6 px-16 text-xl rounded-2xl hover:shadow-[0_0_50px_rgba(202,190,255,0.5)] transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed";
  }

  return (
    <div className="wallet-connect">
      {address ? (
        <div className="connected">
          <span className="dot green" />
          <span>{shortAddr(address)}</span>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={loading}
          id="connect-wallet-btn"
          className={btnClasses}
        >
          {loading ? (
            <span>Connecting... <span className="spinner" /></span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      )}
      {error && <p className="text-error text-sm mt-2 font-label-sm">{error}</p>}
    </div>
  );
}
