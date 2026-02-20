"use client";
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import API from '@/app/services/api';
import { useApp } from '@/app/store/Context';
import Step1Register from './Step1Register';
import Step2Business from './Step2Business';
import Step3Store from './Step3Store';

const SellerWizard: React.FC = () => {
    const router = useRouter();
    const { setUser } = useApp(); // Used to update global user state on completion
    const [step, setStep] = useState(1);
    const [token, setToken] = useState(''); // Store temp token for draft user
    const [completed, setCompleted] = useState(false);

    // Handlers
    const handleStep1Success = (receivedToken: string, userData: any) => {
        setToken(receivedToken);
        // We do NOT set global user yet to prevent being logged in as a "draft" seller globally 
        // until the flow is complete, OR we can set it if we want to allow resume.
        // For this flow, let's keep it local until success or Step 3.
        setStep(2);
    };

    const handleStep2Success = () => {
        setStep(3);
    };

    const handleStep3Success = (finalUser: any) => {
        // Update global app state with the fully active seller user
        localStorage.setItem('token', token);
        setUser(finalUser);
        setCompleted(true);
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome Aboard!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Badhai Ho! Your seller account created successfully. You can now start listing your products.
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl w-full">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sell-page min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Wizard Header */}
                <div className="bg-[#2874F0] p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold">
                            {step === 1 ? 'Register Account' : step === 2 ? 'Business Details' : 'Store Setup'}
                        </h2>
                    </div>
                    <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        Step {step} of 3
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-100 w-full">
                    <div
                        className="h-full bg-yellow-400 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>

                <div className="p-8">
                    {step === 1 && <Step1Register onSuccess={handleStep1Success} API={API} />}
                    {step === 2 && <Step2Business onSuccess={handleStep2Success} onBack={() => setStep(1)} API={API} token={token} />}
                    {step === 3 && <Step3Store onSuccess={handleStep3Success} API={API} token={token} />}
                </div>
            </div>
        </div>
    );
};

export default SellerWizard;
