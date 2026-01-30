"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft, Save, Loader2, Image as ImageIcon,
    DollarSign, Package, Tag, Type, FileText, Plus,
    Trash2, Layers, Settings, Grid, Check, AlertCircle, X, Globe
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchProductById, createProduct, updateProduct } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';

// Types for local state
interface VariantOption {
    id: string;
    name: string; // e.g., "Red", "XL"
    image?: string; // Specific image for this variant option
}

interface VariantGroup {
    id: string;
    name: string; // e.g., "Color", "Size"
    options: VariantOption[];
}

interface MatrixRow {
    id: string;
    combination: string; // "Red / XL"
    sku: string;
    stock: number;
    price: number;
    isDefault: boolean;
    image: string;
}

export const AdminProductEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { addToast } = useToast();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    // --- Legacy Fields ---
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        category: 'Mobiles',
        countInStock: '',
        description: '',
        isFeatured: false
    });

    // --- New Advanced Fields (UI Only for now) ---
    const [gallery, setGallery] = useState<string[]>([]);
    const [specifications, setSpecifications] = useState('');
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
    const [matrix, setMatrix] = useState<MatrixRow[]>([]);
    const [skuBase, setSkuBase] = useState('');

    useEffect(() => {
        if (isEditMode) {
            loadProduct(id);
        }
    }, [id]);

    // --- Matrix Generation Logic ---
    useEffect(() => {
        if (variantGroups.length === 0) {
            setMatrix([]);
            return;
        }
        generateMatrix();
    }, [variantGroups]);

    const generateMatrix = () => {
        // Simple Cartesian Helper
        const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

        const optionsArrays = variantGroups.map(g => g.options.map(o => o.name));
        if (optionsArrays.length === 0 || optionsArrays.some(arr => arr.length === 0)) return;

        // If only one group, cartesian needs array wrapping
        const combinations = variantGroups.length === 1
            ? optionsArrays[0].map(o => [o])
            : cartesian(...optionsArrays);

        const newMatrix: MatrixRow[] = combinations.map((combo: string[], idx: number) => {
            const comboStr = combo.join(' / ');
            const existing = matrix.find(r => r.combination === comboStr);

            // Try to smart generate SKU
            const smartSku = skuBase ? `${skuBase}-${combo.map(s => s.substring(0, 2).toUpperCase()).join('-')}` : `SKU-${Math.floor(Math.random() * 10000)}`;

            return existing || {
                id: Date.now() + idx + '',
                combination: comboStr,
                sku: smartSku,
                stock: 0,
                price: Number(formData.price) || 0,
                isDefault: idx === 0,
                image: formData.image || '' // Default to main image
            };
        });

        setMatrix(newMatrix);
    };

    // --- Load Data ---
    const loadProduct = async (productId: string) => {
        try {
            const { data } = await fetchProductById(productId);
            setFormData({
                name: data.name,
                price: data.price,
                image: data.image,
                category: data.category,
                countInStock: data.countInStock || 0,
                description: data.description || '',
                isFeatured: data.isFeatured || false
            });
            // Try to extract rich data from description if we packed it there previously
            // For now, we just leave new fields empty as backend doesn't support them
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

    // --- Variant Builders ---
    const addVariantGroup = (type: string = 'Color') => {
        setVariantGroups(prev => [...prev, {
            id: Date.now().toString(),
            name: type,
            options: []
        }]);
    };

    const removeVariantGroup = (groupId: string) => {
        setVariantGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const addOptionToGroup = (groupId: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    options: [...g.options, { id: Date.now().toString(), name: 'New Option' }]
                };
            }
            return g;
        }));
    };

    const updateOptionName = (groupId: string, optionId: string, val: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    options: g.options.map(o => o.id === optionId ? { ...o, name: val } : o)
                };
            }
            return g;
        }));
    };

    const removeOption = (groupId: string, optionId: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return { ...g, options: g.options.filter(o => o.id !== optionId) };
            }
            return g;
        }));
    };

    // --- Handlers ---
    const handleGalleryAdd = () => {
        if (gallery.length < 6) setGallery([...gallery, '']);
    };

    const handleGalleryChange = (idx: number, val: string) => {
        const newG = [...gallery];
        newG[idx] = val;
        setGallery(newG);
    };

    const handleMatrixUpdate = (id: string, field: keyof MatrixRow, value: any) => {
        setMatrix(prev => prev.map(row => {
            if (row.id === id) return { ...row, [field]: value };
            if (field === 'isDefault' && value === true) return { ...row, isDefault: row.id === id }; // Ensure single default
            return row;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Intelligent Mapping:
            // 1. If matrix exists, Total Stock = Sum of matrix stocks
            const totalMatrixStock = matrix.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
            const finalStock = matrix.length > 0 ? totalMatrixStock : Number(formData.countInStock);

            // 2. Default Price = Price of Default Variant or Form Price
            const defaultVariant = matrix.find(m => m.isDefault);
            const finalPrice = defaultVariant ? defaultVariant.price : Number(formData.price);

            // 3. Serialize extra data into Description (Hack for backend compatibility)
            // We append a hidden JSON block at the end of description
            const richData = {
                sku: skuBase,
                gallery,
                specifications,
                variants: variantGroups,
                matrix
            };

            // Note: In a real migration, we would adapt the API. 
            // Here we just save the core fields required for the store to function.

            const payload = {
                ...formData,
                price: finalPrice,
                countInStock: finalStock,
                // We keep description clean for now as requested, not dirtying it with JSON unless explicitly asked.
                // description: formData.description + `\n<!-- METADATA: ${JSON.stringify(richData)} -->` 
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
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products" className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                                {isEditMode ? 'Updating Catalog Item' : 'Creating Catalog Item'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-[#2874F0] hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEditMode ? 'Save Changes' : 'Publish Product'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1400px] mx-auto w-full">
                    <form className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN - MAIN CONTENT */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">

                            {/* 1. IMAGES SECTION */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <ImageIcon size={18} className="text-[#2874F0]" /> Product Media
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Main Image */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Main Image (Cover)</label>
                                        <div className="aspect-[4/5] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group hover:border-[#2874F0]/50 transition-colors">
                                            {formData.image ? (
                                                <img src={formData.image} alt="Main" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                                                    <p className="text-[10px] text-gray-400">Paste URL below</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="mt-3 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#2874F0]"
                                        />
                                    </div>

                                    {/* Gallery Grid */}
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-500">Gallery ({gallery.filter(Boolean).length}/6)</label>
                                            <button type="button" onClick={handleGalleryAdd} className="text-[10px] text-[#2874F0] font-bold hover:underline">+ Add URL</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[...Array(6)].map((_, idx) => (
                                                <div key={idx} className="aspect-square rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                                                    {gallery[idx] ? (
                                                        <>
                                                            <img src={gallery[idx]} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button type="button" onClick={() => handleGalleryChange(idx, '')} className="p-1 bg-white rounded-full text-red-500"><Trash2 size={12} /></button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">{idx + 1}</span>
                                                    )}
                                                    {gallery[idx] !== undefined && (
                                                        <input
                                                            type="text"
                                                            value={gallery[idx]}
                                                            onChange={(e) => handleGalleryChange(idx, e.target.value)}
                                                            className="absolute bottom-0 left-0 w-full text-[10px] p-1 bg-white/90 border-t border-gray-100 outline-none"
                                                            placeholder="URL..."
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. CORE DETAILS */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Tag size={18} className="text-[#2874F0]" /> Core Details
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                                placeholder="e.g. Premium Cotton T-Shirt"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Price (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#2874F0]"
                                            >
                                                <option>Mobiles</option>
                                                <option>Electronics</option>
                                                <option>Fashion</option>
                                                <option>Home</option>
                                                <option>Beauty</option>
                                                <option>Sports</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">SKU (Stock Keeping Unit)</label>
                                            <input
                                                type="text"
                                                value={skuBase}
                                                onChange={(e) => setSkuBase(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:border-[#2874F0] outline-none"
                                                placeholder="FZK-ITEM-001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Base Stock</label>
                                            <input
                                                type="number"
                                                name="countInStock"
                                                value={formData.countInStock}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#2874F0]"
                                            placeholder="Product description..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Specifications</label>
                                        <textarea
                                            value={specifications}
                                            onChange={(e) => setSpecifications(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-600 outline-none focus:border-[#2874F0]"
                                            placeholder="Key: Value&#10;Material: Cotton&#10;Weight: 200g"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. VARIANTS & MATRIX */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <Layers size={18} className="text-[#2874F0]" /> Variants & Options
                                    </h2>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => addVariantGroup('Size')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">+ Size Group</button>
                                        <button type="button" onClick={() => addVariantGroup('Color')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">+ Color Group</button>
                                    </div>
                                </div>

                                {variantGroups.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl mb-6">
                                        <Layers size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400 font-medium">No variants added. Product is single-SKU.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 mb-8">
                                        {variantGroups.map((group) => (
                                            <div key={group.id} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl relative">
                                                <button onClick={() => removeVariantGroup(group.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><X size={16} /></button>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="w-32">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Group Name</label>
                                                        <input
                                                            type="text"
                                                            value={group.name}
                                                            // @ts-ignore
                                                            readOnly
                                                            className="w-full font-bold text-gray-800 bg-transparent border-none outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap gap-2">
                                                            {group.options.map(opt => (
                                                                <div key={opt.id} className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                                                                    <input
                                                                        type="text"
                                                                        value={opt.name}
                                                                        onChange={(e) => updateOptionName(group.id, opt.id, e.target.value)}
                                                                        className="w-20 text-xs font-medium outline-none"
                                                                    />
                                                                    <button onClick={() => removeOption(group.id, opt.id)} className="ml-2 text-gray-400 hover:text-red-500"><X size={12} /></button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => addOptionToGroup(group.id)} className="px-3 py-1 rounded-lg border border-dashed border-blue-300 text-blue-500 text-xs font-bold hover:bg-blue-50">+ Opt</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* MATRIX TABLE */}
                                {matrix.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Inventory Matrix</h3>
                                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-500">Variant</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-500">SKU</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-500">Price</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-500">Stock</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 text-center">Default</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {matrix.map((row) => (
                                                        <tr key={row.id} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                                                    {row.image ? <img src={row.image} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="m-2 text-gray-300" />}
                                                                </div>
                                                                {row.combination}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={row.sku}
                                                                    onChange={(e) => handleMatrixUpdate(row.id, 'sku', e.target.value)}
                                                                    className="w-32 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none font-mono text-xs"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    value={row.price}
                                                                    onChange={(e) => handleMatrixUpdate(row.id, 'price', Number(e.target.value))}
                                                                    className="w-20 bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500 text-xs"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    value={row.stock}
                                                                    onChange={(e) => handleMatrixUpdate(row.id, 'stock', Number(e.target.value))}
                                                                    className={`w-20 bg-transparent border rounded px-2 py-1 outline-none text-xs font-bold ${row.stock > 0 ? 'border-gray-200' : 'border-red-200 bg-red-50 text-red-600'}`}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name="default_variant"
                                                                    checked={row.isDefault}
                                                                    onChange={(e) => handleMatrixUpdate(row.id, 'isDefault', e.target.checked)}
                                                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN - SETTINGS */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">

                            {/* PUBLISH STATUS */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Globe size={18} className="text-green-500" /> Visibility
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Grid size={16} /></div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Featured</p>
                                                <p className="text-[10px] text-gray-400">Show on Homepage</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleChange}
                                            className="w-5 h-5 accent-[#2874F0] cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Check size={16} /></div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Active</p>
                                                <p className="text-[10px] text-gray-400">Visible to customers</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            readOnly
                                            className="w-5 h-5 accent-green-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SUMMARY */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Settings size={18} className="text-gray-500" /> Summary
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Variants</span>
                                        <span className="font-bold text-gray-800">{matrix.length} SKUs</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Total Stock</span>
                                        <span className="font-bold text-gray-800">
                                            {matrix.length > 0
                                                ? matrix.reduce((acc, c) => acc + c.stock, 0)
                                                : formData.countInStock}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs flex gap-2">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>
                                                <b>Note:</b> Advanced variant data is managed on frontend. Backend syncs Price & Stock.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
