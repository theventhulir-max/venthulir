import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    if (auth.user.isAdmin) {
      const messages = await Message.find().sort({ createdAt: -1 });
      return NextResponse.json(messages);
    }

    const user = await User.findById(auth.user.id);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    const messages = await Message.find({ customerEmail: user.email }).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (err) {
    console.error('API Messages Error:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const customerName = body.customerName || body.name;
    const customerEmail = body.customerEmail || body.email;
    const message = body.message;

    if (!customerName || !customerEmail || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const msg = new Message({ customerName, customerEmail, message });
    await msg.save();

    return NextResponse.json({ msg: 'Success' }, { status: 201 });
  } catch (err) {
    console.error('API Submit Message Error:', err);
    return NextResponse.json({ error: 'Submit Error' }, { status: 500 });
  }
}
