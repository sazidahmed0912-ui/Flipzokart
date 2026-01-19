import React from "react";
import "./ProfilePage.css";

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* LEFT SIDEBAR */}
        <aside className="profile-sidebar">
          <ul>
            <li className="active">My Profile</li>
            <li>Orders</li>
            <li>Wishlist</li>
            <li>Account Security</li>
            <li>Address Book</li>
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="profile-main">

          <h2 className="profile-title">My Profile</h2>

          {/* PROFILE SUMMARY */}
          <div className="profile-card profile-summary">
            <div className="avatar">A</div>

            <div className="profile-info">
              <h3>Akhtar Tiwari</h3>
              <p>akhtar@email.com</p>
              <p>+91 9876543210</p>

              <div className="profile-stats">
                <div>
                  <strong>5</strong>
                  <span>Orders</span>
                </div>
                <div className="verified">Verified</div>
                <div>Joined Jan 21</div>
              </div>
            </div>

            <button className="edit-btn">Edit</button>
          </div>

          {/* PERSONAL INFO VIEW */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button className="edit-link">Edit</button>
            </div>

            <div className="info-row">
              <span>Full Name</span>
              <strong>Akhtar Tiwari</strong>
            </div>
            <div className="info-row">
              <span>Email Address</span>
              <strong>akhtar@email.com</strong>
            </div>
            <div className="info-row">
              <span>Mobile Number</span>
              <strong>+91 9876543210</strong>
            </div>
          </div>

          {/* PERSONAL INFO EDIT STYLE */}
          <div className="profile-card">
            <h3>Personal Information</h3>

            <label>Full Name</label>
            <input value="Akhtar Tiwari" readOnly />

            <label>Email Address</label>
            <input value="akhtar@email.com" readOnly />

            <label>Mobile Number</label>
            <input value="+91 9876543210" readOnly />
          </div>

        </main>

        {/* RIGHT PANEL */}
        <aside className="profile-right">

          <div className="profile-card">
            <h3>Account settings</h3>
            <ul className="settings-list">
              <li>Change Password</li>
              <li>Account Security</li>
              <li className="logout">Logout</li>
            </ul>
          </div>

          <div className="profile-card">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              <li>
                Logged in from new device – Mumbai  
                <span>Today, 12:45 PM</span>
              </li>
              <li>
                Logged in from new device – Mumbai  
                <span>Yesterday, 10:30 AM</span>
              </li>
              <li>
                Password successfully changed  
                <span>Jan 20, 2024, 02:15 PM</span>
              </li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default ProfilePage;