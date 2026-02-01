"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/app/types';

interface HomeProductSectionProps {
    title: string;
    products: Product[];
    isLoading?: boolean;
}

const ProductSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse flex flex-col h-full">
        <div className="w-full h-[180px] bg-gray-200 rounded-md mb-4 relative" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-full mt-auto" />
    </div>
);

export const HomeProductSection: React.FC<HomeProductSectionProps> = ({ title, products, isLoading = false }) => {

    // Fallback for empty products during loading or error
    const displayProducts = isLoading ? Array(10).fill(null) : products;

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 font-sans">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] md:text-[24px] font-bold text-gray-800">{title}</h2>
                <Link href="/shop" className="text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline font-medium">
                    See all deals
                </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
                    : products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                }
            </div>

            {!isLoading && products.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    No products found in this section.
                </div>
            )}
        </section>
    );
};

const ProductCard = ({ product }: { product: Product }) => {
    const [wishlist, setWishlist] = useState(false);

    // Calculate Discount
    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        alert(`Added ${product.name} to Cart!`);
        // Actual logic: useCart().addItem(product)
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(!wishlist);
    };

    return (
        <Link
            href={`/product/${product.id}`}
            className="group block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden relative flex flex-col h-full"
        >
            {/* Image Container - Fixed Height */}
            <div className="bg-gray-50 w-full h-[180px] md:h-[220px] relative p-4 flex items-center justify-center">
                <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                {/* Wishlist Icon */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-gray-100 text-gray-400 hover:text-red-500 z-10 transition-colors"
                >
                    <Heart size={18} fill={wishlist ? "currentColor" : "none"} className={wishlist ? "text-red-500" : ""} />
                </button>

                {/* Discount Badge (if applicable) */}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[2px]">
                        {discount}% off
                    </span>
                )}
            </div>

            {/* Product Details */}
            <div className="p-3 md:p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-[14px] md:text-[15px] font-medium text-[#0F1111] leading-snug line-clamp-2 mb-1 group-hover:text-[#C7511F]">
                    {product.name}
                </h3>

                {/* Ratings (UI Simulation if missing) */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-[#F4A41C]">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span className="text-[12px] text-[#007185] font-medium hover:underline cursor-pointer">
                        {product.reviewsCount || 0}
                    </span>
                </div>

                {/* Price Section */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-[18px] md:text-[21px] font-medium text-[#0F1111]">
                            ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                            <span className="text-[12px] text-[#565959] line-through decoration-gray-400">
                                MRP: ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] font-medium py-1.5 rounded-[20px] shadow-sm border border-[#FCD200] hover:border-[#F2C200] transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-[#F7CA00] focus:ring-offset-1"
                    >
                        Add to Cart
                    </button>
                    {product.countInStock <= 5 && product.countInStock > 0 && (
                        <p className="text-[11px] text-[#B12704] mt-1 font-medium">Only {product.countInStock} left in stock.</p>
                    )}
                </div>
            </div>
        </Link>
    );
};
