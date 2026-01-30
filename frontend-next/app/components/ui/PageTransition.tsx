"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useNetworkStatus } from '@/app/hooks/useNetworkStatus';
import CircularGlassSpinner from '../CircularGlassSpinner';

interface PageTransitionProps {
    children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const pathname = usePathname();
    const location = useMemo(() => ({
        pathname: pathname || '/',
        search: '' // searchParams removed to fix missing suspense boundary error
    }), [pathname]);

    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
    const { isSlow } = useNetworkStatus();

    // Controls the loader visibility
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            // 1. ROUTE CHANGE DETECTED -> START EXIT
            setTransitionStage('fadeOut');
            setIsLoading(true);

            // 2. WAIT FOR EXIT ANIMATION + ARTIFICIAL DELAY
            const baseDelay = 400;
            const delay = isSlow ? 800 : baseDelay;

            const timer = setTimeout(() => {
                setDisplayLocation(location);
                setTransitionStage('fadeIn');

                // 3. FADE OUT LOADER AFTER CONTENT IS READY
                setTimeout(() => {
                    setIsLoading(false);
                    // Scroll to top on new page load
                    if (typeof window !== 'undefined') window.scrollTo(0, 0);
                }, 300); // Loader stay duration

            }, delay); // Transition duration

            return () => clearTimeout(timer);
        }
    }, [location, displayLocation, isSlow]);

    return (
        <>
            {isLoading && <CircularGlassSpinner />}

            <div
                className={`
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${transitionStage === 'fadeOut' ? 'opacity-[0.92] blur-[2px] scale-[0.995]' : 'opacity-100 blur-0 scale-100 translate-y-0'}
          ${transitionStage === 'fadeIn' && isLoading ? 'translate-y-2 opacity-0' : ''}
        `}
            >
                {/* 
            In Next.js, strictly persisting old route content requires keeping old 'children'.
            Since we can't easily capture the 'old children' component tree (it changes), 
            the transition here acts more like a loading overlay.
            We pass displayLocation just in case props are used, but children are already new.
         */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        // Pass location prop if accepted, otherwise just render
                        // @ts-ignore
                        return React.cloneElement(child, { location: displayLocation });
                    }
                    return child;
                })}
            </div>
        </>
    );
};

export default PageTransition;
