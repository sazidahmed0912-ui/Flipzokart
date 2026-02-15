import React from 'react';
import { BeautyPage } from '@/app/_pages/BeautyPage';

export const metadata = {
    title: 'Buy Beauty Products Online | Fzokart',
    description: 'Shop the best Beauty Essentials: Skincare, Makeup, Hair Care, Fragrance & more. 100% Authentic Brands at Best Prices.',
    openGraph: {
        title: 'Beauty Essentials Store | Fzokart',
        description: 'Discover your glow with our premium collection of skincare, makeup, and more.',
        images: ['https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1200&auto=format&fit=crop'],
    }
};

export default function Page() {
    return <BeautyPage />;
}
