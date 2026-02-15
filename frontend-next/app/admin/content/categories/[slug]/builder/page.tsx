'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BuilderProvider } from '../../../_components/builder/BuilderContext';
import { BuilderUI } from '../../../_components/builder/BuilderUI';
import { AdminRoute } from '@/app/components/RouteGuards';

export default function CategoryBuilderPage() {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <AdminRoute>
            <BuilderProvider>
                <BuilderUI slug={slug} />
            </BuilderProvider>
        </AdminRoute>
    );
}
