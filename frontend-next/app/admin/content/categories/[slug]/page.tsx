'use client';

import React, { useState, useEffect } from 'react';
import API from '@/app/services/api';
import { useParams } from 'next/navigation';
import { ImageUpload } from '../../_components/ImageUpload';
import { SUBCATEGORIES } from '@/app/constants';
import { Save, ArrowLeft, Loader2, Smartphone, Monitor, Layout, Plus } from 'lucide-react';
import Link from 'next/link';

// Helper to reverse slugify to find matching constant key if needed, 
// or just use backend data. 
const findCategoryNameBySlug = (slug: string) => {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function CategoryDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const displayName = findCategoryNameBySlug(slug);

    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<any>(null);
    const [subcats, setSubcats] = useState<any[]>([]);

    // Local state for edits
    const [bannerUrl, setBannerUrl] = useState('');
    const [mobileBannerUrl, setMobileBannerUrl] = useState('');

    // Need to map subcategories from constants to "potential" subcategories
    // and merge with DB data.
    const [mergedSubcats, setMergedSubcats] = useState<{ name: string, slug: string, iconUrl: string, _id?: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/api/content/categories/${slug}`);
            setCategoryData(res.data.category || {});
            setBannerUrl(res.data.category?.bannerUrl || '');
            setMobileBannerUrl(res.data.category?.mobileBannerUrl || '');
            setSubcats(res.data.subcategories || []);

            // Merge with Constants
            // 1. Find the Key in SUBCATEGORIES that matches this slug
            const categoryKey = Object.keys(SUBCATEGORIES).find(
                k => k.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === slug
            );

            if (categoryKey) {
                const constantSubcats = SUBCATEGORIES[categoryKey];
                const merged = constantSubcats.map(subName => {
                    const subSlug = subName.toLowerCase().replace(/ /g, '-');
                    const existing = res.data.subcategories.find((s: any) => s.slug === subSlug);
                    return {
                        name: subName,
                        slug: subSlug,
                        iconUrl: existing?.iconUrl || '',
                        _id: existing?._id
                    };
                });
                setMergedSubcats(merged);
            } else {
                // If no constant match (maybe new category added in DB?), just show DB ones
                setMergedSubcats(res.data.subcategories.map((s: any) => ({
                    name: s.name,
                    slug: s.slug,
                    iconUrl: s.iconUrl,
                    _id: s._id
                })));
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const saveCategoryBanner = async () => {
        try {
            await API.post('/api/admin/content/categories', {
                name: displayName, // Ideally correct case
                slug: slug,
                bannerUrl: bannerUrl,
                mobileBannerUrl: mobileBannerUrl
            });
            alert('Banner saved!');
        } catch (e) {
            alert('Failed to save banner');
        }
    };

    const saveSubcategoryIcon = async (sub: any, newUrl: string) => {
        // Optimistic update
        const newMerged = mergedSubcats.map(s => s.slug === sub.slug ? { ...s, iconUrl: newUrl } : s);
        setMergedSubcats(newMerged);

        try {
            // Need categoryId. If categoryData doesn't exist yet, ensure it exists first
            let catId = categoryData?._id;
            if (!catId) {
                const catRes = await API.post('/api/admin/content/categories', {
                    name: displayName,
                    slug: slug,
                    bannerUrl: bannerUrl,
                    mobileBannerUrl: mobileBannerUrl
                });
                catId = catRes.data._id;
                setCategoryData(catRes.data);
            }

            await API.post('/api/admin/content/subcategories', {
                categoryId: catId,
                name: sub.name,
                slug: sub.slug,
                iconUrl: newUrl
            });

        } catch (e) {
            console.error(e);
            alert('Failed to save icon');
        }
    };

    // New Subcategory Logic
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState('');
    const [newSubIcon, setNewSubIcon] = useState('');

    const handleAddSubcategory = async () => {
        if (!newSubName || !newSubIcon) return;
        const newSlug = newSubName.toLowerCase().replace(/ /g, '-');

        // Optimistic
        const newSub = { name: newSubName, slug: newSlug, iconUrl: newSubIcon };
        setMergedSubcats([...mergedSubcats, newSub]);

        try {
            // Ensure Category Exists
            let catId = categoryData?._id;
            if (!catId) {
                const catRes = await API.post('/api/admin/content/categories', {
                    name: displayName,
                    slug: slug,
                    bannerUrl: bannerUrl,
                    mobileBannerUrl: mobileBannerUrl
                });
                catId = catRes.data._id;
                setCategoryData(catRes.data);
            }

            await API.post('/api/admin/content/subcategories', {
                categoryId: catId,
                name: newSubName,
                slug: newSlug,
                iconUrl: newSubIcon
            });

            setIsAddingSub(false);
            setNewSubName('');
            setNewSubIcon('');
            alert('Subcategory Added');
            fetchData(); // Refetch to align with backend
        } catch (e) {
            alert('Failed to add subcategory');
        }
    };

    if (loading) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/content/categories" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{displayName} Content</h2>
                    <p className="text-sm text-gray-500">Manage banner and sub-items.</p>
                </div>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Layout size={20} className="text-blue-600" /> Landing Page Builder</h3>
                    <p className="text-sm text-gray-600">Design a custom layout for this category page using the drag-and-drop builder.</p>
                </div>
                <Link
                    href={`/admin/content/categories/${slug}/builder`}
                    className="px-6 py-2.5 bg-[#2874F0] text-white font-bold rounded-lg shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <Layout size={18} />
                    Open Builder
                </Link>
            </div>

            <div className="space-y-8">
                {/* Banner Section */}
                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-700">Category Banners</h3>
                        <button
                            onClick={saveCategoryBanner}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-lg hover:bg-[#1e5bbf]"
                        >
                            <Save size={18} />
                            Save Banners
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Monitor size={16} /> Desktop Banner
                            </label>
                            <ImageUpload
                                value={bannerUrl}
                                onChange={setBannerUrl}
                                onRemove={() => setBannerUrl('')}
                                label="Upload Desktop Banner"
                                height="h-48"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Smartphone size={16} /> Mobile Banner
                            </label>
                            <ImageUpload
                                value={mobileBannerUrl}
                                onChange={setMobileBannerUrl}
                                onRemove={() => setMobileBannerUrl('')}
                                label="Upload Mobile Banner"
                                height="h-48"
                            />
                        </div>
                    </div>
                </section>

                {/* Subcategories Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Subcategory Icons</h3>
                        <button
                            onClick={() => setIsAddingSub(!isAddingSub)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                        >
                            <Plus size={16} /> Add Subcategory
                        </button>
                    </div>

                    {isAddingSub && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">New Subcategory</h4>
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        value={newSubName}
                                        onChange={(e) => setNewSubName(e.target.value)}
                                        autoFocus
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="e.g. Party Wear"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Icon</label>
                                    <ImageUpload
                                        value={newSubIcon}
                                        onChange={setNewSubIcon}
                                        onRemove={() => setNewSubIcon('')}
                                        height="h-20"
                                        width="w-20"
                                        minimal
                                    />
                                </div>
                                <div className="flex items-end h-full pt-6">
                                    <button
                                        onClick={handleAddSubcategory}
                                        disabled={!newSubName || !newSubIcon}
                                        className="px-4 py-2 bg-[#2874F0] text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {mergedSubcats.map((sub) => (
                            <div key={sub.slug} className="bg-white p-4 rounded-xl border flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all relative group">
                                <span className="font-medium text-sm text-center min-h-[40px] flex items-center">{sub.name}</span>
                                <div className="w-full aspect-square relative">
                                    <ImageUpload
                                        value={sub.iconUrl}
                                        onChange={(url) => saveSubcategoryIcon(sub, url)}
                                        onRemove={() => saveSubcategoryIcon(sub, '')}
                                        label="Icon"
                                        height="h-full"
                                        width="w-full"
                                        className="rounded-lg"
                                        minimal
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
