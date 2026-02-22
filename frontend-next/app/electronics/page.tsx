import React, { Suspense } from 'react';
import { GenericCategoryPage } from '@/app/_pages/GenericCategoryPage';

export const metadata = {
    title: 'Electronics Online | Laptops, TVs, Cameras, Gaming & More | Fzokart',
    description: 'Shop top electronics: Laptops, Tablets, Cameras, Smart TVs, Smart Watches, and Gaming gear. Get the best tech deals at Fzokart.',
    openGraph: {
        title: 'Electronics Store | Fzokart',
        description: 'Latest laptops, cameras, TVs, gaming gear and smart devices at unbeatable prices.',
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'],
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GenericCategoryPage categoryKey="Electronics" />
        </Suspense>
    );
}
