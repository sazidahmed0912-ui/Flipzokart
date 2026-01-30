"use client";
import { useState, useEffect } from 'react';

export function useSmoothAnimation(delay: number = 0) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (mediaQuery.matches) {
            setIsVisible(true);
            return;
        }

        // Double requestAnimationFrame to ensure the browser has painted the initial state
        // before applying the active state, guaranteeing the transition triggers.
        const rafId = requestAnimationFrame(() => {
            const rafId2 = requestAnimationFrame(() => {
                setTimeout(() => {
                    setIsVisible(true);
                }, delay);
            });
        });

        return () => {
            // Cleanup if component unmounts quickly
            setIsVisible(false);
        };
    }, [delay]);

    return isVisible;
}
