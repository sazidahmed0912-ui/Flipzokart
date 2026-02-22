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

// Fallback data
const initialCategories = [
    { name: 'Groceries', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-groceries-e6814d7f00ef4f7d92268edd5246a637.png', href: '/shop?category=Groceries', redirectUrl: '/shop?category=Groceries' },
    { name: 'Mobiles', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-mobiles-4f832660f1f64e30b256a396f486ad70.png', href: '/shop?category=Mobiles', redirectUrl: '/shop?category=Mobiles' },
    { name: 'Electronics', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-electronics-2416c835515347fdabf6e9053feec09e.png', href: '/shop?category=Electronics', redirectUrl: '/shop?category=Electronics' },
    { name: 'Fashion', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-fashion-ceae805ee2f24728922582c24545ceba.png', href: '/fashion', redirectUrl: '/fashion' },
    { name: 'Beauty', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&q=60', href: '/shop?category=Beauty', redirectUrl: '/shop?category=Beauty' },
    { name: 'Home', imageUrl: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=100&h=100&fit=crop&q=60', href: '/shop?category=Home', redirectUrl: '/shop?category=Home' },
    { name: 'Appliances', imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=100&h=100&fit=crop&q=60', href: '/shop?category=Appliances', redirectUrl: '/shop?category=Appliances' },
    { name: 'Offers', imageUrl: 'https://rukminim1.flixcart.com/fk-p-flap/80/80/image/0139228b2f7eb413.jpg?q=100', href: '/shop?tag=offer', redirectUrl: '/shop?tag=offer' },
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
                    href: c.redirectUrl || (c.categoryName.toLowerCase() === 'fashion' ? '/fashion' : `/shop?category=${encodeURIComponent(c.categoryName)}`)
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

            <section className="py-4 md:py-8 px-4 md:px-8">
                <SmoothReveal direction="up" delay={200}>
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center"><span className="text-gray-800">Shop by Categories</span></h2>
                        <div className="flex overflow-x-auto pb-2 gap-3 px-2 md:grid md:grid-cols-8 md:gap-6 no-scrollbar snap-x">                        {displayCategories.map(category => (
                            <Link href={category.href} key={category.name} className="flex flex-col items-center flex-shrink-0 snap-center w-[72px] md:w-auto text-center group">
                                <div className="w-14 h-14 md:w-20 md:h-20 mb-2 bg-gray-100 rounded-full md:rounded-xl p-3 border border-gray-200 group-hover:shadow-md transition-shadow flex items-center justify-center">
                                    <LazyImage
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-contain"
                                        priority={true}
                                        sizes="(max-width: 768px) 56px, 80px"
                                    />
                                </div>
                                <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">{category.name}</span>
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
                            {!trendingLoading && trendingProducts.length > 2 && (
                                <button
                                    onClick={() => setShowAllTrending(prev => !prev)}
                                    className="flex items-center gap-1.5 bg-[#2874F0] text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    {showAllTrending ? 'Show Less ↑' : `View All (${trendingProducts.length}) →`}
                                </button>
                            )}
                        </div>

                        {/* Skeleton */}
                        {trendingLoading && (
                            <div className="grid grid-cols-2 gap-2 md:gap-6">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!trendingLoading && (() => {
                            // Decide what to show
                            const source = trendingProducts.length > 0
                                ? trendingProducts
                                : displayProducts.slice(0, 24);
                            // Initially 2 products (1 row of 2), just like Featured on Fzokart
                            const visible = showAllTrending ? source : source.slice(0, 2);
                            return (
                                <>
                                    <div
                                        className="grid grid-cols-2 gap-2 md:gap-6 auto-rows-fr"
                                        style={{ transition: 'all 0.3s ease' }}
                                    >
                                        {visible.map((product, idx) => (
                                            <ProductCard key={product.id} product={product} priority={idx < 2} />
                                        ))}
                                    </div>
                                    {/* View All pill — shown when more than 2 products available */}
                                    {source.length > 2 && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => setShowAllTrending(prev => !prev)}
                                                className="bg-[#2874F0] text-white text-sm font-bold px-8 py-2.5 rounded-full shadow"
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

            <section className="py-12 px-4 bg-white">
                <SmoothReveal direction="up" delay={600}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Customer <span className="text-[#f28c28]">Reviews</span></h2>
                            <p className="text-gray-600">What our customers say about their shopping experience</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <LazyImage src="https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/testimonials/testimonial-1-c51c4110425c47b8af3644baedb35302.png" alt="Priya Sharma" width="60" height="60" className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                                        <div className="flex text-orange-400 text-sm"><span>★★★★★</span></div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">"Amazing shopping experience! Fast delivery and great quality products. The customer service is excellent and I love the easy return policy. Highly recommended!"</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <LazyImage src="https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/testimonials/testimonial-2-029873a672194e738bbe51deab6c4bd6.png" alt="Rajesh Kumar" width="60" height="60" className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                                        <div className="flex text-orange-400 text-sm"><span>★★★★★</span></div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">"Best prices and authentic products. I've been shopping here for 2 years and never had any issues. The mobile app is very user-friendly and secure payment options."</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <LazyImage src="https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/testimonials/testimonial-3-241a93ae9ab54cedb61c73fbc99de863.png" alt="Anita Patel" width="60" height="60" className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Anita Patel</h4>
                                        <div className="flex text-orange-400 text-sm"><span>★★★★★</span></div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">"This platform has everything I need! From electronics to fashion, all at great prices. The delivery is always on time and packaging is excellent. Love shopping here!"</p>
                            </div>
                        </div>
                    </div>
                </SmoothReveal>
            </section>

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
                            <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed hidden">We offer free delivery on orders above ₹500. For orders below ₹500, delivery charges are ₹40. Standard delivery takes 2-5 business days.</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={(e) => toggleFaq(e.currentTarget)}>
                                <span className="font-semibold text-gray-900">What is your return and exchange policy?</span>
                                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed hidden">We offer a 30-day return policy for most products. Items must be in original condition with tags attached.</div>
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