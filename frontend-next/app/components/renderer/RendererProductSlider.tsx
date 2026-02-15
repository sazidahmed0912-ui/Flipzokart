'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/app/components/ProductCard';
import { useApp } from '@/app/store/Context';

export const RendererProductSlider: React.FC<{ section: any }> = ({ section }) => {
    const { title, source, limit } = section.props;
    const { paddingTop, paddingBottom, backgroundColor, container } = section.styles;
    const { products } = useApp();

    const displayProducts = useMemo(() => {
        let filtered = [...products];
        if (source === 'trending') {
            filtered = filtered.sort((a, b) => b.rating - a.rating); // Mock trending by rating
        } else if (source === 'new_arrivals') {
            filtered = filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        } else if (source === 'best_sellers') {
            filtered = filtered.filter(p => p.reviewsCount > 50); // Mock best sellers
        }
        return filtered.slice(0, limit || 8);
    }, [products, source, limit]);

    if (displayProducts.length === 0) return null;

    return (
        <section style={{ paddingTop, paddingBottom, backgroundColor }}>
            <div className={container === 'contained' ? 'max-w-[1400px] mx-auto px-4' : 'w-full'}>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
                    <Link href="/shop" className="text-blue-600 font-bold hover:underline">View All</Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                    {displayProducts.map(product => (
                        <div key={product.id} className="min-w-[200px] md:min-w-[280px] snap-center">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
