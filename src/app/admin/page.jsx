'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Boxes,
  Eye,
  CheckCircle2,
  Truck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  MessageSquare,
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';
import OrderDetailModal from './components/OrderDetailModal';
import RestockModal from './components/RestockModal';
import ProductFormModal from './components/ProductFormModal';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function SimpleAdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'shipped' | 'delivered'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('venthulir_token');
      const savedUserStr = localStorage.getItem('venthulir_user');
      
      // Only proceed if user is verified admin in local state or auth context
      let isAdminUser = user?.isAdmin;
      if (!isAdminUser && savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          isAdminUser = parsed?.isAdmin;
        } catch {
          isAdminUser = false;
        }
      }

      if (!token || !isAdminUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data) setStats(data);
      }
    } catch {
      // Safe fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    // 1. Optimistic update in UI immediately
    setStats(prev => {
      if (!prev) return prev;
      const updatedOrders = (prev.recentOrders || []).map(o => {
        if (o._id === orderId || o.orderId === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      });
      return { ...prev, recentOrders: updatedOrders };
    });

    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderId === orderId)) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    const token = localStorage.getItem('venthulir_token');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Order status updated to "${newStatus}"!`);
        await fetchStats();
      } else {
        toast.error('Failed to update order status.');
        await fetchStats();
      }
    } catch {
      toast.error('Network error updating status.');
      await fetchStats();
    }
  };

  const handleRestock = async (productId, newStock) => {
    const token = localStorage.getItem('venthulir_token');
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentStock: newStock })
      });

      if (res.ok) {
        toast.success('Stock updated successfully!');
        fetchStats();
        setRestockProduct(null);
      } else {
        toast.error('Failed to update stock.');
      }
    } catch {
      toast.error('Error updating inventory.');
    }
  };

  const handleSaveNewProduct = async (productData) => {
    const token = localStorage.getItem('venthulir_token');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        toast.success('New product added to store catalog!');
        setShowAddProductModal(false);
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.msg || 'Failed to save product.');
      }
    } catch {
      toast.error('Error creating product.');
    }
  };

  // Filter orders
  const rawOrders = stats?.recentOrders || [];
  const filteredOrders = rawOrders.filter(ord => {
    const status = (ord.status || ord.orderStatus || 'pending').toLowerCase();
    const matchesTab = 
      orderFilter === 'all' ? true :
      orderFilter === 'pending' ? (status === 'pending' || status === 'processing' || status === 'confirmed') :
      orderFilter === 'shipped' ? (status === 'shipped' || status === 'in_transit') :
      orderFilter === 'delivered' ? (status === 'delivered') : true;

    const matchesSearch = searchQuery === '' ? true :
      (ord.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ord.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ord.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const pendingCount = stats?.statusCounts?.pending || 0;
  const lowStockCount = stats?.lowStockCount || 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── 1. TOP HEADER & QUICK ACTION BAR ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '22px', fontWeight: '800', color: '#0f3d2a', margin: 0 }}>
              Store Overview & Control Panel
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#dcfce7',
              color: '#15803d',
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              Live Online
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Real-time management for Venthulir Organic Storefront
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            style={{
              background: '#0f3d2a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(15, 61, 42, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>

          <Link
            href="/admin/inventory"
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Boxes size={15} />
            <span>Manage Stock</span>
          </Link>

          <a
            href="/home"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#f8fafc',
              color: '#0f3d2a',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={15} />
            <span>View Storefront</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            onClick={fetchStats}
            title="Refresh metrics"
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '10px',
              borderRadius: '10px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── 2. BIG CLEAR STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Revenue */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Revenue
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#edfcf2', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f3d2a', margin: '0 0 4px' }}>
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} />
            <span>{stats?.totalOrders || 0} completed orders</span>
          </div>
        </div>

        {/* Card 2: Orders to Fulfill */}
        <div style={{
          background: pendingCount > 0 ? '#fffbeb' : '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: pendingCount > 0 ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: pendingCount > 0 ? '#92400e' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Needs Fulfillment
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: pendingCount > 0 ? '#fef3c7' : '#eff6ff', color: pendingCount > 0 ? '#d97706' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: pendingCount > 0 ? '#b45309' : '#0f3d2a', margin: '0 0 4px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '12px', color: pendingCount > 0 ? '#b45309' : '#64748b', fontWeight: '500' }}>
            {pendingCount > 0 ? 'Action needed: New orders awaiting dispatch' : 'All orders up to date'}
          </div>
        </div>

        {/* Card 3: Products & Stock */}
        <div style={{
          background: lowStockCount > 0 ? '#fef2f2' : '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: lowStockCount > 0 ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: lowStockCount > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Catalog
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: lowStockCount > 0 ? '#fee2e2' : '#f5f3ff', color: lowStockCount > 0 ? '#dc2626' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f3d2a', margin: '0 0 4px' }}>
            {stats?.totalProducts || 0}
          </div>
          <div style={{ fontSize: '12px', color: lowStockCount > 0 ? '#dc2626' : '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {lowStockCount > 0 ? (
              <>
                <AlertTriangle size={13} />
                <span>{lowStockCount} items need restock!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Healthy stock levels</span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Registered Patrons */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Customers
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fdf8e9', color: '#c59b27', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f3d2a', margin: '0 0 4px' }}>
            {stats?.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Registered member patrons
          </div>
        </div>

      </div>

      {/* ── 3. MAIN WORKSPACE (TWO COLUMNS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: LIVE ORDERS ACTION BOARD */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f3d2a', margin: '0 0 4px' }}>
                Orders & Fulfillment Pipeline
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Manage customer purchases with 1-click status transitions
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '4px' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: `Needs Action (${pendingCount})` },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOrderFilter(tab.key)}
                  style={{
                    background: orderFilter === tab.key ? '#ffffff' : 'transparent',
                    color: orderFilter === tab.key ? '#0f3d2a' : '#64748b',
                    fontWeight: orderFilter === tab.key ? '700' : '500',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    boxShadow: orderFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search by Order ID (#VEN-...), Customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* Orders Table List */}
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <ShoppingCart size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>No orders matching this filter</div>
              <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '4px 0 0' }}>All inbound store orders will appear here in real time</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOrders.map(ord => {
                const status = (ord.status || ord.orderStatus || 'Pending').toLowerCase();
                const total = ord.totalAmount || ord.amount || ord.pricing?.finalTotal || 0;
                const items = ord.items || ord.orderItems || [];
                const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent';

                return (
                  <div
                    key={ord._id || ord.orderId}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      transition: 'border-color 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13.5px', color: '#0f3d2a' }}>
                          #{ord.orderId || ord._id?.slice(-8).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>• {dateStr}</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: 
                            status === 'delivered' ? '#dcfce7' :
                            status === 'shipped' ? '#f5f3ff' :
                            status === 'processing' || status === 'confirmed' ? '#eff6ff' : '#fffbeb',
                          color:
                            status === 'delivered' ? '#15803d' :
                            status === 'shipped' ? '#7c3aed' :
                            status === 'processing' || status === 'confirmed' ? '#2563eb' : '#b45309'
                        }}>
                          {ord.status || 'Pending'}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                        {ord.customer?.name || ord.shippingAddress?.fullName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {items.length} {items.length === 1 ? 'item' : 'items'} • ₹{total}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord._id || ord.orderId, 'Confirmed')}
                          style={{
                            background: '#0f3d2a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Confirm
                        </button>
                      )}

                      {(status === 'confirmed' || status === 'processing') && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord._id || ord.orderId, 'Shipped')}
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Truck size={13} />
                          <span>Dispatch</span>
                        </button>
                      )}

                      {status === 'shipped' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord._id || ord.orderId, 'Delivered')}
                          style={{
                            background: '#15803d',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: QUICK STOCK & INVENTORY RESTOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Low Stock Alerts */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={17} color={lowStockCount > 0 ? '#dc2626' : '#15803d'} />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f3d2a', margin: 0 }}>
                  Inventory Alert
                </h3>
              </div>
              <Link href="/admin/inventory" style={{ fontSize: '12px', fontWeight: '600', color: '#0f3d2a', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.lowStockProducts.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b' }}>{p.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#b91c1c' }}>Remaining: {p.currentStock || 0} units</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRestockProduct(p)}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 10px', background: '#f0fdf4', borderRadius: '10px', color: '#15803d', fontSize: '13px', fontWeight: '600' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                All warehouse products are well stocked!
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f3d2a', margin: '0 0 14px' }}>
              Management Shortcuts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/admin/products"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={16} color="#0f3d2a" />
                  <span>Product Catalog & Pricing</span>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/coupons"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag size={16} color="#0f3d2a" />
                  <span>Discounts & Coupons</span>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/customers"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} color="#0f3d2a" />
                  <span>Customer Directory</span>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/messages"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={16} color="#0f3d2a" />
                  <span>Patron Messages</span>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(newStatus) => handleOrderStatusUpdate(selectedOrder._id || selectedOrder.orderId, newStatus)}
        />
      )}

      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSave={handleRestock}
        />
      )}

      {showAddProductModal && (
        <ProductFormModal
          product={null}
          onClose={() => setShowAddProductModal(false)}
          onSave={handleSaveNewProduct}
        />
      )}

    </div>
  );
}
