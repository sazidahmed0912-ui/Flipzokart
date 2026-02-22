"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ChevronRight, TrendingUp, Star, ShoppingBag, Clock, Tag } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// ─────────────────────────────────────────────────────────
// 1.  CATEGORY CONFIGURATION MAP
// ─────────────────────────────────────────────────────────
export type CategoryKey =
    | 'Groceries'
    | 'Mobiles'
    | 'Electronics'
    | 'Home'
    | 'Appliances'
    | 'Offers';

interface SubcategoryItem {
    name: string;
    icon: string;
    link: string;
}

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

interface CategoryConfig {
    key: CategoryKey;
    label: string;
    slug: string;          // URL slug  e.g. "groceries"
    accent: string;        // Tailwind bg class  e.g. "bg-green-600"
    accentShadow: string;  // e.g. "shadow-green-200"
    accentText: string;    // e.g. "text-green-600"
    accentBorder: string;  // e.g. "border-green-400"
    tabs: string[];
    subcategories: SubcategoryItem[];
    banners: Record<string, BannerConfig>;
    /** Backend category name used in API calls */
    apiCategory: string;
    /** True for Offers page — uses discounted-products logic */
    isOffers?: boolean;
}

// ── Groceries ──────────────────────────────────────────────
const GROCERIES_CONFIG: CategoryConfig = {
    key: 'Groceries',
    label: 'Groceries',
    slug: 'groceries',
    accent: 'bg-green-600',
    accentShadow: 'shadow-green-200',
    accentText: 'text-green-600',
    accentBorder: 'border-green-400',
    apiCategory: 'Groceries',
    tabs: ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Snacks', 'Beverages', 'Pantry', 'Organic'],
    subcategories: [
        { name: 'Fruits & Veg', icon: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Fruits %26 Vegetables' },
        { name: 'Dairy & Eggs', icon: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Dairy %26 Eggs' },
        { name: 'Snacks', icon: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Snacks' },
        { name: 'Beverages', icon: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Beverages' },
        { name: 'Pantry', icon: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Pantry' },
        { name: 'Organic', icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Groceries&subcategory=Organic' },
    ],
    banners: {
        All: { title: 'Fresh Groceries', images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries' },
        'Fruits & Vegetables': { title: 'Fresh Produce', images: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Fruits %26 Vegetables' },
        'Dairy & Eggs': { title: 'Dairy & Eggs', images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1506802913710-d1e59c568e0e?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Dairy %26 Eggs' },
        Snacks: { title: 'Snack Time', images: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Snacks' },
        Beverages: { title: 'Refreshing Drinks', images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1543253687-c931c8e01820?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Beverages' },
        Pantry: { title: 'Pantry Essentials', images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1584988274525-90e3b95c5a9a?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Pantry' },
        Organic: { title: 'Go Organic', images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Groceries&subcategory=Organic' },
    },
};

// ── Mobiles ────────────────────────────────────────────────
const MOBILES_CONFIG: CategoryConfig = {
    key: 'Mobiles',
    label: 'Mobiles',
    slug: 'mobiles',
    accent: 'bg-blue-600',
    accentShadow: 'shadow-blue-200',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-400',
    apiCategory: 'Mobiles',
    tabs: ['All', 'Smartphones', 'Feature Phones', 'Cases & Covers', 'Chargers', 'Earphones', 'Screen Guards'],
    subcategories: [
        { name: 'Smartphones', icon: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Smartphones' },
        { name: 'Feature Phones', icon: 'https://images.unsplash.com/photo-1604054923177-ff5e8f7e0b52?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Feature Phones' },
        { name: 'Cases & Covers', icon: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Cases %26 Covers' },
        { name: 'Chargers', icon: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Chargers' },
        { name: 'Earphones', icon: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Earphones' },
        { name: 'Screen Guards', icon: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Mobiles&subcategory=Screen Guards' },
    ],
    banners: {
        All: { title: 'Latest Mobiles', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles' },
        Smartphones: { title: 'Top Smartphones', images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Smartphones' },
        'Feature Phones': { title: 'Feature Phones', images: ['https://images.unsplash.com/photo-1604054923177-ff5e8f7e0b52?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Feature Phones' },
        'Cases & Covers': { title: 'Style Your Phone', images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Cases %26 Covers' },
        Chargers: { title: 'Fast Charging', images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607853202273-232359e82b29?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Chargers' },
        Earphones: { title: 'Premium Audio', images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Earphones' },
        'Screen Guards': { title: 'Screen Protection', images: ['https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Mobiles&subcategory=Screen Guards' },
    },
};

// ── Electronics ────────────────────────────────────────────
const ELECTRONICS_CONFIG: CategoryConfig = {
    key: 'Electronics',
    label: 'Electronics',
    slug: 'electronics',
    accent: 'bg-indigo-600',
    accentShadow: 'shadow-indigo-200',
    accentText: 'text-indigo-600',
    accentBorder: 'border-indigo-400',
    apiCategory: 'Electronics',
    tabs: ['All', 'Laptops', 'Tablets', 'Cameras', 'TVs', 'Smart Watches', 'Gaming'],
    subcategories: [
        { name: 'Laptops', icon: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=Laptops' },
        { name: 'Tablets', icon: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=Tablets' },
        { name: 'Cameras', icon: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=Cameras' },
        { name: 'TVs', icon: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=TVs' },
        { name: 'Smart Watches', icon: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=Smart Watches' },
        { name: 'Gaming', icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Electronics&subcategory=Gaming' },
    ],
    banners: {
        All: { title: 'Top Electronics', images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics' },
        Laptops: { title: 'Power Your Work', images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=Laptops' },
        Tablets: { title: 'Work & Play Anywhere', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=Tablets' },
        Cameras: { title: 'Capture Every Moment', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=Cameras' },
        TVs: { title: 'Big Screen Experience', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=TVs' },
        'Smart Watches': { title: 'Smart on Your Wrist', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=Smart Watches' },
        Gaming: { title: 'Game On', images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Electronics&subcategory=Gaming' },
    },
};

// ── Home ───────────────────────────────────────────────────
const HOME_CONFIG: CategoryConfig = {
    key: 'Home',
    label: 'Home',
    slug: 'home',
    accent: 'bg-orange-500',
    accentShadow: 'shadow-orange-200',
    accentText: 'text-orange-500',
    accentBorder: 'border-orange-400',
    apiCategory: 'Home',
    tabs: ['All', 'Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting', 'Storage'],
    subcategories: [
        { name: 'Furniture', icon: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Furniture' },
        { name: 'Decor', icon: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Decor' },
        { name: 'Kitchen', icon: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Kitchen' },
        { name: 'Bedding', icon: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Bedding' },
        { name: 'Lighting', icon: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Lighting' },
        { name: 'Storage', icon: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Home&subcategory=Storage' },
    ],
    banners: {
        All: { title: 'Home & Living', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home' },
        Furniture: { title: 'Stylish Furniture', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Furniture' },
        Decor: { title: 'Beautiful Decor', images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1585847406873-f2a2a0b3a35e?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Decor' },
        Kitchen: { title: 'Modern Kitchen', images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Kitchen' },
        Bedding: { title: 'Sleep in Comfort', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Bedding' },
        Lighting: { title: 'Light Up Your Home', images: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Lighting' },
        Storage: { title: 'Stay Organised', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1511639196397-537c68da3a6b?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Home&subcategory=Storage' },
    },
};

// ── Appliances ─────────────────────────────────────────────
const APPLIANCES_CONFIG: CategoryConfig = {
    key: 'Appliances',
    label: 'Appliances',
    slug: 'appliances',
    accent: 'bg-purple-600',
    accentShadow: 'shadow-purple-200',
    accentText: 'text-purple-600',
    accentBorder: 'border-purple-400',
    apiCategory: 'Appliances',
    tabs: ['All', 'Washing Machines', 'Refrigerators', 'Air Conditioners', 'Microwaves', 'Vacuum Cleaners', 'Water Purifiers'],
    subcategories: [
        { name: 'Washing Machines', icon: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Washing Machines' },
        { name: 'Refrigerators', icon: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Refrigerators' },
        { name: 'Air Conditioners', icon: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Air Conditioners' },
        { name: 'Microwaves', icon: 'https://images.unsplash.com/photo-1603984042439-c5b86f5f9484?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Microwaves' },
        { name: 'Vacuum Cleaners', icon: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Vacuum Cleaners' },
        { name: 'Water Purifiers', icon: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Appliances&subcategory=Water Purifiers' },
    ],
    banners: {
        All: { title: 'Home Appliances', images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances' },
        'Washing Machines': { title: 'Smarter Laundry', images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Washing Machines' },
        Refrigerators: { title: 'Keep it Fresh', images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Refrigerators' },
        'Air Conditioners': { title: 'Stay Cool', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631202362682-c8e681c86e47?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Air Conditioners' },
        Microwaves: { title: 'Quick Cooking', images: ['https://images.unsplash.com/photo-1603984042439-c5b86f5f9484?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Microwaves' },
        'Vacuum Cleaners': { title: 'Spotless Floors', images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1527515545081-5db817172677?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Vacuum Cleaners' },
        'Water Purifiers': { title: 'Pure Every Drop', images: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1600&auto=format&fit=crop'], link: '/shop?category=Appliances&subcategory=Water Purifiers' },
    },
};

// ── Offers ────────────────────────────────────────────────
const OFFERS_CONFIG: CategoryConfig = {
    key: 'Offers',
    label: 'Offers',
    slug: 'offers',
    accent: 'bg-red-500',
    accentShadow: 'shadow-red-200',
    accentText: 'text-red-500',
    accentBorder: 'border-red-400',
    apiCategory: 'Offers',
    isOffers: true,
    tabs: ['All Deals', 'Under ₹499', 'Under ₹999', 'Under ₹1999', 'Flash Sale', 'Clearance'],
    subcategories: [
        { name: 'Under ₹499', icon: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop', link: '/shop?maxPrice=499&discount=true' },
        { name: 'Under ₹999', icon: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=600&auto=format&fit=crop', link: '/shop?maxPrice=999&discount=true' },
        { name: 'Under ₹1999', icon: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop', link: '/shop?maxPrice=1999&discount=true' },
        { name: 'Flash Sale', icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop', link: '/shop?discount=true&sort=discount' },
        { name: 'Clearance', icon: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop', link: '/shop?discount=true&sort=price-asc' },
        { name: 'Best Deals', icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600&auto=format&fit=crop', link: '/shop?discount=true&sort=rating' },
    ],
    banners: {
        'All Deals': { title: 'Mega Offers', images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop'], link: '/shop?discount=true' },
        'Under ₹499': { title: 'Under ₹499', images: ['https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop'], link: '/shop?maxPrice=499&discount=true' },
        'Under ₹999': { title: 'Under ₹999', images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop'], link: '/shop?maxPrice=999&discount=true' },
        'Under ₹1999': { title: 'Under ₹1999', images: ['https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1600&auto=format&fit=crop'], link: '/shop?maxPrice=1999&discount=true' },
        'Flash Sale': { title: 'Flash Sale 🔥', images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop'], link: '/shop?discount=true&sort=discount' },
        Clearance: { title: 'Clearance Sale', images: ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop'], link: '/shop?discount=true&sort=price-asc' },
    },
};

// Master lookup
export const CATEGORY_CONFIGS: Record<CategoryKey, CategoryConfig> = {
    Groceries: GROCERIES_CONFIG,
    Mobiles: MOBILES_CONFIG,
    Electronics: ELECTRONICS_CONFIG,
    Home: HOME_CONFIG,
    Appliances: APPLIANCES_CONFIG,
    Offers: OFFERS_CONFIG,
};

// ─────────────────────────────────────────────────────────────
// 2.  COMPONENT
// ─────────────────────────────────────────────────────────────
interface Props { categoryKey: CategoryKey; }

export const GenericCategoryPage: React.FC<Props> = ({ categoryKey }) => {
    const config = CATEGORY_CONFIGS[categoryKey];
    const { products: contextProducts } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    const defaultTab = config.tabs[0];

    const getInitialTab = (): string => {
        const t = searchParams.get('tab');
        return t && config.tabs.includes(t) ? t : defaultTab;
    };

    const [activeTab, setActiveTab] = useState<string>(getInitialTab);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [trendingByTab, setTrendingByTab] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [trendingDays, setTrendingDays] = useState<7 | 15 | 30>(7);
    const [loading, setLoading] = useState(true);

    // Rank movement tracking refs
    const previousRanksRef = useRef<Record<string, number>>({});
    const isRankFirstLoadRef = useRef(true);

    // ── Fetch base products ─────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                if (config.isOffers) {
                    // Offers: discounted products via global trending endpoint
                    const res = await axios.get(`${API_URL}/api/products/trending/global?days=30&limit=24`);
                    const allDiscounted = (res.data || []).filter((p: any) =>
                        (p.discountPrice && p.discountPrice < p.price) ||
                        (p.discount && p.discount > 0)
                    );
                    setCategoryProducts(allDiscounted);
                } else {
                    const res = await axios.get(`${API_URL}/api/products/random/${encodeURIComponent(config.apiCategory)}?limit=24`, {
                        headers: { 'Cache-Control': 'no-store' }
                    });
                    setCategoryProducts(res.data || []);
                }
            } catch {
                // Fallback to context products
                const fallback = contextProducts.filter((p: any) =>
                    config.isOffers
                        ? (p.discountPrice && p.discountPrice < p.price) || (p.discount && p.discount > 0)
                        : p.category?.toLowerCase() === config.apiCategory.toLowerCase()
                );
                setCategoryProducts(fallback);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [config.apiCategory]);

    // Reset ranks on tab/period change
    useEffect(() => {
        isRankFirstLoadRef.current = true;
        previousRanksRef.current = {};
        setTrendingByTab([]);
    }, [activeTab, trendingDays]);

    // ── Fetch & process trending ────────────────────────────
    useEffect(() => {
        const fetchTrending = async (silent = false) => {
            try {
                if (!silent) setTrendingLoading(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                let newData: any[] = [];

                if (config.isOffers) {
                    const res = await axios.get(`${API_URL}/api/products/trending/global?days=${trendingDays}&limit=16`);
                    newData = (res.data || []).filter((p: any) =>
                        (p.discountPrice && p.discountPrice < p.price) ||
                        (p.discount && p.discount > 0)
                    );
                } else {
                    const subParam = activeTab !== defaultTab
                        ? `&subcategory=${encodeURIComponent(activeTab)}`
                        : '';
                    const res = await axios.get(
                        `${API_URL}/api/products/trending/category/${encodeURIComponent(config.apiCategory)}/${trendingDays}?limit=16${subParam}`
                    );
                    newData = res.data && res.data.length > 0
                        ? res.data
                        : categoryProducts.filter((p: any) => {
                            if (activeTab === defaultTab) return true;
                            return (
                                p.subcategory?.toLowerCase().includes(activeTab.toLowerCase()) ||
                                p.submenu?.toLowerCase().includes(activeTab.toLowerCase())
                            );
                        });
                }

                // Rank movement logic
                const processRankMovement = (data: any[]) => {
                    if (isRankFirstLoadRef.current) {
                        isRankFirstLoadRef.current = false;
                        const map: Record<string, number> = {};
                        data.forEach(p => map[p._id || p.id] = p.rank);
                        previousRanksRef.current = map;
                        return data.map(p => ({ ...p, movement: 'same' }));
                    }
                    const updated = data.map(p => {
                        const pid = p._id || p.id;
                        const prev = previousRanksRef.current[pid];
                        let movement = 'same';
                        if (prev !== undefined) {
                            if (p.rank < prev) movement = 'up';
                            else if (p.rank > prev) movement = 'down';
                        }
                        return { ...p, movement };
                    });
                    const map: Record<string, number> = {};
                    updated.forEach(p => map[p._id || p.id] = p.rank);
                    previousRanksRef.current = map;
                    return updated;
                };

                setTrendingByTab(processRankMovement(newData));
            } catch (err) {
                console.error(`[${config.key}] trending fetch error:`, err);
            } finally {
                if (!silent) setTrendingLoading(false);
            }
        };

        fetchTrending();
        const interval = setInterval(() => fetchTrending(true), 10000);
        return () => clearInterval(interval);
    }, [activeTab, trendingDays, categoryProducts]);

    // Auto-clear movement arrows after 2 s
    useEffect(() => {
        const t = setTimeout(() => {
            setTrendingByTab(prev => prev.map(p => ({ ...p, movement: 'same' })));
        }, 2000);
        return () => clearTimeout(t);
    }, [trendingByTab]);

    const trendingProducts = trendingByTab.slice(0, 8);
    const bestOfProducts = trendingByTab.slice(8, 16);

    const currentBanner =
        config.banners[activeTab] || config.banners[defaultTab];

    const shopLink = config.isOffers
        ? '/shop?discount=true'
        : `/shop?category=${encodeURIComponent(config.apiCategory)}${activeTab !== defaultTab ? `&subcategory=${encodeURIComponent(activeTab)}` : ''}`;

    // ── JSX ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* ── TABS ────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 md:px-8">
                    <div className="flex overflow-x-auto no-scrollbar gap-1 py-2">
                        {config.tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    router.replace(
                                        `/${config.slug}?tab=${encodeURIComponent(tab)}`,
                                        { scroll: false }
                                    );
                                }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? `${config.accent} text-white shadow-md ${config.accentShadow}`
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {config.isOffers && tab !== defaultTab && <Tag size={10} className="inline mr-1 -mt-0.5" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── HERO BANNER ─────────────────────────────── */}
            <div className="hero-banner-quad w-full h-[220px] md:h-[420px] lg:h-[420px] xl:h-[520px] 2xl:h-[580px] bg-gray-100 overflow-hidden lg:max-w-[1400px] xl:max-w-[1500px] mx-auto lg:mt-4 relative">
                <Swiper
                    key={activeTab}
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    observer={true}
                    observeParents={true}
                    className="w-full h-full"
                >
                    {currentBanner.images.map((img, index) => (
                        <SwiperSlide key={`${activeTab}-${index}`}>
                            <div
                                className="relative w-full h-full cursor-pointer group"
                                onClick={() => router.push(currentBanner.link)}
                            >
                                <img
                                    src={img}
                                    alt={`${currentBanner.title} - Slide ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
                                <div className="banner-overlay">
                                    <span className="cta-text">
                                        {config.isOffers ? 'Grab Deal' : 'Shop Now'}
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* ── SUBCATEGORY GRID ────────────────────────── */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">
                        {config.isOffers ? 'Shop by Budget' : 'Shop by Category'}
                    </h3>
                    <div className="grid grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-6">
                        {config.subcategories.map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className={`w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:${config.accentBorder} transition-colors`}>
                                    <img
                                        src={sub.icon}
                                        alt={sub.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                                <span className="text-[11px] md:text-sm font-medium text-gray-700 text-center">
                                    {sub.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PRODUCT SECTIONS ────────────────────────── */}
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-8">

                {/* Trending */}
                {(trendingProducts.length > 0 || trendingLoading) && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold flex items-center gap-2">
                                    <TrendingUp size={16} className={config.accentText} />
                                    <span className="flex items-center glow-text">
                                        {config.isOffers ? 'Top Deals' : `Trending in ${activeTab === defaultTab ? config.label : activeTab}`}
                                        <span className="live-dot" />
                                    </span>
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Based on real orders</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {/* Time filter pills */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
                                    <Clock size={11} className="text-gray-400 ml-1.5" />
                                    {([7, 15, 30] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setTrendingDays(d)}
                                            className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full transition-all ${trendingDays === d
                                                ? `${config.accent} text-white shadow-sm`
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {d}D
                                        </button>
                                    ))}
                                </div>
                                <Link
                                    href={`${shopLink}&sort=newest`}
                                    className={`${config.accent} text-white rounded-full p-1 md:px-4 md:py-1.5`}
                                >
                                    <ChevronRight size={16} className="md:hidden" />
                                    <span className="hidden md:inline text-sm font-bold">View All</span>
                                </Link>
                            </div>
                        </div>

                        {trendingLoading ? (
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="min-w-[140px] md:min-w-0 md:flex-1 h-52 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                                {trendingProducts.map(product => (
                                    <div key={product.id || product._id} className="flex flex-col min-w-[140px] md:min-w-0 snap-start">
                                        <ProductCard product={product} />
                                        {product.showRankBadge && (
                                            <div
                                                className="flex items-center justify-center gap-1.5 mx-1 -mt-1 mb-1 py-1 px-3 rounded-b-xl text-white text-[11px] md:text-xs font-black select-none"
                                                style={{
                                                    background: [
                                                        'linear-gradient(90deg,#FFD700,#FFA500)',
                                                        'linear-gradient(90deg,#C0C0C0,#A9A9A9)',
                                                        'linear-gradient(90deg,#CD7F32,#8B4513)',
                                                        'linear-gradient(90deg,#ff416c,#ff4b2b)',
                                                        'linear-gradient(90deg,#36d1dc,#5b86e5)',
                                                    ][product.rank - 1],
                                                    animation: 'rankPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
                                                    animationDelay: `${(product.rank - 1) * 60}ms`,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                                }}
                                            >
                                                <span className="flex items-center">
                                                    #{product.rank} Trending
                                                    {product.movement === 'up' && <span className="rank-move up ml-1">⬆</span>}
                                                    {product.movement === 'down' && <span className="rank-move down ml-1">⬇</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Best Of */}
                {bestOfProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-end mb-3 md:mb-6">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-500" />
                                    {config.isOffers ? 'Best Offers' : `Best of ${activeTab === defaultTab ? config.label : activeTab}`}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Top rated by customers</p>
                            </div>
                            <Link
                                href={`${shopLink}&sort=rating`}
                                className={`${config.accent} text-white rounded-full p-1 md:px-4 md:py-1.5`}
                            >
                                <ChevronRight size={16} className="md:hidden" />
                                <span className="hidden md:inline text-sm font-bold">View All</span>
                            </Link>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                            {bestOfProducts.map(product => (
                                <div key={product.id || product._id} className="min-w-[140px] md:min-w-0 snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {trendingByTab.length === 0 && !trendingLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white m-3 rounded-xl border border-dashed text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-500 font-bold">Coming Soon</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            We&apos;re stocking up {activeTab} products!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenericCategoryPage;
