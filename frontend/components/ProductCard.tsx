
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
      <div className="relative w-full h-48 overflow-hidden bg-gray-50">
        <Link to={`/product/${product.id}`}>
          <LazyImage
            src={getProductImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md z-10 transition-colors ${isWishlisted ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-primary'
            }`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`} className="font-semibold text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
          {product.name}
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold ml-1 text-dark">{product.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && (
              <span className="text-sm text-green-600 font-semibold">{discount}% off</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
