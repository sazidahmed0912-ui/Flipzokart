import React, { useState, useEffect } from 'react';
import { getProductImageUrl } from '../utils/imageHelper';

interface ProductImageProps {
    product: {
        image?: string;
        title?: string;
        name?: string;
    } | null;
}

export default function ProductImage({ product }: ProductImageProps) {
    const [imgSrc, setImgSrc] = useState<string>("/placeholder.png");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Update image source when product changes
    useEffect(() => {
        if (product?.image) {
            const url = getProductImageUrl(product.image);
            console.log("Vite ProductImage - Setting URL:", url);
            setImgSrc(url);
            setIsLoading(true);
        } else {
            console.warn("Vite ProductImage - No image for product:", product);
            setImgSrc("/placeholder.png");
            setIsLoading(false);
        }
    }, [product]);

    const handleOnError = () => {
        console.error("Vite ProductImage - Load Error:", imgSrc);
        setImgSrc("/placeholder.png");
        setIsLoading(false);
    };

    const handleOnLoad = () => {
        setIsLoading(false);
    };

    if (!product) {
        return (
            <div className="w-full h-[300px] md:h-[400px] bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <span className="text-gray-400 font-medium">Loading...</span>
            </div>
        );
    }

    return (
        <div className="w-full relative flex justify-center bg-white rounded-xl overflow-hidden min-h-[300px] md:min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/80">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            )}
            <img
                src={imgSrc}
                alt={product?.title || product?.name || "Product Image"}
                className={`object-contain w-full h-auto max-h-[500px] transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleOnError}
                onLoad={handleOnLoad}
            />
        </div>
    );
}
