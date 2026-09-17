'use client';

import React, { useState } from 'react';
import { X, Boxes, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function RestockModal({
  product,
  onClose,
  onRestock,
  onSave
}) {
  const [addQty, setAddQty] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const currentStock = Number(product.currentStock) || 0;
  const newProjectedStock = currentStock + (parseInt(addQty, 10) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const qty = parseInt(addQty, 10);
    if (!qty || qty <= 0) {
      setErrorMsg('Please enter a valid stock quantity to add.');
      return;
    }

    const handler = onRestock || onSave;
    if (!handler) return;

    try {
      setSubmitting(true);
      await handler(product._id || product.id, newProjectedStock);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Restock failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edfcf2', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Boxes size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>
                Quick Warehouse Restock
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Add incoming batch units to inventory
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adm-modal-body">
          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', color: '#991b1b', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <img
              src={product.imageUrl || (product.images && product.images[0]) || '/assets/hero/turmeric.png'}
              alt={product.name}
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{product.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>SKU: {product.productCode || 'VNT-PROD'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: currentStock <= 5 ? '#dc2626' : '#0f3d2a' }}>
                {currentStock}
              </div>
            </div>

            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1B5E2F', textTransform: 'uppercase', fontWeight: 600 }}>New Stock</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d' }}>
                {newProjectedStock}
              </div>
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Units to Add to Warehouse (+)</label>
            <input
              type="number"
              className="adm-form-input"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              min="1"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                className="adm-btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '7px' }}
                onClick={() => setAddQty(preset)}
              >
                +{preset}
              </button>
            ))}
          </div>
        </form>

        <div className="adm-modal-footer">
          <button type="button" className="adm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
            <span>Confirm Restock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
