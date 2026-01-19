import React from "react";
import Sidebar from "../src/pages/ProductListingPage/components/Sidebar";

const ProfilePage: React.FC = () => {
  return (
    <div className="bg-[#f1f3f6] min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <div className="grid grid-cols-12 gap-6">

          {/* LEFT SIDEBAR */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-xl shadow p-4">
              <ul className="space-y-4">
                <li className="font-medium text-blue-600 border-l-4 border-blue-600 pl-3">
                  My Profile
                </li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  Orders
                </li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  Wishlist
                </li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  Account Security
                </li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  Address Book
                </li>
              </ul>
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="col-span-12 md:col-span-6 space-y-6">

            {/* PROFILE SUMMARY */}
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-3xl font-bold text-white">
                A
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">Akhtar Tiwari</h2>
                <p className="text-gray-500">akhtar@email.com</p>
                <p className="text-gray-500">+91 9876543210</p>

                <div className="flex gap-4 mt-4">
                  <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                    <p className="font-semibold">5</p>
                    <p className="text-sm text-gray-500">Orders</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                    <p className="text-green-600 font-medium">Verified</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg text-center text-sm text-gray-500">
                    Joined Jan 21
                  </div>
                </div>
              </div>

              <button className="bg-[#ff9f00] hover:bg-[#f08c00] text-white px-5 py-2 rounded-lg font-medium">
                Edit
              </button>
            </div>

            {/* PERSONAL INFO (VIEW MODE) */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <button className="text-[#2874f0] font-medium">Edit</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium">Akhtar Tiwari</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email Address</label>
                  <p className="font-medium">akhtar@email.com</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile Number</label>
                  <p className="font-medium">+91 9876543210</p>
                </div>
              </div>
            </div>

            {/* PERSONAL INFO (EDIT STYLE LIKE IMAGE) */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <input
                    type="text"
                    value="Akhtar Tiwari"
                    readOnly
                    className="w-full border rounded-lg px-4 py-2 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email Address</label>
                  <input
                    type="email"
                    value="akhtar@email.com"
                    readOnly
                    className="w-full border rounded-lg px-4 py-2 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Mobile Number</label>
                  <input
                    type="text"
                    value="+91 9876543210"
                    readOnly
                    className="w-full border rounded-lg px-4 py-2 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 md:col-span-3 space-y-6">

            {/* ACCOUNT SETTINGS */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Account settings
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between cursor-pointer hover:text-blue-600">
                  Change Password <span>›</span>
                </li>
                <li className="flex items-center justify-between cursor-pointer hover:text-blue-600">
                  Account Security <span>›</span>
                </li>
                <li className="flex items-center justify-between cursor-pointer text-red-500">
                  Logout <span>›</span>
                </li>
              </ul>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Activity
              </h3>

              <ul className="space-y-4 text-sm text-gray-600">
                <li>
                  You logged in from a new device – Mumbai, India
                  <br />
                  <span className="text-xs text-gray-400">
                    Today, 12:45 PM
                  </span>
                </li>
                <li>
                  You logged in from a new device – Mumbai, India
                  <br />
                  <span className="text-xs text-gray-400">
                    Yesterday, 10:30 AM
                  </span>
                </li>
                <li>
                  Password was successfully changed
                  <br />
                  <span className="text-xs text-gray-400">
                    Jan 20, 2024, 02:15 PM
                  </span>
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