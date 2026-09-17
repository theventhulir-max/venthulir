import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { restoreStock } from '@/lib/inventory';
import { invalidateStatsCache } from '@/lib/cache';
import { sendEmail } from '@/lib/email';
import { generateOrderStatusEmail } from '@/lib/emailTemplates';

export async function GET(request, { params }) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderId: id }).lean();
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Allow user if admin or matching customer email
    if (!auth.user.isAdmin && order.customerEmail?.toLowerCase() !== auth.user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Order get error:', err);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    let { status, action, trackingNumber, courierPartner } = body;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer cancellation
    if (action === 'cancel' || (!auth.user.isAdmin && status === 'Cancelled')) {
      const user = await User.findById(auth.user.id);
      if (!user || (order.customerEmail && order.customerEmail.toLowerCase() !== user.email?.toLowerCase())) {
        return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 });
      }

      if (order.status !== 'Pending' && order.status !== 'Processing' && order.status !== 'Confirmed') {
        return NextResponse.json({ error: 'Order is already being shipped or completed.' }, { status: 400 });
      }

      order.status = 'Cancelled';
      order.statusUpdatedAt = new Date();
      if (order.items && order.items.length > 0) {
        await restoreStock(order.items);
      }
      await order.save();
      invalidateStatsCache();

      // Dispatch Cancellation Email
      if (order.customerEmail) {
        const orderRef = (order.orderId || order._id).toString().slice(-8).toUpperCase();
        const emailHtml = generateOrderStatusEmail({
          order,
          newStatus: 'Cancelled',
          customerName: order.customerName || 'Valued Customer'
        });
        sendEmail({
          to: order.customerEmail,
          subject: `🌿 Order #${orderRef} Cancellation Notice - Venthulir Organic Harvest`,
          html: emailHtml,
          text: `Dear ${order.customerName || 'Customer'},\n\nYour order #${orderRef} has been cancelled.\n\nThank you,\nVenthulir Organic Harvest`
        }).catch(err => console.error('Cancellation email error:', err));
      }

      return NextResponse.json({ msg: 'Order cancelled successfully', order });
    }

    // Admin status update
    if (!auth.user.isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const prevStatus = order.status;
    const shouldRestoreStock = (status === 'Cancelled' || status === 'Returned') &&
      prevStatus !== 'Cancelled' && prevStatus !== 'Returned';

    if (shouldRestoreStock && order.items && order.items.length > 0) {
      await restoreStock(order.items);
    }

    order.status = status;
    order.statusUpdatedAt = new Date();
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber || null;
    if (courierPartner !== undefined) order.courierPartner = courierPartner || null;

    await order.save();
    invalidateStatsCache();

    // Trigger Automatic Transactional Status Email (Professional English)
    if (order.customerEmail && prevStatus !== status) {
      const orderRef = (order.orderId || order._id).toString().slice(-8).toUpperCase();
      const emailHtml = generateOrderStatusEmail({
        order,
        newStatus: status,
        trackingNumber: order.trackingNumber,
        courierPartner: order.courierPartner,
        customerName: order.customerName || 'Valued Customer'
      });

      sendEmail({
        to: order.customerEmail,
        subject: `🌿 Order #${orderRef} Status Update: ${status} - Venthulir Organic Harvest`,
        html: emailHtml,
        text: `Dear ${order.customerName || 'Valued Customer'},\n\nYour Venthulir Organic order #${orderRef} status is now: ${status}.\n\nTotal Amount: ₹${order.totalAmount}\nDelivery Address: ${order.deliveryAddress?.address || ''}\n\nThank you for choosing certified organic harvest.\n\nVenthulir Organic Harvest`
      }).catch(err => console.error('Status update email error:', err));
    }

    return NextResponse.json({ msg: 'Order status updated and notification sent', order });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
