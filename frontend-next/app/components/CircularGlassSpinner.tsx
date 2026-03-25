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

        // Speed 3x → duration = 3 / 3 = 1s per phase
        const dur = 3 / 3;

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="relative flex flex-col items-center gap-4">

                {/* GSAP SVG Logo — replaces F + circle */}
                <svg
                    ref={svgRef}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-1 -1 103 103"
                    fill="none"
                    strokeWidth="2.2"
                    style={{
                        width: '80px',
                        height: '80px',
                        overflow: 'visible',
                        opacity: 0,
                    }}
                >
                    <defs>
                        <linearGradient
                            id="fz-grad"
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
                        stroke="url(#fz-grad)"
                        d="M50.5 50.5h50v50s-19.2 1.3-37.2-16.7S56 35.4 35.5 15.5C18.5-1 .5.5.5.5v50h50s25.6-.6 38-18 12-32 12-32h-50v100H.5S.2 80.7 11.8 68.2 40 49.7 50.5 50.5Z"
                    />
                </svg>

                {/* Loading text */}
                <div className="text-white/50 text-xs tracking-[0.3em] animate-pulse">
                    LOADING
                </div>
            </div>
        </div>
    );
}
