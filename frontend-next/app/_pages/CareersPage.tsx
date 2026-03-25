"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { TextReveal } from '@/app/components/ui/TextReveal';

export const CareersPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4">Careers at Flipzokart</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6 legal-content mobile-legal-page [&_p]:!text-[13px] [&_p]:!leading-[1.7] md:[&_p]:!text-base md:[&_p]:!leading-relaxed [&_li]:!text-[13px] md:[&_li]:!text-base [&_h2]:!text-[16px] md:[&_h2]:!text-xl [&_h2]:!mb-2 [&_ul]:!pl-5">
                        <TextReveal>
                            At Flipzokart, we believe that great people build great companies. Our goal is to create a platform that delivers a smooth and reliable online shopping experience for customers across India.
                        </TextReveal>
                        <TextReveal>
                            We are always looking for talented, motivated, and passionate individuals who want to grow their careers in the world of eCommerce and technology.
                        </TextReveal>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>Why Work With Us</TextReveal></h2>
                            <TextReveal>Working with Flipzokart means being part of a fast-growing digital platform. We focus on innovation, teamwork, and customer satisfaction. Our team members are encouraged to share ideas, learn new skills, and contribute to improving the online shopping experience.</TextReveal>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>Opportunities</TextReveal></h2>
                            <TextReveal>Although we may not always have open positions available, we are constantly interested in connecting with talented people in the following areas:</TextReveal>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Web Development</li>
                                <li>UI/UX Design</li>
                                <li>Digital Marketing</li>
                                <li>Customer Support</li>
                                <li>Product Management</li>
                                <li>Logistics and Operations</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>Internship Opportunities</TextReveal></h2>
                            <TextReveal>Flipzokart also welcomes students and fresh graduates who want to gain practical experience in the eCommerce industry. Internship opportunities may be available from time to time.</TextReveal>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>Remote Work</TextReveal></h2>
                            <TextReveal>Some roles may allow remote or flexible work options depending on the nature of the job and project requirements.</TextReveal>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>How to Apply</TextReveal></h2>
                            <TextReveal>If you are interested in working with us, please send your resume along with a short introduction about yourself to our email address.</TextReveal>
                            <p>Email: <a href="mailto:fzokart@gmail.com" className="text-blue-600 hover:underline">fzokart@gmail.com</a></p>
                            <TextReveal className="mt-2">Our team will review your application and contact you if a suitable opportunity becomes available.</TextReveal>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>Equal Opportunity</TextReveal></h2>
                            <TextReveal>Flipzokart is an equal opportunity platform. We welcome applications from individuals of all backgrounds and experiences.</TextReveal>
                            <TextReveal className="mt-2 font-medium">Thank you for your interest in joining our team.</TextReveal>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
