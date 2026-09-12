'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/orders', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        setOrders(Array.isArray(data) ? data : []);
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

  const handleStatusUpdate = async (orderId, newStatus, isCancel) => {
    const token = localStorage.getItem('venthulir_token');
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus, action: isCancel ? 'cancel' : undefined })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, email, phone..."
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>From:</span>
            <input
              type="date"
              className="admin-input"
              style={{ width: '140px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>To:</span>
            <input
              type="date"
              className="admin-input"
              style={{ width: '140px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(searchTerm || startDate || endDate) && (
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
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

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Details</th>
                <th>Order Date</th>
                <th>Items</th>
                <th>Payment Mode</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => {
                const itemCount = (ord.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
                const orderDate = new Date(ord.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={ord._id}>
                    <td>
                      <code style={{ fontSize: '12px', fontWeight: 700, color: '#0b3d2e', background: '#faf8f5', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e6e1d6' }}>
                        #{ord._id.slice(-6).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#15221b' }}>{ord.customerName || 'Customer'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{ord.phone || ord.customerEmail}</div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#4b5d54' }}>
                      {orderDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{itemCount} Items</span>
                      <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(ord.items || []).map(i => i.name).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge gold" style={{ fontSize: '11px' }}>
                        {ord.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14.5px', color: '#0b3d2e' }}>₹{ord.totalAmount}</strong>
                      {ord.discountAmount > 0 && (
                        <div style={{ fontSize: '10.5px', color: '#15803d' }}>Save ₹{ord.discountAmount}</div>
                      )}
                    </td>
                    <td>{getStatusBadge(ord.status || 'Pending')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <Eye size={13} /> View Order
                      </button>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
                    <span style={{ color: '#64748b' }}>Loading customer orders...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No orders found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
