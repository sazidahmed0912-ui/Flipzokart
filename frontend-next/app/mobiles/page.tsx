import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Mobiles Online | Smartphones, Cases, Earphones & More | Fzokart',
    description: 'Shop the latest smartphones, feature phones, mobile cases, chargers, earphones and screen guards. Best mobile deals at Fzokart.',
    openGraph: {
        title: 'Mobile Phones & Accessories | Fzokart',
        description: 'Top smartphones, accessories, and mobile gadgets at the best prices.',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Mobiles" />
        </Suspense>
    );
}
