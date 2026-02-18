"use client";

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Toggle Dark Mode"
        >
            {isDark ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-gray-600" />
            )}
        </button>
    );
};

export default ThemeToggle;
