import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Grid, List, Search, X, Star } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SearchProductCard } from '../components/SearchProductCard';
import { useApp } from '../store/Context';
import { CATEGORIES } from '../constants';
import { AnimatePresence, motion } from 'framer-motion';

export const ShopPage: React.FC = () => {
  const { products } = useApp();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for search results style
  const [minRating, setMinRating] = useState(0);

  // Default to list view if searching, but allow user toggle
  useEffect(() => {
    if (initialQuery) {
      setViewMode('list');
    }
  }, [initialQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesSearch = p.name.toLowerCase().includes(initialQuery.toLowerCase());
      const matchesRating = p.rating >= minRating;
      return matchesCategory && matchesPrice && matchesSearch && matchesRating;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0; // Relevance (default)
    });
  }, [products, selectedCategory, priceRange, sortBy, initialQuery, minRating]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 200000]);
    setMinRating(0);
    setSortBy('relevance');
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4 bg-white p-3 rounded shadow-sm">
          <span className="font-bold text-gray-800">{filteredProducts.length} Results</span>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* ──────── LEFT SIDEBAR (STICKY) ──────── */}
          <aside className={`
            fixed inset-0 z-50 bg-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 lg:w-[280px] lg:block lg:bg-transparent lg:shadow-none
            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full lg:h-auto overflow-y-auto bg-white lg:rounded-sm lg:shadow-sm p-5">
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X size={24} /></button>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-[#2874F0] font-bold uppercase hover:underline">Clear All</button>
              </div>

              <div className="border-b border-gray-200 pb-5 mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategory === 'All'}
                      onChange={() => setSelectedCategory('All')}
                      className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0]"
                    />
                    <span className={`text-sm ${selectedCategory === 'All' ? 'font-bold text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>All Categories</span>
                  </label>
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0]"
                      />
                      <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-5 mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price</h4>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Min</span>
                  <span className="font-bold text-gray-900">₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="pb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Ratings</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={minRating === rating}
                        onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0]"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{rating}★ & above</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ──────── RIGHT GRID ──────── */}
          <main className="flex-1">

            {/* Top Bar */}
            <div className="bg-white p-4 rounded-sm shadow-sm mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  {initialQuery && <h1 className="text-lg font-medium text-gray-900">Search results for <span className="font-bold italic">"{initialQuery}"</span></h1>}
                  {!initialQuery && <h1 className="text-lg font-bold text-gray-900">{selectedCategory} Products</h1>}
                  <p className="text-xs text-gray-500 mt-1">Check each product page for other buying options</p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-sm font-bold text-gray-900">Sort By</span>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <button onClick={() => setSortBy('relevance')} className={`hover:text-[#2874F0] ${sortBy === 'relevance' ? 'text-[#2874F0] font-bold border-b-2 border-[#2874F0] pb-0.5' : ''}`}>Relevance</button>
                    <button onClick={() => setSortBy('price-low')} className={`hover:text-[#2874F0] ${sortBy === 'price-low' ? 'text-[#2874F0] font-bold border-b-2 border-[#2874F0] pb-0.5' : ''}`}>Price -- Low to High</button>
                    <button onClick={() => setSortBy('price-high')} className={`hover:text-[#2874F0] ${sortBy === 'price-high' ? 'text-[#2874F0] font-bold border-b-2 border-[#2874F0] pb-0.5' : ''}`}>Price -- High to Low</button>
                    <button onClick={() => setSortBy('newest')} className={`hover:text-[#2874F0] ${sortBy === 'newest' ? 'text-[#2874F0] font-bold border-b-2 border-[#2874F0] pb-0.5' : ''}`}>Newest First</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List/Grid */}
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                {filteredProducts.map(product => (
                  viewMode === 'list' ? (
                    <SearchProductCard key={product.id} product={product} />
                  ) : (
                    <ProductCard key={product.id} product={product} />
                  )
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-sm shadow-sm flex flex-col items-center">
                <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="No results" className="w-48 mb-6 opacity-80" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sorry, no results found!</h3>
                <p className="text-gray-500 mb-6">Please check the spelling or try searching for something else</p>
                <button onClick={clearFilters} className="bg-[#2874F0] text-white px-8 py-2 font-bold shadow-sm rounded-sm hover:bg-blue-600">
                  Clear Filters
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay Background */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowFilters(false)}></div>
      )}
    </div>
  );
};
