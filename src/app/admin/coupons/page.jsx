'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Tag,
  Loader2
} from 'lucide-react';
import CouponFormModal from '../components/CouponFormModal';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCouponsAndProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const [couponRes, prodRes] = await Promise.all([
        fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products?admin=true&limit=100', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (couponRes.ok) {
        const cData = await couponRes.json();
        setCoupons(Array.isArray(cData) ? cData : []);
      }
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndProducts();
  }, []);

  const handleSaveCoupon = async (couponData, id) => {
    const token = localStorage.getItem('venthulir_token');
    const url = id ? `/api/coupons/${id}` : '/api/coupons';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(couponData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.msg || 'Failed to save coupon');
    }

    fetchCouponsAndProducts();
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCouponsAndProducts();
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const nextStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    const token = localStorage.getItem('venthulir_token');

    const res = await fetch(`/api/coupons/${coupon._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (res.ok) {
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, status: nextStatus } : c));
    }
  };

  const filtered = coupons.filter(c =>
    (c.couponCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Coupons & Promotional Codes
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Manage discounts, usage quotas, and promotional campaign codes
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchCouponsAndProducts}
            title="Refresh Coupons"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setEditingCoupon(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
          <input
            type="text"
            placeholder="Search coupon code (e.g. SUMMER25)..."
            className="admin-input"
            style={{ paddingLeft: '34px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Scope</th>
                <th>Usage Progress</th>
                <th>Expiration Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isExpired = new Date(c.expiryDate) < new Date();
                const isExhausted = (c.usedCount || 0) >= (c.maxUses || 25);
                const isLive = c.status === 'Active' && !isExpired && !isExhausted;

                return (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={15} color="#c59b27" />
                        <code style={{ fontSize: '13px', fontWeight: 800, color: '#0b3d2e', background: '#faf8f5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e6e1d6' }}>
                          {c.couponCode}
                        </code>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge gold" style={{ fontSize: '12px' }}>
                        {c.discountPercentage}% OFF
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#4b5d54' }}>
                      {c.productId?.name ? `Product: ${c.productId.name}` : 'Entire Store (Global)'}
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>
                        <strong>{c.usedCount || 0}</strong> / {c.maxUses || 25} Redeemed
                      </div>
                      <div style={{ width: '100px', height: '5px', background: '#e6e1d6', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(((c.usedCount || 0) / (c.maxUses || 25)) * 100, 100)}%`, height: '100%', background: '#0b3d2e' }} />
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: isExpired ? '#dc2626' : '#4b5d54' }}>
                      {new Date(c.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {isExpired && <span style={{ display: 'block', fontSize: '10.5px', color: '#dc2626', fontWeight: 600 }}>Expired</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle status"
                      >
                        <span className={`admin-badge ${isLive ? 'success' : 'danger'}`}>
                          {isLive ? 'ACTIVE' : isExpired ? 'EXPIRED' : c.status}
                        </span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => {
                            setEditingCoupon(c);
                            setModalOpen(true);
                          }}
                          title="Edit Coupon"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDeleteCoupon(c._id)}
                          disabled={deletingId === c._id}
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
                    <span style={{ color: '#64748b' }}>Loading coupon codes...</span>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No promo coupons created yet. Click &quot;Create New Coupon&quot; to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      {modalOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          products={products}
          onClose={() => {
            setModalOpen(false);
            setEditingCoupon(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}
    </div>
  );
}
