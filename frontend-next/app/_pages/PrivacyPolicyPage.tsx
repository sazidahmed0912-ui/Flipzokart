"use client";
import React, { useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';

export const PrivacyPolicyPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
                <SmoothReveal>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 border-b pb-4">Privacy Policy for Fzokart</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6 legal-content [&_p]:!text-[13px] [&_p]:!leading-[1.7] md:[&_p]:!text-base md:[&_p]:!leading-relaxed [&_li]:!text-[13px] md:[&_li]:!text-base [&_h2]:!text-[16px] md:[&_h2]:!text-xl [&_h2]:!mb-2 [&_ul]:!pl-5">
                        <p className="font-semibold">Effective Date: [24/01/2026]</p>

                        <p>
                            Fzokart ("Fzokart", "we", "our", "us") operates a full-scale ecommerce website and mobile application. We are committed to protecting user privacy and maintaining the highest standards of data security. This Privacy Policy is specifically designed to comply with Razorpay payment gateway approval requirements and applicable Indian IT laws.
                        </p>
                        <p>
                            By using Fzokart, you agree to the practices described in this policy.
                        </p>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">1. Information We Collect</h2>

                            <h3 className="text-[15px] md:text-lg font-semibold text-gray-800 mt-4 mb-2">1.1 Personal Information</h3>
                            <p>We collect personal information only when necessary to provide our services, including:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Full Name</li>
                                <li>Email Address</li>
                                <li>Mobile Number</li>
                                <li>Shipping & Billing Address</li>
                                <li>Account Login Credentials (encrypted)</li>
                            </ul>

                            <h3 className="text-[15px] md:text-lg font-semibold text-gray-800 mt-4 mb-2">1.2 Payment Information (Razorpay)</h3>
                            <p>Fzokart does NOT collect, store, or process sensitive payment details such as:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Debit/Credit card numbers</li>
                                <li>CVV</li>
                                <li>UPI PINs</li>
                                <li>Net banking credentials</li>
                            </ul>
                            <p className="mt-2">All payments are securely processed by Razorpay, a PCI-DSS compliant payment gateway. Razorpay may collect transaction-related details such as:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Payment ID</li>
                                <li>Order ID</li>
                                <li>Transaction status</li>
                                <li>Payment method</li>
                            </ul>

                            <h3 className="text-[15px] md:text-lg font-semibold text-gray-800 mt-4 mb-2">1.3 Automatically Collected Information</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>IP address</li>
                                <li>Device & browser information</li>
                                <li>Website usage data</li>
                                <li>Log files for security & fraud prevention</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">2. Purpose of Data Collection</h2>
                            <p>We use collected information strictly for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>User account creation and authentication</li>
                                <li>Order processing and fulfillment</li>
                                <li>Secure payment processing via Razorpay</li>
                                <li>Customer support and grievance handling</li>
                                <li>Order notifications and invoices</li>
                                <li>Fraud detection and prevention</li>
                                <li>Legal and regulatory compliance</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">3. Razorpay Payment Gateway Security</h2>
                            <p>Fzokart integrates Razorpay using industry best practices:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>End-to-end SSL encryption</li>
                                <li>Secure API-based payment processing</li>
                                <li>Server-side payment verification</li>
                                <li>Webhook signature validation</li>
                                <li>No storage of sensitive financial data</li>
                            </ul>
                            <p className="mt-2">Razorpay complies with PCI-DSS, ISO 27001, and RBI guidelines.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">4. Data Sharing & Third Parties</h2>
                            <p>Fzokart does not sell or misuse customer data.</p>
                            <p>Data may be shared only with:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Razorpay (for payment processing)</li>
                                <li>Logistics & delivery partners (for order fulfillment)</li>
                                <li>Government authorities when legally required</li>
                                <li>Technology service providers under strict confidentiality</li>
                            </ul>
                            <p className="mt-2">All third parties follow applicable data protection laws.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">5. Cookies & Tracking</h2>
                            <p>Fzokart uses cookies to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Maintain secure login sessions</li>
                                <li>Store cart and checkout preferences</li>
                                <li>Improve website performance</li>
                                <li>Prevent unauthorized access</li>
                            </ul>
                            <p className="mt-2">Users may disable cookies, but payment and login features may be affected.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">6. Data Security Measures</h2>
                            <p>We implement robust security measures, including:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Encrypted databases</li>
                                <li>Secure cloud infrastructure</li>
                                <li>Role-based access control (RBAC)</li>
                                <li>Limited admin access</li>
                                <li>Regular security audits</li>
                            </ul>
                            <p className="mt-2">Passwords are hashed using strong encryption algorithms.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">7. User Rights & Control</h2>
                            <p>Users have the right to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Access personal data</li>
                                <li>Update or correct information</li>
                                <li>Request account deletion</li>
                                <li>Withdraw consent (where applicable)</li>
                            </ul>
                            <p className="mt-2">Requests can be raised via customer support.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">8. Data Retention Policy</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>User data is retained only as long as necessary</li>
                                <li>Order & transaction data may be retained for tax, audit, and legal compliance</li>
                                <li>Deleted accounts are anonymized wherever required</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">9. Children’s Privacy</h2>
                            <p>Fzokart does not knowingly collect personal data from individuals under 18 years of age.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">10. Fraud Monitoring & Abuse Prevention</h2>
                            <p>To ensure platform safety, we actively monitor:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Payment abuse</li>
                                <li>Suspicious transactions</li>
                                <li>Unauthorized access attempts</li>
                            </ul>
                            <p className="mt-2">Accounts violating policies may be suspended or terminated.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">11. Legal Compliance</h2>
                            <p>This Privacy Policy complies with:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Information Technology Act, 2000 (India)</li>
                                <li>IT (Reasonable Security Practices) Rules, 2011</li>
                                <li>RBI and Razorpay compliance guidelines</li>
                            </ul>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">12. Policy Updates</h2>
                            <p>Fzokart reserves the right to update this policy at any time. Updates will be posted on this page.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">13. Contact & Grievance Officer</h2>
                            <p>For privacy concerns or grievances, contact:</p>
                            <div className="mt-2 bg-gray-50 p-4 rounded border border-gray-200">
                                <p><strong>Fzokart Grievance Officer</strong></p>
                                <p>Name: Shahid Afridi</p>
                                <p>Email: <a href="mailto:fzokartshop@gmail.com" className="text-blue-600 hover:underline">fzokartshop@gmail.com</a></p>
                                <p>Response Time: Within 48 hours</p>
                            </div>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <section>
                            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2 md:mb-3">14. User Consent</h2>
                            <p>By accessing or using Fzokart, you explicitly consent to the collection, use, and processing of your information as described in this Privacy Policy.</p>
                        </section>

                        <hr className="my-6 border-gray-100" />

                        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium flex items-center justify-center gap-2">
                                <span>🔒</span>
                                <i>Fzokart is committed to safe, secure, and transparent ecommerce for all users.</i>
                            </p>
                        </div>
                    </div>
                </SmoothReveal>
            </div>
        </div>
    );
};
