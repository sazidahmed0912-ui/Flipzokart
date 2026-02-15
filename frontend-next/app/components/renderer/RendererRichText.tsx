'use client';

import React from 'react';

export const RendererRichText: React.FC<{ section: any }> = ({ section }) => {
    const { content } = section.props;
    const { paddingTop, paddingBottom, backgroundColor, container } = section.styles;

    if (!content) return null;

    return (
        <section style={{ paddingTop, paddingBottom, backgroundColor }}>
            <div className={container === 'contained' ? 'max-w-[1400px] mx-auto px-4' : 'w-full'}>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </section>
    );
};
