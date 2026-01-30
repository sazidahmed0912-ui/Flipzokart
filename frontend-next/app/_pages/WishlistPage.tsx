"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';;
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import ProfileSidebar from '@/app/components/Profile/ProfileSidebar';

export const WishlistPage: React.FC = () => {
  const router = useRouter();
  const { wishlist, products, toggleWishlist, user } = useApp();

  // Filter the main product list to only show items in the wishlist
  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      {/* Container */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <ProfileSidebar />

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-6">

          {/* PAGE TITLE */}
          <SmoothReveal direction="down" delay={100}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-[#1F2937]">My Wishlist</h1>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                  {wishlistedItems.length} Items
                </span>
              </div>
              {wishlistedItems.length > 0 && (
                <button
                  onClick={() => wishlist.forEach(id => toggleWishlist(id))}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-2 border border-red-100 bg-red-50/50 px-4 py-2 rounded-lg hover:bg-red-50 transition-all uppercase tracking-wider"
                >
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>
          </SmoothReveal>

          {/* MAIN CARD CONTENT */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8 min-h-[500px]">
            {wishlistedItems.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6 animate-in fade-in duration-700">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                    <Heart size={48} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-100">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h2 className="text-xl font-bold text-dark">Your Wishlist is Empty</h2>
                  <p className="text-gray-500 text-sm">
                    Save items that you love in your wishlist and they'll show up here.
                  </p>
                </div>
                <Link href="/shop"
                  className="inline-flex items-center gap-2 bg-[#2874F0] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Start Shopping <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              /* PRODUCT GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedItems.map(product => (
                  <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Helpful Hint */}
          <SmoothReveal direction="up" delay={500}>
            <div className="mt-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2874F0]">
                  <Heart size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2937] text-sm md:text-base">Price Drop Notifications</h4>
                  <p className="text-gray-500 text-xs md:text-sm">We'll notify you if any of your wishlist items go on sale!</p>
                </div>
              </div>
            </div>
          </SmoothReveal>

        </div>
      </div>
    </div>
  );
};
