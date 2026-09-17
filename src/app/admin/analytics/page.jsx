'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalOrders = stats?.orderCount || 0;
  const totalRev = stats?.totalRevenue || 0;
  const completedOrders = (stats?.statusCounts?.delivered || 0) + (stats?.statusCounts?.shipped || 0) + (stats?.statusCounts?.confirmed || 0);
  const aov = totalOrders > 0 ? Math.round(totalRev / Math.max(totalOrders, 1)) : 0;
  const codCount = stats?.paymentBreakdown?.cod || 0;
  const onlineCount = stats?.paymentBreakdown?.online || 0;
  const codPercent = totalOrders > 0 ? Math.round((codCount / totalOrders) * 100) : 100;
  const onlinePercent = 100 - codPercent;

  const handleExportCSV = () => {
    if (!stats) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Net Revenue (INR)', stats.totalRevenue || 0],
      ['Total Orders', stats.orderCount || 0],
      ['Average Order Value (INR)', aov],
      ['COD Orders', codCount],
      ['Online Orders', onlineCount],
      ['Total Products in Catalog', stats.productCount || 0],
      ['Total Physical Inventory Units', stats.totalInventoryUnits || 0],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Venthulir_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Business Intelligence & Sales Reports
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            In-depth revenue trends, customer purchasing behaviors, and product velocity
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchStats}
            title="Refresh Analytics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="admin-btn admin-btn-primary"
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export CSV Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="admin-stats-grid">
        <StatCard
          label="Gross Revenue"
          value={`₹${totalRev.toLocaleString()}`}
          subtext="Net delivered & active transactions"
          icon={DollarSign}
          colorScheme="gold"
          badgeText="FINANCIAL"
        />

        <StatCard
          label="Average Order Value"
          value={`₹${aov.toLocaleString()}`}
          subtext="Average basket value per checkout"
          icon={TrendingUp}
          colorScheme="green"
          badgeText="AOV"
        />

        <StatCard
          label="Total Order Volume"
          value={totalOrders}
          subtext={`${completedOrders} fulfilled / in progress`}
          icon={ShoppingCart}
          colorScheme="terracotta"
        />

        <StatCard
          label="Payment Preference"
          value={`${codPercent}% COD`}
          subtext={`${onlinePercent}% Digital / UPI`}
          icon={CreditCard}
          colorScheme="amber"
          badgeText="PAYMENTS"
        />
      </div>

      {/* Detailed Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Payment Channels Split */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">
                <CreditCard size={18} color="#0b3d2e" /> Payment Method Breakdown
              </div>
              <div className="admin-card-subtitle">Customer checkout payment preference</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Cash on Delivery (COD)</span>
                <span style={{ fontWeight: 700 }}>{codCount} Orders ({codPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e6e1d6', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${codPercent}%`, height: '100%', background: '#0b3d2e' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Online Payments (Razorpay / UPI / Cards)</span>
                <span style={{ fontWeight: 700 }}>{onlineCount} Orders ({onlinePercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e6e1d6', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${onlinePercent}%`, height: '100%', background: '#c59b27' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Health */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">
                <ShoppingCart size={18} color="#0b3d2e" /> Order Completion Ratio
              </div>
              <div className="admin-card-subtitle">Delivered vs cancelled statistics</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
            <div style={{ background: '#edfcf2', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Delivered Successfully</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', margin: '6px 0' }}>
                {stats?.statusCounts?.delivered || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#1B5E2F' }}>Orders completed</div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Cancelled / Restocked</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', margin: '6px 0' }}>
                {stats?.statusCounts?.cancelled || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#991b1b' }}>Stock safely refunded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Full Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">
              <Package size={18} color="#0b3d2e" /> Top Performing Products by Sales Volume
            </div>
            <div className="admin-card-subtitle">Ranking of top selling organic products</div>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Units Sold</th>
                <th>Total Sales Generated</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.bestSellers || []).map((prod, i) => (
                <tr key={i}>
                  <td>
                    <span className="admin-badge gold" style={{ fontSize: '12px' }}>
                      #{i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#15221b' }}>{prod.name}</td>
                  <td><strong>{prod.unitsSold} Units</strong></td>
                  <td style={{ fontWeight: 800, color: '#0b3d2e' }}>₹{prod.revenue.toLocaleString()}</td>
                </tr>
              ))}
              {(!stats?.bestSellers || stats.bestSellers.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No product transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
