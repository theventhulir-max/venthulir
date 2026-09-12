'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  Banknote,
  QrCode,
  PackageCheck,
  Plus
} from 'lucide-react';
import { PRESET_COUPONS } from '@/data/constants';
import './CheckoutPage.css';

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

function CheckoutContent() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Delivery / Contact Details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Auto-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.deliveryAddress?.address || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || 'Tamil Nadu',
        zipCode: user.deliveryAddress?.zipCode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setOrderError('');
  };

  // Coupon application
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (PRESET_COUPONS[code]) {
      setAppliedCoupon({ code, ...PRESET_COUPONS[code] });
      setCouponMsg({ type: 'success', text: `✓ Applied: ${PRESET_COUPONS[code].label}` });
      return;
    }

    // Try server coupon verification
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

  // Financial Calculations
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((cartTotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  const afterDiscountTotal = Math.max(cartTotal - discountAmount, 0);
  const shippingCharge = afterDiscountTotal >= SHIPPING_FREE_THRESHOLD || afterDiscountTotal === 0 ? 0 : SHIPPING_FEE;
  const finalPayable = afterDiscountTotal + shippingCharge;

  // Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Please add products before placing an order.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.zipCode) {
      setOrderError('Please complete all mandatory delivery fields.');
      return;
    }

    setSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
      let razorpayOrderId = null;
      let razorpayPaymentId = null;

      // Online payment handling
      if (paymentMethod === 'UPI / QR Pay' || paymentMethod === 'Online') {
        try {
          const payRes = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalPayable })
          });
          if (payRes.ok) {
            const payData = await payRes.json();
            razorpayOrderId = payData.orderId || payData.id;
          }
        } catch (e) {
          console.warn('Razorpay order creation fallback:', e);
        }
      }

      const orderPayload = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim() || user?.email || 'patron@venthulir.com',
        phone: formData.phone.trim(),
        deliveryAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim()
        },
        items: cartItems.map(item => ({
          product: item.productId || item.product,
          name: item.name,
          variant: item.variant?.label || null,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image
        })),
        originalAmount: cartTotal,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shippingCharge,
        totalAmount: finalPayable,
        paymentMethod,
        razorpayOrderId,
        razorpayPaymentId
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok) {
        setPlacedOrder(data.order || { _id: 'VEN-' + Date.now(), totalAmount: finalPayable });
        clearCart();
      } else {
        setOrderError(data.error || data.msg || 'Unable to place order. Please verify details.');
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setOrderError('Network connection issue. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ──
  if (placedOrder) {
    return (
      <div className="checkout-page-root">
        <div className="checkout-success-container">
          <div className="success-badge-crest">
            <PackageCheck size={40} />
          </div>
          <h1 className="success-order-title">Order Placed Successfully!</h1>
          <p className="success-order-msg">
            Thank you for choosing Venthulir Organic Harvest. Your batch is being freshly packed and prepared for express farm dispatch.
          </p>

          <div className="success-order-meta-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#557262' }}>Order Reference:</span>
              <strong style={{ color: '#0f3d2a' }}>#{placedOrder._id?.slice(-8).toUpperCase() || placedOrder._id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#557262' }}>Payment Method:</span>
              <strong style={{ color: '#0f3d2a' }}>{paymentMethod}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#557262' }}>Total Amount:</span>
              <strong style={{ color: '#b45309', fontSize: '1rem' }}>₹{placedOrder.totalAmount || finalPayable}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#557262' }}>Delivery Address:</span>
              <span style={{ color: '#0f3d2a', textAlign: 'right', maxWidth: '240px' }}>
                {formData.address}, {formData.city} - {formData.zipCode}
              </span>
            </div>
          </div>

          <div className="success-actions-row">
            <Link href="/profile" className="btn-confirm-place-order" style={{ textDecoration: 'none' }}>
              <span>View in My Orders</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/products" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 22px',
                borderRadius: '9999px',
                border: '1.5px solid #dce8e0',
                color: '#0f3d2a',
                fontWeight: 750,
                textDecoration: 'none',
                background: '#ffffff'
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART SCREEN ──
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-root">
        <div className="checkout-success-container" style={{ padding: '60px 24px' }}>
          <div className="success-badge-crest" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
            <ShoppingBag size={36} />
          </div>
          <h2 className="success-order-title" style={{ fontSize: '1.8rem' }}>Your Basket is Empty</h2>
          <p className="success-order-msg">
            You haven't selected any organic products yet. Explore our cold-pressed oils, single-origin spices, and traditional grains.
          </p>
          <Link href="/products" className="btn-confirm-place-order" style={{ display: 'inline-flex', maxWidth: '280px', margin: '0 auto', textDecoration: 'none' }}>
            <span>Explore All Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-root">
      <div className="checkout-page-container">
        
        {/* Top Header */}
        <div className="checkout-top-header">
          <h1 className="checkout-top-title">Express Checkout</h1>
          <p className="checkout-top-subtext">
            100% Secure Checkout • Authentic Farm Origin Guaranteed
          </p>
        </div>

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handlePlaceOrder} className="checkout-layout-grid">
          
          {/* ── LEFT COLUMN: DELIVERY & PAYMENT ── */}
          <div className="checkout-left-col">
            
            {/* Account Status Prompt */}
            {!isAuthenticated && (
              <div className="checkout-auth-alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#d98e1e" />
                  <span>Have an account? Sign in for 1-click address autofill.</span>
                </div>
                <Link href="/login?redirect=/checkout">Sign In</Link>
              </div>
            )}

            {/* 1. Delivery Details */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-icon-wrap">
                  <MapPin size={20} />
                </div>
                <h2 className="checkout-card-title">1. Shipping & Contact Details</h2>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="chk-name">Recipient Full Name *</label>
                <input
                  id="chk-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Ramesh Kannan"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="checkout-2col">
                <div className="checkout-form-group">
                  <label htmlFor="chk-phone">Mobile Phone Number *</label>
                  <input
                    id="chk-phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="chk-email">Email Address (for order updates)</label>
                  <input
                    id="chk-email"
                    name="email"
                    type="email"
                    placeholder="ramesh@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="chk-address">Street Address / Door No / Landmark *</label>
                <input
                  id="chk-address"
                  name="address"
                  type="text"
                  placeholder="Door No, Street Name, Area"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="checkout-3col">
                <div className="checkout-form-group">
                  <label htmlFor="chk-city">City / District *</label>
                  <input
                    id="chk-city"
                    name="city"
                    type="text"
                    placeholder="e.g. Chennai"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="chk-state">State *</label>
                  <input
                    id="chk-state"
                    name="state"
                    type="text"
                    placeholder="Tamil Nadu"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="chk-zip">Pincode *</label>
                  <input
                    id="chk-zip"
                    name="zipCode"
                    type="text"
                    placeholder="600001"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-icon-wrap">
                  <CreditCard size={20} />
                </div>
                <h2 className="checkout-card-title">2. Select Payment Method</h2>
              </div>

              <div className="payment-methods-grid">
                {/* Cash on Delivery */}
                <div 
                  className={`payment-method-card ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                >
                  <div className="payment-method-title">
                    <Banknote size={18} color="#166534" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="payment-method-desc">Pay with cash or UPI upon package handover.</p>
                </div>

                {/* Instant UPI / QR */}
                <div 
                  className={`payment-method-card ${paymentMethod === 'UPI / QR Pay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('UPI / QR Pay')}
                >
                  <div className="payment-method-title">
                    <QrCode size={18} color="#b45309" />
                    <span>UPI / QR Code</span>
                  </div>
                  <p className="payment-method-desc">GPay, PhonePe, Paytm, or BHIM scan on delivery.</p>
                </div>
              </div>

              {/* Mobile Bottom Submit Button */}
              <div className="checkout-mobile-submit-wrapper">
                {orderError && (
                  <div style={{
                    fontSize: '0.84rem',
                    fontWeight: 650,
                    color: '#b91c1c',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}>
                    {orderError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-confirm-place-order"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>Securing Your Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order • ₹{finalPayable}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.76rem', color: '#557262', marginTop: '12px' }}>
                  <ShieldCheck size={14} color="#166534" />
                  <span>Zero Risk • Authenticity Guaranteed</span>
                </div>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: SUMMARY & CONFIRMATION ── */}
          <div className="checkout-right-col">
            <div className="checkout-card order-summary-card">
              <div className="checkout-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="checkout-card-icon-wrap">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="checkout-card-title">Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} Items)</h2>
                </div>
                <Link 
                  href="/products" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    color: '#0f3d2a',
                    background: '#edf6f1',
                    border: '1px solid #b8dfc8',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus size={14} />
                  <span>Add Products</span>
                </Link>
              </div>

              {/* Items Mini List */}
              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div key={item.key} className="summary-single-item">
                    <div className="summary-item-left">
                      <div className="summary-item-thumb">
                        <img 
                          src={item.image || getFallbackImage(item.name, item.category)} 
                          alt={item.name} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackImage(item.name, item.category);
                          }}
                        />
                      </div>
                      <div className="summary-item-details">
                        <h5>{item.name}</h5>
                        <span>Qty: {item.quantity} {item.variant ? `• ${item.variant.label}` : ''}</span>
                      </div>
                    </div>
                    <div className="summary-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}

                <div style={{ paddingTop: '8px', marginTop: '8px' }}>
                  <Link 
                    href="/products" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      color: '#0f3d2a',
                      background: '#f0f9f4',
                      border: '1.5px dashed #86efac',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Add More Items to Your Order</span>
                  </Link>
                </div>
              </div>

              {/* Coupon Box */}
              <div className="checkout-coupon-wrap">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. VENTHULIR)"
                  className="checkout-coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn-checkout-coupon"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>

              {couponMsg.text && (
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  color: couponMsg.type === 'success' ? '#166534' : '#b91c1c',
                  marginBottom: '12px'
                }}>
                  {couponMsg.text}
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="checkout-pricing-list">
                <div className="pricing-row">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="pricing-row discount-row">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="pricing-row">
                  <span>Delivery Charges</span>
                  <span>{shippingCharge === 0 ? <strong style={{ color: '#166534' }}>FREE</strong> : `₹${shippingCharge}`}</span>
                </div>

                <div className="pricing-row grand-row">
                  <span>Total Payable</span>
                  <span>₹{finalPayable}</span>
                </div>
              </div>

              {/* Error Box */}
              {orderError && (
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 650,
                  color: '#b91c1c',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  textAlign: 'center'
                }}>
                  {orderError}
                </div>
              )}

              {/* Confirm & Place Order CTA */}
              <button
                type="submit"
                className="btn-confirm-place-order"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Securing Your Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order • ₹{finalPayable}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.76rem', color: '#557262', marginTop: '14px' }}>
                <ShieldCheck size={14} color="#166534" />
                <span>Zero Risk • Authenticity Guaranteed</span>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="checkout-page-root">
        <div className="checkout-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#0f3d2a', fontWeight: 650 }}>Loading Venthulir Checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
