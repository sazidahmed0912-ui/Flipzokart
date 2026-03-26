"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   GLSL — exact shaders from the demo
───────────────────────────────────────────── */
const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;

const FS = `
precision highp float;
uniform vec2  uR;
uniform float uT,uS,uSc,uBl;
uniform vec3  uBg;
#define PI 3.14159265359
#define MARCH_STEPS 22
#define REFINE_STEPS 5
float sat(float x){return clamp(x,0.0,1.0);}
float smoother(float x){x=sat(x);return x*x*x*(x*(x*6.0-15.0)+10.0);}
vec3 sCol(vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 c4){
  int si=int(uSc);vec3 a=c0;vec3 b=c1;
  if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}
  return mix(a,b,uBl);}
float sF(float c0,float c1,float c2,float c3,float c4){
  int si=int(uSc);float a=c0;float b=c1;
  if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}
  return mix(a,b,uBl);}
mat2 rot(float a){float c=cos(a);float s=sin(a);return mat2(c,-s,s,c);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
  float a=hash(i);float b=hash(i+vec2(1.0,0.0));
  float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float waveH(vec2 p,float t,float amp,float storm){
  float h=0.0;
  vec2 sw1=normalize(vec2(1.0,0.28));
  vec2 sw2=normalize(vec2(-0.48,0.88));
  vec2 sw3=normalize(vec2(0.82,-0.16));
  sw2=rot(storm*0.18)*sw2;sw3=rot(-storm*0.14)*sw3;
  float d1=dot(p,sw1);float d2=dot(p,sw2);float d3=dot(p,sw3);
  h+=amp*0.66*sin(d1*0.42+t*0.38);h+=amp*0.22*sin(d1*0.94-t*0.62);
  h+=amp*0.14*sin(d2*1.18-t*0.82);h+=amp*0.09*sin(d3*1.82+t*1.04);
  h+=amp*(0.11+storm*0.07)*sin(p.x*1.45-t*0.76+p.y*0.66);
  h+=amp*(0.07+storm*0.05)*sin(p.x*2.85+t*1.06-p.y*0.52);
  h+=amp*(0.04+storm*0.03)*sin(p.x*4.60-t*1.50+p.y*1.02);
  float micro=noise(p*14.0+vec2(t*0.18,t*0.06))-0.5;
  h+=micro*amp*(0.010+storm*0.008);
  return h;}
vec3 waveNorm(vec2 p,float t,float amp,float storm){
  float e=0.018;
  float hL=waveH(p-vec2(e,0.0),t,amp,storm);float hR=waveH(p+vec2(e,0.0),t,amp,storm);
  float hD=waveH(p-vec2(0.0,e),t,amp,storm);float hU=waveH(p+vec2(0.0,e),t,amp,storm);
  return normalize(vec3(-(hR-hL)/(2.0*e),1.0,-(hU-hD)/(2.0*e)));}
float starField(vec2 uv){
  vec2 gv=floor(uv);vec2 lv=fract(uv)-0.5;
  float h=hash(gv);float size=mix(0.012,0.0025,h);
  float d=length(lv+vec2(hash(gv+3.1)-0.5,hash(gv+7.3)-0.5)*0.25);
  float star=smoothstep(size,0.0,d);star*=smoothstep(0.82,1.0,h);return star;}
void main(){
  vec2 uv=(gl_FragCoord.xy-uR*0.5)/uR.y;
  float s=smoother(uS);
  float camY=mix(1.14,1.03,s);camY+=sin(s*PI*1.4)*0.028;
  float camZ=mix(0.08,-0.18,s);float pitch=mix(0.115,0.088,s);
  vec3 ro=vec3(0.0,camY,camZ);
  vec3 rd=normalize(vec3(uv.x,uv.y-pitch,-1.4));
  float storm=smoothstep(0.80,1.0,s);float night=smoothstep(0.56,0.84,s);
  vec3 skyTop=sCol(vec3(0.18,0.06,0.24),vec3(0.05,0.24,0.68),vec3(0.26,0.06,0.04),vec3(0.01,0.01,0.05),vec3(0.04,0.05,0.09));
  vec3 skyHori=sCol(vec3(0.92,0.48,0.18),vec3(0.42,0.62,0.90),vec3(0.88,0.32,0.04),vec3(0.03,0.05,0.14),vec3(0.15,0.17,0.23));
  vec3 sunCol=sCol(vec3(1.0,0.62,0.22),vec3(1.0,0.96,0.80),vec3(1.0,0.38,0.05),vec3(0.70,0.75,0.94),vec3(0.26,0.28,0.34));
  vec3 seaDeep=sCol(vec3(0.08,0.05,0.12),vec3(0.03,0.14,0.34),vec3(0.10,0.06,0.04),vec3(0.00,0.01,0.03),vec3(0.03,0.04,0.07));
  vec3 seaShlo=sCol(vec3(0.28,0.17,0.24),vec3(0.09,0.38,0.60),vec3(0.24,0.13,0.06),vec3(0.04,0.06,0.16),vec3(0.07,0.10,0.14));
  vec3 fogCol=sCol(vec3(0.80,0.50,0.30),vec3(0.58,0.72,0.90),vec3(0.70,0.28,0.05),vec3(0.02,0.03,0.08),vec3(0.12,0.14,0.18));
  float sunProgress=clamp(s/0.58,0.0,1.0);float sunAngle=sunProgress*PI;
  float sunArcX=cos(sunAngle)*-0.75;float sunArcY=sin(sunAngle)*0.38-0.08;
  vec3 sunDir=normalize(vec3(sunArcX,sunArcY,-1.0));
  vec3 moonDir=normalize(vec3(-0.14,0.42,-1.0));
  float waveAmp=sF(0.082,0.070,0.100,0.054,0.30);waveAmp+=storm*0.020;
  float fogDen=sF(0.020,0.010,0.022,0.034,0.046);
  float moonAmt=sF(0.0,0.0,0.05,0.92,0.06);
  float sunAbove=step(0.0,sunDir.y);float sunGlow=smoothstep(-0.10,0.06,sunDir.y);
  vec3 col;
  if(rd.y<0.0){
    float tFlat=ro.y/(-rd.y);float stepSize=tFlat/float(MARCH_STEPS);float t=stepSize;
    for(int i=0;i<MARCH_STEPS;i++){
      vec2 wpT=ro.xz+rd.xz*t;float wy=ro.y+rd.y*t;
      if(wy<waveH(wpT,uT,waveAmp,storm))break;t+=stepSize;}
    float ta=t-stepSize;float tb=t;
    for(int i=0;i<REFINE_STEPS;i++){
      float tm=(ta+tb)*0.5;vec2 wpm=ro.xz+rd.xz*tm;
      if(ro.y+rd.y*tm<waveH(wpm,uT,waveAmp,storm))tb=tm;else ta=tm;}
    t=(ta+tb)*0.5;
    vec2 wp=ro.xz+rd.xz*t;vec3 n=waveNorm(wp,uT,waveAmp,storm);vec3 vDir=-rd;
    float fres=pow(1.0-clamp(dot(n,vDir),0.0,1.0),4.0);
    vec3 refl=reflect(rd,n);float rh=clamp(refl.y,0.0,1.0);
    vec3 reflSky=mix(skyHori,skyTop,pow(rh,0.42));reflSky=mix(reflSky,skyHori,0.12);
    float rSun=max(dot(refl,sunDir),0.0);
    reflSky+=sunCol*pow(rSun,120.0)*2.0*sunGlow;reflSky+=sunCol*pow(rSun,18.0)*0.07*sunGlow;
    if(moonAmt>0.04){float rMoon=max(dot(refl,moonDir),0.0);reflSky+=vec3(0.72,0.80,0.95)*pow(rMoon,120.0)*0.78*moonAmt;}
    float depth=exp(-t*0.40);vec3 waterC=mix(seaDeep,seaShlo,depth*0.5);
    vec3 absorb=vec3(0.85,0.92,1.0);waterC*=mix(vec3(1.0),absorb,clamp(t*0.25,0.0,1.0));
    col=mix(waterC,reflSky,0.15+fres*0.34);
    float spec=pow(max(dot(reflect(-sunDir,n),vDir),0.0),200.0);col+=sunCol*spec*1.10*sunAbove;
    float broadSpec=pow(max(dot(reflect(-sunDir,n),vDir),0.0),32.0);col+=sunCol*broadSpec*0.12*sunGlow;
    float sunLine=pow(max(dot(reflect(rd,n),sunDir),0.0),8.0);col+=sunCol*sunLine*0.48*smoothstep(0.0,0.35,-rd.y)*sunGlow;
    float sparkle=noise(wp*18.0+vec2(uT*0.55,uT*0.22));sparkle=smoothstep(0.94,1.0,sparkle);
    col+=sunCol*sparkle*0.08*sunGlow*sunAbove;
    if(moonAmt>0.04){float mSpec=pow(max(dot(reflect(-moonDir,n),vDir),0.0),520.0);col+=vec3(0.72,0.80,0.95)*mSpec*0.09*moonAmt;}
    float hC=waveH(wp,uT,waveAmp,storm);
    float hLw=waveH(wp-vec2(0.025,0.0),uT,waveAmp,storm);float hRw=waveH(wp+vec2(0.025,0.0),uT,waveAmp,storm);
    float hDw=waveH(wp-vec2(0.0,0.025),uT,waveAmp,storm);float hUw=waveH(wp+vec2(0.0,0.025),uT,waveAmp,storm);
    float curvature=hRw+hLw+hUw+hDw-4.0*hC;
    float foam=clamp(curvature*(24.0+storm*10.0),0.0,1.0);col+=foam*vec3(1.0)*(0.03+storm*0.10);
    float fog=1.0-exp(-t*fogDen*1.65);col=mix(col,fogCol,fog);
  }else{float h=clamp(rd.y,0.0,1.0);col=mix(skyHori,skyTop,pow(h,0.38));}
  float horizonW=0.008;float skyMix=smoothstep(-horizonW,horizonW,rd.y);
  vec3 skyCol;
  {
    float h=clamp(rd.y,0.0,1.0);skyCol=mix(skyHori,skyTop,pow(h,0.38));
    float cb=noise(rd.x*5.5+vec2(rd.y*3.0,uT*0.015));float cb2=noise(rd.x*8.0-vec2(rd.y*4.0,uT*0.010));
    float clouds=smoothstep(0.62,0.86,cb*0.65+cb2*0.35);
    clouds*=smoothstep(-0.02,0.24,rd.y);clouds*=0.08+storm*0.18;
    vec3 cloudCol=mix(vec3(1.0,0.82,0.65),vec3(0.42,0.48,0.56),storm);
    skyCol=mix(skyCol,mix(skyCol*0.97,cloudCol,0.35),clouds);
    float sd=max(dot(rd,sunDir),0.0);
    skyCol+=sunCol*pow(sd,380.0)*6.8*sunGlow;skyCol+=sunCol*pow(sd,22.0)*0.20*sunGlow;skyCol+=sunCol*pow(sd,5.0)*0.09*sunGlow;
    float sunDisk=smoothstep(0.99925,0.99995,dot(rd,sunDir));skyCol+=sunCol*sunDisk*2.6*sunGlow;
    float horizonBand=exp(-abs(rd.y)*24.0);skyCol+=sunCol*horizonBand*0.11*sunGlow;
    float viewSun=max(dot(rd,sunDir),0.0);skyCol+=sunCol*pow(viewSun,3.0)*0.035*sunGlow;
    if(moonAmt>0.04){float md=max(dot(rd,moonDir),0.0);skyCol+=vec3(0.88,0.92,1.0)*pow(md,820.0)*7.4*moonAmt;skyCol+=vec3(0.88,0.92,1.0)*pow(md,6.0)*0.045*moonAmt;}
    if(night>0.02){vec2 starUv=rd.xy/max(0.12,rd.z+1.6);starUv*=140.0;float stars=starField(starUv)+starField(starUv*0.55+11.7)*0.65;stars*=smoothstep(0.02,0.26,rd.y);stars*=(1.0-storm*0.85);skyCol+=vec3(0.80,0.88,1.0)*stars*night*0.82;}
    float horizonMist=exp(-abs(rd.y)*mix(38.0,22.0,storm));skyCol+=fogCol*horizonMist*(0.09+storm*0.10);
    skyCol=mix(skyCol,skyCol*vec3(0.91,0.94,0.98),storm*0.22);
  }
  col=mix(col,skyCol,skyMix);
  float hEdge=smoothstep(-0.008,0.018,rd.y);col=mix(fogCol,col,hEdge*0.25+0.75);
  float grain=hash(gl_FragCoord.xy*0.5+floor(uT*12.0))-0.5;col+=grain*0.006;
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const N = 5;
const NAMES = ["DAWN", "MIDDAY", "DUSK", "NIGHT", "STORM"];
const MAX_DPR = 1.5;
const MIN_QUALITY = 0.82;
const MAX_QUALITY = 1.0;

/* ─────────────────────────────────────────────
   Section content — exact from the demo
───────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "fzh-s0", align: "left",
    tag: "A small reflection",
    heading: <><span style={{display:"block"}}>THE</span><span style={{display:"block"}}>ENDLESS</span><span style={{display:"block"}}>HORIZON</span></>,
    isH1: true,
    body: "A small build during a quiet pause. Scroll and watch the sea move through a full day. Light changes, waves repeat, and the horizon keeps returning.",
    cta: { label: "Continue", target: "fzh-s1" },
  },
  {
    id: "fzh-s1", align: "right",
    tag: "01 — Midday",
    heading: <><span style={{display:"block"}}>OPEN</span><span style={{display:"block"}}>WATER</span></>,
    isH1: false,
    body: "Reconnecting with simplicity. Small pieces of motion, repeating quietly. For a moment the rhythm feels calm, almost balanced.",
    stats: [{ num: "360°", label: "Horizon" }, { num: "5", label: "Phases" }, { num: "∞", label: "Motion" }],
  },
  {
    id: "fzh-s2", align: "left",
    tag: "02 — Sunset",
    heading: <><span style={{display:"block"}}>SHIFTING</span><span style={{display:"block"}}>LIGHT</span></>,
    isH1: false,
    body: "Still, the calm carries a question. Is this something honest being rebuilt, or just a way of avoiding what comes next?",
    cta: { label: "Continue", target: "fzh-s3" },
  },
  {
    id: "fzh-s3", align: "center",
    tag: "03 — Midnight",
    heading: <><span style={{display:"block"}}>QUIET</span><span style={{display:"block"}}>SEA</span></>,
    isH1: false,
    body: "Simplicity can restore focus, but it can also soften the edge. Stay there too long and comfort begins to blur into confusion.",
  },
  {
    id: "fzh-s4", align: "right",
    tag: "04 — Storm",
    heading: <><span style={{display:"block"}}>THE</span><span style={{display:"block"}}>QUESTION</span></>,
    isH1: false,
    body: "The waves keep cycling. For now that is enough. But beneath the calm the question remains, waiting for whatever comes next.",
    cta: { label: "Begin again", target: "fzh-s0" },
  },
];

/* ─────────────────────────────────────────────
   WebGL helpers
───────────────────────────────────────────── */
function mkShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export const FzokartHighlights: React.FC = () => {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);

  /* React state for HUD (updated ~60fps but debounced cheaply via last values) */
  const [pct,       setPct]       = useState(0);
  const [sceneName, setSceneName] = useState("DAWN");
  const [activeIdx, setActiveIdx] = useState(0);
  const [cardIdx,   setCardIdx]   = useState(0);  // which text card is "in view"
  const [theme,     setTheme]     = useState<"dark"|"light">("dark");

  /* Mutable animation state in a ref — no re-renders */
  const anim = useRef({
    smooth: 0, tgt: 0,
    t0: 0, lastNow: 0,
    fpsAccum: 0, fpsFrames: 0,
    lowFpsTime: 0, highFpsTime: 0,
    qualityScale: 1.0,
    rafId: 0,
    lastPct: -1, lastScene: -1, lastCard: -1,
  });

  /* WebGL objects */
  const glRef   = useRef<WebGLRenderingContext | null>(null);
  const uniforms = useRef<{
    uR: WebGLUniformLocation | null;
    uT: WebGLUniformLocation | null;
    uS: WebGLUniformLocation | null;
    uSc: WebGLUniformLocation | null;
    uBl: WebGLUniformLocation | null;
    uBg: WebGLUniformLocation | null;
  } | null>(null);

  /* ── Theme ── */
  useEffect(() => {
    const read = () => {
      const t = (document.documentElement.getAttribute("data-theme") || "dark") as "dark"|"light";
      setTheme(t);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
  }, [theme]);

  /* ── Resize ── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const gl     = glRef.current;
    const u      = uniforms.current;
    if (!canvas || !gl || !u) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const scale = dpr * anim.current.qualityScale;
    const pw = Math.max(1, Math.round(W * scale));
    const ph = Math.max(1, Math.round(H * scale));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width  = pw;
      canvas.height = ph;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      gl.viewport(0, 0, pw, ph);
      gl.uniform2f(u.uR, pw, ph);
    }
  }, []);

  /* ── Scroll → tgt ── */
  const onScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperTop    = wrapper.getBoundingClientRect().top + window.scrollY;
    const scrollRange   = wrapper.scrollHeight - window.innerHeight; // 4 * 100vh
    const scrolled      = Math.max(0, window.scrollY - wrapperTop);
    anim.current.tgt    = scrollRange > 0 ? Math.min(1, scrolled / scrollRange) : 0;
  }, []);

  /* ── WebGL init + RAF loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false,
      stencil: false, preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) { canvas.style.background = "#0a0a0f"; return; }
    glRef.current = gl;

    const vert = mkShader(gl, gl.VERTEX_SHADER,   VS);
    const frag = mkShader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog)); return;
    }
    gl.useProgram(prog);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);      gl.disable(gl.DITHER);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    uniforms.current = {
      uR:  gl.getUniformLocation(prog, "uR"),
      uT:  gl.getUniformLocation(prog, "uT"),
      uS:  gl.getUniformLocation(prog, "uS"),
      uSc: gl.getUniformLocation(prog, "uSc"),
      uBl: gl.getUniformLocation(prog, "uBl"),
      uBg: gl.getUniformLocation(prog, "uBg"),
    };

    resizeCanvas();

    /* Quality‑adaptive FPS monitoring */
    const maybeAdaptQuality = (dt: number) => {
      const a = anim.current;
      a.fpsAccum += dt; a.fpsFrames++;
      if (a.fpsAccum < 0.75) return;
      const fps = a.fpsFrames / a.fpsAccum;
      a.fpsAccum = 0; a.fpsFrames = 0;
      if (fps < 50)       { a.lowFpsTime += 0.75;  a.highFpsTime = 0; }
      else if (fps > 57)  { a.highFpsTime += 0.75; a.lowFpsTime  = 0; }
      else                { a.lowFpsTime = a.highFpsTime = 0; }
      if (a.lowFpsTime >= 1.5 && a.qualityScale > MIN_QUALITY) {
        a.qualityScale = +(a.qualityScale - 0.06).toFixed(2);
        a.lowFpsTime = 0; resizeCanvas();
      }
      if (a.highFpsTime >= 3.0 && a.qualityScale < MAX_QUALITY) {
        a.qualityScale = +(a.qualityScale + 0.04).toFixed(2);
        a.highFpsTime = 0; resizeCanvas();
      }
    };

    const t0 = performance.now();
    anim.current.t0 = t0;
    anim.current.lastNow = t0;

    const frame = (now: number) => {
      anim.current.rafId = requestAnimationFrame(frame);
      const a  = anim.current;
      const dt = Math.min((now - a.lastNow) / 1000, 0.05);
      a.lastNow = now;

      maybeAdaptQuality(dt);

      /* Smooth scroll lerp */
      a.smooth += (a.tgt - a.smooth) * (1 - Math.exp(-dt * 8));

      /* Scene params */
      const raw = a.smooth * (N - 1);
      const flr = Math.floor(raw);
      const si  = Math.min(flr, N - 2);
      const bl  = flr >= N - 1 ? 1.0 : raw - flr;
      const p   = Math.round(a.smooth * 100);
      const sc  = Math.min(N - 1, Math.floor(a.smooth * N));
      const card = Math.min(N - 1, Math.floor((a.smooth + 0.01) * N));

      /* HUD updates — only when changed */
      if (p !== a.lastPct) {
        a.lastPct = p;
        setPct(p);
      }
      if (sc !== a.lastScene) {
        a.lastScene = sc;
        setSceneName(NAMES[sc]);
        setActiveIdx(sc);
      }
      if (card !== a.lastCard) {
        a.lastCard = card;
        setCardIdx(card);
      }

      /* WebGL draw */
      const u = uniforms.current;
      if (!u) return;
      gl.uniform1f(u.uT!, (now - t0) / 1000);
      gl.uniform1f(u.uS!, a.smooth);
      gl.uniform1f(u.uSc!, si);
      gl.uniform1f(u.uBl!, bl);

      const themeAttr = document.documentElement.getAttribute("data-theme") ?? "dark";
      const [r, g, b] = hexToVec3(themeAttr === "light" ? "#eef4ff" : "#0a0a0f");
      gl.uniform3f(u.uBg!, r, g, b);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    anim.current.rafId = requestAnimationFrame(frame);

    window.addEventListener("resize", resizeCanvas, { passive: true });

    return () => {
      cancelAnimationFrame(anim.current.rafId);
      window.removeEventListener("resize", resizeCanvas);
      gl.deleteProgram(prog);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Scroll listener ── */
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  /* ── Smooth scroll to a section ── */
  const scrollToSection = useCallback((targetId: string) => {
    const wrapper  = wrapperRef.current;
    if (!wrapper) return;
    const idx = SECTIONS.findIndex(s => s.id === targetId);
    if (idx < 0) return;
    const wrapperTop  = wrapper.getBoundingClientRect().top + window.scrollY;
    const targetY     = wrapperTop + idx * window.innerHeight;

    const startY = window.scrollY;
    const diff   = targetY - startY;
    const start  = performance.now();
    const dur    = 900;
    const ease   = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      window.scrollTo(0, startY + diff * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  /* ── CSS (scoped to #fzh-ocean) ── */
  const CSS = `
    #fzh-ocean{position:relative;height:500vh;}
    #fzh-sticky{position:sticky;top:0;height:100vh;height:100dvh;overflow:hidden;}
    #fzh-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}

    /* HUD */
    #fzh-hud{position:absolute;top:2rem;right:2rem;z-index:10;text-align:right;font-size:.65rem;letter-spacing:.15em;color:var(--fzh-muted);text-transform:uppercase;font-family:"DM Mono",monospace;}
    #fzh-hud-pct{font-variant-numeric:tabular-nums;}
    .fzh-progress-bar{width:7.5rem;height:1px;background:var(--fzh-muted);margin:.5rem 0 0 auto;position:relative;overflow:hidden;}
    .fzh-progress-fill{position:absolute;inset-block:0;left:0;background:var(--fzh-accent);transition:width .1s linear;}
    .fzh-scene-label{font-size:.6rem;color:var(--fzh-accent);margin-top:.4rem;}

    /* Dots */
    #fzh-dots{position:absolute;left:2rem;top:50%;translate:-50% -50%;z-index:10;display:flex;flex-direction:column;gap:.5rem;}
    .fzh-dot{width:.25rem;height:.25rem;border-radius:50%;background:var(--fzh-muted);transition:background .3s,scale .3s;}
    .fzh-dot.active{background:var(--fzh-accent);scale:1.8;}

    /* Theme toggle */
    #fzh-toggle{position:absolute;bottom:2rem;left:2rem;translate:-50% 0;z-index:10;width:2rem;height:2rem;border:none;background:color-mix(in srgb,var(--fzh-muted) 35%,transparent);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .3s;}
    #fzh-toggle:hover{background:color-mix(in srgb,var(--fzh-muted) 55%,transparent);}
    #fzh-toggle svg{width:.875rem;height:.875rem;position:absolute;transition:opacity .3s,rotate .3s;color:var(--fzh-accent);}
    .fzh-sun{opacity:1;rotate:0deg;}  .fzh-moon{opacity:0;rotate:90deg;}
    #fzh-ocean[data-theme="light"] .fzh-sun{opacity:0;rotate:-90deg;}
    #fzh-ocean[data-theme="light"] .fzh-moon{opacity:1;rotate:0deg;}
    #fzh-ocean[data-theme="light"] #fzh-toggle svg{color:var(--fzh-fg);}

    /* Credit */
    #fzh-credit{position:absolute;right:2rem;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:right center;z-index:10;font-family:"DM Mono",monospace;font-size:.65rem;letter-spacing:.15em;}
    #fzh-credit a{color:var(--fzh-muted);text-decoration:none;}

    /* CSS variables scoped to section */
    #fzh-ocean{
      --fzh-accent:#c8ff47;
      --fzh-muted:#6a6a7e;
      --fzh-fg:#e8e4d9;
      --fzh-bg:#0a0a0f;
      --fzh-card-bg:rgba(10,10,15,0.16);
      --fzh-card-border:rgba(200,255,71,0.18);
      --fzh-hairline:.0625rem;
    }
    #fzh-ocean[data-theme="light"]{
      --fzh-accent:#1b7ed6;
      --fzh-muted:#6c8296;
      --fzh-fg:#0b141a;
      --fzh-bg:#eef4ff;
      --fzh-card-bg:rgba(245,249,255,0.82);
      --fzh-card-border:rgba(27,126,214,0.22);
    }

    /* Scroll content overlay */
    #fzh-overlay{position:absolute;top:0;left:0;right:0;z-index:2;pointer-events:none;}
    .fzh-section{height:100vh;display:flex;align-items:center;padding:6rem 5rem;}

    /* Text cards */
    .fzh-card{max-width:23.75rem;padding:2.25rem 2rem;background:var(--fzh-card-bg);border-left:var(--fzh-hairline) solid var(--fzh-card-border);pointer-events:auto;transition:opacity .4s ease,transform .4s ease;}
    #fzh-ocean[data-theme="dark"] .fzh-card{border:var(--fzh-hairline) solid var(--fzh-card-border);border-radius:14px;backdrop-filter:blur(14px) saturate(130%);-webkit-backdrop-filter:blur(14px) saturate(130%);box-shadow:0 10px 30px rgba(0,0,0,.35);}
    .fzh-card.right{margin-inline-start:auto;border-left:none;border-right:var(--fzh-hairline) solid var(--fzh-card-border);text-align:right;}
    .fzh-card.center{margin-inline:auto;border-left:none;border-top:var(--fzh-hairline) solid var(--fzh-card-border);text-align:center;max-width:28.75rem;}
    .fzh-card.hidden{opacity:0;transform:translateY(10px);}
    .fzh-card.visible{opacity:1;transform:translateY(0);}

    .fzh-tag{font-size:.6rem;letter-spacing:.25em;text-transform:uppercase;color:var(--fzh-accent);margin-bottom:1.1rem;font-family:"DM Mono",monospace;display:block;}
    .fzh-h1{font-family:"Bebas Neue",sans-serif;font-weight:400;letter-spacing:.03em;line-height:.92;font-size:clamp(3rem,8vw,6.5rem);color:var(--fzh-fg);}
    .fzh-h2{font-family:"Bebas Neue",sans-serif;font-weight:400;letter-spacing:.03em;line-height:.92;font-size:clamp(2.2rem,6vw,5rem);color:var(--fzh-fg);}
    .fzh-body{font-size:.78rem;line-height:1.8;color:color-mix(in srgb,var(--fzh-fg) 55%,transparent);margin-top:1.25rem;font-family:"DM Mono",monospace;}
    .fzh-h-line{width:3.125rem;height:var(--fzh-hairline);background:var(--fzh-accent);margin-bottom:1.2rem;}
    .fzh-card.right .fzh-h-line{margin-inline-start:auto;}
    .fzh-card.center .fzh-h-line{margin-inline:auto;}
    .fzh-stat-row{display:flex;gap:2.5rem;margin-top:2rem;flex-wrap:wrap;}
    .fzh-card.right .fzh-stat-row{justify-content:flex-end;}
    .fzh-stat{display:flex;flex-direction:column;gap:.15rem;}
    .fzh-stat-num{font-family:"Bebas Neue",sans-serif;font-size:2.2rem;color:var(--fzh-accent);line-height:1;}
    .fzh-stat-label{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--fzh-muted);font-family:"DM Mono",monospace;}
    .fzh-cta{display:inline-flex;align-items:center;gap:.6rem;margin-top:1.75rem;padding:.6rem 1.25rem;border:var(--fzh-hairline) solid var(--fzh-accent);color:var(--fzh-accent);font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;cursor:pointer;background:transparent;transition:background .2s,color .2s;}
    .fzh-cta:hover{background:var(--fzh-accent);color:var(--fzh-bg);}
    .fzh-cta svg{width:.6875rem;height:.6875rem;}

    /* Responsive */
    @media(max-width:960px){.fzh-section{padding:5rem 3rem;}.fzh-card{max-width:20rem;}}
    @media(max-width:600px){
      .fzh-section{padding:4rem 1.25rem;}
      .fzh-card{max-width:100%;}
      .fzh-card.right,.fzh-card.center{margin-inline:0;text-align:left;border-right:none;border-top:none;border-left:var(--fzh-hairline) solid var(--fzh-card-border);}
      .fzh-card.right .fzh-h-line,.fzh-card.center .fzh-h-line{margin-inline-start:0;margin-inline:0;}
      #fzh-hud{top:1rem;right:1rem;}
      #fzh-dots{display:none;}
      #fzh-toggle{bottom:1rem;left:1.25rem;translate:0 0;}
      .fzh-stat-row{gap:1.5rem;}
    }
  `;

  return (
    <>
      {/* Google Fonts loaded for Bebas Neue + DM Mono */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap"
      />
      <style>{CSS}</style>

      {/* ── 500 vh wrapper — creates scroll space ── */}
      <div id="fzh-ocean" ref={wrapperRef} data-theme={theme}>

        {/* ── Sticky viewport (canvas + HUD + dots) ── */}
        <div id="fzh-sticky" ref={stickyRef}>
          <canvas id="fzh-canvas" ref={canvasRef} />

          {/* HUD — top right */}
          <div id="fzh-hud">
            <div id="fzh-hud-pct">{String(pct).padStart(3, "0")}%</div>
            <div className="fzh-progress-bar">
              <div className="fzh-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="fzh-scene-label">{sceneName}</div>
          </div>

          {/* Dots — left center */}
          <div id="fzh-dots">
            {NAMES.map((_, i) => (
              <div
                key={i}
                className={`fzh-dot${activeIdx === i ? " active" : ""}`}
                onClick={() => scrollToSection(SECTIONS[i].id)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>

          {/* Theme toggle — bottom left */}
          <button id="fzh-toggle" onClick={toggleTheme} aria-label="Toggle light/dark mode">
            <svg className="fzh-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            <svg className="fzh-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
            </svg>
          </button>

          {/* Credit — right side rotated */}
          <div id="fzh-credit">
            <a href="https://fzokart.com" target="_blank" rel="noopener">FZOKART</a>
          </div>
        </div>

        {/* ── Text overlays — scroll over the sticky canvas ── */}
        <div id="fzh-overlay">
          {SECTIONS.map((sec, i) => {
            const visible = cardIdx === i;
            const cardClass = [
              "fzh-card",
              sec.align !== "left" ? sec.align : "",
              visible ? "visible" : "hidden",
            ].filter(Boolean).join(" ");

            return (
              <div key={sec.id} id={sec.id} className="fzh-section">
                <div className={cardClass}>
                  {sec.align !== "left" && <div className="fzh-h-line" />}
                  <span className="fzh-tag">{sec.tag}</span>
                  {sec.isH1
                    ? <div className="fzh-h1">{sec.heading}</div>
                    : <div className="fzh-h2">{sec.heading}</div>
                  }
                  <p className="fzh-body">{sec.body}</p>

                  {"stats" in sec && sec.stats && (
                    <div className="fzh-stat-row">
                      {sec.stats.map((st: { num: string; label: string }) => (
                        <div key={st.label} className="fzh-stat">
                          <span className="fzh-stat-num">{st.num}</span>
                          <span className="fzh-stat-label">{st.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {"cta" in sec && sec.cta && (
                    <button
                      className="fzh-cta"
                      onClick={() => scrollToSection((sec as any).cta.target)}
                    >
                      {(sec as any).cta.label}
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 6h10M6 1l5 5-5 5"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FzokartHighlights;
