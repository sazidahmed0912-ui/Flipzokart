'use client';

import React from 'react';
import Link from 'next/link';
import LazyImage from '@/app/components/LazyImage';

export const RendererBannerStrip: React.FC<{ section: any }> = ({ section }) => {
    const { imageUrl, link } = section.props;
    const { paddingTop, paddingBottom, backgroundColor, container } = section.styles;

    if (!imageUrl) return null;

    const Content = (
        <div className="relative w-full h-[80px] md:h-[120px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <LazyImage src={imageUrl} alt="Offer" fill className="object-cover" />
        </div>
    );

    return (
        <section style={{ paddingTop, paddingBottom, backgroundColor }}>
            <div className={container === 'contained' ? 'max-w-[1400px] mx-auto px-4' : 'w-full'}>
                {link ? <Link href={link}>{Content}</Link> : Content}
            </div>
        </section>
    );
};
