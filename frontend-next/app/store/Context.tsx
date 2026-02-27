"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CartItem, Product, Order, Address } from '@/app/types';
import { MOCK_PRODUCTS } from '@/app/constants';
import authService from '@/app/services/authService';
import { fetchProducts, updateOrderStatus as updateOrderStatusAPI } from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';
import { useToast } from '@/app/components/toast';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  removeProductFromCart: (key: string) => void;
  updateCartQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isAdmin: boolean;
  logout: () => void;
  orders: Order[];
  placeOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  isInitialized: boolean;
  loginSequence: (token: string, userData: User) => Promise<void>; // 🟢 Exposed for MobileOtpLogin
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 🟢 5️⃣ STABLE KEY GENERATOR
const getCartItemKey = (productId: string, variants?: Record<string, string>, variantId?: string) => {
  if (variantId) return variantId;
  if (!variants) return productId;
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${variantString}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydrated = typeof window !== 'undefined';
  const [isInitialized, setIsInitialized] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const { addToast } = useToast();


  // 🟢 7️⃣ HYDRATION (STRICT SEPARATION)
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('flipzokart_user');

        if (token && savedUser) {
          // 🟦 LOGGED IN PATH
          try {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser && parsedUser.id) {
              setUser(parsedUser);

              // 🟢 HARD RESET BROKEN LEGACY CART (Rule 2)
              localStorage.removeItem('flipzokart_cart');

              // Fetch Server Cart
              await refreshServerCartInternal(token);
            } else {
              throw new Error("Invalid user");
            }
          } catch (e) {
            console.warn("Invalid user session, clearing.", e);
            localStorage.removeItem('token');
            localStorage.removeItem('flipzokart_user');
            // Fallback to guest
            loadGuestCart();
          }
        } else {
          // ⬜ GUEST PATH
          loadGuestCart();
        }

        // Load other state
        const savedWishlist = localStorage.getItem('flipzokart_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

        const savedOrders = localStorage.getItem('flipzokart_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedAddress = localStorage.getItem('flipzokart_selected_address');
        if (savedAddress) setSelectedAddress(JSON.parse(savedAddress));

      } catch (e) {
        console.error("Hydration failed", e);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []); // Run once

  const loadGuestCart = () => {
    const savedCart = localStorage.getItem('flipzokart_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (e) {
        localStorage.removeItem('flipzokart_cart');
      }
    }
  };

  // Internal helper to fetch server cart
  const refreshServerCartInternal = async (token: string) => {
    try {
      setIsCartLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCart(data);
      }
    } catch (e) {
      console.error("Server cart fetch failed", e);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await fetchProducts();
        const productList = Array.isArray(data) ? data : (data.products || data.data || []);
        setProducts(productList);
        localStorage.setItem('flipzokart_products', JSON.stringify(productList));
      } catch (error) {
        const saved = localStorage.getItem('flipzokart_products');
        if (saved) setProducts(JSON.parse(saved));
        else setProducts(MOCK_PRODUCTS.slice().reverse());
      }
    };
    loadProducts();

    // Global Auth Restore is handled in init logic above
  }, []);

  // 🟢 LOGIN SEQUENCE (Rule 4)
  const loginSequence = async (token: string, userData: User) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('flipzokart_user', JSON.stringify(userData));

      // 1. Fetch Server Cart (Initial State)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // (We don't strictly need to set it yet, but good to know connection works)

      // 2. Get Guest Cart
      const guestCartStr = localStorage.getItem('flipzokart_cart');
      const guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];

      // 3. Merge ONLY IF guest exists
      if (Array.isArray(guestCart) && guestCart.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/merge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: guestCart }),
        });
      }

      // 4. Clear guest cart forever
      localStorage.removeItem('flipzokart_cart');

      // 5. Final Truth = Server
      await refreshServerCartInternal(token);

      // Set User Last
      setUser(userData);

    } catch (e) {
      console.error("Login sequence failed", e);
      addToast('error', 'Login Sync Failed');
      // Even if failed, we set user to allow access
      setUser(userData);
    }
  };

  // 🟢 ADD TO CART (Rule 3 & 6)
  const addToCart = async (item: CartItem, quantity: number = 1) => {
    const token = localStorage.getItem('token');

    if (token && user) {
      // 🟦 USER: Server First
      try {
        // Optimistic UI could go here, but prompt says "Server First" for safety
        // We will do "Optimistic" to prevent UI freeze, but Revert on fail?
        // OR: Wait for server. Let's wait for server for "Zero Duplication Guarantee".
        // To avoid UI freeze, we can verify with toast or loading state.

        // Current Backend `updateCart` takes FULL cart.
        // We need to fetch current, add, then PUT? No that's race condition.
        // Backend `merge` adds items. We can use `/api/cart/merge` for adding single item too!
        // It merges quantities. Perfect.

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/merge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: [{ ...item, quantity }] }),
        });

        await refreshServerCartInternal(token);
        addToast('success', 'Added to cart');

      } catch (e) {
        console.error("Add to cart failed", e);
        addToast('error', 'Failed to add item');
      }

    } else {
      // ⬜ GUEST: Local Only
      const itemKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (p) => getCartItemKey(p.productId, p.selectedVariants, p.variantId) === itemKey
        );
        let next;
        if (existingIndex > -1) {
          next = prev.map((p, i) => i === existingIndex ? { ...p, quantity: p.quantity + quantity } : p);
        } else {
          next = [...prev, { ...item, quantity }];
        }
        localStorage.setItem('flipzokart_cart', JSON.stringify(next));
        return next;
      });
      addToast('success', 'Added to cart');
    }
  };

  // 🟢 REMOVE FROM CART (Rule 5)
  const removeFromCart = async (key: string) => {
    const token = localStorage.getItem('token');

    if (token && user) {
      // 🟦 USER: Server First
      // Since we don't have DELETE endpoint, we must use PUT (Update).
      // To be safe: Filter current cart state -> PUT -> Fetch.
      // This is safe because "Remove" is idempotent-ish (if it's gone, it's gone).
      const newCart = cart.filter((item) => {
        const currentKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);
        return currentKey !== key;
      });

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart: newCart })
        });
        await refreshServerCartInternal(token);
      } catch (e) {
        console.error("Remove failed", e);
        addToast('error', 'Failed to remove item');
      }

    } else {
      // ⬜ GUEST: Local Only
      setCart((prev) => {
        const next = prev.filter((item) => {
          const currentKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);
          return currentKey !== key;
        });
        localStorage.setItem('flipzokart_cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const removeProductFromCart = (key: string) => removeFromCart(key); // Alias

  const updateCartQuantity = async (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }

    const token = localStorage.getItem('token');
    if (token && user) {
      // 🟦 USER
      const newCart = cart.map((item) =>
        getCartItemKey(item.productId, item.selectedVariants, item.variantId) === key
          ? { ...item, quantity: qty }
          : item
      );
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart: newCart })
        });
        await refreshServerCartInternal(token);
      } catch (e) {
        console.error("Update failed", e);
      }
    } else {
      // ⬜ GUEST
      setCart((prev) => {
        const next = prev.map((item) =>
          getCartItemKey(item.productId, item.selectedVariants, item.variantId) === key
            ? { ...item, quantity: qty }
            : item
        );
        localStorage.setItem('flipzokart_cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('flipzokart_cart');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('flipzokart_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const placeOrder = (order: Order) => {
    setOrders(prev => {
      const next = [order, ...prev];
      localStorage.setItem('flipzokart_orders', JSON.stringify(next));
      return next;
    });
    // Use clearCart which handles local storage removal
    clearCart();
    // For logged in user, maybe also clear server cart?
    // Usually backend clears cart on order placement.
    if (user) refreshServerCartInternal(localStorage.getItem('token') || '');
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusAPI(orderId, status);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('error', 'Failed to update order status');
    }
  };

  const isAdmin = user?.role === 'admin';

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      clearCart();
      setWishlist([]);
      localStorage.removeItem('flipzokart_user');
      localStorage.removeItem('flipzokart_wishlist');
      localStorage.removeItem('token');
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
  };

  // Real-time Socket (Keep as is, but rely on server truth)
  const socket = useSocket(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  useEffect(() => {
    if (!socket) return;
    socket.on('newProduct', (newProduct: Product) => setProducts(prev => [newProduct, ...prev]));
    socket.on('productUpdated', (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)));
    socket.on('deleteProduct', (productId: string) => setProducts(prev => prev.filter(p => p.id !== productId)));
    return () => {
      socket.off('newProduct');
      socket.off('productUpdated');
      socket.off('deleteProduct');
    };
  }, [socket]);


  return (
    <AppContext.Provider value={{
      user, setUser, cart, addToCart, removeFromCart, removeProductFromCart, updateCartQuantity, clearCart,
      wishlist, toggleWishlist, isAdmin, logout, orders, placeOrder, updateOrderStatus,
      products, setProducts, selectedAddress, setSelectedAddress, isInitialized,
      loginSequence
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
