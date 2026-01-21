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
    <div className="bg-[#F5F7FA] min-h-screen pb-28 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* SECTION 1: ABOVE FOLD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image & Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
              <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm border border-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm border border-gray-100 cursor-pointer">
                <Search size={18} className="text-gray-400" />
              </div>
              <div className="aspect-square flex items-center justify-center overflow-hidden">
                <LazyImage
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-contain ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {allImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-18 h-18 bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow-sm ${activeImage === img ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Rating Breakdown Card (labeled "Full Description" in image) */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Full Description</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.floor(product.rating || 0) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{product.rating?.toFixed(1) || '4.4'}</span>
                <span className="text-gray-400 text-sm ml-auto">{reviews.length.toLocaleString() || '8,562'}</span>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars, idx) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-4">{stars}</span>
                    <Star size={12} className="text-yellow-500" fill="currentColor" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stars >= 4 ? 'bg-yellow-500' : stars === 3 ? 'bg-blue-500' : stars === 2 ? 'bg-blue-400' : 'bg-blue-300'}`}
                        style={{ width: `${(ratingCounts[5 - stars] / (totalRatings || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{ratingCounts[5 - stars].toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                <Lock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">Surniri© 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Selectors */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-2">Brand: <span className="text-gray-900">{product.category}</span></p>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= Math.round(product.rating || 4.4) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#2563EB]">4.4</span>
                <span className="text-sm text-gray-400">
                  • {reviews.length.toLocaleString() || '8,562'} ratings • {reviews.length || '1,095'} reviews
                </span>
              </div>

              {/* Color Selector */}
              <div className="flex gap-2 mt-5">
                {['#3B82F6', '#D1D5DB', '#EF4444', '#F3F4F6'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${i === 0 ? 'border-blue-600 ring-1 ring-blue-600 ring-offset-2' : 'border-gray-100'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Size Selector */}
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="h-[2px] w-12 bg-blue-600 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {[6, 7, 8, 8, 9, 10, 11].map((size, i) => (
                      <button
                        key={i}
                        className={`px-4 py-1.5 border rounded-lg text-sm font-medium transition-all ${i === 0 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <ChevronRight size={18} className="text-gray-300 ml-auto" />
                </div>
              </div>
            </div>

            {/* SECTION 2: BANK OFFERS & POLICY */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Bank Offers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">5% Unlimited Cashback</p>
                    <p className="text-xs text-gray-500 mt-0.5">on Flipkart Axis Bank Credit Card</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">10% Instant Discount</p>
                    <p className="text-xs text-gray-500 mt-0.5">on HDFC Bank Credit Card</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Package size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pay Later & Get 10% Cashback</p>
                    <p className="text-xs text-gray-500 mt-0.5">on Flipkart Pay Later</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">10 Days Return Policy</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">Seller</span>
                </div>
                <div className="text-xs font-bold text-blue-600">UPI</div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">Pay Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TABS - DETAILS / SPECS / REVIEWS */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 px-4">
            {['details', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'specifications' ? 'Specifications' : 'Customer Reviews'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="max-w-4xl">
                <div className="flex items-start gap-4 mb-4">
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600">
                    <option>Latest</option>
                  </select>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600">
                    <option>All Star 9</option>
                  </select>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description || "Very good quality product with comfortable sole and durable build. High-performance sneakers designed for all-day comfort and style. Featuring a breathable upper and a cushioned midsole."}
                </p>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">Seller</span>
                  </div>
                  <div className="text-xs font-bold text-blue-600">UPI</div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-xl space-y-4">
                {[
                  { label: "SKU", value: `FZK-${product.id.padStart(6, '0')}` },
                  { label: "Category", value: product.category },
                  { label: "Model", value: product.name },
                  { label: "Warranty", value: "1 Year" },
                  { label: "Material", value: "Premium Synthetic" },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400 font-medium">{spec.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600">
                      <option>Latest</option>
                    </select>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600">
                      <option>All Star 9</option>
                    </select>
                  </div>
                  {isReviewsLoading ? <CircularGlassSpinner /> : <ReviewList reviews={reviews} />}
                </div>

                {/* Reviews Sidebar */}
                <div className="space-y-6">
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Customer Reviews</h4>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CreditCard size={14} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Seller</span>
                      </div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase">UPI</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Truck size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Pay Delivery</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h5 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reviews</h5>
                      {reviews.slice(0, 2).map((review, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?u=${(review as any).user?._id || i}`} alt="user" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{(review as any).user?.name || 'User'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-gray-900 ml-1">{review.rating}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{review.comment}</p>
                            <p className="text-[10px] text-gray-300 mt-2 font-bold">{new Date(review.createdAt).toISOString().split('T')[0]}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      {id && (
                        <ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-6xl mx-auto flex items-center px-4 py-3 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all shadow-sm ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FFC107] text-gray-900 hover:bg-[#FFD54F]'}`}
          >
            <ShoppingCart size={18} /> ADD TO CART
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all shadow-sm ${isOutOfStock ? 'hidden' : 'bg-[#FF9800] text-white hover:bg-[#FFA726]'}`}
          >
            BUY NOW <ChevronRight size={18} />
          </button>
          <div className="flex items-center gap-4 ml-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <ShoppingCart size={22} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
