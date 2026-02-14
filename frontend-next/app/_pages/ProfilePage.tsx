"use client";
import React, { useState, useEffect } from "react";
import authService from '@/app/services/authService';
import './ProfilePage.css';
import { useRouter } from 'next/navigation';
import {
  Store,
  User,
  Package,
  Heart,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  CheckCircle2,
  Calendar,
  Smartphone,
  Mail,
  Edit2,
  Info,
  Tag,
  HelpCircle,
  Lock,
  Camera,
  Truck,
  CheckCircle
} from "lucide-react";
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useApp } from '@/app/store/Context';
import { useLanguage } from '@/app/store/LanguageContext';
import API from '@/app/services/api';
import ProfileSidebar from '@/app/components/Profile/ProfileSidebar';
import { useToast } from '@/app/components/toast';

const ProfilePage = () => {
  const router = useRouter();
  const { user, setUser } = useApp();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [isModalOpen, setModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(user || {});
  const [activities, setActivities] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);

  // STRICT 5s SYNC ENGINE
  useEffect(() => {
    const syncData = async () => {
      try {
        // 1. Silent Profile Sync
        const updatedUser = await authService.getMe();
        if (updatedUser) {
          setProfileData((prev: any) => ({ ...prev, ...updatedUser }));
          // Also update global context to keep sidebar in sync
          if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
            setUser(updatedUser);
          }
        }

        // 2. Silent Activity Sync
        const fetchedActivities = await authService.getActivities();
        setActivities(fetchedActivities);

        // 3. Order Count Sync (Robust ID check)
        const currentUser = updatedUser || user;
        // Fix: Cast to any to access _id if it exists but isn't in type
        const uid = currentUser?.id || (currentUser as any)?._id;

        if (uid) {
          try {
            const customRes = await API.get(`/api/order/user/${uid}`);
            // Handle different response structures
            let orders = [];
            if (Array.isArray(customRes.data)) {
              orders = customRes.data;
            } else if (customRes.data?.orders && Array.isArray(customRes.data.orders)) {
              orders = customRes.data.orders;
            } else if (customRes.data?.data && Array.isArray(customRes.data.data)) {
              orders = customRes.data.data;
            }

            console.log(`[Profile Sync] User: ${uid}, Orders Found: ${orders.length}`);
            setOrderCount(orders.length);
          } catch (orderErr) {
            console.error("[Profile Sync] Order fetch failed:", orderErr);
          }
        } else {
          console.warn("[Profile Sync] No UID found for sync");
        }
      } catch (e) {
        console.error("[Profile Sync] General Sync Error:", e);
      }
    };

    if (user) {
      syncData(); // Run immediately on mount
      const intervalId = setInterval(syncData, 5000); // 5s Auto Sync
      return () => clearInterval(intervalId); // Cleanup
    }
  }, [user]);

  // Update local state if context user changes
  useEffect(() => {
    if (user) setProfileData((prev: any) => ({ ...prev, ...user }));
  }, [user]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Helper for Member Since Format: "17/Jan/2026"
  const getMemberSince = () => {
    if (!profileData.createdAt) return "N/A";
    const date = new Date(profileData.createdAt);
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
      const newAvatar = response.data.data.path;
      setProfileData((prev: any) => ({ ...prev, avatar: newAvatar }));

      // Update global user context as well
      if (user) {
        setUser({ ...user, avatar: newAvatar });
      }
      addToast('success', "Profile picture updated");
    } catch (error) {
      console.error("Avatar upload failed", error);
      addToast('error', "Failed to upload image");
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      <div className="max-w-[1200px] mx-auto px-3 py-4 md:px-4 md:py-8 flex flex-col lg:flex-row gap-4 md:gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <ProfileSidebar />

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-4 md:space-y-6">

          {/* PAGE TITLE */}
          <SmoothReveal direction="down" delay={100}>
            <div className="flex items-center justify-between">
              <h1 className="text-lg md:text-2xl font-bold text-[#1F2937]">My Profile</h1>
            </div>
          </SmoothReveal>

          {/* PROFILE HEADER CARD */}
          <SmoothReveal direction="up" delay={200}>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 relative">
              <div className="flex items-center gap-4 md:gap-6 w-full">
                <div className="relative group cursor-pointer flex-shrink-0" onClick={handleAvatarClick}>
                  <div className="w-[60px] h-[60px] md:w-24 md:h-24 rounded-full bg-[#FFE11B] flex items-center justify-center text-xl md:text-3xl font-bold text-[#1F2937] border-2 md:border-4 border-white shadow-sm overflow-hidden">
                    {profileData.avatar ? (
                      <img src={profileData.avatar.startsWith('http') ? profileData.avatar : `/${profileData.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profileData.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white md:w-6 md:h-6" />
                  </div>
                  <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-1 overflow-hidden flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-[#1F2937] flex items-center gap-1.5 md:gap-2 truncate">
                    {profileData.name || "User Name"}
                    <CheckCircle2 size={16} className="text-green-500 fill-current md:w-5 md:h-5" />
                  </h2>
                  <div className="text-sm text-gray-500 font-medium truncate">{profileData.email || "email@example.com"}</div>
                  <div className="text-sm text-gray-500 font-medium truncate md:hidden">{profileData.phone || "+91 XXXXXXXXXX"}</div>
                </div>
              </div>

              <button
                onClick={openModal}
                className="w-full md:w-auto bg-[#F9C74F] text-[#1F2937] px-6 py-2.5 rounded-lg md:rounded-[6px] font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-95 flex items-center justify-center h-11 md:h-auto"
              >
                Edit Profile
              </button>
            </div>
          </SmoothReveal>

          {/* QUICK INFO CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { label: "Total Orders", value: orderCount.toString(), icon: Package },
              { label: "Account Status", value: profileData.status || "Active", icon: ShieldCheck, isStatus: true },
              { label: "Member Since", value: getMemberSince(), icon: Calendar }
            ].map((stat, i) => (
              <SmoothReveal key={i} direction="up" delay={300 + (i * 100)} className="h-full">
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-3 md:p-5 flex items-center gap-3 md:gap-4 h-full min-h-[70px] md:min-h-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0] flex-shrink-0">
                    <stat.icon size={18} className="md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{stat.label}</div>
                    <div className={`text-base md:text-lg font-bold truncate ${stat.isStatus ? "text-green-600" : "text-[#1F2937]"}`}>{stat.value}</div>
                  </div>
                </div>
              </SmoothReveal>
            ))}
          </div>

          {/* PERSONAL INFORMATION CARD (TOGGLED) */}
          <SmoothReveal direction="up" delay={600}>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 md:p-8">
              <div
                className="flex justify-between items-center mb-0 md:mb-6 cursor-pointer md:cursor-auto"
                onClick={() => setIsMobileInfoExpanded(!isMobileInfoExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] md:text-lg font-bold text-[#1F2937]">Personal Information</h3>
                  <div className="md:hidden text-gray-400">
                    {isMobileInfoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {!isModalOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal();
                    }}
                    className="bg-[#F9C74F] text-[#1F2937] md:bg-[#F9C74F] px-4 py-1.5 rounded-md font-semibold text-xs md:text-sm shadow-sm hover:shadow-md transition-all active:scale-95 h-8 flex items-center"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Mobile Separator */}
              {isMobileInfoExpanded && <div className="h-[1px] bg-gray-100 my-3 md:hidden"></div>}

              {isModalOpen ? (
                /* FORM MODE */
                <div className="mt-4 md:mt-0">
                  <EditProfileForm
                    initialData={profileData}
                    onCancel={closeModal}
                    onSuccess={(updatedUser: any) => {
                      setProfileData(updatedUser);
                      setUser({ ...user, ...updatedUser });
                      closeModal();
                    }}
                  />
                </div>
              ) : (
                /* VIEW MODE */
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 ${!isMobileInfoExpanded ? 'hidden md:grid' : ''}`}>
                  <div className="grid grid-cols-3 md:block">
                    <label className="text-[11px] md:text-xs font-bold text-gray-400 md:text-gray-500 uppercase col-span-1 self-center">Full Name</label>
                    <div className="font-semibold text-[#1F2937] text-[13px] md:text-base col-span-2">{profileData.name || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-3 md:block">
                    <label className="text-[11px] md:text-xs font-bold text-gray-400 md:text-gray-500 uppercase col-span-1 self-center">Email</label>
                    <div className="font-semibold text-[#1F2937] text-[13px] md:text-base col-span-2 truncate">{profileData.email || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-3 md:block">
                    <label className="text-[11px] md:text-xs font-bold text-gray-400 md:text-gray-500 uppercase col-span-1 self-center">Mobile</label>
                    <div className="font-semibold text-[#1F2937] text-[13px] md:text-base col-span-2">{profileData.phone || "N/A"}</div>
                  </div>
                </div>
              )}
            </div>
          </SmoothReveal>

          {/* RECENT ACTIVITY */}
          <SmoothReveal direction="up" delay={700}>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 md:p-8 mb-20 md:mb-0">
              <h3 className="text-[17px] md:text-lg font-bold text-[#1F2937] mb-4 md:mb-6">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
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

        </div>
      </div>
    </div>
  );
};

const EditProfileForm = ({ initialData, onCancel, onSuccess }: any) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ name, phone });
      onSuccess(updatedUser);
      addToast('success', "Profile updated");
    } catch (error) {
      console.error("Update failed:", error);
      addToast('error', "Failed to update profile");
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

      <div className="md:col-span-2 flex flex-col-reverse md:flex-row justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto px-6 h-11 rounded-lg font-bold text-gray-600 hover:bg-gray-100 text-sm border border-gray-200 md:border-transparent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-[#2874F0] text-white px-8 h-11 rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfilePage;