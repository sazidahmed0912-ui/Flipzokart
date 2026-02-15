"use client";

import React from 'react';
import Image from 'next/image';

interface MensSummerBannerProps {
    activeTab: string;
}

export const MensSummerBanner: React.FC<MensSummerBannerProps> = ({ activeTab }) => {
    // 1. CONDITIONAL RENDERING: Strict check for 'Men' tab
    if (activeTab !== 'Men') return null;

    return (
        // 2. RESPONSIVE CONTAINER
        <div className="w-full px-0 md:px-0 lg:px-4 mb-4 md:mb-8">
            <div className="relative w-full overflow-hidden rounded-[12px] md:rounded-[14px] lg:rounded-[16px]">
                {/* 3. RESPONSIVE IMAGE */}
                <Image
                    src="/images/men_summer_collection.jpg"
                    alt="Men's Summer Collection"
                    width={1920}
                    height={460}
                    priority={true} // 4. PERFORMANCE: LCP Priority
                    quality={85}
                    sizes="100vw"
                    className="
                        w-full
                        object-cover
                        h-[220px] object-[75%_center]
                        md:h-[320px] md:object-[70%_center]
                        lg:h-[460px] lg:object-center
                    "
                />
            </div>
        </div>
    );
};
