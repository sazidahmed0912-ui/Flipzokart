"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Filter, TrendingUp, Star, ShoppingBag } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import LazyImage from '@/app/components/LazyImage';
import { SmoothReveal } from '@/app/components/SmoothReveal';

// --- Types ---
type Tab = 'Men' | 'Women' | 'Kids';

// --- Mock Data ---
const BANNERS: Record<Tab, { id: number; image: string; title: string; link: string }[]> = {
    Men: [
        { id: 1, image: "https://res.cloudinary.com/drfyr8hlb/image/upload/f_auto,q_auto,w_1600/v1771138164/Men_s_Summer_Collection_ygcqln.jpg", title: "Men's Summer Collection", link: "/shop?category=Fashion&gender=Men" },
        { id: 2, image: "https://images.unsplash.com/photo-1617137968427-85924c809a10?auto=format&fit=crop&q=80&w=1000", title: "Formal Wear Sale", link: "/shop?category=Fashion&gender=Men" },
    ],
    Women: [
        { id: 1, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000", title: "Women's Ethnic Wear", link: "/shop?category=Fashion&gender=Women" },
        { id: 2, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000", title: "Trending Dresses", link: "/shop?category=Fashion&gender=Women" },
    ],
    Kids: [
        { id: 1, image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1000", title: "Kids Party Wear", link: "/shop?category=Fashion&gender=Kids" },
        { id: 2, image: "https://images.unsplash.com/photo-1503919545889-aef6d293c94c?auto=format&fit=crop&q=80&w=1000", title: "Cute Outfits", link: "/shop?category=Fashion&gender=Kids" },
    ]
};

const SUBCATEGORIES: Record<Tab, { name: string; icon: string; link: string }[]> = {
    Men: [
        { name: "Shirts", icon: "https://images.unsplash.com/photo-1620799140408-ed5341cd2458?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Shirts" },
        { name: "T-Shirts", icon: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=TShirts" },
        { name: "Jeans", icon: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Jeans" },
        { name: "Shoes", icon: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Shoes" },
        { name: "Watches", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Watches" },
        { name: "Activewear", icon: "https://images.unsplash.com/photo-1517466787929-bc90951d6dbb?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Activewear" },
    ],
    Women: [
        { name: "Kurti", icon: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Kurti" },
        { name: "Saree", icon: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Saree" },
        { name: "Dresses", icon: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Dresses" },
        { name: "Handbags", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Handbags" },
        { name: "Heels", icon: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Heels" },
        { name: "Jewelry", icon: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Jewelry" },
    ],
    Kids: [
        { name: "Boys Wear", icon: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Boys" },
        { name: "Girls Wear", icon: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Girls" },
        { name: "Kids Shoes", icon: "https://images.unsplash.com/photo-1514989940723-e8872778802d?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=KidsShoes" },
        { name: "Toys", icon: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Toys" },
        { name: "School Bags", icon: "https://images.unsplash.com/photo-1588058365815-c9692dd15949?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Bags" },
        { name: "Accessories", icon: "https://images.unsplash.com/photo-1614030636278-f77d33b497cb?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Fashion&sub=Accessories" },
    ]
};

export const FashionPage: React.FC = () => {
    const { products } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('Men');
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Filter Products based on Tab (Basic filtering logic for demo)
    // accessible via search terms or category matching
    const tabProducts = products.filter(p =>
        p.category === 'Fashion' ||
        p.name.toLowerCase().includes(activeTab.toLowerCase()) ||
        p.description.toLowerCase().includes(activeTab.toLowerCase())
    );

    const trendingProducts = tabProducts.slice(0, 8); // Mock trending
    const bestOfProducts = tabProducts.slice(8, 16); // Mock best of

    // Reset banner on tab change
    useEffect(() => {
        setCurrentBannerIndex(0);
    }, [activeTab]);

    // Auto-slide banner
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % BANNERS[activeTab].length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeTab]);

    // Swipe handlers
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (distance > 50) {
            setCurrentBannerIndex(prev => (prev + 1) % BANNERS[activeTab].length);
        } else if (distance < -50) {
            setCurrentBannerIndex(prev => (prev - 1 + BANNERS[activeTab].length) % BANNERS[activeTab].length);
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* 1. STICKY NAV STRIP */}
            <div className="sticky top-[56px] md:top-[72px] z-20 bg-white shadow-sm border-b border-gray-100">
                <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
                    {/* Premium Tabs */}
                    <div className="flex w-full">
                        {(['Men', 'Women', 'Kids'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    relative flex-1 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wide text-center transition-all duration-200 outline-none select-none
                                    ${activeTab === tab
                                        ? 'text-black bg-gradient-to-b from-white to-yellow-50'
                                        : 'text-gray-600 hover:text-black hover:bg-yellow-50'
                                    }
                                `}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {tab}

                                {/* Active Indicator (Sliding) */}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#FACC15] shadow-[0_-2px_6px_rgba(250,204,21,0.4)]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. HERO BANNER CAROUSEL */}
            <div
                className="relative w-full h-[180px] md:h-[400px] overflow-hidden bg-gray-200 group touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={`${activeTab}-${currentBannerIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <LazyImage
                            src={BANNERS[activeTab][currentBannerIndex].image}
                            alt={BANNERS[activeTab][currentBannerIndex].title}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:p-12">
                            <div className="text-white">
                                <h2 className="text-xl md:text-5xl font-bold mb-1 md:mb-3">{BANNERS[activeTab][currentBannerIndex].title}</h2>
                                <Link
                                    href={BANNERS[activeTab][currentBannerIndex].link}
                                    className="text-xs md:text-base font-semibold bg-white text-black px-3 py-1.5 md:px-6 md:py-2.5 rounded-full inline-flex items-center gap-1 hover:bg-opacity-90 transition-colors"
                                >
                                    Shop Now <ChevronRight size={12} className="md:w-4 md:h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Banner Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {BANNERS[activeTab].map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all ${idx === currentBannerIndex ? 'w-4 bg-white' : 'w-1 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* 3. SUBCATEGORY GRID */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Explore {activeTab}</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                        {SUBCATEGORIES[activeTab].map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-blue-400 transition-colors">
                                    <LazyImage
                                        src={sub.icon}
                                        alt={sub.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                    />
                                </div>
                                <span className="text-[10px] md:text-sm font-medium text-gray-700 text-center">{sub.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. PRODUCT SHOWCASE SECTIONS */}
            <div className="max-w-7xl mx-auto spaee-y-4 md:space-y-8 pb-8">

                {/* Trending Section */}
                {trendingProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-end mb-3 md:mb-6">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-[#2874F0]" />
                                    Trending in {activeTab}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Fresh styles just for you</p>
                            </div>
                            <Link href={`/shop?category=Fashion&gender=${activeTab}&sort=newest`} className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5 ">
                                <ChevronRight size={16} className="md:hidden" />
                                <span className="hidden md:inline text-sm font-bold">View All</span>
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                            {trendingProducts.map((product) => (
                                <div key={product.id} className="min-w-[140px] md:min-w-0 snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Best Of Section */}
                {bestOfProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-end mb-3 md:mb-6">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-500" />
                                    Best of {activeTab}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Top rated by customers</p>
                            </div>
                            <Link href={`/shop?category=Fashion&gender=${activeTab}&sort=rating`} className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5 ">
                                <ChevronRight size={16} className="md:hidden" />
                                <span className="hidden md:inline text-sm font-bold">View All</span>
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                            {bestOfProducts.map((product) => (
                                <div key={product.id} className="min-w-[140px] md:min-w-0 snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Fallback if no products */}
                {tabProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white m-3 rounded-xl border border-dashed text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-500 font-bold">Coming Soon</h3>
                        <p className="text-xs text-gray-400 mt-1">We are stocking up {activeTab}'s collection!</p>
                    </div>
                )}

            </div>
        </div>
    );
};
