"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check, Search } from 'lucide-react';
import { getProductImageUrl } from '@/app/utils/imageHelper';

interface ProductGalleryProps {
    product: {
        image?: string;
        images?: string[];
        title?: string;
        name?: string;
    } | null;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string>("/placeholder.png");
    const [allImages, setAllImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Swipe Refs
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Initialize Images
    useEffect(() => {
        if (!product) return;

        const mainImg = product.image ? getProductImageUrl(product.image) : "/placeholder.png";

        let gallery: string[] = [];
        if (product.images && product.images.length > 0) {
            gallery = product.images.map(img => getProductImageUrl(img));
        }

        // Ensure main image is in gallery
        if (!gallery.includes(mainImg) && mainImg !== "/placeholder.png") {
            gallery = [mainImg, ...gallery];
        }

        // If gallery empty, use main image
        if (gallery.length === 0) {
            gallery = [mainImg];
        }

        setAllImages(gallery);
        setSelectedImage(mainImg);
        setIsLoading(true);
    }, [product]);

    const handleImageSelect = (img: string) => {
        if (img === selectedImage) return;
        setSelectedImage(img);
        setIsLoading(true);
    };

    const handleNext = () => {
        const currentIndex = allImages.findIndex(img => img === selectedImage);
        const nextIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[nextIndex]);
        setIsLoading(true);
    };

    const handlePrev = () => {
        const currentIndex = allImages.findIndex(img => img === selectedImage);
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[prevIndex]);
        setIsLoading(true);
    };

    // Swipe Handlers
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
            handleNext();
        } else if (isSwipeRight) {
            handlePrev();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!product) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <span className="text-gray-400 font-medium">Loading Product...</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Main Image Container */}
            <div
                className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 min-h-[350px] md:min-h-[500px] flex items-center justify-center p-4 touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Floating Action Buttons (Optional per original design) */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {/* Can add zoom/share buttons here if needed */}
                </div>

                {/* Left Arrow (Desktop) */}
                {allImages.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-2 md:left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hidden md:flex items-center justify-center group"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-black" />
                    </button>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Main Image */}
                <div className="relative w-full h-[300px] md:h-[450px]">
                    <Image
                        src={selectedImage}
                        alt={product.name || "Product Image"}
                        fill
                        priority
                        className={`object-contain transition-all duration-300 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setSelectedImage("/placeholder.png");
                            setIsLoading(false);
                        }}
                        unoptimized={true}
                    />
                </div>

                {/* Right Arrow (Desktop) */}
                {allImages.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-2 md:right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hidden md:flex items-center justify-center group"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-black" />
                    </button>
                )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 px-1 snap-x no-scrollbar">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleImageSelect(img)}
                            className={`
                                relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center
                                ${selectedImage === img
                                    ? 'border-orange-500 ring-2 ring-orange-100 ring-offset-1'
                                    : 'border-gray-100 hover:border-gray-300 opacity-70 hover:opacity-100'}
                            `}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
