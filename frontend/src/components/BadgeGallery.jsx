import { useState, useEffect } from "react";
import { ethers } from "ethers";

const BADGE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function badgeCause(uint256 tokenId) view returns (string)",
  "event BadgeMinted(address indexed to, uint256 tokenId, string cause)",
];

const CAUSE_EMOJIS = {
  trees: "🌳",
  water: "💧",
  education: "📚",
  food: "🍱",
};

export default function BadgeGallery({ signer, userAddress, newDonationMade }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userAddress) fetchBadges();
  }, [userAddress, newDonationMade]);

  useEffect(() => {
    if (!userAddress) return;
    const provider = new ethers.WebSocketProvider("https://base-sepolia.g.alchemy.com/v2/ypGpKXbHaD2XqQtVnCWCx");
    const contract = new ethers.Contract(
      import.meta.env.VITE_BADGE_ADDRESS,
      BADGE_ABI,
      provider
    );
    const filter = contract.filters.BadgeMinted(userAddress);
    contract.on(filter, () => {
      console.log("🎖️ Badge minted! Refreshing...");
      setTimeout(fetchBadges, 2000);
    });
    return () => contract.removeAllListeners();
  }, [userAddress]);

  async function fetchBadges() {
    if (!userAddress) return;
    setLoading(true);
    try {
      // Use JsonRpcProvider instead of BrowserProvider to avoid ENS error
      const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/ypGpKXbHaD2XqQtVnCWCx");
      const contract = new ethers.Contract(
        import.meta.env.VITE_BADGE_ADDRESS,
        BADGE_ABI,
        provider
      );

      const balance = await contract.balanceOf(userAddress);
      const count = Number(balance);
      const badgeList = [];
      for (let i = 0; i < count; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
        const cause = await contract.badgeCause(tokenId);
        badgeList.push({ tokenId: tokenId.toString(), cause });
      }
      setBadges(badgeList);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="badge-gallery">
      <h2>Your Badges</h2>
      <p className="subtitle">Auto-minted by agent when you donate</p>
      {loading && <p className="loading">Checking your badges...</p>}
      {!loading && badges.length === 0 && (
        <div className="empty-state">
          <p>No badges yet. Make a donation to earn your first one! 🎖️</p>
        </div>
      )}
      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.tokenId} className="badge-card">
            <div className="badge-emoji">
              {CAUSE_EMOJIS[badge.cause] || "🏅"}
            </div>
            <div className="badge-info">
              <div className="badge-cause">{badge.cause}</div>
              <div className="badge-id">Badge #{badge.tokenId}</div>
            </div>
          </div>
        ))}
      </div>
      {badges.length > 0 && (
        <button className="btn-secondary" onClick={fetchBadges}>
          Refresh
        </button>
      )}
    </div>
  );
}