"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Star, Trash2, Heart, ShieldCheck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { CartItem } from '@/app/types';
import './CartPage.css';
import { calculateCartTotals } from '@/app/utils/priceHelper';
import { getProductImage } from '@/app/utils/imageHelper';

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

  // --- ISOLATED BUY NOW GUARD ---
  // If user navigates to Cart, they are EXITING Buy Now mode.
  useEffect(() => {
    localStorage.removeItem('buyNowItem');
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);


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
    router.push('/checkout');
  };

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

  const priceDetails = calculateCartTotals(cartItems);

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
          <div className="price-details-card">
            <h3 className="price-header">PRICE DETAILS</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Price ({priceDetails.totalItems} items)</span>
                <span>₹{priceDetails.originalPrice.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Discount</span>
                <span className="success-text">- ₹{priceDetails.discount.toLocaleString()}</span>
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
