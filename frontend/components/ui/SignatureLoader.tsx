import React from 'react';

const SignatureLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] to-[#E6F0FF]">
            {/* 
        GLASSMORPHISM CARD 
        - Backdrop blur
        - Subtle border
        - Soft shadow
      */}
            <div
                className="
          relative flex flex-col items-center justify-center 
          w-32 h-32 md:w-40 md:h-40 
          bg-white/10 backdrop-blur-xl 
          border border-white/40 
          rounded-[24px] 
          shadow-[0_20px_60px_rgba(0,0,0,0.1)]
          animate-fade-in-up
        "
            >
                {/* BRANDING "F" */}
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mb-4 animate-breathe">
                    <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2874F0] to-[#5C94F8] drop-shadow-sm pb-2">
                        F
                    </div>
                </div>

                {/* SPINNER */}
                <div className="absolute bottom-6 md:bottom-8">
                    <div className="w-6 h-6 border-2 border-[#2874F0]/20 border-t-[#2874F0] rounded-full animate-spin-slow"></div>
                </div>
            </div>

            {/* Background Ambience (Optional) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10"></div>
        </div>
    );
};

export default SignatureLoader;
