import React, { useState } from 'react';
import { Truck, Clock, Leaf, Star, Filter } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useApp } from '../store/Context';

export const GrocerySection: React.FC = () => {
  const { products } = useApp();
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  const groceryProducts = products.filter(p => p.category === 'Groceries');
  
  const subcategories = [
    'All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Oils', 'Packaged Foods'
  ];

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Express Delivery",
      description: "Get your groceries in 30 minutes"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "100% Fresh",
      description: "Farm-fresh produce guaranteed"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Available",
      description: "Order anytime, anywhere"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Quality Assured",
      description: "Premium quality products"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Fresh Groceries</h2>
        <p className="text-gray-600">Farm-fresh produce delivered to your doorstep</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-green-600 mb-2 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-sm text-gray-800 mb-1">{feature.title}</h3>
            <p className="text-xs text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Subcategory Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Shop by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {subcategories.map(subcat => (
            <button
              key={subcat}
              onClick={() => setSelectedSubcategory(subcat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSubcategory === subcat
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groceryProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {groceryProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No grocery products available</h3>
          <p className="text-gray-500">Check back later for fresh groceries!</p>
        </div>
      )}
    </div>
  );
};
