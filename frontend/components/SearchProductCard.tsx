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

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    // Extract specs from product description or variants
    const specs = product.description
        ? product.description.split('\n').filter(s => s.trim()).slice(0, 3)
        : ['Premium Quality', 'Best in Class', 'Top Rated'];

    return (
        <div className="search-product-card">
            <style>{`
                .search-product-card {
                    background-color: white;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    animation: fadeInUp 0.5s ease-out;
                }

                .search-product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .product-badge {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: linear-gradient(135deg, #ff8c00 0%, #ff6600 100%);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(255, 140, 0, 0.3);
                    z-index: 1;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .wishlist-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    border: 2px solid #e0e0e0;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 2;
                }

                .wishlist-btn:hover {
                    transform: scale(1.1);
                    border-color: #ff4444;
                }

                .wishlist-btn:active {
                    transform: scale(0.95);
                }

                .wishlist-btn.active {
                    border-color: #ff4444;
                    background-color: #fff5f5;
                }

                .product-content {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .product-image-wrapper {
                    width: 100%;
                    max-width: 140px;
                    height: 180px;
                    margin: 0 auto;
                    background-color: #f8f9fa;
                    border-radius: 16px;
                    padding: 15px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }

                .search-product-card:hover .product-image {
                    transform: scale(1.05);
                }

                .product-info-section {
                    flex: 1;
                }

                .product-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 12px;
                    line-height: 1.3;
                    letter-spacing: -0.3px;
                    transition: color 0.2s ease;
                }

                .product-title:hover {
                    color: #ff8c00;
                }

                .rating-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }

                .rating-stars {
                    display: flex;
                    gap: 3px;
                }

                .rating-text {
                    font-size: 14px;
                    color: #666;
                    font-weight: 500;
                }

                .specs-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 16px 0;
                }

                .spec-item {
                    font-size: 15px;
                    color: #555;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .spec-bullet {
                    width: 4px;
                    height: 4px;
                    background-color: #ff8c00;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .price-action-section {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .price-info {
                    text-align: left;
                }

                .original-price {
                    font-size: 15px;
                    color: #999;
                    text-decoration: line-through;
                    margin-bottom: 6px;
                    font-weight: 500;
                }

                .current-price-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }

                .current-price {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.5px;
                }

                .discount-badge {
                    background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
                    color: #856404;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    border: 1px solid #ffeaa7;
                }

                .stock-status {
                    font-size: 13px;
                    color: #28a745;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 8px;
                }

                .stock-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #28a745;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }

                .add-to-cart-button {
                    width: 100%;
                    background: linear-gradient(135deg, #ff8c00 0%, #ff6600 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 14px 28px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .add-to-cart-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 140, 0, 0.4);
                }

                .add-to-cart-button:active {
                    transform: translateY(0);
                }

                /* Tablet: 768px - 1023px */
                @media (min-width: 768px) {
                    .product-content {
                        flex-direction: row;
                        align-items: center;
                    }

                    .product-image-wrapper {
                        max-width: 130px;
                    }

                    .price-action-section {
                        align-items: flex-end;
                        min-width: 220px;
                    }

                    .price-info {
                        text-align: right;
                    }

                    .current-price-row {
                        justify-content: flex-end;
                    }

                    .stock-status {
                        justify-content: flex-end;
                    }
                }

                /* Laptop & Desktop: 1024px+ */
                @media (min-width: 1024px) {
                    .product-content {
                        gap: 35px;
                    }

                    .product-image-wrapper {
                        max-width: 140px;
                        flex-shrink: 0;
                    }

                    .price-action-section {
                        min-width: 240px;
                    }

                    .product-title {
                        font-size: 22px;
                    }

                    .current-price {
                        font-size: 28px;
                    }
                }

                /* Mobile: < 768px */
                @media (max-width: 767px) {
                    .search-product-card {
                        padding: 20px;
                        gap: 16px;
                    }

                    .product-badge {
                        top: 12px;
                        left: 12px;
                        font-size: 11px;
                        padding: 5px 10px;
                    }

                    .wishlist-btn {
                        top: 12px;
                        right: 12px;
                        width: 40px;
                        height: 40px;
                    }

                    .product-image-wrapper {
                        max-width: 120px;
                        height: 150px;
                    }

                    .product-title {
                        font-size: 18px;
                    }

                    .spec-item {
                        font-size: 14px;
                    }

                    .current-price {
                        font-size: 24px;
                    }

                    .discount-badge {
                        font-size: 12px;
                        padding: 5px 10px;
                    }

                    .add-to-cart-button {
                        font-size: 14px;
                        padding: 12px 20px;
                    }
                }
            `}</style>

            {/* Discount Badge */}
            {discount > 0 && (
                <div className="product-badge">
                    {discount}% OFF
                </div>
            )}

            {/* Wishlist Button */}
            <button
                onClick={handleToggleWishlist}
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            >
                <Heart
                    size={22}
                    fill={isWishlisted ? '#ff4444' : 'none'}
                    stroke={isWishlisted ? '#ff4444' : '#999'}
                    strokeWidth={2}
                />
            </button>

            {/* Product Content */}
            <div className="product-content">
                {/* Product Image */}
                <div className="product-image-wrapper">
                    <Link to={`/product/${product.id}`}>
                        <LazyImage
                            src={getProductImageUrl(product.image)}
                            alt={product.name}
                            className="product-image"
                        />
                    </Link>
                </div>

                {/* Product Info */}
                <div className="product-info-section">
                    <Link to={`/product/${product.id}`}>
                        <h3 className="product-title">{product.name}</h3>
                    </Link>

                    {/* Rating */}
                    <div className="rating-section">
                        <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    fill={i < Math.floor(product.rating) ? '#ffa500' : '#e0e0e0'}
                                    stroke="none"
                                />
                            ))}
                        </div>
                        <span className="rating-text">
                            {product.reviewsCount.toLocaleString()} reviews
                        </span>
                    </div>

                    {/* Specs */}
                    <ul className="specs-list">
                        {specs.slice(0, 3).map((spec, i) => (
                            <li key={i} className="spec-item">
                                <span className="spec-bullet"></span>
                                {spec}
                            </li>
                        ))}
                        <li className="spec-item">
                            <span className="spec-bullet"></span>
                            1 Year Warranty
                        </li>
                    </ul>
                </div>

                {/* Price & Action */}
                <div className="price-action-section">
                    <div className="price-info">
                        {product.originalPrice > product.price && (
                            <div className="original-price">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                            </div>
                        )}

                        <div className="current-price-row">
                            <span className="current-price">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>

                            {discount > 0 && (
                                <span className="discount-badge">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>

                        <div className="stock-status">
                            <span className="stock-dot"></span>
                            In Stock
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="add-to-cart-button"
                    >
                        <ShoppingCart size={18} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};