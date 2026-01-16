import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductGrid from './components/ProductGrid';
import BottomNav from './components/BottomNav';
import { products, createSkeletonProduct } from './data'; // Import createSkeletonProduct
import './ProductListingPage.css';

const ProductListingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Show skeleton for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Generate an array of skeleton products
  const skeletonProducts = Array(10).fill(null).map((_, i) => createSkeletonProduct(`skeleton-${i}`));

  return (
    <div className="product-listing-page">
      <Header />
      <main className="product-listing-main-content">
        <Sidebar />
        <div className="product-list-area">
          {loading ? (
            <ProductGrid products={skeletonProducts} isSkeleton={true} />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default ProductListingPage;