'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Clock
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }, 600);
  };

  const handleLinkClick = (path, hash) => {
    if (path.includes('#')) {
      if (pathname === '/home' || pathname === '/') {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      router.push(path);
    } else {
      router.push(path);
    }
  };

  const handleCategoryClick = (categoryFilter) => {
    router.push(`/products?category=${encodeURIComponent(categoryFilter)}`);
  };

  return (
    <footer className="footer-luxury-root">
      <div className="container footer-container">

        {/* ── Top Row: Minimalist Newsletter Subscription ── */}
        <div className="footer-top-newsletter">
          <div className="newsletter-text-block">
            <span className="newsletter-eyebrow">
              <Sparkles size={13} color="#f59e0b" />
              JOIN THE VENTHULIR CIRCLE
            </span>
            <h3 className="newsletter-title">Subscribe for Pure Farm Harvest Updates</h3>
            <p className="newsletter-desc">
              Receive seasonal harvest recipes, health tips &amp; exclusive 10% discount on your first order.
            </p>
          </div>

          <div className="newsletter-form-block">
            {subscribed ? (
              <div className="newsletter-success-pill">
                <CheckCircle2 size={16} color="#22c55e" />
                <span>Thank you for subscribing to Venthulir!</span>
              </div>
            ) : (
              <form className="newsletter-pill-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-footer-subscribe"
                >
                  <span>{submitting ? 'Subscribing...' : 'Subscribe'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer-hairline-divider" />

        {/* ── Main 4-Column Minimalist Grid ── */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="footer-col brand-col">
            <Link href="/home" className="footer-brand-header">
              <div className="brand-logo-icon">🌿</div>
              <div className="brand-title-wrap">
                <span className="brand-name">VENTHULIR</span>
                <span className="brand-tagline">100% PURE ORGANIC HARVEST</span>
              </div>
            </Link>

            <p className="footer-about-text">
              Preserving ancient Tamil Nadu agricultural traditions. Single-origin cold-pressed 
              Chekku oils and stone-ground spices crafted directly from native family farms.
            </p>

            <div className="footer-social-pill-row">
              <a 
                href="https://wa.me/918778476414" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-circle-btn whatsapp"
                aria-label="WhatsApp"
                title="WhatsApp Direct Support"
              >
                <MessageSquare size={15} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-circle-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-circle-btn"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Harvest Products */}
          <div className="footer-col">
            <h4 className="footer-heading">Harvest Catalog</h4>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleCategoryClick('Cold-Pressed Oils')} className="footer-btn-link">
                  Wood Cold-Pressed Oils
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('Spices & Powders')} className="footer-btn-link">
                  Stone-Ground Spices
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryClick('Masala Blends')} className="footer-btn-link">
                  Heritage Masalas
                </button>
              </li>
              <li>
                <a 
                  href="/home#bestsellers" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#bestsellers', '#bestsellers');
                  }} 
                  className="footer-anchor-link"
                >
                  Top Sellers
                </a>
              </li>
              <li>
                <a 
                  href="/home#all-products" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#all-products', '#all-products');
                  }} 
                  className="footer-anchor-link"
                >
                  All Products Catalog
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Trust */}
          <div className="footer-col">
            <h4 className="footer-heading">About &amp; Purity</h4>
            <ul className="footer-link-list">
              <li>
                <a 
                  href="/home#why-choose" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#why-choose', '#why-choose');
                  }} 
                  className="footer-anchor-link"
                >
                  Our Farm Principles
                </a>
              </li>
              <li>
                <a 
                  href="/home#why-choose" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#why-choose', '#why-choose');
                  }} 
                  className="footer-anchor-link"
                >
                  Vaagai Chekku Process
                </a>
              </li>
              <li>
                <a 
                  href="/home#reviews" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#reviews', '#reviews');
                  }} 
                  className="footer-anchor-link"
                >
                  Customer Reviews
                </a>
              </li>
              <li>
                <a 
                  href="/home#faq" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#faq', '#faq');
                  }} 
                  className="footer-anchor-link"
                >
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a 
                  href="/home#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/home#contact', '#contact');
                  }} 
                  className="footer-anchor-link"
                >
                  Bulk &amp; Wholesale Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Farm Helpline */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Farm Helpline</h4>
            
            <div className="contact-details-box">
              <a href="tel:+918778476414" className="contact-item-row">
                <div className="contact-icon-bubble">
                  <Phone size={14} />
                </div>
                <div className="contact-item-text">
                  <span className="item-label">Customer Support</span>
                  <span className="item-val font-semibold">+91 87784 76414</span>
                </div>
              </a>

              <a href="mailto:theventhulir@gmail.com" className="contact-item-row">
                <div className="contact-icon-bubble">
                  <Mail size={14} />
                </div>
                <div className="contact-item-text">
                  <span className="item-label">Email Orders</span>
                  <span className="item-val">theventhulir@gmail.com</span>
                </div>
              </a>

              <div className="contact-item-row static">
                <div className="contact-icon-bubble">
                  <MapPin size={14} />
                </div>
                <div className="contact-item-text">
                  <span className="item-label">Milled &amp; Packed At</span>
                  <span className="item-val">Salem &amp; Erode, Tamil Nadu</span>
                </div>
              </div>
            </div>

            <a 
              href="https://wa.me/918778476414" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp-direct"
            >
              <MessageSquare size={14} />
              <span>Instant WhatsApp Chat</span>
            </a>
          </div>

        </div>

        {/* ── Bottom Micro Bar ── */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright-text">
            &copy; {new Date().getFullYear()} <strong>Venthulir Pure Organic Harvest</strong>. Handcrafted with pride in Tamil Nadu.
          </p>

          <div className="footer-trust-chips">
            <span className="trust-chip"><Leaf size={11} color="#22c55e" /> 100% Single-Origin</span>
            <span className="trust-dot">&bull;</span>
            <span className="trust-chip"><ShieldCheck size={11} color="#f59e0b" /> FSSAI Certified</span>
            <span className="trust-dot">&bull;</span>
            <span className="trust-chip"><Sparkles size={11} color="#38bdf8" /> Zero Chemicals</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
