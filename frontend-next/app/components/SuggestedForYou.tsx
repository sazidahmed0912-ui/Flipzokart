"use client";
import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/app/components/ProductCard';
import { Product } from '@/app/types';
import axios from 'axios';
import { useApp } from '@/app/store/Context';

// Normalize MongoDB _id to id for ProductCard compatibility
const normalizeProduct = (p: any): Product => ({
    ...p,
    id: p.id || p._id?.toString() || '',
});

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
                // Fallback: empty or could use Context products
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggested();
    }, [user]); // Re-fetch when user changes (login/logout)

    // Don't render if no products
    if (!loading && products.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 my-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Suggested For You
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
