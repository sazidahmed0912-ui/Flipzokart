"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';

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

                        <p>
                            At Flipzokart, we believe that great people build great companies. Our goal is to create a platform that delivers a smooth and reliable online shopping experience for customers across India.
                        </p>
                        <p>
                            We are always looking for talented, motivated, and passionate individuals who want to grow their careers in the world of eCommerce and technology.
                        </p>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Why Work With Us</h2>
                            <p>Working with Flipzokart means being part of a fast-growing digital platform. We focus on innovation, teamwork, and customer satisfaction. Our team members are encouraged to share ideas, learn new skills, and contribute to improving the online shopping experience.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Opportunities</h2>
                            <p>Although we may not always have open positions available, we are constantly interested in connecting with talented people in the following areas:</p>
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
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Internship Opportunities</h2>
                            <p>Flipzokart also welcomes students and fresh graduates who want to gain practical experience in the eCommerce industry. Internship opportunities may be available from time to time.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Remote Work</h2>
                            <p>Some roles may allow remote or flexible work options depending on the nature of the job and project requirements.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">How to Apply</h2>
                            <p>If you are interested in working with us, please send your resume along with a short introduction about yourself to our email address.</p>
                            <p>Email: <a href="mailto:fzokart@gmail.com" className="text-blue-600 hover:underline">careers@flipzokart.com</a></p>
                            <p className="mt-2">Our team will review your application and contact you if a suitable opportunity becomes available.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Equal Opportunity</h2>
                            <p>Flipzokart is an equal opportunity platform. We welcome applications from individuals of all backgrounds and experiences.</p>
                            <p className="mt-2 font-medium">Thank you for your interest in joining our team.</p>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
