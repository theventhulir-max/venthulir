'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  Gift, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Edit3,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Loader2,
  Tag,
  Headphones,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Edit2,
  Lock,
  HelpCircle,
  Leaf,
  XCircle,
  ShoppingBag,
  Check,
  ClipboardCheck,
  Box,
  Home,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import TaxInvoice from '@/components/TaxInvoice';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'profile' | 'coupons' | 'support'
  const [activeOrderTab, setActiveOrderTab] = useState('current'); // 'current' | 'past' | 'cancelled'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Fetch real-time user orders
  const fetchOrders = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) {
      setOrdersLoading(false);
      return;
    }
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timer = setTimeout(() => {
      if (isMounted) setOrdersLoading(false);
    }, 3000);

    if (isAuthenticated) {
      fetchOrders().finally(() => {
        if (isMounted) clearTimeout(timer);
      });
    } else if (!authLoading) {
      setOrdersLoading(false);
      clearTimeout(timer);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAuthenticated, authLoading]);

  // Saved Address State & Handlers
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: user?.deliveryAddress?.address || '',
    city: user?.deliveryAddress?.city || '',
    state: user?.deliveryAddress?.state || 'Tamil Nadu',
    zipCode: user?.deliveryAddress?.zipCode || '',
    phone: user?.phone || ''
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState(null);

  // Profile Account Details State & Handlers
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setAddressForm({
        address: user?.deliveryAddress?.address || '',
        city: user?.deliveryAddress?.city || '',
        state: user?.deliveryAddress?.state || 'Tamil Nadu',
        zipCode: user?.deliveryAddress?.zipCode || '',
        phone: user?.phone || ''
      });
      setProfileForm({
        name: user?.name || '',
        phone: user?.phone || ''
      });
    }
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;

    try {
      if (token) {
        await fetch('/api/auth/address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            address: addressForm.address,
            city: addressForm.city,
            state: addressForm.state,
            zipCode: addressForm.zipCode
          })
        });

        if (addressForm.phone && addressForm.phone !== user?.phone) {
          await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ phone: addressForm.phone })
          });
        }
      }

      updateUser({
        deliveryAddress: {
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode
        },
        phone: addressForm.phone || user?.phone
      });

      setAddressMessage({ type: 'success', text: 'Address updated successfully!' });
      setIsEditingAddress(false);
    } catch (err) {
      console.error('Error updating address:', err);
      setAddressMessage({ type: 'error', text: 'Failed to save address.' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;

    try {
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: profileForm.name,
            phone: profileForm.phone
          })
        });
      }

      updateUser({
        name: profileForm.name,
        phone: profileForm.phone
      });

      setProfileMessage({ type: 'success', text: 'Account details updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileMessage({ type: 'error', text: 'Failed to save account details.' });
    } finally {
      setProfileSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Loader2 size={32} className="lounge-spin-icon" color="#114529" />
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <h2>Sign In Required</h2>
        <Link href="/login" style={{marginTop: '16px', padding: '10px 20px', background: '#114529', color: '#fff', borderRadius: '8px', textDecoration: 'none'}}>Sign In</Link>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const pastOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
  
  const filteredOrders = orders.filter(o => {
    if (activeOrderTab === 'current') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (activeOrderTab === 'past') return o.status === 'Delivered';
    if (activeOrderTab === 'cancelled') return o.status === 'Cancelled';
    return true;
  });
  return (
    <div className="lounge-page-root">
      
      {/* ── 1. ACCOUNT BANNER ── */}
      <div className="account-banner">
        <div className="account-banner-overlay" />
        
        <div className="banner-content-left">
          <div className="banner-avatar-wrapper">
            <div className="banner-avatar">
              {user?.name?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="banner-avatar-edit">
              <Edit2 size={12} />
            </div>
          </div>
          
          <div className="banner-user-info">
            <h1 className="banner-user-name">{user?.name || 'Gokulraj N'}</h1>
            <p className="banner-customer-since">Customer Since {new Date().getFullYear()}</p>
            
            <div className="banner-contact-row">
              <div className="banner-contact-item">
                <Mail size={16} color="#0d3b23" strokeWidth={2.2} />
                {user?.email || 'gokulrajofficial123@gmail.com'}
              </div>
              <div className="banner-contact-item">
                <Phone size={16} color="#0d3b23" strokeWidth={2.2} />
                {user?.phone || '+91 87784 76414'}
              </div>
            </div>
            
            <div className="banner-tagline">
              Naturally better choices for a healthier you <Leaf size={16} color="#2e7d32" strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN LAYOUT ── */}
      <div className="profile-layout">
        
        {/* Left Sidebar */}
        <aside>
          <div className="sidebar-nav-menu">
            <button className={`sidebar-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-indigo"><Package size={17} /></span>
                My Orders
              </div>
              <ChevronRight size={16} className="nav-btn-chevron" />
            </button>
            <button className={`sidebar-nav-btn ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-teal"><MapPin size={17} /></span>
                Saved Addresses
              </div>
              <ChevronRight size={16} className="nav-btn-chevron" />
            </button>
            <button className={`sidebar-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-amber"><User size={17} /></span>
                Account Details
              </div>
              <ChevronRight size={16} className="nav-btn-chevron" />
            </button>
            <button className={`sidebar-nav-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-purple"><Tag size={17} /></span>
                My Vouchers
              </div>
              <span className="nav-btn-badge">3</span>
            </button>
            <button className={`sidebar-nav-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-blue"><Headphones size={17} /></span>
                Help & Support
              </div>
              <ChevronRight size={16} className="nav-btn-chevron" />
            </button>
            <button className={`sidebar-nav-btn`} onClick={() => { logout(); router.push('/home'); }}>
              <div className="nav-btn-left">
                <span className="nav-icon-badge nav-rose"><LogOut size={17} /></span>
                Sign Out
              </div>
              <ChevronRight size={16} className="nav-btn-chevron" />
            </button>
          </div>

          <div className="whatsapp-support-box">
            <div className="wa-box-content">
              <span className="wa-box-title">Direct Farm WhatsApp</span>
              <span className="wa-box-desc">Need urgent delivery updates<br/>or bulk orders?</span>
            </div>
            <a href="https://wa.me/918778476414" target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
              <div className="wa-box-icon">
                <ArrowRight size={14} />
              </div>
            </a>
          </div>
        </aside>

        {/* Center Workspace */}
        <main>
          <div className="main-workspace-card animate-fade-in">
            {activeTab === 'orders' && (
              <>
                <div className="workspace-header">
                  <div className="workspace-header-title">
                    <Leaf size={24} color="#114529" />
                    Your Orders &amp; Tracking
                  </div>
                  <button className="btn-refresh" onClick={fetchOrders}>
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>
                <p className="workspace-subtext">Track your fresh, natural and healthy products from our farm to your doorstep.</p>

                <div className="orders-tabs-row">
                  <button className={`order-tab-btn tab-current ${activeOrderTab === 'current' ? 'active' : ''}`} onClick={() => setActiveOrderTab('current')}>
                    <Calendar size={14} />
                    Current Orders
                    <span className="tab-count-badge">{activeOrdersCount}</span>
                  </button>
                  <button className={`order-tab-btn tab-past ${activeOrderTab === 'past' ? 'active' : ''}`} onClick={() => setActiveOrderTab('past')}>
                    <Package size={14} />
                    Past Orders
                    <span className="tab-count-badge">{pastOrdersCount}</span>
                  </button>
                  <button className={`order-tab-btn tab-cancelled ${activeOrderTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveOrderTab('cancelled')}>
                    <XCircle size={14} />
                    Cancelled
                    <span className="tab-count-badge">{cancelledOrdersCount}</span>
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="empty-state-wrapper">
                    <Loader2 size={32} className="lounge-spin-icon" color="#114529" style={{marginBottom: '16px'}} />
                    <p>Loading your orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-state-wrapper animate-fade-in">
                    <div className="empty-state-icon">
                      <Package size={72} color="#0f3d2a" strokeWidth={1} style={{fill: '#dcfce7'}} />
                    </div>
                    <h3 className="empty-state-title">No Orders Found</h3>
                    <p className="empty-state-desc">Looks like you haven&apos;t placed any {activeOrderTab} orders yet.<br/>Explore our fresh and natural products!</p>
                    <Link href="/products" className="btn-start-shopping">
                      <ShoppingBag size={18} />
                      Start Shopping <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="orders-grid animate-fade-in">
                    {filteredOrders.map(order => {
                      const backendStatus = (order.status || 'pending').toLowerCase();
                      const isCancelled = backendStatus === 'cancelled';
                      
                      const orderSteps = [
                        { key: 'pending', label: 'Placed', icon: ClipboardCheck },
                        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
                        { key: 'shipped', label: 'Shipped', icon: Truck },
                        { key: 'delivered', label: 'Delivered', icon: Home }
                      ];

                      // Map backend statuses to the 4 milestone steps
                      let currentStepIndex = 0;
                      if (backendStatus === 'confirmed' || backendStatus === 'processing') currentStepIndex = 1;
                      else if (backendStatus === 'shipped' || backendStatus === 'out_for_delivery') currentStepIndex = 2;
                      else if (backendStatus === 'delivered') currentStepIndex = 3;

                      // Derive user-friendly current status message
                      let statusMessage = 'We have received your order.';
                      if (isCancelled) statusMessage = 'This order has been cancelled.';
                      else if (backendStatus === 'confirmed') statusMessage = 'Your order is confirmed and will be processed soon.';
                      else if (backendStatus === 'processing') statusMessage = 'We are packing your items with care.';
                      else if (backendStatus === 'shipped') statusMessage = 'Your order has been shipped and is on the way.';
                      else if (backendStatus === 'out_for_delivery') statusMessage = 'Your order is out for delivery and will reach you today.';
                      else if (backendStatus === 'delivered') statusMessage = 'Your order was successfully delivered. Enjoy!';

                      return (
                        <div className="order-card tracking-card" key={order._id}>
                          {/* Top Header Section */}
                          <div className="tracking-card-header">
                            <div className="tracking-header-left">
                              <span className="tracking-order-id">#{order._id.substring(0, 8)}</span>
                              <span className="tracking-order-date">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`tracking-status-badge ${backendStatus}`}>
                                {backendStatus === 'out_for_delivery' ? 'Out for Delivery' : order.status || 'Pending'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#0f3d2a',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                title="View & Print Official Tax Invoice"
                              >
                                <FileText size={12} color="#0f3d2a" />
                                <span>Tax Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* Product Summary */}
                          <div className="tracking-product-summary">
                            <div className="tracking-product-name">
                              {order.items?.length > 0 ? (
                                <span>
                                  <strong>{order.items[0].name}</strong>
                                  {order.items.length > 1 && <span className="more-items"> + {order.items.length - 1} more items</span>}
                                </span>
                              ) : (
                                <span>No items found</span>
                              )}
                            </div>
                            <div className="tracking-total-amount">
                              ₹{order.totalAmount}
                            </div>
                          </div>

                          {/* Stepper / Progress Tracker (Hide if cancelled) */}
                          {!isCancelled && (
                            <div className="tracking-stepper-wrapper">
                              {orderSteps.map((step, index) => {
                                const isDelivered = backendStatus === 'delivered';
                                const isCompleted = isDelivered || index <= currentStepIndex;
                                const isCurrent = !isDelivered && index === currentStepIndex;
                                const isConnectorActive = isDelivered || index < currentStepIndex;
                                const StepIcon = step.icon;
                                
                                return (
                                  <div className={`tracking-step step-${step.key} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isDelivered ? 'delivered-all' : ''}`} key={step.key}>
                                    <div className="step-icon-container">
                                      <StepIcon size={16} strokeWidth={isCompleted ? 2.5 : 2} />
                                    </div>
                                    <span className="step-label">{step.label}</span>
                                    {index < orderSteps.length - 1 && (
                                      <div className={`step-connector ${isConnectorActive ? 'active' : ''}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Current Status Message */}
                          <div className="tracking-current-status-box">
                            <div className="status-box-content">
                              <Package size={20} color={isCancelled ? '#ef4444' : '#0f3d2a'} />
                              <div className="status-text-stack">
                                <strong>{isCancelled ? 'Order Cancelled' : orderSteps[currentStepIndex]?.label || 'Pending'}</strong>
                                <p>{statusMessage}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'address' && (
              <div className="tab-content-panel animate-fade-in">
                <div className="tab-header">
                  <h3>Saved Addresses</h3>
                  {!isEditingAddress && (
                    <button className="btn-add-new" onClick={() => setIsEditingAddress(true)}>
                      + {user?.deliveryAddress?.address ? 'Edit Address' : 'Add New Address'}
                    </button>
                  )}
                </div>

                {addressMessage && (
                  <div style={{
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '0.85rem',
                    background: addressMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: addressMessage.type === 'success' ? '#14532d' : '#991b1b'
                  }}>
                    {addressMessage.text}
                  </div>
                )}

                {isEditingAddress ? (
                  <form className="account-details-form" onSubmit={handleSaveAddress}>
                    <div className="form-group">
                      <label>Street Address / Door No. / Area *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. 12, Main Road, Anna Nagar" 
                        value={addressForm.address} 
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} 
                        className="form-input" 
                      />
                    </div>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label>City / Town *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Coimbatore" 
                          value={addressForm.city} 
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label>State *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Tamil Nadu" 
                          value={addressForm.state} 
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label>Pincode / ZIP *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="641001" 
                          value={addressForm.zipCode} 
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label>Contact Phone Number *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="9876543210" 
                          value={addressForm.phone} 
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" disabled={addressSaving} className="btn-save-changes">
                        {addressSaving ? 'Saving Address...' : 'Save Address'}
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => setIsEditingAddress(false)} style={{
                        padding: '10px 20px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : user?.deliveryAddress?.address ? (
                  <div className="address-grid">
                    <div className="address-card default-address">
                      <div className="address-card-header">
                        <span className="address-type-badge">Home (Default)</span>
                        <div className="address-actions">
                          <button className="icon-btn" onClick={() => setIsEditingAddress(true)} title="Edit Address">
                            <Edit3 size={16}/>
                          </button>
                        </div>
                      </div>
                      <strong>{user?.name || 'Customer Name'}</strong>
                      <p style={{ marginTop: '8px', lineHeight: '1.5' }}>
                        {user.deliveryAddress.address}
                        <br/>
                        {[user.deliveryAddress.city, user.deliveryAddress.state].filter(Boolean).join(', ')}
                        {user.deliveryAddress.zipCode ? ` - ${user.deliveryAddress.zipCode}` : ''}
                      </p>
                      <span className="address-phone" style={{ display: 'block', marginTop: '8px', fontWeight: '600', color: '#0f3d2a' }}>
                        Ph: {user?.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#fafafa' }}>
                    <MapPin size={40} color="#64748b" style={{ marginBottom: '12px' }} />
                    <h4 style={{ margin: '0 0 6px', color: '#1e293b' }}>No Saved Address Found</h4>
                    <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.88rem' }}>Please enter your delivery address so we can ship your harvest faster.</p>
                    <button className="btn-add-new" onClick={() => setIsEditingAddress(true)}>+ Add Delivery Address</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="tab-content-panel animate-fade-in">
                <div className="tab-header">
                  <h3>Account Details</h3>
                </div>

                {profileMessage && (
                  <div style={{
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '0.85rem',
                    background: profileMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: profileMessage.type === 'success' ? '#14532d' : '#991b1b'
                  }}>
                    {profileMessage.text}
                  </div>
                )}

                <form className="account-details-form" onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || ''} readOnly className="form-input readonly-input" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                      className="form-input" 
                    />
                  </div>
                  <button type="submit" disabled={profileSaving} className="btn-save-changes">
                    {profileSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {(activeTab === 'vouchers' || activeTab === 'coupons') && (
              <div className="tab-content-panel animate-fade-in">
                <div className="tab-header">
                  <h3>My Vouchers</h3>
                </div>
                <div className="vouchers-grid">
                  <div className="voucher-card">
                    <div className="voucher-left">
                      <span className="voucher-code">WELCOME20</span>
                      <span className="voucher-desc">Flat 20% off on your next order</span>
                    </div>
                    <button className="btn-copy-code">Copy</button>
                  </div>
                  <div className="voucher-card">
                    <div className="voucher-left">
                      <span className="voucher-code">FREESHIP</span>
                      <span className="voucher-desc">Free shipping on orders above ₹999</span>
                    </div>
                    <button className="btn-copy-code">Copy</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="tab-content-panel animate-fade-in">
                <div className="tab-header">
                  <h3>Help & Support</h3>
                </div>
                <div className="support-content">
                  <p>Need help with your order or have a question about our organic products? We are always here to assist you.</p>
                  <div className="support-contact-cards">
                    <div className="contact-card">
                      <HelpCircle size={24} color="#114529" />
                      <strong>Email Support</strong>
                      <span>support@venthulir.com</span>
                    </div>
                    <div className="contact-card whatsapp-card">
                      <CheckCircle2 size={24} color="#25D366" />
                      <strong>WhatsApp Support</strong>
                      <span>+91 87784 76414</span>
                      <a href="https://wa.me/918778476414" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <button className="btn-whatsapp-chat">Chat on WhatsApp</button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

      </div>

      {/* Official Tax Invoice Modal */}
      {invoiceOrder && (
        <TaxInvoice
          order={invoiceOrder}
          isOpen={Boolean(invoiceOrder)}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
