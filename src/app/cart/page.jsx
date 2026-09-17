'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Leaf, 
  Tag, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { PRESET_COUPONS } from '@/data/constants';
import './CartPage.css';

const SHIPPING_FREE_THRESHOLD = 499;
const SHIPPING_FEE = 60;

function CartPageContent() {
  const router = useRouter();
  const { cartItems, updateQty, removeFromCart, clearCart, cartTotal } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // Coupon application
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (PRESET_COUPONS[code]) {
      setAppliedCoupon({ code, ...PRESET_COUPONS[code] });
      setCouponMsg({ type: 'success', text: `✓ ${PRESET_COUPONS[code].label} applied!` });
      return;
    }

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data = await res.json();
        const discountType = data.discountType || 'percent';
        const discountVal = data.discountValue || data.discountPercentage || 10;
        setAppliedCoupon({
          code,
          type: discountType,
          value: discountVal,
          label: `${discountVal}${discountType === 'percent' ? '%' : '₹'} OFF`
        });
        setCouponMsg({ type: 'success', text: `✓ Coupon ${code} applied successfully!` });
      } else {
        const errData = await res.json().catch(() => ({}));
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: errData.error || 'Invalid or expired coupon code.' });
      }
    } catch {
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: 'Invalid coupon code.' });
    }
  };

  // Calculations
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((cartTotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  const afterDiscountTotal = Math.max(cartTotal - discountAmount, 0);
  const isFreeShipping = afterDiscountTotal >= SHIPPING_FREE_THRESHOLD || afterDiscountTotal === 0;
  const shippingFee = isFreeShipping ? 0 : SHIPPING_FEE;
  const grandTotal = afterDiscountTotal + shippingFee;
  const progressPercent = Math.min(100, Math.round((afterDiscountTotal / SHIPPING_FREE_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, SHIPPING_FREE_THRESHOLD - afterDiscountTotal);

  // ── EMPTY CART STATE ──
  if (cartItems.length === 0) {
    return (
      <div className="cart-page-root">
        <div className="cart-empty-container">
          <div className="empty-cart-icon-circle">
            <ShoppingBag size={40} />
          </div>
          <h1 className="empty-cart-title">Your Basket is Empty</h1>
          <p className="empty-cart-subtext">
            Looks like you haven&apos;t added any single-origin stone ground spices, wooden chekku oils, or heirloom staples to your cart yet.
          </p>
          <Link href="/products" className="btn-proceed-checkout" style={{ display: 'inline-flex', maxWidth: '300px', margin: '0 auto' }}>
            <span>Explore Organic Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-root">
      <div className="cart-page-container">
        
        {/* Top Header */}
        <div className="cart-page-header">
          <div className="cart-page-title-row">
            <h1 className="cart-page-heading">
              <span>Your Shopping Cart</span>
              <span className="cart-items-count-badge">
                {cartItems.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </h1>
            <Link href="/products" className="cart-continue-link">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Cart Grid */}
        <div className="cart-page-grid">
          
          {/* ── LEFT COLUMN: ITEMS & FREE SHIPPING PROGRESS ── */}
          <div className="cart-left-col">
            
            {/* Free Shipping Progress Banner */}
            <div className="cart-shipping-banner">
              <div className={`shipping-banner-text ${isFreeShipping ? 'unlocked' : ''}`}>
                <Truck size={18} />
                {isFreeShipping ? (
                  <span>🎉 Congratulations! You have unlocked <strong>FREE Farm Express Delivery</strong>!</span>
                ) : (
                  <span>
                    Add <strong>₹{amountNeeded}</strong> more to unlock <strong>FREE Delivery</strong> (Free &gt; ₹{SHIPPING_FREE_THRESHOLD})
                  </span>
                )}
              </div>
              <div className="shipping-progress-track">
                <div 
                  className="shipping-progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items Table / Card */}
            <div className="cart-items-card">
              
              {/* Header row for desktop */}
              <div className="cart-items-table-header">
                <span>Product Details</span>
                <span>Unit Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
                <span></span>
              </div>

              {/* Items Rows */}
              <div className="cart-items-rows-wrap">
                {cartItems.map((item) => {
                  const itemPrice = item.price || 0;
                  const itemSubtotal = itemPrice * (item.quantity || 1);

                  return (
                    <div key={item.key} className="cart-item-table-row">
                      
                      {/* 1. Product Info */}
                      <div className="cart-row-product">
                        <div className="cart-row-img-box">
                          <img 
                            src={item.image || '/assets/hero/coriander.png'} 
                            alt={item.name} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/hero/coriander.png';
                            }}
                          />
                        </div>
                        <div className="cart-row-details">
                          <h4>{item.name}</h4>
                          {item.variant && (
                            <span className="cart-row-variant-tag">{item.variant.label}</span>
                          )}
                          {item.category && (
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.category}</span>
                          )}
                        </div>
                      </div>

                      {/* 2. Unit Price */}
                      <div className="cart-row-unit-price">
                        <span>₹{itemPrice}</span>
                      </div>

                      {/* 3. Quantity Controls */}
                      <div>
                        <div className="cart-row-qty-wrap">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQty(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQty(item.key, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* 4. Subtotal */}
                      <div className="cart-row-subtotal">
                        <span>₹{itemSubtotal}</span>
                      </div>

                      {/* 5. Remove Button */}
                      <div>
                        <button
                          type="button"
                          className="cart-row-remove-btn"
                          onClick={() => removeFromCart(item.key)}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom bar of table */}
              <div className="cart-items-bottombar">
                <Link href="/products" className="cart-continue-link">
                  <ArrowLeft size={15} />
                  <span>Shop More Harvest</span>
                </Link>

                <button
                  type="button"
                  className="btn-clear-cart"
                  onClick={() => {
                    if (window.confirm('Clear all items from your shopping basket?')) {
                      clearCart();
                    }
                  }}
                >
                  <Trash2 size={14} />
                  <span>Clear Cart</span>
                </button>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: SUMMARY & CHECKOUT CTA ── */}
          <div className="cart-right-col">
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              {/* Coupon Box */}
              <div className="cart-coupon-box">
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. VENTHULIR)"
                  className="cart-coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-apply-cart-coupon"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>

              {couponMsg.text && (
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  color: couponMsg.type === 'success' ? '#1B5E2F' : '#b91c1c',
                  marginBottom: '14px'
                }}>
                  {couponMsg.text}
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="cart-breakdown-list">
                <div className="breakdown-row">
                  <span>Bag Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="breakdown-row discount-row">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="breakdown-row">
                  <span>Estimated Delivery</span>
                  <span>
                    {isFreeShipping ? (
                      <strong style={{ color: '#1B5E2F' }}>FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="breakdown-row grand-row">
                  <span>Total Payable</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                type="button"
                className="btn-proceed-checkout"
                onClick={() => router.push('/checkout')}
              >
                <span>Proceed to Checkout • ₹{grandTotal}</span>
                <ArrowRight size={18} />
              </button>

              {/* Trust Badges */}
              <div className="cart-trust-badges">
                <div className="cart-trust-item">
                  <ShieldCheck size={16} />
                  <span>100% Certified Organic • Lab Tested Pure</span>
                </div>
                <div className="cart-trust-item">
                  <Leaf size={16} />
                  <span>Cold-Pressed Below 40°C • Native Heritage Seeds</span>
                </div>
                <div className="cart-trust-item">
                  <Truck size={16} />
                  <span>Swift Farm Dispatch with Eco-Safe Packaging</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="cart-page-root">
        <div className="cart-empty-container">
          <p style={{ color: '#0f3d2a', fontWeight: 650 }}>Loading your cart...</p>
        </div>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
