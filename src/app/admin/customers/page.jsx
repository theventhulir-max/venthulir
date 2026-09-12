'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Eye,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('customer'); // 'customer' | 'admin' | 'all'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCustomerData = async (role = roleFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const [userRes, orderRes] = await Promise.all([
        fetch(`/api/admin/users?role=${role}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (userRes.ok && orderRes.ok) {
        const uData = await userRes.json();
        const oData = await orderRes.json();
        setCustomers(Array.isArray(uData) ? uData : []);
        setOrders(Array.isArray(oData) ? oData : []);
      }
    } catch (err) {
      console.error('Failed to load customer list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData(roleFilter);
  }, [roleFilter]);

  // Compute stats per customer
  const customerAnalytics = customers.map((c) => {
    const userOrders = orders.filter(
      o => (o.customerEmail || '').toLowerCase() === (c.email || '').toLowerCase()
    );

    const totalSpent = userOrders
      .filter(o => o.status !== 'Cancelled' && o.status !== 'Returned')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const lastOrder = userOrders.length > 0 ? userOrders[0] : null;

    return {
      ...c,
      orderCount: userOrders.length,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      orders: userOrders
    };
  });

  const filtered = customerAnalytics.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Registered Customers Directory
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Customer profiles, transaction histories, and lifetime value analytics
          </p>
        </div>

        <button
          className="admin-btn admin-btn-secondary"
          onClick={() => fetchCustomerData(roleFilter)}
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="admin-card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Role Toggle Pills */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f3', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className={`admin-btn admin-btn-sm ${roleFilter === 'customer' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 700 }}
            onClick={() => setRoleFilter('customer')}
          >
            👥 Customers Only
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-sm ${roleFilter === 'admin' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 700 }}
            onClick={() => setRoleFilter('admin')}
          >
            🛡️ Admins & Staff
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-sm ${roleFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 700 }}
            onClick={() => setRoleFilter('all')}
          >
            All Accounts
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="admin-input"
            style={{ paddingLeft: '34px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Registered On</th>
                <th>Orders Placed</th>
                <th>Lifetime Spend</th>
                <th>Last Order</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #18634d, #0b3d2e)', color: '#d4af37', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                        {(c.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#15221b' }}>{c.name || 'Verified Customer'}</div>
                        {c.isAdmin && <span className="admin-badge gold" style={{ fontSize: '10px' }}>Admin</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: '#15221b' }}>{c.email}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{c.phone || 'No phone'}</div>
                  </td>
                  <td style={{ fontSize: '12.5px', color: '#4b5d54' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <span className="admin-badge gold" style={{ fontSize: '12px' }}>
                      {c.orderCount} Orders
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '14px', color: '#0b3d2e' }}>
                      ₹{c.totalSpent.toLocaleString()}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No purchases yet'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <Eye size={13} /> Order History ({c.orderCount})
                    </button>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
                    <span style={{ color: '#64748b' }}>Loading customer records...</span>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No customer accounts matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Drawer */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>CUSTOMER PROFILE & PURCHASES</div>
                <h3 style={{ margin: 0 }}>{selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#faf8f5', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e6e1d6' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Email Address</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{selectedCustomer.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Phone Number</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{selectedCustomer.phone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Orders</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0b3d2e' }}>{selectedCustomer.orderCount} Orders</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Lifetime Value</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#15221b' }}>
                Purchase Order History
              </h4>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedCustomer.orders || []).map((ord) => (
                      <tr key={ord._id}>
                        <td><code>#{ord._id.slice(-6).toUpperCase()}</code></td>
                        <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td>{ord.items?.length || 0} Items</td>
                        <td><strong>₹{ord.totalAmount}</strong></td>
                        <td>
                          <span className={`admin-badge ${ord.status === 'Delivered' ? 'success' : ord.status === 'Cancelled' ? 'danger' : 'warning'}`}>
                            {ord.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          No orders placed by this customer yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={async (orderId, newStatus, isCancel) => {
            const token = localStorage.getItem('venthulir_token');
            const res = await fetch(`/api/orders/${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: newStatus, action: isCancel ? 'cancel' : undefined })
            });
            if (res.ok) fetchCustomerData();
          }}
        />
      )}
    </div>
  );
}
