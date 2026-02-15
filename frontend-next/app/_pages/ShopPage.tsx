"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, Grid, List, Search, X, Star } from 'lucide-react';
import axios from 'axios';
import { ProductCard } from '@/app/components/ProductCard';
import { SearchProductCard } from '@/app/components/SearchProductCard';
import { useApp } from '@/app/store/Context';
import { CATEGORIES } from '@/app/constants';
import { AnimatePresence, motion } from 'framer-motion';
import LazyImage from '@/app/components/LazyImage';
import Link from 'next/link';
import { CategoryPageRenderer } from '@/app/components/renderer/CategoryPageRenderer';

export const ShopPage: React.FC = () => {
  const { products } = useApp();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';
  const initialSub = searchParams.get('sub') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minRating, setMinRating] = useState(0);

  // Dynamic Content State
  const [categoryBanner, setCategoryBanner] = useState('');
  const [mobileCategoryBanner, setMobileCategoryBanner] = useState('');
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [pageLayout, setPageLayout] = useState<any[]>([]);

  // Fetch Category Content
  useEffect(() => {
    if (selectedCategory === 'All') {
      setCategoryBanner('');
      setMobileCategoryBanner('');
      setSubcategories([]);
      setPageLayout([]);
      return;
    }

    const slug = selectedCategory.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    axios.get(`/api/content/categories/${slug}`)
      .then(res => {
        if (res.data) {
          if (res.data.category?.bannerUrl) setCategoryBanner(res.data.category.bannerUrl);
          if (res.data.category?.mobileBannerUrl) setMobileCategoryBanner(res.data.category.mobileBannerUrl);
          if (res.data.category?.pageLayout) setPageLayout(res.data.category.pageLayout);
          if (res.data.subcategories) setSubcategories(res.data.subcategories);
        }
      })
      .catch(err => {
        console.error("No content for category", err);
        setCategoryBanner('');
        setMobileCategoryBanner('');
        setSubcategories([]);
        setPageLayout([]);
      });
  }, [selectedCategory]);

  // Render Custom Layout if Exists
  if (pageLayout && pageLayout.length > 0) {
    return (
      <div className="bg-[#F1F3F6] min-h-screen font-sans pb-10">
        <CategoryPageRenderer layout={pageLayout} />
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesSearch = p.name.toLowerCase().includes(initialQuery.toLowerCase());
      const matchesRating = p.rating >= minRating;
      // Basic subcategory match if param exists (assuming subcategory is part of name or desc for now, as schema might not have it strictly)
      const matchesSub = !initialSub || p.name.toLowerCase().includes(initialSub.toLowerCase()) || p.description.toLowerCase().includes(initialSub.toLowerCase());

      return matchesCategory && matchesPrice && matchesSearch && matchesRating && matchesSub;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0; // Relevance
    });
  }, [products, selectedCategory, priceRange, sortBy, initialQuery, minRating, initialSub]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 200000]);
    setMinRating(0);
    setSortBy('relevance');
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto px-2 lg:px-6 py-2 lg:py-4">

        {/* Category Banner */}
        {(categoryBanner || mobileCategoryBanner) && (
          <div className="mb-4 w-full h-[150px] md:h-[250px] relative rounded-xl overflow-hidden shadow-sm">
            {/* Desktop Image */}
            <div className={`${mobileCategoryBanner ? 'hidden md:block' : 'block'} w-full h-full relative`}>
              <LazyImage src={categoryBanner || mobileCategoryBanner} alt={selectedCategory} fill className="object-cover" />
            </div>
            {/* Mobile Image */}
            {mobileCategoryBanner && (
              <div className="block md:hidden w-full h-full relative">
                <LazyImage src={mobileCategoryBanner} alt={selectedCategory} fill className="object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-4 bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
            <div className="flex gap-6 min-w-max md:justify-center">
              {subcategories.map(sub => (
                <Link key={sub._id} href={`/shop?category=${selectedCategory}&sub=${sub.name}`} className="flex flex-col items-center gap-2 group min-w-[64px]">
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 overflow-hidden group-hover:border-blue-500 transition-colors">
                    {sub.iconUrl ? (
                      <LazyImage src={sub.iconUrl} alt={sub.name} width="64" height="64" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">{sub.name[0]}</div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">{sub.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Filter Toggle - Sticky */}
        <div className="lg:hidden flex justify-between items-center mb-2 bg-white p-2 rounded shadow-sm sticky top-[60px] z-30">
          <span className="font-bold text-gray-800 text-sm">{filteredProducts.length} Results</span>
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

            {/* Top Bar - Mobile Optimized */}
            <div className="bg-white p-2 sm:p-4 rounded-sm shadow-sm mb-2 sm:mb-4">
              <div className="flex flex-col gap-2 sm:gap-4">

                {/* Header & Result Count */}
                <div className="flex justify-between items-center">
                  <div>
                    {initialQuery && <h1 className="text-sm sm:text-lg font-medium text-gray-900 line-clamp-1">Search results for <span className="font-bold italic">"{initialQuery}"</span></h1>}
                    {!initialQuery && <h1 className="text-sm sm:text-lg font-bold text-gray-900">{selectedCategory} Products</h1>}
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Check each product page for options</p>
                  </div>
                </div>

                {/* Sort Options - Scrollable on Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <span className="text-sm font-bold text-gray-900 hidden sm:block">Sort By</span>

                  <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 overflow-x-auto pb-0 sm:pb-0 whitespace-nowrap scrollbar-hide">
                    {[
                      { label: 'Relevance', value: 'relevance' },
                      { label: 'Price -- Low to High', value: 'price-low' },
                      { label: 'Price -- High to Low', value: 'price-high' },
                      { label: 'Newest First', value: 'newest' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`
                          px-3 py-1.5 sm:px-0 sm:py-0 rounded-full sm:rounded-none border sm:border-0 transition-colors
                          ${sortBy === option.value
                            ? 'bg-[#2874F0] text-white border-[#2874F0] sm:bg-transparent sm:text-[#2874F0] sm:font-bold sm:border-b-2 sm:border-[#2874F0] sm:pb-0.5'
                            : 'border-gray-300 text-gray-600 hover:text-[#2874F0] hover:border-[#2874F0]'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products List/Grid */}
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"}>
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
