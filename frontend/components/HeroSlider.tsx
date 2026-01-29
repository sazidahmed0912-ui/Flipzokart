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
        <section className="relative w-full md:w-auto md:mx-8 md:my-6 h-[45vh] md:h-[55vh] min-h-[400px] md:min-h-[450px] max-h-[600px] overflow-hidden md:rounded-2xl shadow-lg group bg-gray-100">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].gradient} flex items-center`}
                >
                    <div className="max-w-7xl mx-auto px-4 md:px-12 w-full h-full">
                        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 h-full items-center">

                            {/* Image Content - Mobile Top / Desktop Right */}
                            <div className="relative h-[40%] md:h-full w-full flex justify-center md:justify-end items-end md:items-center order-1 md:order-2 mt-4 md:mt-0">
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                    src={slides[currentIndex].image}
                                    alt={slides[currentIndex].title}
                                    className="h-[90%] md:h-[85%] w-auto object-contain max-w-full drop-shadow-2xl"
                                />
                            </div>

                            {/* Text Content - Mobile Bottom / Desktop Left */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 order-2 md:order-1 h-[60%] md:h-auto justify-start md:justify-center pt-2 md:pt-0 pb-6 md:pb-0">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-4 leading-tight ${slides[currentIndex].textParams.titleColor}`}
                                >
                                    {slides[currentIndex].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-sm sm:text-base md:text-xl mb-4 md:mb-8 max-w-[90%] md:max-w-md ${slides[currentIndex].textParams.textColor}`}
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
                                        className={`${slides[currentIndex].textParams.buttonBg} ${slides[currentIndex].textParams.buttonText} px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-sm md:text-lg hover:shadow-xl hover:scale-105 transition-all shadow-md inline-block uppercase tracking-wide`}
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
