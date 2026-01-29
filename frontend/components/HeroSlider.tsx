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
            titleColor: "text-white md:text-gray-900",
            textColor: "text-gray-100 md:text-gray-800",
            buttonBg: "bg-white",
            buttonText: "text-orange-600"
        }
    },
    {
        id: 2,
        title: "The Big Fashion Sale",
        subtext: "Up to 50% OFF on Top Brands",
        cta: "Shop Now",
        link: "/shop?tag=offer",
        gradient: "from-[#fcd34d] to-[#ef4444]", // Warm Yellow to Red
        image: "/assets/banner_offer_new.png",
        position: "center center",
        textParams: {
            titleColor: "text-white",
            textColor: "text-white", // White text on warm gradient looks good
            buttonBg: "bg-white",
            buttonText: "text-red-600"
        }
    },
    {
        id: 3,
        title: "Mega Savings Deal",
        subtext: "Flat 50% OFF on Kids Collection & More",
        cta: "Shop Now",
        link: "/shop?category=Kids",
        gradient: "from-[#6717cd] to-[#280590]", // Deep purple/blue to match image bg
        image: "/assets/banner_kids_new.jpg",
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
        <section className="relative w-full md:w-auto md:mx-8 md:my-6 h-[30vh] min-h-[220px] md:h-[55vh] md:min-h-[450px] max-h-[600px] overflow-hidden md:rounded-2xl shadow-lg group bg-gray-100">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].gradient} flex md:items-center`}
                >
                    <div className="w-full h-full md:max-w-7xl md:mx-auto md:px-12 relative">
                        <div className="flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-8 h-full items-center">

                            {/* Image Content */}
                            <div className="absolute inset-0 md:relative md:h-full w-full flex justify-center md:justify-end items-center order-1 md:order-2 z-0 md:z-auto">
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                    src={slides[currentIndex].image}
                                    alt={slides[currentIndex].title}
                                    className="w-full h-full object-cover md:h-[85%] md:w-auto md:object-contain md:max-w-full drop-shadow-2xl"
                                />
                            </div>

                            {/* Text Content - Overlay on Mobile */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-start text-left z-10 md:static md:bg-none md:order-1 md:h-auto md:justify-center md:p-0 md:pt-0 md:pb-0">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className={`text-xl sm:text-2xl md:text-5xl lg:text-6xl font-extrabold mb-1 md:mb-4 leading-tight line-clamp-2 ${slides[currentIndex].textParams.titleColor}`}
                                >
                                    {slides[currentIndex].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-xs sm:text-sm md:text-xl mb-3 md:mb-8 max-w-[90%] md:max-w-md line-clamp-1 ${slides[currentIndex].textParams.textColor}`}
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
                                        className={`${slides[currentIndex].textParams.buttonBg} ${slides[currentIndex].textParams.buttonText} px-5 py-2 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-lg hover:shadow-xl hover:scale-105 transition-all shadow-md inline-block uppercase tracking-wide`}
                                    >
                                        {slides[currentIndex].cta}
                                    </Link>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
};
