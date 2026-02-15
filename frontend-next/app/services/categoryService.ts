import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SubMenu {
    _id: string;
    subcategoryId: string;
    name: string;
    slug: string;
    icon?: string;
    order: number;
    isActive: boolean;
}

export interface Subcategory {
    _id: string;
    categoryId: string;
    name: string;
    slug: string;
    iconUrl?: string; // Corrected from icon
    position: number;
    isActive: boolean;
    submenu: SubMenu[];
}

export interface CategoryTree {
    _id: string;
    name: string;
    slug: string;
    bannerUrl?: string;
    mobileBannerUrl?: string;
    isActive: boolean;
    subcategories: Subcategory[];
}

export const fetchCategoryTree = async (): Promise<CategoryTree[]> => {
    try {
        // Cache busting header for fresh data
        const { data } = await axios.get(`${API_URL}/content/categories/full-tree`, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        return data;
    } catch (error) {
        console.error("Failed to fetch category tree", error);
        return [];
    }
};
