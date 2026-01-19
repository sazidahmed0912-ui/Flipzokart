import React from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      {/* Header spacing already exists in app */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* LEFT SIDEBAR */}
        <div className="w-[260px] bg-white rounded-xl shadow-sm">
          <ul className="py-2">
            {[
              "My Profile",
              "Orders",
              "Wishlist",
              "Account Security",
              "Address Book",
            ].map((item, i) => (
              <li
                key={i}
                className={`px-6 py-3 text-sm cursor-pointer ${
                  item === "My Profile"
                    ? "border-l-4 border-[#2874F0] bg-[#f5faff] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>

          {/* TOP PROFILE CARD */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center mb-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#ff9f00] flex items-center justify-center text-white text-2xl font-semibold">
                A
              </div>
              <div>
                <div className="text-lg font-semibold">Akhtar Tiwari</div>
                <div className="text-sm text-gray-600">akhtar@email.com</div>
                <div className="text-sm text-gray-600">+91 9876543210</div>
              </div>
            </div>

            <button className="bg-[#ff9f00] text-white px-5 py-2 rounded-lg text-sm font-semibold">
              Edit
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { title: "Orders", value: "5" },
              { title: "Verified", value: "Verified" },
              { title: "Joined", value: "Jan 21" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-5 text-center"
              >
                <div className="text-sm text-gray-500 mb-1">
                  {item.title}
                </div>
                <div className="font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Personal Information</h3>
              <button className="bg-[#ff9f00] text-white px-4 py-1.5 rounded-lg text-sm">
                Edit
              </button>
            </div>

            {/* FAKE INPUTS (EXACT LOOK) */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Full Name</label>
                <div className="mt-1 border border-[#d7d7d7] bg-[#fafafa] rounded-lg px-4 py-3 text-sm font-medium shadow-inner">
                  Akhtar Tiwari
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Email Address</label>
                <div className="mt-1 border border-[#d7d7d7] bg-[#fafafa] rounded-lg px-4 py-3 text-sm font-medium shadow-inner">
                  akhtar@email.com
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Mobile Number</label>
                <div className="mt-1 border border-[#d7d7d7] bg-[#fafafa] rounded-lg px-4 py-3 text-sm font-medium shadow-inner">
                  +91 9876543210
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-2 gap-6">
            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li>Logged in from a new device – Mumbai (Today, 12:45 PM)</li>
                <li>Logged in from a new device – Mumbai (Yesterday)</li>
                <li>Password changed successfully (Jan 20, 2024)</li>
              </ul>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-3">Account Settings</h3>
              <ul className="text-sm text-gray-700 space-y-4">
                <li className="cursor-pointer hover:text-[#2874F0]">
                  Change Password
                </li>
                <li className="cursor-pointer hover:text-[#2874F0]">
                  Account Security
                </li>
                <li 
                  className="cursor-pointer text-red-500"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;