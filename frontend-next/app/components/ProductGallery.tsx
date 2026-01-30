"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination, Zoom as SwiperZoom } from 'swiper/modules';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

interface ProductGalleryProps {
    images: string[];
    activeImage?: string; // Controlled by parent (variants)
    onImageChange?: (image: string) => void;
    productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
    images,
    activeImage,
    onImageChange,
    productName
}) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
    const [mainSwiper, setMainSwiper] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, show: false });
    const imgRef = useRef<HTMLImageElement>(null);

    // Sync activeImage prop with Swiper
    useEffect(() => {
        if (activeImage && mainSwiper && images.includes(activeImage)) {
            const index = images.indexOf(activeImage);
            if (mainSwiper.activeIndex !== index) {
                mainSwiper.slideTo(index);
            }
        }
    }, [activeImage, mainSwiper, images]);

    const handleSlideChange = (swiper: any) => {
        const newIndex = swiper.activeIndex;
        const newImage = images[newIndex];
        if (onImageChange && newImage !== activeImage) {
            onImageChange(newImage);
        }
    };

    // Basic Hover Lens Logic for Desktop
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (window.innerWidth < 768) return; // Disable on mobile
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setHoverPosition({ x, y, show: true });
    };

    const handleMouseLeave = () => {
        setHoverPosition(prev => ({ ...prev, show: false }));
    };

    return (
        <div className="product-gallery w-full select-none">
            {/* Main Slider */}
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-square md:aspect-[4/3] group min-h-[300px] flex items-center justify-center">

                {(!images || images.length === 0) ? (
                    <div className="flex flex-col items-center justify-center text-gray-300 w-full h-full">
                        <Maximize2 size={48} className="mb-2 opacity-50" />
                        <span className="text-sm">No Images Available</span>
                    </div>
                ) : (
                    <>
                        {/* Fullscreen Trigger */}
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-gray-600 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                            title="Full Screen"
                        >
                            <Maximize2 size={20} />
                        </button>

                        <Swiper
                            modules={[Navigation, Thumbs, Pagination]}
                            thumbs={{ swiper: thumbsSwiper }}
                            loop={false} // Loop can complicate controlled state with variants
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation={{
                                prevEl: '.gallery-prev',
                                nextEl: '.gallery-next',
                            }}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            onSwiper={setMainSwiper}
                            onSlideChange={handleSlideChange}
                            className="w-full h-full"
                        >
                            {images.map((img, idx) => (
                                <SwiperSlide key={idx} className="flex items-center justify-center bg-white cursor-zoom-in">
                                    <div
                                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => setIsFullscreen(true)}
                                    >
                                        {/* Main Image */}
                                        <LazyImage
                                            src={img}
                                            alt={`${productName} - View ${idx + 1}`}
                                            className="max-w-full max-h-full object-contain pointer-events-none"
                                        />

                                        {/* Desktop Hover Zoom Lens Effect */}
                                        {hoverPosition.show && (
                                            <div
                                                className="absolute inset-0 z-20 pointer-events-none hidden md:block bg-no-repeat bg-white"
                                                style={{
                                                    backgroundImage: `url(${img})`,
                                                    backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
                                                    backgroundSize: '200%', // 2x Zoom
                                                }}
                                            />
                                        )}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Navigation Arrows */}
                        <button className="gallery-prev absolute top-1/2 left-4 z-10 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white disabled:opacity-0 transition-all opacity-0 group-hover:opacity-100">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="gallery-next absolute top-1/2 right-4 z-10 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white disabled:opacity-0 transition-all opacity-0 group-hover:opacity-100">
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="mt-4">
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={12}
                        slidesPerView={4}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[Navigation, Thumbs]}
                        className="thumbs-swiper px-1"
                        breakpoints={{
                            640: { slidesPerView: 5 },
                            768: { slidesPerView: 5 },
                            1024: { slidesPerView: 6 }
                        }}
                    >
                        {images.map((img, idx) => (
                            <SwiperSlide key={idx} className="cursor-pointer group">
                                <div className={`aspect-square rounded-xl border-2 overflow-hidden transition-all relative ${mainSwiper?.activeIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 group-hover:border-blue-400'}`}>
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
                    <div className="absolute top-4 right-4 z-50 flex gap-4">
                        <div className="px-4 py-2 bg-black/50 rounded-full text-white text-sm font-medium border border-white/20">
                            {mainSwiper ? mainSwiper.activeIndex + 1 : 1} / {images.length}
                        </div>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 w-full h-full flex items-center justify-center p-4">
                        <Swiper
                            initialSlide={mainSwiper?.activeIndex || 0}
                            spaceBetween={20}
                            slidesPerView={1}
                            modules={[Navigation, Pagination, SwiperZoom]}
                            navigation={true}
                            pagination={{ type: 'fraction' }}
                            zoom={true}
                            className="w-full h-full fullscreen-swiper"
                            style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' } as React.CSSProperties}
                        >
                            {images.map((img, idx) => (
                                <SwiperSlide key={idx} className="flex items-center justify-center bg-transparent">
                                    <div className="swiper-zoom-container">
                                        <img src={img} alt="Fullscreen" className="max-h-screen max-w-full object-contain" />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}
        </div>
    );
};
