'use client';

import React, { useState } from 'react';
import './FloatingWhatsApp.css';

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = '918778476414';
  const defaultMessage = encodeURIComponent('Hello Venthulir! I would like to place an order / inquire about your organic harvest.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside 
      className="floating-whatsapp-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="WhatsApp Support"
    >
      {/* Floating Prompt Pill */}
      <div className={`whatsapp-tooltip ${isHovered ? 'visible' : ''}`}>
        <div className="tooltip-header">
          <span className="online-indicator" />
          <span className="tooltip-title">Direct Farm Support</span>
        </div>
        <p className="tooltip-text">Chat with us to place orders or ask questions</p>
      </div>

      {/* Main WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat and order on WhatsApp"
      >
        <span className="whatsapp-ping" />
        
        {/* Official WhatsApp SVG Icon */}
        <svg 
          viewBox="0 0 32 32" 
          className="whatsapp-icon-svg" 
          fill="currentColor"
          width="30" 
          height="30"
          aria-hidden="true"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.26 2.13 7.42L2 30l6.76-2.1c2.1 1.25 4.55 1.98 7.24 1.98 7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.54c-2.35 0-4.52-.66-6.38-1.8l-.46-.28-4.22 1.31 1.33-4.11-.3-.47C4.7 20.32 4.08 18.22 4.08 16c0-6.57 5.35-11.92 11.92-11.92 6.57 0 11.92 5.35 11.92 11.92 0 6.57-5.35 11.92-11.92 11.92zm6.54-8.94c-.36-.18-2.12-1.05-2.45-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.96-1.8-2.14-2.01-2.5-.21-.36-.02-.56.16-.74.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.16 5.44.86.37 1.53.59 2.06.76.87.28 1.66.24 2.29.15.7-.1 2.12-.87 2.42-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42z"/>
        </svg>
      </a>
    </aside>
  );
}
