import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { reduceStock } from '@/lib/inventory';
import { sendEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';
import { invalidateProductCache, invalidateStatsCache } from '@/lib/cache';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (err) {
    console.error('API Get Orders Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const {
      customerName,
      customerEmail,
      items,
      totalAmount,
      couponCode,
      phone,
      deliveryAddress,
      originalAmount,
      shippingCharge,
      discountAmount,
      paymentMethod = 'Cash on Delivery',
      razorpayOrderId,
      razorpayPaymentId
    } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Customer name and email are required.' }, { status: 400 });
    }

    // Process coupon if present
    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
      if (!coupon) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
      if (new Date(coupon.expiryDate) < new Date() || coupon.usedCount >= coupon.maxUses || coupon.status !== 'Active') {
        return NextResponse.json({ error: 'Coupon is no longer valid' }, { status: 400 });
      }

      if (customerEmail) {
        const hasUsed = await Order.findOne({ customerEmail, couponUsed: coupon.couponCode });
        if (hasUsed) return NextResponse.json({ error: 'You have already used this coupon code' }, { status: 400 });
      }

      coupon.usedCount += 1;
      await coupon.save();
    }

    // Atomic Stock Reduction
    const stockResult = await reduceStock(items);
    if (!stockResult.success) {
      return NextResponse.json({ error: stockResult.error }, { status: 400 });
    }

    // Enrich items and verify prices against database
    let computedOriginalTotal = 0;
    const enrichedItems = await Promise.all(items.map(async (item) => {
      try {
        const prod = await Product.findById(item.product || item._id || item.productId);
        let verifiedPrice = item.price;
        if (prod) {
          if (item.variant && prod.variants && prod.variants.length > 0) {
            const v = prod.variants.find(varObj => varObj.label === item.variant.label);
            if (v && v.price) verifiedPrice = v.price;
          } else if (prod.price) {
            verifiedPrice = prod.price;
          }
        }
        const itemQty = Math.max(1, item.quantity || 1);
        computedOriginalTotal += verifiedPrice * itemQty;

        return {
          ...item,
          price: verifiedPrice,
          hsnSac: prod ? (prod.hsnSac || "") : (item.hsnSac || "")
        };
      } catch {
        computedOriginalTotal += (item.price || 0) * (item.quantity || 1);
        return item;
      }
    }));

    const verifiedShippingCharge = computedOriginalTotal >= 499 ? 0 : (shippingCharge || 60);
    const verifiedDiscount = Math.min(discountAmount || 0, computedOriginalTotal);
    const verifiedTotalAmount = Math.max(0, computedOriginalTotal + verifiedShippingCharge - verifiedDiscount);

    const newOrder = new Order({
      customerName,
      customerEmail,
      phone,
      deliveryAddress,
      items: enrichedItems,
      originalAmount: computedOriginalTotal,
      shippingCharge: verifiedShippingCharge,
      discountAmount: verifiedDiscount,
      couponUsed: (couponCode && typeof couponCode === 'string') ? couponCode.toUpperCase() : null,
      totalAmount: verifiedTotalAmount,
      paymentMethod,
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      status: 'Pending',
      statusUpdatedAt: new Date(),
    });

    await newOrder.save();

    // Invalidate product and stats cache upon new order
    invalidateProductCache();
    invalidateStatsCache();

    // Send confirmation email safely
    if (customerEmail) {
      sendEmail({
        to: customerEmail,
        subject: `🌿 Order Confirmation #${newOrder._id.toString().slice(-6).toUpperCase()} - Venthulir Organic`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0b3d2e; padding: 25px; text-align: center; color: #fff;">
              <h1 style="color: #d4af37; margin: 0; letter-spacing: 2px;">VENTHULIR</h1>
              <p style="color: #a7f3d0; margin: 5px 0 0; font-size: 13px;">Organic Harvest</p>
            </div>
            <div style="padding: 25px;">
              <h2 style="color: #0b3d2e; margin-top: 0;">Thank You for Your Order, ${customerName}! 🌿</h2>
              <p style="color: #4a5568;">Your order has been received and is being prepared with utmost care.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${newOrder._id}</p>
                <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> ₹${verifiedTotalAmount}</p>
                <p style="margin: 0 0 8px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p style="margin: 0;"><strong>Delivery Address:</strong> ${deliveryAddress?.address || ''}, ${deliveryAddress?.city || ''} ${deliveryAddress?.zipCode || ''}</p>
              </div>
            </div>
            <div style="background: #0b3d2e; padding: 15px; text-align: center; color: #a7f3d0; font-size: 12px;">
              <p style="margin: 0;">Venthulir Organic | Pure & Authentic</p>
            </div>
          </div>
        `
      }).catch(e => console.error('Order email error:', e));
    }

    return NextResponse.json({
      msg: 'Order placed successfully',
      order: newOrder,
    }, { status: 201 });
  } catch (err) {
    console.error('API Place Order Error:', err);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
