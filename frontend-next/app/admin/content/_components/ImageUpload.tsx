'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    label?: string;
    width?: string;
    height?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onRemove,
    label = 'Upload Image',
    width = 'w-full',
    height = 'h-48',
    className = ''
}) => {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (e.g. 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File too large (max 2MB)');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Correct endpoint for single upload
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onChange(res.data); // Expecting URL string response
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    if (value) {
        return (
            <div className={`relative ${width} ${height} rounded-lg overflow-hidden border border-gray-200 group ${className}`}>
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onRemove();
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className={`${width} ${height} ${className}`}>
            <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors relative">
                {loading ? (
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : (
                    <>
                        <Upload className="text-gray-400 mb-2" size={24} />
                        <span className="text-sm text-gray-500">{label}</span>
                    </>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={loading}
                />
            </label>
        </div>
    );
};
