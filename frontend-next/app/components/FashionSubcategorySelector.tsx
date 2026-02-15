"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';

interface FashionSubcategorySelectorProps {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

type Gender = 'Men' | 'Women' | 'Kids';

const FASHION_HIERARCHY: Record<string, string[]> = {
    Men: ["Shirts", "T-Shirts", "Jeans", "Shoes", "Watches", "Activewear"],
    Women: ["Kurti", "Saree", "Dresses", "Handbags", "Heels", "Jewellery"],
    Kids: ["Boys Wear", "Girls Wear", "Kids Shoes", "Toys", "School Bags", "Accessories"]
};

export const FashionSubcategorySelector: React.FC<FashionSubcategorySelectorProps> = ({ value, onChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredGender, setHoveredGender] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (gender: string, sub: string) => {
        // Format: "Men > Shirts"
        const finalValue = `${gender} > ${sub}`;
        onChange(finalValue);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Calculate display text
    const displayText = value ? value : "Select Fashion Category";
    const isPlaceholder = !value;

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Fashion Subcategory <span className="text-red-500">*</span></label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full px-4 py-2 text-left border rounded-xl text-sm font-medium flex justify-between items-center bg-white transition-all ${error
                        ? 'border-red-300 ring-2 ring-red-50'
                        : isOpen
                            ? 'border-blue-500 ring-2 ring-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <span className={isPlaceholder ? "text-gray-400 font-normal" : "text-gray-800"}>
                    {displayText}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {error && <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">Please select a valid subcategory</p>}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 flex shadow-2xl rounded-xl overflow-hidden border border-gray-100 bg-white animate-in fade-in slide-in-from-top-1 duration-200 origin-top-left min-w-[520px]">

                    {/* Level 1: Gender Column */}
                    <div className="w-[260px] bg-white border-r border-gray-100 py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Select Gender
                        </div>
                        {Object.keys(FASHION_HIERARCHY).map((gender) => (
                            <div
                                key={gender}
                                onMouseEnter={() => setHoveredGender(gender)}
                                onClick={() => setHoveredGender(gender)} // Touch support
                                className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${hoveredGender === gender
                                        ? 'bg-gray-50 text-blue-600 font-semibold border-l-4 border-blue-500 pl-3'
                                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent pl-3'
                                    }`}
                            >
                                <span className="text-sm">{gender}</span>
                                <ChevronRight size={14} className={`transition-opacity ${hoveredGender === gender ? 'opacity-100 text-blue-500' : 'opacity-0'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Level 2: Subcategory Column */}
                    <div className="w-[260px] bg-gray-50/30 py-2 relative min-h-[300px]">
                        {hoveredGender ? (
                            <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-100 mx-4 pb-2">
                                    {hoveredGender} Categories
                                </div>
                                <div className="mt-2 text-sm"> {/* added explicit text size wrapper */}
                                    {FASHION_HIERARCHY[hoveredGender].map((sub) => {
                                        const itemValue = `${hoveredGender} > ${sub}`; // Corrected format to match handleSelect
                                        const isSelected = value === itemValue;

                                        return (
                                            <div
                                                key={sub}
                                                onClick={() => handleSelect(hoveredGender, sub)}
                                                className={`px-4 py-2.5 mx-2 rounded-lg cursor-pointer mb-1 transition-all flex items-center justify-between group ${isSelected
                                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                                    }`}
                                            >
                                                <span>{sub}</span>
                                                {isSelected && <Check size={14} className="text-blue-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-6">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <ChevronRight size={18} className="text-gray-300" />
                                </div>
                                <p className="text-xs font-medium">Hover over a gender to enable options</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
