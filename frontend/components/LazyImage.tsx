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

    React.useEffect(() => {
        setIsLoaded(false);
    }, [src]);

    return (
        <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
            {/* Loading skeleton removed */}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`
                    transition-all duration-700 ease-out
                    ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'}
                    ${className}
                `}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
