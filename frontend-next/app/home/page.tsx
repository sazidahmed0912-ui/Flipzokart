import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Home & Living | Furniture, Decor, Kitchen & Bedding | Fzokart',
    description: 'Transform your home with stylish furniture, beautiful decor, modern kitchen essentials, comfortable bedding, smart lighting and storage solutions.',
    openGraph: {
        title: 'Home & Living Store | Fzokart',
        description: 'Premium furniture, decor, kitchen, bedding and home accessories at great prices.',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Home" />
        </Suspense>
    );
}
