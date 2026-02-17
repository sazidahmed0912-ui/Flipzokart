"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ChevronRight, Star, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '@/app/store/Context'; // Assuming Context access
import { ProductCard } from '@/app/components/ProductCard'; // Reusing your existing component
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- DATA CONSTANTS ---

// 1. Hero Banner Data
const HERO_BANNER = {
    title: "Beauty Essentials",
    subtitle: "Glow Needs No Filter",
    cta: "Shop Now",
    // Unsplash Beauty Images (High Quality)
    images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1600&auto=format&fit=crop", // Makeup/Skincare Spread
        "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1600&auto=format&fit=crop", // Skincare Bottles
        "https://images.unsplash.com/photo-1522335789203-abd1ac5fd425?q=80&w=1600&auto=format&fit=crop"  // Spa/Relax
    ]
};

// 2. Subcategories Data (Strict List)
const BEAUTY_CATEGORIES = [
    { name: "Skincare", image: "https://images.unsplash.com/photo-1570172619643-c3912166d494?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Skincare" },
    { name: "Makeup", image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Makeup" },
    { name: "Hair Care", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Hair Care" },
    { name: "Fragrance", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Fragrance" },
    { name: "Bath & Body", image: "https://images.unsplash.com/photo-1542384557-0e1dcbef43f0?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Bath & Body" },
    { name: "Beauty Tools", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&sub=Beauty Tools" }
];

export const BeautyPage = () => {
    const { products } = useApp(); // Fallback to Context if API fails
    const [mounted, setMounted] = useState(false);
    const [beautyProducts, setBeautyProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchRandomBeautyProducts();
    }, []);

    const fetchRandomBeautyProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/products/random/Beauty?limit=20', {
                headers: { 'Cache-Control': 'no-store' }
            });
            setBeautyProducts(res.data);
        } catch (error) {
            console.warn('Random API not available yet, using Context fallback:', error);
            // FALLBACK: Use Context products
            const contextBeauty = products.filter(p => p.category === 'Beauty' || p.category === 'beauty');
            setBeautyProducts(contextBeauty.length > 0 ? contextBeauty : products.slice(0, 10));
        } finally {
            setLoading(false);
        }
    };

    // Specific Lists
    const displayProducts = beautyProducts;
    const trendingProducts = [...displayProducts].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0)).slice(0, 8);
    const bestOfBeauty = [...displayProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. HERO BANNER */}
            {/* Mobile: 180-220px | Desktop 420-520px */}
            <div className="w-full h-[200px] md:h-[300px] lg:h-[420px] xl:h-[500px] bg-gray-200 relative overflow-hidden group">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    loop={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="w-full h-full"
                >
                    {HERO_BANNER.images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="relative w-full h-full">
                                <img
                                    src={img}
                                    alt={`Beauty Banner ${idx + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-black/20 md:bg-black/10"></div> {/* Subtle Overlay */}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Text Overlay (Centered) */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-lg mb-2 md:mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {HERO_BANNER.title}
                    </h1>
                    <p className="text-sm md:text-xl text-white/90 font-medium mb-4 md:mb-8 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        {HERO_BANNER.subtitle}
                    </p>
                    <Link
                        href="/shop?category=Beauty"
                        className="pointer-events-auto bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider hover:scale-105 hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in duration-500 delay-200"
                    >
                        {HERO_BANNER.cta}
                    </Link>
                </div>
            </div>

            {/* 2. SUBCATEGORY GRID (CRITICAL) */}
            {/* Mobile: 3 cols | Desktop: 6 cols */}
            <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-pink-500" size={20} />
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 uppercase tracking-wide">Shop by Category</h2>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-8">
                    {BEAUTY_CATEGORIES.map((cat, idx) => (
                        <Link
                            key={idx}
                            href={cat.link}
                            className="group flex flex-col items-center gap-3"
                        >
                            <div className="w-full aspect-square relative rounded-full md:rounded-2xl overflow-hidden border border-gray-100 shadow-sm md:shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 bg-white">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-pink-600 transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 3. TRENDING IN BEAUTY */}
            <div className="bg-white py-8 md:py-12 border-t border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-purple-500" size={20} />
                            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Trending in Beauty</h2>
                        </div>
                        <Link href="/shop?category=Beauty" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                    {trendingProducts.length > 0 ? (
                        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 md:pb-0 md:mx-0 md:px-0 scrollbar-hide snap-x">
                            {trendingProducts.map((product) => (
                                <div key={product.id} className="min-w-[160px] max-w-[160px] md:min-w-0 md:max-w-none snap-start mr-3 md:mr-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyStateSection title="Trending Products" />
                    )}
                </div>
            </div>

            {/* 4. BEST OF BEAUTY */}
            <div className="py-8 md:py-12">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="text-yellow-500 fill-yellow-500" size={20} />
                            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Best of Beauty</h2>
                        </div>
                        <Link href="/shop?category=Beauty" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                    {bestOfBeauty.length > 0 ? (
                        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 md:pb-0 md:mx-0 md:px-0 scrollbar-hide snap-x">
                            {bestOfBeauty.map((product) => (
                                <div key={product.id} className="min-w-[160px] max-w-[160px] md:min-w-0 md:max-w-none snap-start mr-3 md:mr-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyStateSection title="Best Rated Products" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper: Empty State
const EmptyStateSection = ({ title }: { title: string }) => (
    <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <ShoppingBag className="text-gray-300 mb-2" size={32} />
        <p className="text-sm text-gray-400 font-medium">Coming Soon in {title}</p>
    </div>
);
