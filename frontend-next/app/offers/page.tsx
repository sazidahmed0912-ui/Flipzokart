import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Best Offers & Deals Online | Flash Sale, Clearance & More | Fzokart',
    description: 'Discover the best deals and offers on Fzokart — Flash Sale, Clearance, products under ₹499, ₹999, ₹1999. Save big today!',
    openGraph: {
        title: 'Mega Offers & Deals | Fzokart',
        description: 'Flash sales, clearance deals and huge discounts across all categories.',
        images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Offers" />
        </Suspense>
    );
}
