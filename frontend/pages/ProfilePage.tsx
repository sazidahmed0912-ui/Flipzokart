import React from "react";
import Sidebar from "../src/pages/ProductListingPage/components/Sidebar";

const ProfilePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <div className="col-span-12 md:col-span-3">
          <Sidebar />
        </div>

        {/* CENTER */}
        <div className="col-span-12 md:col-span-6 space-y-6">

          {/* PROFILE SUMMARY */}
          <div className="bg-white rounded-xl shadow p-6 flex gap-6 items-center flex-wrap">
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold text-white">
              A
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold">Akhtar Tiwari</h2>
              <p className="text-gray-500">akhtar@email.com</p>
              <p className="text-gray-500">+91 9876543210</p>

              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                  <p className="font-semibold">5</p>
                  <p className="text-sm text-gray-500">Orders</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-lg text-center text-green-600 font-medium">
                  Verified
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-lg text-center text-sm text-gray-500">
                  Joined Jan 21
                </div>
              </div>
            </div>

            <button className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-lg font-medium">
              Edit
            </button>
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <button className="text-yellow-500 font-medium">Edit</button>
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
        </div>

        {/* RIGHT */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Account Settings</h3>
            <div className="space-y-3">
              <div className="cursor-pointer hover:text-blue-600">Change Password</div>
              <div className="cursor-pointer hover:text-blue-600">Account Security</div>
              <div className="cursor-pointer hover:text-red-500">Logout</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>Logged in from new device – Mumbai</div>
              <div>Password changed successfully</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;