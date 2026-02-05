"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Share2, Check, AlertTriangle, Info, Clock, ArrowRight, CreditCard, Package, ChevronRight, Search, Lock } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import { useToast } from '@/app/components/toast';
import API, { fetchProductById } from '@/app/services/api';
import { Product, Review, ProductVariant } from '@/app/types';
import { ReviewList } from './ProductDetails/components/ReviewList';
import { ReviewForm } from './ProductDetails/components/ReviewForm';
import { useSocket } from '@/app/hooks/useSocket';
import LazyImage from '@/app/components/LazyImage';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import ProductGallery from '@/app/components/ProductGallery';
import { getProductImageUrl, getAllProductImages } from '@/app/utils/imageHelper';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, wishlist, user } = useApp();
  const { addToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // ================================================
  // STEP 2 — LOCK FRONTEND STATE MODEL
  // ================================================
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<any>(null);

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

  // Load Product & Reviews
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProductById(id);
        const data = res.data?.data?.product || res.data;
        if (data.reviews) setReviews(data.reviews);
        setProduct(data); // "variants" is now flat list from backend
      } catch (e) {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ================================================
  // STEP 3 — DEFAULT VARIANT ON LOAD
  // ================================================
  useEffect(() => {
    if (!product?.variants?.length) return;

    // Backend ensures variants[0] is valid if variants exist
    // Cast to any because our Types.ts definition is a Union (VariantGroup | ProductVariant)
    // but we know backend is sending strictly ProductVariant (flat) now.
    const variants = product.variants as any[];
    const first = variants[0];

    // We add a check to prevent loop/override if user already selected
    // specific logic: if activeVariant is null, or if it belongs to different product
    if (!activeVariant || activeVariant.productId !== product.id) {
      if (first.color && first.size) {
        setSelectedColor(first.color);
        setSelectedSize(first.size);
        setActiveVariant(first);
        console.log("DEFAULT LOADED", first.color, first.size);
      }
    }
  }, [product]); // Dependency: product (id check inside)

  // ================================================
  // STEP 4 — CORE VARIANT RESOLUTION (CRITICAL)
  // ================================================
  useEffect(() => {
    if (!product || !product.variants) return;
    if (!selectedColor || !selectedSize) return;

    // Strict find
    const found = (product.variants as any[]).find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    if (found) {
      setActiveVariant(found);
    } else {
      setActiveVariant(null);
    }

    // ================================================
    // STEP 8 — DEBUG GUARANTEE (MANDATORY)
    // ================================================
    console.log("COLOR", selectedColor);
    console.log("SIZE", selectedSize);
    console.log("ACTIVE VARIANT", found ? found : "NULL (No Match)");

  }, [selectedColor, selectedSize, product]);

  // Derived Options for UI
  const { uniqueColors, uniqueSizes, colorMap } = useMemo(() => {
    if (!product || !product.variants) return { uniqueColors: [], uniqueSizes: [], colorMap: {} };
    const colors = new Set<string>();
    const sizes = new Set<string>();
    // For mapping hex if available (not in strict shape but helpful)
    const cMap: Record<string, string> = {};

    (product.variants as any[]).forEach(v => {
      if (v.color) colors.add(v.color);
      if (v.size) sizes.add(v.size);
    });

    return { uniqueColors: Array.from(colors), uniqueSizes: Array.from(sizes), colorMap: cMap };
  }, [product]);


  // ================================================
  // STEP 6 — COLOR CHANGE RULE
  // ================================================
  const handleColor = (color: string) => {
    setSelectedColor(color);

    if (product && product.variants) {
      // Reset size to first available of this color
      const firstSizeVariant = (product.variants as any[]).find(v => v.color === color);
      if (firstSizeVariant) {
        setSelectedSize(firstSizeVariant.size);
        // We set activeVariant here immediately as per user snippet step 6
        // But Step 4 effect will also fire. That is fine. 
        setActiveVariant(firstSizeVariant);
      } else {
        setSelectedSize(null); // No size found for this color
        setActiveVariant(null);
      }
    }
  };

  // ================================================
  // STEP 7 — SIZE CHANGE RULE
  // ================================================
  const handleSize = (size: string) => {
    setSelectedSize(size);
    // Variant effect handles everything. (Step 4 checks color+size -> finds variant)
  };


  // ================================================
  // STEP 5 — IMAGE SOURCE HARD LOCK
  // ================================================
  // Passed to gallery. strict.
  // "Use activeVariant?.image || /placeholder.png"
  const galleryImages = useMemo(() => {
    // User requirement: "activeVariant.image ?? placeholder". 
    // We pass this array to gallery.
    if (activeVariant?.image) return [getProductImageUrl(activeVariant.image)];
    return ["/placeholder.png"];
  }, [activeVariant]);

  const getColorClass = (colorName: string) => {
    // Basic color mapping
    const map: Record<string, string> = {
      'Blue': 'bg-blue-500', 'Red': 'bg-red-500', 'Green': 'bg-green-500',
      'Black': 'bg-gray-900', 'White': 'bg-white', 'Yellow': 'bg-yellow-400',
      'Orange': 'bg-orange-500', 'Purple': 'bg-purple-500', 'Pink': 'bg-pink-500', 'Gray': 'bg-gray-500',
    };
    return map[colorName] || 'bg-gray-200';
  };


  if (isLoading) return <CircularGlassSpinner />;
  if (!product) return <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center space-y-4">
    <div className="p-6 bg-gray-100 rounded-full text-gray-400"><Info size={48} /></div>
    <h2 className="text-2xl font-bold">Product Not Found</h2>
    <button onClick={() => router.push('/shop')} className="text-blue-600 font-bold hover:underline">Return to Shop</button>
  </div>;

  // Price & Stock Display
  const currentPrice = activeVariant?.price || product.price; // Fallback only for price if variant missing price field? User said "price syncs".
  const currentStock = activeVariant?.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const discount = product.originalPrice > currentPrice
    ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
    : 0;


  const handleAddToCart = () => {
    if (isOutOfStock) { addToast('error', 'Product is out of stock'); return; }
    if (!activeVariant) { addToast('error', 'Please select a valid variant'); return; }

    const item = {
      ...product,
      price: activeVariant.price,
      image: getProductImageUrl(activeVariant.image),
      selectedVariants: { Color: selectedColor, Size: selectedSize } as any,
      variantId: activeVariant.id
    };
    addToCart(item, quantity);
    addToast('success', 'Added to Bag');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) { addToast('error', 'Product is out of stock'); return; }
    if (!activeVariant) { addToast('error', 'Please select a valid variant'); return; }
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* GALLERY HARD LINKED TO ACTIVE VARIANT */}
            <ProductGallery product={product} images={galleryImages} />
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{product.category}</p>

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
              {product.originalPrice > currentPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-lg font-bold text-green-600">{discount}% off</span>
                </>
              )}
            </div>

            {/* Colors */}
            {uniqueColors.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Color: <span className="text-blue-600">{selectedColor}</span>
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {uniqueColors.map(c => (
                    <button
                      key={c}
                      onClick={() => handleColor(c)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${selectedColor === c ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800' : 'border-gray-300'} ${getColorClass(c)}`}
                      title={c}
                      style={colorMap[c] ? { backgroundColor: colorMap[c] } : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {uniqueSizes.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Size: <span className="text-blue-600">{selectedSize}</span>
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {uniqueSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSize(s)}
                      className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg border-2 text-xs sm:text-sm font-medium ${selectedSize === s ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex mt-6 sm:mt-8 flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !activeVariant}
                className={`w-full sm:flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isOutOfStock || !activeVariant ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'}`}
              >
                <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              {!isOutOfStock && activeVariant && (
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] bg-gray-900 text-white hover:bg-black shadow-md"
                >
                  BUY NOW
                  <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      {/* Description/Reviews Tabs below (simplified strict view) */}
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
                <p className="mb-3 sm:mb-4 whitespace-pre-wrap">{product.description}</p>

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