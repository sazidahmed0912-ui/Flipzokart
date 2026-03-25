"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { TextReveal } from '@/app/components/ui/TextReveal';

export const FaqPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4">Frequently Asked Questions (FAQ)</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6 legal-content mobile-legal-page [&_p]:!text-[13px] [&_p]:!leading-[1.7] md:[&_p]:!text-base md:[&_p]:!leading-relaxed [&_li]:!text-[13px] md:[&_li]:!text-base [&_h2]:!text-[16px] md:[&_h2]:!text-xl [&_h2]:!mb-2 [&_h3]:!text-[15px] md:[&_h3]:!text-[18px] [&_h3]:!font-bold [&_h3]:!text-gray-900 [&_h3]:!mb-2">
                        
                        <TextReveal>
                            Welcome to the Flipzokart FAQ section. Here you will find answers to the most commonly asked questions about orders, payments, shipping, and returns.
                        </TextReveal>

                        <hr className="my-6 border-gray-100" />

                        <section className="space-y-4">
                            <div>
                                <h3>1. How can I place an order?</h3>
                                <TextReveal>To place an order, simply browse products on Flipzokart, add your desired items to the cart, and proceed to checkout. Enter your delivery details and complete the payment process.</TextReveal>
                            </div>

                            <div>
                                <h3>2. What payment methods are accepted?</h3>
                                <TextReveal>We accept multiple payment methods including online payments such as UPI, debit cards, credit cards, and other secure payment options available during checkout.</TextReveal>
                            </div>

                            <div>
                                <h3>3. How can I track my order?</h3>
                                <TextReveal>Once your order has been shipped, you can track it from the "My Orders" section in your account. Tracking details will also be sent to your registered email or phone number.</TextReveal>
                            </div>

                            <div>
                                <h3>4. How long does delivery take?</h3>
                                <TextReveal>Delivery usually takes between 3 to 7 business days depending on your location.</TextReveal>
                            </div>

                            <div>
                                <h3>5. Can I cancel my order?</h3>
                                <TextReveal>Yes, you may cancel your order before it is shipped. Once the order is shipped, cancellation may not be possible.</TextReveal>
                            </div>

                            <div>
                                <h3>6. What is your return policy?</h3>
                                <TextReveal>Most products on Flipzokart come with a 7-day return policy. If you receive a damaged or incorrect product, you can request a return within 7 days of delivery.</TextReveal>
                            </div>

                            <div>
                                <h3>7. How will I receive my refund?</h3>
                                <TextReveal>Once the returned product is received and inspected, the refund will be processed to your original payment method within 5–7 business days.</TextReveal>
                            </div>

                            <div>
                                <h3>8. What should I do if I receive a damaged product?</h3>
                                <TextReveal>If you receive a damaged or defective item, please contact our support team immediately with photos of the product so we can resolve the issue.</TextReveal>
                            </div>

                            <div>
                                <h3>9. How can I contact customer support?</h3>
                                <p>You can contact our support team through email.</p>
                                <p>Email: <a href="mailto:fzokart@gmail.com" className="text-blue-600 hover:underline">fzokart@gmail.com</a></p>
                            </div>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
