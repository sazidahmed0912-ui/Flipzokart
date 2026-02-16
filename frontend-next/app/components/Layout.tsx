"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Store, ShoppingCart, Heart, User, Search, Menu, X, LogOut, LayoutDashboard, ChevronDown, Home, MessageCircle, LayoutGrid, Tag, ChevronRight, Bell, CheckCircle, XCircle, AlertTriangle, Info, Clock, Trash2 } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { useNotifications } from '@/app/store/NotificationContext';
import NotificationBell from './NotificationBell';


const Header: React.FC = () => {
  const { cart, user, isAdmin, logout } = useApp();
  const { notifications, unreadCount, markNotificationAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'info': default: return <Info className="text-blue-500" size={20} />;
    }
  };

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const term = searchQuery.trim();

      // Update History: Add new term to start, remove duplicates, limit to 5
      const updateHistory = (prev: string[]) => {
        const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
        const newHistory = [term, ...filtered].slice(0, 5);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
        return newHistory;
      };

      setSearchHistory(updateHistory);

      router.push(`/shop?q=${term}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
      setIsSearchFocused(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          <div className="text-2xl font-bold">
            <Link href="/">
              <span className="text-[#222]">Fzo</span><span className="text-[#f28c28]">kart</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f28c28]"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Recent Searches Dropdown */}
            {isSearchFocused && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex justify-between items-center">
                  <span>Recent Searches</span>
                  {/* Option to clear history could go here */}
                </div>
                <ul>
                  {searchHistory.map((historyItem, index) => (
                    <li key={index} className="flex items-center justify-between hover:bg-gray-50 pr-4">
                      <button
                        type="button"
                        className="flex-1 text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2"
                        onClick={() => {
                          setSearchQuery(historyItem);
                          router.push(`/shop?q=${historyItem}`);
                          setIsSearchFocused(false);
                        }}
                      >
                        <Search size={14} className="text-gray-400" />
                        {historyItem}
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                        onClick={(e) => {
                          e.stopPropagation();
                          // e.preventDefault(); // Not needed if onMouseDown handles it, but good safety
                          const newHistory = [...searchHistory];
                          newHistory.splice(index, 1);
                          setSearchHistory(newHistory);
                          localStorage.setItem('search_history', JSON.stringify(newHistory));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Remove from history"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>

          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
              <Home className="w-6 h-6" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <NotificationBell />
            <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm font-medium">Cart</span>
              {cart.reduce((acc, item) => acc + item.quantity, 0) > 0 &&
                <span className="bg-[#f28c28] text-white text-xs rounded-full px-2 py-1 ml-1">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              }
            </Link>
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex flex-col items-center justify-center text-gray-700 hover:text-[#f28c28]"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">Welcome Back, {(user.name || "User").split(' ')[0]}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-50">
                    <Link href="/profile" onClick={closeMenus} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    {isAdmin && <Link href="/admin" onClick={closeMenus} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>}
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">Account</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 relative">
            <Menu className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white animate-pulse shadow-sm"></span>
            )}
          </button>
          <div className="text-2xl font-bold">
            <Link href="/">
              <span className="text-[#222]">Fzo</span><span className="text-[#f28c28]">kart</span>
            </Link>
          </div>
          {/* Conditionally render Search Button */}
          {pathname !== '/profile' && (
            <button className="p-2" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {/* If on profile page, render a placeholder or nothing to keep layout?
              Just hiding it is fine as it's flex justify-between.
              (Menu - Logo - [Search]) -> (Menu - Logo).
              To keep Logo centered or Left aligned?
              Previous: justify-between.
              Left: Menu. Center: Logo. Right: Search.
              If Search is gone, Logo might drift to right.
              Let's add an invisible dummy div if on profile page to maintain spacing?
              Or just let it be. 'justify-between' with 2 items puts one left, one right.
              We probably want Logo in center or left?
              Current code:
               <button Menu>
               <div Logo>
               <button Search>
              If 3 items: Left, Center(ish), Right.
              If 2 items: Left, Right.
              If we want Logo centered, we might need a blank div on right.
          */}
          {pathname === '/profile' && <div className="w-10"></div>}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && pathname !== '/profile' && (
        <div className="md:hidden px-4 pb-4 border-b">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f28c28]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          {/* Mobile Homepage Search History */}
          {pathname === '/' && searchHistory.length > 0 && (
            <div className="mt-3 bg-gray-50 rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem('search_history');
                  }}
                  className="text-xs text-blue-600 font-medium"
                >
                  Clear All
                </button>
              </div>
              <ul className="space-y-1">
                {searchHistory.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-white rounded-md p-2 shadow-sm active:scale-[0.98] transition-transform">
                    <button
                      type="button"
                      className="flex-1 text-left flex items-center gap-2 text-sm text-gray-700"
                      onClick={() => {
                        setSearchQuery(item);
                        router.push(`/shop?q=${item}`);
                        setIsSearchOpen(false);
                      }}
                    >
                      <Clock size={14} className="text-gray-400" />
                      {item}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newHistory = [...searchHistory];
                        newHistory.splice(index, 1);
                        setSearchHistory(newHistory);
                        localStorage.setItem('search_history', JSON.stringify(newHistory));
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay (Premium Redesign) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="text-2xl font-bold">
              <span className="text-[#222]">Fzo</span><span className="text-[#f28c28]">kart</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* List Content (Profile Design) */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              <Link href="/"
                onClick={closeMenus}
                className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Home size={16} />
                </div>
                <span className="font-medium text-sm">Home</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </Link>

              <Link href="/shop"
                onClick={closeMenus}
                className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <LayoutGrid size={16} />
                </div>
                <span className="font-medium text-sm">Shop</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </Link>

              {user ? (
                <>
                  <Link href="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span className="font-medium text-sm">My Profile</span>
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </Link>

                  {isAdmin && (
                    <Link href="/admin"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center">
                        <LayoutDashboard size={16} />
                      </div>
                      <span className="font-medium text-sm">Admin Dashboard</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                  )}

                  {/* Mobile Notifications Link */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowMobileNotifications(true);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center relative">
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm">Notifications</span>
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </button>

                  {/* Sell on Flipzokart Link */}
                  <Link href="/sell"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <Store size={16} />
                    </div>
                    <span className="font-medium text-sm">Sell on Fzokart</span>
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </Link>

                  {/* Pages Group - Moved below Profile as requested */}
                  <div className="flex flex-col bg-gray-50/50">
                    <Link href="/about"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Tag size={14} />
                      </div>
                      <span className="font-medium text-xs">About Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                    <Link href="/contact"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center">
                        <MessageCircle size={14} />
                      </div>
                      <span className="font-medium text-xs">Contact Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 border-b border-gray-100 transition-colors w-full text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                      <LogOut size={16} />
                    </div>
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Pages Group for Guests */}
                  <div className="flex flex-col bg-gray-50/50">
                    <Link href="/about"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Tag size={14} />
                      </div>
                      <span className="font-medium text-xs">About Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                    <Link href="/contact"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center">
                        <MessageCircle size={14} />
                      </div>
                      <span className="font-medium text-xs">Contact Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                  </div>

                  <Link href="/login"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f28c28] text-white flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span className="font-medium text-sm">Login / Sign Up</span>
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notification Panel Overlay */}
      {showMobileNotifications && (
        <div className="md:hidden fixed inset-0 z-[110] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileNotifications(false)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">We'll let you know when something update arrives.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 bg-white ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => markNotificationAsRead(notif._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notif.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                          })}
                      </p>
                      {notif.note && (
                        <p className="text-xs text-gray-500 italic mt-1 border-l-2 border-gray-300 pl-2">
                          Note: {notif.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="p-2 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  </div>
            ))}
          </div>
            )}
        </div>
        </div>
  )
}
    </header >
  );
};

const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cart } = useApp();
  const isActive = (path: string, exact = true) => exact ? pathname === path : pathname.startsWith(path);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/shop', label: 'Categories', icon: LayoutGrid },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/profile', label: 'Account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[999]">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path} className={`relative flex flex-col items-center py-2 px-3 ${isActive(path) ? 'text-[#f28c28]' : 'text-gray-600'}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {label === 'Cart' && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2 text-[11px] leading-4 md:text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-[#f28c28]">About Us</Link></li>
              <li><a href="#" className="hover:text-[#f28c28]">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2 text-[11px] leading-4 md:text-sm text-gray-600">
              <li><Link href="/contact" className="hover:text-[#f28c28]">Contact Us</Link></li>
              <li><a href="#" className="hover:text-[#f28c28]">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-[11px] leading-4 md:text-sm text-gray-600">
              <li><Link href="/privacy-policy" className="hover:text-[#f28c28]">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#f28c28]">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="text-2xl font-bold">
            <p className="text-gray-600 text-sm mt-2">India's leading online shopping platform</p>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© 2024 Fzokart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <div className="md:hidden h-16"></div>
    </div>
  );
};
