"use client";
import React, { useState } from 'react';
import { Truck, Clock, Leaf, Star, Filter } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useApp } from '@/app/store/Context';

export const GrocerySection: React.FC = () => {
  const { products } = useApp();
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  const groceryProducts = products.filter(p => p.category === 'Groceries');

  const subcategories = [
    'All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Oils', 'Packaged Foods'
  ];

  const features = [
    {
      icon: <Truck className="w-4 h-4 md:w-6 md:h-6" />,
      title: "Express Delivery",
      description: "Get your groceries in 30 minutes"
    },
    {
      icon: <Leaf className="w-4 h-4 md:w-6 md:h-6" />,
      title: "100% Fresh",
      description: "Farm-fresh produce guaranteed"
    },
    {
      icon: <Clock className="w-4 h-4 md:w-6 md:h-6" />,
      title: "24/7 Available",
      description: "Order anytime, anywhere"
    },
    {
      icon: <Star className="w-4 h-4 md:w-6 md:h-6" />,
      title: "Quality Assured",
      description: "Premium quality products"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 md:p-6 mb-4 md:mb-8">
      {/* Header */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Fresh Groceries</h2>
        <p className="text-xs md:text-base text-gray-600">Farm-fresh produce delivered to your doorstep</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl p-2 md:p-4 text-center shadow-sm border border-green-100">
            <div className="text-green-600 mb-1 md:mb-2 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-xs md:text-sm text-gray-800 mb-0.5 md:mb-1 leading-tight">{feature.title}</h3>
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight hidden sm:block">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Subcategory Filter */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          <h3 className="font-semibold text-sm md:text-base text-gray-800">Shop by Category</h3>
        </div>
        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {subcategories.map(subcat => (
            <button
              key={subcat}
              onClick={() => setSelectedSubcategory(subcat)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedSubcategory === subcat
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
            >
              {subcat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {groceryProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {groceryProducts.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Leaf className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-1 md:mb-2">No grocery products available</h3>
          <p className="text-xs md:text-base text-gray-500">Check back later for fresh groceries!</p>
        </div>
      )}
    </div>
  );
};
