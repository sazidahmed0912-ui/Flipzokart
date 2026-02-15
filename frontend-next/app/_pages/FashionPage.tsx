"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Star, ShoppingBag } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';


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
            "https://images.unsplash.com/photo-1593030761757-71bd90dbe3e4?q=80&w=1600&auto=format&fit=crop"
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
            "https://images.unsplash.com/photo-1622290291314-883f94739770?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Fashion&gender=Kids"
    }
};

const INITIAL_SUBCATEGORIES: Record<Tab, { name: string; icon: string; link: string }[]> = {
    Men: [
        { name: "Shirts", icon: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Shirts" },
        { name: "T-Shirts", icon: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=TShirts" },
        { name: "Jeans", icon: "https://images.unsplash.com/photo-1542272617-08f086303294?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Jeans" },
        { name: "Shoes", icon: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Shoes" },
        { name: "Watches", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Watches" },
        { name: "Activewear", icon: "https://images.unsplash.com/photo-1517466787929-bc90951d6dbb?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Activewear" },
    ],
    Women: [
        { name: "Kurti", icon: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Kurti" },
        { name: "Saree", icon: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Saree" },
        { name: "Dresses", icon: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Dresses" },
        { name: "Handbags", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Handbags" },
        { name: "Heels", icon: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Heels" },
        { name: "Jewelry", icon: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Jewelry" },
    ],
    Kids: [
        { name: "Boys Wear", icon: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Boys" },
        { name: "Girls Wear", icon: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Girls" },
        { name: "Kids Shoes", icon: "https://images.unsplash.com/photo-1514989940723-e8872778802d?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=KidsShoes" },
        { name: "Toys", icon: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Toys" },
        { name: "School Bags", icon: "https://images.unsplash.com/photo-1588058365815-c9692dd15949?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Bags" },
        { name: "Accessories", icon: "https://images.unsplash.com/photo-1614030636278-f77d33b497cb?auto=format&fit=crop&q=80&w=300", link: "/shop?category=Fashion&sub=Accessories" },
    ]
};

export const FashionPage: React.FC = () => {
    const { products } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('Men');
    const [subcategories, setSubcategories] = useState(INITIAL_SUBCATEGORIES);

    // Fetch dynamic subcategory icons (optional enhancement, kept for backward compat)
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('/api/content/categories/fashion');
                if (res.data && res.data.subcategories) {
                    const dbSubcats = res.data.subcategories;

                    setSubcategories(prev => {
                        const next = { ...prev };
                        (['Men', 'Women', 'Kids'] as Tab[]).forEach(tab => {
                            next[tab] = next[tab].map(item => {
                                // Find match in DB
                                const slug = item.name.toLowerCase().replace(/ /g, '-');
                                const match = dbSubcats.find((s: any) => s.slug === slug);
                                if (match && match.iconUrl) {
                                    return { ...item, icon: match.iconUrl };
                                }
                                return item;
                            });
                        });
                        return next;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch fashion content", error);
            }
        };
        fetchContent();
    }, []);

    // Filter Products based on Tab
    const tabProducts = products.filter(p =>
        p.category === 'Fashion' ||
        p.name.toLowerCase().includes(activeTab.toLowerCase()) ||
        p.description.toLowerCase().includes(activeTab.toLowerCase())
    );

    const trendingProducts = tabProducts.slice(0, 8);
    const bestOfProducts = tabProducts.slice(8, 16);

    const currentBanner = BANNERS[activeTab];

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

            {/* 2. SWIPER HERO BANNER (ULTRA LOCK FIX) */}
            <div className="w-full h-[220px] md:h-[420px] bg-gray-100 overflow-hidden">
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
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:p-12 pointer-events-none">
                                    <div className="text-white pointer-events-auto">
                                        <h2 className="text-xl md:text-5xl font-bold mb-1 md:mb-3">{currentBanner.title}</h2>
                                        <Link
                                            href={currentBanner.link}
                                            className="text-xs md:text-base font-semibold bg-white text-black px-3 py-1.5 md:px-6 md:py-2.5 rounded-full inline-flex items-center gap-1 hover:bg-opacity-90 transition-colors"
                                        >
                                            Shop Now <ChevronRight size={12} className="md:w-4 md:h-4" />
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
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                        {subcategories[activeTab].map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-blue-400 transition-colors">
                                    <img
                                        src={sub.icon}
                                        alt={sub.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-[11px] md:text-sm font-medium text-gray-700 text-center">{sub.name}</span>
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