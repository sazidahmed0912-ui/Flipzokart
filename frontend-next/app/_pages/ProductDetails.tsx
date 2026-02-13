"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Star, Truck, RotateCcw, Check, Info, ChevronRight, CreditCard, Package, Ruler, Palette, Layers, AlertCircle } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import { fetchProductById } from '@/app/services/api';
import { Product, ProductVariant, CartItem, Review } from '@/app/types';
import { ReviewList } from './ProductDetails/components/ReviewList';
import { ReviewForm } from './ProductDetails/components/ReviewForm';
import { useSocket } from '@/app/hooks/useSocket';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import ProductGallery from '@/app/components/ProductGallery';

import { getProductImageUrl } from '@/app/utils/imageHelper';
import useRelatedProducts from '@/app/hooks/useRelatedProducts';
import { ProductCard } from '@/app/components/ProductCard';
import { viewContent, addToCart as fbAddToCart, initiateCheckout } from '@/lib/fbPixel';
import { requireAuth } from '@/app/utils/requireAuth';

// --- Helper: Parse Metadata for Dynamic Groups ---
const parseVariantMetadata = (description: string): any[] => {
  if (!description || !description.includes('<!-- METADATA:')) return [];
  try {
    const parts = description.split('<!-- METADATA:');
    const jsonStr = parts[1].split('-->')[0];
    const meta = JSON.parse(jsonStr);
    return meta.variants || [];
  } catch (e) {
    return [];
  }
};

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useApp();
  const { addToast } = useToast();

  // --- State ---
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('description');

  // Dynamic Selection State: Record<GroupName, OptionName>
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);

  // --- Socket & Data Logic ---
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const socket = useSocket(token);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProductById(id);
        const data = res.data?.data?.product || res.data;
        setProduct(data);
        if (data.reviews) setReviews(data.reviews);
      } catch (e) {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Facebook Pixel - ViewContent
  useEffect(() => {
    if (product) {
      viewContent({
        content_name: product.name,
        content_ids: [product.id],
        value: product.price,
        currency: 'INR',
      });
    }
  }, [product]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !id) return;
    const handleUpdate = (updated: Product) => {
      if (updated.id === id) {
        setProduct(updated);
        // Reset selections on update to prevent stale state
        setSelections({});
      }
    };
    socket.on('productUpdated', handleUpdate);
    return () => { socket.off('productUpdated', handleUpdate); };
  }, [socket, id]);

  // --- Core Logic: Variant Groups & Defaults ---
  const variantGroups = useMemo(() => {
    if (!product) return [];

    // Priority 1: Metadata (Rich Groups with Images/Colors)
    const metaGroups = parseVariantMetadata(product.description || '');
    if (metaGroups.length > 0) return metaGroups;

    // Priority 2: Inferred from Flat Variants (Native Fallback)
    if (product.variants && product.variants.length > 0) {
      const groups: any[] = [];
      const variants = product.variants as ProductVariant[];

      const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
      if (colors.length) groups.push({ name: 'Color', options: colors.map(c => ({ name: c, color: '#000' })) });

      const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
      if (sizes.length) groups.push({ name: 'Size', options: sizes.map(s => ({ name: s })) });

      return groups;
    }

    return [];
  }, [product]);

  // Auto-Select Default (First Valid Variant)
  useEffect(() => {
    if (!product || !product.variants?.length) return;

    // Only auto-select if nothing selected yet
    if (Object.keys(selections).length === 0) {
      const first = product.variants[0] as ProductVariant;
      const initial: Record<string, string> = {};

      // Map flat fields to groups if possible
      variantGroups.forEach(g => {
        if (g.name === 'Color' && first.color) initial['Color'] = first.color;
        if (g.name === 'Size' && first.size) initial['Size'] = first.size;
        // Search options map if available (for custom groups)
        // Note: Backend might not send 'options' map in flat variant list unless explicitly included.
        // We rely on standard matching logic below.
      });

      // If we inferred groups, set them
      if (Object.keys(initial).length > 0) setSelections(initial);
    }
  }, [product, variantGroups]);

  // --- Active Variant Resolution ---
  useEffect(() => {
    if (!product || !product.variants?.length) {
      setActiveVariant(null);
      return;
    }

    // STRICT MATCHING
    const found = product.variants.find((v: any) => {
      // 1. Check standard fields
      if (selections['Color'] && v.color !== selections['Color']) return false;
      if (selections['Size'] && v.size !== selections['Size']) return false;

      // 2. Check Custom Groups (if variant has 'options' map)
      // If the backend doesn't send 'options' in the variant object, filtering by custom groups 
      // is impossible on frontend without metadata mapping. 
      // Assumes 'ProductVariant' might have loose props or we match loosely.
      return true;
    });

    setActiveVariant((found as ProductVariant) || null);
  }, [product, selections]);


  // --- Selection Handlers ---
  const handleSelection = (group: string, value: string) => {
    setSelections(prev => ({ ...prev, [group]: value }));
  };

  // --- Calculated Display Values ---
  const isSimpleProduct = !product?.variants || product.variants.length === 0;

  // Pricing
  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const originalPrice = product?.originalPrice ?? 0;
  const discount = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock
  // BUG FIX 1: If Simple Product -> Use Product Stock
  // If Variant Product -> Use Active Variant Stock
  const effectiveStock = isSimpleProduct
    ? (product?.countInStock ?? product?.stock ?? 0)
    : (activeVariant?.stock ?? 0);

  const isOutOfStock = effectiveStock <= 0;
  const canAddToCart = !isOutOfStock && (isSimpleProduct || !!activeVariant);

  // Gallery Source
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const baseImages = (product.images || []).map(getProductImageUrl);

    // Prepend variant image if specific
    if (activeVariant?.image) {
      const vImg = getProductImageUrl(activeVariant.image);
      if (!baseImages.includes(vImg)) return [vImg, ...baseImages];
    }
    // Fallback
    if (baseImages.length === 0 && product.image) return [getProductImageUrl(product.image)];

    return baseImages;
  }, [product, activeVariant]);


  if (isLoading) return <CircularGlassSpinner />;
  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
      <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4"><AlertCircle size={40} /></div>
      <h2 className="text-2xl font-bold">Product Not Found</h2>
      <button onClick={() => router.push('/shop')} className="mt-4 text-blue-600 font-bold hover:underline">Return to Shop</button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">

        {/* Main Grid: Gallery + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Gallery Column */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <ProductGallery product={product} images={galleryImages} />
          </div>

          {/* Details Column */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{product.category}</p>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating || 4.5) ? "currentColor" : "none"} className={i < Math.floor(product.rating || 4.5) ? "" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">{product.rating?.toFixed(1) || '4.5'}</span>
              <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
            </div>

            {/* Price Block */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
              {originalPrice > currentPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>

            <div className="h-px bg-gray-100 my-6"></div>

            {/* BUG FIX 2: Dynamic Variant Rendering */}
            {!isSimpleProduct && variantGroups.length > 0 ? (
              <div className="space-y-6">
                {variantGroups.map((group) => (
                  <div key={group.name}>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      {group.name === 'Color' ? <Palette size={16} className="text-blue-500" /> :
                        group.name === 'Size' ? <Ruler size={16} className="text-red-500" /> :
                          <Layers size={16} className="text-purple-500" />}
                      {group.name}: <span className="text-blue-600 ml-1">{selections[group.name]}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt: any) => {
                        const val = typeof opt === 'string' ? opt : opt.name;
                        const isSelected = selections[group.name] === val;

                        // Render Color Swatches if applicable
                        if (group.name === 'Color') {
                          const colorHex = opt.color || opt.hex || '#ddd';
                          return (
                            <button
                              key={val}
                              onClick={() => handleSelection(group.name, val)}
                              className={`w-9 h-9 rounded-full border-2 transition-all shadow-sm ${isSelected ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2 scale-110' : 'border-gray-200 hover:scale-105'}`}
                              style={{ backgroundColor: colorHex }}
                              title={val}
                            />
                          );
                        }

                        // Render Standard Chips
                        return (
                          <button
                            key={val}
                            onClick={() => handleSelection(group.name, val)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Stock Actions */}
            <div className="mt-8 flex gap-4">
              <div className="flex-1">
                {isOutOfStock ? (
                  <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <AlertCircle size={20} /> OUT OF STOCK
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // AUTH GUARD
                      if (!requireAuth(router)) return;

                      // BUG FIX 3: Strict Cart construction
                      const cartItem: CartItem = {
                        id: product.id,
                        productId: product.id,
                        variantId: activeVariant?.id,
                        productName: product.name,
                        name: product.name,
                        price: currentPrice,
                        image: activeVariant?.image || product.image || '',
                        color: selections['Color'],
                        size: selections['Size'],
                        selectedVariants: selections,
                        stock: effectiveStock,
                        countInStock: effectiveStock,
                        quantity: 1,
                        originalPrice: originalPrice,
                        category: product.category,
                        rating: product.rating || 0,
                        reviewsCount: product.reviewsCount || 0,
                        description: product.description || '',
                        images: galleryImages,
                      };
                      // @ts-ignore
                      addToCart(cartItem, 1);
                      fbAddToCart({
                        content_name: product.name,
                        content_ids: [product.id],
                        value: currentPrice,
                        currency: 'INR',
                      });
                      addToast('success', 'Added to Cart');
                    }}
                    disabled={!canAddToCart}
                    className="w-full py-4 bg-[#ff9f00] hover:bg-[#ff9000] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> ADD TO CART
                  </button>
                )}
              </div>
              {!isOutOfStock && (
                <button
                  onClick={() => {
                    // AUTH GUARD
                    if (!requireAuth(router)) return;

                    const cartItem: CartItem = {
                      id: product.id,
                      productId: product.id,
                      variantId: activeVariant?.id,
                      productName: product.name,
                      name: product.name,
                      price: currentPrice,
                      image: activeVariant?.image || product.image || '',
                      color: selections['Color'],
                      size: selections['Size'],
                      selectedVariants: selections,
                      stock: effectiveStock,
                      countInStock: effectiveStock,
                      quantity: 1,
                      originalPrice: originalPrice,
                      category: product.category,
                      rating: product.rating || 0,
                      reviewsCount: product.reviewsCount || 0,
                      description: product.description || '',
                      images: galleryImages,
                    };
                    // @ts-ignore
                    addToCart(cartItem, 1);
                    fbAddToCart({
                      content_name: product.name,
                      content_ids: [product.id],
                      value: currentPrice,
                      currency: 'INR',
                    });
                    initiateCheckout({
                      content_ids: [product.id],
                      num_items: 1,
                      value: currentPrice,
                      currency: 'INR'
                    });
                    router.push('/checkout');
                  }}
                  className="flex-1 py-4 bg-[#fb641b] hover:bg-[#f65a10] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]">
                  BUY NOW
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <RotateCcw size={20} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">7 Day Returns</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-xs font-semibold text-gray-700">Quality Assured</span>
              </div>
            </div>

          </div>
        </div>

        {/* Info Tabs */}
        <div className="mt-6 mb-10 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6 min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {product.description?.replace(/<!-- METADATA:.*?-->/g, '').trim()}
              </div>
            )}
            {/* BUG FIX 4: Robust Specs Rendering */}
            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {product.specifications ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-sm leading-relaxed whitespace-pre-line text-gray-700">
                    {product.specifications}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 italic">
                    No specifications detailed.
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <ReviewList reviews={reviews} />
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <ReviewForm productId={id || ''} onReviewSubmitted={(r) => setReviews(prev => [r, ...prev])} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {product && <RelatedProductsSection category={product.category} productId={product.id} />}

      </div>
    </div>
  );
};

// Sub-component to utilize the hook cleanly without re-rendering parent too much
const RelatedProductsSection: React.FC<{ category: string; productId: string }> = ({ category, productId }) => {
  const { products: relatedProducts, loading: relatedLoading } = useRelatedProducts(category, productId);

  // Don't show if failed or empty (after loading)
  if (!relatedLoading && relatedProducts.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-6 mb-10">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Similar Products
      </h2>

      {relatedLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-[320px] border border-gray-100 animate-pulse p-4">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
};