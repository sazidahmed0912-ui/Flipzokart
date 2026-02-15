'use client';

import React from 'react';
import Link from 'next/link';
import LazyImage from '@/app/components/LazyImage';
import { motion } from 'framer-motion';

export const RendererHero: React.FC<{ section: any }> = ({ section }) => {
    const { imageUrl, title, subtitle, ctaText, ctaLink } = section.props;
    const { paddingTop, paddingBottom, backgroundColor, container } = section.styles;

    if (!imageUrl) return null;

    return (
        <section style={{ paddingTop, paddingBottom, backgroundColor }}>
            <div className={container === 'contained' ? 'max-w-[1400px] mx-auto px-4' : 'w-full'}>
                <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
                    <LazyImage
                        src={imageUrl}
                        alt={title || 'Hero Banner'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-center p-6">
                        <div className="max-w-2xl text-white">
                            {title && (
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md"
                                >
                                    {title}
                                </motion.h2>
                            )}
                            {subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg md:text-xl mb-8 drop-shadow-md font-medium text-gray-100"
                                >
                                    {subtitle}
                                </motion.p>
                            )}
                            {ctaText && ctaLink && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href={ctaLink}
                                        className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        {ctaText}
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
