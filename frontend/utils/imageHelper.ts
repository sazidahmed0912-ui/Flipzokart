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
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

    // Handle case where path might already have a leading slash or backslashes
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    return `${API_URL}/${cleanPath}`;
};
