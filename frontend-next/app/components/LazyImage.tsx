"use client";
import React, { useState } from 'react';
import Image from 'next/image';

// Use ComponentProps to inherit all next/image props like sizes, quality, priority
type NextImageProps = React.ComponentProps<typeof Image>;

interface LazyImageProps extends NextImageProps {
    className?: string; // styles for the image itself
    wrapperClassName?: string; // styles for the container
    skeletonClassName?: string; // kept for compatibility but not used
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    wrapperClassName = '',
    priority = false,
    fill = false, // Default false, but we can set true
    width,
    height,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onLoad,
    ...props
}) => {
    // On Android Capacitor, images may never fire onLoad in static exports
    // so we start as loaded to avoid permanent opacity-0 freeze
    const isCapacitor = process.env.NEXT_PUBLIC_IS_CAPACITOR === 'true';
    const [isLoaded, setIsLoaded] = useState(isCapacitor || priority);

    const [imgSrc, setImgSrc] = useState(src);

    // Update internal state if prop changes
    React.useEffect(() => {
        setImgSrc(src);
    }, [src]);

    // If fill is true, we don't pass width/height
    const imageProps = fill ? { fill: true } : { width, height };

    // Fallback logic
    const handleError = () => {
        if (imgSrc !== '/placeholder.png') {
            setImgSrc('/placeholder.png');
        }
        setIsLoaded(true);
    };

    const effectiveFill = fill || (!width && !height);
    const finalProps = effectiveFill ? { fill: true } : { width, height };

    return (
        <div className={`relative overflow-hidden bg-gray-50 ${wrapperClassName} ${effectiveFill ? 'w-full h-full' : 'inline-block'} ${className}`}>
            <Image
                src={imgSrc || '/placeholder.png'}
                alt={alt}
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? undefined : "lazy"}
                quality={60} // Aggressive compression for 13kb/s low bandwidth
                sizes={sizes}
                onLoad={(e) => {
                    setIsLoaded(true);
                    if (onLoad) onLoad(e);
                }}
                onError={(e) => {
                    handleError();
                    if (props.onError) props.onError(e); // Call prop onError if exists
                }}
                className={`
                    transition-opacity duration-300 ease-in-out
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    object-contain
                    ${className}
                `}
                {...finalProps}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
