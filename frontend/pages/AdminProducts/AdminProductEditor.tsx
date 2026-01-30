import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft, Save, Loader2, Image as ImageIcon,
    DollarSign, Package, Tag, Type, FileText, Percent
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import CircularGlassSpinner from '../../components/CircularGlassSpinner';
import { fetchProductById, createProduct, updateProduct } from '../../services/adminService';
import { useToast } from '../../components/toast';
import { CATEGORIES } from '../../constants';

export const AdminProductEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '', // This will be the Sale Price
        originalPrice: '', // This is the MRP
        image: '',
        category: 'Electronics', // Default
        countInStock: '',
        description: '',
        specifications: '',
        isFeatured: false
    });

    const [discount, setDiscount] = useState<number>(0);

    useEffect(() => {
        console.log("Admin Product Version: v2.6 - Specifications Added");
        if (isEditMode) {
            loadProduct(id);
        }
    }, [id]);

    // Calculate discount whenever price or originalPrice changes
    useEffect(() => {
        const sale = parseFloat(formData.price) || 0;
        const original = parseFloat(formData.originalPrice) || 0;

        if (original > 0 && sale > 0 && original >= sale) {
            const calculatedDiscount = Math.round(((original - sale) / original) * 100);
            setDiscount(calculatedDiscount);
        } else {
            setDiscount(0);
        }
    }, [formData.price, formData.originalPrice]);

    const loadProduct = async (productId: string) => {
        try {
            const { data } = await fetchProductById(productId);
            setFormData({
                name: data.name,
                price: data.price,
                originalPrice: data.originalPrice || '',
                image: data.image,
                category: data.category,
                countInStock: data.countInStock,
                description: data.description || '',
                specifications: data.specifications || '',
                isFeatured: data.isFeatured || false
            });
        } catch (error) {
            console.error("Failed to load product", error);
            addToast('error', 'Failed to load product details');
            navigate('/admin/products');
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
            // Logic: If Sale Price is empty, use Original Price as Sale Price (0% discount)
            let finalSalePrice = formData.price ? Number(formData.price) : Number(formData.originalPrice);
            const finalOriginalPrice = Number(formData.originalPrice);

            if (!finalOriginalPrice || finalOriginalPrice <= 0) {
                addToast('error', 'Original Price (MRP) is required');
                setSaving(false);
                return;
            }

            if (finalSalePrice > finalOriginalPrice) {
                addToast('error', 'Sale Price cannot be greater than Original Price');
                setSaving(false);
                return;
            }

            // If user cleared sale price, finalSalePrice became originalPrice.
            // But we should send it as 'price'.

            const payload = {
                ...formData,
                price: finalSalePrice,
                originalPrice: finalOriginalPrice,
                countInStock: Number(formData.countInStock)
            };

            if (isEditMode) {
                await updateProduct(id, payload);
                addToast('success', 'Product updated successfully');
            } else {
                await createProduct(payload);
                addToast('success', 'Product created successfully');
            }
            navigate('/admin/products');
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
                    <Link to="/admin/products" className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'} <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-2">v2.6</span></h1>
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

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Specifications</label>
                                        <textarea
                                            name="specifications"
                                            value={formData.specifications}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder={`Material: Cotton\nSize: Large\nBattery: 5000mAh`}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Enter key-value pairs (one per line)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-[#2874F0]" /> Pricing & Inventory
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Original Price (MRP)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Sale Price (Discounted Price)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder={formData.originalPrice ? formData.originalPrice.toString() : "800"}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Leave empty to use MRP (No Discount)</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Discount</label>
                                    <div className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1 border ${discount > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                        <Percent size={14} />
                                        {discount}% OFF
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Count In Stock</label>
                                    <div className="relative">
                                        <Package size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            name="countInStock"
                                            value={formData.countInStock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            placeholder="100"
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
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
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

                                <Link
                                    to="/admin/products"
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
