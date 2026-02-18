import React, { Suspense } from 'react';
import { FashionPage } from '@/app/_pages/FashionPage';

export const metadata = {
    title: 'Fashion Store - Men, Women & Kids | Flipzokart',
    description: 'Shop the latest fashion trends for Men, Women, and Kids. Exclusive collection, top brands, and best prices.',
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <FashionPage />
        </Suspense>
    );
}
