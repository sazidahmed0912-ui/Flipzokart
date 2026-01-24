import React, { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  Store,
  User,
  Package,
  Heart,
  ShieldCheck,
  MapPin,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Calendar,
  Smartphone,
  Mail,
  Edit2,
  Info,
  Tag,
  HelpCircle
} from "lucide-react";
// import Modal from "../components/Modal"; // Removed to implement inline Card Form Mode
import "./ProfilePage.css";
import { SmoothReveal } from "../components/SmoothReveal";

import { useApp } from "../store/Context";
import API from "../services/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(user || {});
  const [activities, setActivities] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);

  // STRICT 5s SYNC ENGINE
  React.useEffect(() => {
    // Initial Fetch
    const syncData = async () => {
      try {
        // 1. Silent Profile Sync
        const updatedUser = await authService.getMe();
        if (updatedUser) setProfileData((prev: any) => ({ ...prev, ...updatedUser }));

        // 2. Silent Activity Sync
        const fetchedActivities = await authService.getActivities();
        setActivities(fetchedActivities);

        // 3. Silent Device Sync
        const fetchedDevices = await authService.getDeviceHistory();
        setDevices(fetchedDevices);

        // 4. Order Count Sync (if user id available)
        const uid = updatedUser?.id || user?.id;
        if (uid) {
          const customRes = await API.get(`/api/order/user/${uid}`);
          // Check if response data is array or object with orders
          const orders = Array.isArray(customRes.data) ? customRes.data : (customRes.data.orders || []);
          setOrderCount(orders.length);
        }
      } catch (e) {
        // Silent Fail - No UI impact
      }
    };

    syncData(); // Run immediately on mount

    const intervalId = setInterval(syncData, 5000); // 5s Auto Sync

    return () => clearInterval(intervalId); // Cleanup
  }, [user]);

  // Update local state if context user changes initially
  React.useEffect(() => {
    if (user) setProfileData((prev: any) => ({ ...prev, ...user }));
  }, [user]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const sidebarItems = [
    { name: "My Profile", path: "/profile", icon: User },
    { name: "Orders", path: "/orders", icon: Package },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Coupons", path: "/coupons", icon: Tag },
    { name: "Sell on Fzokart", path: "/sell", icon: Store },
    { name: "Account Security", path: "/account-security", icon: ShieldCheck },
    { name: "Address Book", path: "/address-book", icon: MapPin },
    { name: "Help Center", path: "/help-center", icon: HelpCircle },
  ];

  // Helper for Member Since Format: "17/Jan/2026"
  const getMemberSince = () => {
    if (!profileData.createdAt) return "N/A";
    const date = new Date(profileData.createdAt);
    // Format: 17/Jan/2026
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-input')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await API.post('/api/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update profile data with new avatar URL/path
      // Assuming backend returns path, we might need to prefix it with base URL if it's relative
      // Or if frontend <img src> can handle the path returned.
      // E.g. user.avatar = 'uploads/filename.jpg' -> valid if public folder serves it.
      // But we need to serve 'uploads' folder in backend (static).
      // Let's assume URL is handled or we use a helper.

      // Ideally, backend should return full URL or we prefix it.
      // For now, update state.
      const newAvatar = response.data.data.path; // or user.avatar
      setProfileData((prev: any) => ({ ...prev, avatar: newAvatar }));
      // Also update context if possible
    } catch (error) {
      console.error("Avatar upload failed", error);
      alert("Failed to upload image");
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      {/* Container */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">

          {/* User Hello Card */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f0f5ff] flex items-center justify-center border border-[#e0e0e0] overflow-hidden">
              {profileData.avatar ? (
                <img src={profileData.avatar.startsWith('http') ? profileData.avatar : `/${profileData.avatar}`} alt="User" className="w-full h-full object-cover" />
              ) : (
                <img
                  src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
                  alt="User"
                  className="w-8 h-8 opacity-80"
                />
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Hello,</div>
              <div className="text-base font-bold text-[#1F2937]">{profileData.name || "User"}</div>
            </div>
          </div>

          {/* Navigation Menu - Mobile Horizontal Scroll / Desktop Vertical List */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide py-2 lg:py-0">
              {sidebarItems.map((item, i) => {
                const isActive = item.name === "My Profile";
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 cursor-pointer transition-colors border-r lg:border-r-0 lg:border-b last:border-0 border-gray-50 flex-shrink-0 whitespace-nowrap
                        ${isActive ? "bg-[#F5FAFF] text-[#2874F0]" : "text-gray-600 hover:bg-gray-50"}
                      `}
                  >
                    <Icon size={18} className={`lg:w-5 lg:h-5 ${isActive ? "text-[#2874F0]" : "text-gray-400"}`} />
                    <span className={`text-sm lg:text-base font-medium ${isActive ? "font-bold" : ""}`}>{item.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-[#2874F0] hidden lg:block" />}
                  </div>
                );
              })}
            </div>

            {/* Logout Button (Desktop only here, mobile can rely on bottom card setting) */}
            <div
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-4 px-6 py-4 cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </div>
          </div>
        </div>

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-6">

          {/* 1️⃣ PAGE TITLE */}
          <SmoothReveal direction="down" delay={100}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#1F2937]">My Profile</h1>
            </div>
          </SmoothReveal>

          {/* 2️⃣ PROFILE HEADER CARD */}
          <SmoothReveal direction="up" delay={200}>
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="w-24 h-24 rounded-full bg-[#FFE11B] flex items-center justify-center text-3xl font-bold text-[#1F2937] border-4 border-white shadow-sm overflow-hidden">
                    {profileData.avatar ? (
                      <img src={profileData.avatar.startsWith('http') ? profileData.avatar : `/${profileData.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profileData.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={24} className="text-white" />
                  </div>
                  <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                    {profileData.name || "User Name"}
                    <CheckCircle2 size={20} className="text-green-500 fill-current" />
                  </h2>
                  <div className="text-base text-gray-500 font-medium">{profileData.email || "email@example.com"}</div>
                  <div className="text-base text-gray-500 font-medium">{profileData.phone || "+91 XXXXXXXXXX"}</div>
                </div>
              </div>
              <button
                onClick={openModal}
                className="bg-[#F9C74F] text-[#1F2937] px-6 py-2.5 rounded-[2px] font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-95"
              >
                Edit Profile
              </button>
            </div>
          </SmoothReveal>

          {/* 3️⃣ QUICK INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: orderCount.toString(), icon: Package },
              { label: "Account Status", value: profileData.status || "Active", icon: ShieldCheck, isStatus: true },
              { label: "Member Since", value: getMemberSince(), icon: Calendar }
            ].map((stat, i) => (
              <SmoothReveal key={i} direction="up" delay={300 + (i * 100)} className="h-full">
                <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 h-full">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0]">
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                    <div className={`text-lg font-bold ${stat.isStatus ? "text-green-600" : "text-[#1F2937]"}`}>{stat.value}</div>
                  </div>
                </div>
              </SmoothReveal>
            ))}
          </div>

          {/* 4️⃣ PERSONAL INFORMATION CARD (TOGGLED) */}
          <SmoothReveal direction="up" delay={600}>
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1F2937]">Personal Information</h3>
                {!isModalOpen && (
                  <button
                    onClick={openModal}
                    className="bg-[#F9C74F] text-[#1F2937] px-4 py-1.5 rounded-[2px] font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-95"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isModalOpen ? (
                /* FORM MODE */
                <EditProfileForm
                  initialData={profileData}
                  onCancel={closeModal}
                  onSuccess={(updatedUser: any) => {
                    setProfileData(updatedUser);
                    closeModal();
                  }}
                />
              ) : (
                /* VIEW MODE */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <div className="font-semibold text-[#1F2937] text-base">{profileData.name || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <div className="font-semibold text-[#1F2937] text-base">{profileData.email || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                    <div className="font-semibold text-[#1F2937] text-base">{profileData.phone || "N/A"}</div>
                  </div>
                </div>
              )}
            </div>
          </SmoothReveal>

          {/* 5️⃣ RECENT ACTIVITY */}
          <SmoothReveal direction="up" delay={700}>
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#1F2937] mb-6">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'login' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'}`}>
                        {activity.type === 'order' ? <Package size={18} /> :
                          activity.type === 'login' ? <Lock size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{activity.message}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SmoothReveal>

          {/* 6️⃣ LOGIN & SECURITY (CHANGE PASSWORD) */}
          <SmoothReveal direction="up" delay={800}>
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#1F2937] mb-6">Login & Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Account Password</h4>
                  <p className="text-sm text-gray-500">Secure your account by updating your password regularly.</p>
                  <ChangePasswordForm />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Device History</h4>
                  {devices.map((device, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                      <Smartphone size={24} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{device.device}</div>
                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Last active: {new Date(device.lastLogin).toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SmoothReveal>

          {/* 7️⃣ LOGOUT (MOBILE ONLY) */}
          <div className="lg:hidden mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 font-bold py-4 rounded-xl shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setMsg({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMsg({ type: "error", text: error.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-3">
      {msg.text && (
        <div className={`text-xs p-2 rounded ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        required
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
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