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
  const { products: allProducts, addToCart, toggleWishlist, wishlist, user } = useApp();
  const { addToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // 1️⃣ Correct STATE structure (MANDATORY)
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);

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

        // Metadata Parsing (optional but kept for safety)
        let richVariants = productData.variants;
        if (productData.description && productData.description.includes('<!-- METADATA:')) {
          try {
            const parts = productData.description.split('<!-- METADATA:');
            productData.description = parts[0].trim();
            const meta = JSON.parse(parts[1].split('-->')[0]);
            if (meta.variants) richVariants = meta.variants;
          } catch (e) { console.error("Meta parse error", e); }
        }

        const finalProduct = { ...productData, variants: richVariants };
        setProduct(finalProduct);

        if (finalProduct.reviews) setReviews(finalProduct.reviews);

        // Initialize Defaults using the new logic if needed
        // Just setting defaults if they exist in the product root
        // If strict variants exist, we could try to auto-select the first one
        if (finalProduct.variants && finalProduct.variants.length > 0) {
          // Try to find a variant logic or just use product defaults
          // For now, let's leave it null to force user selection OR use defaultColor/Size if present
          if (finalProduct.defaultColor) setSelectedColor(finalProduct.defaultColor);
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

  // 3️⃣ CORE VARIANT RESOLUTION (YAHI TUMHARA BUG HAI)
  useEffect(() => {
    if (!product || !product.variants) return;
    if (!selectedColor || !selectedSize) return;

    // Strict 30-Second Test Logic
    const found = (product.variants as ProductVariant[]).find(
      (v: any) => v.color === selectedColor && v.size === selectedSize
    );

    console.log("SELECTED", selectedColor, selectedSize);
    console.log("FOUND VARIANT", found);

    if (found) {
      setActiveVariant(found);
    } else {
      // Optional: If no exact match (e.g. invalid combination), maybe reset active variant?
      // But user said "valid variant match ✅ MUST". So we keep it null or previous.
      // Let's set to null if not found to avoid misleading image
      setActiveVariant(null);
    }
  }, [selectedColor, selectedSize, product]);


  // Helper to derive valid options from the flat variants list
  const { uniqueColors, uniqueSizes, colorMap } = useMemo(() => {
    if (!product || !product.variants) return { uniqueColors: [], uniqueSizes: [], colorMap: {} };

    // We assume variants is a flat list of SKUs as per user instruction
    // But we need to be robust. If it's the old 'VariantGroup' style (name: Color, options: []),
    // we need to handle that or render differently. 
    // BUT the user insists on flat list logic source. 
    // Let's try to extract from flat list first.

    const colors = new Set<string>();
    const sizes = new Set<string>();
    const cMap: Record<string, string> = {}; // Name -> Hex etc

    // Check if it's flat list or groups
    const isFlat = product.variants.some((v: any) => v.color || v.size);

    if (isFlat) {
      (product.variants as any[]).forEach(v => {
        if (v.color) colors.add(v.color);
        if (v.size) sizes.add(v.size);
        // If there's extra data for color rendering (like hex code in metadata?), it would be here
      });
    } else {
      // Fallback for legacy Group structure (render buttons from groups)
      // But logic for resolution will fail if we don't have flat variants to find().
      // We will assume for rendering we can attempt to extract.
      (product.variants as any[]).forEach(v => {
        if (v.name === 'Color' || v.name === 'Colour') {
          v.options.forEach((opt: any) => {
            const name = typeof opt === 'object' ? opt.name : opt;
            colors.add(name);
            if (typeof opt === 'object' && opt.color) cMap[name] = opt.color;
          });
        }
        if (v.name === 'Size') {
          v.options.forEach((opt: any) => {
            const name = typeof opt === 'object' ? opt.name : opt;
            sizes.add(name);
          });
        }
      });
    }

    return {
      uniqueColors: Array.from(colors),
      uniqueSizes: Array.from(sizes),
      colorMap: cMap
    };
  }, [product]);


  // 5️⃣ COLOR CLICK HANDLER
  function handleColor(color: string) {
    setSelectedColor(color);
  }

  // 6️⃣ SIZE CLICK HANDLER
  function handleSize(size: string) {
    setSelectedSize(size);
  }

  const getColorClass = (colorName: string) => {
    const map: Record<string, string> = {
      'Blue': 'bg-blue-500', 'Red': 'bg-red-500', 'Green': 'bg-green-500',
      'Black': 'bg-gray-900', 'White': 'bg-white', 'Yellow': 'bg-yellow-400',
      'Orange': 'bg-orange-500', 'Purple': 'bg-purple-500', 'Pink': 'bg-pink-500', 'Gray': 'bg-gray-500',
    };
    return colorMap[colorName] || map[colorName] || 'bg-gray-200';
  };

  // Image Source Logic: Use activeVariant directly
  const displayImage = activeVariant?.image ? getProductImageUrl(activeVariant.image) : null;

  // Passed to Gallery: We override the images list if a variant is active
  // user says: <Image src={activeVariant?.image} ... />
  // We use ProductGallery, so we pass `images` prop.
  const galleryImages = useMemo(() => {
    if (activeVariant?.image) return [getProductImageUrl(activeVariant.image)];
    return getAllProductImages(product);
  }, [activeVariant, product]);

  if (isLoading) return <CircularGlassSpinner />;

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="p-6 bg-gray-100 rounded-full text-gray-400"><Info size={48} /></div>
      <h2 className="text-2xl font-bold">Product Not Found</h2>
      <button onClick={() => router.push('/shop')} className="text-blue-600 font-bold hover:underline">Return to Shop</button>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  // Price Logic: prefer variant price
  const displayPrice = activeVariant?.price || product.price;
  const displayStock = activeVariant?.stock !== undefined ? activeVariant.stock : product.countInStock;
  const isOutOfStock = displayStock <= 0;

  const discount = product.originalPrice > displayPrice
    ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock || !product) return;
    if (uniqueColors.length > 0 && !selectedColor) { addToast('error', 'Please select a color'); return; }
    if (uniqueSizes.length > 0 && !selectedSize) { addToast('error', 'Please select a size'); return; }

    const productWithSelection = {
      ...product,
      price: displayPrice,
      image: activeVariant?.image ? getProductImageUrl(activeVariant.image) : getProductImageUrl(product.image),
      selectedVariants: { Color: selectedColor, Size: selectedSize } as Record<string, string>,
      variantId: activeVariant?.id || (activeVariant as any)?._id
    };

    addToCart(productWithSelection, quantity);
    addToast('success', '✅ Product added to bag!');
  };

  const handleBuyNow = () => {
    if (isOutOfStock || !product) return;
    if (uniqueColors.length > 0 && !selectedColor) { addToast('error', 'Please select a color'); return; }
    if (uniqueSizes.length > 0 && !selectedSize) { addToast('error', 'Please select a size'); return; }

    const productWithSelection = {
      ...product,
      price: displayPrice,
      image: activeVariant?.image ? getProductImageUrl(activeVariant.image) : getProductImageUrl(product.image),
      selectedVariants: { Color: selectedColor, Size: selectedSize } as Record<string, string>,
      variantId: activeVariant?.id || (activeVariant as any)?._id
    };
    addToCart(productWithSelection, quantity);
    router.push('/checkout');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* 4️⃣ IMAGE DISPLAY (Using Gallery) */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <ProductGallery product={product} images={galleryImages} />
            </div>
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
              <span className="text-3xl font-bold text-gray-900">₹{displayPrice.toLocaleString()}</span>
              {product.originalPrice > displayPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-lg font-bold text-green-600">{discount}% off</span>
                </>
              )}
            </div>

            {/* Colors Section */}
            {uniqueColors.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Color: <span className="text-blue-600">{selectedColor}</span>
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColor(color)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800' : 'border-gray-300'} shadow-sm ${getColorClass(color)}`}
                      title={color}
                      style={colorMap[color] ? { backgroundColor: colorMap[color] } : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Section */}
            {uniqueSizes.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Size: <span className="text-blue-600">{selectedSize}</span>
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSize(size)}
                      className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg border-2 text-xs sm:text-sm font-medium ${selectedSize === size ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}


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