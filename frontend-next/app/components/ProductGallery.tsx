"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllProductImages } from '@/app/utils/imageHelper';

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
    useEffect(() => {
        if (!product) return;

        // Use universal helper to get all valid images
        const validImages = getAllProductImages(product);
        setAllImages(validImages);
        setSelectedImage(validImages[0]);
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
        } else {
            // Normal Swipe Start
            touchStartX.current = e.targetTouches[0].clientX;

            // If already zoomed, allow panning
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
            // Panning Logic
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const touch = e.targetTouches[0];
            const x = ((touch.clientX - left) / width) * 100;
            const y = ((touch.clientY - top) / height) * 100;

            // Allow full pan
            setZoomPos({ x, y });

            // Prevent scrolling if zoomed
            // e.preventDefault(); 
            return;
        }

        // Swipe Logic
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (isZoomed) return;

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
                <span className="text-gray-400 font-medium">Loading...</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Main Image Container */}
            <div
                className={`relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 min-h-[350px] md:min-h-[500px] flex items-center justify-center p-4 touch-pan-y select-none
                    ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
                `}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Desktop Arrows */}
                {allImages.length > 1 && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 z-10 p-2 bg-white/80 rounded-full shadow hidden md:flex hover:bg-white transition">
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 z-10 p-2 bg-white/80 rounded-full shadow hidden md:flex hover:bg-white transition">
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                    </>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Main Image */}
                <div className="relative w-full h-[300px] md:h-[450px]">
                    <Image
                        src={selectedImage}
                        alt="Product"
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
                            // If this image fails and it's not placeholder, try placeholder
                            if (selectedImage !== "/placeholder.png") {
                                setSelectedImage("/placeholder.png");
                            }
                            setIsLoading(false);
                        }}
                        unoptimized={true}
                    />
                </div>
            </div>

            {/* Pagination Dots (Mobile) */}
            {allImages.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 md:hidden -mt-2">
                    {allImages.map((img, index) => (
                        <div key={index} className={`h-1.5 rounded-full transition-all ${selectedImage === img ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-300'}`} />
                    ))}
                </div>
            )}

            {/* Thumbnails (Desktop) */}
            {allImages.length > 1 && (
                <div className="hidden md:flex gap-3 overflow-x-auto pb-2 px-1 snap-x no-scrollbar">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleImageSelect(img)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 opacity-70 hover:opacity-100 hover:border-gray-300'}`}
                        >
                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized={true} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
