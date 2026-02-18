"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { getAllProductImages } from '@/app/utils/imageHelper';

interface ProductGalleryProps {
    product: any;
    images?: string[];
}

export default function ProductGallery({ product, images }: ProductGalleryProps) {
    const [allImages, setAllImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef<SwiperType | null>(null);

    // Desktop zoom state
    const [showZoom, setShowZoom] = useState(false);
    const [lensPos, setLensPos] = useState({ x: 0, y: 0 });       // lens top-left in px
    const [zoomBg, setZoomBg] = useState({ x: 0, y: 0 });         // background-position %
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const LENS_SIZE = 120;   // px — size of the magnifier lens square
    const ZOOM_FACTOR = 3;   // how much the zoomed panel magnifies

    // Initialize images
    useEffect(() => {
        if (!product) return;
        const validImages = (images && images.length > 0)
            ? images
            : getAllProductImages(product);

        setAllImages(prev => {
            const isSame = prev.length === validImages.length && prev.every((u, i) => u === validImages[i]);
            if (isSame) return prev;
            setActiveIndex(0);
            setIsLoading(true);
            setShowZoom(false);
            if (swiperRef.current) swiperRef.current.slideTo(0, 0);
            return validImages;
        });
    }, [product, images]);

    // ─── DESKTOP: Hover Magnifier Lens ───────────────────────────────────────
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = imageContainerRef.current;
        if (!container || isLoading) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Clamp lens so it stays inside the image container
        const lensX = Math.max(0, Math.min(mouseX - LENS_SIZE / 2, rect.width - LENS_SIZE));
        const lensY = Math.max(0, Math.min(mouseY - LENS_SIZE / 2, rect.height - LENS_SIZE));

        // Background position for the zoomed panel (percentage)
        const bgX = ((mouseX - LENS_SIZE / 2) / (rect.width - LENS_SIZE)) * 100;
        const bgY = ((mouseY - LENS_SIZE / 2) / (rect.height - LENS_SIZE)) * 100;

        setLensPos({ x: lensX, y: lensY });
        setZoomBg({ x: Math.max(0, Math.min(bgX, 100)), y: Math.max(0, Math.min(bgY, 100)) });
        setShowZoom(true);
    }, [isLoading]);

    const handleMouseLeave = useCallback(() => {
        setShowZoom(false);
    }, []);

    // ─── Thumbnail / dot click ────────────────────────────────────────────────
    const handleDotClick = (index: number) => {
        if (swiperRef.current) swiperRef.current.slideTo(index);
    };

    if (!product) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <span className="text-gray-400 font-medium">Loading...</span>
            </div>
        );
    }

    const currentImage = allImages[activeIndex] || '/placeholder.png';

    return (
        <div className="w-full flex flex-col gap-3">

            {/* ── DESKTOP LAYOUT: image + zoom panel side-by-side ── */}
            <div className="hidden md:flex gap-4 items-start">

                {/* Thumbnail strip (left, vertical) */}
                {allImages.length > 1 && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleDotClick(idx)}
                                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                                    ${idx === activeIndex
                                        ? 'border-[#2874F0] ring-1 ring-[#2874F0] scale-105'
                                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                                    }`}
                            >
                                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-contain p-1" sizes="56px" draggable={false} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Main image + lens overlay */}
                <div className="flex gap-4 flex-1 items-start">
                    <div
                        ref={imageContainerRef}
                        className="relative flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-crosshair select-none"
                        style={{ aspectRatio: '1 / 1', maxHeight: 520 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Loading spinner */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/60">
                                <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        <Image
                            src={currentImage}
                            alt={`Product image ${activeIndex + 1}`}
                            fill
                            priority
                            draggable={false}
                            className="object-contain p-4 pointer-events-none"
                            sizes="(max-width: 1200px) 50vw, 33vw"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                const imgs = [...allImages];
                                if (imgs[activeIndex] !== '/placeholder.png') {
                                    imgs[activeIndex] = '/placeholder.png';
                                    setAllImages(imgs);
                                }
                                setIsLoading(false);
                            }}
                        />

                        {/* Magnifier Lens */}
                        {showZoom && !isLoading && (
                            <div
                                className="absolute border-2 border-[#2874F0]/60 bg-white/20 pointer-events-none z-10"
                                style={{
                                    width: LENS_SIZE,
                                    height: LENS_SIZE,
                                    left: lensPos.x,
                                    top: lensPos.y,
                                    boxShadow: '0 0 0 1px rgba(40,116,240,0.3)',
                                    borderRadius: 4
                                }}
                            />
                        )}

                        {/* Zoom hint */}
                        {!showZoom && !isLoading && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none select-none opacity-70">
                                Hover to zoom
                            </div>
                        )}
                    </div>

                    {/* Zoomed Panel (right side) */}
                    {showZoom && !isLoading && (
                        <div
                            className="flex-shrink-0 rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white z-30"
                            style={{
                                width: 380,
                                height: 380,
                                backgroundImage: `url(${currentImage})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: `${ZOOM_FACTOR * 100}%`,
                                backgroundPosition: `${zoomBg.x}% ${zoomBg.y}%`,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* ── MOBILE LAYOUT: Swiper with native pinch-to-zoom ── */}
            <div className="md:hidden">
                <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/60 h-[360px]">
                            <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    <Swiper
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        slidesPerView={1}
                        spaceBetween={0}
                        speed={280}
                        allowTouchMove={true}
                        resistanceRatio={0.85}
                        onSlideChange={(swiper) => {
                            setActiveIndex(swiper.activeIndex);
                            setIsLoading(true);
                        }}
                        className="w-full"
                    >
                        {allImages.map((img, idx) => (
                            <SwiperSlide key={idx}>
                                {/* touch-action: pinch-zoom allows native browser pinch zoom without conflicting with swipe */}
                                <div
                                    className="relative w-full"
                                    style={{ aspectRatio: '1 / 1', touchAction: 'pinch-zoom' }}
                                >
                                    <Image
                                        src={img}
                                        alt={`Product image ${idx + 1}`}
                                        fill
                                        priority={idx === 0}
                                        draggable={false}
                                        className="object-contain p-3 pointer-events-none"
                                        sizes="100vw"
                                        onLoad={() => { if (idx === activeIndex) setIsLoading(false); }}
                                        onError={(e) => {
                                            const imgs = [...allImages];
                                            if (imgs[idx] !== '/placeholder.png') {
                                                imgs[idx] = '/placeholder.png';
                                                setAllImages(imgs);
                                            }
                                            if (idx === activeIndex) setIsLoading(false);
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Dot indicators */}
                    {allImages.length > 1 && (
                        <div className="flex justify-center items-center gap-1.5 py-2">
                            {allImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    className={`rounded-full transition-all duration-300 focus:outline-none
                                        ${index === activeIndex
                                            ? 'w-4 h-1.5 bg-[#2874F0]'
                                            : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`View image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile thumbnail strip */}
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 px-1 no-scrollbar mt-2">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleDotClick(idx)}
                                className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all
                                    ${idx === activeIndex
                                        ? 'border-[#2874F0]'
                                        : 'border-gray-200 opacity-60'
                                    }`}
                            >
                                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-contain p-0.5" sizes="48px" draggable={false} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
