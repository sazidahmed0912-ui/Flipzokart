"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LazyImage from '@/app/components/LazyImage';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        title: "Start Selling for Everyone",
        subtext: "Sell your products online and reach more customers with Fzokart",
        cta: "Join as a Seller",
        link: "/sell",
        gradient: "from-yellow-400 to-orange-500",
        image: "/assets/banner_seller.png",
        position: "center bottom",
        textParams: {
            titleColor: "text-white md:text-gray-900",
            textColor: "text-gray-100 md:text-gray-800",
            buttonBg: "bg-white",
            buttonText: "text-orange-600"
        }
    },
    {
        id: 2,
        title: "The Big Fashion Sale",
        subtext: "Up to 50% OFF on Top Brands",
        cta: "Shop Now",
        link: "/shop?tag=offer",
        gradient: "from-[#fcd34d] to-[#ef4444]", // Warm Yellow to Red
        image: "/assets/banner_offer_new.png",
        position: "center center",
        textParams: {
            titleColor: "text-white",
            textColor: "text-white", // White text on warm gradient looks good
            buttonBg: "bg-white",
            buttonText: "text-red-600"
        }
    },
    {
        id: 3,
        title: "Mega Savings Deal",
        subtext: "Flat 50% OFF on Kids Collection & More",
        cta: "Shop Now",
        link: "/shop?category=Kids",
        gradient: "from-[#6717cd] to-[#280590]", // Deep purple/blue to match image bg
        image: "/assets/banner_kids_new.jpg",
        position: "center center",
        textParams: {
            titleColor: "text-white",
            textColor: "text-purple-100",
            buttonBg: "bg-yellow-400",
            buttonText: "text-purple-900"
        }
    }
];

interface HeroSliderProps {
    banners?: Array<{
        _id: string;
        imageUrl: string; // Desktop
        mobileImageUrl?: string; // Mobile
        redirectUrl: string;
        title?: string;
        subtitle?: string;
        ctaText?: string;
    }>;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners = [] }) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const activeSlides = banners.length > 0 ? banners : slides;
    const isDynamic = banners.length > 0;

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [paused, activeSlides.length, banners.length]);

    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isSwipeLeft = distance > 50;
        const isSwipeRight = distance < -50;

        if (isSwipeLeft) {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }
        if (isSwipeRight) {
            setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    if (activeSlides.length === 0) return null;

    return (
        <section
            className="hero-banner-quad relative w-full md:w-auto md:mx-8 md:my-6 h-[200px] md:h-[450px] lg:h-[500px] max-h-[600px] overflow-hidden group bg-gray-100 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence mode='wait'>
                {isDynamic ? (
                    // DYNAMIC IMAGE BANNER RENDER
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <Link href={(activeSlides[currentIndex] as any).redirectUrl || '#'} className="block w-full h-full relative group">
                            {/* Desktop Image */}
                            <div className="hidden md:block w-full h-full relative">
                                <LazyImage
                                    src={(activeSlides[currentIndex] as any).imageUrl}
                                    alt="Banner"
                                    fill={true}
                                    priority={true}
                                    className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                                    sizes="100vw"
                                />
                            </div>
                            {/* Mobile Image - Fallback to Desktop */}
                            <div className="block md:hidden w-full h-full relative">
                                <LazyImage
                                    src={(activeSlides[currentIndex] as any).mobileImageUrl || (activeSlides[currentIndex] as any).imageUrl}
                                    alt="Banner"
                                    fill={true}
                                    priority={true}
                                    className="object-cover w-full h-full"
                                    sizes="100vw"
                                />
                            </div>

                            {/* Soft gradient for visual depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                            {/* Premium Clean CTA Pill — only element on banner */}
                            <div className="banner-overlay">
                                <span className="cta-text">{(activeSlides[currentIndex] as any).ctaText || 'Shop Now'}</span>
                            </div>
                        </Link>
                    </motion.div>
                ) : (
                    // STATIC FALLBACK RENDER (Existing Logic)
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute inset-0 bg-gradient-to-r ${(activeSlides[currentIndex] as any).gradient} flex md:items-center cursor-pointer`}
                        onClick={() => router.push((activeSlides[currentIndex] as any).link)}
                    >
                        <div className="w-full h-full md:max-w-7xl md:mx-auto md:px-12 relative">
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-8 h-full items-center">
                                {/* Image Content */}
                                <div className="absolute inset-0 md:relative md:h-full w-full flex justify-center md:justify-end items-center order-1 md:order-2 z-0 md:z-auto">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.4 }}
                                        className="relative w-full h-full md:h-[85%] md:w-full"
                                    >
                                        <LazyImage
                                            src={(activeSlides[currentIndex] as any).image}
                                            alt={(activeSlides[currentIndex] as any).title}
                                            priority={true}
                                            fill={true}
                                            className="object-cover md:object-contain drop-shadow-2xl"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            wrapperClassName="w-full h-full bg-transparent"
                                        />
                                    </motion.div>
                                </div>

                                {/* Text Content — completely hidden, only banner-overlay CTA pill shows */}
                                <div className="hidden">
                                    <motion.h1
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className={`text-xl sm:text-2xl md:text-5xl lg:text-6xl font-extrabold mb-1 md:mb-4 leading-tight line-clamp-2 ${(activeSlides[currentIndex] as any).textParams.titleColor}`}
                                    >
                                        {(activeSlides[currentIndex] as any).title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className={`text-xs sm:text-sm md:text-xl mb-3 md:mb-8 max-w-[90%] md:max-w-md line-clamp-1 ${(activeSlides[currentIndex] as any).textParams.textColor}`}
                                    >
                                        {(activeSlides[currentIndex] as any).subtext}
                                    </motion.p>
                                </div>
                            </div>
                        </div>

                        {/* Premium Clean CTA Pill — bottom-left */}
                        <Link
                            href={(activeSlides[currentIndex] as any).link}
                            onClick={e => e.stopPropagation()}
                            className="banner-overlay"
                        >
                            <span className="cta-text">{(activeSlides[currentIndex] as any).cta}</span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flipkart-style progress dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {activeSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => { setCurrentIndex(index); setPaused(false); }}
                        className={`hero-dot relative overflow-hidden rounded-full transition-all duration-300 shadow-sm ${index === currentIndex ? 'hero-dot-active' : 'hero-dot-inactive'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};
