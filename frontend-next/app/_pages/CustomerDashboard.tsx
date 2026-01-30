"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  User as UserIcon, Package, MapPin, CreditCard,
  Settings, LogOut, ChevronRight, ShoppingBag,
  Star, ShoppingCart, MessageSquare, CheckCircle2
} from 'lucide-react';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { useApp } from '@/app/store/Context';
import API from '@/app/services/api';
import { Review, Order } from '@/app/types';

export const CustomerDashboard: React.FC = () => {
  const { user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname(); const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);


  // Automatically set active section based on URL hash if provided
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // Fetch user-specific data
  useEffect(() => {
    if (!user) return;

    // Fetch user's reviews
    const fetchUserReviews = async () => {
      setIsLoadingReviews(true);
      try {
        // Assuming an API endpoint to get reviews by user ID
        const response = await API.get(`/reviews/user/${user.id}`);
        setUserReviews(response.data.data);
      } catch (error) {
        console.error("Failed to fetch user reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchUserReviews();

    // Fetch user's orders (if not already in context, or refresh)
    const fetchUserOrders = async () => {
      setIsLoadingOrders(true);
      try {
        // Assuming an API endpoint to get orders by user ID
        const response = await API.get(`/orders/user/${user.id}`);
        setUserOrders(response.data.data);
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
            <div className="p-8 text-center bg-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-primary border-4 border-white/10 mx-auto mb-4 flex items-center justify-center text-3xl font-bold shadow-2xl">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold truncate">{user.name}</h2>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Premium Member</p>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {[
                { id: 'overview', label: 'Dashboard Home', icon: UserIcon },
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'reviews', label: 'My Reviews', icon: Star },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                { id: 'settings', label: 'Account Security', icon: Settings },
              ].map(item => (
                <Link key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeSection === item.id
                    ? 'bg-primary/5 text-primary border border-primary/10'
                    : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={activeSection === item.id ? 'text-primary' : 'text-gray-400 group-hover:text-dark'} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeSection === item.id ? 'opacity-100' : 'opacity-0'} />
                </Link>
              ))}

              <div className="h-px bg-gray-50 my-4 mx-4"></div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-50 transition-all"
              >
                <LogOut size={20} /> Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-8">
          {activeSection === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-dark">Welcome, {user.name.split(' ')[0]}!</h1>
                  <p className="text-gray-500 font-medium">Your personalized dashboard at a glance.</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="text-3xl font-bold text-dark">{userOrders.length}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total Orders</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <Star size={24} />
                  </div>
                  <p className="text-3xl font-bold text-dark">{userReviews.length}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Product Reviews</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-3xl font-bold text-dark">2</p> {/* Placeholder for messages */}
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Unread Messages</p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Recent Orders</h3>
                  <Link href="#orders" onClick={() => setActiveSection('orders')} className="text-primary text-xs font-bold hover:underline">View All</Link>
                </div>
                {isLoadingOrders ? (
                  <div className="h-64 flex items-center justify-center relative overflow-hidden rounded-[3rem]">
                    <div className="scale-50 transform">
                      <CircularGlassSpinner />
                    </div>
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-dark">Order #{order.id}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dark">₹{order.total.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 italic">No recent orders found.</div>
                )}
              </div>

              {/* Recent Reviews Preview */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Your Latest Reviews</h3>
                  <Link href="#reviews" onClick={() => setActiveSection('reviews')} className="text-primary text-xs font-bold hover:underline">View All</Link>
                </div>
                {isLoadingReviews ? (
                  <div className="h-64 flex items-center justify-center relative overflow-hidden rounded-[3rem]">
                    <div className="scale-50 transform">
                      <CircularGlassSpinner />
                    </div>
                  </div>
                ) : userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.slice(0, 3).map(review => (
                      <div key={review._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Star size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-dark line-clamp-1">{review.comment}</p>
                            <p className="text-xs text-gray-400">For: {review.product.name} ({review.rating} Stars)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dark">{new Date(review.createdAt).toLocaleDateString()}</p>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 italic">No reviews submitted yet.</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-dark mb-8">My Orders</h2>
              {isLoadingOrders ? (
                <div className="flex justify-center py-20">
                  <div className="scale-75">
                    <CircularGlassSpinner />
                  </div>
                </div>
              ) : userOrders.length > 0 ? (
                userOrders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Placed</p>
                          <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                          <p className="text-sm font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ship To</p>
                          <p className="text-sm font-bold">{typeof order.address === 'string' ? order.address : order.address.fullName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                        <p className="text-sm font-bold">#{order.id}</p>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                          <CheckCircle2 size={16} />
                        </div>
                        <p className="font-bold text-dark">Status: <span className="text-green-600">{order.status}</span></p>
                      </div>
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <img src={item.image} className="w-16 h-16 rounded-xl object-cover border" alt={item.name} />
                            <div className="flex-1">
                              <p className="font-bold text-sm text-dark line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                            <button className="text-primary text-xs font-bold self-center px-4 py-2 bg-primary/5 rounded-xl hover:bg-primary hover:text-white transition-all">Buy it Again</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 border-dashed">
                  <Package size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                  <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">Start Shopping Now</Link>
                </div>
              )}
            </div>
          )}

          {activeSection === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-dark mb-8">My Reviews</h2>
              {isLoadingReviews ? (
                <div className="flex justify-center py-20">
                  <div className="scale-75">
                    <CircularGlassSpinner />
                  </div>
                </div>
              ) : userReviews.length > 0 ? (
                userReviews.map(review => (
                  <div key={review._id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Product</p>
                          <p className="text-sm font-bold">{review.product.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rating</p>
                          <p className="text-sm font-bold flex items-center gap-1 text-yellow-500">
                            {review.rating} <Star size={14} fill="currentColor" />
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                      {/* Optionally add edit/delete buttons here */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 border-dashed">
                  <Star size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">You haven't submitted any reviews yet.</p>
                  <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">Explore Products to Review</Link>
                </div>
              )}
            </div>
          )}

          {activeSection === 'addresses' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-dark">Saved Addresses</h2>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                <p className="text-gray-500 italic">Address management features would go here.</p>
                {/* You would integrate address listing/editing components here */}
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-dark">Payment Methods</h2>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                <p className="text-gray-500 italic">Payment method management features would go here.</p>
                {/* You would integrate payment method listing/editing components here */}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-dark">Account Security</h2>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                <p className="text-gray-500 italic">Account security features would go here, similar to ProfilePage.</p>
                {/* Copy content from ProfilePage settings tab */}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
