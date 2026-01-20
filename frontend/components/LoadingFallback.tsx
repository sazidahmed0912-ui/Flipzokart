import React from 'react';
import Skeleton from './Skeleton';

const LoadingFallback: React.FC = () => {
    return (
        <div className="w-full min-h-screen p-4 space-y-4">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="w-32 h-10" />
                <div className="flex space-x-4">
                    <Skeleton className="w-20 h-10" />
                    <Skeleton className="w-20 h-10" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <Skeleton className="w-full h-64" />
                    <Skeleton className="w-full h-32" />
                </div>
                <div className="md:col-span-3 space-y-4">
                    <Skeleton className="w-full h-12" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-64 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingFallback;
