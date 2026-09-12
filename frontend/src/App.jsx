import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import Navbar        from './components/Navbar';
import Preloader     from './components/Preloader';
import CartDrawer    from './components/CartDrawer';
import AuthModal     from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import HomePage      from './pages/HomePage';
import ProductsPage  from './pages/ProductsPage';
import LoginPage     from './pages/LoginPage';
import Footer        from './components/Footer';
import Lenis         from 'lenis';
import gsap          from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Endpoint Route Handler for /home, /categories, /story, /reviews, /contact, /cart
function EndpointRouteHandler({ setAuthOpen, openCheckout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsCartOpen } = useCart();

  useEffect(() => {
    const path = location.pathname.toLowerCase().replace(/\/$/, '');

    if (path === '' || path === '/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/categories') {
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/story' || path === '/about') {
      const el = document.getElementById('story');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/reviews') {
      const el = document.getElementById('reviews');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/contact' || path === '/faq') {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/cart') {
      setIsCartOpen(true);
    }
  }, [location.pathname]);

  return (
    <HomePage
      onAuthOpen={() => setAuthOpen(true)}
      onCheckout={openCheckout}
    />
  );
}

function RedirectToPort3000({ target }) {
  useEffect(() => {
    window.location.href = `http://localhost:3000${target || '/admin'}`;
  }, [target]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#0f3d2a' }}>
      <p>Redirecting to Executive Admin Portal...</p>
    </div>
  );
}

function MainApp() {
  const [authOpen,     setAuthOpen]     = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);  // null = closed

  const location = useLocation();
  const isAdminOrProfile = location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile');

  // Initialize Lenis Smooth Scrolling Engine synchronized with GSAP
  useEffect(() => {
    if (isAdminOrProfile) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [isAdminOrProfile]);

  const { setIsCartOpen } = useCart();

  const openCheckout = (cartSummary) => {
    setIsCartOpen(false);
    setCheckoutData(cartSummary);
  };

  const hideFooter = ['/login', '/signin', '/register', '/auth', '/profile', '/account', '/checkout'].includes(location.pathname.toLowerCase().replace(/\/$/, ''));

  return (
    <>
      <Preloader minDuration={2200} />
      <Navbar onAuthOpen={() => setAuthOpen(true)} />

      <CartDrawer onCheckout={openCheckout} />

      <Routes>
        <Route path="/" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/home" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/products" element={<ProductsPage onAuthOpen={() => setAuthOpen(true)} onCheckout={openCheckout} />} />
        <Route path="/categories" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/story" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/about" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/reviews" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/contact" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/faq" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/cart" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
        <Route path="/login" element={<LoginPage initialTab="login" />} />
        <Route path="/signin" element={<LoginPage initialTab="login" />} />
        <Route path="/register" element={<LoginPage initialTab="register" />} />
        <Route path="/auth" element={<LoginPage initialTab="login" />} />
        <Route path="/admin/*" element={<RedirectToPort3000 target="/admin" />} />
        <Route path="/admin" element={<RedirectToPort3000 target="/admin" />} />
        <Route path="/profile" element={<RedirectToPort3000 target="/profile" />} />
        <Route path="/account" element={<RedirectToPort3000 target="/profile" />} />
        <Route path="*" element={<EndpointRouteHandler setAuthOpen={setAuthOpen} openCheckout={openCheckout} />} />
      </Routes>

      {!hideFooter && <Footer />}

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} />
      )}

      {checkoutData && (
        <CheckoutModal
          cartSummary={checkoutData}
          onClose={() => setCheckoutData(null)}
          onAuthOpen={() => { setCheckoutData(null); setAuthOpen(true); }}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
