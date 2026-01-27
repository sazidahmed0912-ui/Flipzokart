import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, CheckCircle } from 'lucide-react';
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
    const navigate = useNavigate();
    const isWishlisted = wishlist.includes(product.id);

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        addToast('success', 'Added to Cart');
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    // Extract specs or use highlights
    // Extract specs or use highlights - REMOVED rendering but keeping variable commented out if needed later or just delete.
    // const highlights = ...

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row relative"
        >
            {/* ──────── TOP/LEFT: IMAGE ──────── */}
            <div className="w-full md:w-[240px] h-[180px] md:h-[240px] p-4 flex items-center justify-center bg-gray-50 md:bg-white relative shrink-0">

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-2 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <Heart
                        size={18}
                        className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
                    />
                </button>

                <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <LazyImage
                        src={getProductImageUrl(product.image)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                </div>
            </div>

            {/* ──────── BOTTOM/RIGHT: CONTENT ──────── */}
            <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-base md:text-lg font-medium text-gray-900 leading-snug hover:text-[#2874F0] mb-2 line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-[3px]">
                            {product.rating.toFixed(1)} <Star size={10} fill="white" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium">({product.reviewsCount?.toLocaleString() || '124'})</span>
                    </div>

                    {/* Highlights (Desktop Only) - REMOVED as per user request */}
                    {/* <ul className="hidden md:block space-y-1 mb-4"> ... </ul> */}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 md:gap-4 mt-auto">
                    {/* Price Section */}
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice > product.price && (
                                <>
                                    <span className="text-xs md:text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                    <span className="text-xs md:text-sm font-bold text-green-600">{discount}% off</span>
                                </>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Free delivery</div>

                        {/* Stock Badge */}
                        {product.countInStock > 0 && product.countInStock < 10 && (
                            <div className="text-xs text-orange-600 font-bold mt-1">
                                Only {product.countInStock} left
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {product.countInStock > 0 ? (
                        <button
                            onClick={handleAddToCart}
                            className="w-full sm:w-auto bg-[#ff9f00] hover:bg-[#f39700] text-white font-bold py-2.5 px-8 rounded-[2px] shadow-sm text-sm uppercase transition-colors"
                        >
                            Add to Cart
                        </button>
                    ) : (
                        <div className="w-full sm:w-auto text-center px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-[2px]">
                            Out of Stock
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};