import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Share2, Check, AlertTriangle, Info, Clock, ArrowRight, CreditCard, Package } from 'lucide-react';
import { useApp } from '../store/Context';
import { ProductCard } from '../components/ProductCard';
import API, { fetchProductById } from '../services/api';
import { Product, Review } from '../types';
import { ReviewList } from './ProductDetails/components/ReviewList';
import { ReviewForm } from './ProductDetails/components/ReviewForm';
import { useSocket } from '../hooks/useSocket';
import LazyImage from '../components/LazyImage';
import { SmoothReveal } from '../components/SmoothReveal';
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
        if (newReview.product._id === id) {
          handleReviewUpdate(newReview);
        }
      });

      socket.on('updatedReview', (updatedReview: Review) => {
        if (updatedReview.product._id === id) {
          handleReviewUpdate(updatedReview);
        }
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

        if (productData.reviews) {
          setReviews(productData.reviews);
        }

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
      return [
        product.image,
        `https://picsum.photos/seed/${product.id}1/600/600`,
        `https://picsum.photos/seed/${product.id}2/600/600`,
        `https://picsum.photos/seed/${product.id}3/600/600`,
      ];
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
    if (!isOutOfStock && quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (isOutOfStock) {
      setQuantity(1);
    }
  }, [currentStock, isOutOfStock, quantity]);

  if (isLoading) return <CircularGlassSpinner />;

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="p-6 bg-lightGray rounded-full text-gray-400">
        <Info size={48} />
      </div>
      <h2 className="text-2xl font-bold">Product Not Found</h2>
      <button onClick={() => navigate('/shop')} className="text-primary font-bold hover:underline">Return to Shop</button>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const productWithSelection = {
      ...product,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined
    };
    addToCart(productWithSelection, quantity);
    navigate('/cart');
  };

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants(prev => {
      const next = { ...prev, [name]: value };
      const match = product.inventory?.find(inv =>
        Object.entries(next).every(([k, v]) => inv.options[k] === v)
      );
      if (match?.image) {
        setActiveImage(match.image);
      }
      return next;
    });
  };

  const status = (() => {
    if (isOutOfStock) return { label: 'Currently Unavailable', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertTriangle size={14} /> };
    if (currentStock < 5) return { label: `Only ${currentStock} units left - Order soon!`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: <Clock size={14} /> };
    return { label: `In Stock (${currentStock} units available)`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <Check size={14} /> };
  })();

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
              <LazyImage
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex items-center justify-center p-8">
                  <div className="bg-dark text-white px-10 py-4 rounded-2xl font-bold text-2xl shadow-2xl tracking-widest transform -rotate-12 border-4 border-white">
                    SOLD OUT
                  </div>
                </div>
              )}
              <div className="absolute bottom-6 right-6">
                <button className="p-4 bg-white/90 backdrop-blur shadow-xl rounded-2xl hover:bg-primary hover:text-white transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all p-0.5 shadow-sm ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                >
                  <LazyImage src={img} alt={`${product.name} thumbnail`} className="w-full h-full object-cover rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">{product.name}</h1>
              <div className="text-sm text-gray-500">Brand: <span className="font-semibold text-gray-700">{product.category}</span></div>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-bold">
                  {product.rating ? product.rating.toFixed(1) : 'New'}
                  <Star size={14} fill="currentColor" />
                </div>
                <span className="text-gray-500 text-sm">{reviews.length} ratings • {reviews.length} reviews</span>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.name} className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{variant.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${selectedVariants[variant.name] === option
                              ? 'border-[#2874F0] bg-[#2874F0] text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <CreditCard size={18} className="text-blue-600" />
                Bank Offers
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <CreditCard size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">5% Unlimited Cashback</p>
                    <p className="text-xs text-gray-500">on Flipkart Axis Bank Credit Card</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <CreditCard size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">10% Instant Discount</p>
                    <p className="text-xs text-gray-500">on HDFC Bank Credit Card</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-700">10 Days Return Policy</span>
                </div>
              </div>

              <div className="flex items-center justify-around pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Seller</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Package size={16} className="text-blue-600" />
                  <span>Genuine</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck size={16} className="text-blue-600" />
                  <span>Pay Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            {['details', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all capitalize ${activeTab === tab ? 'border-[#2874F0] text-[#2874F0]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'specifications' ? 'Specifications' : 'Customer Reviews'}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {["Premium quality materials", "Durable construction", "Modern design", "Easy to maintain", "Eco-friendly", "Warranty included"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check size={16} className="text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Specifications</h3>
                {[
                  { label: "SKU ID", value: `FZK-${product.id.padStart(6, '0')}` },
                  { label: "Category", value: product.category },
                  { label: "In Stock", value: `${product.countInStock} Units` },
                  { label: "Warranty", value: "1 Year" },
                  { label: "Origin", value: "India" },
                  { label: "Material", value: "Premium Quality" }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-500">{spec.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-bold mb-2 text-gray-800">{product.rating ? product.rating.toFixed(1) : 'New'}</p>
                    <div className="flex text-yellow-400 justify-center mb-2">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}</div>
                    <p className="text-xs text-gray-500 font-semibold">{reviews.length} Reviews</p>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <div key={stars} className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-gray-600 w-8">{stars} ★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: `${reviews.length > 0 ? (reviews.filter(r => Math.floor(r.rating) === stars).length / reviews.length) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold w-10">{reviews.length > 0 ? Math.round((reviews.filter(r => Math.floor(r.rating) === stars).length / reviews.length) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isReviewsLoading ? (
                  <div className="flex justify-center p-10">
                    <CircularGlassSpinner />
                  </div>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
                {id && <ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} />}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="pt-12 mt-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">You May Also Like</h2>
                <p className="text-gray-500 text-sm mt-2">Similar products you might be interested in</p>
              </div>
              <button onClick={() => navigate('/shop')} className="text-[#2874F0] font-semibold hover:translate-x-2 transition-transform flex items-center gap-2 text-sm">View All <ArrowRight size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-[#2874F0] transition-all disabled:opacity-30" disabled={quantity <= 1 || isOutOfStock}><Minus size={18} /></button>
              <span className="w-10 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-[#2874F0] transition-all disabled:opacity-30" disabled={isOutOfStock || (currentStock > 0 && quantity >= currentStock)}><Plus size={18} /></button>
            </div>
            <button onClick={() => toggleWishlist(product.id)} className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center transition-all ${isWishlisted ? 'border-[#2874F0] text-[#2874F0] bg-blue-50' : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'}`}><Heart size={20} fill={isWishlisted ? "currentColor" : "none"} /></button>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#F9C74F] text-gray-800 hover:bg-[#f0b52e] hover:shadow-lg'}`}>
              <ShoppingCart size={18} />
              ADD TO CART
            </button>
            <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isOutOfStock ? 'hidden' : 'bg-[#F9C74F] text-gray-800 hover:bg-[#f0b52e] hover:shadow-lg'}`}>
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
