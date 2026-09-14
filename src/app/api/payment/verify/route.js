import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { reduceStock } from '@/lib/inventory';
import { sendEmail } from '@/lib/email';
import { generatePaymentSuccessEmail } from '@/lib/emailTemplates';

export async function POST(request) {
  try {
    await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      phone,
      deliveryAddress,
      items,
      originalAmount,
      shippingCharge,
      discountAmount,
      totalAmount,
      couponCode,
    } = await request.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
      if (coupon && coupon.status === 'Active' && new Date(coupon.expiryDate) >= new Date() && coupon.usedCount < coupon.maxUses) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const stockResult = await reduceStock(items);
    if (!stockResult.success) {
      return NextResponse.json({ error: stockResult.error }, { status: 400 });
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      try {
        const prod = await Product.findById(item.product || item._id);
        return {
          ...item,
          hsnSac: prod ? (prod.hsnSac || "") : (item.hsnSac || "")
        };
      } catch (e) {
        return item;
      }
    }));

    const newOrder = new Order({
      customerName,
      customerEmail,
      phone,
      deliveryAddress,
      items: enrichedItems,
      originalAmount: originalAmount || totalAmount,
      shippingCharge: shippingCharge || 0,
      discountAmount: discountAmount || 0,
      couponUsed: (couponCode && typeof couponCode === 'string') ? couponCode.toUpperCase() : null,
      totalAmount,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'Processing',
      statusUpdatedAt: new Date(),
    });

    await newOrder.save();

    if (customerEmail) {
      const orderRef = newOrder._id.toString().slice(-8).toUpperCase();
      const emailHtml = generatePaymentSuccessEmail({
        order: newOrder,
        customerName: customerName || 'Valued Patron',
        paymentId: razorpay_payment_id,
        totalAmount
      });

      sendEmail({
        to: customerEmail,
        subject: `🌿 Payment Received & Order Confirmed #${orderRef} - Venthulir Organic`,
        html: emailHtml,
        text: `Hello ${customerName},\n\nYour payment of ₹${totalAmount} via Razorpay was successful (Transaction ID: ${razorpay_payment_id}).\nOrder Ref: #${orderRef}\n\nYour fresh farm order is now being packed!`
      }).catch(e => console.error('Payment email error:', e));
    }

    return NextResponse.json({
      msg: 'Payment verified and order created',
      order: newOrder,
    }, { status: 201 });
  } catch (err) {
    console.error('Payment verify API error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
