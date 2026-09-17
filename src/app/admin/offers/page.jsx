'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Loader2
} from 'lucide-react';
import OfferFormModal from '../components/OfferFormModal';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/offers?all=true');
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSaveOffer = async (offerData, id) => {
    const token = localStorage.getItem('venthulir_token');
    const url = id ? `/api/offers/${id}` : '/api/offers';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(offerData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save offer');
    }

    fetchOffers();
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign offer?')) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) fetchOffers();
    } catch (err) {
      console.error('Delete offer failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (offer) => {
    const nextActive = !offer.isActive;
    const token = localStorage.getItem('venthulir_token');

    const res = await fetch(`/api/offers/${offer._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: nextActive })
    });

    if (res.ok) {
      setOffers(prev => prev.map(o => o._id === offer._id ? { ...o, isActive: nextActive } : o));
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Marketing Campaigns & Limited Offers
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Curate flash sales, bundle packs, and homepage promotional campaigns
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchOffers}
            title="Refresh Offers"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setEditingOffer(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            <span>New Campaign Offer</span>
          </button>
        </div>
      </div>

      {/* Offers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {offers.map((offer) => {
          const isExpired = new Date(offer.endDate) < new Date();
          const isLive = offer.isActive && !isExpired;

          return (
            <div key={offer._id} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', background: '#faf8f5', border: '1px solid #e6e1d6' }}>
                <img
                  src={offer.imageUrl || (offer.images && offer.images[0]) || '/assets/hero/oil_coconut.png'}
                  alt={offer.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  {offer.badge && (
                    <span className="admin-badge gold" style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                      {offer.badge}
                    </span>
                  )}
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`admin-badge ${isLive ? 'success' : 'danger'}`}>
                    {isLive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'PAUSED'}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#15221b' }}>
                {offer.name}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px', flex: 1, lineHeight: 1.4 }}>
                {offer.description || 'Special organic promotional package.'}
              </p>

              <div style={{ background: '#faf8f5', padding: '12px', borderRadius: '8px', border: '1px solid #e6e1d6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Campaign Price</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0b3d2e' }}>₹{offer.offerPrice}</span>
                    <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#64748b' }}>₹{offer.price}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Campaign Discount</div>
                  <div style={{ fontWeight: 700, color: '#15803d', fontSize: '14px' }}>
                    {offer.discountPercent || Math.round(((offer.price - offer.offerPrice) / offer.price) * 100)}% OFF
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#4b5d54', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                <span>
                  {new Date(offer.startDate).toLocaleDateString()} — {new Date(offer.endDate).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleToggleActive(offer)}
                >
                  {offer.isActive ? 'Pause Campaign' : 'Activate Campaign'}
                </button>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => {
                    setEditingOffer(offer);
                    setModalOpen(true);
                  }}
                  title="Edit Offer"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => handleDeleteOffer(offer._id)}
                  disabled={deletingId === offer._id}
                  title="Delete Offer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
            <span style={{ color: '#64748b' }}>Loading promotional offers...</span>
          </div>
        )}

        {!loading && offers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748b' }}>
            No campaign offers launched yet. Click &quot;New Campaign Offer&quot; to create your first promotion.
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {modalOpen && (
        <OfferFormModal
          offer={editingOffer}
          onClose={() => {
            setModalOpen(false);
            setEditingOffer(null);
          }}
          onSave={handleSaveOffer}
        />
      )}
    </div>
  );
}
