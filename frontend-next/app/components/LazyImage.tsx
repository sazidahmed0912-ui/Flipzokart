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
    const [isLoaded, setIsLoaded] = useState(false);

    // If fill is true, we don't pass width/height
    const imageProps = fill ? { fill: true } : { width, height };

    // Fallback if no width/height/fill provided? 
    // We'll assume usage is correct. If standard <img src> was used without dimensions, 
    // it was relying on natural size or CSS. next/image needs one or the other.
    // However, to be safe for legacy usage where we might just have src/alt/className:
    // We default to `fill={true}` if no width/height is passed, assuming likely usage in a wrapper.
    // We apply className to BOTH wrapper and image to maintain backward compatibility 
    // with previous usage where className contained both layout (w-full) and styling (object-cover).
    const effectiveFill = fill || (!width && !height);
    const finalProps = effectiveFill ? { fill: true } : { width, height };
    return (
        <div className={`relative overflow-hidden bg-gray-50 ${wrapperClassName} ${effectiveFill ? '' : 'inline-block'} ${className}`}>
            <Image
                src={src}
                alt={alt}
                priority={priority}
                sizes={sizes}
                onLoad={(e) => {
                    setIsLoaded(true);
                    if (onLoad) onLoad(e);
                }}
                className={`
                    transition-opacity duration-300 ease-in-out
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    ${className}
                `}
                {...finalProps}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
