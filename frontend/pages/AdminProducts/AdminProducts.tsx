import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Plus, Edit, Trash2,
    Package, CheckCircle, AlertTriangle, XCircle,
    MoreVertical, ChevronDown, Tag
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { SmoothReveal } from '../../components/SmoothReveal';
import CircularGlassSpinner from '../../components/CircularGlassSpinner';
import { fetchProducts, deleteProduct } from '../../services/adminService';
import { useToast } from '../../components/toast';
import { useApp } from '../../store/Context';

interface Product {
    _id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    images?: string[];
    thumbnail?: string;
    category: string;
    countInStock: number;
    description: string;
}

export const AdminProducts: React.FC = () => {
    const { user } = useApp();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const { addToast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        console.log("Admin Product List Version: v2.5 Check");
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data } = await fetchProducts();
            // data might be array or { products: [] } depending on API.
            // Based on productRoutes.js (Line 71): res.status(200).json(products);
            // It returns an array directly.
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

    useEffect(() => {
        let results = products;

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(lower));
        }

        // Category Filter
        if (categoryFilter !== 'All') {
            results = results.filter(p => p.category === categoryFilter);
        }

        // Stock Filter
        if (stockFilter !== 'All') {
            if (stockFilter === 'In Stock') results = results.filter(p => p.countInStock > 5);
            if (stockFilter === 'Low Stock') results = results.filter(p => p.countInStock <= 5 && p.countInStock > 0);
            if (stockFilter === 'Out of Stock') results = results.filter(p => p.countInStock === 0);
        }

        setFilteredProducts(results);
    }, [searchTerm, categoryFilter, stockFilter, products]);

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

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    if (loading) return <CircularGlassSpinner />;

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
                            <Link
                                to="/admin/products/new"
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#2874F0] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                            >
                                <Plus size={18} /> Add Product
                            </Link>
                        </div>
                    </SmoothReveal>

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
                        </div>
                    </SmoothReveal>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, idx) => (
                            <SmoothReveal key={product._id} direction="up" delay={idx * 50}>
                                <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 relative">

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
                                            src={product.image}
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
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                                            {product.originalPrice > product.price && (
                                                <>
                                                    <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                                                    <p className="text-xs font-bold text-green-600">
                                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-medium text-gray-500">
                                                Stock: <span className={product.countInStock < 5 ? 'text-red-500' : 'text-gray-800'}>{product.countInStock}</span>
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/products/edit/${product._id}`}
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
