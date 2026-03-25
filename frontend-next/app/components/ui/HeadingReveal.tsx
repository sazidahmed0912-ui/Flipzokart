"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface HeadingRevealProps {
  children: string;
}

export const HeadingReveal: React.FC<HeadingRevealProps> = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const characters = children.split("");

  // Pseudo-random generator for consistent client-side rendering
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  return (
    <span ref={ref} className="inline-flex flex-wrap overflow-visible">
      {characters.map((char, index) => {
        // Generate values between -200% to 200% for Y, and -20 to 20 for rotation
        const yRandom = mounted ? (pseudoRandom(index * 13) - 0.5) * 400 : 0; 
        const rotateRandom = mounted ? (pseudoRandom(index * 7) - 0.5) * 40 : 0;

        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: `${yRandom}%`, rotate: rotateRandom }}
            animate={isInView && mounted ? { opacity: 1, y: "0%", rotate: 0 } : { opacity: 0, y: `${yRandom}%`, rotate: rotateRandom }}
            transition={{
              duration: 1.2,
              ease: [0.175, 0.885, 0.32, 1.2], // Spring-like ease matching GSAP back.out(1.2)
              delay: index * 0.015, // fast stagger
            }}
            style={{
              display: "inline-block",
              whiteSpace: char === " " ? "pre" : "pre-wrap",
              willChange: "transform, opacity"
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
};
