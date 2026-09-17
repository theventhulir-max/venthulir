'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, Loader, CheckCircle, MapPin } from 'lucide-react';
import './CheckoutModal.css';

export default function CheckoutModal({ cartSummary, onClose, onAuthOpen }) {
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep]     = useState('form');   // form | placing | success
  const [form, setForm]     = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.deliveryAddress?.address || '',
    city:    user?.deliveryAddress?.city    || '',
    state:   user?.deliveryAddress?.state   || '',
    zipCode: user?.deliveryAddress?.zipCode || '',
  });
  const [error, setError]   = useState('');
  const [orderId, setOrderId] = useState('');

  const { grandTotal, discount, appliedCoupon, shippingFee } = cartSummary || { grandTotal: 0, discount: 0, appliedCoupon: null, shippingFee: 0 };

  const update = (k, v) => { setForm(f => ({...f, [k]: v})); setError(''); };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      if (onAuthOpen) {
        onClose();
        onAuthOpen();
      } else {
        window.location.href = '/login?redirect=/checkout';
      }
      return;
    }

    setStep('placing');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
      const cleanPhone = (form.phone || '').replace(/\D/g, '');
      const finalEmail = form.email.trim() || (cleanPhone ? `${cleanPhone}@guest.venthulir.com` : 'guest@venthulir.com');

      const res = await fetch(`/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          customerName:    form.name.trim(),
          customerEmail:   finalEmail,
          phone:           form.phone.trim(),
          deliveryAddress: { address: form.address.trim(), city: form.city.trim(), state: form.state || 'Tamil Nadu', zipCode: form.zipCode.trim() },
          items:           cartItems.map(i => ({ product: i.productId || i.product, name: i.name, variant: i.variant?.label, price: i.price, quantity: i.quantity })),
          totalAmount:     grandTotal,
          originalAmount:  grandTotal + discount,
          discountAmount:  discount,
          couponCode:      appliedCoupon?.code,
          shippingCharge:  shippingFee,
          paymentMethod:   'Cash on Delivery',
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.order?._id || data._id || 'VEN' + Date.now());
        clearCart();
        setStep('success');
      } else {
        setError(data.error || data.msg || 'Order failed. Please try again.');
        setStep('form');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('form');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={step !== 'placing' ? onClose : undefined} />
      <div className="checkout-modal">
        {step !== 'placing' && step !== 'success' && (
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        )}

        {step === 'placing' && (
          <div className="checkout-placing">
            <Loader size={40} className="spin" />
            <p>Placing your order…</p>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-success">
            <CheckCircle size={56} className="success-icon" />
            <h2>Order Placed!</h2>
            <p>Thank you for your order. We&apos;ll send updates to your mobile <strong>{form.phone}</strong>{form.email ? ` and ${form.email}` : ''}.</p>
            {orderId && <p className="order-id">Order ID: <strong>{orderId}</strong></p>}
            <button className="btn-primary" onClick={onClose} style={{ marginTop: 8 }}>Continue Shopping</button>
          </div>
        )}

        {step === 'form' && (
          <>
            <h2 className="checkout-title">Complete Your Order</h2>

            <div className="checkout-inner">
              {/* Order summary */}
              <div className="checkout-summary">
                <h3 className="checkout-section-title">Order Summary</h3>
                <div className="checkout-items">
                  {cartItems.map(item => (
                    <div key={item.key} className="checkout-item">
                      <div className="checkout-item-img">
                        {item.image ? <img src={item.image} alt={item.name} /> : <div className="checkout-img-ph" />}
                      </div>
                      <div className="checkout-item-info">
                        <p>{item.name} {item.variant ? `(${item.variant.label})` : ''}</p>
                        <span>₹{item.price} × {item.quantity}</span>
                      </div>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>
                <div className="checkout-totals">
                  {discount > 0 && <div className="co-total-row"><span>Discount ({appliedCoupon?.code})</span><span className="discount">−₹{discount}</span></div>}
                  <div className="co-total-row"><span>Shipping</span><span>{shippingFee === 0 ? <span className="free">FREE</span> : `₹${shippingFee}`}</span></div>
                  <div className="co-total-row grand"><span>Total</span><strong>₹{grandTotal}</strong></div>
                </div>
                <div className="payment-badge"><span>💵 Cash on Delivery</span></div>
              </div>

              {/* Delivery form */}
              <form className="checkout-form" onSubmit={placeOrder}>
                <h3 className="checkout-section-title"><MapPin size={16} /> Delivery Details</h3>
                <div className="form-2col">
                  <div className="co-field"><label>Full Name *</label><input required placeholder="Name" value={form.name} onChange={e=>update('name',e.target.value)} /></div>
                  <div className="co-field"><label>Phone *</label><input required placeholder="+91" value={form.phone} onChange={e=>update('phone',e.target.value)} /></div>
                </div>
                <div className="co-field"><label>Email (Optional for updates)</label><input type="email" placeholder="Email (optional)" value={form.email} onChange={e=>update('email',e.target.value)} /></div>
                <div className="co-field"><label>Street Address *</label><input required placeholder="House No., Street…" value={form.address} onChange={e=>update('address',e.target.value)} /></div>
                <div className="form-3col">
                  <div className="co-field"><label>City *</label><input required placeholder="City" value={form.city} onChange={e=>update('city',e.target.value)} /></div>
                  <div className="co-field"><label>State *</label><input required placeholder="State" value={form.state} onChange={e=>update('state',e.target.value)} /></div>
                  <div className="co-field"><label>PIN Code *</label><input required placeholder="600001" value={form.zipCode} onChange={e=>update('zipCode',e.target.value)} /></div>
                </div>
                {error && <p className="co-error">{error}</p>}
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onAuthOpen) onAuthOpen();
                      else window.location.href = '/login?redirect=/checkout';
                    }}
                    className="btn-primary co-submit"
                    style={{ background: '#b45309' }}
                  >
                    🔒 Sign In to Place Order · ₹{grandTotal}
                  </button>
                ) : (
                  <button type="submit" className="btn-primary co-submit">
                    Place Order · ₹{grandTotal}
                  </button>
                )}
                <p className="co-auth-note" style={{ color: isAuthenticated ? '#1B5E2F' : '#b45309', fontWeight: 600 }}>
                  {!isAuthenticated ? '🔒 Sign-in required to confirm order & track live delivery' : '✓ 100% Authentic Farm Harvest Direct'}
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
