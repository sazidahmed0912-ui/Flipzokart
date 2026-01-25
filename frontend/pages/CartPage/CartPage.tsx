import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Star, Trash2, Heart, ShieldCheck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useApp } from '../../store/Context';
import { CartItem } from '../../types';
import './CartPage.css';

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

  const calculatePriceDetails = () => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const originalPrice = cartItems.reduce((acc, item) => acc + ((item.originalPrice || 0) * item.quantity), 0);
    const sellingPrice = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
    const discount = originalPrice - sellingPrice;
    const deliveryCharges = sellingPrice > 500 ? 0 : 40;
    const platformFee = 3;
    const totalAmount = sellingPrice + deliveryCharges + platformFee;

    return {
      totalItems,
      originalPrice,
      discount,
      deliveryCharges,
      platformFee,
      totalAmount
    };
  };

  const priceDetails = calculatePriceDetails();
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
          <img
            src="/user-shopping-bags.jpg"
            alt="Empty Cart"
            className="empty-cart-image"
          />
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
          <div className="cart-header">
            <h2>My Cart ({cartItems.length})</h2>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-content">
                  {/* Product Image */}
                  <div className="item-image-container">
                    <img src={item.image} alt={item.name} className="item-image" />
                  </div>

                  {/* Product Details */}
                  <div className="item-details">
                    <div className="item-info-top">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-category">{item.category}</p>
                      {item.seller && (
                        <p className="item-seller">Seller: {item.seller}</p>
                      )}
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

                  <div className="action-buttons desktop-layout-actions">
                    <button className="cart-action-btn border-r">SAVE FOR LATER</button>
                    <button
                      className="cart-action-btn"
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

          <div className="security-badge">
            <ShieldCheck size={20} className="shield-icon" />
            <span>Safe and Secure Payments. 100% Authentic products.</span>
          </div>

          <button className="place-order-btn desktop-only" onClick={handlePlaceOrder}>CONTINUE</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
