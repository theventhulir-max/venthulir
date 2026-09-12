import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    await connectDB();
    const { code, productId, customerEmail } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ couponCode: code.toUpperCase() });

    if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    if (coupon.status !== 'Active') return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 });
    if (new Date(coupon.expiryDate) < new Date()) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    if (coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: 'Coupon limit reached' }, { status: 400 });

    if (customerEmail) {
      const hasUsed = await Order.findOne({ customerEmail, couponUsed: coupon.couponCode });
      if (hasUsed) return NextResponse.json({ error: 'You have already used this coupon code' }, { status: 400 });
    }

    if (coupon.productId && String(coupon.productId) !== String(productId)) {
      return NextResponse.json({ error: 'Coupon is not valid for this product' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountType: 'percent',
      discountValue: coupon.discountPercentage,
      discountPercentage: coupon.discountPercentage,
      couponCode: coupon.couponCode
    });
  } catch (err) {
    console.error('API Validate Coupon Error:', err);
    return NextResponse.json({ error: 'Server Error validating coupon' }, { status: 500 });
  }
}
