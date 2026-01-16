import React from 'react';
import '../ProductListingPage.css';

interface SidebarProps {
  // Add props for filter state management and callbacks if needed
}

const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="product-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Categories</h3>
        <ul>
          <li><a href="#">Electronics</a></li>
          <li><a href="#">Apparel</a></li>
          <li><a href="#">Groceries</a></li>
          <li><a href="#">Home & Kitchen</a></li>
          <li><a href="#">Toys & Gaming</a></li>
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Price</h3>
        {/* Placeholder for a price slider */}
        <div className="price-slider-placeholder">
          <input type="range" min="0" max="10000" />
          <span>INR 0 - INR 10000</span>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Brand</h3>
        <div className="brand-checkboxes">
          <label><input type="checkbox" /> SmartTech</label>
          <label><input type="checkbox" /> GreenHarvest</label>
          <label><input type="checkbox" /> FashionHub</label>
          <label><input type="checkbox" /> AudioPro</label>
          <label><input type="checkbox" /> AquaFresh</label>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Customer Ratings</h3>
        <div className="ratings-filter">
          <label><input type="checkbox" /> 4★ & above</label>
          <label><input type="checkbox" /> 3★ & above</label>
          <label><input type="checkbox" /> 2★ & above</label>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Discount</h3>
        <div className="discount-filter">
          <label><input type="checkbox" /> 50% or more</label>
          <label><input type="checkbox" /> 30% or more</label>
          <label><input type="checkbox" /> 10% or more</label>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
