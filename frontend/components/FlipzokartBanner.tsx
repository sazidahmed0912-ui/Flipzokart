import React from 'react';
import './FlipzokartBanner.css';

const FlipzokartBanner: React.FC = () => {
  return (
    <div className="flipzokart-banner">
      <div className="banner-content">
        <div className="left-side">
          <div className="couple-image">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* Background circle */}
              <circle cx="100" cy="100" r="95" fill="#fff" opacity="0.9" />

              {/* Person 1 - Female */}
              <circle cx="70" cy="80" r="20" fill="#FFDBAC" />
              <path d="M60 100 L60 140 L80 140 L80 100 Z" fill="#4A90E2" />
              <path d="M60 140 L50 160 L70 155 L80 140 Z" fill="#4A90E2" />
              <path d="M80 140 L90 160 L70 155 Z" fill="#4A90E2" />

              {/* Shopping bag for person 1 */}
              <path d="M55 120 Q60 115 65 120 T75 125 Q80 120 75 115 T65 110 Q60 115 55 120" fill="#FF6B6B" />

              {/* Person 2 - Male */}
              <circle cx="130" cy="85" r="18" fill="#F1C27D" />
              <path d="M120 103 L120 143 L140 143 L140 103 Z" fill="#50C878" />
              <path d="M120 143 L110 163 L130 158 L140 143 Z" fill="#50C878" />
              <path d="M140 143 L150 163 L130 158 Z" fill="#50C878" />

              {/* Shopping bag for person 2 */}
              <path d="M135 125 Q140 120 145 125 T155 130 Q160 125 155 120 T145 115 Q140 120 135 125" fill="#4ECDC4" />

              {/* Smiling faces */}
              <circle cx="65" cy="75" r="2" fill="#000" />
              <circle cx="75" cy="75" r="2" fill="#000" />
              <path d="M68 82 Q70 85 72 82" stroke="#000" strokeWidth="1.5" fill="none" />

              <circle cx="125" cy="80" r="2" fill="#000" />
              <circle cx="135" cy="80" r="2" fill="#000" />
              <path d="M128 87 Q130 90 132 87" stroke="#000" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        <div className="right-side">
          <h1 className="brand-name"></h1>
          <p className="featured-text">Featured on</p>
          <div className="discount-badge">
            Up to 70% Off
          </div>
        </div>
      </div>

      {/* Subtle dot texture overlay */}
      <div className="dot-texture"></div>
    </div>
  );
};

export default FlipzokartBanner;
