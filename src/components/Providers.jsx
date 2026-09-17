'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Lenis from 'lenis';

const UIModalContext = createContext();
export const useUIModal = () => useContext(UIModalContext);

function ProvidersInner({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const { setIsCartOpen } = useCart();

  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isProfileRoute = pathname?.startsWith('/profile') || pathname?.startsWith('/account');



  const router = useRouter();

  useEffect(() => {
    // Disable smooth scrolling in Admin dashboard to prevent scroll hijacking bugs
    if (isAdminRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const openCheckout = (cartSummary) => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const hideFooter = isAdminRoute || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register') || 
    pathname?.startsWith('/profile') || 
    pathname?.startsWith('/checkout') || 
    pathname?.startsWith('/account');

  const handleOpenAuth = () => {
    setAuthOpen(true);
  };

  return (
    <UIModalContext.Provider value={{ setAuthOpen: () => setAuthOpen(true), openCheckout: (summary) => { setIsCartOpen(false); setCheckoutData(summary); } }}>
      {!isAdminRoute && (
        <Navbar
          onAuthOpen={handleOpenAuth}
        />
      )}

      {!isAdminRoute && <CartDrawer onCheckout={openCheckout} />}

      <main>{children}</main>

      {!hideFooter && <Footer />}

      {!isAdminRoute && <FloatingWhatsApp />}

      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          cartSummary={checkoutData}
          onClose={() => setCheckoutData(null)}
          onAuthOpen={() => {
            setCheckoutData(null);
            handleOpenAuth();
          }}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </UIModalContext.Provider>
  );
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ProvidersInner>{children}</ProvidersInner>
      </CartProvider>
    </AuthProvider>
  );
}
