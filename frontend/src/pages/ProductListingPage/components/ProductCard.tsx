import React from 'react';
import { Product } from '../data';
import '../ProductListingPage.css'; // Import the CSS file for styling

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-card-image-container">
        <img src={product.image} alt={product.name} className="product-card-image" />
        <button className="wishlist-icon" aria-label="Add to wishlist">❤️</button> {/* Placeholder for wishlist icon */}
      </div>
      <div className="product-card-details">
        <h3 className="product-card-title">{product.name}</h3>
        <div className="product-card-rating">
          <span className="star-rating">⭐ {product.rating}</span>
          <span className="review-count">({product.reviewCount})</span>
        </div>
        <div className="price-block">
          <span className="discounted-price">{formatPrice(product.discountPrice)}</span>
          <span className="original-price">{formatPrice(product.price)}</span>
          <span className="discount-percentage">{product.discountPercentage}% off</span>
        </div>
        {product.assured && <div className="assured-badge">✔️ Assured</div>} {/* Placeholder for assured badge */}
        <p className="delivery-text">{product.deliveryText}</p>
        <button className="add-to-cart-button">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
