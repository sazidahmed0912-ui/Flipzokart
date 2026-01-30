
import React from 'react';
import Link from 'next/link';
;

export const HeroBanner: React.FC = () => {
  return (
    <section className="container mx-auto px-4 mt-4 md:mt-6">
      <div className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-2xl p-6 md:p-10 text-center md:text-left">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              <span className="text-gray-700">Featured on </span>
              <span className="text-[#222]">Flip</span><span className="text-[#f28c28]">zokart</span>
            </h2>
            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Up to 70% Off
            </p>
            <p className="text-gray-700 text-sm md:text-base mt-2 max-w-md mx-auto md:mx-0">
              On top-rated electronics, fashion, and home essentials.
            </p>
            <Link href="/shop" 
              className="mt-6 inline-block bg-[#222] text-white font-bold py-3 px-10 rounded-lg hover:bg-black transition-colors text-sm md:text-base"
            >
              Explore Deals
            </Link>
          </div>
          {/* Placeholder for a potential image on desktop */}
          <div className="hidden md:block w-1/3">
            {/* You can place an illustrative image here, e.g., <img src="/path/to/image.png" /> */}
          </div>
        </div>
      </div>
    </section>
  );
};
