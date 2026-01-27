import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../store/Context';
import LazyImage from './LazyImage';
import { useToast } from './toast';
import { getProductImageUrl } from '../utils/imageHelper';

interface SearchProductCardProps {
    product: Product;
}

export const SearchProductCard: React.FC<SearchProductCardProps> = ({ product }) => {
    const { addToCart, toggleWishlist, wishlist } = useApp();
    const { addToast } = useToast();
    const isWishlisted = wishlist.includes(product.id);

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product);
        addToast('success', '✅ Product added to bag!');
    };

    // Extract specs from variants or description if available, else placeholder
    // The image shows specs like "12GB RAM, 256GB Storage", "Quad Camera Setup"
    // We'll simulate this from description or just show category/rating
    const specs = [
        "12GB RAM, 256GB Storage", // Placeholder simulation based on image
        "Quad Camera Setup",
        "Snapdragon 888 Processor"
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 relative group">
            {/* Wishlist Button - Top Right Absolute */}
            <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2 rounded-full z-10 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
                    }`}
            >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden relative">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <LazyImage
                        src={getProductImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>
            </div>

            {/* Center: Details */}
            <div className="flex-1 flex flex-col justify-center">
                <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center bg-yellow-400 text-white px-2 py-0.5 rounded text-xs inter font-bold gap-1">
                        <span>{product.rating}</span> <Star size={10} fill="currentColor" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{product.reviewsCount.toLocaleString()} ratings</span>
                </div>

                {/* Specs List (Simulated or from Description) */}
                <ul className="text-sm text-gray-500 space-y-1 mb-4">
                    {specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2 before:content-['•'] before:text-gray-300">
                            {spec}
                        </li>
                    ))}
                    <li className="flex items-center gap-2 before:content-['•'] before:text-gray-300">
                        1 Year Warranty
                    </li>
                </ul>
            </div>

            {/* Right: Price & Action */}
            <div className="w-full md:w-64 flex flex-col justify-center items-start md:items-end gap-2 border-l border-gray-100 pl-0 md:pl-6 md:border-l-0 lg:border-l">
                <div className="flex items-baseline gap-3 mb-1">
                    {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-4">
                        {discount}% OFF
                    </span>
                )}

                <div className="w-full space-y-2 mt-auto">
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1 justify-end w-full mb-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> In Stock
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#ff9f00] text-white font-bold py-2.5 rounded shadow-sm hover:shadow-md hover:bg-[#f39700] transition-all flex items-center justify-center gap-2"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};
