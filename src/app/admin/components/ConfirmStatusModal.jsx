'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  Clock,
  ArrowRight,
  X,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function ConfirmStatusModal({
  isOpen,
  order,
  targetStatus,
  isCancel = false,
  onConfirm,
  onClose,
  loading = false
}) {
  if (!isOpen || !order || !targetStatus) return null;

  const currentStatus = order.status || 'Pending';
  const orderRef = (order._id || order.orderId || '').slice(-8).toUpperCase();
  const customerName = order.customerName || order.customer?.name || order.shippingAddress?.fullName || 'Customer';
  const totalAmount = order.totalAmount || order.originalAmount || 0;
  const itemCount = Array.isArray(order.items) ? order.items.length : 0;

  const getStatusColor = (st) => {
    switch (st?.toLowerCase()) {
      case 'delivered':
        return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd', icon: CheckCircle2 };
      case 'shipped':
        return { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe', icon: Truck };
      case 'confirmed':
      case 'processing':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: Package };
      case 'cancelled':
      case 'returned':
        return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', icon: XCircle };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: Clock };
    }
  };

  const currStyle = getStatusColor(currentStatus);
  const targetStyle = getStatusColor(targetStatus);
  const CurrIcon = currStyle.icon;
  const TargetIcon = targetStyle.icon;

  const getConfirmationMessage = () => {
    if (isCancel || targetStatus.toLowerCase() === 'cancelled') {
      return 'Are you sure you want to CANCEL this order? This action will halt fulfillment.';
    }
    switch (targetStatus.toLowerCase()) {
      case 'confirmed':
        return 'Confirm this order to proceed with farm packing and preparation.';
      case 'shipped':
        return 'Mark this order as Shipped / Dispatched to inform the customer that their package is on the way.';
      case 'delivered':
        return 'Mark this order as Delivered. This marks fulfillment as 100% complete.';
      default:
        return `Change the order status from "${currentStatus}" to "${targetStatus}".`;
    }
  };

  const getConfirmButtonGradient = () => {
    if (isCancel || targetStatus.toLowerCase() === 'cancelled') {
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
    if (targetStatus.toLowerCase() === 'shipped') {
      return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
    }
    if (targetStatus.toLowerCase() === 'delivered') {
      return 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
    }
    return 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #c2410c 100%)';
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="adm-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isCancel ? '#fff5f5' : '#fcfbf9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isCancel ? '#fee2e2' : '#fef3c7',
              color: isCancel ? '#dc2626' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Confirm Status Update
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Order #{orderRef}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading}
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#64748b', 
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Order Details Brief Card */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                {customerName}
              </span>
              <strong style={{ fontSize: '14px', fontWeight: 850, color: '#b45309' }}>
                ₹{totalAmount}
              </strong>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px' }}>
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} in order</span>
              <span>•</span>
              <span>Ref: #{orderRef}</span>
            </div>
          </div>

          {/* Status Transition Visualizer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: '#ffffff',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '18px'
          }}>
            {/* Current */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 750, display: 'block', marginBottom: '5px' }}>
                Current Status
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: currStyle.bg,
                color: currStyle.color,
                border: `1px solid ${currStyle.border}`,
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 750
              }}>
                <CurrIcon size={13} />
                <span>{currentStatus}</span>
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ArrowRight size={14} />
            </div>

            {/* Target */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 750, display: 'block', marginBottom: '5px' }}>
                New Status
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: targetStyle.bg,
                color: targetStyle.color,
                border: `1px solid ${targetStyle.border}`,
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <TargetIcon size={13} />
                <span>{targetStatus}</span>
              </div>
            </div>
          </div>

          {/* Description Text */}
          <p style={{
            fontSize: '13px',
            color: isCancel ? '#b91c1c' : '#475569',
            lineHeight: 1.5,
            margin: '0 0 24px',
            textAlign: 'center',
            fontWeight: 550
          }}>
            {getConfirmationMessage()}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '11px 18px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 750,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: '11px 18px',
                borderRadius: '12px',
                border: 'none',
                background: getConfirmButtonGradient(),
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 850,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                transition: 'all 0.2s',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Yes, Update Status</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
