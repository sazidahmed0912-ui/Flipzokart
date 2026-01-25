import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle, CheckCircle, Package, RefreshCw,
    Search, TrendingUp, DollarSign, ChevronDown, Save
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { SmoothReveal } from '../../components/SmoothReveal';
import CircularGlassSpinner from '../../components/CircularGlassSpinner';
import { fetchProducts, updateProduct } from '../../services/adminService';
import { useToast } from '../../components/toast';
import { useApp } from '../../store/Context';

interface Product {
    _id: string;
    name: string;
    countInStock: number;
    price: number;
    image: string;
    category: string;
}

export const AdminInventory: React.FC = () => {
    const { user } = useApp();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [quickAddAmount, setQuickAddAmount] = useState<{ [key: string]: number }>({});
    const { addToast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const { data } = await fetchProducts();
            const list = Array.isArray(data) ? data : (data.products || []);
            // Sort by low stock first
            setProducts(list.sort((a: Product, b: Product) => a.countInStock - b.countInStock));
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async (id: string, currentStock: number) => {
        const amount = quickAddAmount[id] || 0;
        if (amount <= 0) return;

        setUpdatingId(id);
        try {
            const newStock = currentStock + amount;
            await updateProduct(id, { countInStock: newStock });
            addToast('success', 'Stock updated');

            // Update local state
            setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
            setQuickAddAmount(prev => ({ ...prev, [id]: 0 })); // Reset input
        } catch (error) {
            addToast('error', 'Failed to update stock');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <CircularGlassSpinner />;

    const lowStockItems = products.filter(p => p.countInStock <= 5);
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.countInStock), 0);
    const totalItems = products.reduce((acc, p) => acc + p.countInStock, 0);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-[#2874F0]" size={20} /> Inventory Manager
                    </h1>
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
                </header>

                <div className="p-8 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Low Stock Items', value: lowStockItems.length, color: 'text-red-500', bg: 'bg-red-50', icon: AlertTriangle },
                            { label: 'Total Items In Stock', value: totalItems, color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
                            { label: 'Inventory Value', value: `₹${totalValue.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50', icon: DollarSign },
                        ].map((stat, i) => (
                            <SmoothReveal key={i} direction="up" delay={i * 100}>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </div>
                            </SmoothReveal>
                        ))}
                    </div>

                    {/* Low Stock Table */}
                    <SmoothReveal direction="up" delay={300}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Stock Status</h3>
                                <button onClick={loadInventory} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Current Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Quick Add</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map(product => (
                                            <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.image} className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100" />
                                                        <div className="min-w-0 max-w-[200px]">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400">{product.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">₹{product.price.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.countInStock}</td>
                                                <td className="px-6 py-4">
                                                    {product.countInStock === 0 ? (
                                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-lg uppercase">Out of Stock</span>
                                                    ) : product.countInStock <= 5 ? (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-[10px] font-bold rounded-lg uppercase">Low Stock</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-lg uppercase">In Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#2874F0]"
                                                            placeholder="+ Qty"
                                                            min="1"
                                                            value={quickAddAmount[product._id] || ''}
                                                            onChange={(e) => setQuickAddAmount(prev => ({ ...prev, [product._id]: parseInt(e.target.value) }))}
                                                        />
                                                        <button
                                                            onClick={() => handleQuickAdd(product._id, product.countInStock)}
                                                            disabled={updatingId === product._id || !quickAddAmount[product._id]}
                                                            className="p-1.5 bg-[#2874F0] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
