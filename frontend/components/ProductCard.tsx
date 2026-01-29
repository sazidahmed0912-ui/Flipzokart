
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../store/Context';
import LazyImage from './LazyImage';
import { useToast } from './toast';
import { getProductImageUrl } from '../utils/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const { addToast } = useToast();
  const isWishlisted = wishlist.includes(product.id);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart(product);
    addToast('success', '✅ Product added to bag!');
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="relative w-full h-40 md:h-48 overflow-hidden bg-gray-50">
        <Link to={`/product/${product.id}`}>
          <LazyImage
            src={getProductImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full shadow-md z-10 transition-colors ${isWishlisted ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-primary'
            }`}
        >
          <Heart size={16} className="md:w-[18px] md:h-[18px]" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        {discount > 0 && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        <p className="text-[10px] md:text-xs text-gray-400 mb-1 truncate">{product.category}</p>
        <Link to={`/product/${product.id}`} className="font-semibold text-xs md:text-sm line-clamp-2 mb-2 hover:text-primary transition-colors min-h-[32px] md:min-h-[40px]">
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
          <div className="flex items-center text-yellow-400 bg-yellow-50 px-1 rounded">
            <Star size={10} className="md:w-3 md:h-3" fill="currentColor" />
            <span className="text-[10px] md:text-xs font-bold ml-1 text-dark">{product.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5 md:gap-2 mb-3 flex-wrap">
            <span className="text-base md:text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] md:text-sm text-green-600 font-semibold hidden md:inline-block">{discount}% off</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5 md:gap-2 active:scale-95"
          >
            <ShoppingCart size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
