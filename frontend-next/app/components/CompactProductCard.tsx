
"use client";
import React from 'react';
import Link from 'next/link';
;
import { useApp } from '@/app/store/Context';
import { Product } from '@/app/types';
import { useToast } from './toast';

interface ProductCardProps {
  product: Product;
}

export const CompactProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useApp();
  const { addToast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    addToast('success', '✅ Product added to bag!');
  };

  const discount = product.originalPrice > 0
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      {/* Framed Product Image */}
      <div className="p-2">
        <Link href={`/product/${product.id}`} className="block rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 flex flex-col flex-grow">
        <h3 className="font-medium text-gray-700 text-sm line-clamp-2 mb-2 flex-grow hover:text-orange-600">
          <Link href={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {discount > 0 && (
            <span className="text-xs font-medium text-green-600">{discount}% off</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="self-center px-6 h-[36px] flex items-center justify-center bg-[#f28c28] text-white text-xs font-bold rounded-md hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#f28c28] focus:ring-opacity-50"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
