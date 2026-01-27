import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Star, Trash2, Heart, ShieldCheck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useApp } from '../../store/Context';
import { CartItem } from '../../types';
import './CartPage.css';
import { calculateCartTotals } from '../../utils/priceHelper';

const getCartItemKey = (productId: string, variants?: Record<string, string>) => {
  if (!variants) return productId;
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${variantString}`;
};

const CartPage = () => {
  const { cart: cartItems, removeFromCart, updateCartQuantity, clearCart, products, removeProductFromCart } = useApp();
  const navigate = useNavigate();

  const updateQuantity = (item: CartItem, change: number) => {
    const itemKey = getCartItemKey(item.id, item.selectedVariants);
    const newQuantity = Math.max(1, item.quantity + change);
    updateCartQuantity(itemKey, newQuantity);
  };

  const removeItem = (item: CartItem) => {
    const itemKey = getCartItemKey(item.id, item.selectedVariants);
    removeFromCart(itemKey);
  };

  const handlePlaceOrder = () => {
    navigate('/checkout');
  };

  // Proactive Cart Cleanup: Remove items that no longer exist in DB
  useEffect(() => {
    if (products.length > 0 && cartItems.length > 0) {
      cartItems.forEach(item => {
        const productExists = products.find(p => p.id === item.id);
        if (!productExists) {
          console.warn(`Removing invalid cart item: ${item.name} (${item.id})`);
          removeProductFromCart(item.id);
        }
      });
    }
  }, [products, cartItems, removeProductFromCart]);



  // ... existing code ...

  const priceDetails = calculateCartTotals(cartItems);
  const loading = false; // Set to false as we're using Context which loads from localStorage

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

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="flex justify-center mb-6">
            <ShoppingBag size={120} className="text-[#f9f9f9] fill-blue-100 stroke-blue-300" strokeWidth={1.5} />
          </div>
          <h2>Your cart is empty!</h2>
          <p>Explore our wide selection and find something you like</p>
          <Link to="/shop" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-section">
          <div className="bg-white rounded-[4px] shadow-sm border border-[#f0f0f0] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
              <h2 className="text-[18px] font-medium text-[#212121]">My Cart ({cartItems.length})</h2>
            </div>

            {/* Items List */}
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 border-b border-[#f0f0f0] last:border-b-0 flex flex-col gap-4">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-[112px] h-[112px] flex-shrink-0 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-[16px] font-medium text-[#212121] leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                      <p className="text-[14px] text-[#878787] mt-1">{item.category}</p>
                      {item.seller && (
                        <p className="text-[12px] text-[#878787] mt-1">Seller: {item.seller}</p>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-[14px] text-[#878787] line-through">₹{(item.originalPrice || 0).toLocaleString()}</span>
                      <span className="text-[18px] font-semibold text-[#212121]">₹{(item.price || 0).toLocaleString()}</span>
                      <span className="text-[14px] font-medium text-[#388e3c]">{item.originalPrice ? Math.round(((item.originalPrice - (item.price || 0)) / item.originalPrice) * 100) : 0}% Off</span>
                    </div>


                  </div>
                </div>

                {/* Actions Row: Quantity & Buttons */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-[28px] h-[28px] rounded-full border border-[#c2c2c2] bg-white flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 transition"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item, -1)}
                    >
                      <Minus size={14} className="text-[#212121]" />
                    </button>
                    <div className="min-w-[46px] h-[28px] border border-[#c2c2c2] bg-white flex items-center justify-center text-[14px] font-medium text-[#212121]">
                      {item.quantity}
                    </div>
                    <button
                      className="w-[28px] h-[28px] rounded-full border border-[#c2c2c2] bg-white flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 transition"
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item, 1)}
                    >
                      <Plus size={14} className="text-[#212121]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <button className="text-[16px] font-semibold text-[#212121] hover:text-[#2874f0] uppercase transition-colors">SAVE FOR LATER</button>
                    <button
                      className="text-[16px] font-semibold text-[#212121] hover:text-[#2874f0] uppercase transition-colors"
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
                  {priceDetails.deliveryCharges === 0 ? 'Free' : `₹${priceDetails.deliveryCharges}`}
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
