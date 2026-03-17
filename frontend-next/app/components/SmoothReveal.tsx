"use client";
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SmoothRevealProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number | string;
    width?: "fit-content" | "100%";
}

export const SmoothReveal: React.FC<SmoothRevealProps> = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    duration = 0.5,
    width = "100%"
}) => {
    // On Android Capacitor, IntersectionObserver (used by useInView) often never fires.
    // This keeps content in opacity:0 forever, making the whole page look frozen.
    // Simple fix: on Capacitor builds, just render children directly without any animation.
    const isCapacitor = process.env.NEXT_PUBLIC_IS_CAPACITOR === 'true';

    if (isCapacitor) {
        return (
            <div style={{ width, position: 'relative' }} className={className}>
                {children}
            </div>
        );
    }

    // Web version with Framer Motion animations
    return <SmoothRevealAnimated className={className} direction={direction} delay={delay} duration={duration} width={width}>{children}</SmoothRevealAnimated>;
};

// Separate animated component (only used on web, not Android)
const SmoothRevealAnimated: React.FC<SmoothRevealProps> = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    duration = 0.5,
    width = "100%"
}) => {
    let durationSec = 0.5;
    if (typeof duration === 'string') {
        const parsed = parseFloat(duration);
        durationSec = parsed > 10 ? parsed / 1000 : parsed;
    } else {
        durationSec = (duration as number) > 10 ? (duration as number) / 1000 : (duration as number);
    }

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const getVariants = () => {
        const distance = 20;
        switch (direction) {
            case 'up': return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
            case 'down': return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0 } };
            case 'left': return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0 } };
            case 'right': return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0 } };
            case 'none': return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
            default: return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
        }
    };

    return (
        <div ref={ref} style={{ width, position: 'relative' }} className={className}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{
                    duration: durationSec,
                    ease: [0.25, 0.4, 0.25, 1],
                    delay: delay / 1000
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
