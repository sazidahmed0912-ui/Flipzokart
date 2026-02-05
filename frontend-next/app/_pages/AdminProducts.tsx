"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
;
import {
  Plus, Edit, Trash2, Search, X,
  Upload, Package, ChevronLeft,
  Settings2, PlusCircle,
  Image as ImageIcon, Layers, RefreshCw, AlertCircle,
  Barcode, Tag, Info, CheckCircle2, Zap,
  ImagePlus, XCircle, Bell, User, LogOut, ChevronDown
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { Product, VariantGroup, VariantCombination } from '@/app/types';
import { CATEGORIES } from '@/app/constants';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { createProduct, updateProduct, deleteProduct, uploadFile } from '@/app/services/adminService';
import { fetchProductById } from '@/app/services/api';
import { getProductImageUrl } from '@/app/utils/imageHelper';

export const AdminProducts: React.FC = () => {
  const { products, setProducts, user, logout } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [variantUploadingIndex, setVariantUploadingIndex] = useState<number | null>(null);
  const [needsSync, setNeedsSync] = useState(false);

  // Refs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);
  const variantImageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    specifications: '',
    price: '',
    originalPrice: '',
    category: CATEGORIES[0],
    stock: '0',
    image: '',
    images: [] as string[],
    variants: [] as VariantGroup[],
    inventory: [] as VariantCombination[],
    defaultColor: ''
  });

  // Feature: Color-Image Sync State
  const [variantColorImages, setVariantColorImages] = useState<Record<string, string>>({});
  const [newColorName, setNewColorName] = useState('');
  const [newColorImage, setNewColorImage] = useState<string | null>(null);
  const colorImageInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isModalOpen && formData.variants.length > 0) {
      // Check if inventory is actually out of sync
      const activeVariants = formData.variants.filter(v => v.name.trim());
      if (activeVariants.length === 0) {
        setNeedsSync(false);
        return;
      }
      // Simple heuristic: if inventory is empty but we have variants, we need sync
      if (formData.inventory.length === 0) {
        setNeedsSync(true);
      }
    }
  }, [formData.variants, isModalOpen, formData.inventory.length]);

  const openAddModal = () => {
    setEditingProduct(null);
    setNeedsSync(false);
    setFormData({
      name: '',
      sku: '',
      description: '',
      specifications: '',
      price: '',
      originalPrice: '',
      category: CATEGORIES[0],
      stock: '0',
      image: '',
      images: [],
      variants: [],
      inventory: [],
      defaultColor: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    setEditingProduct(product);
    setNeedsSync(false);

    // Reconstruct UI Groups from strict Variants
    const reconstructedVariants: VariantGroup[] = [];
    const validVariants = product.variants || [];

    const uniqueColors = Array.from(new Set(validVariants.map(v => v.color).filter(Boolean))) as string[];
    const uniqueSizes = Array.from(new Set(validVariants.map(v => v.size).filter(Boolean))) as string[];

    if (uniqueColors.length > 0) reconstructedVariants.push({ name: 'Color', options: uniqueColors });
    if (uniqueSizes.length > 0) reconstructedVariants.push({ name: 'Size', options: uniqueSizes });

    // Reconstruct matches
    const reconstructedInventory: VariantCombination[] = validVariants.map(v => ({
      options: {
        ...(v.color ? { Color: v.color } : {}),
        ...(v.size ? { Size: v.size } : {})
      },
      stock: v.stock,
      price: v.price,
      sku: v.sku,
      image: v.image
    }));

    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description,
      specifications: product.specifications || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      stock: (product.countInStock ?? product.stock ?? 0).toString(),
      image: product.image,
      images: product.images || [],
      variants: reconstructedVariants,
      inventory: reconstructedInventory,
      defaultColor: product.defaultColor || ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'variant' = 'main') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (type === 'variant') {
        if (variantUploadingIndex === null) return;
        const file = files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const { data } = await uploadFile(formData);

        updateInventoryField(variantUploadingIndex!, 'image', data.path); // Use path, helper will render it
        setVariantUploadingIndex(null);

      } else if (type === 'gallery') {
        const uploadPromises = Array.from(files).slice(0, 6 - formData.images.length).map(async (file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          const { data } = await uploadFile(formData);
          return data.path;
        });

        const newPaths = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newPaths] }));

      } else {
        const file = files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const { data } = await uploadFile(formData);

        setFormData(prev => ({ ...prev, image: data.path }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const triggerMainUpload = () => mainImageInputRef.current?.click();
  const triggerGalleryUpload = () => galleryImageInputRef.current?.click();
  const triggerVariantUpload = (index: number) => {
    setVariantUploadingIndex(index);
    variantImageInputRef.current?.click();
  };

  const addVariantGroup = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', options: [''] }]
    }));
  };

  const applyPreset = (type: 'size' | 'color') => {
    const presets = {
      size: { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      color: { name: 'Color', options: ['Jet Black', 'Arctic White', 'Royal Blue', 'Deep Red'] }
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, presets[type]]
    }));
  };

  const removeVariantGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariantGroupName = (index: number, name: string) => {
    setFormData(prev => {
      const next = [...prev.variants];
      next[index] = { ...next[index], name };
      return { ...prev, variants: next };
    });
  };

  const addVariantOption = (groupIndex: number) => {
    setFormData(prev => {
      const next = [...prev.variants];
      next[groupIndex] = { ...next[groupIndex], options: [...next[groupIndex].options, ''] };
      return { ...prev, variants: next };
    });
  };

  const updateVariantOption = (groupIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.variants];
      const nextOptions = [...next[groupIndex].options];
      nextOptions[optionIndex] = value;
      next[groupIndex] = { ...next[groupIndex], options: nextOptions };
      return { ...prev, variants: next };
    });
  };

  const removeVariantOption = (groupIndex: number, optionIndex: number) => {
    setFormData(prev => {
      const next = [...prev.variants];
      const nextOptions = next[groupIndex].options.filter((_, i) => i !== optionIndex);
      next[groupIndex] = { ...next[groupIndex], options: nextOptions };
      return { ...prev, variants: next };
    });
  };



  // --- Color-Image Sync Logic ---
  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadFile(formData);
      setNewColorImage(data.path);
    } catch (error) {
      console.error("Color image upload failed:", error);
      alert("Failed to upload image.");
    }
    e.target.value = '';
  };

  const addColorWithImage = () => {
    if (!newColorName.trim()) {
      alert("Please enter a color name (e.g., Red)");
      return;
    }
    if (!newColorImage) {
      alert("Please upload an image for this color.");
      return;
    }

    // 1. Add to Variants (Find 'Color' group or create one)
    setFormData(prev => {
      const existingGroupIndex = prev.variants.findIndex(v => v.name.toLowerCase() === 'color');
      let nextVariants = [...prev.variants];

      if (existingGroupIndex >= 0) {
        // Add option if not exists
        if (!nextVariants[existingGroupIndex].options.includes(newColorName)) {
          const nextOptions = [...nextVariants[existingGroupIndex].options, newColorName];
          nextVariants[existingGroupIndex] = { ...nextVariants[existingGroupIndex], options: nextOptions };
        }
      } else {
        // Create new Color group
        nextVariants.push({ name: 'Color', options: [newColorName] });
      }
      return { ...prev, variants: nextVariants };
    });

    // 2. Save mapping
    setVariantColorImages(prev => ({ ...prev, [newColorName]: newColorImage }));

    // Reset
    setNewColorName('');
    setNewColorImage(null);
  };

  const generateCombinations = () => {
    const activeVariants = formData.variants.filter(v =>
      v.name.trim() !== '' && v.options.some(o => o.trim() !== '')
    );

    if (activeVariants.length === 0) {
      setFormData(prev => ({ ...prev, inventory: [] }));
      setNeedsSync(false);
      return;
    }

    let combinations: Record<string, string>[] = [{}];
    activeVariants.forEach(group => {
      const nextCombos: Record<string, string>[] = [];
      const validOptions = group.options.filter(o => o.trim() !== '');

      combinations.forEach(combo => {
        validOptions.forEach(option => {
          nextCombos.push({ ...combo, [group.name]: option });
        });
      });
      combinations = nextCombos;
    });

    const syncedInventory: VariantCombination[] = combinations.map(combo => {
      const existing = formData.inventory.find(inv => {
        const invEntries = Object.entries(inv.options);
        const comboEntries = Object.entries(combo);
        if (invEntries.length !== comboEntries.length) return false;
        return invEntries.every(([k, v]) => combo[k] === v);
      });

      if (existing) return existing;

      const basePrefix = formData.name.substring(0, 3).toUpperCase() || 'FZK';
      const variantSuffix = Object.values(combo).map(v => v.substring(0, 2).toUpperCase()).join('-');
      const randomID = Math.floor(100 + Math.random() * 899);

      // Auto-assign image from Color map if available
      let autoImage = undefined;
      const colorKey = Object.keys(combo).find(k => k.toLowerCase() === 'color');
      if (colorKey) {
        const colorValue = combo[colorKey];
        if (variantColorImages[colorValue]) {
          autoImage = variantColorImages[colorValue];
        }
      }

      return {
        options: combo,
        stock: 0,
        sku: `${basePrefix}-${variantSuffix}-${randomID}`,
        price: undefined,
        image: autoImage
      };
    });

    setFormData(prev => ({ ...prev, inventory: syncedInventory }));
    setNeedsSync(false);
  };

  const updateInventoryField = (index: number, field: 'stock' | 'sku' | 'price' | 'image', val: string) => {
    const nextInventory = [...formData.inventory];
    if (field === 'stock') {
      nextInventory[index] = { ...nextInventory[index], stock: parseInt(val) || 0 };
    } else if (field === 'sku') {
      nextInventory[index] = { ...nextInventory[index], sku: val };
    } else if (field === 'price') {
      nextInventory[index] = { ...nextInventory[index], price: val === '' ? undefined : parseFloat(val) };
    } else if (field === 'image') {
      nextInventory[index] = { ...nextInventory[index], image: val };
    }
    setFormData(prev => ({ ...prev, inventory: nextInventory }));
  };

  const currentTotalStock = useMemo(() => {
    if (formData.variants.length > 0) {
      return formData.inventory.reduce((acc, item) => acc + item.stock, 0);
    }
    return parseInt(formData.stock) || 0;
  }, [formData.inventory, formData.stock, formData.variants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (needsSync && formData.variants.length > 0) {
      alert("Inventory Matrix is out of sync. Please tap 'Sync Variants & Matrix' before finalizing.");
      return;
    }

    // Map Inventory (UI State) -> Strict ProductVariant[]
    // "ULTRA-LOCK": Only strictly defined variants are sent.
    const strictVariants = formData.inventory.map((item, idx) => ({
      id: `v-${Date.now()}-${idx}`, // Temp ID, backend handles persistence
      productId: editingProduct?.id || '',
      color: item.options['Color'] || item.options['color'],
      size: item.options['Size'] || item.options['size'],
      price: item.price ?? numericPrice,
      stock: item.stock,
      image: item.image,
      sku: item.sku,
      name: `${formData.name} - ${Object.values(item.options).join('/')}`
    }));

    const productPayload = {
      sku: formData.sku || `FZK-${Math.floor(Math.random() * 10000)}`,
      name: formData.name,
      description: formData.description || "No description provided.",
      specifications: formData.specifications,
      price: numericPrice,
      originalPrice: parseFloat(formData.originalPrice) || numericPrice,
      category: formData.category,
      countInStock: currentTotalStock,
      image: formData.image || `https://picsum.photos/seed/${formData.name.length}/600/600`,
      images: formData.images.length > 0 ? formData.images : [],
      rating: editingProduct ? editingProduct.rating : 5,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      isFeatured: editingProduct ? editingProduct.isFeatured : false,

      // STRICT VARIANT MAPPING
      variants: strictVariants.length > 0 ? strictVariants : undefined,

      // No 'inventory' field sent to backend
      defaultColor: formData.defaultColor
    };

    console.log('Submitting Product Payload:', productPayload);
    console.log('Strict Variants:', strictVariants);
    console.log('Form Inventory:', formData.inventory);

    try {
      if (editingProduct) {
        const { data } = await updateProduct(editingProduct.id, productPayload);
        const updatedProduct = data.data.product;
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        alert("Product updated successfully!");
      } else {
        const { data } = await createProduct(productPayload);
        const newProduct = data.data.product;
        setProducts([newProduct, ...products]);
        alert("Product published successfully!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Product Save Error Object:", error);

      // Detailed logging for debugging "J" or undefined errors
      if (typeof error === 'object') {
        console.log("Error keys:", Object.keys(error));
        console.log("Error response:", error.response);
        console.log("Error message:", error.message);
      } else {
        console.log("Error type:", typeof error);
        console.log("Error value:", error);
      }

      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      alert(`Failed to save product: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert("Failed to delete product.");
    }
  };

  // Helper for button click to ensure form submit is triggered
  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      {/* Hidden Inputs for File Upload */}
      <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} />
      <input type="file" ref={galleryImageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'gallery')} />
      <input type="file" ref={variantImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'variant')} />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#2874F0]/20">
            <Search size={18} className="text-[#2874F0]" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-semibold text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Products</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Manage your product catalog</p>
            </div>
            <button onClick={openAddModal} className="bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#1e5ccc] transition-all shadow-md shadow-blue-200 flex items-center gap-2">
              <Plus size={18} /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-center">SKU</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getProductImageUrl(product.image || product.images?.[0])}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-gray-50"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://placehold.co/48x48/png?text=Err';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">{product.sku || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">₹{product.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-orange-700' : 'text-red-700'}`}>
                            {product.stock} Units
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-[#2874F0] text-xs font-bold rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No products found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package className="text-[#2874F0]" size={20} />
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <form id="product-form" ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images */}
                    <div className="lg:col-span-1 space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Image</label>
                        <div
                          className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#2874F0] cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-[#2874F0] transition-all relative group overflow-hidden"
                          onClick={triggerMainUpload}
                        >
                          {formData.image ? (
                            <img src={getProductImageUrl(formData.image)} className="w-full h-full object-cover" alt="Main" />
                          ) : (
                            <>
                              <Upload size={32} className="mb-2" />
                              <span className="text-xs font-bold">Upload Main Image</span>
                            </>
                          )}
                          {/* Overlay for re-uploading if image exists */}
                          {formData.image && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload size={24} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Gallery ({formData.images.length}/6)</label>
                          <button type="button" onClick={triggerGalleryUpload} className="text-[#2874F0] text-xs font-bold hover:underline">+ Add</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative group">
                              <img src={getProductImageUrl(img)} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                              <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          {formData.images.length < 6 && (
                            <div className="aspect-square rounded-lg border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400" onClick={triggerGalleryUpload}>
                              <Plus size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Name</label>
                          <input
                            required
                            type="text"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                            <input
                              required
                              type="number"
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                          <select
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">SKU</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Base Stock</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800 resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Specifications</label>
                          <textarea
                            rows={4}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2874F0]/20 focus:border-[#2874F0] outline-none transition-all font-medium text-sm text-gray-800 resize-none"
                            value={formData.specifications}
                            onChange={e => setFormData({ ...formData, specifications: e.target.value })}
                            placeholder="Enter detailed specifications..."
                          />
                        </div>
                      </div>

                      {/* Variants Section - Simplified UI */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-800 text-sm">Variants & Options</h3>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => applyPreset('size')} className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100">Size Preset</button>
                            <button type="button" onClick={() => applyPreset('color')} className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100">Color Preset</button>
                            <button type="button" onClick={addVariantGroup} className="text-xs font-bold px-3 py-1.5 bg-[#2874F0] text-white rounded hover:bg-[#1e5ccc]">+ Group</button>
                          </div>
                        </div>

                        {/* New Feature: Color + Image Quick Add */}
                        <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            ref={colorImageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleColorImageUpload}
                          />
                          <div
                            className="w-10 h-10 bg-white rounded border border-blue-200 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden shadow-sm"
                            onClick={() => colorImageInputRef.current?.click()}
                            title="Upload Color Image"
                          >
                            {newColorImage ? (
                              <img src={getProductImageUrl(newColorImage)} className="w-full h-full object-cover" alt="Color Variant" />
                            ) : (
                              <ImagePlus size={18} className="text-blue-400" />
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Color Name (e.g. Red)"
                            className="w-40 px-3 py-2 bg-white border border-blue-200 rounded text-sm outline-none focus:border-blue-500"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColorWithImage())}
                          />
                          <button
                            type="button"
                            onClick={addColorWithImage}
                            className="px-4 py-2 bg-[#2874F0] text-white text-xs font-bold rounded hover:bg-[#1e5ccc] shadow-sm flex items-center gap-2"
                          >
                            <PlusCircle size={14} /> Add Color + Img
                          </button>
                          <span className="text-[10px] text-blue-600 font-medium ml-auto">
                            * Auto-syncs image to all sizes
                          </span>
                        </div>
                        {formData.variants.length === 0 && (
                          <div className="text-center py-4 text-gray-400 text-xs italic">
                            No variants added. This will be a standard product.
                          </div>
                        )}

                        <div className="space-y-4">
                          {formData.variants.map((group, gIdx) => (
                            <div key={gIdx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex gap-3 mb-3">
                                <input
                                  placeholder="Attribute (e.g., Color)"
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm font-bold"
                                  value={group.name}
                                  onChange={e => updateVariantGroupName(gIdx, e.target.value)}
                                />
                                <button type="button" onClick={() => removeVariantGroup(gIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {group.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                    <input
                                      className="bg-transparent w-20 text-xs font-medium outline-none"
                                      value={opt}
                                      onChange={e => updateVariantOption(gIdx, oIdx, e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeVariantOption(gIdx, oIdx)} className="ml-1 text-gray-400 hover:text-red-500"><X size={12} /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addVariantOption(gIdx)} className="text-[#2874F0] text-xs font-bold px-2 py-1 hover:bg-blue-50 rounded">+ Opt</button>
                              </div>
                            </div>
                          ))}
                        </div>


                        {formData.variants.some(v => v.name.toLowerCase() === 'color' && v.options.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Default Product Color</label>
                            <div className="flex flex-wrap gap-2">
                              {formData.variants.find(v => v.name.toLowerCase() === 'color')?.options.map((opt, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, defaultColor: prev.defaultColor === opt ? '' : opt }))}
                                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${formData.defaultColor === opt
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                                    }`}
                                >
                                  {opt}
                                  {formData.defaultColor === opt && <CheckCircle2 size={12} className="inline ml-1 mb-0.5" />}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Select the color to be shown by default on the product details page.</p>
                          </div>
                        )}

                        {formData.variants.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-gray-500 uppercase">Inventory Matrix</span>
                              <button type="button" onClick={generateCombinations} className="text-xs font-bold text-[#2874F0] flex items-center gap-1 hover:underline">
                                <RefreshCw size={12} /> Sync Matrix
                              </button>
                            </div>
                            {/* Simple Table for Matrix */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                  <tr>
                                    <th className="px-3 py-2">Img</th>
                                    <th className="px-3 py-2">Var</th>
                                    <th className="px-3 py-2">SKU</th>
                                    <th className="px-3 py-2">Stk</th>
                                    <th className="px-3 py-2">Price</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {formData.inventory.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="px-3 py-2">
                                        <div className="w-8 h-8 bg-gray-100 border rounded flex items-center justify-center cursor-pointer hover:border-blue-500" onClick={() => triggerVariantUpload(idx)}>
                                          {item.image ? <img src={getProductImageUrl(item.image)} className="w-full h-full object-cover" /> : <ImageIcon size={12} className="text-gray-400" />}
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 font-medium max-w-[100px] truncate">{Object.values(item.options).join('/')}</td>
                                      <td className="px-3 py-2"><input value={item.sku || ''} onChange={e => updateInventoryField(idx, 'sku', e.target.value)} className="w-20 border-b border-gray-200 focus:border-blue-500 outline-none text-xs" /></td>
                                      <td className="px-3 py-2"><input type="number" value={item.stock} onChange={e => updateInventoryField(idx, 'stock', e.target.value)} className="w-12 border-b border-gray-200 focus:border-blue-500 outline-none text-xs" /></td>
                                      <td className="px-3 py-2"><input type="number" value={item.price || ''} onChange={e => updateInventoryField(idx, 'price', e.target.value)} placeholder="Def" className="w-14 border-b border-gray-200 focus:border-blue-500 outline-none text-xs text-right" /></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerSubmit}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[#2874F0] text-white hover:bg-[#1e5ccc] shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>

            </div>
          </div>
        )
        }
      </div >
    </div >
  );
};

