import React from 'react';
import { Product } from '../data';
import ProductCard from './ProductCard';
import SkeletonLoader from './SkeletonLoader'; // Import SkeletonLoader
import '../ProductListingPage.css';

interface ProductGridProps {
  products: Product[];
  isSkeleton?: boolean; // New prop to indicate if it's rendering skeletons
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isSkeleton }) => {
  return (
    <div className="product-grid-container">
      {products.map((product, index) => (
        isSkeleton ? (
          <SkeletonLoader key={`skeleton-${index}`} />
        ) : (
          <ProductCard key={product.id} product={product} />
        )
      ))}
    </div>
  );
};

export default ProductGrid;