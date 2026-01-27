const ChangePasswordForm = () => null; // Removed as it is now in SecurityPage

// ... existing code ...
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import { useLanguage } from '../store/LanguageContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useLanguage();
  // ... state ...

  // REMOVE LOCAL SIDEBAR LOGIC

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <ProfileSidebar />

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-6">
          {/* ... header ... */}
          {/* ... stats ... */}
          {/* ... personal info ... */}
          {/* ... activity ... */}

          {/* REMOVED SECURITY SECTION */}

        </div>
      </div>
    </div>
  );
};

const EditProfileForm = ({ initialData, onCancel, onSuccess }: any) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ name, phone });
      onSuccess(updatedUser);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-medium"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2874F0] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfilePage;