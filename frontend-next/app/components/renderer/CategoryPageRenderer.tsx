'use client';

import React from 'react';
import { RendererHero } from './RendererHero';
import { RendererProductSlider } from './RendererProductSlider';
import { RendererGrid } from './RendererGrid';
import { RendererBannerStrip } from './RendererBannerStrip';
import { RendererRichText } from './RendererRichText';

interface Section {
    id: string;
    type: string;
    props: any;
    styles: any;
    visibility: { mobile: boolean; desktop: boolean };
}

export const CategoryPageRenderer: React.FC<{ layout: Section[] }> = ({ layout }) => {
    if (!layout || layout.length === 0) return null;

    return (
        <div className="flex flex-col">
            {layout.map(section => (
                <div key={section.id} className={`
                    ${section.visibility.mobile ? 'block' : 'hidden md:block'}
                    ${section.visibility.desktop ? 'md:block' : 'md:hidden'}
                `}>
                    {section.type === 'hero' && <RendererHero section={section} />}
                    {section.type === 'product-slider' && <RendererProductSlider section={section} />}
                    {section.type === 'grid' && <RendererGrid section={section} />}
                    {section.type === 'banner-strip' && <RendererBannerStrip section={section} />}
                    {section.type === 'text' && <RendererRichText section={section} />}
                </div>
            ))}
        </div>
    );
};
