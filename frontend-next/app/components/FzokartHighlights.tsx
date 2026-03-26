"use client";

import React, { useEffect, useRef, useState } from "react";

/* ── Data — 5 layers matching the WebGL horizon scenes ─────────────────── */
const highlights = [
  {
    id: "sunrise",
    phase: "Layer 1 — Sunrise",
    icon: "🌅",
    heading: "A New Dawn of Smart Shopping",
    body: "Jaise suraj ki pehli roshni ek naye din ki shuruaat karti hai, waise hi Fzokart aapke shopping experience ko fresh aur reliable banata hai. Har product carefully selected, har deal transparent, aur har transaction secure — taaki aapka trust har subah ke sunrise ki tarah strong aur clear rahe.",
    gradFrom: "#ff9a3c",
    gradTo: "#ffcc70",
    bgGrad: "linear-gradient(135deg, #1a0a00 0%, #3d1500 45%, #7c3300 100%)",
    glow: "rgba(255,154,60,0.35)",
    accentColor: "#ffcc70",
    tag: "Beginning / Trust",
    stats: [
      { num: "100%", label: "Transparent" },
      { num: "✓", label: "Secure" },
      { num: "∞", label: "Trust" },
    ],
  },
  {
    id: "midday",
    phase: "Layer 2 — Midday",
    icon: "☀️",
    heading: "At the Peak of Performance",
    body: "Jaise dopahar ka suraj apni poori taqat aur clarity ke saath chamakta hai, waise hi Fzokart aapko peak performance deta hai — lightning-fast browsing, seamless checkout aur real-time order tracking ke saath. Har feature optimize kiya gaya hai taaki aapka shopping experience smooth, powerful aur interruption-free rahe.",
    gradFrom: "#ffe066",
    gradTo: "#fff5aa",
    bgGrad: "linear-gradient(135deg, #0c0b00 0%, #1f1b00 45%, #3a3200 100%)",
    glow: "rgba(255,224,102,0.40)",
    accentColor: "#ffe066",
    tag: "Peak Performance / Power",
    stats: [
      { num: "⚡", label: "Lightning Fast" },
      { num: "99%", label: "Uptime" },
      { num: "0s", label: "Lag" },
    ],
  },
  {
    id: "sunset",
    phase: "Layer 3 — Sunset",
    icon: "🌇",
    heading: "From Daylight Deals to Lasting Satisfaction",
    body: "Din bhar ki roshni ke saath aapko milta hai smooth browsing, fast delivery aur best prices ka perfect balance. Jaise suraj dhalne tak din apni kahani poori karta hai, waise hi Fzokart aapko ek complete shopping journey deta hai — jahan convenience, speed aur value ek saath milte hain.",
    gradFrom: "#e8500a",
    gradTo: "#f9a442",
    bgGrad: "linear-gradient(135deg, #0e0200 0%, #2a0900 45%, #5c1c00 100%)",
    glow: "rgba(232,80,10,0.38)",
    accentColor: "#f9a442",
    tag: "Experience / Satisfaction",
    stats: [
      { num: "5x", label: "Faster" },
      { num: "360°", label: "Value" },
      { num: "★★★★★", label: "Quality" },
    ],
  },
  {
    id: "night",
    phase: "Layer 4 — Night Sea",
    icon: "🌊",
    heading: "Calm Nights, Secure Choices",
    body: "Jab andhera shaant samundar me doob jata hai, tab sirf sukoon aur bharosa bachta hai. Fzokart bhi aapko wahi peace of mind deta hai — secure payments, trusted sellers aur reliable support ke saath. Aap relax kar sakte ho, kyunki aapka har order safe hands me hai.",
    gradFrom: "#4fc3f7",
    gradTo: "#81d4fa",
    bgGrad: "linear-gradient(135deg, #00040e 0%, #001a38 45%, #003060 100%)",
    glow: "rgba(79,195,247,0.30)",
    accentColor: "#81d4fa",
    tag: "Peace / Security",
    stats: [
      { num: "🔒", label: "Secure Pay" },
      { num: "24/7", label: "Support" },
      { num: "✓", label: "Trusted" },
    ],
  },
  {
    id: "storm",
    phase: "Layer 5 — Storm",
    icon: "⛈️",
    heading: "Strong Even Through Every Storm",
    body: "Jab mushkilein aati hain, tab asli trust test hota hai. Chahe high traffic ho, urgent orders ho ya unexpected issues — Fzokart har situation me strong khada rehta hai. Secure systems, reliable delivery network aur responsive support ke saath, hum ensure karte hain ki aapka shopping experience kabhi ruk na jaye.",
    gradFrom: "#7c9dff",
    gradTo: "#c4b5fd",
    bgGrad: "linear-gradient(135deg, #04040e 0%, #0a0c22 45%, #141040 100%)",
    glow: "rgba(124,157,255,0.35)",
    accentColor: "#c4b5fd",
    tag: "Challenge / Reliability",
    stats: [
      { num: "⚡", label: "Resilient" },
      { num: "100%", label: "Reliable" },
      { num: "∞", label: "Strength" },
    ],
  },
];

