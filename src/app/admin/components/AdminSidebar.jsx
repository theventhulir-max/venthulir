'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  Ticket,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
  X
} from 'lucide-react';

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  pendingOrdersCount = 0,
  pendingMessagesCount = 0,
  lowStockCount = 0
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Catalog',
      items: [
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: Layers },
        {
          label: 'Inventory',
          href: '/admin/inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
          badgeType: 'danger'
        },
      ]
    },
    {
      group: 'Sales',
      items: [
        {
          label: 'Orders',
          href: '/admin/orders',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null
        },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
      ]
    },
    {
      group: 'Marketing',
      items: [
        { label: 'Offers', href: '/admin/offers', icon: Sparkles },
        { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      ]
    },
    {
      group: 'Support',
      items: [
        {
          label: 'Messages',
          href: '/admin/messages',
          icon: MessageSquare,
          badge: pendingMessagesCount > 0 ? `${pendingMessagesCount}` : null
        },
      ]
    },
    {
      group: 'Analytics',
      items: [
        { label: 'Reports', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      group: 'System',
      items: [
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-sidebar-brand" onClick={handleNavClick}>
            <img
              src="/logo.png"
              alt="Venthulir Logo"
              className="admin-brand-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                const fb = document.getElementById('admin-fallback-brand-icon');
                if (fb) fb.style.display = 'flex';
              }}
            />
            <div id="admin-fallback-brand-icon" className="admin-brand-icon" style={{ display: 'none' }}>
              <Leaf size={20} />
            </div>
            {!collapsed && (
              <div>
                <div className="admin-brand-title">VENTHULIR</div>
                <div className="admin-brand-subtitle">Royal Organic Admin</div>
              </div>
            )}
          </Link>

          <button
            className="admin-sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            title="Close menu"
          >
            <X size={18} />
          </button>

          <button
            className="admin-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {navGroups.map((grp) => (
            <div key={grp.group} className="admin-nav-group">
              {!collapsed && <div className="admin-nav-group-title">{grp.group}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`admin-nav-item ${isActive ? 'active' : ''}`}
                      onClick={handleNavClick}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="admin-nav-icon" />
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className={`admin-nav-badge ${item.badgeType || ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-user-avatar">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="admin-user-info">
                <div className="admin-user-name">{user?.name || 'Store Admin'}</div>
                <div className="admin-user-role">Master Administrator</div>
              </div>
            )}
          </div>

          <button
            className="admin-logout-btn"
            onClick={logout}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
