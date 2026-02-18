"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/app/components/ProductCard';
import { Product } from '@/app/types';
import axios from 'axios';
import { useApp } from '@/app/store/Context';
import { getProductImage } from '@/app/utils/imageHelper';

// Normalize MongoDB _id to id for ProductCard compatibility
const normalizeProduct = (p: any): Product => ({
    ...p,
    id: p.id || p._id?.toString() || '',
});

// Compact card for mobile horizontal swipe
const CompactCard: React.FC<{ product: Product }> = ({ product }) => {
    const imgSrc = getProductImage(product);
    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <Link
            href={`/product/${product.id}`}
            className="flex-none w-[30vw] max-w-[120px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform"
            style={{ scrollSnapAlign: 'start' }}
        >
            <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center p-1.5">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                />
                {discount > 0 && (
                    <span className="absolute top-1 left-1 bg-[#f5a623] text-white text-[8px] font-bold px-1 py-0.5 rounded">
                        {discount}%
                    </span>
                )}
            </div>
            <div className="p-1.5">
                <p className="text-[10px] font-semibold text-gray-800 line-clamp-2 leading-tight mb-0.5">{product.name}</p>
                <p className="text-[11px] font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                {product.originalPrice > product.price && (
                    <p className="text-[9px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                )}
            </div>
        </Link>
    );
};

export const SuggestedForYou: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useApp();

    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                setLoading(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                const headers: any = { 'Cache-Control': 'no-store' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await axios.get(`${API_URL}/api/products/suggested?limit=5`, {
                    headers
                });

                setProducts((res.data || []).map(normalizeProduct));
            } catch (error) {
                console.warn('Failed to fetch suggested products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggested();
    }, [user]);

    if (!loading && products.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 my-6">
            <h2 className="text-base sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Suggested For You
            </h2>

            {loading ? (
                <>
                    {/* Mobile skeleton */}
                    <div className="flex gap-2 sm:hidden overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-none w-[30vw] max-w-[120px] bg-gray-100 rounded-xl h-[160px] animate-pulse" />
                        ))}
                    </div>
                    {/* Desktop skeleton */}
                    <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-xl h-[280px] animate-pulse" />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Mobile: horizontal swipe, 3 visible, 1 row only */}
                    <div
                        className="flex gap-2 sm:hidden overflow-x-auto pb-1"
                        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                    >
                        {products.slice(0, 5).map((product) => (
                            <CompactCard key={product.id || (product as any)._id} product={product} />
                        ))}
                    </div>
                    {/* Desktop: normal grid */}
                    <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {products.slice(0, 5).map((product) => (
                            <ProductCard key={product.id || (product as any)._id} product={product} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
