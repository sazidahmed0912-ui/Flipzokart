"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';;
import {
    ChevronLeft, Save, Loader2, Image as ImageIcon,
    DollarSign, Package, Tag, Type, FileText
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchProductById, createProduct, updateProduct } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';

export const AdminProductEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { addToast } = useToast();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        category: 'Electronics', // Default
        countInStock: '',
        description: '',
        isFeatured: false
    });

    useEffect(() => {
        if (isEditMode) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        try {
            const { data } = await fetchProductById(productId);
            setFormData({
                name: data.name,
                price: data.price,
                image: data.image,
                category: data.category,
                countInStock: data.countInStock,
                description: data.description || '',
                isFeatured: data.isFeatured || false
            });
        } catch (error) {
            console.error("Failed to load product", error);
            addToast('error', 'Failed to load product details');
            router.push('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                countInStock: Number(formData.countInStock)
            };

            if (isEditMode) {
                await updateProduct(id, payload);
                addToast('success', 'Product updated successfully');
            } else {
                await createProduct(payload);
                addToast('success', 'Product created successfully');
            }
            router.push('/admin/products');
        } catch (error) {
            console.error("Save failed", error);
            addToast('error', `Failed to ${isEditMode ? 'update' : 'create'} product`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CircularGlassSpinner />;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                        <p className="text-xs text-gray-500">{isEditMode ? `ID: ${id}` : 'Create a new item for your catalog'}</p>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-[#2874F0]" /> Basic Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Product Name</label>
                                        <div className="relative">
                                            <Type size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                                placeholder="e.g. Wireless Headphones"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder="Enter product description..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <DollarSign size={18} className="text-[#2874F0]" /> Pricing
                                    </h2>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Package size={18} className="text-[#2874F0]" /> Inventory
                                    </h2>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Count In Stock</label>
                                        <input
                                            type="number"
                                            name="countInStock"
                                            value={formData.countInStock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Media & Organization */}
                        <div className="space-y-6">
                            {/* Image */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ImageIcon size={18} className="text-[#2874F0]" /> Product Image
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-xs text-gray-400">Image Preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Tag size={18} className="text-[#2874F0]" /> Organization
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all cursor-pointer"
                                        >
                                            <option>Electronics</option>
                                            <option>Fashion</option>
                                            <option>Home</option>
                                            <option>Beauty</option>
                                            <option>Sports</option>
                                            <option>Groceries</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                id="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleChange}
                                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                style={{
                                                    right: formData.isFeatured ? '0' : '50%',
                                                    borderColor: formData.isFeatured ? '#2874F0' : '#E5E7EB'
                                                }}
                                            />
                                            <label
                                                htmlFor="isFeatured"
                                                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.isFeatured ? 'bg-[#2874F0]' : 'bg-gray-300'}`}
                                            ></label>
                                        </div>
                                        <div>
                                            <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer block">
                                                Featured Product
                                            </label>
                                            <p className="text-xs text-gray-500">Show in "Featured on Fzokart"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3.5 bg-[#2874F0] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isEditMode ? 'Update Product' : 'Create Product'}
                                </button>

                                <Link href="/admin/products"
                                    className="w-full py-3.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
