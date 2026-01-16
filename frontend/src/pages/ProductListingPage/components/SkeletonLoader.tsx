import React from 'react';
import '../ProductListingPage.css';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="product-card-image-container skeleton-image">
        {/* Image skeleton */}
      </div>
      <div className="product-card-details">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-rating"></div>
        <div className="price-block">
          <div className="skeleton-line skeleton-price"></div>
          <div className="skeleton-line skeleton-discount"></div>
        </div>
        <div className="skeleton-line skeleton-delivery"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
