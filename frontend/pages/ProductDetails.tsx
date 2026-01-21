
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Share2, Check, AlertTriangle, Info, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../store/Context';
import { ProductCard } from '../components/ProductCard';
import API, { fetchProductById } from '../services/api';
import { Product, Review } from '../types'; // Import Review type
import { ReviewList } from './ProductDetails/components/ReviewList'; // Corrected Import ReviewList
import { ReviewForm } from './ProductDetails/components/ReviewForm'; // Corrected Import ReviewForm
import { useSocket } from '../hooks/useSocket'; // Import useSocket
import LazyImage from '../components/LazyImage';
import { SmoothReveal } from '../components/SmoothReveal';
import CircularGlassSpinner from '../components/CircularGlassSpinner';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products: allProducts, addToCart, toggleWishlist, wishlist, user } = useApp(); // Add user from context
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]); // New state for reviews
  const [isReviewsLoading, setIsReviewsLoading] = useState(false); // New state for reviews loading
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string>('');

  const token = localStorage.getItem("token"); // Get token for socket
  const socket = useSocket(token); // Pass token explicitly

  // Function to add or update review in state (for real-time updates)
  const handleReviewUpdate = (newReview: Review) => {
    setReviews((prevReviews) => {
      const existingIndex = prevReviews.findIndex((r) => r._id === newReview._id);
      if (existingIndex > -1) {
        // Update existing review
        const updatedReviews = [...prevReviews];
        updatedReviews[existingIndex] = newReview;
        return updatedReviews;
      } else {
        // Add new review
        return [newReview, ...prevReviews];
      }
    });
  };

  useEffect(() => {
    if (!id) return;

    // Listen for real-time review updates
    if (socket) {
      socket.on('newReview', (newReview: Review) => {
        if (newReview.product._id === id) { // Check if the review is for the current product
          handleReviewUpdate(newReview);
        }
      });

      socket.on('updatedReview', (updatedReview: Review) => {
        if (updatedReview.product._id === id) { // Check if the review is for the current product
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
  }, [id, socket, handleReviewUpdate]); // Add handleReviewUpdate to dependency array

  useEffect(() => {
    if (!id) return;
    const getProductAndReviews = async () => {
      setIsLoading(true);
      setIsReviewsLoading(true);
      try {
        const productResponse = await fetchProductById(id);
        // Backend returns { status: 'success', data: { product } }
        const productData = productResponse.data?.data?.product || productResponse.data;
        setProduct(productData);
        setActiveImage(productData.image);

        // Use reviews from product data if available
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

  // Combine hero image and gallery for the display
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

  // Memoized current stock calculation
  const { currentStock, isOutOfStock } = useMemo(() => {
    if (!product) return { currentStock: 0, isOutOfStock: true };

    // This logic now correctly uses the fetched product's countInStock
    if (!product.variants || product.variants.length === 0) {
      return { currentStock: product.countInStock, isOutOfStock: product.countInStock <= 0 };
    }

    // This part is for variant-specific inventory, which seems to be a future feature.
    // We will assume `countInStock` on the main product is the source of truth for now.
    // For a real variant system, `product.inventory` would be used here.
    return { currentStock: product.countInStock, isOutOfStock: product.countInStock <= 0 };

  }, [product, selectedVariants]);

  // Cap quantity
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
      // Check if this variant combo has a specific image
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
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <SmoothReveal direction="up" duration={600}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Gallery */}
          <div className="space-y-4 lg:space-y-6">
            <div className="aspect-square bg-white rounded-2xl lg:rounded-[3rem] overflow-hidden border border-gray-100 shadow-inner relative group lg:max-w-none">
              <LazyImage
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
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

            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square bg-white rounded-lg lg:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-0.5 lg:p-1 shadow-sm ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                >
                  <LazyImage src={img} alt={`${product.name} thumbnail`} className="w-full h-full object-cover rounded-md lg:rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Info */}
          <div className="flex flex-col">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">{product.category}</span>
                {product.isFeatured && <span className="bg-dark text-white font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">Top Seller</span>}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-dark leading-tight">{product.name}</h1>
              <div className="flex items-center gap-6 pt-3">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= Math.floor(product.rating) ? "currentColor" : "none"} />)}
                  <span className="font-bold text-dark ml-1">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400 text-sm font-medium border-l pl-6">{reviews.length} community reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-4 py-6 border-y border-gray-50 mb-8">
              <span className="text-4xl font-bold tracking-tighter text-dark">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-gray-400 line-through font-medium">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">SAVE ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Variants Configuration */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-8 mb-8">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select {variant.name}</label>
                      <span className="text-[11px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase">{selectedVariants[variant.name]}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleVariantSelect(variant.name, option)}
                          className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${selectedVariants[variant.name] === option
                            ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                            : 'border-lightGray bg-white text-gray-500 hover:border-gray-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${status.bg} ${status.color} ${status.border} font-bold text-sm transition-all duration-300`}>
                  {status.icon}
                  {status.label}
                </div>
              </div>
            )}

            {/* Purchase Controls */}
            <div className="mt-auto space-y-8 pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Quantity</p>
                  <div className="flex items-center gap-4 bg-lightGray/50 p-1.5 rounded-2xl border border-gray-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-primary transition-all disabled:opacity-30" disabled={quantity <= 1 || isOutOfStock}><Minus size={20} /></button>
                    <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-primary transition-all disabled:opacity-30" disabled={isOutOfStock || (currentStock > 0 && quantity >= currentStock)}><Plus size={20} /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest text-right">Collect</p>
                  <button onClick={() => toggleWishlist(product.id)} className={`w-14 h-14 border-2 rounded-2xl flex items-center justify-center transition-all ${isWishlisted ? 'border-primary text-primary bg-primary/5 shadow-lg' : 'border-lightGray text-gray-400 hover:border-gray-200 bg-white'}`}><Heart size={24} fill={isWishlisted ? "currentColor" : "none"} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={handleAddToCart} disabled={isOutOfStock} className={`group py-5 rounded-[1.5rem] font-bold text-lg transition-all flex items-center justify-center gap-3 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-dark text-white hover:bg-black hover:shadow-2xl hover:-translate-y-1 active:scale-95'}`}>
                  <ShoppingCart size={22} />
                  {isOutOfStock ? 'Notify Me When Available' : 'Add to Cart'}
                </button>
                <button onClick={handleAddToCart} disabled={isOutOfStock} className={`py-5 rounded-[1.5rem] font-bold text-lg transition-all ${isOutOfStock ? 'hidden' : 'bg-primary text-white hover:shadow-2xl hover:-translate-y-1 shadow-xl shadow-primary/30 active:scale-95'}`}>
                  Purchase Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-10 mt-10 border-t border-gray-100">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                <div className="p-3 bg-white text-primary rounded-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform"><Truck size={22} /></div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-dark mb-1">Express</p>
                <p className="text-[9px] text-gray-400">Next Day Delivery</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                <div className="p-3 bg-white text-primary rounded-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform"><ShieldCheck size={22} /></div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-dark mb-1">Genuine</p>
                <p className="text-[9px] text-gray-400">100% Authentic</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                <div className="p-3 bg-white text-primary rounded-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform"><RotateCcw size={22} /></div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-dark mb-1">Hassle Free</p>
                <p className="text-[9px] text-gray-400">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex gap-4 border-b border-gray-100 mb-10 overflow-x-auto scrollbar-hide">
            {['description', 'reviews', 'specifications'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-6 font-bold text-sm border-b-2 transition-all shrink-0 uppercase tracking-widest ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-dark'}`}>{tab === 'description' ? 'Product Story' : tab}</button>
            ))}
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[400px]">
            {activeTab === 'description' && (
              <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-3xl font-bold mb-8 tracking-tight text-dark">Engineered for Excellence</h3>
                <p className="text-gray-600 text-xl leading-relaxed mb-10">{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {["Optimized for high-performance professional environments", "Built with durable, premium-grade sustainable materials", "Advanced ergonomics for all-day comfortable usage", "Comprehensive 12-month manufacturer direct warranty", "Global compatibility with modern standards & ecosystems", "Priority technical support & regular updates"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-5 group">
                      <div className="w-8 h-8 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm"><Check size={18} /></div>
                      <span className="text-gray-700 font-medium text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-12">
                <div className="flex flex-col md:flex-row gap-16 items-center p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <div className="text-center shrink-0">
                    <p className="text-7xl font-bold mb-3 tracking-tighter text-dark">{product.rating.toFixed(1)}</p>
                    <div className="flex text-yellow-400 justify-center mb-3">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={24} fill="currentColor" />)}</div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Marketplace Rating</p>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <div key={stars} className="flex items-center gap-6">
                        <span className="text-xs font-bold text-gray-500 w-12">{stars} Stars</span>
                        <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${reviews.length > 0 ? (reviews.filter(r => Math.floor(r.rating) === stars).length / reviews.length) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold w-10">{reviews.length > 0 ? Math.round((reviews.filter(r => Math.floor(r.rating) === stars).length / reviews.length) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Reviews List */}
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
            {activeTab === 'specifications' && (
              <div className="animate-in slide-in-from-bottom-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
                {[{ label: "SKU ID", value: `FZK-${product.id.padStart(6, '0')}` }, { label: "Category", value: product.category }, { label: "In-Stock Total", value: `${product.countInStock} Units` }, { label: "Warranty", value: "1 Year Standard" }, { label: "Origin", value: "Proudly Manufactured in India" }, { label: "Material", value: "Eco-Friendly Recycled Components" }].map((spec, i) => (
                  <div key={i} className="flex justify-between py-5 border-b border-gray-50 group hover:border-primary/30 transition-colors">
                    <span className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">{spec.label}</span>
                    <span className="text-dark font-bold text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="pt-10 border-t border-gray-100">
            <div className="flex justify-between items-end mb-12">
              <div><h2 className="text-4xl font-bold tracking-tight">Curated For You</h2><p className="text-gray-400 text-sm mt-2">Personalized recommendations based on your unique style</p></div>
              <button onClick={() => navigate('/shop')} className="text-primary font-bold hover:translate-x-2 transition-transform flex items-center gap-2 text-sm uppercase tracking-widest">Explore All <ArrowRight size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </SmoothReveal>
    </div>
  );
};
