import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/Context';
import { ProductCard } from '../components/ProductCard';
import { GrocerySection } from '../components/GrocerySection';
import LazyImage from '../components/LazyImage';
import { SmoothReveal } from '../components/SmoothReveal';

// Same category data as before, but will be styled according to new rules.
const categories = [
    { name: 'Groceries', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-groceries-e6814d7f00ef4f7d92268edd5246a637.png', href: '/shop?category=Groceries' },
    { name: 'Mobiles', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-mobiles-4f832660f1f64e30b256a396f486ad70.png', href: '/shop?category=Mobiles' },
    { name: 'Electronics', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-electronics-2416c835515347fdabf6e9053feec09e.png', href: '/shop?category=Electronics' },
    { name: 'Fashion', imageUrl: 'https://cdn.ailandingpage.ai/landingpage_io/user-generate/f879b101-45e2-4516-a58c-9fcdd0b65870/f879b101-45e2-4516-a58c-9fcdd0b65870/categories/categories-fashion-ceae805ee2f24728922582c24545ceba.png', href: '/shop?category=Fashion' },
    { name: 'Beauty', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&q=60', href: '/shop?category=Beauty' },
    { name: 'Home', imageUrl: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=100&h=100&fit=crop&q=60', href: '/shop?category=Home' },
    { name: 'Appliances', imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=100&h=100&fit=crop&q=60', href: '/shop?category=Appliances' },
    { name: 'Offers', imageUrl: 'https://images.unsplash.com/photo-1570829053985-6667254c9447?w=100&h=100&fit=crop&q=60', href: '/shop?tag=offer' },
];

export const HomePage: React.FC = () => {
    const { products } = useApp();
    const topDeals = products.slice(0, 8);
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);

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
            <section className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl mx-4 md:mx-8 my-6 p-8 md:p-12 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start">
                            <h2 className="text-sm md:text-base text-gray-700 mb-2">Featured on <span className="font-bold text-[#222]">F<span className="text-[#f28c28]">zokart</span></span></h2>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">Up to 70% Off</h1>
                            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md lg:max-w-none mx-auto lg:mx-0">Discover amazing deals on your favorite products</p>
                            <Link to="/shop" className="bg-white text-[#f28c28] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-md w-full sm:w-auto">Shop Now</Link>
                        </div>
                        <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
                            <img
                                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800"
                                alt="Happy couple shopping"
                                width="600"
                                height="450"
                                className="w-full max-w-md rounded-2xl object-cover shadow-lg"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-8 px-4 md:px-8">
                <SmoothReveal direction="up" delay={200}>
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center"><span className="text-gray-800">Shop by Categories</span></h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">                        {categories.map(category => (
                            <Link to={category.href} key={category.name} className="flex flex-col items-center p-2 text-center group">
                                <div className="w-16 h-16 md:w-20 md:h-20 mb-2 bg-gray-100 rounded-xl p-3 border border-gray-200 group-hover:shadow-md transition-shadow">
                                    <LazyImage src={category.imageUrl} alt={category.name} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            </Link>
                        ))}
                        </div>
                    </div>
                </SmoothReveal>
            </section>

            <section className="py-8 px-4 md:px-8 bg-gray-50">
                <SmoothReveal direction="up" delay={400}>
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold"><span className="text-gray-800">Top Deals</span></h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
                            {topDeals.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </SmoothReveal>
            </section>

            {/* Offers Banner Section */}
            <section className="py-4 px-4 md:px-8">
                <SmoothReveal direction="up" delay={500}>
                    <div className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-md cursor-pointer group">
                        <img
                            src="https://images.unsplash.com/photo-1472851294608-4151050935d4?q=80&w=1200&auto=format&fit=crop"
                            alt="Special Offers"
                            className="w-full h-48 md:h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col items-center justify-center pointer-events-none">
                            <h3 className="text-white text-2xl md:text-4xl font-bold uppercase tracking-widest drop-shadow-md">Exclusive Offers</h3>
                            <p className="text-white/90 mt-2 text-sm md:text-base font-medium">Grab the best deals before they are gone!</p>
                        </div>
                    </div>
                </SmoothReveal>
            </section>

            <section className="py-8 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">
                            <span className="text-gray-600">Featured on </span>
                            <span className="text-[#222]">F</span><span className="text-[#f28c28]">zokart</span>
                        </h2>
                        <div className="w-20 h-1 bg-[#f28c28] rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
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
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop Smarter with <span className="text-[#222]">F</span><span className="text-[#f28c28]">zokart</span></h2>
                                <p className="text-gray-600 text-lg mb-6">Download our mobile app and get exclusive deals, faster checkout, and personalized recommendations.</p>
                                <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex">
                                    <button className="w-full md:w-auto bg-[#f28c28] hover:bg-opacity-90 text-white font-semibold px-8 py-3 rounded-lg transition-colors">Download App</button>
                                    <Link to="/shop" className="w-full md:w-auto block text-center border-2 border-[#f28c28] text-[#f28c28] hover:bg-orange-50 font-semibold px-8 py-3 rounded-lg transition-colors">Start Shopping</Link>
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