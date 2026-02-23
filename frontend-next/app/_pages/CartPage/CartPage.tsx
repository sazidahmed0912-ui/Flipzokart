"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Star, Trash2, Heart, ShieldCheck, ShoppingBag, AlertTriangle, TicketPercent } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { CartItem } from '@/app/types';
import './CartPage.css';
import { calculateCartTotals } from '@/app/utils/priceHelper';
import { getProductImage } from '@/app/utils/imageHelper';
import { applyCoupon } from '@/app/services/api';
import toast from 'react-hot-toast';

const getCartItemKey = (productId: string, variants?: Record<string, string>, variantId?: string) => {
  if (variantId) return variantId;
  if (!variants) return productId;
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${variantString}`;
};

const CartPage = () => {
  const { cart: cartItems, removeFromCart, updateCartQuantity, clearCart, products, removeProductFromCart, isInitialized } = useApp();
  const router = useRouter();

  // DOUBLE-LOCK HYDRATION GATE
  // Ensure we are strictly on the client and mounted before allowing any interaction
  const [isMounted, setIsMounted] = useState(false);

  // --- Real-Time Coupon State ---
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // --- ISOLATED BUY NOW GUARD ---
  // If user navigates to Cart, they are EXITING Buy Now mode.
  useEffect(() => {
    localStorage.removeItem('buyNowItem');
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Re-verify coupon if cart changes
  useEffect(() => {
    if (appliedCoupon && isMounted && cartItems.length > 0) {
      handleApplyCoupon(appliedCoupon.couponCode);
    }
  }, [cartItems]);


  const updateQuantity = (item: CartItem, change: number) => {
    if (!isInitialized || !isMounted) return; // Strict Safety check
    const itemKey = getCartItemKey(item.id, item.selectedVariants, item.variantId);
    const newQuantity = Math.max(1, item.quantity + change);
    updateCartQuantity(itemKey, newQuantity);
  };

  const removeItem = (item: CartItem) => {
    if (!isInitialized || !isMounted) return; // Strict Safety check
    const itemKey = getCartItemKey(item.id, item.selectedVariants, item.variantId);
    removeFromCart(itemKey);
  };

  const handlePlaceOrder = () => {
    if (!isInitialized || !isMounted) return; // Strict Safety check
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify({
        code: appliedCoupon.couponCode,
        discount: appliedCoupon.discountAmount,
        type: appliedCoupon.type
      }));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
    router.push('/checkout');
  };

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(codeToApply.trim());
      if (res.data.success) {
        setAppliedCoupon(res.data.result);
        setCouponCode('');
        if (codeToApply === couponCode) {
          toast.success(`Coupon ${codeToApply.toUpperCase()} applied successfully!`);
        }
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      // Only show error if the user actively clicked sumbit
      if (codeToApply === couponCode) {
        toast.error(error.response?.data?.message || 'Invalid Coupon Code');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('appliedCoupon');
    toast.success('Coupon removed');
  }

  // Proactive Cart Cleanup: Remove items that no longer exist in DB
  // Proactive Cart Cleanup: DISABLED due to "All Items Removed" bug if product list is partial
  // useEffect(() => {
  //   if (isInitialized && isMounted && products.length > 0 && cartItems.length > 0) {
  //     cartItems.forEach(item => {
  //       const productExists = products.find(p => p.id === item.id);
  //       if (!productExists) {
  //         console.warn(`Removing invalid cart item: ${item.name} (${item.id})`);
  //         removeProductFromCart(item.id);
  //       }
  //     });
  //   }
  // }, [products, cartItems, removeProductFromCart, isInitialized, isMounted]);



  // ... existing code ...

  let priceDetails = calculateCartTotals(cartItems);

  if (appliedCoupon) {
    priceDetails.totalAmount = appliedCoupon.finalCartTotal + priceDetails.deliveryCharges + priceDetails.platformFee;
    priceDetails.discount = priceDetails.originalPrice - appliedCoupon.cartTotal + appliedCoupon.discountAmount; // Total savings including normal discount + coupon
  }

  // HYDRATION LOCK: Ensure we wait for context to fully initialize
  // prevent interactions with stale state
  const loading = !isInitialized || !isMounted;

  // Loading skeleton component
  const CartItemSkeleton = () => (
    <div className="cart-item-card skeleton">
      <div className="cart-item-content">
        <div className="item-image-container skeleton-box"></div>
        <div className="item-details">
          <div className="item-info-top">
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-category"></div>
            <div className="skeleton-text skeleton-seller"></div>
            <div className="skeleton-rating"></div>
          </div>
          <div className="item-price-block">
            <div className="skeleton-text skeleton-price"></div>
            <div className="skeleton-text skeleton-discount"></div>
          </div>
        </div>
      </div>
      <div className="item-actions-row">
        <div className="quantity-control">
          <div className="skeleton-btn"></div>
          <div className="skeleton-value"></div>
          <div className="skeleton-btn"></div>
        </div>
        <div className="action-buttons">
          <div className="skeleton-text skeleton-action"></div>
          <div className="skeleton-text skeleton-action"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="cart-page-container">
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-header">
              <h2>My Cart</h2>
            </div>
            <div className="cart-items-list">
              <CartItemSkeleton />
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>
          </div>
          <div className="price-details-section">
            <div className="price-details-card skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-breakdown">
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row skeleton-total"></div>
              </div>
            </div>
            <div className="skeleton-btn-large"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only check for empty cart AFTER initialization is done
  if (isInitialized && cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="flex justify-center mb-6">
            <ShoppingBag size={120} className="text-[#f9f9f9] fill-blue-100 stroke-blue-300" strokeWidth={1.5} />
          </div>
          <h2>Your cart is empty!</h2>
          <p>Explore our wide selection and find something you like</p>
          <Link href="/shop" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>My Cart ({cartItems.length})</h2>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-content">
                  {/* Product Image */}
                  <div className="item-image-container">
                    <img src={getProductImage(item)} alt={item.name} className="item-image" />
                  </div>

                  {/* Product Details */}
                  <div className="item-details">
                    <div className="item-info-top">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-category">{item.category}</p>
                      {item.seller && (
                        <p className="item-seller">Seller: {item.seller}</p>
                      )}

                      {/* STRICT VARIANT UI */}
                      <div className="flex gap-3 my-2">
                        {(item.color) && (
                          <div className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                            Color: {item.color}
                          </div>
                        )}
                        {(item.size) && (
                          <div className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                            Size: {item.size}
                          </div>
                        )}
                        {/* Legacy Fallback */}
                        {!item.color && !item.size && item.selectedVariants && (
                          <div className="text-xs text-gray-500">
                            {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="item-rating">
                        <span>{item.rating}</span>
                        <Star size={12} fill="white" />
                      </div>
                    </div>

                    <div className="item-price-block">
                      <span className="current-price">₹{(item.price || 0).toLocaleString()}</span>
                      <span className="original-price">₹{(item.originalPrice || 0).toLocaleString()}</span>
                      <span className="discount-tag">
                        {item.originalPrice ? Math.round(((item.originalPrice - (item.price || 0)) / item.originalPrice) * 100) : 0}% Off
                      </span>
                    </div>

                    {item.deliveryDate && (
                      <div className="delivery-info">
                        {item.deliveryDate} | <span className="free-delivery">Free</span>
                      </div>
                    )}

                    {item.stock === 0 && (
                      <div className="stock-error">
                        <AlertTriangle size={14} />
                        <span>Out of stock</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Quantity */}
                <div className="item-actions-row">
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item, -1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item, 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="action-buttons desktop-layout-actions gap-4">
                    <button className="cart-action-btn border border-gray-200 rounded px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors uppercase">SAVE FOR LATER</button>
                    <button
                      className="cart-action-btn border border-gray-200 rounded px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors uppercase"
                      onClick={() => removeItem(item)}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="place-order-sticky-mobile">
            <div className="mobile-total">
              <span>₹{priceDetails.totalAmount.toLocaleString()}</span>
              <a href="#details">View Details</a>
            </div>
            <button className="place-order-btn" onClick={handlePlaceOrder}>CONTINUE</button>
          </div>
        </div>

        {/* Right Column: Price Details */}
        <div className="price-details-section">

          {/* Coupon Input Section */}
          <div className="bg-white p-4 rounded text-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] mb-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <TicketPercent size={18} className="text-[#2874F0]" />
              <span className="font-semibold text-gray-800">Apply Coupons</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                <div>
                  <p className="text-green-700 font-bold uppercase text-xs">{appliedCoupon.couponCode} applied</p>
                  <p className="text-green-600 text-xs mt-0.5">You saved ₹{appliedCoupon.discountAmount.toLocaleString()} extra!</p>
                </div>
                <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase cursor-pointer">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#2874F0]"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  className="bg-[#2874F0] text-white px-4 py-2 rounded text-xs font-bold uppercase disabled:opacity-50"
                  onClick={() => handleApplyCoupon()}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                >
                  {isApplyingCoupon ? 'Applying' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="price-details-card">
            <h3 className="price-header">PRICE DETAILS</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Price ({priceDetails.totalItems} items)</span>
                <span>₹{priceDetails.originalPrice.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Discount</span>
                <span className="success-text">- ₹{(priceDetails.originalPrice - priceDetails.totalAmount + priceDetails.deliveryCharges + priceDetails.platformFee).toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Coupons for you</span>
                <span className={appliedCoupon ? "success-text" : "text-gray-500"}>
                  {appliedCoupon ? `- ₹${appliedCoupon.discountAmount.toLocaleString()}` : "Not Apply"}
                </span>
              </div>
              <div className="price-row">
                <span>Delivery Charges</span>
                <span className="success-text">
                  {priceDetails.deliveryCharges === 0 ? <span className="text-green-600">Free (Prepaid)</span> : `₹${priceDetails.deliveryCharges}`}
                </span>
              </div>
              <div className="price-row">
                <span>Platform Fee</span>
                <span>₹{priceDetails.platformFee}</span>
              </div>
              <div className="price-row total-row">
                <span>Total Amount</span>
                <span>₹{priceDetails.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="savings-message">
              You will save ₹{priceDetails.discount.toLocaleString()} on this order
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="place-order-btn desktop-only w-full" onClick={handlePlaceOrder}>CONTINUE</button>

            <div className="security-badge flex items-center justify-center gap-2 text-gray-500 text-xs py-2">
              <ShieldCheck size={18} className="shield-icon text-gray-400" />
              <span>Safe and Secure Payments. 100% Authentic products.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
