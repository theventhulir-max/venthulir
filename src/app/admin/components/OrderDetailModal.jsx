'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Tag,
  Loader2,
  MessageCircle,
  Send,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import ConfirmStatusModal from './ConfirmStatusModal';
import TaxInvoice from '@/components/TaxInvoice';
import { getWhatsAppOrderUrl } from '@/lib/whatsapp';

export default function OrderDetailModal({
  order,
  onClose,
  onStatusUpdate,
  onStatusChange
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { targetStatus, isCancel }
  const [showInvoice, setShowInvoice] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [courierPartner, setCourierPartner] = useState(order?.courierPartner || 'ST Courier');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSavedSuccess, setTrackingSavedSuccess] = useState(false);

  if (!order) return null;

  const currentStatus = order.status || order.orderStatus || 'Pending';

  const promptStatusChange = (newStatus, isCancel = false) => {
    if (newStatus.toLowerCase() === currentStatus.toLowerCase()) return;
    setConfirmTarget({ targetStatus: newStatus, isCancel });
  };

  const executeStatusChange = async () => {
    if (!confirmTarget) return;
    const { targetStatus, isCancel } = confirmTarget;

    const handler = onStatusUpdate || onStatusChange;
    if (!handler) {
      setConfirmTarget(null);
      return;
    }

    try {
      setUpdatingStatus(true);
      await handler(order._id || order.orderId, targetStatus, isCancel, {
        trackingNumber,
        courierPartner
      });
      setConfirmTarget(null);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveTracking = async () => {
    const handler = onStatusUpdate || onStatusChange;
    if (!handler) return;
    try {
      setSavingTracking(true);
      await handler(order._id || order.orderId, currentStatus, false, {
        trackingNumber,
        courierPartner
      });
      setTrackingSavedSuccess(true);
      setTimeout(() => setTrackingSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save tracking error:', err);
    } finally {
      setSavingTracking(false);
    }
  };

  const triggerWhatsApp = (statusOverride) => {
    const targetSt = statusOverride || currentStatus;
    const url = getWhatsAppOrderUrl(order, targetSt, {
      trackingNumber,
      courierPartner
    });
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    setShowInvoice(true);
  };

  const getStatusBadge = (st) => {
    const s = (st || 'pending').toLowerCase();
    switch (s) {
      case 'delivered': return <span className="adm-status-badge delivered"><CheckCircle2 size={12} /> Delivered</span>;
      case 'shipped': return <span className="adm-status-badge shipped"><Truck size={12} /> Shipped</span>;
      case 'confirmed':
      case 'processing': return <span className="adm-status-badge confirmed"><Package size={12} /> Confirmed</span>;
      case 'cancelled':
      case 'returned': return <span className="adm-status-badge cancelled"><XCircle size={12} /> {st}</span>;
      default: return <span className="adm-status-badge pending"><Clock size={12} /> Pending</span>;
    }
  };

  const items = order.items || order.orderItems || [];
  const total = order.totalAmount || order.amount || order.pricing?.finalTotal || 0;
  const orderId = order.orderId || order._id?.slice(-8).toUpperCase();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Order Inspector</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a', fontFamily: 'monospace' }}>
                #{orderId}
              </h3>
            </div>
            <div>{getStatusBadge(currentStatus)}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: '1px solid #16a34a',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
              }}
              onClick={() => triggerWhatsApp(currentStatus)}
              title="Notify Customer via WhatsApp (Professional English)"
            >
              <MessageCircle size={13} />
              <span>WhatsApp Customer</span>
            </button>
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={handlePrint}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Print Order Invoice"
            >
              <Printer size={13} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="adm-modal-body">
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fulfillment Pipeline
                </span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span>Current Stage:</span>
                  <span style={{
                    background: currentStatus.toLowerCase() === 'cancelled' ? '#fee2e2' : '#dcfce7',
                    color: currentStatus.toLowerCase() === 'cancelled' ? '#dc2626' : '#1B5E2F',
                    padding: '2px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 750,
                    border: `1px solid ${currentStatus.toLowerCase() === 'cancelled' ? '#fecaca' : '#bbf7d0'}`
                  }}>
                    {currentStatus.toLowerCase() === 'cancelled' ? '✕ Cancelled' : `✓ ${currentStatus}`}
                  </span>
                </div>
              </div>

              {currentStatus.toLowerCase() !== 'cancelled' && (
                <button
                  type="button"
                  style={{ 
                    background: '#ffffff', 
                    color: '#dc2626', 
                    border: '1px solid #fecaca', 
                    padding: '5px 12px', 
                    borderRadius: '6px', 
                    fontSize: '11.5px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  onClick={() => promptStatusChange('Cancelled', true)}
                  disabled={updatingStatus}
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* Clean Minimal Stepper Grid */}
            <div className="adm-stepper-grid">
              {[
                { key: 'pending', label: 'Pending', stepNum: 1 },
                { key: 'confirmed', label: 'Confirmed', stepNum: 2 },
                { key: 'shipped', label: 'Shipped', stepNum: 3 },
                { key: 'delivered', label: 'Delivered', stepNum: 4 }
              ].map((step, idx) => {
                const normStatus = (currentStatus || 'pending').toLowerCase();
                const activeKey = normStatus === 'processing' ? 'confirmed' : normStatus;
                const isCancelled = activeKey === 'cancelled' || activeKey === 'returned';
                
                const stepOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
                const currentStepIdx = stepOrder.indexOf(activeKey);
                
                const isCompleted = !isCancelled && currentStepIdx > idx;
                const isActive = !isCancelled && currentStepIdx === idx;

                return (
                  <button
                    key={step.key}
                    type="button"
                    disabled={updatingStatus || isCancelled || isActive}
                    onClick={() => promptStatusChange(step.label)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      cursor: isActive || isCancelled ? 'default' : 'pointer',
                      border: isActive
                        ? '1.5px solid #0f3d2a'
                        : isCompleted
                          ? '1px solid #bbf7d0'
                          : '1px solid #cbd5e1',
                      background: isActive
                        ? '#0f3d2a'
                        : isCompleted
                          ? '#f0fdf4'
                          : '#ffffff',
                      color: isActive
                        ? '#ffffff'
                        : isCompleted
                          ? '#1B5E2F'
                          : '#334155',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(15, 61, 42, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: isActive ? 800 : 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      {isCompleted && <Check size={13} strokeWidth={3} color="#16a34a" />}
                      {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />}
                      <span>{step.stepNum}. {step.label}</span>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      marginTop: '3px',
                      fontWeight: 600,
                      color: isActive ? '#a7f3d0' : isCompleted ? '#15803d' : '#94a3b8'
                    }}>
                      {isActive ? 'Active Now' : isCompleted ? 'Completed' : 'Click to Set'}
                    </div>
                  </button>
                );
              })}
            </div>

            {updatingStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#1B5E2F', fontWeight: 600 }}>
                <Loader2 size={14} className="spin" /> Updating order status...
              </div>
            )}
          </div>

          {/* Customer Notification Hub (WhatsApp & Automatic Email) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                    Customer Notification Hub
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Direct 1-click WhatsApp customer message & auto-email
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#1B5E2F', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                ✉️ Auto Email Synced
              </div>
            </div>

            {/* Courier Tracking Inputs */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '10px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Truck size={12} /> Courier & Tracking Reference
              </div>
              <div className="adm-tracking-grid">
                <input
                  type="text"
                  placeholder="Courier (e.g. ST Courier)"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                />
                <input
                  type="text"
                  placeholder="Tracking / AWB No (optional)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  className="adm-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700 }}
                  onClick={handleSaveTracking}
                  disabled={savingTracking}
                >
                  {savingTracking ? 'Saving...' : trackingSavedSuccess ? '✓ Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Quick 1-Click WhatsApp Triggers with Minimal, Unified Styling */}
            <div className="adm-triggers-grid">
              <button
                type="button"
                style={{
                  background: currentStatus.toLowerCase() === 'confirmed' || currentStatus.toLowerCase() === 'processing' ? '#f0fdf4' : '#ffffff',
                  border: currentStatus.toLowerCase() === 'confirmed' || currentStatus.toLowerCase() === 'processing' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                  color: currentStatus.toLowerCase() === 'confirmed' || currentStatus.toLowerCase() === 'processing' ? '#1B5E2F' : '#334155',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                  fontWeight: currentStatus.toLowerCase() === 'confirmed' ? 750 : 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => triggerWhatsApp('Confirmed')}
                title="Send Order Confirmation via WhatsApp"
              >
                <MessageCircle size={13} color="#25D366" />
                <span>1. Send Confirmed {currentStatus.toLowerCase() === 'confirmed' ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                style={{
                  background: currentStatus.toLowerCase() === 'shipped' ? '#f0fdf4' : '#ffffff',
                  border: currentStatus.toLowerCase() === 'shipped' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                  color: currentStatus.toLowerCase() === 'shipped' ? '#1B5E2F' : '#334155',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                  fontWeight: currentStatus.toLowerCase() === 'shipped' ? 750 : 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => triggerWhatsApp('Shipped')}
                title="Send Dispatch Tracking Details via WhatsApp"
              >
                <Truck size={13} color="#25D366" />
                <span>2. Send Dispatched {currentStatus.toLowerCase() === 'shipped' ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                style={{
                  background: currentStatus.toLowerCase() === 'delivered' ? '#f0fdf4' : '#ffffff',
                  border: currentStatus.toLowerCase() === 'delivered' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                  color: currentStatus.toLowerCase() === 'delivered' ? '#1B5E2F' : '#334155',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                  fontWeight: currentStatus.toLowerCase() === 'delivered' ? 750 : 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => triggerWhatsApp('Delivered')}
                title="Send Delivery Notice via WhatsApp"
              >
                <CheckCircle2 size={13} color="#25D366" />
                <span>3. Send Delivered {currentStatus.toLowerCase() === 'delivered' ? '✓' : ''}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Customer Details */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Customer Information
              </div>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontWeight: 700 }}>{order.customerName || order.shippingAddress?.fullName || 'Customer'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                  <Mail size={13} /> {order.customerEmail || 'Registered Member'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} /> {order.phone || order.shippingAddress?.phone || 'No phone provided'}
                  </div>
                  {(order.phone || order.shippingAddress?.phone) && (
                    <button
                      type="button"
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => triggerWhatsApp(currentStatus)}
                      title="Open WhatsApp Chat with Customer"
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Delivery Address
              </div>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                {order.deliveryAddress?.address || order.shippingAddress?.address || order.shippingAddress?.street || 'Farm Origin Order'}
                <br />
                {order.deliveryAddress?.city || order.shippingAddress?.city || ''} {order.deliveryAddress?.state || order.shippingAddress?.state || ''} - {order.deliveryAddress?.zipCode || order.shippingAddress?.pincode || ''}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={14} /> Purchased Harvest Items ({items.length})
            </div>
            <div className="admin-table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table className="admin-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.image || item.imageUrl || '/assets/hero/turmeric.png'}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.selectedWeight && <div style={{ fontSize: '11px', color: '#64748b' }}>{item.selectedWeight}</div>}
                          </div>
                        </div>
                      </td>
                      <td><strong>x{item.quantity || 1}</strong></td>
                      <td>₹{item.price}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '300px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f3d2a' }}>
                <span>Grand Total:</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="adm-modal-footer">
          <button type="button" className="adm-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <ConfirmStatusModal
          isOpen={Boolean(confirmTarget)}
          order={order}
          targetStatus={confirmTarget.targetStatus}
          isCancel={confirmTarget.isCancel}
          onConfirm={executeStatusChange}
          onClose={() => setConfirmTarget(null)}
          loading={updatingStatus}
        />
      )}

      {/* Official Tax Invoice Modal */}
      {showInvoice && (
        <TaxInvoice
          order={order}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}
