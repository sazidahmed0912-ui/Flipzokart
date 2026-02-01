"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/app/types';
import { useApp } from '@/app/store/Context';
import { useToast } from './toast';
import { getProductImage } from '@/app/utils/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const { addToast } = useToast();
  const isWishlisted = wishlist.includes(product.id);

  // Robust Image Selection
  const [imgSrc, setImgSrc] = useState<string>("/placeholder.png");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Priority: product.images[0] -> product.image -> placeholder
    const resolvedUrl = getProductImage(product);
    setImgSrc(resolvedUrl);
    setIsLoading(true);
  }, [product]);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if clicked on button
    addToCart(product);
    addToast('success', '✅ Product added to bag!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  }

  return (
    <div className="group bg-white rounded-lg md:rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="relative w-full h-36 md:h-48 overflow-hidden bg-white flex items-center justify-center p-4">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 transition-opacity duration-300">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={imgSrc}
            alt={product.name}
            width={300}
            height={300}
            className={`w-full h-full object-contain transition-transform duration-300 hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImgSrc("/placeholder.png");
              setIsLoading(false);
            }}
            unoptimized={true}
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

      <div className="p-2 md:p-4 flex flex-col flex-grow">
        <p className="text-[9px] md:text-xs text-gray-400 mb-0.5 md:mb-1 truncate">{product.category}</p>
        <Link href={`/product/${product.id}`} className="font-semibold text-xs md:text-sm line-clamp-2 mb-1 md:mb-2 hover:text-primary transition-colors min-h-[32px] md:min-h-[40px] leading-tight">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 md:gap-2 mb-1.5 md:mb-3">
          <div className="flex items-center text-yellow-400 bg-yellow-50 px-1 rounded">
            <Star size={10} className="md:w-3 md:h-3" fill="currentColor" />
            <span className="text-[10px] md:text-xs font-bold ml-1 text-dark">{product.rating}</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-gray-400">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto pt-1 md:pt-2">
          <div className="flex items-baseline gap-1 md:gap-2 mb-2 md:mb-3 flex-wrap">
            <span className="text-sm md:text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] md:text-sm text-green-600 font-semibold hidden md:inline-block">{discount}% off</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full h-8 md:h-auto py-0 md:py-2 bg-primary text-white text-xs md:text-sm font-semibold rounded-md md:rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5 md:gap-2 active:scale-95"
          >
            <ShoppingCart size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
