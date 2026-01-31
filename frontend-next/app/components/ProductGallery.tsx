"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check, Search } from 'lucide-react';
import { getProductImageUrl } from '@/app/utils/imageHelper';

interface ProductGalleryProps {
    product: any;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string>("/placeholder.png");
    const [allImages, setAllImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Zoom State
    const [isZoomed, setIsZoomed] = useState<boolean>(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const lastTap = useRef<number>(0);

    // Swipe Refs
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Initialize Images
    // Initialize Images
    useEffect(() => {
        if (!product) return;

        let galleryImgs: string[] = [];

        // STRICT requirement: Use product.images[] as the ONLY image source. 
        // Do NOT use product.image.
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            galleryImgs = product.images.map(img => getProductImageUrl(img));
        }

        // Deduplicate
        const uniqueSet = new Set<string>();
        galleryImgs.forEach(img => {
            if (img && img !== "/placeholder.png") uniqueSet.add(img);
        });

        // Convert back to array
        let finalGallery = Array.from(uniqueSet);

        // Fallback
        if (finalGallery.length === 0) {
            // Check thumbnail as a last resort before placeholder, but strict rule says NO product.image
            if (product.thumbnail) {
                finalGallery = [getProductImageUrl(product.thumbnail)];
            } else {
                finalGallery = ["/placeholder.png"];
            }
        }

        setAllImages(finalGallery);

        // On load, default to first image
        setSelectedImage(finalGallery[0]);

        setIsLoading(true);
        setIsZoomed(false);
    }, [product]);

    const handleImageSelect = (img: string) => {
        if (img === selectedImage) return;
        setSelectedImage(img);
        setIsLoading(true);
        setIsZoomed(false);
    };

    const handleNext = () => {
        const currentIndex = allImages.findIndex(img => img === selectedImage);
        const nextIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[nextIndex]);
        setIsLoading(true);
        setIsZoomed(false);
    };

    const handlePrev = () => {
        const currentIndex = allImages.findIndex(img => img === selectedImage);
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[prevIndex]);
        setIsLoading(true);
        setIsZoomed(false);
    };

    // Zoom Handlers
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

    // Swipe & Mobile Zoom Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap.current;

        if (tapLength < 300 && tapLength > 0) {
            // Double Tap Detected
            e.preventDefault();
            const newZoomState = !isZoomed;
            setIsZoomed(newZoomState);

            // If turning on, set initial pos to tap location to feel natural
            if (newZoomState) {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const touch = e.targetTouches[0];
                const x = ((touch.clientX - left) / width) * 100;
                const y = ((touch.clientY - top) / height) * 100;
                setZoomPos({ x, y });
            }
        } else {
            // Normal Touch Start
            touchStartX.current = e.targetTouches[0].clientX;

            // If already zoomed, strictly track touch immediately for panning
            if (isZoomed) {
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
            // Pan logic
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const touch = e.targetTouches[0];
            const x = ((touch.clientX - left) / width) * 100;
            const y = ((touch.clientY - top) / height) * 100;

            // Constrain constraints (0-100)
            const safeX = Math.max(0, Math.min(100, x));
            const safeY = Math.max(0, Math.min(100, y));

            setZoomPos({ x: safeX, y: safeY });

            // Prevent scrolling while panning
            // e.preventDefault(); // Note: This might need passive: false listener in vanilla JS, but React synthetic event wrapper often handles it if we use touch-action: none CSS
            return;
        }

        // Swipe logic
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (isZoomed) return; // Keep zoomed state

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
                className={`relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 min-h-[350px] md:min-h-[500px] flex items-center justify-center p-4 touch-pan-y
                    ${isZoomed ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in touch-pan-y'}
                `}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Floating Action Buttons (Optional per original design) */}
                <div className="absolute top-4 right-4 flex gap-2 z-10 pointer-events-none">
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
                <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
                    <Image
                        src={selectedImage}
                        alt={product.name || "Product Image"}
                        fill
                        priority
                        className={`object-contain transition-transform duration-200 ease-out`}
                        style={{
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transform: isZoomed && !isLoading ? 'scale(2.5)' : 'scale(1)',
                            opacity: isLoading ? 0 : 1
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setSelectedImage("/placeholder.png");
                            setIsLoading(false);
                            setIsZoomed(false);
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

            {/* Banner Switching Indicators */}
            {allImages.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 -mt-2">
                    {allImages.map((img, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${selectedImage === img ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-300'}`}
                        />
                    ))}
                </div>
            )}

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
