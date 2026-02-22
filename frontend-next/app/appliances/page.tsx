import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Home Appliances | Washing Machines, Refrigerators, ACs & More | Fzokart',
    description: 'Shop home appliances online: Washing Machines, Refrigerators, Air Conditioners, Microwaves, Vacuum Cleaners and Water Purifiers at the best prices.',
    openGraph: {
        title: 'Home Appliances Store | Fzokart',
        description: 'Premium washing machines, refrigerators, ACs and kitchen appliances with great deals.',
        images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Appliances" />
        </Suspense>
    );
}
