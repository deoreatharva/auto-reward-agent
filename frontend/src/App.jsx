import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import WalletConnect from "./components/WalletConnect";
import DonationForm from "./components/DonationForm";
import BadgeGallery from "./components/BadgeGallery";
import "./App.css";

export default function App() {
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [donationCount, setDonationCount] = useState(0);
  const canvasRef = useRef(null);

  function handleConnected(signer, address) {
    setSigner(signer);
    setUserAddress(address);
  }

  function handleDonated() {
    setDonationCount((prev) => prev + 1);
  }

  // Three.js Globe — exact match from Stitch
  useEffect(() => {
    let animId;
    const init = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const primaryGreen = 0x39FF14;
        const darkSurface = 0x0d0e17;

        // Base Globe
        const geo = new THREE.SphereGeometry(42, 64, 64);
        const mat = new THREE.MeshBasicMaterial({ color: darkSurface, transparent: true, opacity: 0.95 });
        const globe = new THREE.Mesh(geo, mat);
        scene.add(globe);

        // Wireframe Grid
        const wfGeo = new THREE.SphereGeometry(42.2, 48, 48);
        const wfMat = new THREE.MeshBasicMaterial({ color: primaryGreen, wireframe: true, transparent: true, opacity: 0.25 });
        globe.add(new THREE.Mesh(wfGeo, wfMat));

        // Network Layer
        const pCount = 180;
        const pos = new Float32Array(pCount * 3);
        const pGeo = new THREE.BufferGeometry();
        const nR = 48;
        for (let i = 0; i < pCount; i++) {
          const phi = Math.acos(-1 + (2 * i) / pCount);
          const theta = Math.sqrt(pCount * Math.PI) * phi;
          pos[i * 3] = nR * Math.cos(theta) * Math.sin(phi);
          pos[i * 3 + 1] = nR * Math.sin(theta) * Math.sin(phi);
          pos[i * 3 + 2] = nR * Math.cos(phi);
        }
        pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const pMat = new THREE.PointsMaterial({ color: primaryGreen, size: 1.2, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
        const particles = new THREE.Points(pGeo, pMat);

        const lMat = new THREE.LineBasicMaterial({ color: primaryGreen, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
        const lGeo = new THREE.BufferGeometry();
        const lPos = [];
        for (let i = 0; i < pCount; i++) {
          for (let j = i + 1; j < pCount; j++) {
            const d = Math.sqrt(
              Math.pow(pos[i*3]-pos[j*3],2) + Math.pow(pos[i*3+1]-pos[j*3+1],2) + Math.pow(pos[i*3+2]-pos[j*3+2],2)
            );
            if (d < 18) {
              lPos.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
              lPos.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
            }
          }
        }
        lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lPos), 3));
        const lines = new THREE.LineSegments(lGeo, lMat);

        const netGroup = new THREE.Group();
        netGroup.add(particles);
        netGroup.add(lines);
        scene.add(netGroup);

        const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
        window.addEventListener("resize", onResize);

        let mX = 0, mY = 0;
        const onMM = (e) => { mX = (e.clientX / window.innerWidth) - 0.5; mY = (e.clientY / window.innerHeight) - 0.5; };
        window.addEventListener("mousemove", onMM);

        function animate() {
          animId = requestAnimationFrame(animate);
          globe.rotation.y += 0.0004;
          netGroup.rotation.y += 0.0006;
          netGroup.rotation.x += 0.0002;
          scene.rotation.y += (mX * 0.1 - scene.rotation.y) * 0.03;
          scene.rotation.x += (mY * 0.1 - scene.rotation.x) * 0.03;
          renderer.render(scene, camera);
        }
        animate();

        return () => { window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMM); cancelAnimationFrame(animId); renderer.dispose(); };
      } catch (e) { console.warn("Globe init failed:", e); }
    };
    init();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, []);

  // Ambient glow parallax — exact from Stitch
  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      const g1 = document.getElementById("glow-1");
      const g2 = document.getElementById("glow-2");
      const g3 = document.getElementById("glow-3");
      if (g1) g1.style.transform = `translate(${x * 60}px, ${y * 60}px)`;
      if (g2) g2.style.transform = `translate(${x * -80}px, ${y * -80}px)`;
      if (g3) g3.style.transform = `translate(${-50 + (x * 40)}%, ${-50 + (y * 40)}%)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Header scroll — exact from Stitch
  useEffect(() => {
    const handler = () => {
      const h = document.querySelector("header");
      if (!h) return;
      if (window.scrollY > 20) {
        h.classList.add("!py-3", "!bg-surface/80", "!border-white/10");
        h.classList.remove("py-5", "bg-surface/10", "border-white/5");
      } else {
        h.classList.add("py-5", "bg-surface/10", "border-white/5");
        h.classList.remove("!py-3", "!bg-surface/80", "!border-white/10");
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* 3D Background Globe */}
      <canvas ref={canvasRef} id="globe-canvas" />

      {/* Ambient Background Decorations */}
      <div className="ambient-glow bg-primary -top-48 -left-48" id="glow-1" />
      <div className="ambient-glow bg-tertiary -bottom-48 -right-48" id="glow-2" />
      <div className="ambient-glow bg-secondary top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" id="glow-3" />

      {/* TopNavBar Component */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface/10 backdrop-blur-xl transition-all duration-500">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-5 md:py-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl font-bold">bolt</span>
            <span className="font-bold tracking-tight text-on-surface font-headline-lg text-2xl md:text-3xl">AutoReward</span>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300 text-base font-medium" href="#">Ecosystem</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300 text-base font-medium" href="#">How it Works</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300 text-base font-medium" href="#">UGF Docs</a>
          </nav>
          <WalletConnect onConnected={handleConnected} variant="nav" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-margin-mobile md:px-margin-desktop relative">
        {!signer ? (
          <>
            {/* Hero Section Container — exact Stitch classes */}
            <div className="w-full glass-card rounded-[48px] md:rounded-[64px] text-center shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-12 duration-1000 z-10 max-w-7xl p-16 md:p-24 lg:px-24 max-w-[1200px] max-w-screen-2xl lg:py-64">
              {/* Badge / Status */}
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary md:mb-10 mb-12">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
                  Donate on-chain. Get a badge. Zero ETH needed.
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display-lg text-4xl md:text-6xl lg:text-[80px] lg:leading-[88px] mb-6 md:mb-10 tracking-tight">
                Web3 Giving, <span className="text-primary italic font-medium">Without the Gas Pain</span>
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-lg text-on-surface-variant md:mb-12 mx-auto leading-relaxed opacity-90 md:text-2xl max-w-3xl mb-14">
                Connect your wallet and donate to a cause. Our agent automatically mints you an NFT badge — all without needing ETH for gas.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row gap-5 md:gap-6 justify-center items-center mb-12 md:mb-16">
                <button
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold py-4 px-12 md:py-5 md:px-14 text-lg md:text-xl rounded-2xl hover:shadow-[0_0_60px_rgba(202,190,255,0.4)] transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95"
                  onClick={() => {
                    const btn = document.getElementById("connect-wallet-btn");
                    if (btn) btn.click();
                  }}
                >
                  Start Giving Now
                </button>
                <WalletConnect onConnected={handleConnected} variant="hero-ghost" />
              </div>

              {/* Tagline */}
              <div className="pt-8 border-t border-white/5">
                <p className="font-label-sm text-[10px] md:text-[11px] text-on-surface-variant opacity-50 tracking-[0.25em] uppercase mb-8">
                  Powered by UGF — Universal Gas Framework &amp; Syntax Squad
                </p>
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">hub</span>
                    <span className="font-bold text-lg md:text-xl tracking-tight">BASE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">security</span>
                    <span className="font-bold text-lg md:text-xl tracking-tight">SAFE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">token</span>
                    <span className="font-bold text-lg md:text-xl tracking-tight">UGF Core</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-[15%] left-4 lg:left-8 opacity-40 pointer-events-none animate-float hidden xl:block">
              <img alt="NFT Badge" className="w-48 h-48 rounded-[24%] rotate-12 blur-[1px] shadow-2xl" src="/images/nft-badge.png" />
            </div>
            <div className="absolute bottom-[20%] right-4 lg:right-8 opacity-40 pointer-events-none animate-float hidden xl:block" style={{ animationDelay: "-3s" }}>
              <img alt="Floating Gradient" className="w-64 h-64 rounded-full blur-2xl opacity-90" src="/images/floating-gradient.png" />
            </div>
          </>
        ) : (
          /* Dashboard — logged in state */
          <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
            <div className="glass-card rounded-[32px] p-8 md:p-10">
              <DonationForm signer={signer} onDonated={handleDonated} />
            </div>
            <div className="glass-card rounded-[32px] p-8 md:p-10">
              <BadgeGallery signer={signer} userAddress={userAddress} newDonationMade={donationCount} />
            </div>
          </div>
        )}
      </main>

      {/* Footer — exact from Stitch */}
      <footer className="w-full mt-12 bg-transparent relative z-10">
        <div className="backdrop-blur-md bg-surface/40 border-t border-white/10 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl font-bold">bolt</span>
                <span className="font-headline-lg text-2xl font-bold text-on-surface">AutoReward</span>
              </div>
              <p className="font-body-md text-on-surface-variant max-w-sm opacity-70">
                The Universal Gas Framework (UGF) enables friction-less decentralized giving and secure on-chain identity for everyone.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-6">
              <nav className="flex flex-wrap gap-8">
                <a className="font-label-sm text-xs text-on-surface-variant hover:text-primary transition-all duration-300 tracking-wider" href="#">Network Status</a>
                <a className="font-label-sm text-xs text-on-surface-variant hover:text-primary transition-all duration-300 tracking-wider" href="#">Terms of Service</a>
                <a className="font-label-sm text-xs text-on-surface-variant hover:text-primary transition-all duration-300 tracking-wider" href="#">Privacy Policy</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="py-6 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex justify-start md:justify-end border-t border-white/5">
          <p className="font-label-sm text-[10px] md:text-xs text-secondary/60 tracking-widest uppercase">
            © 2026 AutoReward. Built with <span className="text-primary">♥</span> by UGF Core.
          </p>
        </div>
      </footer>
    </>
  );
}
