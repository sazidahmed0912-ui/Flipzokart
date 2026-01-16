
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Heart, Award, Users, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden bg-dark">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="About Us"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-white"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <h4 className="text-primary font-bold uppercase tracking-[0.3em] text-xs animate-in fade-in slide-in-from-bottom-4 duration-700">Established 2024</h4>
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">
            About <span className="text-primary">Us</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg lg:text-xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Redefining the Indian digital marketplace through innovation, quality, and unwavering trust.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-5xl font-bold text-dark tracking-tight leading-tight">
                  Welcome — Your Trusted Online Shopping Destination
                </h2>
                <div className="w-20 h-1.5 bg-primary rounded-full"></div>
              </div>
              
              <div className="space-y-6 text-gray-500 text-lg lg:text-xl leading-relaxed">
                <p className="font-medium text-dark">
                  This is a modern e-commerce platform built to provide customers with high-quality products, affordable prices, and a smooth online shopping experience.
                </p>
                <p>
                  We combine technology and trust to create a marketplace where shopping is simple, fast, and secure. Our journey began with a single mission: to bridge the gap between premium global brands and the vibrant Indian consumer base.
                </p>
                <p>
                  By leveraging cutting-edge logistics and a curated selection process, we ensure that every click leads to a smile. We don't just sell products; we deliver experiences.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/shop" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2">
                  Explore Marketplace <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover"
                  alt="Quality Products"
                />
              </div>
              {/* Decorative background elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-dark/5 rounded-full blur-2xl -z-0"></div>
              
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 z-20 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">100%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Genuine Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-lightGray/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Our Core Values</h2>
            <p className="text-gray-500 max-w-xl mx-auto">The foundation of everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Premium Quality",
                desc: "We hand-pick every seller and product to ensure you receive nothing but the best."
              },
              {
                icon: Zap,
                title: "Simple & Fast",
                desc: "Our platform is designed for speed—from search to lightning-fast delivery."
              },
              {
                icon: ShieldCheck,
                title: "Unyielding Security",
                desc: "Your data and payments are protected by industry-leading 256-bit encryption."
              }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-dark rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-bold tracking-tighter">1M+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Users</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-bold tracking-tighter">500k+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Shipments</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-bold tracking-tighter">10k+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Brands</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-bold tracking-tighter">99.9%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Satisfied Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-12 mb-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Users size={20} />
             </div>
             <span className="font-bold text-dark uppercase tracking-widest text-sm">Join the Community</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight max-w-2xl">
            Start Your Premium Shopping Journey Today.
          </h2>
          <Link to="/signup" className="bg-dark text-white px-12 py-5 rounded-[2rem] font-bold text-lg hover:bg-primary transition-all shadow-xl shadow-gray-200">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};
