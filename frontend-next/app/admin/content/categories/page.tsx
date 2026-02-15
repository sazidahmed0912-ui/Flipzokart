'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/app/constants';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function CategoriesListPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Category Content</h2>
                <p className="text-sm text-gray-500">Select a category to manage its banner and subcategory icons.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                    <Link
                        key={category}
                        href={`/admin/content/categories/${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                        className="block group"
                    >
                        <div className="bg-white border rounded-xl p-6 flex items-center justify-between hover:border-[#2874F0] hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-[#2874F0] rounded-lg flex items-center justify-center font-bold text-xl">
                                    {category.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 group-hover:text-[#2874F0] transition-colors">{category}</h3>
                                    <p className="text-xs text-gray-400">Manage Content</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-[#2874F0] transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
