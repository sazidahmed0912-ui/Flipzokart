import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Share2, Check, AlertTriangle, Info, Clock, ArrowRight, CreditCard, Package, ChevronRight, Search, Lock } from 'lucide-react';
import { useApp } from '../store/Context';
import { ProductCard } from '../components/ProductCard';
import API, { fetchProductById } from '../services/api';
import { Product, Review } from '../types';
import { ReviewList } from './ProductDetails/components/ReviewList';
import { ReviewForm } from './ProductDetails/components/ReviewForm';
import { useSocket } from '../hooks/useSocket';
import LazyImage from '../components/LazyImage';
import CircularGlassSpinner from '../components/CircularGlassSpinner';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products: allProducts, addToCart, toggleWishlist, wishlist, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string>('');

  const token = localStorage.getItem("token");
  const socket = useSocket(token);

  const handleReviewUpdate = (newReview: Review) => {
    setReviews((prevReviews) => {
      const existingIndex = prevReviews.findIndex((r) => r._id === newReview._id);
      if (existingIndex > -1) {
        const updatedReviews = [...prevReviews];
        updatedReviews[existingIndex] = newReview;
        return updatedReviews;
      } else {
        return [newReview, ...prevReviews];
      }
    });
  };

  useEffect(() => {
    if (!id) return;
    if (socket) {
      socket.on('newReview', (newReview: Review) => {
        if (newReview.product._id === id) handleReviewUpdate(newReview);
      });
      socket.on('updatedReview', (updatedReview: Review) => {
        if (updatedReview.product._id === id) handleReviewUpdate(updatedReview);
      });
    }
    return () => {
      if (socket) {
        socket.off('newReview');
        socket.off('updatedReview');
      }
    };
  }, [id, socket, handleReviewUpdate]);

  useEffect(() => {
    if (!id) return;
    const getProductAndReviews = async () => {
      setIsLoading(true);
      setIsReviewsLoading(true);
      try {
        const productResponse = await fetchProductById(id);
        const productData = productResponse.data?.data?.product || productResponse.data;
        setProduct(productData);
        setActiveImage(productData.image);
        if (productData.reviews) setReviews(productData.reviews);
        if (productData.variants) {
          const defaults: Record<string, string> = {};
          productData.variants.forEach((v: any) => {
            if (v.options.length > 0) defaults[v.name] = v.options[0];
          });
          setSelectedVariants(defaults);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
        setReviews([]);
      } finally {
        setIsLoading(false);
        setIsReviewsLoading(false);
      }
    };
    getProductAndReviews();
  }, [id]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const gallery = product.images || [];
    if (gallery.length === 0) {
      return [product.image, `https://picsum.photos/seed/${product.id}1/600/600`, `https://picsum.photos/seed/${product.id}2/600/600`, `https://picsum.photos/seed/${product.id}3/600/600`];
    }
    return gallery.includes(product.image) ? gallery : [product.image, ...gallery];
  }, [product]);

  const { currentStock, isOutOfStock } = useMemo(() => {
    if (!product) return { currentStock: 0, isOutOfStock: true };
    if (!product.variants || product.variants.length === 0) {
      return { currentStock: product.countInStock, isOutOfStock: product.countInStock <= 0 };
    }
    return { currentStock: product.countInStock, isOutOfStock: product.countInStock <= 0 };
  }, [product, selectedVariants]);

  useEffect(() => {
    if (!isOutOfStock && quantity > currentStock && currentStock > 0) setQuantity(currentStock);
    else if (isOutOfStock) setQuantity(1);
  }, [currentStock, isOutOfStock, quantity]);

  if (isLoading) return <CircularGlassSpinner />;

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="p-6 bg-gray-100 rounded-full text-gray-400"><Info size={48} /></div>
      <h2 className="text-2xl font-bold">Product Not Found</h2>
      <button onClick={() => navigate('/shop')} className="text-blue-600 font-bold hover:underline">Return to Shop</button>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const productWithSelection = { ...product, selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined };
    addToCart(productWithSelection, quantity);
    navigate('/cart');
  };

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants(prev => {
      const next = { ...prev, [name]: value };
      const match = product.inventory?.find(inv => Object.entries(next).every(([k, v]) => inv.options[k] === v));
      if (match?.image) setActiveImage(match.image);
      return next;
    });
  };

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => reviews.filter(r => Math.floor(r.rating) === stars).length);
  const totalRatings = reviews.length || 1;

  return (
    <div className="bg-gray-50 min-h-screen pb-28 text-gray-800 font-sans">
      {/* SECTION 1: PRODUCT IMAGE & BASIC INFO */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Image Gallery & Rating Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="relative bg-blue-50 rounded-xl p-8 mb-4 min-h-[400px] flex items-center justify-center overflow-hidden">
                <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50 z-10 transition-transform active:scale-95">
                  <span className="text-gray-400">✓</span>
                </button>
                <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50 z-10 transition-transform active:scale-95">
                  <Search size={18} className="text-gray-400" />
                </button>
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <LazyImage
                    src={activeImage}
                    alt={product.name}
                    className={`max-w-[75%] max-h-[75%] object-contain transition-transform duration-500 hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                  />
                  {/* Visual decoration: Shoe shadow as seen in image/mockup */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-6 bg-gray-300 rounded-full blur-xl opacity-20 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl border-2 transition-all cursor-pointer bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden ${activeImage === img ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Breakdown Card - EXACTLY BELOW GALLERY as per image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 uppercase tracking-tighter">Full Description</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={18}
                        fill={s <= Math.floor(product.rating || 0) ? "currentColor" : "none"}
                        className={s <= Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-xl text-gray-900 leading-none">{product.rating?.toFixed(1) || '4.4'}</span>
                  <span className="text-gray-400 text-sm ml-auto font-medium">{reviews.length.toLocaleString() || '8,562'}</span>
                </div>

                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((stars, idx) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4 font-bold">{stars}</span>
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${stars >= 4 ? 'bg-yellow-400' : stars === 3 ? 'bg-blue-500' : stars === 2 ? 'bg-blue-400' : 'bg-blue-300'}`}
                          style={{ width: `${(ratingCounts[5 - stars] / (totalRatings || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right font-bold">{ratingCounts[5 - stars].toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 pt-4 border-t border-gray-50 mt-2">
                  <Lock size={14} />
                  <span className="font-bold text-[11px] uppercase tracking-widest">Surniri© 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Selectors */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-2 font-bold uppercase tracking-wider">Brand: <span className="text-gray-900">{product.category}</span></p>

              <div className="flex items-center gap-2 mt-4 bg-gray-50/50 p-2 rounded-lg inline-flex">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(product.rating || 4.4) ? "currentColor" : "none"}
                      className={s <= Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-200"}
                    />
                  ))}
                </div>
                <span className="text-md font-black text-gray-900 ml-1">4.4</span>
                <span className="text-sm text-gray-400 font-bold ml-1 border-l border-gray-200 pl-2">
                  {reviews.length.toLocaleString() || '8,562'} ratings · {reviews.length || '1,095'} reviews
                </span>
              </div>

              {/* Color Selector */}
              <div className="mt-8">
                <div className="flex gap-4">
                  {['#3B82F6', '#D1D5DB', '#EF4444', '#F3F4F6'].map((color, idx) => (
                    <button
                      key={idx}
                      className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${idx === 0 ? 'border-gray-800 ring-2 ring-offset-4 ring-gray-900' : 'border-gray-200 shadow-sm'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-8">
                <div className="flex gap-2 flex-wrap">
                  {[6, 7, 8, 9, 10, 11].map((size, i) => (
                    <button
                      key={i}
                      className={`px-5 py-2.5 border-2 rounded-xl text-sm font-black transition-all active:scale-95 ${i === 2 ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: BANK OFFERS & POLICIES */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" /> Bank Offers
              </h3>
              <div className="space-y-5">
                {[
                  { icon: CreditCard, title: "5% Unlimited Cashback", sub: "on Flipkart Axis Bank Credit Card", color: "blue" },
                  { icon: CreditCard, title: "10% Instant Discount", sub: "on HDFC Bank Credit Card", color: "blue" },
                  { icon: Package, title: "Pay Later & Get 10% Cashback", sub: "on Flipkart Pay Later", color: "blue" }
                ].map((offer, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100">
                      <offer.icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-tight">{offer.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 font-bold">{offer.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-gray-900 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                <RotateCcw size={20} className="text-blue-600" />
                <span className="font-black">10 Days Return Policy</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Seller</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest leading-none">UPI</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Truck size={16} className="text-gray-400" />
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Pay Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TABS - DETAILS / SPECS / REVIEWS */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs Nav */}
          <div className="flex border-b border-gray-100 bg-gray-50/30">
            {['details', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-8 py-5 font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'specifications' ? 'Specifications' : 'Customer Reviews'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {activeTab === 'details' && (
              <div className="max-w-4xl">
                <h3 className="font-black text-xl text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-8 h-1 bg-blue-600 rounded"></div> Full Description
                </h3>
                <p className="text-gray-600 leading-relaxed font-bold text-lg md:text-xl italic bg-gray-50/50 p-6 rounded-2xl border-l-4 border-blue-500">
                  "{product.description || "Very good quality product with comfortable sole and durable build. High-performance sneakers designed for all-day comfort and style."}"
                </p>
                <div className="flex items-center gap-6 mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Authorized Seller</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="text-xs font-black text-blue-600 uppercase tracking-widest">UPI SECURE</div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                <h3 className="font-black text-xl text-gray-900 mb-8 uppercase tracking-widest">Product Specs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {[
                    { label: "SKU ID", value: `FZK-${product.id.padStart(6, '0')}` },
                    { label: "Category", value: product.category },
                    { label: "Model", value: product.name },
                    { label: "Warranty", value: "1 Year International" },
                    { label: "Material", value: "Premium Grade Synthetic" },
                    { label: "Condition", value: "Brand New" },
                  ].map((spec, i) => (
                    <div key={i} className="flex flex-col py-5 border-b border-gray-50 group hover:border-blue-100 transition-colors">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">{spec.label}</span>
                      <span className="text-md font-black text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-50 pb-6">
                    <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight">Verified Reviews</h3>
                    <div className="flex gap-3">
                      <select className="text-xs border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-white font-black text-gray-500 focus:border-blue-500 outline-none cursor-pointer hover:border-gray-300 transition-all">
                        <option>Sort: Latest</option>
                      </select>
                      <select className="text-xs border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-white font-black text-gray-500 focus:border-blue-500 outline-none cursor-pointer hover:border-gray-300 transition-all">
                        <option>Filter: All Star 9</option>
                      </select>
                    </div>
                  </div>
                  {isReviewsLoading ? <CircularGlassSpinner /> : (
                    <div className="space-y-6">
                      <ReviewList reviews={reviews} />
                    </div>
                  )}
                </div>

                {/* Reviews Sidebar */}
                <div className="space-y-8">
                  <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 shadow-inner">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-600" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Safe Seller</span>
                      </div>
                      <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">UPI PAY</div>
                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fast Delivery</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Highlights</h5>
                      {reviews.slice(0, 2).map((review, i) => (
                        <div key={i} className="flex gap-5 group">
                          <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 overflow-hidden ring-4 ring-gray-100 group-hover:ring-blue-50 transition-all">
                            <img
                              src={`https://i.pravatar.cc/150?u=${(review as any).user?._id || i}`}
                              alt="user"
                              className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors">{(review as any).user?.name || 'User'}</p>
                              <p className="text-[9px] text-gray-300 font-bold">{new Date(review.createdAt).toISOString().split('T')[0]}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={11} fill={s <= review.rating ? "currentColor" : "none"} className={s <= review.rating ? "text-yellow-400" : "text-gray-200"} />
                                ))}
                              </div>
                              <span className="text-[10px] font-black text-gray-900">{review.rating}</span>
                              <span className="text-[9px] bg-blue-100 text-blue-600 font-black px-1.5 py-0.5 rounded ml-auto uppercase tracking-tighter">verified</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-bold leading-relaxed line-clamp-2">"{review.comment}"</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 text-center">
                      {id && (
                        <div className="pt-6 border-t border-gray-100">
                          {/* Add Review button blue exactly as requested */}
                          <ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-6xl mx-auto px-4 py-5 flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-3 py-4.5 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl active:scale-[0.98] group ${isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#FFC107] text-gray-900 hover:bg-[#FFD54F] hover:shadow-2xl'}`}
          >
            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
            ADD TO CART
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-3 py-4.5 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl active:scale-[0.98] group ${isOutOfStock ? 'hidden' : 'bg-[#FF9800] text-gray-900 hover:bg-[#FFA726] hover:shadow-2xl'}`}
          >
            BUY NOW
            <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
