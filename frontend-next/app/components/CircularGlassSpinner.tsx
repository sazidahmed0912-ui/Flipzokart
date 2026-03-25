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

        // Speed 3x → 1s per phase
        const dur = 1;

        const tl = gsap.timeline({
            repeat: -1,
            defaults: { ease: 'power1.inOut' },
        });

        tl
            .to(path, { strokeDashoffset: 0, duration: dur })
            .to(path, { strokeDashoffset: -totalLength, duration: dur });

        return () => { tl.kill(); };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0d0d1a 60%, #000000 100%)' }}
        >
            <div className="relative flex flex-col items-center gap-6">

                {/* Ambient glow behind SVG */}
                <div style={{
                    position: 'absolute',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,135,9,0.18) 0%, rgba(147,51,234,0.12) 50%, transparent 70%)',
                    filter: 'blur(20px)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    pointerEvents: 'none',
                }} />

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
                        width: '100px',
                        height: '100px',
                        overflow: 'visible',
                        opacity: 0,
                        filter: 'drop-shadow(0 0 8px rgba(255,135,9,0.7)) drop-shadow(0 0 20px rgba(247,189,248,0.35))',
                    }}
                >
                    <defs>
                        <linearGradient
                            id="fz-grad"
                            x1="0" y1="0"
                            x2="100" y2="100"
                            gradientUnits="userSpaceOnUse"
                        >
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

                {/* Loading text */}
                <p style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '10px',
                    letterSpacing: '0.35em',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    animation: 'pulse 2s ease-in-out infinite',
                }}>
                    Loading
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
