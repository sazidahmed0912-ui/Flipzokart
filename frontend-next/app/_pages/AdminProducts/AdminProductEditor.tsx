"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft, Save, Loader2, Image as ImageIcon,
    DollarSign, Package, Tag, Layers, Settings, Grid, Check, AlertCircle, X, Globe,
    Plus, Trash2, RefreshCw, Palette, Ruler, LayoutTemplate, UploadCloud
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchProductById, createProduct, updateProduct, uploadFile } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';
import { CATEGORIES } from '@/app/constants';

// --- Types ---
interface VariantOption {
    id: string;
    name: string; // e.g., "Red", "XL"
    image?: string; // Specific image for this variant option
    color?: string; // HEX Code for color options
}

interface VariantGroup {
    id: string;
    name: string; // e.g., "Color", "Size"
    options: VariantOption[];
}

interface MatrixRow {
    id: string;
    combination: string; // "Jet Black / S"
    sku: string;
    stock: number;
    price: number;
    isDefault: boolean;
    image: string;
    variantIds: string[]; // IDs of options making this combo
}

export const AdminProductEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { addToast } = useToast();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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

    // --- New Advanced Fields ---
    const [gallery, setGallery] = useState<string[]>([]);
    const [specifications, setSpecifications] = useState('');
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
    const [matrix, setMatrix] = useState<MatrixRow[]>([]);
    const [skuBase, setSkuBase] = useState('FZK');
    const [defaultColor, setDefaultColor] = useState<string>(''); // ID of the default color option

    // --- Section / Organization Headers ---
    const [sectionTitle, setSectionTitle] = useState('');
    const [sectionColor, setSectionColor] = useState('#111827');
    const [sectionSize, setSectionSize] = useState('text-xl');

    // --- Derived State for UI ---
    const colorGroup = variantGroups.find(g => g.name.toLowerCase() === 'color');

    useEffect(() => {
        if (isEditMode) {
            loadProduct(id);
        }
    }, [id]);

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

            if (data.description && data.description.includes('<!-- METADATA:')) {
                try {
                    const jsonStr = data.description.split('<!-- METADATA:')[1].split('-->')[0];
                    const meta = JSON.parse(jsonStr);
                    if (meta.gallery) setGallery(meta.gallery);
                    if (meta.specifications) setSpecifications(meta.specifications);
                    if (meta.variants) setVariantGroups(meta.variants);
                    if (meta.matrix) setMatrix(meta.matrix);
                    if (meta.sku) setSkuBase(meta.sku);

                    if (meta.section) {
                        setSectionTitle(meta.section.title || '');
                        setSectionColor(meta.section.color || '#111827');
                        setSectionSize(meta.section.size || 'text-xl');
                    }
                } catch (e) { console.error("Failed to parse metadata", e); }
            }

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

    // --- File Upload Handler ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const { data } = await uploadFile(uploadData);
            // Assuming the backend returns the path directly or in an object
            // Adjust based on your actual backend response. 
            // My previous implementation returns the plain path string e.g. "/uploads/file.jpg"
            onSuccess(data);
            addToast('success', 'Image uploaded successfully');
        } catch (error) {
            console.error(error);
            addToast('error', 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // --- Matrix Generation & Sync Logic ---
    const syncMatrix = () => {
        if (variantGroups.length === 0 || variantGroups.some(g => g.options.length === 0)) {
            return;
        }

        const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
        const groupOptions = variantGroups.map(g => g.options);

        let combinations: VariantOption[][] = [];
        if (groupOptions.length === 1) {
            combinations = groupOptions[0].map(o => [o]);
        } else {
            combinations = cartesian(...groupOptions);
        }

        const newMatrix: MatrixRow[] = combinations.map((comboOpts, idx) => {
            const comboNames = comboOpts.map(o => o.name).join('/');
            const comboIds = comboOpts.map(o => o.id);
            const existing = matrix.find(r => r.combination === comboNames);

            const skuSuffix = comboOpts.map(o => o.name.substring(0, 2).toUpperCase()).join('-');
            const randomId = Math.floor(100 + Math.random() * 900);
            const smartSku = existing?.sku || `${skuBase}-${skuSuffix}-${randomId}`;

            const colorOpt = comboOpts.find(o => variantGroups.find(g => g.name.toLowerCase() === 'color')?.options.find(co => co.id === o.id));
            const comboImage = colorOpt?.image || existing?.image || formData.image || '';

            return {
                id: existing?.id || Date.now() + idx + '',
                combination: comboNames,
                sku: smartSku,
                stock: existing ? existing.stock : 0,
                price: existing ? existing.price : (Number(formData.price) || 0),
                isDefault: existing ? existing.isDefault : (idx === 0),
                image: comboImage,
                variantIds: comboIds
            };
        });

        setMatrix(newMatrix);
        addToast('success', 'Inventory Matrix Synced');
    };

    // --- Variant Management ---
    const addPresetGroup = (type: 'Size' | 'Color') => {
        if (variantGroups.find(g => g.name === type)) return addToast('error', `${type} group exists`);
        let options: VariantOption[] = [];
        if (type === 'Size') options = ['S', 'M', 'L', 'XL'].map(n => ({ id: Date.now() + Math.random().toString(), name: n }));
        if (type === 'Color') options = [
            { name: 'Jet Black', color: '#000000' },
            { name: 'Arctic White', color: '#FFFFFF' },
            { name: 'Royal Blue', color: '#2563EB' },
            { name: 'Deep Red', color: '#DC2626' }
        ].map(n => ({ id: Date.now() + Math.random().toString(), name: n.name, color: n.color }));

        setVariantGroups(prev => [...prev, { id: Date.now().toString(), name: type, options }]);
    };

    const addCustomGroup = () => {
        setVariantGroups(prev => [...prev, { id: Date.now().toString(), name: 'New Group', options: [] }]);
    };

    const removeGroup = (id: string) => setVariantGroups(prev => prev.filter(g => g.id !== id));
    const updateGroupName = (id: string, name: string) => setVariantGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g));

    const addOption = (groupId: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) return { ...g, options: [...g.options, { id: Date.now() + Math.random().toString(), name: 'New Option', color: '#333333' }] };
            return g;
        }));
    };

    const updateOption = (groupId: string, optionId: string, field: keyof VariantOption, val: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) return { ...g, options: g.options.map(o => o.id === optionId ? { ...o, [field]: val } : o) };
            return g;
        }));
    };

    const removeOption = (groupId: string, optionId: string) => {
        setVariantGroups(prev => prev.map(g => {
            if (g.id === groupId) return { ...g, options: g.options.filter(o => o.id !== optionId) };
            return g;
        }));
    };

    // --- Gallery ---
    const handleGalleryChange = (idx: number, val: string) => { const newG = [...gallery]; newG[idx] = val; setGallery(newG); };

    // --- Matrix Updates ---
    const handleMatrixUpdate = (id: string, field: keyof MatrixRow, value: any) => {
        setMatrix(prev => prev.map(row => {
            if (row.id === id) return { ...row, [field]: value };
            if (field === 'isDefault' && value === true) return { ...row, isDefault: row.id === id };
            return row;
        }));
    };

    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const totalStock = matrix.length > 0 ? matrix.reduce((acc, c) => acc + c.stock, 0) : Number(formData.countInStock);
            const defaultVar = matrix.find(m => m.isDefault);
            const finalPrice = defaultVar ? defaultVar.price : Number(formData.price);

            const richData = {
                sku: skuBase, gallery, specifications, variants: variantGroups, matrix,
                section: { title: sectionTitle, color: sectionColor, size: sectionSize }
            };
            const payload = {
                ...formData,
                price: finalPrice,
                countInStock: totalStock,
                description: formData.description + `\n<!-- METADATA:${JSON.stringify(richData)}-->`
            };

            if (isEditMode) await updateProduct(id, payload);
            else await createProduct(payload);

            addToast('success', isEditMode ? 'Product Updated' : 'Product Created');
            router.push('/admin/products');
        } catch (error) {
            addToast('error', 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CircularGlassSpinner />;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products" className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-colors"><ChevronLeft size={20} /></Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'} <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-2">v2.6</span></h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{isEditMode ? 'Updating Catalog Item' : 'Creating Catalog Item'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/admin/products')} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={saving || uploading} className="px-6 py-2 text-sm font-bold text-white bg-[#2874F0] hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-200/50 transition-all flex items-center gap-2 disabled:opacity-70">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEditMode ? 'Save Changes' : 'Publish Product'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* 1. Variants */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-[#2874F0]" /> Variants & Options</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => addPresetGroup('Size')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 rounded-lg text-xs font-bold transition-all"><Ruler size={14} /> Size Preset</button>
                                    <button onClick={() => addPresetGroup('Color')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-purple-300 text-gray-600 rounded-lg text-xs font-bold transition-all"><Palette size={14} /> Color Preset</button>
                                    <button onClick={addCustomGroup} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2874F0] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all"><Plus size={14} /> Group</button>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {variantGroups.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <Layers size={32} className="mx-auto text-gray-300 mb-3" /><p className="text-sm font-medium text-gray-500">No variants added.</p>
                                    </div>
                                ) : (
                                    variantGroups.map((group) => (
                                        <div key={group.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm relative group">
                                            <button onClick={() => removeGroup(group.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><X size={16} /></button>
                                            <div className="grid grid-cols-12 gap-6">
                                                <div className="col-span-12 md:col-span-3 border-r border-gray-100 pr-6">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Group Name</label>
                                                    <input type="text" value={group.name} onChange={(e) => updateGroupName(group.id, e.target.value)} className="w-full text-sm font-bold text-gray-800 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 outline-none transition-all" />
                                                    {group.name.toLowerCase() === 'color' && (
                                                        <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                            <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1.5 mb-2"><ImageIcon size={12} /> Auto-Sync Images</p>
                                                            <p className="text-[10px] text-gray-500">Assign images to colors here. They will auto-sync to all sizes.</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-span-12 md:col-span-9">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Options</label>
                                                    <div className="space-y-3">
                                                        {group.options.map((opt) => (
                                                            <div key={opt.id} className="flex items-center gap-3">
                                                                {/* Custom Color Picker for Color Group */}
                                                                {group.name.toLowerCase() === 'color' && (
                                                                    <div title="Pick Color" className="relative group/picker">
                                                                        <div className="w-10 h-[38px] rounded-lg border border-gray-200 overflow-hidden cursor-pointer shadow-sm relative">
                                                                            <input
                                                                                type="color"
                                                                                value={opt.color || '#000000'}
                                                                                onChange={(e) => updateOption(group.id, opt.id, 'color', e.target.value)}
                                                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="relative flex-1">
                                                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 focus-within:bg-white transition-all overflow-hidden">
                                                                        <span className="pl-3 text-gray-400"><Tag size={14} /></span>
                                                                        <input type="text" value={opt.name} onChange={(e) => updateOption(group.id, opt.id, 'name', e.target.value)} className="flex-1 text-sm font-medium text-gray-700 bg-transparent px-3 py-2 outline-none" placeholder="Value" />
                                                                    </div>
                                                                </div>

                                                                {/* Image Uploader for Colors */}
                                                                {group.name.toLowerCase() === 'color' && (
                                                                    <div className="relative w-10 h-10 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden bg-gray-50 group/img">
                                                                        {opt.image ? <img src={opt.image} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-400 group-hover/img:text-blue-500" />}
                                                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, (url) => updateOption(group.id, opt.id, 'image', url))} />
                                                                    </div>
                                                                )}

                                                                <button onClick={() => removeOption(group.id, opt.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addOption(group.id)} className="flex items-center gap-2 text-xs font-bold text-[#2874F0] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"><Plus size={14} /> Add Option</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 2. Inventory Matrix */}
                        {variantGroups.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Grid size={18} className="text-[#2874F0]" /> Inventory Matrix</h2>
                                    <button onClick={syncMatrix} className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-lg text-xs font-bold hover:bg-blue-600 shadow-lg shadow-blue-200/50 transition-all"><RefreshCw size={14} /> Sync Matrix</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Img</th>
                                                <th className="px-6 py-4">Variant</th>
                                                <th className="px-6 py-4">SKU</th>
                                                <th className="px-6 py-4">Stock</th>
                                                <th className="px-6 py-4">Price</th>
                                                <th className="px-6 py-4 text-center">Def</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {matrix.map((row) => (
                                                <tr key={row.id} className="group hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm overflow-hidden relative">
                                                            {row.image ? <img src={row.image} className="w-full h-full object-cover rounded-md" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3"><span className="text-sm font-bold text-gray-700">{row.combination}</span></td>
                                                    <td className="px-6 py-3"><input type="text" value={row.sku} onChange={(e) => handleMatrixUpdate(row.id, 'sku', e.target.value)} className="w-32 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none font-mono text-xs py-1" /></td>
                                                    <td className="px-6 py-3"><input type="number" value={row.stock} onChange={(e) => handleMatrixUpdate(row.id, 'stock', Number(e.target.value))} className={`w-20 border rounded-lg px-2 py-1.5 outline-none text-xs font-bold transition-all ${row.stock === 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 focus:border-blue-500'}`} /></td>
                                                    <td className="px-6 py-3">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
                                                            <input type="number" value={row.price} onChange={(e) => handleMatrixUpdate(row.id, 'price', Number(e.target.value))} className="w-24 pl-5 pr-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-xs font-medium" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-center"><input type="radio" name="default_variant" checked={row.isDefault} onChange={(e) => handleMatrixUpdate(row.id, 'isDefault', e.target.checked)} className="w-4 h-4 text-blue-600 cursor-pointer" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Default Color Choice */}
                        {colorGroup && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Palette size={18} className="text-[#2874F0]" /> Default Product Color</h2>
                                <div className="flex flex-wrap gap-3">
                                    {colorGroup.options.map(opt => (
                                        <button key={opt.id} onClick={() => setDefaultColor(opt.id)} className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all relative ${defaultColor === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                            <div style={{ backgroundColor: opt.color || '#eee' }} className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"></div>
                                            <span className="text-sm font-bold">{opt.name}</span>
                                            {defaultColor === opt.id && <CheckCircleIcon />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Core Details */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800 mb-4">Core Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Product Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl text-sm" /></div>
                                <div className="col-span-1"><label className="text-xs font-bold text-gray-500">Base Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl text-sm" /></div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-500">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl text-sm">
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl text-sm" rows={3}></textarea></div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500">Specifications</label>
                                    <textarea
                                        value={specifications}
                                        onChange={(e) => setSpecifications(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-xl text-sm font-mono"
                                        rows={4}
                                        placeholder={`Material: Cotton\nSize: Large\nBattery: 5000mAh`}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Key-value pairs (one per line)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Organization */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><LayoutTemplate size={18} className="text-purple-500" /> Organization</h2>
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Section Header Text</label><input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-purple-500 outline-none" placeholder="e.g. Summer Sale" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Text Color</label><div className="flex items-center gap-2"><input type="color" value={sectionColor} onChange={(e) => setSectionColor(e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0 overflow-hidden" /><span className="text-xs font-mono text-gray-500">{sectionColor}</span></div></div>
                                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Font Size</label><select value={sectionSize} onChange={(e) => setSectionSize(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"><option value="text-base">Normal</option><option value="text-lg">Large</option><option value="text-xl">Extra Large</option><option value="text-2xl">Huge</option></select></div>
                                </div>
                                {sectionTitle && (<div className="mt-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center"><p className="text-[10px] text-gray-400 mb-1">Preview</p><h3 style={{ color: sectionColor }} className={`${sectionSize} font-bold`}>{sectionTitle}</h3></div>)}
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800 mb-4">Product Images</h2>
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Main Image</label>
                                <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-blue-500 transition-colors group">
                                    {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center text-gray-400"><UploadCloud className="mb-2 group-hover:text-blue-500 transition-colors" /><span className="text-xs">Click to Upload</span></div>}
                                    <input type="file" onChange={(e) => handleFileUpload(e, (url) => setFormData(prev => ({ ...prev, image: url })))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {/* URL Fallback */}
                                    <input type="text" value={formData.image} onChange={handleChange} onClick={(e) => e.stopPropagation()} className="absolute bottom-0 w-full text-[10px] p-1 bg-white/90 border-t" placeholder="Or enter URL..." name="image" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="aspect-square bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden group cursor-pointer hover:border-blue-400">
                                        {gallery[i] ? <img src={gallery[i]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Plus size={16} className="text-gray-300" /></div>}
                                        <input type="file" onChange={(e) => handleFileUpload(e, (url) => handleGalleryChange(i, url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <input type="text" value={gallery[i] || ''} onChange={(e) => handleGalleryChange(i, e.target.value)} onClick={(e) => e.stopPropagation()} className="absolute bottom-0 w-full text-[10px] p-0.5 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity z-20" placeholder="URL..." />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon = () => (
    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5 shadow-sm border border-white"><Check size={10} className="text-white" /></div>
);
