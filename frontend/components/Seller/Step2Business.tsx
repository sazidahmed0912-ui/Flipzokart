import React, { useState } from 'react';
import { ShieldCheck, CreditCard } from 'lucide-react';

interface Step2Props {
    onSuccess: () => void;
    onBack: () => void;
    API: any;
    token: string;
}

const Step2Business: React.FC<Step2Props> = ({ onSuccess, onBack, API, token }) => {
    const [formData, setFormData] = useState({
        gstin: '',
        pan: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
    };

    const validate = () => {
        if (!formData.gstin) return "GSTIN is required";
        if (formData.gstin.length !== 15) return "GSTIN must be 15 characters";
        if (!formData.pan) return "PAN is required";
        if (formData.pan.length !== 10) return "PAN must be 10 characters";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Need to set Authorization header manually since we might be in a temporary "draft" state 
            // before the global context updates fully, or if we use local state token.
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await API.post('/auth/seller/business', formData, config);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Business Verification</h3>
                <p className="text-gray-500 text-sm">Verify your business identity.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
                <div className="relative">
                    <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                        required
                    />
                    <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <div className="relative">
                    <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                        required
                    />
                    <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">{error}</div>}

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-1/3 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-[#2874F0] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a60d6] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                >
                    {loading ? 'Verifying...' : 'Next Step'}
                </button>
            </div>
        </form>
    );
};

export default Step2Business;
