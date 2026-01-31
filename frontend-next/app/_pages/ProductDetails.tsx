"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Share2, Check, AlertTriangle, Info, Clock, ArrowRight, CreditCard, Package, ChevronRight, Search, Lock } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import { useToast } from '@/app/components/toast';
import API, { fetchProductById } from '@/app/services/api';
import { Product, Review } from '@/app/types';
import { ReviewList } from './ProductDetails/components/ReviewList';
import { ReviewForm } from './ProductDetails/components/ReviewForm';
import { useSocket } from '@/app/hooks/useSocket';
import LazyImage from '@/app/components/LazyImage';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import ProductGallery from '@/app/components/ProductGallery';
import { getProductImageUrl } from '@/app/utils/imageHelper';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { products: allProducts, addToCart, toggleWishlist, wishlist, user } = useApp();
  const { addToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
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
      socket.on('productUpdated', (updatedProduct: Product) => {
        if (updatedProduct.id === id) {
          setProduct(updatedProduct);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('newReview');
        socket.off('updatedReview');
        socket.off('productUpdated');
      }
    };
  }, [id, socket]);

  useEffect(() => {
    if (!id) return;
    const getProductAndReviews = async () => {
      setIsLoading(true);
      setIsReviewsLoading(true);
      try {
        const productResponse = await fetchProductById(id);
        const productData = productResponse.data?.data?.product || productResponse.data;
        setProduct(productData);

        if (productData.reviews) setReviews(productData.reviews);

        // Default Variants Logic
        if (productData.variants && productData.variants.length > 0) {
          const defaults: Record<string, string> = {};
          productData.variants.forEach((v: any) => {
            if (v.name.toLowerCase() === 'color' && productData.defaultColor) {
              if (v.options.includes(productData.defaultColor)) {
                defaults[v.name] = productData.defaultColor;
              }
            }
            if (v.options && v.options.length > 0 && !defaults[v.name]) defaults[v.name] = v.options[0];
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

  const { currentStock, isOutOfStock, currentPrice, currentOriginalPrice } = useMemo(() => {
    if (!product) return { currentStock: 0, isOutOfStock: true, currentPrice: 0, currentOriginalPrice: 0 };

    let stock = product.countInStock;
    let price = product.price;
    let originalPrice = product.originalPrice;

    if (product.variants && product.variants.length > 0 && product.inventory) {
      const match = product.inventory.find(inv =>
        Object.entries(selectedVariants).every(([k, v]) => inv.options[k] === v)
      );
      if (match) {
        stock = match.stock;
        if (match.price) price = match.price;
      }
    }

    return {
      currentStock: stock,
      isOutOfStock: stock <= 0,
      currentPrice: price,
      currentOriginalPrice: originalPrice
    };
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
      <button onClick={() => router.push('/shop')} className="text-blue-600 font-bold hover:underline">Return to Shop</button>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  const discount = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const productWithSelection = {
      ...product,
      price: currentPrice,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined
    };
    addToCart(productWithSelection, quantity);
    addToast('success', '✅ Product added to bag!');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const productWithSelection = {
      ...product,
      price: currentPrice,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined
    };
    addToCart(productWithSelection, quantity);
    addToast('success', '✅ Product added to bag!');
    router.push('/checkout');
  };

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [name]: value }));
  };

  const getColorClass = (colorName: string) => {
    const map: Record<string, string> = {
      'Blue': 'bg-blue-500', 'Red': 'bg-red-500', 'Green': 'bg-green-500',
      'Black': 'bg-gray-900', 'White': 'bg-white', 'Yellow': 'bg-yellow-400',
      'Orange': 'bg-orange-500', 'Purple': 'bg-purple-500', 'Pink': 'bg-pink-500', 'Gray': 'bg-gray-500',
    };
    return map[colorName] || 'bg-gray-200';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <ProductGallery product={product} />
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Brand: {product.category}</p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i <= Math.floor(product.rating || 4.4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-900">{product.rating?.toFixed(1) || '4.4'}</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {reviews.length.toLocaleString()} ratings · {reviews.length} reviews
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{currentOriginalPrice.toLocaleString()}</span>
                  <span className="text-lg font-bold text-green-600">{discount}% off</span>
                </>
              )}
            </div>

            {product.variants && product.variants.length > 0 && product.variants.map((variant, vIdx) => {
              const matchesColor = variant.name.toLowerCase() === 'color' || variant.name.toLowerCase() === 'colour';
              const selectedValue = selectedVariants[variant.name];

              return (
                <div key={vIdx} className="mt-4 sm:mt-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                    {variant.name}: <span className="text-blue-600">{selectedValue || variant.options[0]}</span>
                  </h3>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {variant.options.map((option, oIdx) => {
                      const isActive = selectedValue === option || (!selectedValue && oIdx === 0);
                      if (matchesColor) {
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${getColorClass(option)} border-2 ${isActive ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800' : 'border-gray-300'}`}
                            title={option}
                          />
                        );
                      }
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleVariantSelect(variant.name, option)}
                          className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg border-2 text-xs sm:text-sm font-medium ${isActive ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex mt-6 sm:mt-8 flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full sm:flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'}`}
              >
                <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full sm:flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isOutOfStock ? 'hidden' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'}`}
              >
                BUY NOW
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Bank Offers</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={16} className="sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">5% Unlimited Cashback</p>
                  <p className="text-xs sm:text-sm text-gray-600">on Fzokart Axis Bank Credit Card</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">Pay Later & Get 10% Cashback</p>
                  <p className="text-xs sm:text-sm text-gray-600">on Fzokart Pay Later</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
              <RotateCcw size={18} className="sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium">7 Days Return Policy</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gray-50 rounded-lg">
                <Check size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Seller</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">UPI</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gray-50 rounded-lg">
                <Truck size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Pay Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-4 sm:mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button onClick={() => setActiveTab('description')} className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm whitespace-nowrap ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Description</button>
            <button onClick={() => setActiveTab('specifications')} className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm whitespace-nowrap ${activeTab === 'specifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Specifications</button>
            <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm whitespace-nowrap ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Customer Reviews</button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'description' && (
              <div className="text-sm sm:text-base text-gray-700">
                <p className="mb-3 sm:mb-4">{product.description || "Very good quality product with comfortable sole and durable build. Perfect for casual daily wear."}</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check size={14} className="sm:w-4 sm:h-4 text-blue-600" /> <span>Seller</span> <span className="text-gray-400">|</span> <span>UPI</span>
                </div>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div>
                <div className="space-y-4">
                  {product.specifications ? (
                    <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 leading-relaxed border p-4 rounded-lg bg-gray-50">{product.specifications}</div>
                  ) : (
                    <div className="text-gray-500 italic text-sm">No specific specifications available for this product.</div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{product.category}</span></div>
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Stock Status</span><span className={`font-medium ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg">Customer Reviews</h3>
                  <select className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"><option>Latest</option></select>
                </div>
                {isReviewsLoading ? <CircularGlassSpinner /> : <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6"><ReviewList reviews={reviews} /></div>}
                {id && <ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};