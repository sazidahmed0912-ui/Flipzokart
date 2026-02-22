import React, { Suspense } from 'react';
import { AgriculturePage } from '@/app/_pages/AgriculturePage';

export const metadata = {
    title: 'Agriculture Products Online | Seeds, Tools, Fertilizers | Fzokart',
    description: 'Shop the best Agriculture essentials: Seeds & Plants, Fertilizers, Farming Tools, Pesticides, Irrigation systems & more. Best prices guaranteed.',
    openGraph: {
        title: 'Agriculture Store | Fzokart',
        description: 'Discover premium seeds, farming tools, fertilizers, and more for every farmer.',
        images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop'],
    }
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <AgriculturePage />
        </Suspense>
    );
}
