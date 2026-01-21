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
    <div className="bg-gradient-to-br from-[#e8f0fe] via-[#f0f4ff] to-[#e8f0fe] min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border border-white/50 relative">
              <div className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">
                <Search size={18} />
              </div>
              <div className="aspect-square">
                <LazyImage src={activeImage} alt={product.name} className={`w-full h-full object-contain ${isOutOfStock ? 'grayscale opacity-50' : ''}`} />
              </div>
            </div>

            <div className="flex gap-2">
              {allImages.slice(0, 4).map((img, i) => (
                <div key={i} onClick={() => setActiveImage(img)} className={`w-16 h-16 bg-white rounded-xl overflow-hidden cursor-pointer border-2 shadow-sm ${activeImage === img ? 'border-blue-500' : 'border-white/50'}`}>
                  <LazyImage src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-lg border border-white/50">
              <h3 className="font-semibold text-gray-800 mb-4">Full Description</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= Math.floor(product.rating || 0) ? "currentColor" : "none"} />)}</div>
                <span className="font-bold text-gray-800">{product.rating?.toFixed(1) || 'New'}</span>
                <span className="text-gray-500 text-sm ml-auto">{reviews.length.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars, idx) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-4">{stars}</span>
                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stars === 5 ? 'bg-green-500' : stars === 4 ? 'bg-green-400' : stars === 3 ? 'bg-yellow-400' : stars === 2 ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${(ratingCounts[5 - stars] / totalRatings) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{ratingCounts[5 - stars].toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Lock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600">Surniri© 24/7</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-lg border border-white/50">
              <h1 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-3">Brand: <span className="text-gray-700">{product.category}</span></p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= Math.floor(product.rating || 0) ? "currentColor" : "none"} />)}</div>
                <span className="font-bold text-gray-800">{product.rating?.toFixed(1) || 'New'}</span>
                <span className="text-gray-500 text-sm">{reviews.length.toLocaleString()} ratings • {reviews.length} reviews</span>
              </div>

              <div className="flex gap-2 mb-4">
                {['#3B82F6', '#9CA3AF', '#EF4444', '#E5E7EB'].map((color, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 cursor-pointer ${i === 0 ? 'border-blue-600' : 'border-gray-200'}`} style={{ backgroundColor: color }} />
                ))}
              </div>

              {product.variants && product.variants.length > 0 && product.variants.map((variant) => (
                <div key={variant.name} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-gray-300 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <button key={option} onClick={() => handleVariantSelect(variant.name, option)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${selectedVariants[variant.name] === option ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                          {option}
                        </button>
                      ))}
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </div>
                </div>
              ))}

              {(!product.variants || product.variants.length === 0) && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-1 bg-gray-300 rounded" />
                  {[6, 7, 8, 8, 9, 10, 11].map((size, i) => (
                    <button key={i} className={`px-3 py-1.5 border rounded-lg text-sm font-medium ${i === 0 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700'}`}>{size}</button>
                  ))}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-lg border border-white/50">
              <h3 className="font-semibold text-gray-800 mb-3">Bank Offers</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><CreditCard size={16} className="text-blue-600" /></div>
                  <div><p className="text-sm font-medium text-gray-800">5% Unlimited Cashback</p><p className="text-xs text-gray-500">on Flipkart Axis Bank Credit Card</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><CreditCard size={16} className="text-green-600" /></div>
                  <div><p className="text-sm font-medium text-gray-800">10% Instant Discount</p><p className="text-xs text-gray-500">on HDFC Bank Credit Card</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><Package size={16} className="text-orange-600" /></div>
                  <div><p className="text-sm font-medium text-gray-800">Pay Later & Get 10% Cashback</p><p className="text-xs text-gray-500">on Flipkart Pay Later</p></div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <RotateCcw size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-800">10 Days Return Policy</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div><span className="text-xs text-gray-600">Seller</span></div>
                <div className="flex items-center gap-1.5"><span className="text-xs font-bold text-blue-600">UPI</span></div>
                <div className="flex items-center gap-1.5"><Truck size={14} className="text-gray-600" /><span className="text-xs text-gray-600">Pay Delivery</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/80 backdrop-blur rounded-3xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['details', 'specifications', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-sm font-medium transition-all ${activeTab === tab ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'details' ? 'Product Details' : tab === 'specifications' ? 'Specifications' : 'Customer Reviews'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="flex items-center gap-2 pt-4"><div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div><span className="text-xs text-gray-600">Seller</span><span className="text-xs font-bold text-blue-600 ml-2">UPI</span></div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3">
                {[{ label: "SKU", value: `FZK-${product.id.padStart(6, '0')}` }, { label: "Category", value: product.category }, { label: "Stock", value: `${product.countInStock} Units` }, { label: "Warranty", value: "1 Year" }].map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{spec.label}</span>
                    <span className="text-sm font-medium text-gray-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"><option>Latest</option></select>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"><option>All Star 9</option></select>
                  </div>
                  {isReviewsLoading ? <CircularGlassSpinner /> : <ReviewList reviews={reviews} />}
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-4">Customer Reviews</h4>
                  <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Package size={12} /> Seller</span>
                    <span className="font-bold text-blue-600">UPI</span>
                    <span className="flex items-center gap-1"><Truck size={12} /> Pay Delivery</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <h5 className="font-medium text-gray-800">Reviews</h5>
                    {reviews.slice(0, 2).map((review, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{(review as any).user?.name?.charAt(0) || 'U'}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{(review as any).user?.name || 'User'}</p>
                          <div className="flex items-center gap-1"><div className="flex text-yellow-400">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} />)}</div><span className="text-xs text-gray-500">{review.rating}</span></div>
                          <p className="text-xs text-gray-600 mt-1">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {id && <div className="mt-4"><ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} /></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-2xl z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-3">
          <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${isOutOfStock ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#F9C74F] text-gray-900 hover:bg-[#f0b52e]'}`}>
            <ShoppingCart size={18} /> ADD TO CART
          </button>
          <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${isOutOfStock ? 'hidden' : 'bg-[#F9C74F] text-gray-900 hover:bg-[#f0b52e]'}`}>
            BUY NOW <ChevronRight size={18} />
          </button>
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white"><ShoppingCart size={20} /></button>
            <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};
