'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '@/app/services/api';
import { useToast } from '@/app/components/toast';

export interface Section {
    id: string;
    type: 'hero' | 'product-slider' | 'grid' | 'text' | 'banner-strip';
    props: Record<string, any>;
    styles: {
        paddingTop?: string;
        paddingBottom?: string;
        backgroundColor?: string;
        container?: 'contained' | 'full';
    };
    visibility: {
        mobile: boolean;
        desktop: boolean;
    };
}

interface BuilderContextType {
    sections: Section[];
    setSections: (sections: Section[]) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;

    // Actions
    addSection: (type: Section['type']) => void;
    removeSection: (id: string) => void;
    updateSection: (id: string, path: string, value: any) => void; // Generic update
    moveSection: (dragIndex: number, hoverIndex: number) => void;

    // Saving
    loading: boolean;
    saving: boolean;
    loadLayout: (slug: string) => Promise<void>;
    saveDraft: (slug: string) => Promise<void>;
    publishLayout: (slug: string) => Promise<void>;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const addSection = (type: Section['type']) => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            type,
            props: getDefaultProps(type),
            styles: { paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#ffffff', container: 'contained' },
            visibility: { mobile: true, desktop: true }
        };
        setSections([...sections, newSection]);
        setSelectedId(newSection.id);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateSection = (id: string, path: string, value: any) => {
        setSections(prev => prev.map(section => {
            if (section.id !== id) return section;

            // Deep update logic
            const newSection = { ...section };

            if (path.startsWith('props.')) {
                newSection.props = { ...newSection.props, [path.split('.')[1]]: value };
            } else if (path.startsWith('styles.')) {
                newSection.styles = { ...newSection.styles, [path.split('.')[1]]: value };
            } else if (path.startsWith('visibility.')) {
                newSection.visibility = { ...newSection.visibility, [path.split('.')[1]]: value };
            }

            return newSection;
        }));
    };

    const moveSection = (dragIndex: number, hoverIndex: number) => {
        const newSections = [...sections];
        const draggedItem = newSections[dragIndex];
        newSections.splice(dragIndex, 1);
        newSections.splice(hoverIndex, 0, draggedItem);
        setSections(newSections);
    };

    const loadLayout = async (slug: string) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/api/admin/categories/${slug}/layout`);
            // Prefer draft if exists and not empty, otherwise published
            const loaded = data.draft && data.draft.length > 0 ? data.draft : (data.published || []);
            setSections(loaded);
        } catch (error) {
            console.error(error);
            addToast('error', 'Failed to load layout');
        } finally {
            setLoading(false);
        }
    };

    const saveDraft = async (slug: string) => {
        setSaving(true);
        try {
            await API.post(`/api/admin/categories/${slug}/layout`, { layout: sections });
            addToast('success', 'Draft Saved');
        } catch (error) {
            addToast('error', 'Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const publishLayout = async (slug: string) => {
        if (!confirm('Publish this layout to the live site?')) return;
        setSaving(true);
        try {
            await API.post(`/api/admin/categories/${slug}/publish`, {});
            addToast('success', 'Layout Published!');
        } catch (error) {
            addToast('error', 'Failed to publish');
        } finally {
            setSaving(false);
        }
    };

    const getDefaultProps = (type: Section['type']) => {
        switch (type) {
            case 'hero': return { title: 'Welcome', subtitle: 'Explore our collection', imageUrl: '', ctaText: 'Shop Now', ctaLink: '/shop' };
            case 'product-slider': return { title: 'Trending Products', source: 'trending', limit: 8 };
            case 'grid': return { columns: 3, items: [] }; // items: { image, link }
            case 'text': return { content: '<h2>Rich Text Section</h2><p>Add your content here...</p>' };
            case 'banner-strip': return { imageUrl: '', link: '' };
            default: return {};
        }
    };

    return (
        <BuilderContext.Provider value={{
            sections, setSections, selectedId, setSelectedId,
            addSection, removeSection, updateSection, moveSection,
            loading, saving, loadLayout, saveDraft, publishLayout
        }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder must be used within BuilderProvider');
    return context;
};
