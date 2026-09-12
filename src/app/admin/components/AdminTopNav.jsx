'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';

export default function AdminTopNav({
  onMobileToggle,
  stats,
  searchTerm,
  setSearchTerm
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate title from pathname
  const getPageMeta = () => {
    if (pathname === '/admin') return { title: 'Operational Dashboard', section: 'Overview' };
    if (pathname.includes('/products')) return { title: 'Product Catalog', section: 'Catalog' };
    if (pathname.includes('/categories')) return { title: 'Categories & Harvests', section: 'Catalog' };
    if (pathname.includes('/inventory')) return { title: 'Warehouse Inventory', section: 'Catalog' };
    if (pathname.includes('/orders')) return { title: 'Order Management', section: 'Sales' };
    if (pathname.includes('/customers')) return { title: 'Customer Directory', section: 'Sales' };
    if (pathname.includes('/coupons')) return { title: 'Promo & Coupons', section: 'Sales' };
    if (pathname.includes('/offers')) return { title: 'Campaign Offers', section: 'Marketing' };
    if (pathname.includes('/banners')) return { title: 'Announcement Banners', section: 'Marketing' };
    if (pathname.includes('/messages')) return { title: 'Support Enquiries', section: 'Support' };
    if (pathname.includes('/analytics')) return { title: 'Business Intelligence & Reports', section: 'Analytics' };
    if (pathname.includes('/settings')) return { title: 'Platform Settings', section: 'System' };
    return { title: 'Management Console', section: 'Admin' };
  };

  const meta = getPageMeta();
  const pendingOrders = stats?.statusCounts?.pending || 0;
  const lowStock = stats?.lowStockCount || 0;
  const totalNotifications = pendingOrders + lowStock;

  return (
    <header className="admin-topnav">
      <div className="admin-topnav-left">
        <button
          className="admin-mobile-toggle"
          onClick={onMobileToggle}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="admin-page-title-group">
          <h1>{meta.title}</h1>
          <div className="admin-breadcrumbs">
            <span>Venthulir</span>
            <ChevronRight size={12} />
            <span>{meta.section}</span>
            <ChevronRight size={12} />
            <span style={{ color: '#15221b', fontWeight: 600 }}>{meta.title}</span>
          </div>
        </div>
      </div>

      <div className="admin-topnav-right">
        {/* Global Search */}
        {setSearchTerm !== undefined && (
          <div className="admin-search-wrapper">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search catalog, orders..."
              className="admin-search-input"
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* View Storefront button */}
        <Link
          href="/home"
          target="_blank"
          className="admin-header-btn"
          title="Open Live Customer Storefront"
        >
          <ExternalLink size={15} />
          <span>Live Store</span>
        </Link>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="admin-header-btn"
            style={{ position: 'relative', padding: '0 10px' }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={17} />
            {totalNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#dc2626',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              background: '#ffffff',
              border: '1px solid #e6e1d6',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                background: '#faf8f5',
                borderBottom: '1px solid #e6e1d6',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>System Notifications</span>
                <span className="admin-badge gold">{totalNotifications} Active</span>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }}>
                {pendingOrders > 0 && (
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#fffbeb',
                      marginBottom: '6px',
                      textDecoration: 'none',
                      color: '#15221b'
                    }}
                  >
                    <ShoppingCart size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 600 }}>{pendingOrders} Pending Orders</div>
                      <div style={{ color: '#64748b', fontSize: '11.5px' }}>Awaiting admin review & shipping</div>
                    </div>
                  </Link>
                )}

                {lowStock > 0 && (
                  <Link
                    href="/admin/inventory"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      marginBottom: '6px',
                      textDecoration: 'none',
                      color: '#15221b'
                    }}
                  >
                    <AlertTriangle size={16} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 600 }}>{lowStock} Low Stock Alerts</div>
                      <div style={{ color: '#64748b', fontSize: '11.5px' }}>Warehouse items reaching zero</div>
                    </div>
                  </Link>
                )}

                {totalNotifications === 0 && (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <CheckCircle2 size={24} color="#15803d" style={{ margin: '0 auto 8px' }} />
                    <div>All systems operational! No pending alerts.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#edfcf2',
          padding: '6px 12px',
          borderRadius: '9999px',
          border: '1px solid #bbf7d0',
          fontSize: '12.5px',
          fontWeight: 600,
          color: '#15803d'
        }}>
          <ShieldCheck size={15} />
          <span>{user?.name?.split(' ')[0] || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
