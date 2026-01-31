
"use client";
import React from 'react';
import Link from 'next/link';
import { useApp } from '@/app/store/Context';
import { Product } from '@/app/types';
import { resolveProductImage } from '@/app/utils/imageHelper';
import LazyImage from './LazyImage';
import { useToast } from './toast';

interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'featured';
}

export const NewProductCard: React.FC<ProductCardProps> = ({ product, variant = 'featured' }) => {
  const { addToCart } = useApp();
  const { addToast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    addToast('success', '✅ Product added to bag!');
  };

  const discount = product.originalPrice > 0
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
        <Link href={`/product/${product.id}`}>
          <div className="w-full h-32 md:h-40 mb-3 bg-gray-100 rounded-lg p-2 border border-gray-200">
            <LazyImage src={resolveProductImage(product)} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          </div>
        </Link>
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 h-10">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice > 0 && <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
        </div>
        {discount > 0 && <span className="text-xs text-green-600 font-medium">{discount}% off</span>}
        <button
          onClick={handleAddToCart}
          className="w-full mt-3 bg-[#f28c28] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
          Add to Cart
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <Link href={`/product/${product.id}`}>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mb-3">
          <LazyImage
            src={resolveProductImage(product)}
            alt={product.name}
            className="w-full h-32 md:h-40 object-cover rounded-lg"
          />
        </div>
      </Link>
      <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 h-10">{product.name}</h3>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice > 0 && <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
        </div>
        {discount > 0 && <span className="text-xs text-green-600 font-medium">{discount}% off</span>}
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full bg-[#f28c28] text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
        Add to Cart
      </button>
    </div>
  );
};
