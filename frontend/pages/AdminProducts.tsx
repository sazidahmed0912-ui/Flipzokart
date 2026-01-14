import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Search, X, 
  Upload, Package, ChevronLeft,
  Settings2, PlusCircle,
  Image as ImageIcon, Layers, RefreshCw, AlertCircle,
  Barcode, Tag, Info, CheckCircle2, Zap,
  ImagePlus, XCircle
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Product, VariantGroup, VariantCombination } from '../types';
import { CATEGORIES } from '../constants';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminProducts: React.FC = () => {
  const { products, setProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
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
    price: '',
    originalPrice: '',
    category: CATEGORIES[0],
    stock: '0',
    image: '',
    images: [] as string[],
    variants: [] as VariantGroup[],
    inventory: [] as VariantCombination[]
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isModalOpen && formData.variants.length > 0) {
      setNeedsSync(true);
    }
  }, [formData.variants, isModalOpen]);

  const openAddModal = () => {
    setEditingProduct(null);
    setNeedsSync(false);
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: '',
      originalPrice: '',
      category: CATEGORIES[0],
      stock: '0',
      image: '',
      images: [],
      variants: [],
      inventory: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNeedsSync(false);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image,
      images: product.images || [],
      variants: product.variants || [],
      inventory: product.inventory || []
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'variant' = 'main') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'variant') {
      if (variantUploadingIndex === null) return;
      const file = files[0];
      // Added null check for file
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInventoryField(variantUploadingIndex!, 'image', reader.result as string);
        setVariantUploadingIndex(null);
      };
      reader.readAsDataURL(file);
    } else if (type === 'gallery') {
      // Cast Array.from to File[] to ensure type safety in forEach loop
      (Array.from(files) as File[]).slice(0, 6 - formData.images.length).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      // Added null check for file
      if (!file) return;
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
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

      return { 
        options: combo, 
        stock: 0,
        sku: `${basePrefix}-${variantSuffix}-${randomID}`,
        price: undefined,
        image: undefined
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const cleanedVariants = formData.variants
      .map(v => ({
        name: v.name.trim(),
        options: v.options.map(opt => opt.trim()).filter(opt => opt !== '')
      }))
      .filter(v => v.name !== '' && v.options.length > 0);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `PROD-${Date.now()}`,
      sku: formData.sku || `FZK-${Math.floor(Math.random() * 10000)}`,
      name: formData.name,
      description: formData.description || "No description provided.",
      price: numericPrice,
      originalPrice: parseFloat(formData.originalPrice) || numericPrice,
      category: formData.category,
      stock: currentTotalStock,
      image: formData.image || `https://picsum.photos/seed/${formData.name.length}/600/600`,
      images: formData.images.length > 0 ? formData.images : [],
      rating: editingProduct ? editingProduct.rating : 5,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      isFeatured: editingProduct ? editingProduct.isFeatured : false,
      variants: cleanedVariants.length > 0 ? cleanedVariants : undefined,
      inventory: cleanedVariants.length > 0 ? formData.inventory : undefined
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts([productData, ...products]);
    }
    
    setIsModalOpen(false);
    alert(`Product ${editingProduct ? 'updated' : 'published'} successfully!`);
  };

  // Helper for button click to ensure form submit is triggered
  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} />
      <input type="file" ref={galleryImageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'gallery')} />
      <input type="file" ref={variantImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'variant')} />

      <div className="flex-1 p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-dark">Catalog Manager</h1>
            <p className="text-gray-500 text-sm">Orchestrate complex product variants and granular availability.</p>
          </div>
          <button onClick={openAddModal} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 shadow-xl shadow-primary/30">
            <Plus size={20} /> New Listing
          </button>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search catalog..." className="w-full pl-12 pr-4 py-4 bg-lightGray rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm border border-transparent focus:border-primary/30 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-lightGray/30 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-7">Product Identity</th>
                  <th className="px-8 py-7 text-center">Global SKU</th>
                  <th className="px-8 py-7">Base Price</th>
                  <th className="px-8 py-7">Pantry Level</th>
                  <th className="px-8 py-7">Attribute Groups</th>
                  <th className="px-10 py-7 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="text-sm group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shrink-0 border border-gray-100 shadow-inner p-1 group-hover:scale-110 transition-transform duration-500">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-dark truncate max-w-[250px]">{product.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 uppercase tracking-tighter">{product.sku || '---'}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-dark text-lg">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full ring-4 ${product.stock > 10 ? 'bg-green-500 ring-green-50' : product.stock > 0 ? 'bg-orange-500 ring-orange-50' : 'bg-red-500 ring-red-50'}`} />
                        <span className="font-bold text-dark">{product.stock} Units</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants?.map(v => (
                          <span key={v.name} className="bg-dark text-white text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-tighter opacity-80">{v.name}</span>
                        )) || <span className="text-gray-300 text-xs italic">Standard Product</span>}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(product)} className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"><Edit size={20} /></button>
                        <button onClick={() => setProducts(products.filter(p => p.id !== product.id))} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-[1440px] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[96vh]">
              
              <div className="p-8 lg:px-12 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-inner">
                    <Package size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">{editingProduct ? 'Update SKU Architecture' : 'Draft Market Listing'}</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Catalog Engine</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-5 hover:bg-lightGray rounded-full transition-colors"><X size={32} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8 lg:p-12">
                <form id="product-form" ref={formRef} onSubmit={handleSubmit} className="space-y-16">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 space-y-10">
                      <div className="space-y-6">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Product Media Portfolio</label>
                        <div className="space-y-3">
                          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest ml-4">Main / Hero Image</p>
                          <div className="aspect-square bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 overflow-hidden relative group shadow-inner transition-all hover:border-primary/50 cursor-pointer" onClick={triggerMainUpload}>
                            {formData.image ? (
                              <img src={formData.image} className="w-full h-full object-cover p-3 rounded-[2.5rem]" alt="Hero" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-300 space-y-3">
                                <ImageIcon size={48} strokeWidth={1} />
                                <p className="text-[9px] font-bold uppercase tracking-widest">Main Media</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                              <div className={`bg-white p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform ${isUploading ? 'animate-pulse' : ''}`}>
                                <Upload className="text-primary" size={24} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-4">
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Gallery Portfolio ({formData.images.length}/6)</p>
                            {formData.images.length < 6 && (
                              <button type="button" onClick={triggerGalleryUpload} className="text-primary text-[10px] font-bold flex items-center gap-1.5 hover:underline">
                                <ImagePlus size={14} /> Add Images
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {formData.images.map((img, idx) => (
                              <div key={idx} className="aspect-square bg-white rounded-2xl border border-gray-100 relative group overflow-hidden shadow-sm">
                                <img src={img} className="w-full h-full object-cover p-1 rounded-2xl" />
                                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            {formData.images.length < 6 && Array.from({ length: 6 - formData.images.length }).map((_, i) => (
                              <div key={`empty-${i}`} onClick={triggerGalleryUpload} className="aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white hover:border-primary/30 transition-all text-gray-300">
                                <Plus size={20} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Tag size={14} className="text-primary" /> Financial Profile
                        </label>
                        <div className="space-y-6">
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                            <input required type="number" placeholder="Master Price" className="w-full bg-lightGray/50 pl-12 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-xl border border-transparent" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                          </div>
                          <div className="relative">
                            <Barcode className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                            <input type="text" placeholder="Global Parent SKU" className="w-full bg-lightGray/50 pl-14 pr-6 py-5 rounded-2xl border border-transparent uppercase tracking-widest font-bold" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-8 space-y-12">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Product Name</label>
                          <input required type="text" className="w-full bg-white px-8 py-5 rounded-2xl border border-gray-100 font-bold text-lg focus:border-primary/30 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Classification</label>
                          <select className="w-full bg-white px-8 py-5 rounded-2xl border border-gray-100 font-bold text-lg focus:border-primary/30 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-8 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-2xl tracking-tight text-dark">Attribute Designer</h3>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => applyPreset('size')} className="text-[10px] font-bold px-4 py-2 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center gap-2">Size Preset</button>
                            <button type="button" onClick={() => applyPreset('color')} className="text-[10px] font-bold px-4 py-2 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center gap-2">Color Preset</button>
                            <button type="button" onClick={addVariantGroup} className="bg-primary text-white font-bold text-xs flex items-center gap-2 px-7 py-3 rounded-2xl transition-all shadow-lg shadow-primary/30">
                              <PlusCircle size={20} /> Add Attribute
                            </button>
                          </div>
                        </div>
                        {formData.variants.map((group, gIdx) => (
                          <div key={gIdx} className="bg-gray-50/80 p-8 rounded-[2rem] border border-gray-100 mb-6">
                            <div className="flex gap-4 items-end mb-4">
                              <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                <input placeholder="Attribute Name" className="w-full bg-white px-6 py-3 rounded-xl border focus:border-primary/40 outline-none font-bold" value={group.name} onChange={e => updateVariantGroupName(gIdx, e.target.value)} />
                              </div>
                              <button type="button" onClick={() => removeVariantGroup(gIdx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl mb-0.5"><Trash2 size={20} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center bg-white px-4 py-2 rounded-xl border gap-2 shadow-sm">
                                  <input placeholder="Value" className="w-20 text-xs font-bold bg-transparent outline-none" value={opt} onChange={e => updateVariantOption(gIdx, oIdx, e.target.value)} />
                                  <button type="button" onClick={() => removeVariantOption(gIdx, oIdx)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                                </div>
                              ))}
                              <button type="button" onClick={() => addVariantOption(gIdx)} className="text-primary text-[10px] font-bold px-4 py-2 bg-white border border-primary/20 rounded-xl hover:bg-primary/5">+ Add</button>
                            </div>
                          </div>
                        ))}

                        {formData.variants.length > 0 && (
                          <div className="pt-10 border-t border-gray-100 space-y-6">
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-xl tracking-tight text-dark">Inventory Matrix</h3>
                              <button type="button" onClick={generateCombinations} className="bg-dark text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary transition-all">
                                <RefreshCw size={16} /> Sync Matrix
                              </button>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-lightGray/50">
                                  <tr className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Media</th>
                                    <th className="px-6 py-4">Config</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {formData.inventory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                      <td className="px-6 py-3">
                                        <div className="relative group/var w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center cursor-pointer" onClick={() => triggerVariantUpload(idx)}>
                                          {item.image ? (
                                            <img src={item.image} className="w-full h-full object-cover" alt="V" />
                                          ) : (
                                            <ImageIcon size={14} className="text-gray-300" />
                                          )}
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/var:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload size={12} className="text-white" />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="flex gap-1">
                                          {Object.values(item.options).map((v, i) => (
                                            <span key={i} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold">{v}</span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="px-6 py-3">
                                        <input className="bg-transparent font-mono text-[10px] w-24 outline-none border-b border-transparent focus:border-primary/30 font-bold" value={item.sku || ''} onChange={e => updateInventoryField(idx, 'sku', e.target.value)} />
                                      </td>
                                      <td className="px-6 py-3">
                                        <input type="number" className="bg-transparent font-bold w-12 outline-none border-b border-transparent focus:border-primary/30" value={item.stock} onChange={e => updateInventoryField(idx, 'stock', e.target.value)} />
                                      </td>
                                      <td className="px-6 py-3">
                                        <input type="number" placeholder="Master" className="bg-transparent font-bold w-16 outline-none border-b border-transparent focus:border-primary/30 text-right" value={item.price || ''} onChange={e => updateInventoryField(idx, 'price', e.target.value)} />
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
                  </div>
                </form>
              </div>

              <div className="p-10 bg-gray-50 border-t border-gray-100 flex gap-8 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 font-bold text-gray-500 hover:text-dark transition-colors uppercase tracking-widest text-xs">Cancel Session</button>
                <button 
                  onClick={triggerSubmit}
                  className="flex-[2] bg-primary text-white py-6 rounded-[2.5rem] font-bold hover:shadow-2xl transition-all shadow-xl shadow-primary/30 uppercase text-base flex items-center justify-center gap-4 group"
                >
                  <CheckCircle2 size={26} className="group-hover:scale-110 transition-transform" /> 
                  {editingProduct ? 'Commit Changes' : 'Publish to Catalog'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
