"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';

interface Section {
    _id: string;
    title: string;
    order: number;
    createdAt: string;
}

export const AdminSections: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/sections');
            setSections((res.data || []).sort((a: Section, b: Section) => a.order - b.order));
        } catch {
            setError('Failed to load sections.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle.trim()) {
            setError('Please enter a section title.');
            return;
        }
        try {
            setAdding(true);
            setError('');
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/sections', { title: newTitle.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSections(prev => [...prev, res.data].sort((a, b) => a.order - b.order));
            setNewTitle('');
            setSuccessMsg(`"${res.data.title}" added at position #${res.data.order}`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to add section.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete section "${title}"? It will be removed from the homepage.`)) return;
        try {
            setDeletingId(id);
            const token = localStorage.getItem('token');
            await axios.delete(`/api/sections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSections(prev => prev.filter(s => s._id !== id));
            setSuccessMsg(`"${title}" deleted.`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Failed to delete section.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#2874F0]/10 rounded-xl flex items-center justify-center">
                    <Layers size={20} className="text-[#2874F0]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Section Headers</h1>
                    <p className="text-sm text-gray-500">New sections are always added at the bottom. Order is preserved automatically.</p>
                </div>
            </div>

            {/* Success / Error Banner */}
            {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
                    ✅ {successMsg}
                </div>
            )}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={15} />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Add Section Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Add New Section</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={e => { setNewTitle(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder='e.g. "Summer Sale", "Flash Deals", "Festive Offers"'
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent"
                        maxLength={80}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !newTitle.trim()}
                        className="flex items-center gap-2 bg-[#2874F0] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        {adding ? 'Adding…' : 'Add Section'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    ⚠️ New sections are always appended below the last one. Order is automatic.
                </p>
            </div>

            {/* Sections List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
                        Current Sections ({sections.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : sections.length === 0 ? (
                    <div className="p-12 text-center">
                        <Layers size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No sections yet.</p>
                        <p className="text-gray-300 text-sm">Add your first section header above.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {sections.map((section, idx) => (
                            <li key={section._id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors group">
                                {/* Order badge */}
                                <span className="w-7 h-7 rounded-full bg-[#2874F0]/10 text-[#2874F0] text-xs font-black flex items-center justify-center flex-shrink-0">
                                    {section.order}
                                </span>
                                <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                                <span className="flex-1 font-semibold text-gray-800">{section.title}</span>
                                <span className="text-xs text-gray-400 hidden md:block">
                                    Added {new Date(section.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => handleDelete(section._id, section.title)}
                                    disabled={deletingId === section._id}
                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    title="Delete section"
                                >
                                    {deletingId === section._id ? (
                                        <span className="text-xs text-red-400">…</span>
                                    ) : (
                                        <Trash2 size={15} />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Info box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
                <strong>💡 How it works:</strong> Each section header you add here will appear on the homepage <strong>below the Top Deals section</strong>.
                If a product in your catalog has <code className="bg-blue-100 px-1 rounded">section.title</code> set to match the name, its products are automatically grouped there.
            </div>
        </div>
    );
};

export default AdminSections;
