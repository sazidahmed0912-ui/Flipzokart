"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, Product, Order, Address } from '@/app/types';
import { MOCK_PRODUCTS } from '@/app/constants';
import authService from '@/app/services/authService';
import { fetchProducts, updateOrderStatus as updateOrderStatusAPI } from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';

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

const getCartItemKey = (productId: string, variants?: Record<string, string>, variantId?: string) => {
  if (variantId) return variantId; // Strict Mode: Variant ID is the key
  if (!variants) return productId;
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${variantString}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  // Hydrate from LocalStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('flipzokart_user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedCart = localStorage.getItem('flipzokart_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

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

  // Fetch products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await fetchProducts();
        // Backend returns: { status: 'success', products: [...], total: ... }
        // Or sometimes it might be just the array depending on endpoint version
        const productList = Array.isArray(data) ? data : (data.products || data.data || []);

        setProducts(productList);
        localStorage.setItem('flipzokart_products', JSON.stringify(productList));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Fallback to local storage if API fails, or mocks
        const saved = localStorage.getItem('flipzokart_products');
        if (saved) {
          setProducts(JSON.parse(saved));
        } else {
          setProducts(MOCK_PRODUCTS.slice().reverse());
        }
      }
    };
    loadProducts();

    // ✅ STEP 4: Global Auth Restore (Infinite Redirect Protection)
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

  const [isCartLoading, setIsCartLoading] = useState(false);

  // Sync Cart: FETCH on Login/Mount
  useEffect(() => {
    if (!user) return; // Don't fetch if no user
    if (!isInitialized) return;

    const fetchCart = async () => {
      try {
        setIsCartLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use axios directly or use fetch with headers
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const serverCart = await response.json();
          // Merge or Replace? 
          // Strategy: Replace local with server if server has items.
          // If server is empty and local has items (guest cart), push local to server?
          // For simplicity and "Login Restore" requirement: Server > Local.
          if (serverCart && serverCart.length > 0) {
            setCart(serverCart);
          }
        }
      } catch (err) {
        console.error("Failed to sync cart from server", err);
      } finally {
        setIsCartLoading(false);
      }
    };

    fetchCart();
    fetchCart();
  }, [user, isInitialized]); // Run when user changes (Login)

  // Socket.IO for Real-Time Products
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const socket = useSocket(token);

  useEffect(() => {
    if (!socket) return;

    // Listen for New Products
    socket.on('newProduct', (newProduct: Product) => {
      setProducts(prev => [newProduct, ...prev]);
    });

    // Listen for Product Updates
    socket.on('productUpdated', (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    });

    // Listen for Product Deletion
    socket.on('deleteProduct', (productId: string) => {
      setProducts(prev => prev.filter(p => p.id !== productId));
    });

    return () => {
      socket.off('newProduct');
      socket.off('productUpdated');
      socket.off('deleteProduct');
    };
  }, [socket]);
  useEffect(() => {
    if (!user) return;
    const updateLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fire and Forget - we don't need to wait or show result to user
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-location`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn("Passive location update failed", err);
      }
    };
    updateLocation();
  }, [user]);

  // Sync Cart: SAVE on Change
  useEffect(() => {
    if (!isInitialized) return;
    if (!user || isCartLoading) return; // Don't save if loading or no user

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

    // Debounce to prevent too many requests
    const timeoutId = setTimeout(saveCart, 1000);
    return () => clearTimeout(timeoutId);
  }, [cart, user, isCartLoading, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      localStorage.setItem('flipzokart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('flipzokart_user');
    }
  }, [user, isInitialized]);


  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('flipzokart_cart', JSON.stringify(cart));
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('flipzokart_wishlist', JSON.stringify(wishlist));
  }, [wishlist, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('flipzokart_orders', JSON.stringify(orders));
  }, [orders, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('flipzokart_products', JSON.stringify(products));
  }, [products, isInitialized]);

  // Saved address local storage
  useEffect(() => {
    if (!isInitialized) return;
    if (selectedAddress) {
      localStorage.setItem('flipzokart_selected_address', JSON.stringify(selectedAddress));
    } else {
      localStorage.removeItem('flipzokart_selected_address');
    }
  }, [selectedAddress, isInitialized]);

  const addToCart = (item: CartItem, quantity: number = 1) => {
    // Generate key based on snapshot data
    const itemKey = getCartItemKey(item.productId, item.selectedVariants, item.variantId);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (p) => getCartItemKey(p.productId, p.selectedVariants, p.variantId) === itemKey
      );

      // If already exists → increase qty
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }

      // 🔒 IMPORTANT: store EXACT snapshot (no mutation)
      // Ensure we treat the incoming item AS the snapshot (CartItem)
      const snapshot: CartItem = {
        ...item,
        quantity
      };

      return [...prev, snapshot];
    });

    // Toast handled in UI components to return void here as per interface
  };

  const removeFromCart = (key: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => getCartItemKey(item.productId, item.selectedVariants, item.variantId) !== key));
  };

  const removeProductFromCart = (key: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.productId !== key));
  };

  const updateCartQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev: CartItem[]) => prev.map((item: CartItem) =>
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
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
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
      alert('Failed to update order status. Please try again.');
    }
  };

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
    }
  };

  const isAdmin = user?.role === 'admin';

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
