/**
 * Helper to ensure product images always have a valid full URL
 */
export const getProductImageUrl = (imagePath?: string): string => {
    if (!imagePath) return "/placeholder.png";

    // If it's already a full URL (http/https/data), return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Otherwise, prepend the API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Handle case where path might already have a leading slash or backslashes
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    return `${API_URL}/${cleanPath}`;
};

/**
 * Universal Product Image Resolver
 * STRICTLY prioritizes images[] array.
 * Falls back to legacy logic only if array is empty.
 * 
 * @param product The product object
 * @param index Optional index to fetch specific image (default 0)
 * @returns Full URL of the image
 */
export const getProductImage = (product: any, index: number = 0): string => {
    if (!product) return "/placeholder.png";

    // 1. Array Access (Primary Source of Truth)
    if (Array.isArray(product.images) && product.images.length > index && product.images[index]) {
        return getProductImageUrl(product.images[index]);
    }

    // 2. Thumbnail (Only if requesting index 0)
    if (index === 0 && product.thumbnail) {
        return getProductImageUrl(product.thumbnail);
    }

    // 3. Fallback for Index 0: Check legacy 'image' field
    if (index === 0 && product.image) {
        return getProductImageUrl(product.image);
    }

    return "/placeholder.png";
};

/**
 * Get ALL valid images for a product as a string array.
 * Useful for galleries.
 */
export const getAllProductImages = (product: any): string[] => {
    if (!product) return ["/placeholder.png"];

    const images: string[] = [];

    // 1. Add all from images array
    if (Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach((img: string) => {
            if (img) images.push(getProductImageUrl(img));
        });
    }

    // 2. If no images, try thumbnail/legacy image
    if (images.length === 0) {
        if (product.thumbnail) images.push(getProductImageUrl(product.thumbnail));
        else if (product.image) images.push(getProductImageUrl(product.image));
    }

    // 3. Final Fallback
    if (images.length === 0) {
        return ["/placeholder.png"];
    }

    // Deduplicate
    return Array.from(new Set(images));
};

// Alias for backward compatibility
export const resolveProductImage = (product: any) => getProductImage(product, 0);
