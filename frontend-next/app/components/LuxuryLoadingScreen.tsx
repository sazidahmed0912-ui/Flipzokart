import React from 'react';

const LuxuryLoadingScreen: React.FC = () => {
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

                {/* Central "F" Container */}
                <div className="relative group perspective-1000 mb-12">
                    {/* Outer Ring / Subtle Border (Optional, keeping it minimal for now) */}
                    {/* <div className="absolute inset-0 rounded-full border border-white/5 scale-150 opacity-20" /> */}

                    {/* The "F" */}
                    {/* 
                    Styling breakdown:
                    - font-black: Boldest weight
                    - text-8xl: Large size
                    - text-transparent bg-clip-text: Allows gradient text
                    - bg-gradient-to-br: Diagonal light source
                    - from-white via-gray-200 to-gray-500: Metallic/Premium gradient base
                    - drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]: Depth shadow
                    */}
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
                            WebkitTextStroke: '1px rgba(255,255,255,0.1)'
                        }}
                    >
                        F
                    </div>

                    {/* Inner Glow / Reflection effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 bg-clip-text text-transparent opacity-50 blur-[1px]">
                        F
                    </div>
                </div>

                {/* Spinner Container - Below "F" */}
                <div className="relative">
                    {/* Track (Background Circle) */}
                    <div className="w-8 h-8 rounded-full border-2 border-white/5" />

                    {/* Moving Spinner */}
                    <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-t-2 border-r-2 border-primary animate-spin-smooth shadow-[0_0_10px_rgba(255,122,0,0.3)]" />
                </div>
            </div>

            {/* Loading text (Optional, maybe too much?) */}
            {/* <p className="mt-4 text-xs tracking-[0.3em] text-gray-500 uppercase font-light">Loading</p> */}

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes spin-linear {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-smooth {
                    animation: spin-linear 2s linear infinite;
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
