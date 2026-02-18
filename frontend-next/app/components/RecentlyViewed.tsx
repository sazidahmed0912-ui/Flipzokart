"use client";
import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/app/components/ProductCard';
import { Product } from '@/app/types';
import axios from 'axios';

// Normalize MongoDB _id to id for ProductCard compatibility
const normalizeProduct = (p: any): Product => ({
    ...p,
    id: p.id || p._id?.toString() || '',
});

export const RecentlyViewed: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (token) {
                    // Logged in: Fetch from backend
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const res = await axios.get(`${API_URL}/api/user/recently-viewed`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setProducts((res.data || []).map(normalizeProduct));
                } else {
                    // Guest: Fetch from localStorage IDs
                    const viewedIds: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

                    // Filter out invalid IDs (undefined, null, empty strings)
                    const validIds = viewedIds.filter(id =>
                        id &&
                        id !== 'undefined' &&
                        id !== 'null' &&
                        id.length > 10
                    );

                    // Clean up localStorage if there were invalid IDs
                    if (validIds.length !== viewedIds.length) {
                        localStorage.setItem('recentlyViewed', JSON.stringify(validIds));
                    }

                    if (validIds.length > 0) {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                        // Fetch products by IDs
                        const promises = validIds.map(id =>
                            axios.get(`${API_URL}/api/products/${id}`).catch(() => null)
                        );
                        const results = await Promise.all(promises);
                        const validProducts = results
                            .filter((res): res is Exclude<typeof res, null> => res !== null && res.data !== null)
                            .map(res => normalizeProduct(res.data?.data?.product || res.data));
                        setProducts(validProducts);
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch recently viewed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyViewed();
    }, []);

    // Don't render if no products
    if (!loading && products.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 my-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Recently Viewed
            </h2>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-[280px] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {products.slice(0, 5).map((product) => (
                        <ProductCard key={product.id || (product as any)._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};
