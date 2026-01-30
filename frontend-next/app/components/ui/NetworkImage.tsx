"use client";
import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/app/hooks/useNetworkStatus';
import Skeleton from '../Skeleton';

interface NetworkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholderSrc?: string; // Optional tiny placeholder or different resolution URL
}

const NetworkImage: React.FC<NetworkImageProps> = ({
    src,
    alt,
    className = '',
    placeholderSrc,
    ...props
}) => {
    const { isSlow } = useNetworkStatus();
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>('');

    useEffect(() => {
        // If slow network, we might want to delay loading the high-res image
        // or ensure we only load it when absolutely necessary (e.g. into view).
        // For now, we utilize the native loading="lazy" but strictly control the display.

        const img = new Image();
        img.src = src;
        img.onload = () => {
            setIsLoaded(true);
            setCurrentSrc(src);
        };

        // If slow, and we have a placeholder, we could set currentSrc to placeholder immediately
        // But the Skeleton overlay handles the "loading" state better visually.

    }, [src, isSlow]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton Overlay - Shows until image is loaded */}
            {!isLoaded && (
                <div className="absolute inset-0 z-10">
                    <Skeleton className="w-full h-full" />
                </div>
            )}

            {/* Actual Image */}
            <img
                src={src}
                alt={alt}
                className={`
                    w-full h-full object-cover transition-opacity duration-500 ease-in-out
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                loading={isSlow ? "lazy" : "eager"} // Force lazy on slow networks
                {...props}
            />
        </div>
    );
};

export default NetworkImage;
