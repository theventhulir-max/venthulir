import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { reduceStock } from '@/lib/inventory';
import { sendEmail } from '@/lib/email';
import { generateOrderEmail } from '@/lib/emailTemplates';
import { requireAuth, requireAdmin } from '@/lib/auth';
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
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: 'Please sign in or register to place your order.' }, { status: 401 });
    }

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

    let finalCustomerEmail = (customerEmail || '').trim();
    if (!finalCustomerEmail) {
      const cleanPhone = (phone || '').replace(/\D/g, '');
      finalCustomerEmail = cleanPhone ? `${cleanPhone}@guest.venthulir.com` : 'guest@venthulir.com';
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Customer name is required.' }, { status: 400 });
    }

    // Process coupon if present
    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
      if (!coupon) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
      if (new Date(coupon.expiryDate) < new Date() || coupon.usedCount >= coupon.maxUses || coupon.status !== 'Active') {
        return NextResponse.json({ error: 'Coupon is no longer valid' }, { status: 400 });
      }

      if (finalCustomerEmail && !finalCustomerEmail.endsWith('@guest.venthulir.com')) {
        const hasUsed = await Order.findOne({ customerEmail: finalCustomerEmail, couponUsed: coupon.couponCode });
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
      customerName: customerName.trim(),
      customerEmail: finalCustomerEmail,
      phone: (phone || '').trim(),
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

    // Send confirmation email safely if a real customer email was provided
    const isGuestPlaceholder = finalCustomerEmail.endsWith('@guest.venthulir.com') || finalCustomerEmail === 'guest@venthulir.com';
    if (finalCustomerEmail && !isGuestPlaceholder) {
      const orderRef = newOrder._id.toString().slice(-8).toUpperCase();
      const emailHtml = generateOrderEmail({
        order: newOrder,
        customerName: customerName || 'Valued Patron',
        items: enrichedItems,
        totalAmount: verifiedTotalAmount,
        shippingCharge: verifiedShippingCharge,
        discountAmount: verifiedDiscount,
        couponUsed: (couponCode && typeof couponCode === 'string') ? couponCode.toUpperCase() : null,
        deliveryAddress,
        paymentMethod
      });

      sendEmail({
        to: finalCustomerEmail,
        subject: `🌿 Order Confirmed #${orderRef} - Venthulir Organic Harvest`,
        html: emailHtml,
        text: `Thank you for your order, ${customerName}!\n\nOrder Ref: #${orderRef}\nTotal Amount: ₹${verifiedTotalAmount}\nPayment Method: ${paymentMethod}\nDelivery to: ${deliveryAddress?.address || ''}, ${deliveryAddress?.city || ''}\n\nWe are preparing your fresh farm harvest batch!`
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
