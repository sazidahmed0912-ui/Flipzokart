"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper'; // Import type safely
// Import Swiper styles
import 'swiper/css';

import { getAllProductImages } from '@/app/utils/imageHelper';

interface ProductGalleryProps {
    product: any;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
    const [allImages, setAllImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Swiper Ref
    const swiperRef = useRef<SwiperType | null>(null);

    // Zoom State
    const [isZoomed, setIsZoomed] = useState<boolean>(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const lastTap = useRef<number>(0);

    // Initialize Images
    useEffect(() => {
        if (!product) return;

        // Use universal helper to get all valid images
        const validImages = getAllProductImages(product);
        setAllImages(validImages);
        setActiveIndex(0);
        setIsLoading(true);
        setIsZoomed(false);
        if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0);
        }
    }, [product]);

    // Zoom Handlers (Desktop Hover)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLoading) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    // Mobile Touch & Zoom Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap.current;

        if (tapLength < 300 && tapLength > 0) {
            // Double Tap Detected (Toggle Zoom)
            e.preventDefault();
            const newZoomState = !isZoomed;
            setIsZoomed(newZoomState);

            if (newZoomState) {
                // Zoom IN at touch point
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const touch = e.targetTouches[0];
                const x = ((touch.clientX - left) / width) * 100;
                const y = ((touch.clientY - top) / height) * 100;
                setZoomPos({ x, y });
            }
        }
        lastTap.current = currentTime;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isZoomed) {
            // Panning Logic when zoomed
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const touch = e.targetTouches[0];
            const x = ((touch.clientX - left) / width) * 100;
            const y = ((touch.clientY - top) / height) * 100;

            // Allow full pan
            setZoomPos({ x, y });

            // Stop propagation and prevent default to lock screen while panning
            e.stopPropagation();
            // e.preventDefault(); // Optional: might block scrolling excessively if logic fails
        }
    };

    const handleDotClick = (index: number) => {
        if (swiperRef.current) {
            swiperRef.current.slideTo(index);
        }
    };

    if (!product) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <span className="text-gray-400 font-medium">Loading...</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Main Image Container */}
            <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 min-h-[350px] md:min-h-[500px]">

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50 pointer-events-none">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <Swiper
                    onSwiper={(swiper) => swiperRef.current = swiper}
                    spaceBetween={0}
                    slidesPerView={1}
                    speed={300} // Smooth 300ms transition
                    className="w-full h-full"
                    onSlideChange={(swiper) => {
                        setActiveIndex(swiper.activeIndex);
                        setIsZoomed(false); // Reset zoom on slide change
                    }}
                    allowTouchMove={!isZoomed} // Disable swipe when zoomed
                >
                    {allImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div
                                className={`relative w-full h-[350px] md:h-[500px] flex items-center justify-center p-4 select-none
                                    ${isZoomed ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in touch-pan-y'}
                                `}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="relative w-full h-full">
                                    <Image
                                        src={img}
                                        alt={`Product View ${idx + 1}`}
                                        fill
                                        priority={idx === 0}
                                        className={`object-contain transition-transform duration-200 ease-out`}
                                        style={{
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transform: isZoomed && !isLoading ? 'scale(2.5)' : 'scale(1)',
                                            opacity: isLoading && idx === activeIndex ? 0 : 1
                                        }}
                                        onLoad={() => {
                                            if (idx === activeIndex) setIsLoading(false);
                                        }}
                                        onError={() => {
                                            if (idx === activeIndex) setIsLoading(false);
                                        }}
                                        unoptimized={true}
                                    />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Custom Dot Indicator */}
            {allImages.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-1">
                    {allImages.map((_, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`rounded-full transition-all duration-300 ease-out focus:outline-none
                                    ${isActive
                                        ? 'w-3 h-3 bg-orange-500 scale-110'
                                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                    }
                                `}
                                aria-label={`View image ${index + 1}`}
                            />
                        );
                    })}
                </div>
            )}

            {/* Thumbnails (Desktop) */}
            {allImages.length > 1 && (
                <div className="hidden md:flex gap-3 overflow-x-auto pb-2 px-1 snap-x no-scrollbar justify-center">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200
                                ${idx === activeIndex
                                    ? 'border-orange-500 ring-1 ring-orange-500 scale-105'
                                    : 'border-gray-100 opacity-70 hover:opacity-100 hover:border-gray-300'
                                }`}
                        >
                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized={true} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
