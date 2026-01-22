
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, LayoutDashboard, ChevronDown, Home, MessageCircle, LayoutGrid, Tag } from 'lucide-react';
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
              {cart.length > 0 &&
                <span className="bg-[#f28c28] text-white text-xs rounded-full px-2 py-1 ml-1">{cart.length}</span>
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

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50" onClick={closeMenus}>
          <div className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold">
                <Link to="/">
                  <span className="text-[#222]">Flip</span><span className="text-[#f28c28]">zokart</span>
                </Link>
              </div>
              <button onClick={() => setIsMenuOpen(false)}><X /></button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link to="/" onClick={closeMenus} className="font-semibold">Home</Link>
              <Link to="/shop" onClick={closeMenus} className="font-semibold">Shop</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenus} className="font-semibold">My Profile</Link>
                  {isAdmin && <Link to="/admin" onClick={closeMenus} className="font-semibold">Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="text-left font-semibold">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={closeMenus} className="font-semibold">Login</Link>
              )}
            </nav>
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
