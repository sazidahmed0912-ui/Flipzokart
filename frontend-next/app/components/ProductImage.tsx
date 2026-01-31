"use client";
import React, { useState } from 'react';
import Image from "next/image";
import { getProductImageUrl, resolveProductImage } from '@/app/utils/imageHelper';

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
    React.useEffect(() => {
        if (product) {
            const url = resolveProductImage(product);
            console.log("ProductImage Component - Setting Image URL:", url);
            setImgSrc(url);
            setIsLoading(true); // Reset loading state when source changes
        } else {
            console.warn("ProductImage Component - No product provided");
            setImgSrc("/placeholder.png");
            setIsLoading(false);
        }
    }, [product]);

    const handleOnError = (e: any) => {
        console.error("ProductImage Component - Image Load Error for URL:", imgSrc);
        setImgSrc("/placeholder.png");
        setIsLoading(false);
    };

    const handleOnLoad = () => {
        console.log("ProductImage Component - Image Loaded Successfully:", imgSrc);
        setIsLoading(false);
    };

    if (!product) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <span className="text-gray-400 font-medium">Loading Product...</span>
            </div>
        );
    }

    return (
        <div className="w-full relative flex justify-center bg-gray-50 rounded-xl overflow-hidden min-h-[300px] md:min-h-[500px] p-4">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/80">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            )}
            <Image
                src={imgSrc}
                alt={product?.title || product?.name || "Product Image"}
                width={800}
                height={800}
                priority
                unoptimized
                className={`object-contain w-full h-full max-h-[600px] transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleOnError}
                onLoad={handleOnLoad}
            />
        </div>
    );
}
