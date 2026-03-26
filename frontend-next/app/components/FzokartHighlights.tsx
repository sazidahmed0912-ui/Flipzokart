"use client";
import React, { useEffect, useRef, useState } from "react";
import { VS, FS } from "./fzhShaders";

/* ────────────────────────────────────────────────────────────────────────────
   Panel content  — headings & body text UNCHANGED
──────────────────────────────────────────────────────────────────────────── */
const PANELS = [
  {
    id: "hero",
    align: "center" as const,
    tag: "A journey through the horizon",
    icon: "",
    heading1: "FROM BRIGHT BEGINNINGS\nTO TRUSTED ENDINGS",
    heading2: "— THE FZOKART PROMISE",
    body: "Seamless shopping, secure transactions, and trust at every step.",
    cta: "Continue",
    ctaTarget: 1,
    stats: [] as { num: string; label: string }[],
  },
  {
    id: "sunrise",
    align: "left" as const,
    tag: "Layer 1 — Sunrise",
    icon: "🌅",
    heading1: "A NEW DAWN OF\nSMART SHOPPING",
    heading2: "",
    body: "Jaise suraj ki pehli roshni ek naye din ki shuruaat karti hai, waise hi Fzokart aapke shopping experience ko fresh aur reliable banata hai. Har product carefully selected, har deal transparent, aur har transaction secure — taaki aapka trust har subah ke sunrise ki tarah strong aur clear rahe.",
    cta: "",
    ctaTarget: 2,
    stats: [
      { num: "100%", label: "Transparent" },
      { num: "✓", label: "Secure" },
      { num: "∞", label: "Trust" },
    ],
  },
  {
    id: "midday",
    align: "right" as const,
    tag: "Layer 2 — Midday",
    icon: "☀️",
    heading1: "AT THE PEAK\nOF PERFORMANCE",
    heading2: "",
    body: "Jaise dopahar ka suraj apni poori taqat aur clarity ke saath chamakta hai, waise hi Fzokart aapko peak performance deta hai — lightning-fast browsing, seamless checkout aur real-time order tracking ke saath. Har feature optimize kiya gaya hai taaki aapka shopping experience smooth, powerful aur interruption-free rahe.",
    cta: "",
    ctaTarget: 3,
    stats: [
      { num: "⚡", label: "Lightning Fast" },
      { num: "99%", label: "Uptime" },
      { num: "0s", label: "Lag" },
    ],
  },
  {
    id: "sunset",
    align: "left" as const,
    tag: "Layer 3 — Sunset",
    icon: "🌇",
    heading1: "FROM DAYLIGHT DEALS\nTO LASTING SATISFACTION",
    heading2: "",
    body: "Din bhar ki roshni ke saath aapko milta hai smooth browsing, fast delivery aur best prices ka perfect balance. Jaise suraj dhalne tak din apni kahani poori karta hai, waise hi Fzokart aapko ek complete shopping journey deta hai — jahan convenience, speed aur value ek saath milte hain.",
    cta: "Continue",
    ctaTarget: 4,
    stats: [
      { num: "5x", label: "Faster" },
      { num: "360°", label: "Value" },
      { num: "★★★★★", label: "Quality" },
    ],
  },
  {
    id: "night",
    align: "center" as const,
    tag: "Layer 4 — Night Sea",
    icon: "🌊",
    heading1: "CALM NIGHTS,\nSECURE CHOICES",
    heading2: "",
    body: "Jab andhera shaant samundar me doob jata hai, tab sirf sukoon aur bharosa bachta hai. Fzokart bhi aapko wahi peace of mind deta hai — secure payments, trusted sellers aur reliable support ke saath. Aap relax kar sakte ho, kyunki aapka har order safe hands me hai.",
    cta: "",
    ctaTarget: 5,
    stats: [
      { num: "🔒", label: "Secure Pay" },
      { num: "24/7", label: "Support" },
      { num: "✓", label: "Trusted" },
    ],
  },
  {
    id: "storm",
    align: "right" as const,
    tag: "Layer 5 — Storm",
    icon: "⛈️",
    heading1: "STRONG EVEN THROUGH\nEVERY STORM",
    heading2: "",
    body: "Jab mushkilein aati hain, tab asli trust test hota hai. Chahe high traffic ho, urgent orders ho ya unexpected issues — Fzokart har situation me strong khada rehta hai. Secure systems, reliable delivery network aur responsive support ke saath, hum ensure karte hain ki aapka shopping experience kabhi ruk na jaye.",
    cta: "Begin again",
    ctaTarget: 0,
    stats: [
      { num: "⚡", label: "Resilient" },
      { num: "100%", label: "Reliable" },
      { num: "∞", label: "Strength" },
    ],
  },
];

