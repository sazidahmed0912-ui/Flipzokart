import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SignatureLoader from './SignatureLoader';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface PageTransitionProps {
    children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const location = useLocation();
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
            // Increase delay on slow networks to ensure skeletons generate or content loads slightly more
            const baseDelay = 400;
            const delay = isSlow ? 800 : baseDelay;

            const timer = setTimeout(() => {
                setDisplayLocation(location);
                setTransitionStage('fadeIn');

                // 3. FADE OUT LOADER AFTER CONTENT IS READY
                setTimeout(() => {
                    setIsLoading(false);
                    // Scroll to top on new page load
                    window.scrollTo(0, 0);
                }, 300); // Loader stay duration

            }, delay); // Transition duration

            return () => clearTimeout(timer);
        }
    }, [location, displayLocation, isSlow]);

    return (
        <>
            {isLoading && <SignatureLoader />}

            <div
                className={`
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${transitionStage === 'fadeOut' ? 'opacity-[0.92] blur-[2px] scale-[0.995]' : 'opacity-100 blur-0 scale-100 translate-y-0'}
          ${transitionStage === 'fadeIn' && isLoading ? 'translate-y-2 opacity-0' : ''}
        `}
            >
                {/* 
            We persist the OLD location node until the transition is done 
            This prevents the "instant switch" visually.
            We clone the child (which should be AuthWrapper) and pass the displayLocation prop.
         */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        // @ts-ignore - We know AuthWrapper accepts location
                        return React.cloneElement(child, { location: displayLocation });
                    }
                    return child;
                })}
            </div>
        </>
    );
};

export default PageTransition;
