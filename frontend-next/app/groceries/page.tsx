import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Groceries Online | Fresh Fruits, Dairy, Snacks & More | Fzokart',
    description: 'Shop fresh groceries online: Fruits & Vegetables, Dairy & Eggs, Snacks, Beverages, Pantry staples & Organic products. Best prices, fast delivery.',
    openGraph: {
        title: 'Online Grocery Store | Fzokart',
        description: 'Fresh groceries delivered to your door — vegetables, dairy, snacks, beverages and more.',
        images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Groceries" />
        </Suspense>
    );
}