const N_PANELS = PANELS.length; // 6
const N_WGL   = 5;             // WebGL scene count
const SCENE_NAMES = ["DAWN", "MIDDAY", "DUSK", "NIGHT", "STORM"];

/* ────────────────────────────────────────────────────────────────────────────
   WebGL helpers
──────────────────────────────────────────────────────────────────────────── */
function mkShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/* ────────────────────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────────────────────── */
export const FzokartHighlights: React.FC = () => {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef(0);

  const [hudPct,      setHudPct]      = useState(0);
  const [sceneName,   setSceneName]   = useState("DAWN");
  const [activeDot,   setActiveDot]   = useState(0);
  const [activePanel, setActivePanel] = useState(0);

  /* scroll to panel index (relative to section) */
  const scrollToPanel = (idx: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const secH    = sec.offsetHeight;
    const viewH   = window.innerHeight;
    const scrollable = secH - viewH;
    const target  = sec.offsetTop + (idx / (N_PANELS - 1)) * scrollable;
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  /* skip entire section */
  const skipSection = () => {
    const sec = sectionRef.current;
    if (!sec) return;
    const target = sec.offsetTop + sec.offsetHeight;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false,
      stencil: false, preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) { canvas.style.background = "#0a0a0f"; return; }

    const vert = mkShader(gl, gl.VERTEX_SHADER,  VS);
    const frag = mkShader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);      gl.disable(gl.DITHER);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const uR  = gl.getUniformLocation(prog, "uR");
    const uT  = gl.getUniformLocation(prog, "uT");
    const uS  = gl.getUniformLocation(prog, "uS");
    const uSc = gl.getUniformLocation(prog, "uSc");
    const uBl = gl.getUniformLocation(prog, "uBl");
    const uBg = gl.getUniformLocation(prog, "uBg");
    gl.uniform3f(uBg, 0.039, 0.039, 0.059);

    let qualityScale = 1.0;
    const MAX_DPR = 1.5, MIN_Q = 0.82, MAX_Q = 1.0;

    const resize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const pw  = Math.round(w * dpr * qualityScale);
      const ph  = Math.round(h * dpr * qualityScale);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw; canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
        gl.uniform2f(uR, pw, ph);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let smooth  = 0, lastNow = performance.now(), t0 = lastNow;
    let lastPct = -1, lastSi = -1, lastPanel = -1;
    let fpsA = 0, fpsF = 0, lowT = 0, highT = 0;

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      /* FPS-adaptive quality */
      fpsA += dt; fpsF++;
      if (fpsA >= 0.75) {
        const fps = fpsF / fpsA; fpsA = 0; fpsF = 0;
        if (fps < 50)      { lowT  += 0.75; highT = 0; }
        else if (fps > 57) { highT += 0.75; lowT  = 0; }
        else               { lowT = highT = 0; }
        if (lowT  >= 1.5 && qualityScale > MIN_Q) { qualityScale = Math.max(MIN_Q, +(qualityScale - 0.06).toFixed(2)); lowT  = 0; resize(); }
        if (highT >= 3.0 && qualityScale < MAX_Q) { qualityScale = Math.min(MAX_Q, +(qualityScale + 0.04).toFixed(2)); highT = 0; resize(); }
      }

      /* Scroll progress relative to section */
      const sec  = sectionRef.current;
      if (!sec) return;
      const secH = sec.offsetHeight;
      const viewH = window.innerHeight;
      const scrollable = Math.max(1, secH - viewH);
      const rawScroll  = Math.max(0, Math.min(scrollable, window.scrollY - sec.offsetTop));
      const tgt        = rawScroll / scrollable;
      smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));

      /* HUD */
      const pct = Math.round(smooth * 100);
      const raw = smooth * (N_WGL - 1);
      const flr = Math.floor(raw);
      const si  = Math.min(flr, N_WGL - 2);
      const bl  = flr >= N_WGL - 1 ? 1.0 : raw - flr;
      const panel = Math.min(N_PANELS - 1, Math.floor(smooth * N_PANELS));

      if (pct !== lastPct)     { lastPct = pct;   setHudPct(pct); }
      if (si  !== lastSi)      { lastSi  = si;    setSceneName(SCENE_NAMES[Math.min(si, 4)]); setActiveDot(Math.min(si, 4)); }
      if (panel !== lastPanel) { lastPanel = panel; setActivePanel(panel); }

      /* Draw */
      gl.uniform1f(uT,  (now - t0) / 1000);
      gl.uniform1f(uS,  smooth);
      gl.uniform1f(uSc, si);
      gl.uniform1f(uBl, bl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap");

        .fzh-outer {
          position: relative;
          height: ${N_PANELS * 100}vh;
        }
        .fzh-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }
        .fzh-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        /* HUD */
        .fzh-hud {
          position: absolute;
          top: 2rem; right: 2rem;
          z-index: 10;
          text-align: right;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: #6a6a7e;
          text-transform: uppercase;
          font-family: "DM Mono", monospace;
          pointer-events: none;
        }
        .fzh-hud-num { color: #e8e4d9; }
        .fzh-prog-bar {
          width: 7.5rem; height: 1px;
          background: #6a6a7e;
          margin: 0.5rem 0 0 auto;
          position: relative; overflow: hidden;
        }
        .fzh-prog-fill {
          position: absolute; inset-block: 0; left: 0;
          background: #c8ff47;
          transition: width 0.1s linear;
        }
        .fzh-scene-lbl { font-size: 0.6rem; color: #c8ff47; margin-top: 0.4rem; }

        /* Scene dots */
        .fzh-dots {
          position: absolute;
          left: 2.125rem; top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .fzh-dot {
          width: 0.25rem; height: 0.25rem;
          border-radius: 50%;
          background: #6a6a7e;
          border: none; cursor: pointer;
          transition: background 0.3s, scale 0.3s;
          padding: 0;
        }
        .fzh-dot.act { background: #c8ff47; scale: 1.8; }

        /* Bottom Controls (Meter + Skip) */
        .fzh-bottom-ctrls {
          position: absolute;
          bottom: 2rem; right: 2rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .fzh-bottom-ctrls.mobile-only {
          display: none;
        }
        .fzh-layer-meter {
          font-family: "DM Mono", monospace;
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: #e8e4d9;
          text-transform: uppercase;
        }
        .fzh-skip-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(10,10,15,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(232,228,217,0.7);
          padding: 0.4rem 0.8rem;
          border-radius: 40px;
          font-family: "DM Mono", monospace;
          font-size: 0.6rem; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .fzh-skip-btn:hover {
          color: #fff; border-color: rgba(255,255,255,0.4);
          background: rgba(10,10,15,0.6);
        }
        .fzh-skip-btn svg { width: 0.6rem; height: 0.6rem; }

        /* Credit */
        .fzh-credit {
          position: absolute;
          right: 2rem; top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          transform-origin: right center;
          z-index: 10;
          font-family: "DM Mono", monospace;
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: #6a6a7e;
          text-decoration: none;
          pointer-events: none;
        }

        /* Panels */
        .fzh-panels { position: absolute; inset: 0; pointer-events: none; }
        .fzh-panel {
          position: absolute; inset: 0;
          display: flex; align-items: center;
          padding: 6rem 5rem;
          opacity: 0; pointer-events: none;
          transition: opacity 0.45s ease;
        }
        .fzh-panel.vis { opacity: 1; pointer-events: auto; }

        /* Card */
        .fzh-card {
          max-width: 23.75rem;
          padding: 2.25rem 2rem;
          background: rgba(10,10,15,0.16);
          border: 1px solid rgba(200,255,71,0.18);
          border-radius: 14px;
          backdrop-filter: blur(14px) saturate(130%);
          -webkit-backdrop-filter: blur(14px) saturate(130%);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          font-family: "DM Mono", monospace;
          color: #e8e4d9;
        }
        .fzh-card.right { margin-left: auto; text-align: right; }
        .fzh-card.center { margin: 0 auto; text-align: center; max-width: 28.75rem; }

        .fzh-tag {
          font-size: 0.6rem; letter-spacing: 0.25em;
          text-transform: uppercase; color: #c8ff47;
          margin-bottom: 1.1rem; display: block;
          opacity: 0; translate: 0 10px;
          transition: opacity 0.5s ease, translate 0.5s ease;
        }
        .fzh-panel.vis .fzh-tag { opacity: 1; translate: 0 0; }

        .fzh-hline {
          width: 3.125rem; height: 1px;
          background: #c8ff47;
          margin-bottom: 1.2rem;
          scale: 0 1; transform-origin: left;
          opacity: 0;
          transition: scale 0.4s ease 0.05s, opacity 0.4s ease 0.05s;
        }
        .fzh-card.right .fzh-hline { transform-origin: right; margin-left: auto; }
        .fzh-card.center .fzh-hline { transform-origin: center; margin: 0 auto 1.2rem; }
        .fzh-panel.vis .fzh-hline { scale: 1 1; opacity: 1; }

        .fzh-icon {
          font-size: 1.8rem; margin-bottom: 0.6rem; display: block;
          opacity: 0; transition: opacity 0.5s ease 0.05s;
        }
        .fzh-panel.vis .fzh-icon { opacity: 1; }

        .fzh-h1 {
          font-family: "Bebas Neue", sans-serif;
          font-size: clamp(3rem, 8vw, 6.5rem);
          font-weight: 400; letter-spacing: 0.03em;
          line-height: 0.92; white-space: pre-line;
          margin-bottom: 0; opacity: 0; translate: 0 18px;
          transition: opacity 0.5s ease 0.08s, translate 0.5s ease 0.08s;
        }
        .fzh-h2 {
          font-family: "Bebas Neue", sans-serif;
          font-size: clamp(2.2rem, 6vw, 5rem);
          font-weight: 400; letter-spacing: 0.03em;
          line-height: 0.92; white-space: pre-line;
          margin-bottom: 1rem; opacity: 0; translate: 0 18px;
          transition: opacity 0.5s ease 0.08s, translate 0.5s ease 0.08s;
        }
        .fzh-promise {
          font-family: "DM Mono", monospace;
          font-size: 0.9rem; font-weight: 300; letter-spacing: 0.06em;
          color: rgba(232,228,217,0.6); margin-bottom: 1.25rem; display: block;
          opacity: 0; translate: 0 10px;
          transition: opacity 0.5s ease 0.12s, translate 0.5s ease 0.12s;
        }
        .fzh-panel.vis .fzh-h1,
        .fzh-panel.vis .fzh-h2 { opacity: 1; translate: 0 0; }
        .fzh-panel.vis .fzh-promise { opacity: 1; translate: 0 0; }

        .fzh-body {
          font-size: 0.78rem; line-height: 1.8;
          color: rgba(232,228,217,0.55);
          margin-top: 1.25rem; opacity: 0; translate: 0 10px;
          transition: opacity 0.5s ease 0.2s, translate 0.5s ease 0.2s;
        }
        .fzh-panel.vis .fzh-body { opacity: 1; translate: 0 0; }

        .fzh-stats {
          display: flex; gap: 2.5rem;
          margin-top: 2rem; flex-wrap: wrap;
          opacity: 0; translate: 0 10px;
          transition: opacity 0.5s ease 0.3s, translate 0.5s ease 0.3s;
        }
        .fzh-card.right  .fzh-stats { justify-content: flex-end; }
        .fzh-card.center .fzh-stats { justify-content: center; }
        .fzh-panel.vis .fzh-stats { opacity: 1; translate: 0 0; }
        .fzh-stat { display: flex; flex-direction: column; gap: 0.15rem; }
        .fzh-stat-num {
          font-family: "Bebas Neue", sans-serif;
          font-size: 2.2rem; color: #c8ff47; line-height: 1;
        }
        .fzh-stat-lbl {
          font-size: 0.58rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #6a6a7e;
        }

        .fzh-cta {
          display: inline-flex; align-items: center; gap: 0.6rem;
          margin-top: 1.75rem; padding: 0.6rem 1.25rem;
          border: 1px solid #c8ff47; color: #c8ff47;
          font-family: "DM Mono", monospace;
          font-size: 0.62rem; letter-spacing: 0.18em;
          text-transform: uppercase; text-decoration: none; cursor: pointer;
          background: transparent;
          opacity: 0; translate: 0 10px;
          transition: opacity 0.5s ease 0.35s, translate 0.5s ease 0.35s,
                      background 0.2s, color 0.2s;
        }
        .fzh-panel.vis .fzh-cta { opacity: 1; translate: 0 0; }
        .fzh-cta:hover { background: #c8ff47; color: #0a0a0f; }
        .fzh-cta svg { width: 0.6875rem; height: 0.6875rem; }

        @media (max-width: 60em) {
          .fzh-panel { padding: 5rem 3rem; }
          .fzh-card  { max-width: 20rem; }
        }
        /* ── CARD THEME ANIMATIONS ─────────────────────────────────── */

        /* Sunrise – animated sun orb + radial glow */
        .fzh-card-sunrise { position: relative; overflow: hidden; }
        .fzh-card-sunrise::before {
          content: ''; position: absolute;
          top: 12px; right: 12px;
          width: 36px; height: 36px;
          background: radial-gradient(circle, #ffd700 40%, #ff8c00 100%);
          border-radius: 50%;
          box-shadow: 0 0 22px 8px rgba(255,200,50,0.30);
          animation: fzh-sun-move 6s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .fzh-card-sunrise::after {
          content: ''; position: absolute;
          top: -10px; right: -10px;
          width: 130px; height: 130px;
          background: radial-gradient(circle, rgba(255,200,50,0.14) 0%, transparent 70%);
          border-radius: 50%;
          animation: fzh-glow-pulse 3s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        @keyframes fzh-sun-move {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fzh-glow-pulse {
          0%,100% { opacity:.5; transform:scale(1); }
          50%      { opacity:1; transform:scale(1.22); }
        }

        /* Midday – diagonal shine sweep + floating dot grid */
        .fzh-card-midday { position: relative; overflow: hidden; }
        .fzh-card-midday::before {
          content: ''; position: absolute; inset: 0;
          width: 200%; height: 100%;
          background: linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.13) 50%,transparent 70%);
          animation: fzh-shine 4.5s linear infinite;
          pointer-events: none; z-index: 0;
        }
        .fzh-card-midday::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle, rgba(255,220,80,0.18) 1px, transparent 1px);
          background-size: 22px 22px;
          animation: fzh-float-dots 7s ease-in-out infinite alternate;
          pointer-events: none; z-index: 0;
        }
        @keyframes fzh-shine {
          0%  { transform: translateX(-50%); }
          100%{ transform: translateX(50%); }
        }
        @keyframes fzh-float-dots {
          0%  { transform: translateY(0); }
          100%{ transform: translateY(-9px); }
        }

        /* Sunset – slowly morphing warm gradient overlay */
        .fzh-card-sunset { position: relative; overflow: hidden; }
        .fzh-card-sunset::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(270deg,
            rgba(255,100,0,0.13),
            rgba(255,60,120,0.11),
            rgba(130,60,180,0.10));
          background-size: 600% 600%;
          animation: fzh-grad-move 9s ease infinite;
          border-radius: inherit;
          pointer-events: none; z-index: 0;
        }
        @keyframes fzh-grad-move {
          0%  { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }

        /* Storm – rain drops + lightning flash */
        .fzh-card-storm { position: relative; overflow: hidden; }
        .fzh-rain {
          position: absolute;
          width: 1.5px; height: 18px;
          background: rgba(180,210,255,0.38);
          top: -20px;
          animation: fzh-rain 0.5s linear infinite;
          pointer-events: none; z-index: 0;
        }
        @keyframes fzh-rain {
          0%  { transform: translateY(-20px); opacity: 0; }
          15% { opacity: 1; }
          100%{ transform: translateY(130%); opacity: 0.3; }
        }
        .fzh-card-storm::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(190,210,255,0.65);
          opacity: 0; pointer-events: none;
          border-radius: inherit;
          animation: fzh-flash 5.5s infinite;
          z-index: 1;
        }
        @keyframes fzh-flash {
          0%,95%,100%{ opacity: 0; }
          96%{ opacity: 0.22; }
          97%{ opacity: 0; }
          98%{ opacity: 0.14; }
        }

        /* Night Sea – wave at bottom + twinkling star grid */
        .fzh-card-night { position: relative; overflow: hidden; }
        .fzh-card-night::before {
          content: ''; position: absolute;
          width: 120%; height: 38%;
          bottom: -8%; left: -10%;
          background: rgba(79,195,247,0.09);
          border-radius: 50% 50% 0 0;
          animation: fzh-wave 4.5s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .fzh-card-night::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle, rgba(200,230,255,0.7) 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.22;
          animation: fzh-twinkle 2.8s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        @keyframes fzh-wave {
          0%,100%{ transform: translateX(0) scaleX(1); }
          50%    { transform: translateX(10px) scaleX(1.04); }
        }
        @keyframes fzh-twinkle {
          0%,100%{ opacity: 0.18; }
          50%    { opacity: 0.48; }
        }

        /* Ensure z-index: 1 on card content so animations stay behind text */
        .fzh-card > * { position: relative; z-index: 2; }
        .fzh-rain { z-index: 0 !important; }

        @media (max-width: 37.5em) {
          .fzh-panel { 
            padding: 5rem 1.25rem 4rem; 
            flex-direction: column;
            justify-content: center;
          }
          .fzh-card, .fzh-card.right, .fzh-card.center {
            max-width: 100%; margin: 0; text-align: left;
            border-right: none; border-top: none;
            border-left: 1px solid rgba(200,255,71,0.18);
          }
          .fzh-card.right  .fzh-hline { transform-origin: left; margin-left: 0; }
          .fzh-card.center .fzh-hline { transform-origin: left; margin: 0 0 1.2rem; }
          .fzh-dots { display: none; }
          
          /* Move controls to top & bottom safe zones to avoid text overlap */
          .fzh-hud { 
            top: 1.25rem; right: 1.25rem; 
            background: rgba(10,10,15,0.4);
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }
          
          .fzh-sticky > .fzh-bottom-ctrls { display: none; }
          .fzh-panel .fzh-bottom-ctrls.mobile-only {
            display: flex;
          }
          
          /* Place bottom controls exactly under the card on mobile */
          .fzh-bottom-ctrls { 
            position: relative;
            bottom: auto; right: auto;
            transform: none;
            width: 100%;
            justify-content: flex-start;
            margin-top: 2.5rem;
            background: transparent;
            padding: 0;
            border: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            box-shadow: none;
            border-left: 1px solid rgba(200,255,71,0.18);
            padding-left: 1.25rem;
            align-items: flex-start;
            flex-direction: column;
            gap: 0.8rem;
          }
          
          .fzh-stats { gap: 1.5rem; }
          .fzh-panel.right.vis .fzh-stats { justify-content: flex-start; }
          .fzh-panel.center.vis .fzh-stats { justify-content: flex-start; }
        }
      `}</style>

      <section ref={sectionRef} className="fzh-outer" aria-label="Fzokart Highlights">
        <div className="fzh-sticky">

          {/* WebGL canvas */}
          <canvas ref={canvasRef} className="fzh-canvas" />

          {/* HUD */}
          <div className="fzh-hud">
            <div className="fzh-hud-num">{String(hudPct).padStart(3, "0")}%</div>
            <div className="fzh-prog-bar">
              <div className="fzh-prog-fill" style={{ width: `${hudPct}%` }} />
            </div>
            <div className="fzh-scene-lbl">{sceneName}</div>
          </div>

          {/* Scene dots */}
          <div className="fzh-dots">
            {Array.from({ length: N_WGL }).map((_, i) => (
              <button
                key={i}
                className={`fzh-dot${activeDot === i ? " act" : ""}`}
                aria-label={SCENE_NAMES[i]}
                onClick={() => scrollToPanel(Math.round((i / (N_WGL - 1)) * (N_PANELS - 1)))}
              />
            ))}
          </div>

          {/* Bottom Controls (Desktop Global) */}
          <div className="fzh-bottom-ctrls">
            <div className="fzh-layer-meter">
              LAYER {activePanel === 0 ? 0 : activePanel} / 5
            </div>
            <button className="fzh-skip-btn" onClick={skipSection}>
              Skip Section
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 6h10M1 1l5 5-5 5" />
              </svg>
            </button>
          </div>

          {/* Credit */}
          <span className="fzh-credit">FZOKART · SMART SHOPPING</span>

          {/* Text panels */}
          <div className="fzh-panels">
            {PANELS.map((p, i) => {
              const vis = activePanel === i;
              const cardCls = `fzh-card fzh-card-${p.id} ${p.align}`;
              return (
                <div key={p.id} className={`fzh-panel ${p.align}${vis ? " vis" : ""}`}>
                  <div className={cardCls}>

                    {/* Horizontal line (all except hero) */}
                    {i > 0 && <div className="fzh-hline" />}

                    {/* Storm rain drops */}
                    {p.id === 'storm' && [
                      [8,'0s','0.42s'],[18,'0.06s','0.48s'],[28,'0.12s','0.38s'],
                      [38,'0.18s','0.45s'],[48,'0.03s','0.52s'],[58,'0.09s','0.40s'],
                      [68,'0.15s','0.46s'],[78,'0.21s','0.44s'],[88,'0.07s','0.50s'],
                      [95,'0.24s','0.36s'],
                    ].map(([l,d,dur],ri) => (
                      <span key={ri} className="fzh-rain" style={{ left:`${l}%`, animationDelay:d as string, animationDuration:dur as string }} />
                    ))}

                    {/* Tag */}
                    <span className="fzh-tag">{p.tag}</span>

                    {/* Icon */}
                    {p.icon && <span className="fzh-icon">{p.icon}</span>}

                    {/* Hero uses h1; rest use h2 */}
                    {i === 0 ? (
                      <>
                        <h1 className="fzh-h1">{p.heading1}</h1>
                        <span className="fzh-promise">{p.heading2}</span>
                      </>
                    ) : (
                      <h2 className="fzh-h2">{p.heading1}</h2>
                    )}

                    {/* Body */}
                    <p className="fzh-body">{p.body}</p>

                    {/* Stats */}
                    {p.stats.length > 0 && (
                      <div className="fzh-stats">
                        {p.stats.map(s => (
                          <div key={s.label} className="fzh-stat">
                            <span className="fzh-stat-num">{s.num}</span>
                            <span className="fzh-stat-lbl">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {p.cta && (
                      <button
                        className="fzh-cta"
                        onClick={() => scrollToPanel(p.ctaTarget)}
                      >
                        {p.cta}
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 6h10M6 1l5 5-5 5" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Bottom Controls (Mobile only layout helper) */}
                  <div className="fzh-bottom-ctrls mobile-only">
                    <div className="fzh-layer-meter">
                      LAYER {activePanel === 0 ? 0 : activePanel} / 5
                    </div>
                    <button className="fzh-skip-btn" onClick={skipSection}>
                      Skip Section
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 6h10M1 1l5 5-5 5" />
                      </svg>
                    </button>
                  </div>
                  
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default FzokartHighlights;
