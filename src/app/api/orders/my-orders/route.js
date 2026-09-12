import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    let email = auth.user.email;
    if (!email && auth.user.id) {
      const dbUser = await User.findById(auth.user.id);
      email = dbUser?.email;
    }

    if (!email) {
      return NextResponse.json([]);
    }

    const orders = await Order.find({
      customerEmail: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(orders);
  } catch (err) {
    console.error('My Orders fetch error:', err);
    return NextResponse.json({ error: 'Server Error fetching your orders' }, { status: 500 });
  }
}
