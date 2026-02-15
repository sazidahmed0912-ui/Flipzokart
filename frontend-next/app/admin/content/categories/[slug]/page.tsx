'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ImageUpload } from '../../_components/ImageUpload';
import { SUBCATEGORIES } from '@/app/constants';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Helper to reverse slugify to find matching constant key if needed, 
// or just use backend data. 
// For now, we rely on backend having distinct data.

const findCategoryNameBySlug = (slug: string) => {
    // Simple deslugify attempt or matching with constants
    // This is purely for UI display if backend doesn't return name immediately
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

    // Need to map subcategories from constants to "potential" subcategories
    // and merge with DB data.
    // BUT the user prompt says: "Subcategory Icons... Admin must: Upload icon per subcategory... subcategories defined in constants"
    // So we should fetch DB subcategories, and also overlay with constants if they are not in DB yet?
    // Let's rely on constants as the "Source of Truth" for existence, and attributes from DB.

    const [mergedSubcats, setMergedSubcats] = useState<{ name: string, slug: string, iconUrl: string, _id?: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/content/categories/${slug}`);
            setCategoryData(res.data.category || {});
            setBannerUrl(res.data.category?.bannerUrl || '');
            setSubcats(res.data.subcategories || []);

            // Merge with Constants
            // 1. Find the Key in SUBCATEGORIES that matches this slug
            // We need to hunt down which key in SUBCATEGORIES produces this slug.
            // Since we don't have a direct map, we iterate.
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
            await axios.post('/api/admin/content/categories', {
                name: displayName, // Ideally correct case
                slug: slug,
                bannerUrl: bannerUrl
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
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
            // We need categoryId. If categoryData doesn't exist yet, we must ensure it exists first?
            // The upsertCategory should be called first or upsertSubcategory should handle it?
            // Our upsertSubcategory requires categoryId.
            // So we should enforce Category creation first.
            let catId = categoryData?._id;
            if (!catId) {
                // Auto-create category if missing
                const catRes = await axios.post('/api/admin/content/categories', {
                    name: displayName,
                    slug: slug,
                    bannerUrl: bannerUrl // Might be empty
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                catId = catRes.data._id;
                setCategoryData(catRes.data);
            }

            await axios.post('/api/admin/content/subcategories', {
                categoryId: catId,
                name: sub.name,
                slug: sub.slug,
                iconUrl: newUrl
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        } catch (e) {
            console.error(e);
            alert('Failed to save icon');
        }
    };

    if (loading) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/content/categories" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{displayName} Content</h2>
                    <p className="text-sm text-gray-500">Manage banner and sub-items.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Banner Section */}
                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Category Banner</h3>
                        <button
                            onClick={saveCategoryBanner}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-lg hover:bg-[#1e5bbf]"
                        >
                            <Save size={18} />
                            Save Banner
                        </button>
                    </div>
                    <ImageUpload
                        value={bannerUrl}
                        onChange={setBannerUrl}
                        onRemove={() => setBannerUrl('')}
                        label="Upload Banner (Header for Category Page)"
                        height="h-48"
                    />
                </section>

                {/* Subcategories Section */}
                <section>
                    <h3 className="font-semibold text-gray-700 mb-4">Subcategory Icons</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {mergedSubcats.map((sub) => (
                            <div key={sub.slug} className="bg-white p-4 rounded-xl border flex flex-col items-center gap-3">
                                <span className="font-medium text-sm text-center min-h-[40px] flex items-center">{sub.name}</span>
                                <ImageUpload
                                    value={sub.iconUrl}
                                    onChange={(url) => saveSubcategoryIcon(sub, url)}
                                    onRemove={() => saveSubcategoryIcon(sub, '')}
                                    label="Icon"
                                    width="w-24"
                                    height="h-24"
                                    className="rounded-full"
                                />
                            </div>
                        ))}
                    </div>
                    {mergedSubcats.length === 0 && (
                        <div className="text-center p-8 bg-gray-50 rounded-xl">
                            No subcategories defined for this category in constants.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
