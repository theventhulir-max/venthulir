'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Megaphone,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function AdminBannersPage() {
  const [settings, setSettings] = useState({
    announcementText: '🌿 Pure Heritage Harvest Direct From Tamil Nadu Farms — Express Delivery Across India!',
    announcementActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            announcementText: data.announcementText || '🌿 Pure Heritage Harvest Direct From Tamil Nadu Farms — Express Delivery Across India!',
            announcementActive: data.announcementActive !== undefined ? data.announcementActive : true,
          });
        }
      } catch (err) {
        console.error('Failed to load banner settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
          Storefront Banners & Announcements
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Manage the top marquee announcement bar and featured homepage marketing messaging
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Top Marquee Announcement Editor */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Megaphone size={18} color="#c59b27" /> Top Ticker Announcement Bar
            </div>
            <span className={`admin-badge ${settings.announcementActive ? 'success' : 'danger'}`}>
              {settings.announcementActive ? 'LIVE ON STORE' : 'HIDDEN'}
            </span>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Announcement Marquee Text
              </label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                placeholder="e.g. 🌿 Special Festive Offer — Flat 20% OFF on Wood Cold-Pressed Oils!"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="announcementActive"
                checked={settings.announcementActive}
                onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0b3d2e', cursor: 'pointer' }}
              />
              <label htmlFor="announcementActive" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Display ticker marquee bar on top of customer homepage
              </label>
            </div>

            {/* Live Preview Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>
                Live Visual Preview
              </div>
              <div style={{
                background: '#082c21',
                color: '#d4af37',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '0.5px',
                border: '1px solid rgba(212,175,55,0.3)'
              }}>
                {settings.announcementText || 'Your announcement will appear here.'}
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
              style={{ width: '100%' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{saving ? 'Publishing...' : 'Save & Publish Announcement'}</span>
            </button>

            {savedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '12.5px', color: '#15803d' }}>
                <CheckCircle2 size={15} /> Storefront announcement updated successfully!
              </div>
            )}
          </form>
        </div>

        {/* Hero Banner Showcase Info */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Sparkles size={18} color="#0b3d2e" /> Hero Collection Presentation
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#4b5d54', lineHeight: 1.6 }}>
            The customer landing page hero dynamically features the <strong>&quot;Royal Organic&quot;</strong> heritage harvest collection with natural leaf physics and product highlights.
          </p>

          <div style={{ background: '#faf8f5', padding: '16px', borderRadius: '10px', border: '1px solid #e6e1d6', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0b3d2e' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Main Headline:</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Pure Traditional Wood Cold-Pressed Oils</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c59b27' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Theme Motif:</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Heritage Pollachi & Tamil Nadu Organic Farms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#15803d' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>CTA Button:</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>&quot;Explore Our Harvest&quot; ➔ /products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
