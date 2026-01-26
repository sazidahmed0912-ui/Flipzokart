import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        title: "Start Selling for Everyone",
        subtext: "Sell your products online and reach more customers with Fzokart",
        cta: "Join as a Seller",
        link: "/sell",
        gradient: "from-yellow-400 to-orange-500",
        image: "/assets/banner_seller.png",
        position: "center bottom",
        textParams: {
            titleColor: "text-gray-900",
            textColor: "text-gray-800",
            buttonBg: "bg-white",
            buttonText: "text-orange-600"
        }
    },
    {
        id: 2,
        title: "50% OFF Coupon Code Offer",
        subtext: "Limited time deals on top products",
        cta: "Grab Now",
        link: "/shop?tag=offer",
        gradient: "from-[#8E2DE2] to-[#4A00E0]", // Vivid Purple/Blue
        image: "/assets/banner_offer.png",
        position: "center center",
        textParams: {
            titleColor: "text-white",
            textColor: "text-purple-100",
            buttonBg: "bg-yellow-400",
            buttonText: "text-purple-900"
        }
    },
    {
        id: 3,
        title: "Mega Savings Deal",
        subtext: "Flat 50% OFF on Kids Collection & More",
        cta: "Shop Now",
        link: "/shop?category=Kids",
        gradient: "from-[#6717cd] to-[#280590]", // Deep purple/blue to match image bg
        image: "/assets/banner_kids.jpg",
        imageClassName: "scale-[1.3] md:scale-[1.5] origin-bottom",
        position: "center center",
        textParams: {
            titleColor: "text-white",
            textColor: "text-purple-100",
            buttonBg: "bg-yellow-400",
            buttonText: "text-purple-900"
        }
    }
];

export const HeroSlider: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative mx-4 md:mx-8 my-6 h-[500px] md:h-[450px] overflow-hidden rounded-2xl shadow-lg group">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].gradient} flex items-center`}
                >
                    <div className="max-w-7xl mx-auto px-8 md:px-12 w-full h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">

                            {/* Text Content */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 order-2 md:order-1 pb-8 md:pb-0">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-4 ${slides[currentIndex].textParams.titleColor}`}
                                >
                                    {slides[currentIndex].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-base md:text-xl mb-8 max-w-sm md:max-w-none ${slides[currentIndex].textParams.textColor}`}
                                >
                                    {slides[currentIndex].subtext}
                                </motion.p>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Link
                                        to={slides[currentIndex].link}
                                        className={`${slides[currentIndex].textParams.buttonBg} ${slides[currentIndex].textParams.buttonText} px-8 py-3 rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all shadow-md inline-block`}
                                    >
                                        {slides[currentIndex].cta}
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Image Content */}
                            <div className="relative h-64 md:h-full w-full flex justify-center md:justify-end items-center order-1 md:order-2 mt-4 md:mt-0">
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    src={slides[currentIndex].image}
                                    alt={slides[currentIndex].title}
                                    className={`max-h-full max-w-full object-contain md:object-cover rounded-xl ${slides[currentIndex].imageClassName || ''}`}
                                    style={{
                                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Hidden Progress Bar (Optional, for debugging or subtle hint if needed, but strict rules say no nav) */}
            {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                    <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
                ))}
            </div> */}
        </section>
    );
};
