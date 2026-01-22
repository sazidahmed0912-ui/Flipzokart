
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, Product, Order, Address } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import authService from '../services/authService';
import { fetchProducts, updateOrderStatus as updateOrderStatusAPI } from '../services/api';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  removeProductFromCart: (productId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getCartItemKey = (productId: string, variants?: Record<string, string>) => {
  if (!variants) return productId;
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${productId}-${variantString}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flipzokart_user');
    const token = localStorage.getItem('token');
    if (!token) return null; // Force logout if token missing
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('flipzokart_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('flipzokart_wishlist');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('flipzokart_orders');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>([]);

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
  }, []);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    const saved = localStorage.getItem('flipzokart_selected_address');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartLoading, setIsCartLoading] = useState(false);

  // Sync Cart: FETCH on Login/Mount
  useEffect(() => {
    if (!user) return; // Don't fetch if no user

    const fetchCart = async () => {
      try {
        setIsCartLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use axios directly or use fetch with headers
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/cart`, {
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
  }, [user]); // Run when user changes (Login)

  // Sync Cart: SAVE on Change
  useEffect(() => {
    if (!user || isCartLoading) return; // Don't save if loading or no user

    const saveCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch(`${(import.meta as any).env.VITE_API_URL}/api/cart`, {
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
  }, [cart, user, isCartLoading]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('flipzokart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('flipzokart_user');
    }
  }, [user]);


  useEffect(() => {
    localStorage.setItem('flipzokart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('flipzokart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('flipzokart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('flipzokart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('flipzokart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('flipzokart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('flipzokart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('flipzokart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('flipzokart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('flipzokart_products', JSON.stringify(products));
  }, [products]);

  // Saved address local storage
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem('flipzokart_selected_address', JSON.stringify(selectedAddress));
    } else {
      localStorage.removeItem('flipzokart_selected_address');
    }
  }, [selectedAddress]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const selectedVariants = product.selectedVariants;
    const itemKey = getCartItemKey(product.id, selectedVariants);


    setCart((prev: CartItem[]) => {
      const existingIndex = prev.findIndex((item: CartItem) => getCartItemKey(item.id, item.selectedVariants) === itemKey);

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity
        };
        return nextCart;
      }

      return [...prev, { ...product, quantity, selectedVariants } as CartItem];
    });
  };

  const removeFromCart = (cartItemKey: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => getCartItemKey(item.id, item.selectedVariants) !== cartItemKey));
  };

  const removeProductFromCart = (productId: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== productId));
  };

  const updateCartQuantity = (cartItemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }
    setCart((prev: CartItem[]) => prev.map((item: CartItem) =>
      getCartItemKey(item.id, item.selectedVariants) === cartItemKey
        ? { ...item, quantity }
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
      products, setProducts, selectedAddress, setSelectedAddress
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
