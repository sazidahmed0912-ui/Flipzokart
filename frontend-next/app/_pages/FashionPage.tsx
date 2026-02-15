"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Star, ShoppingBag } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import { fetchCategoryTree } from '@/app/services/categoryService';


// --- Swiper Versions ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Types ---
type Tab = 'Men' | 'Women' | 'Kids';

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

// --- Mock Data (Strict Real Images) ---
const BANNERS: Record<Tab, BannerConfig> = {
    Men: {
        title: "Men's Summer Collection",
        images: [
            "https://res.cloudinary.com/drfyr8hlb/image/upload/f_auto,q_auto,w_1600/v1771138164/Men_s_Summer_Collection_ygcqln.jpg",
            "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169316/WhatsApp_Image_2026-02-15_at_8.55.41_PM_utjlhk.jpg"
        ],
        link: "/shop?category=Fashion&gender=Men"
    },
    Women: {
        title: "Women's Ethnic Wear",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600"
        ],
        link: "/shop?category=Fashion&gender=Women"
    },
    Kids: {
        title: "Kids Party Wear",
        images: [
            "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1600",
            "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169942/WhatsApp_Image_2026-02-15_at_9.07.12_PM_usbnjn.jpg"
        ],
        link: "/shop?category=Fashion&gender=Kids"
    }
};

// --- Dynamic Data State ---
export const FashionPage: React.FC = () => {
    const { products } = useApp();
    const [fashionCategory, setFashionCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<string>('Men');

    // Fetch Dynamic Tree
    useEffect(() => {
        const loadPyramid = async () => {
            try {
                const tree = await fetchCategoryTree();
                const fashion = tree.find(c => c.name === 'Fashion');

                if (fashion) {
                    setFashionCategory(fashion);
                    // Default to first subcategory if Men not found, or keep Men if exists
                    const hasMen = fashion.subcategories.some((s: any) => s.name === 'Men');
                    if (!hasMen && fashion.subcategories.length > 0) {
                        setActiveTab(fashion.subcategories[0].name);
                    }
                }
            } catch (err) {
                console.error("Dynamic Sync Failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadPyramid();
    }, []);

    // Derived Data
    const availableTabs = fashionCategory?.subcategories?.map((s: any) => s.name) || ['Men', 'Women', 'Kids'];

    // Get current subcategory (Level 2) -> to get its submenu (Level 3)
    const currentSubcat = fashionCategory?.subcategories?.find((s: any) => s.name === activeTab);
    const displayGrid = currentSubcat?.submenu || [];

    // Fallback for static banners (DB doesn't have subcategory banners yet)
    // We map activeTab name to existing BANNERS key if possible, else default
    const bannerKey = (activeTab in BANNERS) ? activeTab as Tab : 'Men';
    const currentBanner = BANNERS[bannerKey] || BANNERS['Men'];

    // Filter Products based on Tab
    const tabProducts = products.filter(p =>
        p.category === 'Fashion' ||
        p.name.toLowerCase().includes(activeTab.toLowerCase()) ||
        p.description.toLowerCase().includes(activeTab.toLowerCase())
    );

    const trendingProducts = tabProducts.slice(0, 8);
    const bestOfProducts = tabProducts.slice(8, 16);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* 1. STICKY NAV STRIP */}
            <div className="sticky top-[56px] md:top-[72px] z-20 bg-white shadow-sm border-b border-gray-100">
                <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
                    <div className="flex w-full overflow-x-auto no-scrollbar">
                        {availableTabs.map((tab: string) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    relative flex-1 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wide text-center transition-all duration-200 outline-none select-none whitespace-nowrap px-4
                                    ${activeTab === tab
                                        ? 'text-black bg-gradient-to-b from-white to-yellow-50'
                                        : 'text-gray-600 hover:text-black hover:bg-yellow-50'
                                    }
                                `}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {tab}
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

            {/* 2. SWIPER HERO BANNER (ULTRA LOCK FIX) */}
            <div className="w-full h-[220px] md:h-[420px] lg:h-[420px] xl:h-[520px] 2xl:h-[580px] bg-gray-100 overflow-hidden lg:max-w-[1400px] xl:max-w-[1500px] mx-auto rounded-none lg:rounded-2xl lg:mt-4 lg:shadow-xl relative">
                <Swiper
                    key={activeTab} // Force re-render on activeTab change
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true} // Infinite loop
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false
                    }}
                    pagination={{ clickable: true }}
                    observer={true}
                    observeParents={true}
                    className="w-full h-full"
                >
                    {currentBanner.images.map((img, index) => (
                        <SwiperSlide key={`${activeTab}-${index}`}>
                            <div className="relative w-full h-full">
                                {/* PURE IMG TAG to avoid Next.js Image lifestyle conflicts in Swiper */}
                                <img
                                    src={img}
                                    alt={`${currentBanner.title} - Slide ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:p-12 pointer-events-none">
                                    <div className="text-white pointer-events-auto max-w-[600px] lg:max-w-[800px]">
                                        <h2 className="text-xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-1 md:mb-3 lg:mb-4">{currentBanner.title}</h2>
                                        <Link
                                            href={currentBanner.link}
                                            className="text-xs md:text-base lg:text-lg font-semibold bg-white text-black px-3 py-1.5 md:px-6 md:py-2.5 lg:px-8 lg:py-3 rounded-full inline-flex items-center gap-1 hover:bg-opacity-90 transition-transform hover:scale-105 shadow-lg"
                                        >
                                            Shop Now <ChevronRight size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* 3. RESPONSIVE SUBCATEGORY GRID (Flipkart Style) */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Explore {activeTab}</h3>

                    {loading ? (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                            {displayGrid.length > 0 ? (
                                displayGrid.map((sub: any, idx: number) => (
                                    <Link key={idx} href={`/shop?category=Fashion&sub=${sub.slug}`} className="flex flex-col items-center group">
                                        <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-blue-400 transition-colors">
                                            {sub.icon ? (
                                                <img
                                                    src={sub.icon}
                                                    alt={sub.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] md:text-sm font-medium text-gray-700 text-center">{sub.name}</span>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                                    No categories found in {activeTab}
                                </div>
                            )}
                        </div>
                    )}
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