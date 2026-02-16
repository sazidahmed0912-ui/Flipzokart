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
import { fetchProductById, createProduct, updateProduct, uploadFile, uploadMultipleFiles } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';
import { CATEGORIES, SUBCATEGORIES } from '@/app/constants';
import { getProductImageUrl } from '@/app/utils/imageHelper';
import { FashionSubcategorySelector } from '@/app/components/FashionSubcategorySelector';

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
    options?: Record<string, string>; // <--- Add this
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
        price: '', // This will be the Sale Price
        originalPrice: '', // This is the MRP
        image: '',
        category: 'Mobiles',
        subcategory: '',
        countInStock: '',
        description: '',
        isFeatured: false,
        codAvailable: true,
        prepaidAvailable: true
    });

    const [discount, setDiscount] = useState<number>(0);

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

    // Auto-Sync Matrix when Variant Groups change (Debounced to prevent jitter)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (variantGroups.length > 0) {
                syncMatrix();
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [variantGroups]);

    // --- Load Data ---
    const loadProduct = async (productId: string) => {
        try {
            const { data } = await fetchProductById(productId);
            let cleanDescription = data.description || '';
            let meta: any = {};

            // Parse Metadata if present (Legacy Support)
            if (cleanDescription.includes('<!-- METADATA:')) {
                try {
                    const parts = cleanDescription.split('<!-- METADATA:');
                    cleanDescription = parts[0].trim(); // Strip metadata from UI description
                    const jsonStr = parts[1].split('-->')[0];
                    meta = JSON.parse(jsonStr);
                } catch (e) {
                    console.error("Failed to parse metadata", e);
                }
            }

            setFormData({
                name: data.name,
                price: data.price,
                originalPrice: data.originalPrice || '',
                image: data.image,
                category: data.category,
                subcategory: (data.category === 'Fashion' && data.submenu)
                    ? `${data.subcategory} > ${data.submenu}`
                    : (data.subcategory || ''),
                countInStock: data.countInStock || 0,
                description: cleanDescription, // Load ONLY clean text
                isFeatured: data.isFeatured || false,
                codAvailable: data.codAvailable !== false, // Default true
                prepaidAvailable: data.prepaidAvailable !== false // Default true
            });

            // Load Gallery Images (Exclude Main Image to avoid duplicate)
            if (data.images && Array.isArray(data.images)) {
                const galleryImages = data.images.filter((img: string) => img !== data.image);
                setGallery(galleryImages);
            }

            // Load Advanced Fields
            // Priority: Metadata (Rich Editor State) -> Strict Variants (Reconstructed) -> Legacy
            let loadedGroups = meta.variants || [];
            let loadedMatrix = meta.matrix || [];

            // If no metadata but we have strict variants (Migration/Interoperability)
            if (loadedGroups.length === 0 && data.variants && data.variants.length > 0) {
                const pVariants = data.variants as any[]; // Strict ProductVariant[]
                const uniqueColors = Array.from(new Set(pVariants.map(v => v.color).filter(Boolean))) as string[];
                const uniqueSizes = Array.from(new Set(pVariants.map(v => v.size).filter(Boolean))) as string[];

                // Reconstruct Strings -> Option Objects
                const colorOptions: VariantOption[] = uniqueColors.map((c, i) => ({ id: `opt-c-${i}`, name: c, color: '#000000' }));
                const sizeOptions: VariantOption[] = uniqueSizes.map((s, i) => ({ id: `opt-s-${i}`, name: s }));

                if (colorOptions.length) loadedGroups.push({ id: 'grp-c', name: 'Color', options: colorOptions });
                if (sizeOptions.length) loadedGroups.push({ id: 'grp-s', name: 'Size', options: sizeOptions });

                // Reconstruct Matrix
                loadedMatrix = pVariants.map((v, idx) => {
                    // Find matching option IDs
                    const cOpt = colorOptions.find(o => o.name === v.color);
                    const sOpt = sizeOptions.find(o => o.name === v.size);
                    const vIds = [cOpt?.id, sOpt?.id].filter(Boolean) as string[];
                    const comboName = [v.color, v.size].filter(Boolean).join(' / ');

                    return {
                        id: v.id || `mat-${idx}`,
                        combination: comboName,
                        sku: v.sku || '',
                        stock: v.stock || 0,
                        price: v.price || v.originalPrice || 0,
                        isDefault: false,
                        image: v.image || '',
                        variantIds: vIds
                    };
                });
            }

            setVariantGroups(loadedGroups);
            setMatrix(loadedMatrix);
            setSkuBase(data.sku || meta.sku || 'FZK');

            // Fix: Hydrate Specifications to prevent data loss on edit
            setSpecifications(data.specifications || meta.specifications || '');

            if (Object.keys(meta).length > 0 && meta.section) {
                setSectionTitle(meta.section.title || '');
                setSectionColor(meta.section.color || '#111827');
                setSectionSize(meta.section.size || 'text-xl');
            }

            // Images are already loaded above using prioritization logic

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

        setFormData(prev => {
            const updates: any = { [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value };

            // Reset subcategory if category changes
            if (name === 'category') {
                updates.subcategory = '';
            }

            return { ...prev, ...updates };
        });
    };

    // --- File Upload Handlers ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const { data } = await uploadFile(uploadData);
            onSuccess(data);
            addToast('success', 'Image uploaded successfully');
        } catch (error) {
            console.error(error);
            addToast('error', 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = extractFiles(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadData = new FormData();
        files.forEach(file => {
            uploadData.append('image', file);
        });

        try {
            const { data } = await uploadMultipleFiles(uploadData);
            // Expecting { success: true, urls: string[] }
            if (data.urls && Array.isArray(data.urls)) {
                setGallery(prev => [...prev, ...data.urls]);
                addToast('success', `${data.urls.length} images uploaded`);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Multi-upload failed", error);
            addToast('error', 'Batch upload failed');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    // Helper to safely get array from FileList
    const extractFiles = (fileList: FileList | null): File[] => {
        if (!fileList) return [];
        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList.item(i);
            if (file) files.push(file);
        }
        return files;
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

            // Construct Options Map strictly for Backend Hydration
            const optionsMap: Record<string, string> = {};
            comboOpts.forEach(o => {
                // Find which group this option belongs to
                const group = variantGroups.find(g => g.options.some(opt => opt.id === o.id));
                if (group) {
                    optionsMap[group.name] = o.name;
                    // Also handle case-insensitive or specific keys if needed, but backend is robust now.
                }
            });

            return {
                id: existing?.id || Date.now() + idx + '',
                combination: comboNames,
                sku: smartSku,
                stock: existing ? existing.stock : 0,
                price: existing ? existing.price : (Number(formData.price) || 0),
                isDefault: existing ? existing.isDefault : (idx === 0),
                image: comboImage,
                variantIds: comboIds,
                options: optionsMap // <--- CRITICAL FIX: Add this
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
    // handleGalleryChange replaced by handleMultiImageUpload logic


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
            // Logic: If Sale Price is empty, use Original Price as Sale Price (0% discount)
            let finalSalePrice = formData.price ? Number(formData.price) : Number(formData.originalPrice);
            const finalOriginalPrice = Number(formData.originalPrice);

            if (!finalOriginalPrice || finalOriginalPrice <= 0) {
                addToast('error', 'Original Price (MRP) is required');
                setSaving(false);
                return;
            }

            // Validation: Strict Fashion Subcategory
            if (formData.category === 'Fashion' && !formData.subcategory) {
                addToast('error', 'Please select a valid Fashion subcategory (e.g. Men > Shirts)');
                setSaving(false);
                return;
            }

            if (finalSalePrice > finalOriginalPrice) {
                addToast('error', 'Sale Price cannot be greater than Original Price');
                setSaving(false);
                return;
            }

            const totalStock = matrix.length > 0 ? matrix.reduce((acc, c) => acc + c.stock, 0) : Number(formData.countInStock);
            const defaultVar = matrix.find(m => m.isDefault);
            const finalPrice = defaultVar ? defaultVar.price : finalSalePrice;

            // 1. Consolidate Images
            // Ensure Main Image is first (Thumbnail)
            const mainImage = formData.image;
            const validGallery = gallery.filter(g => g && g.trim() !== '' && g !== mainImage);
            const allImages = mainImage ? [mainImage, ...validGallery] : validGallery;


            // 2. Prepare STRICT ProductVariant[] for Backend
            // We map the UI Matrix logic to the flattened strict structure
            const strictVariants: any[] = matrix.map((row, idx) => {
                // Resolve options from IDs to Names
                const cOption = variantGroups.find(g => g.name.toLowerCase() === 'color')?.options.find(o => row.variantIds.includes(o.id));
                const sOption = variantGroups.find(g => g.name.toLowerCase() === 'size')?.options.find(o => row.variantIds.includes(o.id));

                return {
                    id: row.id,
                    color: cOption?.name || undefined,
                    size: sOption?.name || undefined,
                    price: row.price,
                    stock: row.stock,
                    sku: row.sku,
                    image: row.image,
                    productId: id || '',
                    name: `${formData.name} - ${row.combination}`
                };
            });

            // 3. Prepare Rich Metadata (To persist Colors/Images/Hex/UI Groups)
            const richData = {
                sku: skuBase, specifications,
                variants: variantGroups, // Preserves Ids, Hex Codes
                matrix, // Preserves Matrix Rows references
                section: { title: sectionTitle, color: sectionColor, size: sectionSize }
            };

            // 4. Handle Fashion Hierarchy Splitting
            let finalSubcategory = formData.subcategory;
            let finalSubmenu = '';

            if (formData.category === 'Fashion' && formData.subcategory.includes(' > ')) {
                const parts = formData.subcategory.split(' > ');
                finalSubcategory = parts[0].trim();
                finalSubmenu = parts[1].trim();
            }

            const payload = {
                ...formData,
                subcategory: finalSubcategory,
                submenu: finalSubmenu,
                price: finalPrice,
                originalPrice: finalOriginalPrice,
                countInStock: totalStock,
                images: allImages,
                thumbnail: mainImage,
                variants: strictVariants, // STRICT TYPES SOURCE OF TRUTH
                isFeatured: formData.isFeatured,
                codAvailable: formData.codAvailable,
                prepaidAvailable: formData.prepaidAvailable,
                // inventory: undefined,  // REMOVED legacy field
                specifications: specifications,
                sku: skuBase,
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
                                                                        {opt.image ? <img src={getProductImageUrl(opt.image)} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-400 group-hover/img:text-blue-500" />}
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
                                                            {row.image ? <img src={getProductImageUrl(row.image)} className="w-full h-full object-cover rounded-md" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>}
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

                                {/* Dual Pricing Section */}
                                <div className="col-span-2 grid grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-gray-500">MRP (Original)</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-gray-400 text-xs">₹</span>
                                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full pl-6 pr-3 py-2 border rounded-lg text-sm" placeholder="1000" />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-gray-500">Sale Price</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-gray-400 text-xs">₹</span>
                                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-6 pr-3 py-2 border rounded-lg text-sm" placeholder={formData.originalPrice || "800"} />
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex flex-col justify-end pb-1">
                                        <div className={`w-full py-2 px-3 rounded-lg text-xs font-bold text-center border ${discount > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400'}`}>
                                            {discount > 0 ? `${discount}% OFF` : 'No Discount'}
                                        </div>
                                    </div>
                                    <p className="col-span-3 text-[10px] text-gray-400 text-center">If detailed inventory variants are set, their default price overrides this.</p>
                                </div>
                                <div className="col-span-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl text-sm">
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subcategory - Dependent Dropdown */}
                                    {/* Subcategory - Dependent Dropdown OR Custom Fashion Selector */}
                                    <div>
                                        {formData.category === 'Fashion' ? (
                                            <FashionSubcategorySelector
                                                value={formData.subcategory}
                                                onChange={(val) => setFormData(prev => ({ ...prev, subcategory: val }))}
                                                error={(!formData.subcategory && saving) ? "Required" : undefined}
                                            />
                                        ) : (
                                            <>
                                                <label className="text-xs font-bold text-gray-500">Subcategory</label>
                                                <select
                                                    name="subcategory"
                                                    value={formData.subcategory}
                                                    onChange={handleChange}
                                                    className="w-full mt-1 px-4 py-2 border rounded-xl text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                                    disabled={!formData.category || !SUBCATEGORIES[formData.category]}
                                                >
                                                    <option value="">Select Subcategory</option>
                                                    {formData.category && SUBCATEGORIES[formData.category]?.map(sub => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                                {formData.category && !SUBCATEGORIES[formData.category] && (
                                                    <p className="text-[10px] text-orange-500 mt-1">No subcategories for {formData.category}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Stock</label>
                                        <input
                                            type="number"
                                            name="countInStock"
                                            value={formData.countInStock}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-4 py-2 border rounded-xl text-sm"
                                            placeholder="0"
                                            disabled={matrix.length > 0}
                                        />
                                    </div>

                                    {/* Payment Options Toggles */}
                                    <div className="col-span-2 flex gap-6 mt-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input type="checkbox" name="codAvailable" checked={formData.codAvailable} onChange={handleChange} className="peer sr-only" />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-green-600 transition-colors">COD Available</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input type="checkbox" name="prepaidAvailable" checked={formData.prepaidAvailable} onChange={handleChange} className="peer sr-only" />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-purple-600 transition-colors">Prepaid Available</span>
                                        </label>
                                    </div>
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

                                <div className="pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="peer sr-only" />
                                            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Featured Product</span>
                                    </label>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-13">Show in "Featured on Fzokart" section</p>
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800 mb-4">Product Images</h2>

                            {/* Main Image (Thumbnail) */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Main Thumbnail</label>
                                <div className="aspect-square w-full md:w-1/2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-blue-500 transition-colors group">
                                    {formData.image ? <img src={getProductImageUrl(formData.image)} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center text-gray-400"><UploadCloud className="mb-2 group-hover:text-blue-500 transition-colors" /><span className="text-xs">Upload Main</span></div>}
                                    <input type="file" onChange={(e) => handleFileUpload(e, (url) => setFormData(prev => ({ ...prev, image: url })))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            {/* Gallery Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gallery Images</label>
                                    <span className="text-[10px] text-gray-400">{gallery.length} Images</span>
                                </div>

                                {/* Multi-Upload Button */}
                                <div className="relative w-full py-3 bg-blue-50 border border-dashed border-blue-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors group mb-4">
                                    <ImageIcon size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold text-blue-600">Select Multiple Images</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleMultiImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>

                                {/* Dynamic Preview Grid */}
                                {gallery.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {gallery.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-lg border border-gray-200 relative overflow-hidden group">
                                                <img src={getProductImageUrl(img)} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    title="Remove Image"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400">No gallery images added.</p>
                                    </div>
                                )}
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
