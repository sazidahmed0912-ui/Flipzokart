'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink, RefreshCw, Type, Image as ImageIcon, GripVertical, Check, Filter } from 'lucide-react';
import { ImageUpload } from '../_components/ImageUpload';
import { Reorder, motion } from 'framer-motion';

interface Banner {
    _id: string;
    imageUrl: string;
    mobileImageUrl?: string;
    redirectUrl: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    position: number;
    isActive: boolean;
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');

    // Form State
    const [newBannerImage, setNewBannerImage] = useState('');
    const [newBannerMobileImage, setNewBannerMobileImage] = useState('');
    const [newBannerLink, setNewBannerLink] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newSubtitle, setNewSubtitle] = useState('');
    const [newCta, setNewCta] = useState('Shop Now');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/content/banners', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBanners(res.data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportDefaults = async () => {
        try {
            setImporting(true);
            await axios.post('/api/admin/content/banners/seed', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Default banners imported successfully!');
            fetchBanners();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to import banners');
        } finally {
            setImporting(false);
        }
    };

    const handleAdd = async () => {
        if (!newBannerImage) return alert('Please upload a desktop banner image');

        try {
            await axios.post('/api/admin/content/banners', {
                imageUrl: newBannerImage,
                mobileImageUrl: newBannerMobileImage || newBannerImage,
                redirectUrl: newBannerLink,
                title: newTitle,
                subtitle: newSubtitle,
                ctaText: newCta
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNewBannerImage('');
            setNewBannerMobileImage('');
            setNewBannerLink('');
            setNewTitle('');
            setNewSubtitle('');
            setNewCta('Shop Now');
            setIsAdding(false);
            fetchBanners();
        } catch (error) {
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
            // Update local state without full refetch if possible for smoother toggle
            setBanners(prev => prev.map(b => b._id === id ? { ...b, ...data } : b));
        } catch (error) {
            alert('Failed to update');
        }
    };

    // Reorder Logic
    const handleReorder = async (newOrder: Banner[]) => {
        setBanners(newOrder); // Optimistic Update

        try {
            await axios.put('/api/admin/content/banners/reorder', {
                orderedIds: newOrder.map(b => b._id)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (error) {
            console.error("Reorder failed", error);
            fetchBanners(); // Revert
        }
    };

    const filteredBanners = banners.filter(b => {
        if (filterStatus === 'active') return b.isActive;
        if (filterStatus === 'disabled') return !b.isActive;
        return true;
    });

    if (loading && banners.length === 0) return <div className="p-8 text-center text-gray-500">Loading Banners...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Homepage Banners</h2>
                    <p className="text-sm text-gray-500">Manage main sliding banners.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filters */}
                    <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden mr-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-2 text-xs font-bold ${filterStatus === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-2 text-xs font-bold ${filterStatus === 'active' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            ACTIVE
                        </button>
                        <button
                            onClick={() => setFilterStatus('disabled')}
                            className={`px-3 py-2 text-xs font-bold ${filterStatus === 'disabled' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            DISABLED
                        </button>
                    </div>

                    {banners.length === 0 && (
                        <button
                            onClick={handleImportDefaults}
                            disabled={importing}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                        >
                            <RefreshCw size={18} className={importing ? 'animate-spin' : ''} />
                            {importing ? 'Importing...' : 'Import Defaults'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 rounded-lg hover:bg-[#1e5bbf] shadow-sm"
                    >
                        <Plus size={18} />
                        Add New
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-8 p-6 bg-white border border-blue-100 rounded-xl shadow-md animate-in slide-in-from-top-4 fade-in">
                    <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-blue-500" /> New Banner Details
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Images */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <ImageIcon size={16} /> Desktop Image (Required)
                                </label>
                                <ImageUpload
                                    value={newBannerImage}
                                    onChange={setNewBannerImage}
                                    onRemove={() => setNewBannerImage('')}
                                    height="h-40"
                                    label="Upload Desktop Banner (1920x600)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <ImageIcon size={16} /> Mobile Image (Optional)
                                </label>
                                <ImageUpload
                                    value={newBannerMobileImage}
                                    onChange={setNewBannerMobileImage}
                                    onRemove={() => setNewBannerMobileImage('')}
                                    height="h-40"
                                    label="Upload Mobile Banner (800x800)"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Overlay</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Big Summer Sale"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={newSubtitle}
                                    onChange={(e) => setNewSubtitle(e.target.value)}
                                    placeholder="e.g. Up to 50% Off"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={newCta}
                                        onChange={(e) => setNewCta(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                    <input
                                        type="text"
                                        value={newBannerLink}
                                        onChange={(e) => setNewBannerLink(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-auto gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!newBannerImage}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="space-y-4">
                {filteredBanners.map((banner, index) => (
                    <Reorder.Item key={banner._id} value={banner} className="relative">
                        <div className={`bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start shadow-sm hover:shadow-md transition-shadow group ${!banner.isActive ? 'opacity-70 bg-gray-50' : ''}`}>

                            {/* Drag Handle & Position */}
                            <div className="flex flex-col gap-1 pr-2 border-r border-gray-100 self-stretch justify-center items-center w-12 -ml-4 -my-4 pl-4 cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-l-xl transition-colors">
                                <GripVertical size={20} className="text-gray-300 group-hover:text-gray-500" />
                                <span className="text-xs font-bold text-gray-400 font-mono mt-1">#{index + 1}</span>
                            </div>

                            {/* Image Preview */}
                            <div className="flex-shrink-0 w-full md:w-56 space-y-2">
                                <div className="relative h-24 w-full rounded-lg overflow-hidden border bg-gray-100">
                                    <img src={banner.imageUrl} alt="Desktop" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* Editable Content */}
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                                    <input
                                        type="text"
                                        defaultValue={banner.title}
                                        onBlur={(e) => handleUpdate(banner._id, { title: e.target.value })}
                                        className="w-full text-sm font-bold text-gray-800 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-400"
                                        placeholder="No Title"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Redirect URL</label>
                                    <input
                                        type="text"
                                        defaultValue={banner.redirectUrl}
                                        onBlur={(e) => handleUpdate(banner._id, { redirectUrl: e.target.value })}
                                        className="w-full text-sm text-blue-600 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-400"
                                        placeholder="No Link"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle</label>
                                    <input
                                        type="text"
                                        defaultValue={banner.subtitle}
                                        onBlur={(e) => handleUpdate(banner._id, { subtitle: e.target.value })}
                                        className="w-full text-sm text-gray-600 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-400"
                                        placeholder="No Subtitle"
                                    />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 h-full pl-4 md:border-l border-gray-100">
                                <label className="cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={banner.isActive}
                                        onChange={(e) => handleUpdate(banner._id, { isActive: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${banner.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                        {banner.isActive ? 'ACTIVE' : 'DISABLED'}
                                    </div>
                                </label>

                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {banners.length === 0 && !loading && (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No banners found</h3>
                    <p className="text-gray-500 mb-6">Import default banners or add a new one.</p>
                    <button
                        onClick={handleImportDefaults}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 shadow-sm font-medium"
                    >
                        Import Live Banners
                    </button>
                </div>
            )}
        </div>
    );
}
