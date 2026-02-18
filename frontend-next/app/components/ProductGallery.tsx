"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";

interface ProductGalleryProps {
    product: any;
    images: string[];
}

const DESKTOP_ZOOM = 2.2;
const MOBILE_MAX_ZOOM = 3;
const MOBILE_MIN_ZOOM = 1;

const ProductGallery: React.FC<ProductGalleryProps> = ({ product, images }) => {
    const allImages = images.length > 0
        ? images
        : product?.image
            ? [product.image]
            : ["/placeholder.png"];

    const [activeIdx, setActiveIdx] = useState(0);

    // Desktop zoom state
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    // Mobile zoom state
    const [mobileScale, setMobileScale] = useState(1);
    const [mobileOrigin, setMobileOrigin] = useState({ x: 50, y: 50 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Touch tracking refs (no state to avoid re-renders)
    const lastDist = useRef<number | null>(null);
    const lastScale = useRef(1);
    const lastMidpoint = useRef({ x: 50, y: 50 });

    const activeImage = allImages[activeIdx] || "/placeholder.png";

    // Reset mobile zoom when image changes
    useEffect(() => {
        setMobileScale(1);
        setMobileOrigin({ x: 50, y: 50 });
        lastScale.current = 1;
    }, [activeIdx]);

    // ── Desktop: smooth CSS zoom on mouse move ──
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    }, []);

    const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
    const handleMouseLeave = useCallback(() => {
        setIsZoomed(false);
        setZoomPos({ x: 50, y: 50 });
    }, []);

    // ── Mobile: pinch-to-zoom AND single-finger "hover" zoom ──
    const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchMidpoint = (t1: React.Touch, t2: React.Touch, rect: DOMRect) => {
        const mx = ((t1.clientX + t2.clientX) / 2 - rect.left) / rect.width * 100;
        const my = ((t1.clientY + t2.clientY) / 2 - rect.top) / rect.height * 100;
        return { x: mx, y: my };
    };

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        if (e.touches.length === 2) {
            // PINCH MODE
            e.preventDefault();
            lastDist.current = getTouchDist(e.touches[0], e.touches[1]);
            lastMidpoint.current = getTouchMidpoint(e.touches[0], e.touches[1], rect);
        } else if (e.touches.length === 1) {
            // HOVER MODE (Single finger touch-and-drag)
            // Don't preventDefault immediately to allow scroll, but if they hold/zoom we might want to.
            // For now, let's treat it like hover: immediate zoom at touch point
            const t = e.touches[0];
            const x = ((t.clientX - rect.left) / rect.width) * 100;
            const y = ((t.clientY - rect.top) / rect.height) * 100;
            setIsZoomed(true);
            setZoomPos({ x, y });
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        if (e.touches.length === 2 && lastDist.current !== null) {
            // PINCH LOGIC
            e.preventDefault();
            const newDist = getTouchDist(e.touches[0], e.touches[1]);
            const ratio = newDist / lastDist.current;
            const newScale = Math.min(MOBILE_MAX_ZOOM, Math.max(MOBILE_MIN_ZOOM, lastScale.current * ratio));

            const mid = getTouchMidpoint(e.touches[0], e.touches[1], rect);
            setMobileOrigin(mid);
            lastMidpoint.current = mid;

            setMobileScale(newScale);
            lastScale.current = newScale;
            lastDist.current = newDist;
        } else if (e.touches.length === 1 && isZoomed) {
            // HOVER LOGIC (Single finger move)
            // Prevent scrolling while zooming/panning
            if (e.cancelable) e.preventDefault();

            const t = e.touches[0];
            const x = ((t.clientX - rect.left) / rect.width) * 100;
            const y = ((t.clientY - rect.top) / rect.height) * 100;
            setZoomPos({ x, y });
        }
    }, [isZoomed]);

    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        // If no fingers left, reset everything
        if (e.touches.length === 0) {
            setIsZoomed(false); // Turn off hover zoom
            setZoomPos({ x: 50, y: 50 });

            lastDist.current = null;
            // Snap back pinch zoom if nearly at 1
            if (lastScale.current < 1.1) {
                setMobileScale(1);
                setMobileOrigin({ x: 50, y: 50 });
                lastScale.current = 1;
            }
        }
    }, []);

    // Determine if we're on mobile (for conditional style)
    const isMobileZoomed = mobileScale > 1 || (isZoomed && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);

    return (
        <div className="flex flex-col gap-3 select-none">

            {/* ── Main Image Container ── */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-xl bg-gray-50"
                style={{
                    aspectRatio: "1 / 1",
                    cursor: isZoomed ? "crosshair" : "zoom-in",
                    touchAction: isMobileZoomed ? "none" : "pan-y", // block scroll when zoomed
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    ref={imgRef}
                    src={activeImage}
                    alt={product?.name || "Product"}
                    draggable={false}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        // Desktop/Mobile Hover zoom takes priority
                        transform: isZoomed
                            ? `scale(${DESKTOP_ZOOM})`
                            : mobileScale > 1
                                ? `scale(${mobileScale})`
                                : "scale(1)",
                        transformOrigin: isZoomed
                            ? `${zoomPos.x}% ${zoomPos.y}%`
                            : `${mobileOrigin.x}% ${mobileOrigin.y}%`,
                        transition: isZoomed
                            ? "transform 0.08s ease-out"
                            : mobileScale > 1
                                ? "none"                      // no transition while pinching (feels laggy)
                                : "transform 0.25s ease-out", // smooth snap back
                        willChange: "transform",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                />

                {/* Desktop zoom hint */}
                <div
                    className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full pointer-events-none hidden md:block transition-opacity duration-200"
                    style={{ opacity: isZoomed ? 0 : 1 }}
                >
                    Hover to zoom
                </div>

                {/* Mobile zoom hint */}
                {!isZoomed && mobileScale <= 1 && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full pointer-events-none md:hidden">
                        Touch & Drag / Pinch
                    </div>
                )}
            </div>

            {/* ── Thumbnail Strip ── */}

            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIdx(idx)}
                            className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${activeIdx === idx
                                ? "border-blue-500 shadow-md scale-105"
                                : "border-gray-200 hover:border-gray-400"
                                }`}
                            style={{ background: "#f9f9f9" }}
                        >
                            <img
                                src={img}
                                alt={`View ${idx + 1}`}
                                className="w-full h-full object-contain"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
