import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import DonationForm from "./components/DonationForm";
import BadgeGallery from "./components/BadgeGallery";
import Globe from "./components/Globe";
import "./App.css";

export default function App() {
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [donationCount, setDonationCount] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  function handleConnected(signer, address) {
    setSigner(signer);
    setUserAddress(address);
  }

  function handleDonated() {
    setDonationCount((prev) => prev + 1);
  }

  return (
    <div className="font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen relative">
      <nav className="fixed top-0 w-full z-50 bg-surface/60 dark:bg-surface/60 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
          <div className="text-headline-md font-headline-md font-bold tracking-tighter text-on-surface dark:text-on-surface flex items-center gap-2 flex-1">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>toll</span>
            AutoReward
          </div>
          <div className="hidden md:flex items-center gap-xl flex-1 justify-end">
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Donate</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">About</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">FAQ</a>
            {signer && (
              <WalletConnect onConnected={handleConnected} />
            )}
          </div>
        </div>
      </nav>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] aura-orange"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] aura-silver"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] aura-orange opacity-50"></div>
      </div>

      <main className="relative pt-32 pb-xl max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        {!signer ? (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center min-h-[600px]">
              <div className="space-y-md z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest">Powered UGF &amp; SYNTAX SQUAD</span>
                </div>
                <h1 className="font-display-lg text-display-lg md:text-[72px] leading-tight text-on-surface">
                  <span className="text-3d-metallic">Web3 Giving,</span> <br/><span className="text-3d-primary">Without</span> <span className="text-3d-metallic">the Gas Pain</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Connect your wallet and donate to a cause. Our agent automatically mints you an NFT badge — all without needing ETH for gas. Empowering decentralized philanthropy.
                </p>
                <div 
                  className="flex flex-wrap gap-md pt-base"
                  onMouseEnter={() => setIsInteracting(true)}
                  onMouseLeave={() => setIsInteracting(false)}
                >
                  <WalletConnect 
                    onConnected={handleConnected} 
                    buttonClassName="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-headline-md text-[16px] font-bold hover:opacity-80 transition-all duration-300 active:scale-95 primary-glow animate-glow-pulse hover-lift group"
                  />
                </div>
              </div>
              
              <div className="relative flex justify-center items-center h-full min-h-[500px]">
                <Globe isInteracting={isInteracting} />
              </div>
            </section>

            <section className="py-xl">
              <div className="flex items-end justify-between mb-lg">
                <div className="space-y-base">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Precision Protocols</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">Built on the Universal Gas Framework for seamless transactions.</p>
                </div>
                <div className="hidden md:flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  SCROLL DOWN
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="glass-surface p-lg rounded-xl transition-all duration-500 hover:border-primary/40 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-[32px]">verified_user</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Secure</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Every step in the fintech network is strongly secured by cryptographic primitives and economic guarantees.
                  </p>
                  <div className="mt-lg h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-primary to-primary-container"></div>
                  </div>
                </div>
                <div className="glass-surface p-lg rounded-xl transition-all duration-500 hover:border-primary/40 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-[32px]">bolt</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Fast</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Provides low latency for on-chain actions via our optimized relayer network. Global execution in milliseconds.
                  </p>
                  <div className="mt-lg h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-primary to-primary-container"></div>
                  </div>
                </div>
                <div className="glass-surface p-lg rounded-xl transition-all duration-500 hover:border-primary/40 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-[32px]">magic_button</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Gas-Free</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Our agent handles all gas fees for you via UGF, so you can focus on giving. No native tokens required.
                  </p>
                  <div className="mt-lg h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full w-[100%] bg-gradient-to-r from-primary to-primary-container"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-xl">
              <div className="glass-surface rounded-xl overflow-hidden relative p-lg md:p-xl flex flex-col md:flex-row items-center justify-between gap-lg">
                <div className="absolute top-0 right-0 w-1/3 h-full aura-orange -z-10"></div>
                <div className="space-y-md">
                  <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">The Future of <br/><span className="text-primary">Impact Management</span></h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Real-time transparency on every donation, tracked and verified on-chain with instant NFT rewards for all contributors.</p>
                </div>
                <div className="grid grid-cols-2 gap-lg w-full md:w-auto">
                  <div className="text-center md:text-left">
                    <div className="font-display-lg text-[48px] text-primary">1</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Donations Processed</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="font-display-lg text-[48px] text-tertiary">$0.00</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">User Gas Fees</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="dashboard pt-10">
            <div className="left-panel glass-surface rounded-xl p-lg">
              <DonationForm signer={signer} onDonated={handleDonated} />
            </div>
            <div className="right-panel glass-surface rounded-xl p-lg">
              <BadgeGallery
                signer={signer}
                userAddress={userAddress}
                newDonationMade={donationCount}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-lg mt-xl bg-surface-container-lowest border-t border-outline-variant/20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-2">
            <div className="text-headline-md font-headline-md font-bold text-on-surface mb-sm">AutoReward</div>
            <p className="text-body-md font-body-md text-on-surface-variant">© 2026 AutoReward. Empowering decentralized philanthropy.</p>
          </div>
          <div className="space-y-sm">
            <h4 className="font-headline-md text-[18px] text-on-surface">Resources</h4>
            <div className="flex flex-col gap-base">
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-tertiary transition-colors duration-200 hover:translate-x-1" href="#">Docs</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-tertiary transition-colors duration-200 hover:translate-x-1" href="#">Powered by UGF</a>
            </div>
          </div>
          <div className="space-y-sm">
            <h4 className="font-headline-md text-[18px] text-on-surface">Legal</h4>
            <div className="flex flex-col gap-base">
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-tertiary transition-colors duration-200 hover:translate-x-1" href="#">Privacy Policy</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-tertiary transition-colors duration-200 hover:translate-x-1" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
