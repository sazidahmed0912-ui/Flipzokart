"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
;
import {
    Search, Filter, Star, Trash2, MessageSquare,
    ChevronDown, User, Package, AlertTriangle, Check
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchAllReviews, deleteReview } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';
import { useApp } from '@/app/store/Context';
import { Review } from '@/app/types';



export const AdminReviews: React.FC = () => {
    const { user: currentUser } = useApp();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('All');
    const { addToast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const { data } = await fetchAllReviews();
            const list = data.data || [];
            setReviews(list);
            setFilteredReviews(list);
        } catch (error) {
            console.error("Failed to load reviews", error);
            addToast('error', 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let results = reviews;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(r =>
                r.comment.toLowerCase().includes(lower) ||
                r.user?.name?.toLowerCase().includes(lower) ||
                r.product?.name?.toLowerCase().includes(lower)
            );
        }

        if (ratingFilter !== 'All') {
            const rating = parseInt(ratingFilter);
            results = results.filter(r => r.rating === rating);
        }

        setFilteredReviews(results);
    }, [searchTerm, ratingFilter, reviews]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

        try {
            await deleteReview(id);
            addToast('success', 'Review deleted successfully');
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            addToast('error', 'Failed to delete review');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} stroke="currentColor" />
                ))}
            </div>
        );
    };

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
                            placeholder="Search reviews, products, or users..."
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
                                    {currentUser?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{currentUser?.name?.split(' ')[0] || 'Admin'}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <SmoothReveal direction="down">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Review Moderation</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage customer feedback and ratings</p>
                            </div>
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
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                            >
                                <option value="All">All Ratings</option>
                                <option value="5">5 Star Only</option>
                                <option value="4">4 Star Only</option>
                                <option value="3">3 Star Only</option>
                                <option value="2">2 Star Only</option>
                                <option value="1">1 Star Only</option>
                            </select>
                        </div>
                    </SmoothReveal>

                    {/* Reviews Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredReviews.map((review, idx) => (
                            <SmoothReveal key={review._id} direction="up" delay={idx * 50}>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">

                                    {/* Header: User & Rating */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{review.user?.name || 'Unknown User'}</p>
                                                <div className="flex gap-2 items-center mt-0.5">
                                                    {renderStars(review.rating)}
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Review"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                                    </div>

                                    {/* Product Footer */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                        {review.product ? (
                                            <>
                                                <img src={review.product.image} className="w-8 h-8 rounded-md bg-gray-50 object-cover" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-700 truncate">{review.product.name}</p>
                                                    <Link href={`/product/${review.product._id}`} className="text-[10px] text-[#2874F0] hover:underline">View Product</Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <AlertTriangle size={14} />
                                                <span className="text-xs italic">Product Deleted</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SmoothReveal>
                        ))}
                    </div>

                    {filteredReviews.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <MessageSquare size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-gray-500 font-bold">No reviews found</h3>
                            <p className="text-sm text-gray-400 mt-1">Your store is quiet for now</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
