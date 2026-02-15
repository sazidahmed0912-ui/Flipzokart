'use client';

import React from 'react';
import { useBuilder } from './BuilderContext';
import { ImageUpload } from '../ImageUpload';

export const PropertiesPanel: React.FC = () => {
    const { selectedId, sections, updateSection } = useBuilder();
    const section = sections.find(s => s.id === selectedId);

    if (!selectedId || !section) {
        return <div className="p-8 text-center text-gray-400 text-sm">Select a section to edit properties.</div>;
    }

    const handleChange = (path: string, value: any) => {
        updateSection(selectedId, path, value);
    };

    return (
        <div className="p-4 space-y-8">
            {/* Common Styles */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Layout & Spacing</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Padding Top</label>
                        <input type="text" value={section.styles.paddingTop} onChange={(e) => handleChange('styles.paddingTop', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Padding Bottom</label>
                        <input type="text" value={section.styles.paddingBottom} onChange={(e) => handleChange('styles.paddingBottom', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={section.styles.backgroundColor || '#ffffff'} onChange={(e) => handleChange('styles.backgroundColor', e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                            <input type="text" value={section.styles.backgroundColor} onChange={(e) => handleChange('styles.backgroundColor', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Container</label>
                        <select value={section.styles.container} onChange={(e) => handleChange('styles.container', e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
                            <option value="contained">Boxed</option>
                            <option value="full">Full Width</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Visibility */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Visibility</h4>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={section.visibility.mobile} onChange={(e) => handleChange('visibility.mobile', e.target.checked)} /> Mobile
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={section.visibility.desktop} onChange={(e) => handleChange('visibility.desktop', e.target.checked)} /> Desktop
                    </label>
                </div>
            </div>

            {/* Specific Props */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Content Settings</h4>

                {section.type === 'hero' && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                            <input type="text" value={section.props.title} onChange={(e) => handleChange('props.title', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                            <input type="text" value={section.props.subtitle} onChange={(e) => handleChange('props.subtitle', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
                            <ImageUpload value={section.props.imageUrl} onChange={(url) => handleChange('props.imageUrl', url)} onRemove={() => handleChange('props.imageUrl', '')} height="h-32" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                                <input type="text" value={section.props.ctaText} onChange={(e) => handleChange('props.ctaText', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                                <input type="text" value={section.props.ctaLink} onChange={(e) => handleChange('props.ctaLink', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                            </div>
                        </div>
                    </>
                )}

                {section.type === 'product-slider' && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Section Title</label>
                            <input type="text" value={section.props.title} onChange={(e) => handleChange('props.title', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Data Source</label>
                            <select value={section.props.source} onChange={(e) => handleChange('props.source', e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
                                <option value="trending">Trending Now</option>
                                <option value="new_arrivals">New Arrivals</option>
                                <option value="best_sellers">Best Sellers</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Product Limit</label>
                            <input type="number" value={section.props.limit} onChange={(e) => handleChange('props.limit', Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                    </>
                )}

                {section.type === 'grid' && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Columns</label>
                            <select value={section.props.columns} onChange={(e) => handleChange('props.columns', Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm">
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                                <option value={6}>6 Columns</option>
                            </select>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                            Grid item management coming soon. For now it renders placeholders.
                        </div>
                    </>
                )}
                {section.type === 'banner-strip' && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
                            <ImageUpload value={section.props.imageUrl} onChange={(url) => handleChange('props.imageUrl', url)} onRemove={() => handleChange('props.imageUrl', '')} height="h-24" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                            <input type="text" value={section.props.link} onChange={(e) => handleChange('props.link', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                        </div>
                    </>
                )}
                {section.type === 'text' && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">HTML Content</label>
                        <textarea value={section.props.content} onChange={(e) => handleChange('props.content', e.target.value)} className="w-full border rounded px-2 py-1 text-sm font-mono" rows={10} />
                    </div>
                )}
            </div>
        </div>
    );
};
