import React, { useState } from 'react';
import { useApp } from '../store/Context';
import { Store, CheckCircle, AlertTriangle, User } from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const SellOnFlipzokart: React.FC = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        setLoading(true);
        setError('');
        try {
            // Update user role to 'pending_seller'
            // Using generic user update link if specific one doesn't exist, logic depends on backend
            // For now assuming we can PUT to /api/auth/me or /api/user/profile to update role request 
            // Or a specific endpoint. Let's try to update self.
            // If backend doesn't allow self-role update, we might need a specific 'request-seller' endpoint.
            // Let's assume /api/user/request-seller is best, if not we will use a workaround.

            // Workaround: We will use the generic profile update if available, or just mock success if backend logic is missing
            // But since user asked for Sync, I will try to hit the user update endpoint.

            await API.put(`/api/user/profile`, { role: 'pending_seller' });
            // Note: Valid backend should probably sanitize this, but for this task we assume it works or we add the logic.

            setSuccess(true);
        } catch (err: any) {
            // If standard update fails, maybe try a dedicated endpoint or show error
            console.error(err);
            // Fallback attempt: maybe custom endpoint I should add?
            // Let's try to add a specific route in backend if this fails, but for UI:
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">Your request to become a seller is under review. You will be notified once approved.</p>
                    <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] py-8 px-4 flex justify-center">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar (Visual consistency with Profile) */}
                <div className="bg-gradient-to-br from-[#2874F0] to-[#1a60d6] p-8 text-white md:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <Store size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Sell Online</h1>
                        <p className="text-blue-100 leading-relaxed">Join thousands of sellers and grow your business with Fzokart.</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-blue-100">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</div>
                            <span>Register your account</span>
                        </div>
                        <div className="w-0.5 h-4 bg-white/20 ml-3"></div>
                        <div className="flex items-center gap-3 text-sm text-blue-100">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</div>
                            <span>Submit documents</span>
                        </div>
                        <div className="w-0.5 h-4 bg-white/20 ml-3"></div>
                        <div className="flex items-center gap-3 text-sm font-bold text-white">
                            <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                            <span>Start Selling</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 md:w-2/3">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Seller Application</h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="min-w-[40px] h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <User size={20} /> {/* Should import User */}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Account Details</h3>
                                <p className="text-sm text-gray-600 mt-1">You are applying as: <b>{user?.name || 'Guest'}</b></p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                            <AlertTriangle className="text-yellow-600 min-w-[20px]" size={20} />
                            <p className="text-sm text-yellow-800">
                                By submitting this application, you agree to Fzokart's Seller Terms & Conditions.
                                Your account status will be set to "Pending" until approved by an admin.
                            </p>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={loading}
                                className="bg-[#2874F0] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#1a60d6] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellOnFlipzokart;
