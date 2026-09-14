'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useUIModal } from '@/components/Providers';
import { INITIAL_PRODUCTS } from '@/data/products';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Search, 
  Heart, 
  ChevronDown, 
  Sparkles, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  Gift,
  Star,
  Plus,
  Check,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react';
import './Navbar.css';

const QUICK_CATEGORIES = [
  { id: 'all',          name: 'All Harvest',       emoji: '🌿' },
  { id: 'spices',       name: 'Spices & Powders',  emoji: '🌶️', filter: 'Spices & Powders' },
  { id: 'oils',         name: 'Cold-Pressed Oils', emoji: '🛢️', filter: 'Cold-Pressed Oils' },
  { id: 'masalas',      name: 'Heritage Masalas',  emoji: '🍲', filter: 'Masala Blends' },
];

const ANNOUNCEMENTS = [
  { text: '🌿 100% Certified Organic & Single-Origin Direct from Farms', icon: ShieldCheck },
  { text: '🚚 Free Express Delivery Across India on Orders Above ₹499', icon: Truck },
  { text: '🎁 Flat 15% OFF On 1st Order — Code: FIRSTPURE', icon: Gift },
  { text: '💬 Instant WhatsApp Order & Support: +91 87784 76414', icon: PhoneCall },
];

const TRENDING_SEARCHES = [
  'Turmeric Powder',
  'Red Chilli',
  'Cold-Pressed Gingelly Oil',
  'Sambar Powder',
  'Groundnut Oil',
  'powder'
];

