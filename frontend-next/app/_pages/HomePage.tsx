"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';
import { GrocerySection } from '@/app/components/GrocerySection';
import LazyImage from '@/app/components/LazyImage';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { HeroSlider } from '@/app/components/HeroSlider';
import { RecentlyViewed } from '@/app/components/RecentlyViewed';
import { SuggestedForYou } from '@/app/components/SuggestedForYou';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// Fallback data
const initialCategories = [
    { name: 'Groceries', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-groceries-e6814d7f00ef4f7d92268edd5246a637.png', href: '/groceries' },
    { name: 'Mobiles', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-mobiles-4f832660f1f64e30b256a396f486ad70.png', href: '/mobiles' },
    { name: 'Electronics', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-electronics-2416c835515347fdabf6e9053feec09e.png', href: '/electronics' },
    { name: 'Fashion', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-fashion-ceae805ee2f24728922582c24545ceba.png', href: '/fashion' },
    { name: 'Beauty', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&q=60', href: '/beauty' },
    { name: 'Home', imageUrl: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=100&h=100&fit=crop&q=60', href: '/home' },
    { name: 'Appliances', imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=100&h=100&fit=crop&q=60', href: '/appliances' },
    { name: 'Agriculture', imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&h=100&fit=crop&q=60', href: '/agriculture' },
    { name: 'Offers', imageUrl: 'https://rukminim1.flixcart.com/fk-p-flap/80/80/image/0139228b2f7eb413.jpg?q=100', href: '/offers' },
];

export const HomePage: React.FC = () => {
    const { products } = useApp(); // Fallback to Context if API fails
    const [banners, setBanners] = useState<any[]>([]);
    const [displayCategories, setDisplayCategories] = useState(initialCategories);
    const [randomProducts, setRandomProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Global Trending (Top Deals)
    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [showAllTrending, setShowAllTrending] = useState(false);

    // 🗂️ Admin Section Headers
    const [homeSections, setHomeSections] = useState<{ _id: string; title: string; order: number }[]>([]);

    // Normalize MongoDB _id to id for ProductCard compatibility
    const normalizeProduct = (p: any) => ({
        ...p,
        id: p.id || p._id?.toString() || '',
    });

    useEffect(() => {
        fetchContent();
        fetchRandomProducts();
        fetchGlobalTrending();
        fetchHomeSections();

        // Real-time Sync
        const socket = (window as any).socket;
        if (socket) {
            const handleUpdate = (data: { type: string }) => {
                if (data.type === 'banners' || data.type === 'home-categories') {
                    fetchContent();
                }
            };
            socket.on('content:update', handleUpdate);
            return () => socket.off('content:update', handleUpdate);
        }
    }, []);

    const fetchRandomProducts = async () => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/products/random?limit=30`, {
                headers: { 'Cache-Control': 'no-store' }
            });
            setRandomProducts((res.data || []).map(normalizeProduct));
        } catch (error) {
            console.warn('Random API not available yet, using Context fallback:', error);
            // FALLBACK: Use Context products if random API fails
            setRandomProducts(products.filter(p => p.category !== 'Groceries').map(normalizeProduct));
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalTrending = async () => {
        try {
            setTrendingLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/products/trending/global?days=7&limit=24`, {
                headers: { 'Cache-Control': 'no-store' }
            });
            setTrendingProducts((res.data || []).map(normalizeProduct));
        } catch (error) {
            console.warn('[TopDeals] Global trending API failed, using random fallback:', error);
            // Fallback: use first 24 random products sorted by nothing
            setTrendingProducts([]);
        } finally {
            setTrendingLoading(false);
        }
    };

    const fetchHomeSections = async () => {
        try {
            const res = await axios.get('/api/sections');
            setHomeSections(res.data || []);
        } catch (error) {
            // sections are optional — fail silently
        }
    };

    const fetchContent = () => {
        // Fetch Banners
        axios.get('/api/content/banners').then(res => {
            if (res.data && res.data.length > 0) {
                setBanners(res.data);
            }
        }).catch(err => console.error(err));

        // Fetch Categories
        axios.get('/api/content/home-categories').then(res => {
            if (res.data && res.data.length > 0) {
                const mapped = res.data.map((c: any) => ({
                    name: c.categoryName,
                    imageUrl: c.iconUrl,
                    href: (() => {
                        // Slug mapping always wins over DB redirectUrl for known categories
                        const name = c.categoryName.toLowerCase();
                        if (name === 'fashion') return '/fashion';
                        if (name === 'beauty') return '/beauty';
                        if (name === 'agriculture') return '/agriculture';
                        if (name === 'groceries') return '/groceries';
                        if (name === 'mobiles') return '/mobiles';
                        if (name === 'electronics') return '/electronics';
                        if (name === 'home') return '/home';
                        if (name === 'appliances') return '/appliances';
                        if (name === 'offers') return '/offers';
                        // Unknown category: use DB redirectUrl or shop fallback
                        return c.redirectUrl || `/shop?category=${encodeURIComponent(c.categoryName)}`;
                    })()
                }));
                setDisplayCategories(mapped);
            }
        }).catch(err => console.error(err));
    };


    // Use random products (fallback to context if API failed)
    const displayProducts = randomProducts.length > 0 ? randomProducts : products.filter(p => p.category !== 'Groceries');
    const topDeals = displayProducts.slice(0, 8);
    const featuredProducts = displayProducts.filter(p => p.isFeatured).slice(0, 8);

    // --- Dynamic Section Logic ---
    const getProductMetadata = (product: any) => {
        if (!product.description || typeof product.description !== 'string' || !product.description.includes('<!-- METADATA:')) return null;
        try {
            const parts = product.description.split('<!-- METADATA:');
            const jsonStr = parts[1].split('-->')[0];
            return JSON.parse(jsonStr);
        } catch (e) {
            return null;
        }
    };

    const customSections = React.useMemo(() => {
        const sections: Record<string, { title: string, color: string, size: string, products: any[] }> = {};

        displayProducts.forEach(p => {
            const meta = getProductMetadata(p);
            if (meta?.section?.title) {
                const title = meta.section.title;
                if (!sections[title]) {
                    sections[title] = {
                        title,
                        color: meta.section.color || '#111827',
                        size: meta.section.size || 'text-xl',
                        products: []
                    };
                }
                sections[title].products.push(p);
            }
        });
        return Object.values(sections);
    }, [displayProducts]);

    const toggleFaq = (button: HTMLElement) => {
        const content = button.nextElementSibling as HTMLElement;
        const icon = button.querySelector('svg');
        if (content && icon) {
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        }
    };

    return (
        <>
            <HeroSlider banners={banners} />

            <section className="homepage-shop-category py-3 md:py-8 px-3 md:px-8">
                <SmoothReveal direction="up" delay={200}>
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-sm md:text-2xl font-semibold md:font-bold mb-3 md:mb-8 text-center text-gray-800 uppercase tracking-wide">Shop by Categories</h2>
                        {/* Mobile: 6-col grid | Desktop: flex justify-between */}
                        <div className="hidden md:flex flex-nowrap pb-2 gap-3 px-2 md:justify-between md:gap-4 no-scrollbar">
                            {displayCategories.map(category => (
                                <Link href={category.href} key={category.name} className="flex flex-col items-center md:w-[90px] text-center group">
                                    <div className="w-14 h-14 md:w-20 md:h-20 mb-2 bg-gray-100 rounded-full md:rounded-xl p-3 border border-gray-200 group-hover:shadow-md transition-shadow flex items-center justify-center">
                                        <LazyImage
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-contain"
                                            priority={true}
                                            sizes="80px"
                                        />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">{category.name}</span>
                                </Link>
                            ))}
                        </div>
                        {/* Mobile — single swipable row, no wrapping */}
                        <div className="flex flex-nowrap overflow-x-auto gap-2 no-scrollbar snap-x md:hidden">
                            {displayCategories.map(category => (
                                <Link href={category.href} key={category.name} className="flex flex-col items-center flex-shrink-0 snap-center w-[60px] text-center group">
                                    <div className="w-11 h-11 mb-1 bg-gray-100 rounded-full p-1.5 border border-gray-200 flex items-center justify-center">
                                        <LazyImage
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-contain"
                                            priority={true}
                                            sizes="44px"
                                        />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-700 leading-tight line-clamp-2">{category.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </SmoothReveal>
            </section>

            {/* Recently Viewed Products */}
            <section className="py-2 md:py-2 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <RecentlyViewed />
                </div>
            </section>

            {/* Suggested For You */}
            <section className="py-2 md:py-2 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <SuggestedForYou />
                </div>
            </section>

            {/* Dynamic Custom Sections from Admin */}
            {customSections.map((section, idx) => (
                <section key={section.title} className={`py-4 md:py-8 px-4 md:px-8 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <SmoothReveal direction="up" delay={300}>
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-4 md:mb-6 border-l-4 border-[#F28C28] pl-4">
                                <h2 className={`${section.size || 'text-2xl'} font-bold`} style={{ color: section.color }}>{section.title}</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 auto-rows-fr">
                                {section.products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    </SmoothReveal>
                </section>
            ))}

            {/* 🔥 TOP DEALS — Global Trending (All Categories) */}
            <section className="py-4 md:py-8 px-4 md:px-8 bg-gray-50">
                <SmoothReveal direction="up" delay={400}>
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Top Deals</h2>
                                <p className="text-xs md:text-sm text-gray-400 mt-0.5">Based on real orders · Last 7 days</p>
                            </div>
                            {!trendingLoading && trendingProducts.length > 4 && (
                                <button
                                    onClick={() => setShowAllTrending(prev => !prev)}
                                    className="flex items-center gap-1.5 bg-[#2874F0] text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    {showAllTrending ? 'Show Less ↑' : `View All (${trendingProducts.length}) →`}
                                </button>
                            )}
                        </div>

                        {/* Skeleton — matches Featured on Fzokart exactly */}
                        {trendingLoading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        )}

                        {/* Products Grid — 100% matches Featured on Fzokart layout */}
                        {!trendingLoading && (() => {
                            const source = trendingProducts.length > 0
                                ? trendingProducts
                                : displayProducts.slice(0, 24);
                            const visible = showAllTrending ? source : source.slice(0, 4);
                            return (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 auto-rows-fr">
                                        {visible.map((product, idx) => (
                                            <ProductCard key={product.id} product={product} priority={idx < 4} />
                                        ))}
                                    </div>
                                    {/* View All pill (shown on all sizes when collapsed) */}
                                    {source.length > 4 && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => setShowAllTrending(prev => !prev)}
                                                className="bg-[#2874F0] text-white text-sm font-bold px-8 py-2.5 rounded-full shadow md:hidden"
                                            >
                                                {showAllTrending ? 'Show Less' : `View All ${source.length} Deals`}
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </SmoothReveal>
            </section>

            {/* 🗂️ Admin-Defined Section Headers — always bottom-appended */}
            {homeSections.length > 0 && homeSections
                .sort((a, b) => a.order - b.order)
                .map((section, idx) => {
                    // Match products that belong to this section title (existing meta.section logic)
                    const sectionProducts = customSections.find(s => s.title === section.title);
                    return (
                        <section key={section._id} className={`py-4 md:py-8 px-4 md:px-8 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <SmoothReveal direction="up" delay={300}>
                                <div className="max-w-7xl mx-auto">
                                    <div className="mb-4 md:mb-6 border-l-4 border-[#F28C28] pl-4">
                                        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                    </div>
                                    {sectionProducts && sectionProducts.products.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 auto-rows-fr">
                                            {sectionProducts.products.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </SmoothReveal>
                        </section>
                    );
                })
            }



            <section className="py-8 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">
                            <span className="text-gray-600">Featured on </span>
                            <span className="text-[#222]">F</span><span className="text-[#f28c28]">zokart</span>
                        </h2>
                        <div className="w-20 h-1 bg-[#f28c28] rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 auto-rows-fr">
                        {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            </section>

            <GrocerySection />

            {/* ✅ Real Customer Reviews — fetched from API */}
            <RealReviewsSection />


            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Frequently Asked <span className="text-[#f28c28]">Questions</span></h2>
                        <p className="text-gray-600">Get answers to common questions about shopping with us</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={(e) => toggleFaq(e.currentTarget)}>
                                <span className="font-semibold text-gray-900">What are the delivery charges and time?</span>
                                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed hidden">We offer free delivery on orders above ₹500. For orders below ₹500, delivery charges are ₹50. Standard delivery takes 5-7 business days.</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={(e) => toggleFaq(e.currentTarget)}>
                                <span className="font-semibold text-gray-900">What is your return and exchange policy?</span>
                                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed hidden">We offer a 7-day return policy for most products. Items must be in original condition with tags attached.</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={(e) => toggleFaq(e.currentTarget)}>
                                <span className="font-semibold text-gray-900">What payment methods do you accept?</span>
                                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed hidden">We accept all major payment methods including Credit/Debit cards, Net Banking, UPI, Wallets, and Cash on Delivery.</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop Smarter with <span className="text-[#222]">Fzo</span><span className="text-[#f28c28]">kart</span></h2>
                                <p className="text-gray-600 text-lg mb-6">Download our mobile app and get exclusive deals, faster checkout, and personalized recommendations.</p>
                                <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex">
                                    <button className="w-full md:w-auto bg-[#f28c28] hover:bg-opacity-90 text-white font-semibold px-8 py-3 rounded-lg transition-colors">Download App</button>
                                    <Link href="/shop" className="w-full md:w-auto block text-center border-2 border-[#f28c28] text-[#f28c28] hover:bg-orange-50 font-semibold px-8 py-3 rounded-lg transition-colors">Start Shopping</Link>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <LazyImage src="https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/cta/cta-app-4c321c4156404b36a12972cb0c2720f6.png" alt="Mobile App" width="450" height="300" className="w-full max-w-md rounded-2xl object-cover shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

// ── Real Customer Reviews Section ────────────────────────────────────────────
// Ensure Swiper is imported at the top of the file:
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
// import 'swiper/css';

const RealReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        axios.get(`${API_URL}/api/reviews/latest?limit=8`) // Fetch a few more for better carousel
            .then(res => {
                const data = Array.isArray(res.data) ? res.data
                    : Array.isArray(res.data?.reviews) ? res.data.reviews : [];
                setReviews(data);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && reviews.length === 0) return null;

    return (
        <section className="py-12 px-0 md:px-4 bg-gray-50 overflow-hidden">
            <SmoothReveal direction="up" delay={500}>
                <div className="max-w-7xl mx-auto mb-10 px-4 md:px-0">
                    {/* Section Header */}
                    <div className="text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
                                Rated <span className="text-[#f28c28]">Excellent</span>
                            </h2>
                            <p className="text-gray-500 text-sm">Real reviews from our verified buyers</p>
                        </div>
                    </div>
                </div>

                {/* Skeleton */}
                {loading && (
                    <div className="max-w-7xl mx-auto flex gap-4 px-4 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="review-card-pro h-48 animate-pulse bg-gray-200" />
                        ))}
                    </div>
                )}

                {/* Review Cards Auto Carousel */}
                {!loading && (
                    <div className="reviews-carousel-wrapper" style={{ paddingLeft: 'theme(space.4)', paddingRight: 'theme(space.4)' }}>
                        <Swiper
                            modules={[Autoplay]}
                            spaceBetween={16}
                            slidesPerView={1.2} // Mobile view
                            breakpoints={{
                                640: { slidesPerView: 2.2 },
                                1024: { slidesPerView: 3, spaceBetween: 24 }
                            }}
                            loop={reviews.length >= 3} // Only loop if enough slides
                            autoplay={{
                                delay: 0,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true
                            }}
                            speed={4000}
                            cssMode={false} // Required for smooth linear transition
                            grabCursor={true}
                            allowTouchMove={true}
                            className="w-full !pb-8"
                            style={{ transitionTimingFunction: 'linear' }} // Force linear slide
                        >
                            {reviews.map((rev, idx) => {
                                const name: string = rev.user?.name || rev.userName || 'Customer';
                                const rating: number = rev.rating || 5;
                                const comment: string = rev.comment || rev.text || rev.review || '';
                                const product: string = rev.product?.name || rev.productName || '';
                                const initial: string = name.charAt(0).toUpperCase();

                                const productId: string = rev.product?._id || rev.product?.id || rev.productId || '';

                                const cardContent = (
                                    <div className={`review-card-pro h-full w-full relative transition-transform ${productId ? 'hover:-translate-y-1 cursor-pointer' : ''}`}>
                                        {/* User Info Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gray-900 shrink-0 shadow-md">
                                                {initial}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-gray-900 text-sm truncate pr-2">{name}</p>
                                                    <span className="shrink-0 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-wide">
                                                        ✓ Verified
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review text with subtle quotes */}
                                        <div className="relative flex-1">
                                            <span className="absolute -top-2 -left-2 text-4xl text-gray-100 font-serif leading-none select-none z-0" aria-hidden>&ldquo;</span>
                                            <p className="text-gray-700 text-sm leading-relaxed relative z-10 line-clamp-4">
                                                {comment}
                                            </p>
                                        </div>

                                        {/* Product Tag */}
                                        {product && (
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <p className="text-xs text-[#f28c28] truncate font-semibold flex items-center gap-1">
                                                    {productId ? <span className="text-gray-400">🔗</span> : ''} {product}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );

                                return (
                                    <SwiperSlide key={rev._id || rev.id || idx} className="h-auto">
                                        {productId ? (
                                            <Link href={`/product/${productId}`} className="block h-full">
                                                {cardContent}
                                            </Link>
                                        ) : (
                                            <div className="h-full">{cardContent}</div>
                                        )}
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                )}
            </SmoothReveal>

            {/* Inject a tiny bit of CSS specific to linear sliding */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .swiper-wrapper {
                    -webkit-transition-timing-function: linear !important; 
                    transition-timing-function: linear !important; 
                }
            `}} />
        </section>
    );
};