'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, Tag, Truck } from 'lucide-react';
import { PRESET_COUPONS } from '@/data/constants';
import './CartDrawer.css';

const SHIPPING_FREE_THRESHOLD = 499;
const SHIPPING_FEE = 60;

const getFallbackImage = (name = '', category = '') => {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  if (lowerName.includes('turmeric') || lowerName.includes('manjal') || lowerName.includes('yellow') || lowerName.includes('turm')) return '/assets/hero/turmeric.png';
  if (lowerName.includes('chilli') || lowerName.includes('chili') || lowerName.includes('red') || lowerName.includes('milagai')) return '/assets/hero/chilli.png';
  if (lowerName.includes('coriander') || lowerName.includes('mallie') || lowerName.includes('dhaniya') || lowerName.includes('kothamalli')) return '/assets/hero/coriander.png';
  if (lowerName.includes('sambar') || lowerName.includes('masala') || lowerName.includes('garam') || lowerName.includes('rasam')) return '/assets/hero/sambar.png';
  if (lowerName.includes('coconut') || lowerName.includes('thengai')) return '/assets/hero/oil_coconut.png';
  if (lowerName.includes('groundnut') || lowerName.includes('kadalai')) return '/assets/hero/oil_groundnut.png';
  if (lowerName.includes('gingelly') || lowerName.includes('sesame') || lowerName.includes('nallennai') || lowerName.includes('til')) return '/assets/hero/oil_gingelly.png';
  if (lowerName.includes('oil') || lowerCat.includes('oil')) return '/assets/hero/oil_sunflower.png';
  return '/assets/hero/turmeric.png';
};

export default function CartDrawer({ onCheckout }) {
  const { cartItems, updateQty, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]   = useState('');

  // Lock background body scroll while CartDrawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (PRESET_COUPONS[code]) {
      setAppliedCoupon({ code, ...PRESET_COUPONS[code] });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(cartTotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const afterDiscount = Math.max(cartTotal - discount, 0);
  const shippingFee   = afterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal    = afterDiscount + shippingFee;

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer animate-slide-right">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} />
            <span>Your Cart</span>
            {cartItems.length > 0 && <span className="cart-count-pill">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>}
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}><X size={20} /></button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <button className="btn-primary" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item-img">
                  <img 
                    src={item.image || getFallbackImage(item.name, item.category)} 
                    alt={item.name} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(item.name, item.category);
                    }}
                  />
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  {item.variant && <p className="cart-item-variant">{item.variant.label}</p>}
                  <p className="cart-item-price">₹{item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.key, item.quantity - 1)}><Minus size={13} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)}><Plus size={13} /></button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.key)}><X size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Shipping notice */}
            {afterDiscount < SHIPPING_FREE_THRESHOLD && (
              <div className="shipping-notice">
                <Truck size={15} />
                <span>Add <strong>₹{SHIPPING_FREE_THRESHOLD - afterDiscount}</strong> more for free shipping!</span>
              </div>
            )}

            {/* Coupon */}
            <div className="coupon-row">
              <Tag size={15} />
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {couponError   && <p className="coupon-error">{couponError}</p>}
            {appliedCoupon && <p className="coupon-success">✓ {appliedCoupon.label} applied!</p>}

            {/* Totals */}
            <div className="cart-totals">
              <div className="total-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
              {discount > 0 && <div className="total-row discount"><span>Discount</span><span>−₹{discount}</span></div>}
              <div className="total-row"><span>Shipping</span><span>{shippingFee === 0 ? <span className="free-ship">FREE</span> : `₹${shippingFee}`}</span></div>
              <div className="total-row grand"><span>Total</span><span>₹{grandTotal}</span></div>
            </div>

            <button className="btn-primary checkout-cta" onClick={() => onCheckout({ grandTotal, discount, appliedCoupon, shippingFee })}>
              Proceed to Checkout →
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <a
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 750,
                  color: '#0f3d2a',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                View Detailed Cart Page →
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
