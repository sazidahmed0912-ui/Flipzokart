'use client';

import React from 'react';

export const RendererGrid: React.FC<{ section: any }> = ({ section }) => {
    const { columns } = section.props;
    const { paddingTop, paddingBottom, backgroundColor, container } = section.styles;

    return (
        <section style={{ paddingTop, paddingBottom, backgroundColor }}>
            <div className={container === 'contained' ? 'max-w-[1400px] mx-auto px-4' : 'w-full'}>
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns || 3}, 1fr)` }}>
                    {/* Placeholder for dynamic grid items if added later */}
                    {[...Array(Number(columns || 3))].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-medium">
                            Category Grid Item {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
