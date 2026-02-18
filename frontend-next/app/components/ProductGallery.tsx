"use client";
import React, { useState, useRef, useCallback } from "react";

interface ProductGalleryProps {
    product: any;
    images: string[];
}

const ZOOM_SCALE = 2.2; // How much to zoom in on desktop hover

const ProductGallery: React.FC<ProductGalleryProps> = ({ product, images }) => {
    const allImages = images.length > 0
        ? images
        : product?.image
            ? [product.image]
            : ["/placeholder.png"];

    const [activeIdx, setActiveIdx] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 }); // percent
    const containerRef = useRef<HTMLDivElement>(null);

    const activeImage = allImages[activeIdx] || "/placeholder.png";

    // --- Desktop: smooth CSS zoom on mouse move (no blink) ---
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

    return (
        <div className="flex flex-col gap-3 select-none">

            {/* ── Main Image ── */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-xl bg-gray-50"
                style={{
                    aspectRatio: "1 / 1",
                    cursor: isZoomed ? "crosshair" : "zoom-in",
                    // Mobile: allow native pinch-zoom
                    touchAction: "pinch-zoom",
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={activeImage}
                    alt={product?.name || "Product"}
                    draggable={false}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        // Smooth CSS zoom — no blink, no re-render
                        transform: isZoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transition: isZoomed
                            ? "transform 0.08s ease-out"   // fast follow on move
                            : "transform 0.2s ease-out",   // smooth zoom-out
                        willChange: "transform",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                />

                {/* Zoom hint — only on desktop, fades out when zoomed */}
                <div
                    className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full pointer-events-none hidden md:block transition-opacity duration-200"
                    style={{ opacity: isZoomed ? 0 : 1 }}
                >
                    Hover to zoom
                </div>
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
