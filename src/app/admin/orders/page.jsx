'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Printer,
  DollarSign,
  Download,
  Loader2,
  MessageCircle,
  Volume2,
  Phone,
  LayoutGrid,
  List
} from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';
import { getWhatsAppOrderUrl } from '@/lib/whatsapp';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'cards' | 'table'
  const initialLoadRef = useRef(true);
  const prevOrdersCountRef = useRef(0);

  const playNotificationChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio context may be restricted before first interaction
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/orders', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        if (Array.isArray(data)) {
          if (!initialLoadRef.current && data.length > prevOrdersCountRef.current) {
            playNotificationChime();
          }
          prevOrdersCountRef.current = data.length;
          initialLoadRef.current = false;
          setOrders(data);
        }
      }
    } catch (err) {
      console.warn('Orders sync will retry in background');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus, isCancel, extras = {}) => {
    const token = localStorage.getItem('venthulir_token');
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: newStatus,
        action: isCancel ? 'cancel' : undefined,
        trackingNumber: extras?.trackingNumber,
        courierPartner: extras?.courierPartner
      })
    });

    if (res.ok) {
      const data = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? (data.order || { ...o, status: newStatus }) : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order || { ...selectedOrder, status: newStatus });
      }
    }
  };

  // Status Counts
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    confirmed: orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled' || o.status === 'Returned').length,
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const st = o.status || 'Pending';

    // Tab Filter
    if (activeTab === 'Pending' && st !== 'Pending') return false;
    if (activeTab === 'Confirmed' && st !== 'Confirmed' && st !== 'Processing') return false;
    if (activeTab === 'Shipped' && st !== 'Shipped') return false;
    if (activeTab === 'Delivered' && st !== 'Delivered') return false;
    if (activeTab === 'Cancelled' && st !== 'Cancelled' && st !== 'Returned') return false;

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const idMatch = (o._id || '').toLowerCase().includes(term);
      const nameMatch = (o.customerName || '').toLowerCase().includes(term);
      const emailMatch = (o.customerEmail || '').toLowerCase().includes(term);
      const phoneMatch = (o.phone || '').toLowerCase().includes(term);
      if (!idMatch && !nameMatch && !emailMatch && !phoneMatch) return false;
    }

    // Date Filter
    if (startDate) {
      const ordDate = new Date(o.createdAt).getTime();
      const start = new Date(startDate).getTime();
      if (ordDate < start) return false;
    }
    if (endDate) {
      const ordDate = new Date(o.createdAt).getTime();
      const end = new Date(endDate).getTime() + 86400000;
      if (ordDate > end) return false;
    }

    return true;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Delivered': return <span className="admin-badge success"><CheckCircle2 size={12} /> Delivered</span>;
      case 'Shipped': return <span className="admin-badge info"><Truck size={12} /> Shipped</span>;
      case 'Confirmed':
      case 'Processing': return <span className="admin-badge info"><Package size={12} /> Confirmed</span>;
      case 'Cancelled':
      case 'Returned': return <span className="admin-badge danger"><XCircle size={12} /> Cancelled</span>;
      default: return <span className="admin-badge warning"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Customer Orders & Fulfillment
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Live orders stream, status progression, shipping details, and invoice printing
          </p>
        </div>

        <button
          className="admin-btn admin-btn-secondary"
          onClick={fetchOrders}
          title="Refresh Inbound Orders"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div className="admin-tabs-bar" style={{ margin: 0, paddingBottom: '14px' }}>
          {[
            { key: 'All', label: 'All Orders', count: counts.all },
            { key: 'Pending', label: 'Pending', count: counts.pending },
            { key: 'Confirmed', label: 'Confirmed', count: counts.confirmed },
            { key: 'Shipped', label: 'Shipped', count: counts.shipped },
            { key: 'Delivered', label: 'Delivered', count: counts.delivered },
            { key: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} <span className="admin-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search and Date Range Filter */}
        <div className="admin-filters-bar">
          <div className="admin-filters-search">
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
            <input
              type="text"
              placeholder="Search by Order ID, customer, phone..."
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filters-dates">
            <div className="admin-date-input-group">
              <span className="admin-date-label">From:</span>
              <input
                type="date"
                className="admin-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="admin-date-input-group">
              <span className="admin-date-label">To:</span>
              <input
                type="date"
                className="admin-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || startDate || endDate) && (
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ padding: '8px 12px' }}
              onClick={() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders View Card */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header with View Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#faf8f5',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#15221b' }}>
            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>

        {/* Orders Cards Feed */}
        <div
          className="admin-orders-cards-feed"
          style={{ padding: '16px' }}
        >
          {loading && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
              <div>Loading customer orders...</div>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              No orders found matching the filter criteria.
            </div>
          )}

          {!loading && filteredOrders.map((ord) => {
            const itemCount = (ord.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
            const orderDate = new Date(ord.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div className="admin-order-card" key={ord._id}>
                <div className="admin-order-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code className="admin-order-card-id">
                      #{ord._id.slice(-6).toUpperCase()}
                    </code>
                    <span className="admin-badge gold" style={{ fontSize: '10.5px' }}>
                      {ord.paymentMethod || 'COD'}
                    </span>
                  </div>
                  <div>{getStatusBadge(ord.status || 'Pending')}</div>
                </div>

                <div className="admin-order-card-customer">
                  <div className="admin-order-card-customer-name">
                    {ord.customerName || 'Customer'}
                  </div>
                  {ord.phone ? (
                    <a href={`tel:${ord.phone}`} className="admin-order-card-phone">
                      <Phone size={12} />
                      <span>{ord.phone}</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{ord.customerEmail || 'No phone'}</span>
                  )}
                </div>

                <div className="admin-order-card-items">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span className="admin-order-card-items-count">
                      <Package size={12} />
                      <span>{itemCount} Items</span>
                    </span>
                    <span className="admin-order-card-date">
                      <Clock size={11} />
                      <span>{orderDate}</span>
                    </span>
                  </div>
                  <div className="admin-order-card-items-names">
                    {(ord.items || []).map(i => `${i.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`).join(', ')}
                  </div>
                </div>

                <div className="admin-order-card-footer">
                  <div className="admin-order-card-total">
                    <span className="admin-order-card-total-mode">Total Payable</span>
                    <span className="admin-order-card-total-val">₹{ord.totalAmount}</span>
                    {ord.discountAmount > 0 && (
                      <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600 }}>Save ₹{ord.discountAmount}</span>
                    )}
                  </div>

                  <div className="admin-order-card-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        border: '1px solid #16a34a',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '7px 12px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = getWhatsAppOrderUrl(ord, ord.status);
                        window.open(url, '_blank');
                      }}
                      title={`Send WhatsApp notification (${ord.status || 'Confirmed'})`}
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '7px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onClick={() => setSelectedOrder(ord)}
                    >
                      <Eye size={14} />
                      <span>View Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
