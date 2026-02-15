'use client';

import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Loader2, Smartphone, Monitor, ChevronLeft, Save, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionLibrary } from './SectionLibrary';
import { BuilderCanvas } from './BuilderCanvas';
import { PropertiesPanel } from './PropertiesPanel';

export const BuilderUI: React.FC<{ slug: string }> = ({ slug }) => {
    const { loading, saving, saveDraft, publishLayout, loadLayout } = useBuilder();
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const router = useRouter();

    React.useEffect(() => {
        loadLayout(slug);
    }, [slug]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="h-screen flex flex-col bg-[#F5F7FA] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft size={20} /></button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Page Builder</h1>
                        <p className="text-xs text-gray-500 capitalize">{slug.replace(/-/g, ' ')}</p>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Desktop View"
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Mobile View"
                    >
                        <Smartphone size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => saveDraft(slug)}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => publishLayout(slug)}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-bold text-white bg-[#2874F0] rounded-lg hover:bg-blue-600 shadow-md flex items-center gap-2"
                    >
                        <UploadCloud size={16} />
                        Publish
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Library */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-700 text-sm">Components</div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <SectionLibrary />
                    </div>
                </aside>

                {/* Center: Canvas */}
                <main className="flex-1 bg-gray-100/50 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center">
                        <div
                            className={`transition-all duration-300 ease-in-out bg-white shadow-xl min-h-[800px] border border-gray-200 ${viewMode === 'mobile' ? 'w-[375px] rounded-3xl border-gray-300' : 'w-full max-w-[1200px] rounded-none'
                                }`}
                        >
                            <BuilderCanvas viewMode={viewMode} />
                        </div>
                    </div>
                </main>

                {/* Right: Properties */}
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-700 text-sm">Properties</div>
                    <div className="flex-1 overflow-y-auto">
                        <PropertiesPanel />
                    </div>
                </aside>
            </div>
        </div>
    );
};
