import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: 'guest@venthulir.com' },
  phone: { type: String, required: true },
  deliveryAddress: { type: Object, required: true },
  items: { type: Array, default: [] },
  originalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  couponUsed: { type: String, default: null },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  status: { type: String, default: 'Pending' },
  statusUpdatedAt: { type: Date },
  trackingNumber: { type: String, default: null },
  courierPartner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema, 'OrderRegistry');
export default Order;