export default function Navbar({ onAuthOpen, onSearchOpen }) {
  const { cartCount, setIsCartOpen, addToCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const uiModal = useUIModal?.() || null;
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [catalog, setCatalog] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [addedItemKey, setAddedItemKey] = useState(null);
  const [mounted, setMounted] = useState(false);

  const dropRef = useRef(null);
  const catDropRef = useRef(null);
  const searchContainerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    fetch('/api/products?limit=100', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setCatalog(data.products);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleAuthClick = () => {
    setMenuOpen(false);
    router.push('/login');
  };

  // Enhanced fuzzy matching for instant search across live unified catalog
  const searchResults = searchQuery.trim()
    ? catalog.filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const origin = (p.origin || '').toLowerCase();
        const badge = (p.badge || '').toLowerCase();
        
        // Match tokens
        const tokens = query.split(/\s+/).filter(Boolean);
        return tokens.every((token) => {
          if (name.includes(token) || cat.includes(token) || desc.includes(token) || origin.includes(token) || badge.includes(token)) {
            return true;
          }
          // Chili / Chilli alias
          if ((token === 'chili' || token === 'chilli') && (name.includes('chilli') || name.includes('chili') || desc.includes('chilli'))) {
            return true;
          }
          // Oil aliases
          if ((token === 'oil' || token === 'oils') && (cat.includes('oil') || name.includes('oil'))) {
            return true;
          }
          // Turmeric / Haldi / Manjal
          if ((token === 'turmeric' || token === 'manjal' || token === 'haldi') && (name.includes('turmeric') || desc.includes('curcumin'))) {
            return true;
          }
          // Sambar / Masala
          if ((token === 'sambar' || token === 'masala') && (name.includes('sambar') || name.includes('masala') || cat.includes('masala'))) {
            return true;
          }
          return false;
        });
      })
    : [];

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false);
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCategoryDropOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  // Instant live search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      setMenuOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProductSelect = (product) => {
    setSearchFocused(false);
    setSearchQuery('');
    setMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(product.name)}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product, product.variants?.[0] || null);
    setAddedItemKey(product._id);
    setTimeout(() => setAddedItemKey(null), 1500);
  };

  // Instant category quick filter handler
  const handleCategorySelect = (cat) => {
    setActiveCategory(cat.id);
    setCategoryDropOpen(false);
    setMenuOpen(false);
    if (cat.filter) {
      router.push(`/products?category=${encodeURIComponent(cat.filter)}`);
    } else {
      router.push('/products');
    }
  };

  const navigateToSection = (sectionId, fallbackUrl) => {
    setMenuOpen(false);
    if (sectionId === 'offers') {
      router.push('/products');
      return;
    }
    if (pathname === '/home' || pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(fallbackUrl || '/home');
  };

  const activeAnnouncement = ANNOUNCEMENTS[tickerIndex];
  const AnnouncementIcon = activeAnnouncement.icon;

  return (
    <header className={`site-header-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      
      {/* ── 1. Top High-Trust Announcement Ticker Strip ── */}
      <div className="top-announcement-strip">
        <div className="container announcement-inner">
          <div className="announcement-content">
            <AnnouncementIcon size={14} className="ticker-icon" />
            <span className="ticker-text">{activeAnnouncement.text}</span>
          </div>
          <div className="announcement-quick-links">
            <span className="announcement-badge-pill">100% PURE</span>
            <span className="divider">|</span>
            <button type="button" className="quick-link-btn" onClick={() => router.push('/products')}>Shop Fresh Harvest</button>
            <span className="divider">|</span>
            <a href="https://wa.me/918778476414" target="_blank" rel="noreferrer" className="quick-link-btn highlight">WhatsApp Order</a>
          </div>
        </div>
      </div>

      {/* ── 2. Main Primary Navbar ── */}
      <nav className="main-navbar">
        <div className="container navbar-content-row">
          
          {/* Brand Logo */}
          <Link href="/home" className="navbar-brand-link" onClick={() => setMenuOpen(false)}>
            <div className="brand-badge-crest">
              <img
                src="/logo.png"
                alt="Venthulir"
                className="brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="brand-text-stack">
              <span className="brand-name">VENTHULIR</span>
              <span className="brand-tagline">100% PURE ORGANIC HARVEST</span>
            </div>
          </Link>

          {/* High-Converting Integrated Omnisearch with Live Autocomplete Dropdown */}
          <div className="nav-omnisearch-container" ref={searchContainerRef}>
            <form className={`omnisearch-form ${searchFocused ? 'focused' : ''}`} onSubmit={handleSearchSubmit}>
              <Search size={16} className="search-lead-icon" />
              <input
                type="text"
                placeholder="Search turmeric, cold-pressed oils, sambar masala..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                onClick={() => setSearchFocused(true)}
                className="omnisearch-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="search-submit-btn" aria-label="Submit search">
                <span>Search</span>
              </button>
            </form>

            {/* ── LIVE SEARCH RESULTS DROPDOWN ── */}
            {searchFocused && (
              <div className="search-instant-dropdown">
                
                {/* 1. When user typed query and has results */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="search-results-list">
                    <div className="search-results-header">
                      <span>Matching Organic Harvest ({searchResults.length})</span>
                    </div>

                    {searchResults.slice(0, 6).map((p) => {
                      const img = p.images?.[0] || p.imageUrl || p.image;
                      const isAdded = addedItemKey === p._id;
                      return (
                        <div 
                          key={p._id || p.id} 
                          className="search-item-row"
                          onClick={() => handleProductSelect(p)}
                        >
                          <div className="search-item-thumb">
                            {img ? <img src={img} alt={p.name} /> : <span>{p.name[0]}</span>}
                          </div>

                          <div className="search-item-info">
                            <span className="search-item-cat">{p.category || 'Farm Harvest'}</span>
                            <span className="search-item-name">{p.name}</span>
                          </div>

                          <div className="search-item-actions">
                            <span className="search-item-price">₹{p.price}</span>
                            <button
                              type="button"
                              className={`search-item-add-btn ${isAdded ? 'added' : ''}`}
                              onClick={(e) => handleQuickAdd(e, p)}
                              title="Add to Cart"
                            >
                              {isAdded ? (
                                <>
                                  <Check size={12} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <Link 
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="search-view-all-link"
                      onClick={() => setSearchFocused(false)}
                    >
                      <span>View all {searchResults.length} results for &quot;{searchQuery}&quot;</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}

                {/* 2. When query returned 0 results */}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="search-no-results">
                    <p className="no-res-title">No organic products found for &quot;{searchQuery}&quot;</p>
                    <p className="no-res-sub">Try searching for authentic staples like:</p>
                    <div className="search-suggestion-pills">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="suggestion-pill"
                          onClick={() => {
                            setSearchQuery(term);
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. When search is focused but empty (Trending Searches) */}
                {!searchQuery.trim() && (
                  <div className="search-trending-section">
                    <div className="trending-header">
                      <TrendingUp size={14} className="trending-icon" />
                      <span>Trending Organic Harvest</span>
                    </div>
                    <div className="trending-chips-grid">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="trending-chip-btn"
                          onClick={() => {
                            setSearchQuery(term);
                          }}
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Desktop Navigation Links */}
          <div className="navbar-nav-group">
            <Link 
              href="/home"
              className="nav-item-btn"
              onClick={(e) => { 
                setMenuOpen(false); 
                if (pathname === '/home' || pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }
              }}
            >
              Home
            </Link>

            <Link 
              href="/products"
              className="nav-item-btn"
              onClick={() => { setMenuOpen(false); }}
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div 
              className="nav-dropdown-wrapper" 
              ref={catDropRef}
              onMouseEnter={() => setCategoryDropOpen(true)}
              onMouseLeave={() => setCategoryDropOpen(false)}
            >
              <button 
                type="button" 
                className={`nav-item-btn with-arrow ${categoryDropOpen ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCategoryDropOpen(v => !v);
                }}
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`chevron-icon ${categoryDropOpen ? 'rotate' : ''}`} />
              </button>

              {categoryDropOpen && (
                <div className="nav-flyout-menu">
                  <div className="flyout-header">Browse Organic Categories</div>
                  {QUICK_CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={cat.filter ? `/products?category=${encodeURIComponent(cat.filter)}` : '/products'}
                      className="flyout-item"
                      onClick={() => setCategoryDropOpen(false)}
                    >
                      <span className="flyout-emoji">{cat.emoji}</span>
                      <span className="flyout-name">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* High-Converting Offer Pill */}
            <button 
              type="button" 
              className="nav-offer-pill"
              onClick={() => navigateToSection('offers', '/home#offers')}
            >
              <Flame size={13} className="flame-icon" />
              <span>Festive Offers</span>
            </button>
          </div>

          {/* User Actions (Wishlist, Cart, Profile) */}
          <div className="navbar-actions-group">
            
            {/* Wishlist Button */}
            <Link 
              href="/products"
              className="nav-action-icon-btn"
              title="Saved Items"
            >
              <Heart size={19} />
            </Link>

            {/* Cart Button */}
            <button 
              type="button" 
              className="nav-action-cart-btn" 
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
              aria-label="Open Shopping Cart"
            >
              <div className="cart-icon-wrapper">
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </div>
              <span className="cart-label-text">Cart</span>
            </button>

            {/* Auth / Account Profile */}
            {isAuthenticated ? (
              <Link href="/profile" className="user-profile-btn" style={{textDecoration: 'none'}}>
                <div className="user-avatar-initial">
                  {user?.name?.[0]?.toUpperCase() || <User size={14} />}
                </div>
                <span className="user-firstname">{user?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
            ) : (
              <Link 
                href="/login"
                className="btn-header-signin" 
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button 
              className="nav-mobile-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation"
              type="button"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

        </div>
      </nav>

      {/* ── 3. Mobile Drawer Menu via Portal ── */}
      {menuOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div className="mobile-nav-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-panel-header">
              <span className="mobile-brand-title">VENTHULIR</span>
              <button className="mobile-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
              <Search size={15} className="mobile-search-icon" />
              <input
                type="text"
                placeholder="Search organic products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Category List */}
            <div className="mobile-menu-section">
              <span className="mobile-section-label">Quick Shop</span>
              <div className="mobile-category-grid">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="mobile-category-pill"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="mobile-menu-section">
              <span className="mobile-section-label">Navigation</span>
              <button type="button" className="mobile-nav-row" onClick={() => navigateToSection('home', '/home')}>
                <span>Home</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </button>
              <button type="button" className="mobile-nav-row" onClick={() => { setMenuOpen(false); router.push('/products'); }}>
                <span>All Products</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </button>
              <button type="button" className="mobile-nav-row" onClick={() => navigateToSection('story', '/home#story')}>
                <span>Our Story</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </button>
              <button type="button" className="mobile-nav-row" onClick={() => navigateToSection('reviews', '/home#reviews')}>
                <span>Customer Reviews</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </button>
              <button type="button" className="mobile-nav-row" onClick={() => navigateToSection('faq', '/home#faq')}>
                <span>Help &amp; Contact</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </button>
            </div>

            {/* Mobile Auth Button */}
            <div className="mobile-panel-footer">
              {!isAuthenticated ? (
                <Link 
                  href="/login"
                  className="mobile-auth-cta" 
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Sign In / Register</span>
                </Link>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    href="/profile"
                    className="mobile-auth-cta"
                    onClick={() => setMenuOpen(false)}
                    style={{ background: '#166534' }}
                  >
                    <User size={16} />
                    <span>My Profile &amp; Orders</span>
                  </Link>
                  <button 
                    type="button"
                    className="mobile-auth-cta logout" 
                    onClick={() => { logout(); setMenuOpen(false); }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </header>
  );
}
