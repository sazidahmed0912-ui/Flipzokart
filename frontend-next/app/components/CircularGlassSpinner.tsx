'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CircularGlassSpinner() {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        const path = pathRef.current;
        if (!svg || !path) return;

        const totalLength = path.getTotalLength();

        gsap.set(path, {
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength,
        });
        gsap.set(svg, { opacity: 1 });

        const dur = 1; // 3x speed

        const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power1.inOut' } });
        tl
            .to(path, { strokeDashoffset: 0, duration: dur })
            .to(path, { strokeDashoffset: -totalLength, duration: dur });

        return () => { tl.kill(); };
    }, []);

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0d0d1a 60%, #000000 100%)' }}
        >
            <div className="relative flex flex-col items-center gap-6">

                {/* Ambient glow */}
                <div style={{
                    position: 'absolute',
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,135,9,0.18) 0%, rgba(147,51,234,0.12) 50%, transparent 70%)',
                    filter: 'blur(24px)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -62%)',
                    pointerEvents: 'none',
                }} />

                {/* Circle container — responsive via clamp */}
                <div style={{
                    width: 'clamp(110px, 22vw, 140px)',
                    height: 'clamp(110px, 22vw, 140px)',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 0 36px rgba(255,135,9,0.12), inset 0 0 24px rgba(147,51,234,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {/* GSAP SVG Logo */}
                    <svg
                        ref={svgRef}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="-1 -1 103 103"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            width: 'clamp(64px, 14vw, 80px)',
                            height: 'clamp(64px, 14vw, 80px)',
                            overflow: 'visible',
                            opacity: 0,
                            filter: 'drop-shadow(0 0 8px rgba(255,135,9,0.7)) drop-shadow(0 0 20px rgba(247,189,248,0.35))',
                        }}
                    >
                        <defs>
                            <linearGradient id="fz-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="rgb(255, 180, 50)" />
                                <stop offset="50%" stopColor="rgb(255, 100, 180)" />
                                <stop offset="100%" stopColor="rgb(180, 100, 255)" />
                            </linearGradient>
                        </defs>
                        <path
                            ref={pathRef}
                            stroke="url(#fz-grad)"
                            d="M50.5 50.5h50v50s-19.2 1.3-37.2-16.7S56 35.4 35.5 15.5C18.5-1 .5.5.5.5v50h50s25.6-.6 38-18 12-32 12-32h-50v100H.5S.2 80.7 11.8 68.2 40 49.7 50.5 50.5Z"
                        />
                    </svg>
                </div>

                {/* Animated Loading text */}
                <p className="loading-text" style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '15px',
                    letterSpacing: '0.3em',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                }}>
                    Loading<span className="dots" />
                </p>
            </div>

            <style>{`
                .dots::after {
                    content: '';
                    animation: dots-anim 1.5s steps(3, end) infinite;
                }
                @keyframes dots-anim {
                    0%   { content: '.'; }
                    33%  { content: '..'; }
                    66%  { content: '...'; }
                    100% { content: ''; }
                }
                .loading-text {
                    animation: text-pulse 2s ease-in-out infinite;
                }
                @keyframes text-pulse {
                    0%, 100% { opacity: 0.6; }
                    50%       { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
