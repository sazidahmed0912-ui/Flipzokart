'use client';

import React, { useState, useEffect } from 'react';
import API from '@/app/services/api';
import { Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageUpload } from '../_components/ImageUpload';
import { CATEGORIES } from '@/app/constants'; // Use centralized constants for dropdowns

interface HomeCategory {
    _id: string;
    categoryName: string;
    iconUrl: string;
    redirectUrl: string;
    position: number;
    isActive: boolean;
}

export default function HomeCategoriesPage() {
    const [categories, setCategories] = useState<HomeCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // New Item State
    const [isAdding, setIsAdding] = useState(false);
    const [newIcon, setNewIcon] = useState('');
    const [newName, setNewName] = useState('');
    const [newLink, setNewLink] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Unified Admin Content API
            const res = await API.get('/api/content/admin/all');
            setCategories(res.data.homepageCategories || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newIcon || !newName) return alert('Please provide name and icon');

        try {
            await API.post('/api/content/admin/home-categories', {
                categoryName: newName,
                iconUrl: newIcon,
                redirectUrl: newLink
            });

            setNewIcon('');
            setNewName('');
            setNewLink('');
            setIsAdding(false);
            fetchCategories();
        } catch (error) {
            alert('Failed to add category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await API.delete(`/api/content/admin/home-categories/${id}`);
            fetchCategories();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const moveCategory = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= categories.length) return;

        const current = categories[index];
        const target = categories[targetIndex];

        const newItems = [...categories];
        newItems[index] = target;
        newItems[targetIndex] = current;
        setCategories(newItems);

        try {
            await Promise.all([
                API.put(`/api/content/admin/home-categories/${current._id}`, { position: target.position }),
                API.put(`/api/content/admin/home-categories/${target._id}`, { position: current.position })
            ]);
            fetchCategories();
        } catch (err) {
            fetchCategories();
        }
    };

    if (loading && categories.length === 0) return <div className="p-8 text-center text-gray-500">Loading Categories...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Home Categories</h2>
                    <p className="text-sm text-gray-500">Manage the 'Shop By Category' icons on the homepage.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 rounded-lg hover:bg-[#1e5bbf]"
                >
                    <Plus size={18} />
                    Add New Icon
                </button>
            </div>

            {isAdding && (
                <div className="mb-8 p-6 bg-white border border-blue-100 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Add Category Icon</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Name Input */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Category Name</label>
                                <input
                                    list="category-suggestions"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Mobiles"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <datalist id="category-suggestions">
                                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Redirect URL (Optional)</label>
                                <input
                                    type="text"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    placeholder="Auto-generated if empty"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* 2. Icon Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Icon Image (Square 512x512)</label>
                            <div className="flex gap-4 items-start">
                                <ImageUpload
                                    value={newIcon}
                                    onChange={setNewIcon}
                                    onRemove={() => setNewIcon('')}
                                    height="h-32"
                                    width="w-32"
                                    label="Upload Icon"
                                />
                                <div className="flex-1 flex flex-col justify-end h-32 pb-2">
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setIsAdding(false)}
                                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAdd}
                                            disabled={!newIcon || !newName}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Save Icon
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, index) => (
                    <div key={cat._id} className="bg-white border rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow relative group">

                        {/* Order Controls */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveCategory(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowUp size={14} /></button>
                            <button onClick={() => moveCategory(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowDown size={14} /></button>
                        </div>

                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center p-2 border border-gray-100">
                            <img src={cat.iconUrl} alt={cat.categoryName} className="max-w-full max-h-full object-contain" />
                        </div>

                        <div className="text-center w-full">
                            <h4 className="font-bold text-gray-800">{cat.categoryName}</h4>
                            <p className="text-xs text-gray-400 truncate w-full px-2" title={cat.redirectUrl}>{cat.redirectUrl || 'Auto-Redirect'}</p>
                        </div>

                        <button
                            onClick={() => handleDelete(cat._id)}
                            className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
