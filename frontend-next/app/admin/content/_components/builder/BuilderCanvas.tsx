'use client';

import React from 'react';
import { useBuilder, Section } from './BuilderContext';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';

export const BuilderCanvas: React.FC<{ viewMode: 'mobile' | 'desktop' }> = ({ viewMode }) => {
    const { sections, setSections, selectedId, setSelectedId, removeSection } = useBuilder();

    const handleReorder = (newOrder: Section[]) => {
        setSections(newOrder);
    };

    if (sections.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 select-none">
                <div className="w-20 h-20 border-4 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">+</span>
                </div>
                <p className="font-bold text-lg">Your Canvas is Empty</p>
                <p className="text-sm">Click a component from the left to start building.</p>
            </div>
        );
    }

    return (
        <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="min-h-full">
            {sections.map((section) => (
                <CanvasItem
                    key={section.id}
                    section={section}
                    isSelected={section.id === selectedId}
                    onSelect={() => setSelectedId(section.id)}
                    onRemove={() => removeSection(section.id)}
                    viewMode={viewMode}
                />
            ))}
        </Reorder.Group>
    );
};

const CanvasItem: React.FC<{
    section: Section;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: (e: React.MouseEvent) => void;
    viewMode: 'mobile' | 'desktop';
}> = ({ section, isSelected, onSelect, onRemove, viewMode }) => {

    // Hide if not visible for current view, but show ghost in editor? 
    // Usually editor shows everything but maybe dimmed. 
    // Let's show everything in editor for now.

    return (
        <Reorder.Item
            value={section}
            className={`relative group bg-white ${isSelected ? 'ring-2 ring-blue-500 z-10' : 'hover:ring-1 hover:ring-blue-300'}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {/* Overlay Controls */}
            <div className={`absolute top-0 right-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isSelected ? 'opacity-100' : ''}`}>
                <button className="bg-white p-1 rounded shadow text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </button>
                <button
                    onClick={onRemove}
                    className="bg-white p-1 rounded shadow text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Content Preview Stub */}
            <div
                className="w-full relative overflow-hidden transition-all"
                style={{
                    paddingTop: section.styles.paddingTop,
                    paddingBottom: section.styles.paddingBottom,
                    backgroundColor: section.styles.backgroundColor
                }}
            >
                <div className={`mx-auto ${section.styles.container === 'contained' ? 'max-w-[95%] md:max-w-6xl' : 'w-full'}`}>
                    <PreviewContent section={section} />
                </div>
            </div>

            {/* Type Label */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-400 rounded uppercase tracking-wider pointer-events-none">
                {section.type}
            </div>
        </Reorder.Item>
    );
};

const PreviewContent: React.FC<{ section: Section }> = ({ section }) => {
    switch (section.type) {
        case 'hero':
            return (
                <div className="relative aspect-[3/1] bg-gray-200 rounded-lg flex flex-col justify-center items-center text-center p-4 overflow-hidden">
                    {section.props.imageUrl ? (
                        <img src={section.props.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                    ) : <span className="text-gray-400 text-xs">Hero Image</span>}
                    <div className="relative bg-black/30 p-4 rounded-xl text-white backdrop-blur-sm">
                        <h2 className="text-2xl font-bold">{section.props.title}</h2>
                        <p>{section.props.subtitle}</p>
                        <button className="mt-2 px-4 py-1 bg-white text-black text-xs font-bold rounded">{section.props.ctaText}</button>
                    </div>
                </div>
            );
        case 'product-slider':
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-bold">{section.props.title}</h3>
                        <span className="text-xs text-blue-600 font-bold">View All</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-40 aspect-[2/3] bg-white border rounded-lg shrink-0"></div>
                        ))}
                    </div>
                </div>
            );
        case 'grid':
            return (
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${section.props.columns || 3}, 1fr)` }}>
                    {[...Array(Number(section.props.columns || 3))].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Grid Item {i + 1}</div>
                    ))}
                </div>
            );
        case 'banner-strip':
            return (
                <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    {section.props.imageUrl ? <img src={section.props.imageUrl} className="w-full h-full object-cover rounded-lg" /> : 'Banner Strip'}
                </div>
            );
        case 'text':
            return <div dangerouslySetInnerHTML={{ __html: section.props.content }} className="prose max-w-none" />;
        default:
            return <div>Unknown Component</div>;
    }
};
