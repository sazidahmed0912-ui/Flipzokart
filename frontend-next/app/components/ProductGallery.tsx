"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { getAllProductImages } from '@/app/utils/imageHelper';

interface ProductGalleryProps {
    product: any;
    images?: string[];
}

// 2. DEVICE DETECTION (MANDATORY)
// Placed outside component to avoid re-evaluation on every render, 
// but inside a check for window to support SSR.
const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export default function ProductGallery({ product, images }: ProductGalleryProps) {
    const [allImages, setAllImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Swiper Ref
    const swiperRef = useRef<SwiperType | null>(null);

    // Zoom State
    const [isZoomed, setIsZoomed] = useState<boolean>(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    // 5. MOBILE DOUBLE-TAP ZOOM (SAFE)
    const lastTap = useRef<number>(0);

    // Initialize Images
    useEffect(() => {
        if (!product) return;

        let validImages: string[] = [];

        // 1. Priority: Prop images (Variant specific)
        if (images && images.length > 0) {
            validImages = images;
        }
        // 2. Fallback: Universal helper (Product default)
        else {
            validImages = getAllProductImages(product);
        }

        setAllImages(prev => {
            const isSame = prev.length === validImages.length && prev.every((url, i) => url === validImages[i]);
            if (isSame) return prev;

            setActiveIndex(0);
            setIsLoading(true);
            setIsZoomed(false);
            if (swiperRef.current) {
                swiperRef.current.slideTo(0, 0);
            }
            return validImages;
        });
    }, [product, images]);

    // 4. DESKTOP HOVER ZOOM ONLY
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLoading || isTouchDevice) return; // disable on mobile

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        if (isTouchDevice) return;
        setIsZoomed(false);
    };

    // 5. MOBILE DOUBLE-TAP ZOOM (SAFE)
    const handleTouchStart = (e: React.TouchEvent) => {
        const now = Date.now();
        const diff = now - lastTap.current;

        if (diff < 300 && diff > 0) {
            e.preventDefault(); // Prevent default double-tap zoom behavior of browser if any

            // Calculate zoom position on double tap
            if (!isZoomed) {
                // If we are zooming in, try to center on the tap if possible, or just default center
                // Finding exact tap coordinates relative to image can be tricky here without the event persisting
                // But we can try using the changedTouches if available
                if (e.changedTouches && e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    const target = e.currentTarget as HTMLElement; // The wrapper div
                    const rect = target.getBoundingClientRect();
                    const x = ((touch.clientX - rect.left) / rect.width) * 100;
                    const y = ((touch.clientY - rect.top) / rect.height) * 100;
                    setZoomPos({ x, y });
                }
            }

            setIsZoomed((z) => !z);
        }

        lastTap.current = now;
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

            // Critical: Don't stop propagation aggressively unless necessary, 
            // but for panning inside a zoomed image we usually want to prevent swiping the slide.
            // However, the requirements say "Swiper allowTouchMove must stay true on mobile".
            // So we let the user control it. If they hit the edge, Swiper might take over.
            e.stopPropagation();
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
            <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100">
                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50 pointer-events-none h-[400px]">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* 3. SWIPER CONFIG (FLIPKART STYLE) */}
                <Swiper
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    slidesPerView={1}
                    spaceBetween={0}
                    speed={300}
                    allowTouchMove={true}   // NEVER disable on mobile
                    resistanceRatio={0.85}
                    autoHeight={true}
                    onSlideChange={(swiper) => {
                        setActiveIndex(swiper.activeIndex);
                        setIsZoomed(false);
                    }}
                    className="w-full"
                >
                    {allImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            {/* 6. CSS FIX FOR SWIPE CONFLICT */}
                            <div
                                className={`relative w-full flex items-center justify-center select-none
                                    ${isZoomed ? 'touch-none cursor-grab' : 'touch-pan-y cursor-zoom-in'}
                                    ${!isTouchDevice && isZoomed ? 'cursor-zoom-out' : ''}
                                `}
                                style={{
                                    touchAction: isZoomed ? 'none' : 'pan-y'
                                }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={isZoomed ? handleTouchMove : undefined}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="relative w-full aspect-square md:h-[600px] max-h-[70vh]">
                                    <Image
                                        src={img}
                                        alt={`Product View ${idx + 1}`}
                                        fill
                                        priority={idx === 0}
                                        draggable={false}
                                        className={`object-contain p-2 md:p-4 transition-transform duration-200 ease-out`}
                                        style={{
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transform: isZoomed && !isLoading ? 'scale(2.5)' : 'scale(1)',
                                            opacity: 1
                                        }}
                                        onLoad={() => {
                                            if (swiperRef.current) swiperRef.current.update();
                                            if (idx === activeIndex) setIsLoading(false);
                                        }}
                                        onError={(e) => {
                                            const newImages = [...allImages];
                                            if (newImages[idx] !== '/placeholder.png') {
                                                newImages[idx] = '/placeholder.png';
                                                setAllImages(newImages);
                                            }
                                            if (idx === activeIndex) setIsLoading(false);
                                        }}
                                        unoptimized={true}
                                    />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Dot Indicator (Overlay) */}
                {
                    allImages.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-10 pointer-events-none">
                            {allImages.map((_, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDotClick(index);
                                        }}
                                        className={`rounded-full transition-all duration-300 ease-out focus:outline-none pointer-events-auto
                                        ${isActive
                                                ? 'w-2.5 h-2.5 bg-orange-500 scale-110 shadow-sm'
                                                : 'w-2 h-2 bg-gray-300/80 hover:bg-white backdrop-blur-sm'
                                            }
                                    `}
                                        aria-label={`View image ${index + 1}`}
                                    />
                                );
                            })}
                        </div>
                    )
                }
            </div>

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
                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized={true} draggable={false} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
