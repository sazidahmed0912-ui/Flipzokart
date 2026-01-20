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
    // Parse duration: 
    // If string "500" -> 0.5s
    // If number > 10 -> assume ms -> /1000
    // If number <= 10 -> assume s
    let durationSec = 0.5;
    if (typeof duration === 'string') {
        const parsed = parseFloat(duration);
        durationSec = parsed > 10 ? parsed / 1000 : parsed;
    } else {
        durationSec = duration > 10 ? duration / 1000 : duration;
    }

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const getVariants = () => {
        const distance = 20; // px

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
                    ease: [0.25, 0.4, 0.25, 1], // Smooth cubic-bezier for a calm feel
                    delay: delay / 1000
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
