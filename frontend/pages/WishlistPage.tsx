
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../store/Context';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, toggleWishlist } = useApp();
  
  // Filter the main product list to only show items in the wishlist
  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  if (wishlistedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
            <Heart size={64} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary">
            <ShoppingBag size={24} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-bold tracking-tight text-dark">Your Wishlist is Empty</h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">
            Save items that you love in your wishlist and they'll show up here so you can find them again easily.
          </p>
        </div>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-3 bg-dark text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-primary hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
        >
          Start Exploring <ArrowRight size={22} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-dark">My Wishlist</h1>
          <p className="text-gray-500 font-medium mt-2">You have {wishlistedItems.length} items saved for later.</p>
        </div>
        <button 
          onClick={() => wishlist.forEach(id => toggleWishlist(id))}
          className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-2 border-2 border-red-50 px-6 py-3 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest"
        >
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {wishlistedItems.map(product => (
          <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Helpful Hint */}
      <div className="mt-20 p-10 bg-lightGray/50 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
             <Heart size={32} fill="currentColor" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-dark">Price Drop Notifications</h4>
            <p className="text-gray-500">We'll notify you if any of your wishlist items go on sale!</p>
          </div>
        </div>
        <Link to="/shop" className="text-primary font-bold hover:underline flex items-center gap-2">
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
