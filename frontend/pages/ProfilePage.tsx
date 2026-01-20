import React, { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  ShieldCheck,
  MapPin,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Calendar,
  Lock,
  Smartphone,
  Mail,
  Edit2
} from "lucide-react";
// import Modal from "../components/Modal"; // Removed to implement inline Card Form Mode
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

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
    { name: "Account Security", path: "/account-security", icon: ShieldCheck },
    { name: "Address Book", path: "/address-book", icon: MapPin },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      {/* Container */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">

          {/* User Hello Card */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f0f5ff] flex items-center justify-center border border-[#e0e0e0]">
              <img
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
                alt="User"
                className="w-8 h-8 opacity-80"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Hello,</div>
              <div className="text-base font-bold text-[#1F2937]">Akhtar Tiwari</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            {sidebarItems.map((item, i) => {
              const isActive = item.name === "My Profile";
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors border-b last:border-0 border-gray-50
                    ${isActive ? "bg-[#F5FAFF] text-[#2874F0]" : "text-gray-600 hover:bg-gray-50"}
                  `}
                >
                  <Icon size={20} className={isActive ? "text-[#2874F0]" : "text-gray-400"} />
                  <span className={`font-medium ${isActive ? "font-bold" : ""}`}>{item.name}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto text-[#2874F0]" />}
                </div>
              );
            })}
            {/* Logout Button */}
            <div
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-4 cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </div>
          </div>
        </div>

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-6">

          {/* 1️⃣ PAGE TITLE */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1F2937]">My Profile</h1>
          </div>

          {/* 2️⃣ PROFILE HEADER CARD */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#FFE11B] flex items-center justify-center text-3xl font-bold text-[#1F2937] border-4 border-white shadow-sm">
                A
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                  Akhtar Tiwari
                  <CheckCircle2 size={20} className="text-green-500 fill-current" />
                </h2>
                <div className="text-base text-gray-500 font-medium">akhtar@email.com</div>
                <div className="text-base text-gray-500 font-medium">+91 9876543210</div>
              </div>
            </div>
            <button
              onClick={openModal}
              className="bg-[#F9C74F] text-[#1F2937] px-6 py-2.5 rounded-[2px] font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-95"
            >
              Edit Profile
            </button>
          </div>

          {/* 3️⃣ QUICK INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: "5", icon: Package },
              { label: "Account Status", value: "Verified", icon: ShieldCheck, isStatus: true },
              { label: "Member Since", value: "Jan 21", icon: Calendar }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0]">
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.isStatus ? "text-green-600" : "text-[#1F2937]"}`}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 4️⃣ & 5️⃣ PERSONAL INFORMATION CARD (TOGGLED) */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1F2937]">Personal Information</h3>
              {!isModalOpen && (
                <button onClick={openModal} className="text-[#2874F0] font-semibold text-sm hover:underline">Edit</button>
              )}
            </div>

            {isModalOpen ? (
              /* FORM MODE */
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Akhtar Tiwari"
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    defaultValue="akhtar@email.com"
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    defaultValue="+91 9876543210"
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2874F0] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <div className="font-semibold text-[#1F2937] text-base">Akhtar Tiwari</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <div className="font-semibold text-[#1F2937] text-base">akhtar@email.com</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                  <div className="font-semibold text-[#1F2937] text-base">+91 9876543210</div>
                </div>
              </div>
            )}
          </div>

          /* BOTTOM GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 6️⃣ RECENT ACTIVITY */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 h-full">
              <h3 className="text-lg font-bold text-[#1F2937] mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { text: "Logged in from a new device – Mumbai", time: "Today, 12:45 PM", icon: Smartphone },
                  { text: "Logged in from a new device – Mumbai", time: "Yesterday", icon: Smartphone },
                  { text: "Password changed successfully", time: "Jan 20, 2024", icon: Lock },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start relative before:absolute before:left-2.5 before:top-8 before:w-[2px] before:h-full before:bg-gray-100 last:before:hidden">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                      <activity.icon size={12} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1F2937] leading-tight">{activity.text}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7️⃣ ACCOUNT SETTINGS */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 h-full">
              <h3 className="text-lg font-bold text-[#1F2937] mb-6">Account Settings</h3>
              <div className="space-y-2">
                <div
                  onClick={() => handleNavigation("/change-password")}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center">
                      <Lock size={16} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#2874F0]">Change Password</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#2874F0]" />
                </div>

                <div
                  onClick={() => handleNavigation("/account-security")}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#2874F0]">Account Security</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#2874F0]" />
                </div>

                <div
                  onClick={handleLogout}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 cursor-pointer group transition-colors mt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                      <LogOut size={16} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-red-500">Logout</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-red-500" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;