/* ── Single Card ────────────────────────────────────────────────────────── */
interface CardProps {
  data: (typeof highlights)[0];
  index: number;
}

const HighlightCard: React.FC<CardProps> = ({ data, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delay = index * 110;

  return (
    <div
      ref={ref}
      className="fzh-card"
      style={
        {
          "--glow": data.glow,
          "--accent": data.accentColor,
          "--from": data.gradFrom,
          "--to": data.gradTo,
          background: data.bgGrad,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
          transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        } as React.CSSProperties
      }
    >
      <div className="fzh-shimmer" />
      <div className="fzh-orb" />
      <span className="fzh-tag">{data.phase}</span>
      <div className="fzh-icon">{data.icon}</div>
      <div
        className="fzh-line"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transition: `opacity 0.5s ease ${delay + 200}ms, transform 0.5s ease ${delay + 200}ms`,
        }}
      />
      <h3
        className="fzh-heading"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          transition: `opacity 0.55s ease ${delay + 120}ms, transform 0.55s ease ${delay + 120}ms`,
        }}
      >
        {data.heading}
      </h3>
      <p
        className="fzh-body"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: `opacity 0.55s ease ${delay + 220}ms, transform 0.55s ease ${delay + 220}ms`,
        }}
      >
        {data.body}
      </p>
      <div
        className="fzh-stats"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: `opacity 0.5s ease ${delay + 320}ms, transform 0.5s ease ${delay + 320}ms`,
        }}
      >
        {data.stats.map((s) => (
          <div key={s.label} className="fzh-stat">
            <span className="fzh-stat-num">{s.num}</span>
            <span className="fzh-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Premium Hero Header ────────────────────────────────────────────────── */
const FzhHero: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    // Small delay so the CSS animation actually plays on mount
    const timer = setTimeout(() => setVis(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className="fzh-hero"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* tiny eyebrow */}
      <span className="fzh-hero-eyebrow">Fzokart Highlights</span>

      {/* main heading */}
      <h1 className="fzh-hero-h1">
        From{" "}
        <span className="fzh-grad-sunrise">Bright Beginnings</span>
        {" "}to{" "}
        <span className="fzh-grad-night">Trusted Endings</span>
        <br />
        <span className="fzh-promise">— The Fzokart Promise</span>
      </h1>

      {/* tagline */}
      <p
        className="fzh-hero-tagline"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.8s ease 0.28s, transform 0.8s ease 0.28s",
        }}
      >
        Seamless shopping, secure transactions, and trust at every step.
      </p>

      {/* decorative animated divider */}
      <div
        className="fzh-hero-rule"
        style={{
          transform: vis ? "scaleX(1)" : "scaleX(0)",
          opacity: vis ? 1 : 0,
          transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.18s, opacity 0.6s ease 0.18s",
        }}
      />
    </div>
  );
};

/* ── Main Section ───────────────────────────────────────────────────────── */
export const FzokartHighlights: React.FC = () => {
  const topRow = highlights.slice(0, 2);
  const bottomRow = highlights.slice(2);

  return (
    <>
      <style>{`
        /* ────────────────────────────────────────────────
           HERO
        ──────────────────────────────────────────────── */
        .fzh-section {
          /* Day-cycle background: sunrise left → midday top → sunset right → night base */
          background:
            radial-gradient(ellipse 70% 55% at 15% 0%,   rgba(255,140,30,0.18)  0%, transparent 65%),
            radial-gradient(ellipse 50% 45% at 85% 5%,   rgba(255,220,80,0.12)  0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 50%,  rgba(232,80,10,0.10)   0%, transparent 65%),
            radial-gradient(ellipse 70% 55% at 10% 100%, rgba(30,80,180,0.14)   0%, transparent 65%),
            #04050f;
          padding: 5rem 1.5rem 5.5rem;
          overflow: hidden;
          position: relative;
          /* subtle slow gradient drift */
          animation: fzh-bg-drift 20s ease-in-out infinite alternate;
        }
        @keyframes fzh-bg-drift {
          0%   { background-position: 0% 0%; }
          100% { background-position: 4px 6px; }
        }

        .fzh-section::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.008) 2px,
            rgba(255,255,255,0.008) 4px
          );
          pointer-events: none;
        }

        .fzh-inner {
          max-width: 75rem;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Hero block */
        .fzh-hero {
          text-align: center;
          max-width: 56rem;
          margin: 0 auto 5rem;
          padding: 5rem 1rem 2.5rem;
        }

        .fzh-hero-eyebrow {
          display: inline-block;
          font-size: 0.62rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f28c28;
          font-family: "DM Mono", "Courier New", monospace;
          margin-bottom: 1.4rem;
          opacity: 0.85;
          border: 1px solid rgba(242,140,40,0.25);
          padding: 0.28rem 0.85rem;
          border-radius: 100px;
          background: rgba(242,140,40,0.06);
        }

        .fzh-hero-h1 {
          font-size: clamp(1.75rem, 4.2vw, 3.5rem);
          font-weight: 800;
          line-height: 1.28;
          letter-spacing: 0.3px;
          color: #f0ece3;
          margin: 0 0 1.75rem;
          font-family: "Inter", "Poppins", system-ui, sans-serif;
        }

        /* "Bright Beginnings" — sunrise warm gradient */
        .fzh-grad-sunrise {
          background: linear-gradient(90deg, #ff9a3c 0%, #ffcc70 55%, #ffe898 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        .fzh-grad-sunrise::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -3px;
          height: 2px;
          background: linear-gradient(90deg, #ff9a3c, #ffcc70);
          border-radius: 2px;
          opacity: 0.5;
        }

        /* "Trusted Endings" — night-sea cool gradient */
        .fzh-grad-night {
          background: linear-gradient(90deg, #4fc3f7 0%, #81d4fa 45%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        .fzh-grad-night::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -3px;
          height: 2px;
          background: linear-gradient(90deg, #4fc3f7, #81d4fa);
          border-radius: 2px;
          opacity: 0.4;
        }

        /* "The Fzokart Promise" line */
        .fzh-promise {
          display: block;
          font-size: 0.62em;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: rgba(200,196,188,0.65);
          margin-top: 0.5rem;
          font-style: italic;
        }

        .fzh-hero-tagline {
          font-size: clamp(0.85rem, 1.8vw, 1.05rem);
          color: rgba(180,176,168,0.72);
          line-height: 1.75;
          max-width: 38rem;
          margin: 0 auto 2rem;
          font-family: "Inter", system-ui, sans-serif;
          letter-spacing: 0.2px;
        }

        /* Animated center divider */
        .fzh-hero-rule {
          width: 14rem;
          height: 1.5px;
          margin: 0 auto;
          transform-origin: center;
          border-radius: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #ff9a3c 20%,
            #ffe066 40%,
            #f9a442 58%,
            #4fc3f7 78%,
            #c4b5fd 92%,
            transparent 100%
          );
          opacity: 0.7;
        }

        /* ────────────────────────────────────────────────
           CARDS
        ──────────────────────────────────────────────── */
        .fzh-row-top {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          max-width: 50rem;
          margin: 0 auto 1.5rem;
        }
        .fzh-row-bottom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .fzh-hero { padding: 3rem 1rem 1.5rem; }
          .fzh-row-top  { grid-template-columns: 1fr; max-width: 100%; }
          .fzh-row-bottom { grid-template-columns: 1fr; }
        }

        .fzh-card {
          position: relative;
          border-radius: 20px;
          padding: 2.25rem 2rem;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 20px 60px rgba(0,0,0,0.5),
            0 0 40px var(--glow);
          cursor: default;
          will-change: transform, opacity;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .fzh-card:hover {
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08) inset,
            0 28px 80px rgba(0,0,0,0.55),
            0 0 60px var(--glow);
          transform: translateY(-4px) !important;
        }
        .fzh-shimmer {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 4px,
            rgba(255,255,255,0.012) 4px,
            rgba(255,255,255,0.012) 8px
          );
          animation: fzh-shimmer-move 12s linear infinite;
          pointer-events: none;
        }
        @keyframes fzh-shimmer-move {
          from { background-position: 0 0; }
          to   { background-position: 300px 300px; }
        }
        .fzh-orb {
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
          filter: blur(20px);
          pointer-events: none;
          animation: fzh-pulse 6s ease-in-out infinite alternate;
        }
        @keyframes fzh-pulse {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.18); }
        }
        .fzh-tag {
          display: inline-block;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
          font-family: "DM Mono", "Courier New", monospace;
          margin-bottom: 1rem;
          opacity: 0.8;
          position: relative; z-index: 1;
        }
        .fzh-icon {
          font-size: 2.4rem; line-height: 1;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px var(--glow));
          position: relative; z-index: 1;
          animation: fzh-float 5s ease-in-out infinite alternate;
        }
        @keyframes fzh-float {
          from { transform: translateY(0); }
          to   { transform: translateY(-5px); }
        }
        .fzh-line {
          width: 2.8rem; height: 2px;
          background: linear-gradient(90deg, var(--from), var(--to));
          border-radius: 2px;
          margin-bottom: 1.1rem;
          transform-origin: left;
          position: relative; z-index: 1;
        }
        .fzh-heading {
          font-size: clamp(1.05rem, 2.2vw, 1.4rem);
          font-weight: 800; line-height: 1.3;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 40%, var(--to));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative; z-index: 1;
        }
        .fzh-body {
          font-size: 0.8rem; line-height: 1.85;
          color: rgba(220,218,210,0.68);
          margin-bottom: 1.75rem;
          position: relative; z-index: 1;
        }
        .fzh-stats {
          display: flex; gap: 1.5rem; flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 1.25rem;
          position: relative; z-index: 1;
        }
        .fzh-stat { display: flex; flex-direction: column; gap: 0.2rem; }
        .fzh-stat-num {
          font-size: 1.3rem; font-weight: 800;
          color: var(--accent); line-height: 1;
          font-family: "Bebas Neue", "Arial Black", sans-serif;
          letter-spacing: 0.03em;
        }
        .fzh-stat-label {
          font-size: 0.52rem; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(180,178,170,0.55);
          font-family: "DM Mono","Courier New", monospace;
        }
        .fzh-credit {
          text-align: center; margin-top: 3.5rem;
          font-size: 0.6rem; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(120,118,110,0.6);
          font-family: "DM Mono","Courier New", monospace;
        }
      `}</style>

      <section className="fzh-section" aria-label="Fzokart Highlights">
        <div className="fzh-inner">

          {/* ── Premium Hero Header ── */}
          <FzhHero />

          {/* ── Row 1 — Sunrise + Midday ── */}
          <div className="fzh-row-top">
            {topRow.map((item, i) => (
              <HighlightCard key={item.id} data={item} index={i} />
            ))}
          </div>

          {/* ── Row 2 — Sunset + Night + Storm ── */}
          <div className="fzh-row-bottom">
            {bottomRow.map((item, i) => (
              <HighlightCard key={item.id} data={item} index={i + 2} />
            ))}
          </div>

          <p className="fzh-credit">
            © Fzokart · Smart Shopping · Every Day
          </p>
        </div>
      </section>
    </>
  );
};

export default FzokartHighlights;
