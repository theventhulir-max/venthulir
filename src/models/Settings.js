import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  storeName: { type: String, default: 'Venthulir Organic' },
  tagline: { type: String, default: '100% Pure Organic Oils & Heritage Harvest' },
  supportEmail: { type: String, default: 'theoptime.io@gmail.com' },
  supportPhone: { type: String, default: '+91 98765 43210' },
  address: { type: String, default: '14/2, Heritage Farm Road, Pollachi, Coimbatore, Tamil Nadu - 642001' },
  adminNotificationEmail: { type: String, default: 'theoptime.io@gmail.com' },
  defaultShippingFee: { type: Number, default: 40 },
  freeShippingThreshold: { type: Number, default: 499 },
  enableCOD: { type: Boolean, default: true },
  enableOnlinePayment: { type: Boolean, default: true },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/venthulir_organic' },
    facebook: { type: String, default: 'https://facebook.com/venthulir' },
    whatsapp: { type: String, default: 'https://wa.me/919876543210' }
  },
  announcementText: { type: String, default: '🌿 Pure Heritage Harvest Direct From Tamil Nadu Farms — Express Delivery Across India!' },
  announcementActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
