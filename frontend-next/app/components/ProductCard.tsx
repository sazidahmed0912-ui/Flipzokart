"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/app/types';
import { useApp } from '@/app/store/Context';
import { getProductImage } from '@/app/utils/imageHelper';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { toggleWishlist, wishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  // Robust Image Selection - Direct calculation for performance
  const resolvedUrl = getProductImage(product);
  const [imgSrc, setImgSrc] = useState<string>(resolvedUrl);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if product changes
  useEffect(() => {
    setImgSrc(getProductImage(product));
  }, [product]);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  }

  // Cast product to any to access rank injected by FashionPage
  const rank = (product as any).rank;
  const animationClass = rank === 1 ? 'subtle-animate-strong' : (rank && rank <= 3 ? 'subtle-animate' : '');

  return (
    <div className={`group rounded-lg md:rounded-xl overflow-hidden hover:shadow-lg transition-transform duration-300 transform-origin-center will-change-transform hover:scale-[1.02] md:hover:scale-[1.03] flex flex-col realme-glass-card ${animationClass}`}>
      <div className="glass-layer"></div>
      <div className="card-content flex flex-col w-full h-full">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-transparent flex items-center justify-center p-1.5 md:p-3 mb-1">
          <Link href={`/product/${product.id}`} className="block w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 transition-opacity duration-300">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            <Image
              src={imgSrc}
              alt={product.name}
              priority={priority}
              fill
              className={`object-contain transition-transform duration-300 hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImgSrc("/placeholder.png");
                setIsLoading(false);
              }}
            />
          </Link>
          <button
            onClick={handleWishlist}
            className={`absolute top-1.5 right-1.5 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full shadow-md z-20 transition-colors ${isWishlisted ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-primary'
              }`}
          >
            <Heart size={14} className="md:w-[18px] md:h-[18px]" fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          {discount > 0 && (
            <span className="absolute top-1.5 left-1.5 md:top-3 md:left-3 bg-primary text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-20">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="px-2 md:px-3 pt-1 pb-2 md:pb-3 flex flex-col">
          <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-wide mt-1 mb-0.5">{product.category}</p>
          <Link href={`/product/${product.id}`} className="font-semibold text-[11px] md:text-sm line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2.2em] mb-1">
            {product.name}
          </Link>

          {/* Rating Row - Compact */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded-[4px] border border-green-100">
              <span className="text-[10px] font-bold text-green-700">{product.rating}</span>
              <Star size={8} className="ml-0.5 text-green-600 fill-current" />
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
          </div>

          {/* Price Row - Tighter */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm md:text-base font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};
