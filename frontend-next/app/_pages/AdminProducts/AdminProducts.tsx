"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Filter, Plus, Edit, Trash2,
    Package, ChevronDown, Banknote,
    ShieldCheck, X, Globe, ToggleLeft,
    ToggleRight, CheckSquare, Square, Loader2,
    CreditCard, AlertCircle
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchProducts, deleteProduct } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';
import { useApp } from '@/app/store/Context';
import { getProductImage } from '@/app/utils/imageHelper';
import API from '@/app/services/api';

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    countInStock: number;
    description: string;
    codAvailable?: boolean;
    prepaidAvailable?: boolean;
}

interface GlobalPaymentStats {
    totalProducts: number;
    codDisabledCount: number;
    prepaidDisabledCount: number;
    globalCodEnabled: boolean;
    globalPrepaidEnabled: boolean;
}

// Helper: derive payment mode label
const getPaymentMode = (p: Product) => {
    const cod = p.codAvailable !== false;
    const prepaid = p.prepaidAvailable !== false;
    if (cod && prepaid) return 'both';
    if (cod) return 'cod';
    if (prepaid) return 'prepaid';
    return 'none';
};

const PaymentModeBadge = ({ product }: { product: Product }) => {
    const mode = getPaymentMode(product);
    const styles: Record<string, string> = {
        both: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cod: 'bg-amber-50 text-amber-700 border-amber-200',
        prepaid: 'bg-blue-50 text-blue-700 border-blue-200',
        none: 'bg-red-50 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
        both: '💳 COD + Online',
        cod: '💵 COD Only',
        prepaid: '🔒 Online Only',
        none: '⛔ None',
    };
    return (
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${styles[mode]}`}>
            {labels[mode]}
        </span>
    );
};

export const AdminProducts: React.FC = () => {
    const { user } = useApp();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const { addToast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Bulk select state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkMode, setBulkMode] = useState<'cod' | 'prepaid' | 'both' | 'none'>('both');
    const [bulkSaving, setBulkSaving] = useState(false);

    // Global override state
    const [globalStats, setGlobalStats] = useState<GlobalPaymentStats | null>(null);
    const [globalSaving, setGlobalSaving] = useState(false);
    const [showGlobalPanel, setShowGlobalPanel] = useState(false);

    useEffect(() => {
        loadProducts();
        loadGlobalStats();
    }, []);

    const loadProducts = async () => {
        try {
            const { data } = await fetchProducts();
            const productList = Array.isArray(data) ? data : (data.products || []);
            setProducts(productList);
            setFilteredProducts(productList);
        } catch (error) {
            console.error("Failed to load products", error);
            addToast('error', 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadGlobalStats = async () => {
        try {
            const { data } = await API.get('/api/admin/settings/payment');
            if (data.success) setGlobalStats(data.stats);
        } catch (e) {
            console.error('Failed to load global payment stats', e);
        }
    };

    useEffect(() => {
        let results = products;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(lower));
        }
        if (categoryFilter !== 'All') {
            results = results.filter(p => p.category === categoryFilter);
        }
        if (stockFilter !== 'All') {
            if (stockFilter === 'In Stock') results = results.filter(p => p.countInStock > 5);
            if (stockFilter === 'Low Stock') results = results.filter(p => p.countInStock <= 5 && p.countInStock > 0);
            if (stockFilter === 'Out of Stock') results = results.filter(p => p.countInStock === 0);
        }
        if (paymentFilter !== 'All') {
            results = results.filter(p => getPaymentMode(p) === paymentFilter);
        }

        setFilteredProducts(results);
        // Clear selection when filter changes
        setSelectedIds(new Set());
    }, [searchTerm, categoryFilter, stockFilter, paymentFilter, products]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            addToast('success', 'Product deleted successfully');
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            addToast('error', 'Failed to delete product');
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p._id)));
        }
    };

    const handleBulkSave = async () => {
        if (selectedIds.size === 0) return;
        setBulkSaving(true);
        try {
            const codAvailable = bulkMode === 'cod' || bulkMode === 'both';
            const prepaidAvailable = bulkMode === 'prepaid' || bulkMode === 'both';

            if (!codAvailable && !prepaidAvailable) {
                addToast('error', 'At least one payment method must be enabled');
                return;
            }

            await API.patch('/api/admin/products/payment-mode/bulk', {
                productIds: Array.from(selectedIds),
                codAvailable,
                prepaidAvailable
            });

            // Optimistically update local state
            setProducts(prev => prev.map(p =>
                selectedIds.has(p._id) ? { ...p, codAvailable, prepaidAvailable } : p
            ));
            setSelectedIds(new Set());
            addToast('success', `Payment mode updated for ${selectedIds.size} product(s)`);
        } catch (err: any) {
            addToast('error', err.response?.data?.message || 'Bulk update failed');
        } finally {
            setBulkSaving(false);
        }
    };

    const handleGlobalOverride = async (globalCodEnabled: boolean, globalPrepaidEnabled: boolean = true) => {
        setGlobalSaving(true);
        try {
            await API.put('/api/admin/settings/payment', { globalCodEnabled, globalPrepaidEnabled });
            // Refresh everything
            await loadProducts();
            await loadGlobalStats();
            addToast('success', `COD ${globalCodEnabled ? 'enabled' : 'disabled'} globally`);
        } catch (err: any) {
            addToast('error', err.response?.data?.message || 'Global update failed');
        } finally {
            setGlobalSaving(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    if (loading) return <CircularGlassSpinner />;

    const hasSelection = selectedIds.size > 0;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
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
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <SmoothReveal direction="down">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage your store catalog</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Global Override Toggle */}
                                <button
                                    onClick={() => setShowGlobalPanel(!showGlobalPanel)}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-100 transition-all"
                                >
                                    <Globe size={16} />
                                    Global Override
                                </button>
                                <Link href="/admin/products/new"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2874F0] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                                >
                                    <Plus size={18} /> Add Product
                                </Link>
                            </div>
                        </div>
                    </SmoothReveal>

                    {/* 🌐 Global Payment Override Panel */}
                    {showGlobalPanel && (
                        <SmoothReveal direction="down">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
                                            <Globe size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Global Payment Override</h3>
                                            <p className="text-xs text-gray-500">Instantly update ALL products store-wide</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowGlobalPanel(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={18} />
                                    </button>
                                </div>

                                {globalStats && (
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <p className="text-2xl font-bold text-gray-800">{globalStats.totalProducts}</p>
                                            <p className="text-xs text-gray-500 mt-1">Total Products</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <p className="text-2xl font-bold text-amber-600">{globalStats.codDisabledCount}</p>
                                            <p className="text-xs text-gray-500 mt-1">COD Disabled</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <p className="text-2xl font-bold text-blue-600">{globalStats.prepaidDisabledCount}</p>
                                            <p className="text-xs text-gray-500 mt-1">Online Disabled</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleGlobalOverride(true, true)}
                                        disabled={globalSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                                    >
                                        {globalSaving ? <Loader2 size={14} className="animate-spin" /> : <ToggleRight size={16} />}
                                        Enable All (COD + Online)
                                    </button>
                                    <button
                                        onClick={() => handleGlobalOverride(false, true)}
                                        disabled={globalSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                                    >
                                        {globalSaving ? <Loader2 size={14} className="animate-spin" /> : <ToggleLeft size={16} />}
                                        Disable COD Globally
                                    </button>
                                    <button
                                        onClick={() => handleGlobalOverride(true, false)}
                                        disabled={globalSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-all disabled:opacity-50"
                                    >
                                        {globalSaving ? <Loader2 size={14} className="animate-spin" /> : <ToggleLeft size={16} />}
                                        Disable Online Globally
                                    </button>
                                </div>
                                <p className="text-xs text-amber-700 mt-3 flex items-center gap-1.5">
                                    <AlertCircle size={12} /> Warning: These actions update ALL products instantly. Cannot be undone easily.
                                </p>
                            </div>
                        </SmoothReveal>
                    )}

                    {/* 🗂️ Bulk Edit Bar — appears on selection */}
                    {hasSelection && (
                        <SmoothReveal direction="down">
                            <div className="flex flex-wrap items-center gap-4 bg-[#2874F0] text-white px-6 py-4 rounded-2xl shadow-lg shadow-blue-200">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <CheckSquare size={18} />
                                    {selectedIds.size} selected
                                </div>
                                <div className="h-5 border-r border-blue-300" />
                                <span className="text-sm font-medium text-blue-100">Set payment mode:</span>
                                <select
                                    value={bulkMode}
                                    onChange={e => setBulkMode(e.target.value as any)}
                                    className="bg-white text-gray-800 border-0 rounded-lg px-3 py-1.5 text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="both">💳 COD + Online</option>
                                    <option value="cod">💵 COD Only</option>
                                    <option value="prepaid">🔒 Online Only</option>
                                </select>
                                <button
                                    onClick={handleBulkSave}
                                    disabled={bulkSaving}
                                    className="flex items-center gap-2 px-5 py-1.5 bg-white text-[#2874F0] rounded-lg text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
                                >
                                    {bulkSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                                    Apply
                                </button>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 rounded-lg text-xs font-bold hover:bg-blue-800"
                                >
                                    <X size={14} /> Clear
                                </button>
                            </div>
                        </SmoothReveal>
                    )}

                    {/* Filters */}
                    <SmoothReveal direction="up" delay={100}>
                        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-700">Filter By:</span>
                            </div>

                            <select
                                className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select
                                className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                            >
                                <option value="All">All Stock Levels</option>
                                <option value="In Stock">In Stock ({'>'}5)</option>
                                <option value="Low Stock">Low Stock (1-5)</option>
                                <option value="Out of Stock">Out of Stock (0)</option>
                            </select>

                            {/* 🔒 Payment Mode Filter */}
                            <select
                                className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                                <option value="All">All Payment Types</option>
                                <option value="both">💳 COD + Online</option>
                                <option value="cod">💵 COD Only</option>
                                <option value="prepaid">🔒 Online Only</option>
                                <option value="none">⛔ None</option>
                            </select>

                            {/* Select All for Bulk Edit */}
                            <button
                                onClick={toggleSelectAll}
                                className="ml-auto flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-xs font-bold text-gray-600 hover:text-blue-600 rounded-lg transition-all"
                            >
                                {selectedIds.size === filteredProducts.length && filteredProducts.length > 0
                                    ? <CheckSquare size={14} className="text-blue-500" />
                                    : <Square size={14} />
                                }
                                {selectedIds.size === filteredProducts.length && filteredProducts.length > 0
                                    ? 'Deselect All'
                                    : 'Select All'
                                }
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, idx) => (
                            <SmoothReveal key={product._id} direction="up" delay={idx * 50}>
                                <div
                                    className={`group bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 relative cursor-pointer ${selectedIds.has(product._id)
                                        ? 'border-[#2874F0] ring-2 ring-blue-200 shadow-md'
                                        : 'border-gray-100'
                                        }`}
                                    onClick={() => toggleSelect(product._id)}
                                >
                                    {/* Selection checkbox indicator */}
                                    <div className={`absolute top-3 left-3 z-20 transition-all ${selectedIds.has(product._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedIds.has(product._id) ? 'bg-[#2874F0]' : 'bg-white border-2 border-gray-300'}`}>
                                            {selectedIds.has(product._id) && (
                                                <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                                                    <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        {product.countInStock === 0 ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-200">Out of Stock</span>
                                        ) : product.countInStock <= 5 ? (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-[10px] font-bold rounded-lg border border-yellow-200">Low Stock</span>
                                        ) : null}
                                    </div>

                                    <div className="h-48 bg-gray-50 relative overflow-hidden">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-[#2874F0] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                {product.category}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{product.name}</h3>
                                        <p className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</p>

                                        {/* 🔒 Payment Mode Badge */}
                                        <div className="mt-2">
                                            <PaymentModeBadge product={product} />
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50"
                                            onClick={e => e.stopPropagation()} // Prevent card click when clicking edit/delete
                                        >
                                            <p className="text-xs font-medium text-gray-500">
                                                Stock: <span className={product.countInStock < 5 ? 'text-red-500' : 'text-gray-800'}>{product.countInStock}</span>
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/products/edit/${product._id}`}
                                                    className="p-1.5 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SmoothReveal>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <Package size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-gray-500 font-bold">No products found</h3>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
