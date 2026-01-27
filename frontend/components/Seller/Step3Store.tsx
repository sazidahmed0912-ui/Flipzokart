import React, { useState } from 'react';
import { Store, Building2 } from 'lucide-react';

interface Step3Props {
    onSuccess: (userData: any) => void;
    API: any;
    token: string;
}

const Step3Store: React.FC<Step3Props> = ({ onSuccess, API, token }) => {
    const [formData, setFormData] = useState({
        storeName: '',
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await API.post('/auth/seller/store', formData, config);
            if (res.data.success) {
                onSuccess(res.data.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Store setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Store Setup</h3>
                <p className="text-gray-500 text-sm">Almost there! Name your store.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <div className="relative">
                    <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="My Awesome Shop"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <Store className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will be visible to buyers. Make it unique.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category</label>
                <div className="relative">
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Mobiles">Mobiles</option>
                        <option value="Other">Other</option>
                    </select>
                    <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">{error}</div>}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2874F0] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a60d6] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-blue-500/30"
            >
                {loading ? 'Finalizing Setup...' : 'Launch My Store'}
            </button>
        </form>
    );
};

export default Step3Store;
