
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Added ShieldCheck to the imported icons from lucide-react
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, XCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../store/Context';
import { MOCK_COUPONS } from '../constants';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useApp();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
  const navigate = useNavigate();

  const getCartItemKey = (productId: string, variants?: Record<string, string>) => {
    if (!variants) return productId;
    const variantString = Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `${productId}-${variantString}`;
  };

  const subtotal = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_COUPONS.find(c => c.code.toUpperCase() === coupon.toUpperCase());
    if (found) {
      setAppliedCoupon({ code: found.code, discount: found.discount });
      setCoupon('');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      clearCart();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-24 h-24 bg-lightGray rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold text-dark">Your bag is empty</h2>
        <p className="text-gray-500 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Let's find something premium for you!</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all">
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-dark">Shopping Bag</h1>
          <p className="text-gray-500 font-medium">You have {cart.length} item{cart.length > 1 ? 's' : ''} in your bag</p>
        </div>
        <button
          onClick={handleClearCart}
          className="flex items-center gap-2 px-6 py-3 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-100"
        >
          <XCircle size={18} /> Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const itemKey = getCartItemKey(item.id, item.selectedVariants);
            return (
              <div key={itemKey} className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-gray-100 rounded-[2.5rem] group hover:shadow-2xl hover:border-primary/10 transition-all duration-500 relative">
                <div className="w-full sm:w-40 aspect-square bg-lightGray rounded-3xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <Link to={`/product/${item.id}`} className="font-bold text-lg text-dark hover:text-primary transition-colors line-clamp-2 tracking-tight">{item.name}</Link>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{item.category}</p>

                      {item.selectedVariants && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(item.selectedVariants).map(([key, val]) => (
                            <span key={key} className="text-[9px] font-bold bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase tracking-wider">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(itemKey)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-red-100"
                      title="Remove from bag"
                    >
                      <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-6 mt-8">
                    <div className="flex items-center gap-5 bg-lightGray/50 p-1.5 rounded-2xl border border-gray-100">
                      <button
                        onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-dark hover:text-primary hover:shadow-md transition-all active:scale-90 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-dark hover:text-primary hover:shadow-md transition-all active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-dark tracking-tighter">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">₹{(item.price || 0).toLocaleString('en-IN')} / unit</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-start pt-6">
            <Link to="/shop" className="group text-sm font-bold flex items-center gap-3 text-gray-400 hover:text-primary transition-all uppercase tracking-widest">
              <ShoppingBag size={18} /> Add more items <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-32">
            <h3 className="text-2xl font-bold mb-8 tracking-tight text-dark border-b border-gray-50 pb-6">Bag Summary</h3>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-gray-500 font-medium">
                <span className="text-sm">Items Subtotal</span>
                <span className="text-dark font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span className="text-sm">Express Shipping</span>
                <span className={`font-bold text-sm ${shipping === 0 ? 'text-green-600' : 'text-dark'}`}>
                  {shipping === 0 ? 'FREE DELIVERY' : `₹${shipping}`}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium animate-in slide-in-from-right-2 duration-300">
                  <span className="flex items-center gap-2 text-sm"><Tag size={16} /> Promo Applied ({appliedCoupon.code})</span>
                  <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Payable</p>
                    <span className="text-3xl font-bold text-dark tracking-tighter">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Inclusive of taxes</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-8 group">
              <div className="relative flex-grow">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  className="w-full bg-lightGray/50 pl-10 pr-4 py-4 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all uppercase tracking-[0.2em]"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
              </div>
              <button className="bg-dark text-white font-bold px-6 py-4 rounded-2xl hover:bg-primary transition-all text-[10px] tracking-widest shadow-lg shadow-gray-200 active:scale-95 uppercase">
                Apply
              </button>
            </form>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30 uppercase tracking-widest text-sm active:scale-95"
            >
              Secure Checkout <ArrowRight size={20} />
            </button>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                <ShieldCheck size={14} className="text-green-500" /> Fully Secured Checkout
              </div>
              <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 flex items-center justify-center text-[7px] font-bold rounded-lg shadow-sm">VISA</div>
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 flex items-center justify-center text-[7px] font-bold rounded-lg shadow-sm">MC</div>
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 flex items-center justify-center text-[7px] font-bold rounded-lg shadow-sm">UPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
