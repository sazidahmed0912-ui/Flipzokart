"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { TextReveal } from '@/app/components/ui/TextReveal';
import { HeadingReveal } from '@/app/components/ui/HeadingReveal';

export const ReturnsRefundsPolicyPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4"><HeadingReveal>Returns & Refunds Policy</HeadingReveal></h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6 legal-content mobile-legal-page [&_p]:!text-[13px] [&_p]:!leading-[1.7] md:[&_p]:!text-base md:[&_p]:!leading-relaxed [&_li]:!text-[13px] md:[&_li]:!text-base [&_ol]:!text-[13px] md:[&_ol]:!text-base [&_h2]:!text-[16px] md:[&_h2]:!text-xl [&_h2]:!mb-2 [&_ul]:!pl-5 [&_ol]:!pl-5">
                        
                        <TextReveal>
                            At Flipzokart, customer satisfaction is our top priority. Most products available on our platform are eligible for a 7-day return policy from the date of delivery.
                        </TextReveal>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3"><TextReveal>7 Day Return Policy</TextReveal></h2>
                            <TextReveal>Most products purchased from Flipzokart are eligible for return within 7 days from the date of delivery.</TextReveal>
                            <TextReveal>If you receive a damaged, defective, or incorrect product, you can request a return within 7 days of receiving the item.</TextReveal>
                            <TextReveal>The product must be unused and in its original condition with all packaging, tags, and accessories included.</TextReveal>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Non-Returnable Items</h2>
                            <p>Certain products may not be eligible for return due to hygiene, safety, or product nature.</p>
                            <p>These may include:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Personal care products</li>
                                <li>Innerwear or hygiene products</li>
                                <li>Opened beauty items</li>
                                <li>Digital products or downloadable items</li>
                                <li>Products marked as "Non-Returnable"</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">How to Request a Return</h2>
                            <p>Customers can initiate a return request by visiting their account orders section.</p>
                            <p>Steps:</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>Go to My Orders</li>
                                <li>Select the product you want to return</li>
                                <li>Click "Request Return"</li>
                                <li>Select the reason for return</li>
                                <li>Submit the request</li>
                            </ol>
                            <p className="mt-2">Once approved, our team will arrange the return pickup.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Refund Policy</h2>
                            <p>Once the returned product is received and inspected, the refund will be initiated.</p>
                            <p>Refunds are usually processed within 5-7 business days after the product inspection.</p>
                            <p>The refund will be credited to the original payment method used during checkout.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Exchange Policy</h2>
                            <p>For certain products, exchange options may be available instead of a refund.</p>
                            <p>Customers can choose to replace the product with the same item if it is defective or damaged.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Need Help?</h2>
                            <p>If you have any questions regarding returns or refunds, please contact our support team.</p>
                            <p>Email: <a href="mailto:fzokart@gmail.com" className="text-blue-600 hover:underline">fzokart@gmail.com</a></p>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
