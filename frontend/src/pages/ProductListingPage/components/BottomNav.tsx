import React from 'react';
import '../ProductListingPage.css';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-navigation">
      <a href="#" className="nav-item">
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-icon">🛍️</span>
        <span className="nav-label">Categories</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-icon">🛒</span>
        <span className="nav-label">Cart</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-icon">👤</span>
        <span className="nav-label">Account</span>
      </a>
    </nav>
  );
};

export default BottomNav;
