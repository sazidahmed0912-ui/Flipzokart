import React, { useEffect } from 'react';
import { SmoothReveal } from '../components/SmoothReveal';

export const TermsOfServicePage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4">Terms and Conditions for Fzokart</h1>

                    <div className="prose prose-blue max-w-none text-sm md:text-base leading-relaxed text-gray-700 space-y-6 legal-content">
                        <p className="font-semibold">Effective Date: [24/01/2026]</p>

                        <p>
                            Welcome to Fzokart. These Terms and Conditions ("Terms") govern your access to and use of the Fzokart website, mobile application, products, and services. This document is drafted specifically for a full ecommerce platform integrated with Razorpay payment gateway and is compliant with Razorpay merchant approval requirements.
                        </p>
                        <p>
                            By accessing or using Fzokart, you agree to be bound by these Terms.
                        </p>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Definitions</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>"Fzokart", "we", "us", "our" refers to the Fzokart ecommerce platform.</li>
                                <li>"User", "Customer" refers to any person accessing or purchasing from Fzokart.</li>
                                <li>"Services" include website access, product listings, payments, delivery, and support.</li>
                                <li>"Payment Gateway" refers to Razorpay.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Users must be 18 years or older to place an order.</li>
                                <li>By using Fzokart, you confirm that the information provided is accurate and complete.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Account & Responsibilities</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Users must maintain confidentiality of login credentials.</li>
                                <li>Fzokart is not responsible for unauthorized access due to user negligence.</li>
                                <li>Accounts involved in fraud, abuse, or illegal activities may be suspended or terminated.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Product Information</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>We strive to display accurate product details, prices, and images.</li>
                                <li>Minor variations may occur due to photography or display settings.</li>
                                <li>Fzokart reserves the right to modify or discontinue products without prior notice.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Pricing & Payments (Razorpay)</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>All prices are listed in INR (₹) unless stated otherwise.</li>
                                <li>Payments are processed securely via Razorpay, a PCI-DSS compliant gateway.</li>
                                <li>Fzokart does not store card, UPI, or banking details.</li>
                                <li>Payment success or failure is confirmed through Razorpay systems.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Order Confirmation & Cancellation</h2>
                            <p>Orders are confirmed only after successful payment.</p>
                            <p className="mt-2">Fzokart reserves the right to cancel orders due to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Payment failure</li>
                                <li>Pricing errors</li>
                                <li>Stock unavailability</li>
                                <li>Suspected fraud</li>
                            </ul>
                            <p className="mt-2">Refunds (if applicable) will be processed as per our Refund Policy.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Shipping & Delivery</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Estimated delivery timelines are provided for reference only.</li>
                                <li>Delays caused by logistics partners, weather, or force majeure are not our responsibility.</li>
                                <li>Delivery address accuracy is the customer’s responsibility.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Returns, Refunds & Cancellations</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Returns and refunds are governed by the Fzokart Refund & Cancellation Policy.</li>
                                <li>Approved refunds are processed via the original payment method through Razorpay.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Use Restrictions</h2>
                            <p>Users agree not to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Violate any applicable laws</li>
                                <li>Misuse payment systems</li>
                                <li>Attempt unauthorized access</li>
                                <li>Upload malicious code or content</li>
                            </ul>
                            <p className="mt-2">Violations may result in legal action.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Intellectual Property</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>All website content, logos, designs, and software are the property of Fzokart.</li>
                                <li>Unauthorized use is strictly prohibited.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Third-Party Services</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fzokart uses third-party services including Razorpay and logistics providers.</li>
                                <li>We are not responsible for third-party service interruptions.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Limitation of Liability</h2>
                            <p>Fzokart shall not be liable for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Indirect or consequential damages</li>
                                <li>Payment gateway downtime</li>
                                <li>Delivery delays beyond control</li>
                            </ul>
                            <p className="mt-2">Total liability shall not exceed the order value.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Termination</h2>
                            <p>Fzokart may terminate or suspend user accounts without prior notice if Terms are violated.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law & Jurisdiction</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>These Terms are governed by the laws of India.</li>
                                <li>Any disputes shall be subject to the exclusive jurisdiction of courts in India.</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Grievance Redressal</h2>
                            <p>As per Indian law and Razorpay guidelines:</p>
                            <div className="mt-2 bg-gray-50 p-4 rounded border border-gray-200">
                                <p><strong>Grievance Officer</strong></p>
                                <p>Name: Shahid Afridi</p>
                                <p>Email: <a href="mailto:fzokartshop@gmail.com" className="text-blue-600 hover:underline">fzokartshop@gmail.com</a></p>
                                <p>Response Time: Within 48 hours</p>
                            </div>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Updates to Terms</h2>
                            <p>Fzokart reserves the right to update these Terms at any time. Continued use of the platform constitutes acceptance of revised Terms.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">17. Acceptance of Terms</h2>
                            <p>By accessing or using Fzokart, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.</p>
                        </section>

                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
