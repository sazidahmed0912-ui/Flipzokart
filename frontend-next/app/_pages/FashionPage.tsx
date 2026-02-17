"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Star, ShoppingBag, Folder } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';

// --- Swiper Versions ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Types ---
type Tab = 'Men' | 'Women' | 'Kids';

interface SubmenuGroup {
    name: string;
    products: any[];
}

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

export const FashionPage: React.FC = () => {
    // We will bypass useApp().products for the core logic to ensure FRESH DB data,
    // but we can use it for initial placeholder if needed.
    // Ideally, we fetch fresh data on mount.
    const [activeTab, setActiveTab] = useState<Tab>('Men');
    const [loading, setLoading] = useState(true);

    // Structure: { Men: [{name: 'Blazers', products: [...]}, ...], Women: [], Kids: [] }
    const [hierarchy, setHierarchy] = useState<Record<Tab, SubmenuGroup[]>>({
        Men: [],
        Women: [],
        Kids: []
    });

    useEffect(() => {
        const fetchFashionProducts = async () => {
            try {
                setLoading(true);
                // 1. Fetch ALL Fashion Products (No Cache)
                const { data } = await axios.get('/api/products?category=Fashion', {
                    headers: { 'Cache-Control': 'no-store', 'Pragma': 'no-cache' }
                });

                if (Array.isArray(data)) {
                    const newHierarchy: Record<Tab, SubmenuGroup[]> = { Men: [], Women: [], Kids: [] };

                    // 2. Build Hierarchy
                    // Loop through all products and organize them
                    const tempGroups: Record<string, Record<string, any[]>> = {
                        Men: {}, Women: {}, Kids: {}
                    };

                    data.forEach((p: any) => {
                        const sub = p.subcategory; // "Men", "Women", "Kids"
                        const submenu = p.submenu ? p.submenu.trim() : 'Others'; // "Blazers", "Shirts"

                        if (['Men', 'Women', 'Kids'].includes(sub)) {
                            if (!tempGroups[sub][submenu]) {
                                tempGroups[sub][submenu] = [];
                            }
                            tempGroups[sub][submenu].push(p);
                        }
                    });

                    // 3. Convert to Array Format for Rendering
                    (['Men', 'Women', 'Kids'] as Tab[]).forEach(tab => {
                        const submenus = Object.keys(tempGroups[tab]).map(key => ({
                            name: key,
                            products: tempGroups[tab][key]
                        }));
                        newHierarchy[tab] = submenus;
                    });

                    setHierarchy(newHierarchy);
                }

            } catch (error) {
                console.error("Failed to fetch fashion products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFashionProducts();
    }, []);

    const currentBanner = BANNERS[activeTab];
    const currentSubmenus = hierarchy[activeTab] || [];

    // Prioritize sections with most products? Or just alphabetical? 
    // Let's keep extraction order (usually insertion order of keys) or sort? 
    // Requirement implies "newest" products first in backend, so data order is meaningful.
    // We will render sections in the order they were processed (which tracks insertion mostly).

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* 1. STICKY NAV STRIP */}
            <div className="sticky top-[56px] md:top-[72px] z-20 bg-white shadow-sm border-b border-gray-100">
                <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
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

            {/* 2. SWIPER HERO BANNER */}
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

            {/* 3. DYNAMIC EXPLORE GRID (Submenus) */}
            {/* Show icons for each Submenu found in DB */}
            {currentSubmenus.length > 0 && (
                <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Explore {activeTab}</h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                            {currentSubmenus.map((group, idx) => (
                                <Link
                                    key={idx}
                                    href={`#section-${group.name.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="flex flex-col items-center group scroll-smooth"
                                    onClick={(e) => {
                                        // Optional: Smooth scroll manually if needed, but native anchor works usually.
                                        const el = document.getElementById(`section-${group.name.replace(/\s+/g, '-').toLowerCase()}`);
                                        if (el) {
                                            e.preventDefault();
                                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                >
                                    <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-blue-400 transition-colors flex items-center justify-center">
                                        {/* Use first product's image as Representative Icon for the Submenu */}
                                        {group.products[0]?.mainImage || group.products[0]?.image ? (
                                            <img
                                                src={group.products[0]?.mainImage || group.products[0]?.image}
                                                alt={group.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Folder className="text-gray-300 w-8 h-8" />
                                        )}
                                    </div>
                                    <span className="text-[11px] md:text-sm font-medium text-gray-700 text-center">{group.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. DYNAMIC PRODUCT SECTIONS */}
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-8">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading fashion catalog...</div>
                ) : currentSubmenus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white m-3 rounded-xl border border-dashed text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-500 font-bold">Coming Soon</h3>
                        <p className="text-xs text-gray-400 mt-1">We are stocking up {activeTab}'s collection!</p>
                    </div>
                ) : (
                    currentSubmenus.map((group) => (
                        <section
                            key={group.name}
                            id={`section-${group.name.replace(/\s+/g, '-').toLowerCase()}`}
                            className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm scroll-mt-[180px]"
                        >
                            <div className="flex justify-between items-end mb-3 md:mb-6">
                                <div>
                                    <h3 className="text-sm md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-[#2874F0]" />
                                        {group.name}
                                    </h3>
                                    <p className="text-[10px] md:text-sm text-gray-400">{group.products.length} Products</p>
                                </div>
                                <Link
                                    // Clicking "View All" could go to a filtered Shop page
                                    href={`/shop?category=Fashion&gender=${activeTab}&search=${group.name}`} // Simple hack for now since we don't have strict 'submenu' filter on backend search yet, but 'search' works by name/desc. 
                                    className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5 "
                                >
                                    <ChevronRight size={16} className="md:hidden" />
                                    <span className="hidden md:inline text-sm font-bold">View All</span>
                                </Link>
                            </div>

                            <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 no-scrollbar snap-x">
                                {group.products.slice(0, 10).map((product) => (
                                    <div key={product._id || product.id} className="min-w-[140px] md:min-w-0 snap-start">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
};