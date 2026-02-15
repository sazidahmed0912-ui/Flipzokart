"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, Star, ShoppingBag } from "lucide-react";
import { useApp } from "@/app/store/Context";
import { ProductCard } from "@/app/components/ProductCard";
import LazyImage from "@/app/components/LazyImage";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Tab = "Men" | "Women" | "Kids";

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

const BANNERS: Record<Tab, BannerConfig> = {
    Men: {
        title: "Men's Summer Collection",
        images: [
            "https://res.cloudinary.com/drfyr8hlb/image/upload/f_auto,q_auto,w_1600/v1771138164/Men_s_Summer_Collection_ygcqln.jpg",
            "https://images.unsplash.com/photo-1593030761757-71bd90dbe3e4?q=80&w=1600&auto=format&fit=crop",
        ],
        link: "/shop?category=Fashion&gender=Men",
    },
    Women: {
        title: "Women's Ethnic Wear",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
        ],
        link: "/shop?category=Fashion&gender=Women",
    },
    Kids: {
        title: "Kids Party Wear",
        images: [
            "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1622290291314-883f94739770?q=80&w=1600&auto=format&fit=crop",
        ],
        link: "/shop?category=Fashion&gender=Kids",
    },
};

export const FashionPage: React.FC = () => {
    const { products } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>("Men");

    const tabProducts = products.filter(
        (p) =>
            p.category === "Fashion" ||
            p.name.toLowerCase().includes(activeTab.toLowerCase())
    );

    const trendingProducts = tabProducts.slice(0, 8);
    const bestOfProducts = tabProducts.slice(8, 16);
    const currentBanner = BANNERS[activeTab];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* TAB STRIP */}
            <div className="sticky top-[56px] md:top-[72px] z-20 bg-white border-b">
                <div className="flex w-full">
                    {(["Men", "Women", "Kids"] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 py-3 font-bold uppercase ${activeTab === tab ? "text-black" : "text-gray-500"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="tab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* HERO BANNER FIXED */}
            <div className="w-full h-[200px] md:h-[420px]">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    loop={currentBanner.images.length > 1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    observer
                    observeParents
                    className="w-full h-full"
                >
                    {currentBanner.images.map((img, index) => (
                        <SwiperSlide key={`${activeTab}-${index}`}>
                            <div className="relative w-full h-full">
                                <img
                                    src={img}
                                    alt="banner"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:p-12">
                                    <div className="text-white">
                                        <h2 className="text-lg md:text-5xl font-bold mb-2">
                                            {currentBanner.title}
                                        </h2>

                                        <Link
                                            href={currentBanner.link}
                                            className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2"
                                        >
                                            Shop Now <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* PRODUCTS */}
            <div className="max-w-7xl mx-auto space-y-6 pb-8">
                {trendingProducts.length > 0 && (
                    <section className="bg-white p-4 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <TrendingUp size={18} /> Trending in {activeTab}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {trendingProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

                {bestOfProducts.length > 0 && (
                    <section className="bg-white p-4 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Star size={18} /> Best of {activeTab}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {bestOfProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

                {tabProducts.length === 0 && (
                    <div className="flex flex-col items-center py-20">
                        <ShoppingBag size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-semibold">Coming Soon</p>
                    </div>
                )}
            </div>
        </div>
    );
};