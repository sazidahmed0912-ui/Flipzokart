/**
 * Helper to ensure product images always have a valid full URL
 */
export const getProductImageUrl = (imagePath?: string): string => {
    if (!imagePath) return "https://via.placeholder.com/300?text=No+Image";

    // If it's already a full URL (http/https/data), return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Otherwise, prepend the API URL
    // We try to get it from environment, or fallback to localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Handle case where path might already have a leading slash or backslashes
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    return `${API_URL}/${cleanPath}`;
};

/**
 * Standardized logic to resolve product image from various possible sources.
 * Priority: images[0] > thumbnail > image > placeholder
 */
export const resolveProductImage = (product: any): string => {
    if (!product) return "/placeholder.png";

    // 1. Array (images[0])
    if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
        return getProductImageUrl(product.images[0]);
    }

    // 2. Thumbnail (if exists)
    if (product.thumbnail) {
        return getProductImageUrl(product.thumbnail);
    }

    // 3. Legacy Image (backward compatibility)
    if (product.image) {
        return getProductImageUrl(product.image);
    }

    // 4. Fallback to placeholder
    return "/placeholder.png";
};
