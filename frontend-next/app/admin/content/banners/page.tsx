'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { ImageUpload } from '../_components/ImageUpload';

interface Banner {
    _id: string;
    imageUrl: string;
    redirectUrl: string;
    position: number;
    isActive: boolean;
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBannerImage, setNewBannerImage] = useState('');
    const [newBannerLink, setNewBannerLink] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/content/banners', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Assuming simple JWT in Update
            });
            setBanners(res.data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
            // alert('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newBannerImage) return alert('Please upload an image');

        try {
            await axios.post('/api/admin/content/banners', {
                imageUrl: newBannerImage,
                redirectUrl: newBannerLink
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNewBannerImage('');
            setNewBannerLink('');
            setIsAdding(false);
            fetchBanners();
        } catch (error) {
            console.error(error);
            alert('Failed to add banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/admin/content/banners/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchBanners();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const handleUpdate = async (id: string, data: Partial<Banner>) => {
        try {
            await axios.put(`/api/admin/content/banners/${id}`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchBanners();
        } catch (error) {
            alert('Failed to update');
        }
    };

    // Simple Reorder via Position updates (Swap positions)
    const moveBanner = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= banners.length) return;

        const currentBanner = banners[index];
        const targetBanner = banners[targetIndex];

        // Optimistic update
        const newBanners = [...banners];
        newBanners[index] = targetBanner;
        newBanners[targetIndex] = currentBanner;
        setBanners(newBanners);

        try {
            // Swap positions in DB
            await Promise.all([
                axios.put(`/api/admin/content/banners/${currentBanner._id}`, { position: targetBanner.position }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.put(`/api/admin/content/banners/${targetBanner._id}`, { position: currentBanner.position }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);
            fetchBanners(); // Refresh to ensure sync
        } catch (err) {
            fetchBanners(); // Revert on error
        }
    };

    if (loading && banners.length === 0) return <div className="p-8 text-center text-gray-500">Loading Banners...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Homepage Banners</h2>
                    <p className="text-sm text-gray-500">Manage the main sliding banners on the homepage.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 rounded-lg hover:bg-[#1e5bbf]"
                >
                    <Plus size={18} />
                    Add New Banner
                </button>
            </div>

            {isAdding && (
                <div className="mb-8 p-6 bg-white border border-blue-100 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Add New Banner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Banner Image (Desktop/Mobile)</label>
                            <ImageUpload
                                value={newBannerImage}
                                onChange={setNewBannerImage}
                                onRemove={() => setNewBannerImage('')}
                                height="h-40"
                                label="Upload Banner (1920x600 recommended)"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Redirect URL (Optional)</label>
                                <input
                                    type="text"
                                    value={newBannerLink}
                                    onChange={(e) => setNewBannerLink(e.target.value)}
                                    placeholder="/category/fashion or External Link"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end mt-auto gap-3">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!newBannerImage}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    Save Banner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {banners.map((banner, index) => (
                    <div key={banner._id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-1 pr-2 border-r border-gray-100">
                            <button
                                onClick={() => moveBanner(index, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:text-gray-200"
                            >
                                <ArrowUp size={20} />
                            </button>
                            <span className="text-center text-xs font-mono text-gray-300">{index + 1}</span>
                            <button
                                onClick={() => moveBanner(index, 'down')}
                                disabled={index === banners.length - 1}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:text-gray-200"
                            >
                                <ArrowDown size={20} />
                            </button>
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                            <div className="relative h-32 w-full md:w-80 rounded-lg overflow-hidden border bg-gray-50">
                                <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center gap-2">
                                <ExternalLink size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue={banner.redirectUrl}
                                    onBlur={(e) => handleUpdate(banner._id, { redirectUrl: e.target.value })}
                                    className="flex-1 text-sm border-b border-dashed border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                                    placeholder="No Redirect URL"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={banner.isActive}
                                        onChange={(e) => handleUpdate(banner._id, { isActive: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-600">Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                            <button
                                onClick={() => handleDelete(banner._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Banner"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-500">No banners found. Add one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
