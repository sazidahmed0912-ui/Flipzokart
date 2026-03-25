'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  // If children is a string, we can split it by words to simulate the line/word reveal
  // If it's complex elements (like in the privacy policy), we just animate the block with a slide up
  
  if (typeof children === 'string') {
    const words = children.split(' ');
    
    return (
      <div ref={ref} className={className} style={{ display: 'inline-block', overflow: 'hidden' }}>
        <motion.div
           initial="hidden"
           animate={isInView ? "visible" : "hidden"}
           transition={{ staggerChildren: 0.05, delayChildren: delay }}
           style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}
        >
          {words.map((word, i) => (
            <div key={i} style={{ overflow: 'hidden', display: 'inline-flex' }}>
              <motion.span
                variants={{
                  hidden: { y: '100%', opacity: 0 },
                  visible: { 
                    y: 0, 
                    opacity: 1,
                    transition: { type: 'spring', damping: 20, stiffness: 100, duration: 0.6 }
                  }
                }}
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Fallback for non-string content (like links or mixed HTML)
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, duration: 0.6, delay }}
        className={className}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </div>
  );
};
