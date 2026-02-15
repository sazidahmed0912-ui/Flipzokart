'use client';

import React from 'react';
import { useBuilder, Section } from './BuilderContext';
import { Layout, Image as ImageIcon, Grid, Type, ShoppingBag, CreditCard } from 'lucide-react';

const TOOLS: { type: Section['type']; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'hero', label: 'Hero Banner', icon: <Layout size={20} />, desc: 'Large banner with text & CTA' },
    { type: 'product-slider', label: 'Product Slider', icon: <ShoppingBag size={20} />, desc: 'Horizontal scroll of products' },
    { type: 'grid', label: 'Category Grid', icon: <Grid size={20} />, desc: 'Grid of images/links' },
    { type: 'text', label: 'Rich Text', icon: <Type size={20} />, desc: 'HTML content block' },
    { type: 'banner-strip', label: 'Offer Strip', icon: <CreditCard size={20} />, desc: 'Thin promotional image' },
];

export const SectionLibrary: React.FC = () => {
    const { addSection } = useBuilder();

    return (
        <div className="space-y-2">
            {TOOLS.map((tool) => (
                <button
                    key={tool.type}
                    onClick={() => addSection(tool.type)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all group text-left"
                >
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 group-hover:text-blue-500 transition-colors">
                        {tool.icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{tool.label}</h4>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{tool.desc}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
