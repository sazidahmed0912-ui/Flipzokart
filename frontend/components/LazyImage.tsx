import React, { useState } from 'react';
import Skeleton from './Skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    skeletonClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    skeletonClassName = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);

    React.useEffect(() => {
        setIsLoaded(false);
        // Check if image is already loaded (e.g. from cache)
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
        }
    }, [src]);

    return (
        <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
            {/* Loading skeleton removed */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`
                    transition-all duration-300 ease-out
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    ${className}
                `}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
