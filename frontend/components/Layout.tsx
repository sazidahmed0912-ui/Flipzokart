
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingCart, Heart, User, Search, Menu, X, LogOut, LayoutDashboard, ChevronDown, Home, MessageCircle, LayoutGrid, Tag, ChevronRight } from 'lucide-react';
import { useApp } from '../store/Context';
import NotificationBell from './NotificationBell';


const Header: React.FC = () => {
  const { cart, user, isAdmin, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${searchQuery}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
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
    navigate('/');
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
            <Link to="/">
              <span className="text-[#222]">Flip</span><span className="text-[#f28c28]">zokart</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f28c28]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
              <Home className="w-6 h-6" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <NotificationBell />
            <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
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
                  <span className="text-sm font-medium text-center">Welcome Back, {user.name.split(' ')[0]}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-50">
                    <Link to="/profile" onClick={closeMenus} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    {isAdmin && <Link to="/admin" onClick={closeMenus} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>}
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-[#f28c28]">
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">Account</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16">
          <button onClick={() => setIsMenuOpen(true)} className="p-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="text-2xl font-bold">
            <Link to="/">
              <span className="text-[#222]">Flip</span><span className="text-[#f28c28]">zokart</span>
            </Link>
          </div>
          <button className="p-2" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
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
        </div>
      )}

      {/* Mobile Menu Overlay (Premium Redesign) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="text-2xl font-bold">
              <span className="text-gray-800">Flip</span><span className="text-[#f28c28]">zokart</span>
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
              <Link
                to="/"
                onClick={closeMenus}
                className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Home size={16} />
                </div>
                <span className="font-medium text-sm">Home</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </Link>

              <Link
                to="/shop"
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
                  <Link
                    to="/profile"
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
                    <Link
                      to="/admin"
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

                  {/* Sell on Flipzokart Link */}
                  <Link
                    to="/sell"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <Store size={16} />
                    </div>
                    <span className="font-medium text-sm">Sell on Flipzokart</span>
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </Link>

                  {/* Pages Group - Moved below Profile as requested */}
                  <div className="flex flex-col bg-gray-50/50">
                    <Link
                      to="/about"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Tag size={14} />
                      </div>
                      <span className="font-medium text-xs">About Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                    <Link
                      to="/contact"
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
                    <Link
                      to="/about"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Tag size={14} />
                      </div>
                      <span className="font-medium text-xs">About Us</span>
                      <ChevronRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                    <Link
                      to="/contact"
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

                  <Link
                    to="/login"
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
    </header>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { cart } = useApp();
  const isActive = (path: string, exact = true) => exact ? location.pathname === path : location.pathname.startsWith(path);

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
          <Link key={path} to={path} className={`relative flex flex-col items-center py-2 px-3 ${isActive(path) ? 'text-[#f28c28]' : 'text-gray-600'}`}>
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
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-[#f28c28]">About Us</Link></li>
              <li><a href="#" className="hover:text-[#f28c28]">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/contact" className="hover:text-[#f28c28]">Contact Us</Link></li>
              <li><a href="#" className="hover:text-[#f28c28]">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-[#f28c28]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#f28c28]">Terms of Service</a></li>
            </ul>
          </div>
          <div className="text-2xl font-bold">
            <p className="text-gray-600 text-sm mt-2">India's leading online shopping platform</p>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© 2024 All rights reserved.</p>
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
