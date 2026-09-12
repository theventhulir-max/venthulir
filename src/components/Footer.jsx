'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLinkClick = (path, hash) => {
    if (path.includes('#')) {
      if (pathname === '/home' || pathname === '/') {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <img
              src="/logo.png"
              alt="Venthulir"
              className="footer-logo"
              onError={e => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="footer-logo-text" style={{ display: 'none' }}>VENTHULIR</span>
            <p className="footer-tagline">
              Bringing the purest organic oils, spices and natural products directly from Tamil Nadu farms to your kitchen.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[
                ['/home', '#home', 'Home'],
                ['/products', '#products', 'Products'],
                ['/home#categories', '#categories', 'Categories'],
                ['/home#story', '#story', 'Our Story'],
                ['/home#reviews', '#reviews', 'Reviews'],
                ['/home#faq', '#faq', 'Contact']
              ].map(([path, hash, label]) => (
                <li key={label}>
                  <a href={path} onClick={(e) => { e.preventDefault(); handleLinkClick(path, hash); }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {['Cold-Pressed Oils', 'Spice Powders', 'Masala Blends', 'Rice Varieties', 'Natural Sweeteners'].map(c => (
                <li key={c}>
                  <a href="/products" onClick={(e) => { e.preventDefault(); router.push('/products'); }}>
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li><Phone size={14} /><span>+91 87784 76414</span></li>
              <li><Mail size={14} /><a href="mailto:theventhulir@gmail.com">theventhulir@gmail.com</a></li>
              <li><MapPin size={14} /><span>Tamil Nadu, India</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Venthulir. All rights reserved.</p>
          <p>Made with ❤️ in Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
