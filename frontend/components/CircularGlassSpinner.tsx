import React from 'react';

export default function CircularGlassSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md animate-pulse"></div>

                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 shadow-xl">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background:
                                    'conic-gradient(from 0deg, transparent 0deg, rgba(147, 51, 234, 0.3) 90deg, transparent 180deg)',
                            }}
                        ></div>

                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/80 border-r-blue-300/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="text-5xl font-bold text-white select-none"
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            textShadow:
                                '0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(147,51,234,0.4)',
                            fontWeight: '900',
                        }}
                    >
                        f
                    </span>
                </div>

                <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: '3s', animationDirection: 'reverse' }}
                >
                    <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px] -translate-x-1/2 shadow-[0_0_8px_rgba(147,197,253,0.8)]"></div>
                    <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full blur-[1px] translate-x-1/2 shadow-[0_0_8px_rgba(216,180,254,0.8)]"></div>
                </div>
            </div>

            <div className="absolute mt-32 text-white/50 text-xs tracking-[0.3em] animate-pulse">
                LOADING
            </div>
        </div>
    );
}
