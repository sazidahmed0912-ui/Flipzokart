
import React from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { CompactProductCard } from './CompactProductCard';

export const FeaturedProducts: React.FC = () => {
  const featured = MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 8);

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-gray-600">Featured on </span>
            <span className="text-[#222]">Flipzo</span><span className="text-[#f28c28]">kart</span>
          </h2>
          <div className="mt-3 h-1 w-20 bg-[#f28c28] mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 justify-items-center">
          {featured.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
