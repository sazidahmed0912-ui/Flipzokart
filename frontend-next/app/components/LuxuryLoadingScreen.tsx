'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LuxuryLoadingScreen: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        const path = pathRef.current;
        if (!svg || !path) return;

        const totalLength = path.getTotalLength();

        // Initial state: stroke hidden
        gsap.set(path, {
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength,
        });
        gsap.set(svg, { opacity: 1 });

        // 2.5x speed → base duration 3 / 2.5 = 1.2s
        const dur = 3 / 2.5;

        const tl = gsap.timeline({
            repeat: -1,
            defaults: { ease: 'power1.inOut' },
        });

        tl
            // Draw in (stroke travels 0% → 100%)
            .to(path, { strokeDashoffset: 0, duration: dur })
            // Erase out (stroke exits, dashoffset goes negative)
            .to(path, { strokeDashoffset: -totalLength, duration: dur });

        return () => { tl.kill(); };
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50 overflow-hidden font-sans select-none">

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40" />

            {/* Glassmorphism Card */}
            <div className="
                relative flex flex-col items-center justify-center
                p-16
                rounded-[24px]
                bg-white/[0.08]
                backdrop-blur-[14px]
                shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                border border-white/10
            ">

                {/* Central "F" */}
                <div className="relative group perspective-1000 mb-6">
                    <div
                        className="
                            relative
                            text-8xl font-black
                            text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500
                            drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]
                            animate-pulse-slow
                            tracking-tighter
                        "
                        style={{
                            textShadow: '0 4px 30px rgba(255, 255, 255, 0.1)',
                            WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                        }}
                    >
                        F
                    </div>
                    {/* Inner Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 bg-clip-text text-transparent opacity-50 blur-[1px]">
                        F
                    </div>
                </div>

                {/* GSAP SVG Animation — small, below the "F" */}
                <svg
                    ref={svgRef}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-1 -1 103 103"
                    fill="none"
                    strokeWidth="2.2"
                    style={{
                        width: '64px',
                        height: '64px',
                        overflow: 'visible',
                        opacity: 0,          // GSAP sets to 1 on mount
                    }}
                >
                    <defs>
                        <linearGradient
                            id="flipzokart-grad"
                            x1="0" y1="0"
                            x2="100" y2="100"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0.2" stopColor="rgb(255, 135, 9)" />
                            <stop offset="0.8" stopColor="rgb(247, 189, 248)" />
                        </linearGradient>
                    </defs>
                    <path
                        ref={pathRef}
                        stroke="url(#flipzokart-grad)"
                        d="M50.5 50.5h50v50s-19.2 1.3-37.2-16.7S56 35.4 35.5 15.5C18.5-1 .5.5.5.5v50h50s25.6-.6 38-18 12-32 12-32h-50v100H.5S.2 80.7 11.8 68.2 40 49.7 50.5 50.5Z"
                    />
                </svg>
            </div>

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes breathe-logo {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.04); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: breathe-logo 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LuxuryLoadingScreen;
