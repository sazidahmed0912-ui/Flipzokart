import React from 'react';
import '../ProductListingPage.css';

const Header: React.FC = () => {
  return (
    <>
      <header className="main-header">
        <div className="header-left">
          <button className="hamburger-menu">☰</button> {/* Mobile */}
          <div className="flipzokart-logo"></div>
        </div>
        <div className="header-center">
          <div className="search-bar-container">
            <select className="category-dropdown">
              <option value="">All</option>
              <option value="electronics">Electronics</option>
              <option value="apparel">Apparel</option>
              <option value="groceries">Groceries</option>
            </select>
            <input type="text" placeholder="Search for products, brands and more" className="search-input" />
            <button className="search-button">🔍</button>
          </div>
        </div>
        <div className="header-right">
          <div className="header-icon-group">
            <span className="header-icon">👤 Login</span>
            <span className="header-icon">❤️ Wishlist</span>
            <span className="header-icon">🛒 Cart</span>
          </div>
          <button className="search-icon-mobile">🔍</button> {/* Mobile */}
          <span className="header-icon-mobile">🛒 Cart</span> {/* Mobile */}
        </div>
      </header>
      <div className="sticky-search-mobile"> {/* Mobile only sticky search bar */}
        <input type="text" placeholder="Search for products..." className="search-input-mobile" />
        <button className="search-button-mobile">🔍</button>
      </div>
    </>
  );
};

export default Header;
