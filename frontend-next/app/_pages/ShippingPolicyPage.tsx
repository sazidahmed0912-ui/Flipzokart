"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';

export const ShippingPolicyPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4">Shipping Policy</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6 legal-content mobile-legal-page [&_p]:!text-[13px] [&_p]:!leading-[1.7] md:[&_p]:!text-base md:[&_p]:!leading-relaxed [&_li]:!text-[13px] md:[&_li]:!text-base [&_h2]:!text-[16px] md:[&_h2]:!text-xl [&_h2]:!mb-2 [&_ul]:!pl-5">
                        
                        <p>
                            Thank you for shopping with Flipzokart. We aim to provide a smooth and reliable shipping experience for all our customers. This Shipping Policy explains how orders are processed, shipped, and delivered.
                        </p>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Order Processing Time</h2>
                            <p>All orders are usually processed within 24 to 48 hours after successful payment confirmation. Orders are not shipped or delivered on Sundays or public holidays.</p>
                            <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. If there is a significant delay in shipping your order, we will contact you via email or phone.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Shipping Time</h2>
                            <p>Delivery times depend on your location. Most orders are delivered within 3–7 business days.</p>
                            <p>Estimated delivery times:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Local Cities: 2–4 business days</li>
                                <li>Other Locations: 3–7 business days</li>
                                <li>Remote Areas: 5–10 business days</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Shipping Charges</h2>
                            <p>Shipping charges may apply depending on the product, delivery location, or promotional offers available at the time of purchase.</p>
                            <p>In some cases, free shipping may be offered on selected products or during special promotional campaigns.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Order Tracking</h2>
                            <p>Once your order has been shipped, you will receive a confirmation message or email with tracking details.</p>
                            <p>Customers can also track their orders by visiting the “My Orders” section in their account dashboard.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Delivery Partners</h2>
                            <p>We work with trusted courier and logistics partners to ensure safe and timely delivery of your products.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Incorrect Address</h2>
                            <p>Please make sure that your shipping address and contact information are correct when placing an order. Flipzokart will not be responsible for delays caused by incorrect or incomplete shipping details.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Delivery Issues</h2>
                            <p>If you do not receive your order within the estimated delivery time, please contact our support team so we can assist you.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Contact Us</h2>
                            <p>If you have any questions about our Shipping Policy, please contact us at:</p>
                            <p>Email: <a href="mailto:fzokart@gmail.com" className="text-blue-600 hover:underline">fzokart@gmail.com</a></p>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
