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
      socket.on('productUpdated', (updatedProduct: Product) => {
        if (updatedProduct.id === id) {
          setProduct(updatedProduct);
          // If the currently active image is no longer in the updated product's gallery, reset to main image
          const newGallery = updatedProduct.images || [];
          if (activeImage !== updatedProduct.image && !newGallery.includes(activeImage)) {
            setActiveImage(updatedProduct.image);
          }
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

  // STRICT 5s POLLING SYNC (Backup for Socket)
  useEffect(() => {
    if (!id) return;
    const intervalId = setInterval(async () => {
      try {
        const productResponse = await fetchProductById(id);
        const updatedProduct = productResponse.data?.data?.product || productResponse.data;

        if (updatedProduct) {
          setProduct((prev) => {
            // Only update if critical data changed to avoid unnecessary renders
            if (JSON.stringify(prev) !== JSON.stringify(updatedProduct)) {
              return updatedProduct;
            }
            return prev;
          });

          // Sync Active Image if needed (e.g. main image changed)
          if (activeImage !== updatedProduct.image && (!updatedProduct.images || !updatedProduct.images.includes(activeImage))) {
            setActiveImage(updatedProduct.image);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, activeImage]);

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

  // Helper to map color names to Tailwind classes
  const getColorClass = (colorName: string) => {
    const map: Record<string, string> = {
      'Blue': 'bg-blue-500',
      'Red': 'bg-red-500',
      'Green': 'bg-green-500',
      'Black': 'bg-gray-900',
      'White': 'bg-white',
      'Gray': 'bg-gray-500',
      'Yellow': 'bg-yellow-400',
      'Orange': 'bg-orange-500',
      'Purple': 'bg-purple-500',
      'Pink': 'bg-pink-500',
    };
    return map[colorName] || 'bg-gray-200';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* SECTION 1: PRODUCT IMAGE & BASIC INFO */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Image Gallery */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-4 min-h-[400px] flex items-center justify-center">
              <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                <Check size={18} className="text-gray-600" />
              </button>
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                <Search size={18} className="text-gray-600" />
              </button>
              <LazyImage
                src={activeImage}
                alt={product.name}
                className="max-w-full max-h-[350px] object-contain"
              />
            </div>

            <div className="flex gap-3">
              {allImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl border-2 ${activeImage === img ? 'border-blue-500' : 'border-gray-200'
                    } overflow-hidden cursor-pointer`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="text-gray-600 mt-1">Brand: {product.category}</p>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i <= Math.floor(product.rating || 4.4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{product.rating?.toFixed(1) || '4.4'}</span>
              <span className="text-gray-500 text-sm">
                {reviews.length.toLocaleString()} ratings · {reviews.length} reviews
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Color Selector */}
            {product.variants?.find(v => v.name.toLowerCase() === 'color') && (
              <div className="mt-6">
                <div className="flex gap-3">
                  {product.variants.find(v => v.name.toLowerCase() === 'color')?.options.map((color, idx) => {
                    const variantName = product.variants?.find(v => v.name.toLowerCase() === 'color')?.name || 'Color';
                    return (
                      <button
                        key={idx}
                        onClick={() => handleVariantSelect(variantName, color)}
                        className={`w-8 h-8 rounded-full ${getColorClass(color)} border-2 ${selectedVariants[variantName] === color ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800' : 'border-gray-300'
                          }`}
                        title={color}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.variants?.find(v => v.name.toLowerCase() === 'size') && (
              <div className="mt-6">
                <div className="flex gap-2 flex-wrap">
                  {product.variants.find(v => v.name.toLowerCase() === 'size')?.options.map((size) => {
                    const variantName = product.variants?.find(v => v.name.toLowerCase() === 'size')?.name || 'Size';
                    return (
                      <button
                        key={size}
                        onClick={() => handleVariantSelect(variantName, size)}
                        className={`px-5 py-2 rounded-lg border-2 text-sm font-medium ${selectedVariants[variantName] === size
                          ? 'border-gray-800 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons - MOVED HERE */}
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90 shadow-md'
                  }`}
              >
                <ShoppingCart size={20} />
                ADD TO CART
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isOutOfStock
                  ? 'hidden'
                  : 'bg-primary text-white hover:opacity-90 shadow-md'
                  }`}
              >
                BUY NOW
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BANK OFFERS & POLICIES */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bank Offers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Bank Offers</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">5% Unlimited Cashback</p>
                  <p className="text-sm text-gray-600">on Flipzokart Axis Bank Credit Card</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">10% Instant Discount</p>
                  <p className="text-sm text-gray-600">on HDFC Bank Credit Card</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pay Later & Get 10% Cashback</p>
                  <p className="text-sm text-gray-600">on Flipzokart Pay Later</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policies & Trust Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <RotateCcw size={20} className="text-blue-600" />
              <span className="font-medium">7 Days Return Policy</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Check size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Seller</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">UPI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Truck size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Pay Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TABS - DETAILS / SPECS / REVIEWS */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-4 font-medium text-sm ${activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-6 py-4 font-medium text-sm ${activeTab === 'specifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-medium text-sm ${activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Customer Reviews
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <h3 className="font-bold text-lg mb-3">Full Description</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i <= Math.floor(product.rating || 4.4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{product.rating?.toFixed(1) || '4.4'}</span>
                    </div>
                    <span className="text-gray-600">{reviews.length.toLocaleString() || '8,562'}</span>
                  </div>
                  <div className="space-y-2">
                    {ratingCounts.map((count, idx) => {
                      const stars = 5 - idx;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-4">{stars}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${(count / totalRatings) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-4">
                    <Lock size={14} />
                    <span>Surniri© 24/7</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="text-gray-700">
                <p className="mb-4">
                  {product.description || "Very good quality product with comfortable sole and durable build. Perfect for casual daily wear."}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-blue-600" />
                  <span>Seller</span>
                  <span className="text-gray-400">|</span>
                  <span>UPI</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Customer Reviews</h3>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Latest</option>
                    <option>All Star 9</option>
                  </select>
                </div>

                {isReviewsLoading ? (
                  <CircularGlassSpinner />
                ) : (
                  <div className="space-y-4 mb-6">
                    <ReviewList reviews={reviews} />
                  </div>
                )}

                {id && (
                  <ReviewForm productId={id} onReviewSubmitted={handleReviewUpdate} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};