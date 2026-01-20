import React from 'react';

const SignatureLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent pointer-events-none">
            {/* 
        GLASSMORPHISM CONTAINER
        - "Frosted glass" (backdrop-blur-14px)
        - White translucent layer (6–8% opacity)
        - Rounded corners: 24px
        - Soft static shadow
      */}
            <div
                className="
          flex flex-col items-center justify-center 
          w-32 h-32 md:w-40 md:h-40 
          bg-white/10 backdrop-blur-[14px] 
          border border-white/20 
          rounded-[24px] 
          shadow-[0_20px_60px_rgba(0,0,0,0.15)]
          pointer-events-auto
        "
            >
                {/* 
          BRANDING "F" - STATIC 
          - Completely STATIC
          - No animation, no transform, no hover
          - Gradient fill (Flipkart blue tones)
          - Slight 3D depth, soft inner glow
        */}
                <div className="relative mb-4">
                    <div
                        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2874F0] to-[#5C94F8] pb-2"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(40, 116, 240, 0.2))' }}
                    >
                        F
                    </div>
                </div>

                {/* 
          SPINNER - ANIMATED
          - Placed directly UNDER "F"
          - Perfect circle
          - Thin stroke (1.5px–2px)
          - CSS-only animation (spin)
          - Linear timing, constant speed
        */}
                <div className="w-6 h-6 border-2 border-[#2874F0]/20 border-t-[#2874F0] rounded-full animate-spin-linear"></div>
            </div>
        </div>
    );
};

export default SignatureLoader;
