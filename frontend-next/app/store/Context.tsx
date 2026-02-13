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
  // 🟢 7️⃣ HYDRATION PROTECTION
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Hydrate from LocalStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('flipzokart_user');
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Strict validation to prevent crashes
          if (parsedUser && parsedUser.id && (parsedUser.email || parsedUser.phone)) {
            setUser(parsedUser);
          } else {
            console.warn("Invalid user data in localStorage, clearing.");
            localStorage.removeItem('flipzokart_user');
          }
        } catch (e) {
          console.warn("Failed to parse user data", e);
          localStorage.removeItem('flipzokart_user');
        }
      }

      const savedCart = localStorage.getItem('flipzokart_cart'); // 🟢 2️⃣ UI -> LocalStorage (Initial Truth)
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            // Filter out invalid items (e.g. missing productId) to prevent crashes
            const validItems = parsedCart.filter(item => item.productId && item.quantity > 0);
            setCart(validItems);
          }
        } catch (e) {
          console.warn("Corrupted cart data found in localStorage, clearing it.");
          localStorage.removeItem('flipzokart_cart');
        }
      }

      const savedWishlist = localStorage.getItem('flipzokart_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem('flipzokart_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedAddress = localStorage.getItem('flipzokart_selected_address');
      if (savedAddress) setSelectedAddress(JSON.parse(savedAddress));

    } catch (e) {
      console.error("Failed to hydrate state", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await fetchProducts();
        const productList = Array.isArray(data) ? data : (data.products || data.data || []);
        setProducts(productList);
        localStorage.setItem('flipzokart_products', JSON.stringify(productList));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        const saved = localStorage.getItem('flipzokart_products');
        if (saved) setProducts(JSON.parse(saved));
        else setProducts(MOCK_PRODUCTS.slice().reverse());
      }
    };
    loadProducts();

    // Global Auth Restore
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Token invalid");
          return res.json();
        })
        .then(userData => {
          console.log("Global Auth Restored:", userData);
          setUser(userData);
        })
        .catch((err) => {
          console.warn("Auth restore failed, clearing session.", err);
          localStorage.removeItem("token");
          localStorage.removeItem("flipzokart_user");
          setUser(null);
        });
    }
  }, []);

  // 🟢 4️⃣ REFRESH SERVER CART
  const refreshServerCart = useCallback(async () => {
    if (!user) return;
    try {
      setIsCartLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const serverCart = await response.json();
        // 🟢 Server is Truth for Logged In User
        if (Array.isArray(serverCart)) {
          setCart(serverCart);
          localStorage.setItem('flipzokart_cart', JSON.stringify(serverCart)); // Update local cache
        }
      }
    } catch (err) {
      console.error("Failed to fetch server cart", err);
    } finally {
      setIsCartLoading(false);
    }
  }, [user]);

  // 🟢 3️⃣ GUEST -> LOGIN MERGE
  const isMergingRef = React.useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    // Reset merge lock if user logs out
    if (!user) {
      isMergingRef.current = false;
      return;
    }

    // Prevent double execution
    if (isMergingRef.current) return;

    const mergeGuestCart = async () => {
      const guestCartStr = localStorage.getItem("flipzokart_cart");
      if (!guestCartStr) {
        // No guest cart, just fetch server cart
        await refreshServerCart();
        return;
      }

      const guestCart = JSON.parse(guestCartStr);
      if (!Array.isArray(guestCart) || guestCart.length === 0) {
        await refreshServerCart();
        return;
      }

      // Lock
      isMergingRef.current = true;

      // We have guest items. Merge them.
      try {
        const token = localStorage.getItem('token');

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/merge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: guestCart }),
        });

        // 🟢 Clear Guest Cart from Local (it's now on server)
        localStorage.removeItem("flipzokart_cart");

        // 🟢 Hard Refresh to get the merged state
        await refreshServerCart();
        addToast('success', 'Cart merged successfully');

      } catch (e) {
        console.error("Failed to merge cart", e);
        // On failure, we might want to unlock to retry? 
        // For now, keep locked to prevent spam. User can refresh page.
      }
    };

    mergeGuestCart();
  }, [user, isInitialized, refreshServerCart]); // Runs once when user becomes truthy

  // Real-time Socket
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const socket = useSocket(token);
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

  // Sync Cart: SAVE on Change (Debounced)
  useEffect(() => {
    if (!isInitialized) return;

    // Always save to localStorage (Consistency)
    localStorage.setItem('flipzokart_cart', JSON.stringify(cart));

    if (!user || isCartLoading) return;

    const saveCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart })
        });
      } catch (err) {
        console.error("Failed to save cart to server", err);
      }
    };

    const timeoutId = setTimeout(saveCart, 1000); // 1s debounce
    return () => clearTimeout(timeoutId);
  }, [cart, user, isCartLoading, isInitialized]);

  // Persist other state
  useEffect(() => { if (isInitialized) localStorage.setItem('flipzokart_wishlist', JSON.stringify(wishlist)); }, [wishlist, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('flipzokart_orders', JSON.stringify(orders)); }, [orders, isInitialized]);
  useEffect(() => {
    if (!isInitialized) return;
    if (selectedAddress) localStorage.setItem('flipzokart_selected_address', JSON.stringify(selectedAddress));
    else localStorage.removeItem('flipzokart_selected_address');
  }, [selectedAddress, isInitialized]);
  useEffect(() => {
    if (!isInitialized) return;
    if (user) localStorage.setItem('flipzokart_user', JSON.stringify(user));
    else localStorage.removeItem('flipzokart_user');
  }, [user, isInitialized]);


  // 🟢 6️⃣ IMMUTABLE STATE UPDATES (FIX FREEZE)
  const addToCart = (item: CartItem, quantity: number = 1) => {
    const itemKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (p) => getCartItemKey(p.productId, p.selectedVariants, p.variantId) === itemKey
      );

      if (existingIndex > -1) {
        // Immutable Update
        return prev.map((p, i) => i === existingIndex ? { ...p, quantity: p.quantity + quantity } : p);
      }

      const snapshot: CartItem = { ...item, quantity };
      return [...prev, snapshot];
    });

    if (!isInitialized) {
      // Fallback for very early adds? usually not needed if buttons disabled
    }
  };

  const removeFromCart = (key: string) => {
    console.log("Attempting to remove cart item with key:", key);
    setCart((prev) => {
      const newCart = prev.filter((item) => {
        const currentKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);
        const match = currentKey !== key;
        if (!match) console.log("Removed Item:", item.name, "Key matched:", currentKey);
        else console.log("Kept Item:", item.name, "Key:", currentKey);
        return match;
      });
      console.log("Cart size before:", prev.length, "After:", newCart.length);
      return newCart;
    });
  };

  const removeProductFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== key));
  };

  const updateCartQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) => prev.map((item) =>
      getCartItemKey(item.productId, item.selectedVariants, item.variantId) === key
        ? { ...item, quantity: qty }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('flipzokart_cart');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const placeOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    clearCart();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusAPI(orderId, status);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      // alert('Failed to update order status. Please try again.');
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
      // Always clear local data regardless of API call success
      setUser(null);
      clearCart();
      setWishlist([]);
      localStorage.removeItem('flipzokart_user');
      localStorage.removeItem('flipzokart_wishlist');
      localStorage.removeItem('token');
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
  };

  // 🟢 7️⃣ HYDRATION CHECK
  if (!isHydrated) return null; // Prevent mismatched HTML

  return (
    <AppContext.Provider value={{
      user, setUser, cart, addToCart, removeFromCart, removeProductFromCart, updateCartQuantity, clearCart,
      wishlist, toggleWishlist, isAdmin, logout, orders, placeOrder, updateOrderStatus,
      products, setProducts, selectedAddress, setSelectedAddress, isInitialized
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
