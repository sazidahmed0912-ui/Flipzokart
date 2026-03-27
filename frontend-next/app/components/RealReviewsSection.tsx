"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { SmoothReveal } from '@/app/components/SmoothReveal';

const STAR_COLORS = ['text-orange-400', 'text-orange-400', 'text-orange-400', 'text-orange-400', 'text-orange-300'];

export const RealReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
        axios.get(`${API_URL}/api/reviews/latest?limit=6`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data
                    : Array.isArray(res.data?.reviews) ? res.data.reviews : [];
                setReviews(data);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, []);

    // 120fps-capable GPU-accelerated auto-swipe via delta-time RAF
    useEffect(() => {
        if (!wrapperRef.current || reviews.length === 0) return;

        const wrapper = wrapperRef.current;
        let scrollPos = 0;
        let rafId: number;
        let lastTime: number | null = null;
        const SPEED = 0.09; // px per ms → 90px/sec at any refresh rate (60/90/120fps)

        const cardEl = wrapper.querySelector('.review-card') as HTMLElement | null;
        if (!cardEl) return;

        const cardWidth = cardEl.offsetWidth; // no gap since gap is 0
        const totalCards = wrapper.querySelectorAll('.review-card').length;

        function continuousSwipe(timestamp: number) {
            if (lastTime !== null) {
                const delta = timestamp - lastTime; // ms since last frame
                scrollPos += SPEED * delta; // frame-rate independent speed

                if (scrollPos >= cardWidth * totalCards) {
                    scrollPos = 0; // loop back to start smoothly
                }

                wrapper.scrollLeft = scrollPos;
            }
            lastTime = timestamp;
            rafId = requestAnimationFrame(continuousSwipe);
        }

        rafId = requestAnimationFrame(continuousSwipe);

        return () => cancelAnimationFrame(rafId);
    }, [reviews]);

    if (!loading && reviews.length === 0) return null;

    return (
        <section id="reviewsSection" className="py-12 bg-white">
            <SmoothReveal direction="up" delay={500}>
                <div className="md:max-w-7xl md:mx-auto md:px-4">
                    {/* Section Header */}
                    <div className="text-center mb-10 px-4 md:px-0">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">
                            Customer <span className="text-[#f28c28]">Reviews</span>
                        </h2>
                        <p className="text-gray-500 text-sm">Real reviews from our verified buyers</p>
                    </div>

                    {/* Skeleton */}
                    {loading && (
                        <div className="flex gap-4 overflow-hidden">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-48 min-w-[280px] animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Review Cards — Horizontal Auto-Swipe Row */}
                    {!loading && (
                        <div
                            ref={wrapperRef}
                            className="review-card-wrapper no-scrollbar"
                            style={{
                                display: 'flex',
                                overflowX: 'scroll',
                                gap: '16px',
                            }}
                        >
                            {reviews.map((rev, idx) => {
                                const name: string = rev.user?.name || rev.userName || 'Customer';
                                const rating: number = rev.rating || 5;
                                const comment: string = rev.comment || rev.text || rev.review || '';
                                const product: string = rev.product?.name || rev.productName || '';
                                const initial: string = name.charAt(0).toUpperCase();
                                const avatarColors = [
                                    'bg-orange-100 text-orange-600',
                                    'bg-blue-100 text-blue-600',
                                    'bg-green-100 text-green-600',
                                    'bg-purple-100 text-purple-600',
                                    'bg-pink-100 text-pink-600',
                                    'bg-teal-100 text-teal-600',
                                ];
                                const avatarCls = avatarColors[idx % avatarColors.length];
                                const productId: string = rev.product?._id || rev.product?.id || rev.productId || '';

                                const cardInner = (
                                    <div className={`review-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 relative transition-all duration-200 w-screen md:w-auto md:min-w-[320px] lg:min-w-[360px] ${productId ? 'hover:shadow-lg hover:scale-[1.02] hover:ring-1 hover:ring-orange-200 cursor-pointer' : 'hover:shadow-md'}`} style={{ flexShrink: 0 }}>
                                        {/* Big opening quote */}
                                        <span className="absolute top-4 left-5 text-5xl leading-none text-orange-200 font-serif select-none" aria-hidden>&ldquo;</span>

                                        {/* Stars */}
                                        <div className="flex gap-0.5 mt-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} className={`text-lg ${star <= rating ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                                            ))}
                                        </div>

                                        {/* Review text with marks */}
                                        <p className="text-gray-700 text-sm leading-relaxed flex-1 pl-1">
                                            <span className="text-[#f28c28] font-serif text-lg leading-none mr-0.5">&ldquo;</span>
                                            {comment.length > 180 ? comment.slice(0, 180) + '…' : comment}
                                            <span className="text-[#f28c28] font-serif text-lg leading-none ml-0.5">&rdquo;</span>
                                        </p>

                                        {/* User info */}
                                        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarCls}`}>
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
                                                {product && (
                                                    <p className="text-xs text-[#f28c28] truncate font-medium">
                                                        {productId ? '🔗 ' : ''}on {product}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Verified badge */}
                                            <span className="ml-auto shrink-0 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                ✓ Verified
                                            </span>
                                        </div>
                                    </div>
                                );

                                return (
                                    <div key={rev._id || rev.id || idx}>
                                        {productId ? (
                                            <Link href={`/product/${productId}`} className="block">
                                                {cardInner}
                                            </Link>
                                        ) : (
                                            cardInner
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SmoothReveal>
        </section>
    );
};
